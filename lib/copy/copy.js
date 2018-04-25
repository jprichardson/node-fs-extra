'use strict'

const fs = require('graceful-fs')
const path = require('path')
const mkdirp = require('../mkdirs').mkdirs
const pathExists = require('../path-exists').pathExists
const utimes = require('../util/utimes').utimesMillis

const notExist = Symbol('notExist')
const existsReg = Symbol('existsReg')

function copy (src, dest, opts, cb) {
  if (typeof opts === 'function' && !cb) {
    cb = opts
    opts = {}
  } else if (typeof opts === 'function') {
    opts = {filter: opts}
  }

  cb = cb || function () {}
  opts = opts || {}

  opts.clobber = 'clobber' in opts ? !!opts.clobber : true // default to true for now
  opts.overwrite = 'overwrite' in opts ? !!opts.overwrite : opts.clobber // overwrite falls back to clobber

  // Warn about using preserveTimestamps on 32-bit node
  if (opts.preserveTimestamps && process.arch === 'ia32') {
    console.warn(`fs-extra: Using the preserveTimestamps option in 32-bit node is not recommended;\n
    see https://github.com/jprichardson/node-fs-extra/issues/269`)
  }

  checkPaths(src, dest, (err, resolvedDest) => {
    if (err) return cb(err)
    if (opts.filter) return handleFilter(checkParentDir, resolvedDest, src, dest, opts, cb)
    return checkParentDir(resolvedDest, src, dest, opts, cb)
  })
}

function checkParentDir (resolvedDest, src, dest, opts, cb) {
  const destParent = path.dirname(dest)
  pathExists(destParent, (err, dirExists) => {
    if (err) return cb(err)
    if (dirExists) return startCopy(resolvedDest, src, dest, opts, cb)
    mkdirp(destParent, err => {
      if (err) return cb(err)
      return startCopy(resolvedDest, src, dest, opts, cb)
    })
  })
}

function startCopy (resolvedDest, src, dest, opts, cb) {
  if (opts.filter) return handleFilter(getStats, resolvedDest, src, dest, opts, cb)
  return getStats(resolvedDest, src, dest, opts, cb)
}

function handleFilter (onInclude, resolvedDest, src, dest, opts, cb) {
  Promise.resolve(opts.filter(src, dest)).then(include => {
    if (include) {
      if (resolvedDest) return onInclude(resolvedDest, src, dest, opts, cb)
      return onInclude(src, dest, opts, cb)
    }
    return cb()
  }, error => cb(error))
}

function getStats (resolvedDest, src, dest, opts, cb) {
  const stat = opts.dereference ? fs.stat : fs.lstat
  stat(src, (err, st) => {
    if (err) return cb(err)

    if (st.isDirectory()) return onDir(st, resolvedDest, src, dest, opts, cb)
    else if (st.isFile() ||
             st.isCharacterDevice() ||
             st.isBlockDevice()) return onFile(st, resolvedDest, src, dest, opts, cb)
    else if (st.isSymbolicLink()) return onLink(resolvedDest, src, dest, opts, cb)
  })
}

function onFile (srcStat, resolvedDest, src, dest, opts, cb) {
  if (resolvedDest === notExist) return copyFile(srcStat, src, dest, opts, cb)
  else if (resolvedDest === existsReg) return mayCopyFile(srcStat, src, dest, opts, cb)
  return mayCopyFile(srcStat, src, dest, opts, cb)
}

function mayCopyFile (srcStat, src, dest, opts, cb) {
  if (opts.overwrite) {
    fs.unlink(dest, err => {
      if (err) return cb(err)
      return copyFile(srcStat, src, dest, opts, cb)
    })
  } else if (opts.errorOnExist) {
    return cb(new Error(`'${dest}' already exists`))
  } else return cb()
}

function copyFile (srcStat, src, dest, opts, cb) {
  if (typeof fs.copyFile === 'function') {
    return fs.copyFile(src, dest, err => {
      if (err) return cb(err)
      return setDestModeAndTimestamps(srcStat, dest, opts, cb)
    })
  }
  return copyFileFallback(srcStat, src, dest, opts, cb)
}

function copyFileFallback (srcStat, src, dest, opts, cb) {
  const rs = fs.createReadStream(src)
  rs.on('error', err => cb(err)).once('open', () => {
    const ws = fs.createWriteStream(dest, { mode: srcStat.mode })
    ws.on('error', err => cb(err))
      .on('open', () => rs.pipe(ws))
      .once('close', () => setDestModeAndTimestamps(srcStat, dest, opts, cb))
  })
}

function setDestModeAndTimestamps (srcStat, dest, opts, cb) {
  fs.chmod(dest, srcStat.mode, err => {
    if (err) return cb(err)
    if (opts.preserveTimestamps) {
      return utimes(dest, srcStat.atime, srcStat.mtime, cb)
    }
    return cb()
  })
}

