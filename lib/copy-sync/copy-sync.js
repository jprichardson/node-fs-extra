'use strict'

const fs = require('graceful-fs')
const path = require('path')
const mkdirpSync = require('../mkdirs').mkdirsSync
const utimesSync = require('../util/utimes.js').utimesMillisSync

const notExist = Symbol('notExist')
const existsReg = Symbol('existsReg')

function copySync (src, dest, opts) {
  if (typeof opts === 'function') {
    opts = {filter: opts}
  }

  opts = opts || {}
  opts.clobber = 'clobber' in opts ? !!opts.clobber : true // default to true for now
  opts.overwrite = 'overwrite' in opts ? !!opts.overwrite : opts.clobber // overwrite falls back to clobber

  // Warn about using preserveTimestamps on 32-bit node
  if (opts.preserveTimestamps && process.arch === 'ia32') {
    console.warn(`fs-extra: Using the preserveTimestamps option in 32-bit node is not recommended;\n
    see https://github.com/jprichardson/node-fs-extra/issues/269`)
  }

  const resolvedDest = checkPaths(src, dest)

  if (opts.filter && !opts.filter(src, dest)) return

  const destParent = path.dirname(dest)
  if (!fs.existsSync(destParent)) mkdirpSync(destParent)
  return startCopy(resolvedDest, src, dest, opts)
}

function startCopy (resolvedDest, src, dest, opts) {
  if (opts.filter && !opts.filter(src, dest)) return
  return getStats(resolvedDest, src, dest, opts)
}

function getStats (resolvedDest, src, dest, opts) {
  const statSync = opts.dereference ? fs.statSync : fs.lstatSync
  const st = statSync(src)

  if (st.isDirectory()) return onDir(st, resolvedDest, src, dest, opts)
  else if (st.isFile() ||
           st.isCharacterDevice() ||
           st.isBlockDevice()) return onFile(st, resolvedDest, src, dest, opts)
  else if (st.isSymbolicLink()) return onLink(resolvedDest, src, dest, opts)
}

function onFile (srcStat, resolvedDest, src, dest, opts) {
  if (resolvedDest === notExist) return copyFile(srcStat, src, dest, opts)
  else if (resolvedDest === existsReg) return mayCopyFile(srcStat, src, dest, opts)
  return mayCopyFile(srcStat, src, dest, opts)
}

function mayCopyFile (srcStat, src, dest, opts) {
  if (opts.overwrite) {
    fs.unlinkSync(dest)
    return copyFile(srcStat, src, dest, opts)
  } else if (opts.errorOnExist) {
    throw new Error(`'${dest}' already exists`)
  }
}

function copyFile (srcStat, src, dest, opts) {
  if (typeof fs.copyFileSync === 'function') {
    fs.copyFileSync(src, dest)
    fs.chmodSync(dest, srcStat.mode)
    if (opts.preserveTimestamps) {
      return utimesSync(dest, srcStat.atime, srcStat.mtime)
    }
    return
  }
  return copyFileFallback(srcStat, src, dest, opts)
}

function copyFileFallback (srcStat, src, dest, opts) {
  const BUF_LENGTH = 64 * 1024
  const _buff = require('../util/buffer')(BUF_LENGTH)

  const fdr = fs.openSync(src, 'r')
  const fdw = fs.openSync(dest, 'w', srcStat.mode)
  let pos = 0

  while (pos < srcStat.size) {
    const bytesRead = fs.readSync(fdr, _buff, 0, BUF_LENGTH, pos)
    fs.writeSync(fdw, _buff, 0, bytesRead)
    pos += bytesRead
  }

  if (opts.preserveTimestamps) fs.futimesSync(fdw, srcStat.atime, srcStat.mtime)

  fs.closeSync(fdr)
  fs.closeSync(fdw)
}

function onDir (srcStat, resolvedDest, src, dest, opts) {
  if (resolvedDest === notExist) {
    if (isSrcSubdir(src, dest)) {
      throw new Error(`Cannot copy '${src}' to a subdirectory of itself, '${dest}'.`)
    }
    return mkDirAndCopy(srcStat, src, dest, opts)
  } else if (resolvedDest === existsReg) {
    if (isSrcSubdir(src, dest)) {
      throw new Error(`Cannot copy '${src}' to a subdirectory of itself, '${dest}'.`)
    }
    return mayCopyDir(src, dest, opts)
  }
  return copyDir(src, dest, opts)
}

function mayCopyDir (src, dest, opts) {
  if (!fs.statSync(dest).isDirectory()) {
    throw new Error(`Cannot overwrite non-directory '${dest}' with directory '${src}'.`)
  }
  return copyDir(src, dest, opts)
}

function mkDirAndCopy (srcStat, src, dest, opts) {
  fs.mkdirSync(dest, srcStat.mode)
  fs.chmodSync(dest, srcStat.mode)
  return copyDir(src, dest, opts)
}

function copyDir (src, dest, opts) {
  fs.readdirSync(src).forEach(item => copyDirItem(item, src, dest, opts))
}

function copyDirItem (item, src, dest, opts) {
  const srcItem = path.join(src, item)
  const destItem = path.join(dest, item)
  const resolvedDest = checkPaths(srcItem, destItem)
  return startCopy(resolvedDest, srcItem, destItem, opts)
}

function onLink (resolvedDest, src, dest, opts) {
  let resolvedSrc = fs.readlinkSync(src)

  if (opts.dereference) {
    resolvedSrc = path.resolve(process.cwd(), resolvedSrc)
  }

  if (resolvedDest === notExist || resolvedDest === existsReg) {
    // if dest already exists, fs throws error anyway,
    // so no need to guard against it here.
    return fs.symlinkSync(resolvedSrc, dest)
  } else {
    if (opts.dereference) {
      resolvedDest = path.resolve(process.cwd(), resolvedDest)
    }
    if (pathsAreIdentical(resolvedSrc, resolvedDest)) return

    // prevent copy if src is a subdir of dest since unlinking
    // dest in this case would result in removing src contents
    // and therefore a broken symlink would be created.
    if (fs.statSync(dest).isDirectory() && isSrcSubdir(resolvedDest, resolvedSrc)) {
      throw new Error(`Cannot overwrite '${resolvedDest}' with '${resolvedSrc}'.`)
    }
    return copyLink(resolvedSrc, dest)
  }
}

function copyLink (resolvedSrc, dest) {
  fs.unlinkSync(dest)
  return fs.symlinkSync(resolvedSrc, dest)
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
function checkDest (dest) {
  let resolvedPath
  try {
    resolvedPath = fs.readlinkSync(dest)
  } catch (err) {
    if (err.code === 'ENOENT') return notExist

    // dest exists and is a regular file or directory, Windows may throw UNKNOWN error.
    if (err.code === 'EINVAL' || err.code === 'UNKNOWN') return existsReg

    throw err
  }
  return resolvedPath // dest exists and is a symlink
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

function checkPaths (src, dest) {
  const resolvedDest = checkDest(dest)
  if (resolvedDest === notExist || resolvedDest === existsReg) {
    if (pathsAreIdentical(src, dest)) throw new Error('Source and destination must not be the same.')
    return resolvedDest
  } else {
    // check resolved dest path if dest is a symlink
    if (pathsAreIdentical(src, resolvedDest)) throw new Error('Source and destination must not be the same.')
    return resolvedDest
  }
}

module.exports = copySync