function onDir (srcStat, resolvedDest, src, dest, opts, cb) {
  if (resolvedDest === notExist) {
    if (isSrcSubdir(src, dest)) {
      return cb(new Error(`Cannot copy '${src}' to a subdirectory of itself, '${dest}'.`))
    }
    return mkDirAndCopy(srcStat, src, dest, opts, cb)
  } else if (resolvedDest === existsReg) {
    if (isSrcSubdir(src, dest)) {
      return cb(new Error(`Cannot copy '${src}' to a subdirectory of itself, '${dest}'.`))
    }
    return mayCopyDir(src, dest, opts, cb)
  }
  return copyDir(src, dest, opts, cb)
}

function mayCopyDir (src, dest, opts, cb) {
  fs.stat(dest, (err, st) => {
    if (err) return cb(err)
    if (!st.isDirectory()) {
      return cb(new Error(`Cannot overwrite non-directory '${dest}' with directory '${src}'.`))
    }
    return copyDir(src, dest, opts, cb)
  })
}

function mkDirAndCopy (srcStat, src, dest, opts, cb) {
  fs.mkdir(dest, srcStat.mode, err => {
    if (err) return cb(err)
    fs.chmod(dest, srcStat.mode, err => {
      if (err) return cb(err)
      return copyDir(src, dest, opts, cb)
    })
  })
}

function copyDir (src, dest, opts, cb) {
  fs.readdir(src, (err, items) => {
    if (err) return cb(err)
    return copyDirItems(items, src, dest, opts, cb)
  })
}

function copyDirItems (items, src, dest, opts, cb) {
  const item = items.pop()
  if (!item) return cb()
  return copyDirItem(items, item, src, dest, opts, cb)
}

function copyDirItem (items, item, src, dest, opts, cb) {
  const srcItem = path.join(src, item)
  const destItem = path.join(dest, item)
  checkPaths(srcItem, destItem, (err, resolvedDest) => {
    if (err) return cb(err)
    startCopy(resolvedDest, srcItem, destItem, opts, err => {
      if (err) return cb(err)
      return copyDirItems(items, src, dest, opts, cb)
    })
  })
}

function onLink (resolvedDest, src, dest, opts, cb) {
  fs.readlink(src, (err, resolvedSrc) => {
    if (err) return cb(err)

    if (opts.dereference) {
      resolvedSrc = path.resolve(process.cwd(), resolvedSrc)
    }

    if (resolvedDest === notExist || resolvedDest === existsReg) {
      // if dest already exists, fs throws error anyway,
      // so no need to guard against it here.
      return fs.symlink(resolvedSrc, dest, cb)
    } else {
      if (opts.dereference) {
        resolvedDest = path.resolve(process.cwd(), resolvedDest)
      }
      if (pathsAreIdentical(resolvedSrc, resolvedDest)) return cb()

      // prevent copy if src is a subdir of dest since unlinking
      // dest in this case would result in removing src contents
      // and therefore a broken symlink would be created.
      fs.stat(dest, (err, st) => {
        if (err) return cb(err)
        if (st.isDirectory() && isSrcSubdir(resolvedDest, resolvedSrc)) {
          return cb(new Error(`Cannot overwrite '${resolvedDest}' with '${resolvedSrc}'.`))
        }
        return copyLink(resolvedSrc, dest, cb)
      })
    }
  })
}

function copyLink (resolvedSrc, dest, cb) {
  fs.unlink(dest, err => {
    if (err) return cb(err)
    return fs.symlink(resolvedSrc, dest, cb)
  })
}

// return true if dest is a subdir of src, otherwise false.
// extract dest base dir and check if that is the same as src basename.
function isSrcSubdir (src, dest) {
  const srcArray = path.resolve(src).split(path.sep)
  const destArray = path.resolve(dest).split(path.sep)

  return srcArray.reduce((acc, current, i) => {
    return acc && destArray[i] === current
  }, true)
}

// check if dest exists and is a symlink.
function checkDest (dest, cb) {
  fs.readlink(dest, (err, resolvedPath) => {
    if (err) {
      if (err.code === 'ENOENT') return cb(null, notExist)

      // dest exists and is a regular file or directory, Windows may throw UNKNOWN error.
      if (err.code === 'EINVAL' || err.code === 'UNKNOWN') return cb(null, existsReg)

      return cb(err)
    }
    return cb(null, resolvedPath) // dest exists and is a symlink
  })
}

function pathsAreIdentical (src, dest) {
  const os = process.platform
  const resolvedSrc = path.resolve(src)
  const resolvedDest = path.resolve(dest)
  // case-insensitive paths
  if (os === 'darwin' || os === 'win32') {
    return resolvedSrc.toLowerCase() === resolvedDest.toLowerCase()
  }
  return resolvedSrc === resolvedDest
}

function checkPaths (src, dest, cb) {
  checkDest(dest, (err, resolvedDest) => {
    if (err) return cb(err)
    if (resolvedDest === notExist || resolvedDest === existsReg) {
      if (pathsAreIdentical(src, dest)) return cb(new Error('Source and destination must not be the same.'))
      return cb(null, resolvedDest)
    } else {
      // check resolved dest path if dest is a symlink
      if (pathsAreIdentical(src, resolvedDest)) return cb(new Error('Source and destination must not be the same.'))
      return cb(null, resolvedDest)
    }
  })
}

module.exports = copy
