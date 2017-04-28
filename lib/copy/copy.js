'use strict'

const fs = require('graceful-fs')
const path = require('path')
const mkdirs = require('../mkdirs').mkdirs
const remove = require('../remove').remove
const utimes = require('../util/utimes').utimesMillis

const DEST_NOENT = Symbol('DEST_NOENT')
const DEST_EXISTS = Symbol('DEST_EXISTS')

function copy (src, dest, options, cb) {
  if (typeof options === 'function' && !cb) {
    cb = options
    options = {}
  } else if (typeof options === 'function' || options instanceof RegExp) {
    options = {filter: options}
  }

  cb = cb || function () {}
  options = options || {}

  // default to true for now
  options.clobber = 'clobber' in options ? !!options.clobber : true
  // overwrite falls back to clobber
  options.overwrite = 'overwrite' in options ? !!options.overwrite : options.clobber
  options.dereference = 'dereference' in options ? !!options.dereference : false
  options.preserveTimestamps = 'preserveTimestamps' in options ? !!options.preserveTimestamps : false

  options.filter = options.filter || function () { return true }

  // Warn about using preserveTimestamps on 32-bit node
  if (options.preserveTimestamps && process.arch === 'ia32') {
    console.warn(`fs-extra: Using the preserveTimestamps option in 32-bit node is not recommended;\n
    see https://github.com/jprichardson/node-fs-extra/issues/269`)
  }

  // don't allow src and dest to be the same
  const basePath = process.cwd()
  src = path.resolve(basePath, src)
  dest = path.resolve(basePath, dest)

  if (src === dest) return cb(new Error('Source and destination must not be the same.'))

  if (options.filter) {
    if (options.filter instanceof RegExp) {
      console.warn('Warning: fs-extra: Passing a RegExp filter is deprecated, use a function')
      if (!options.filter.test(src)) return cb()
    } else if (typeof options.filter === 'function') {
      if (!options.filter(src, dest)) return cb()
    }
  }

  const destParent = path.dirname(dest)
  mkdirs(destParent, err => {
    if (err) return cb(err)

    let stat = options.dereference ? fs.stat : fs.lstat
    stat(src, (err, srcStat) => {
      if (err) return cb(err)

      if (srcStat.isDirectory()) {
        return onDir(srcStat)
      } else if (srcStat.isFile() || srcStat.isCharacterDevice() || srcStat.isBlockDevice()) {
        return onFile(srcStat)
      } else if (srcStat.isSymbolicLink()) {
        return onLink()
      }
    })
  })

  function onFile (srcStat) {
    checkDest(dest, (err, res) => {
      if (err) return cb(err)
      if (res === DEST_NOENT) {
        return cpFile()
      } else if (res === DEST_EXISTS) {
        maybeCopy()
      } else { // dest is a link
        if (src === res) return cb()
        maybeCopy()
      }
    })

    function maybeCopy () {
      if (options.overwrite) {
        fs.unlink(dest, err => {
          if (err) return cb(err)
          return cpFile()
        })
      } else if (options.errorOnExist) {
        return cb(new Error(`'${dest}' already exists`))
      } else return cb()
    }

    function cpFile () {
      const rs = fs.createReadStream(src)
      const ws = fs.createWriteStream(dest, { mode: srcStat.mode })

      rs.on('error', err => cb(err))
      ws.on('error', err => cb(err))

      ws.on('open', () => {
        rs.pipe(ws)
      }).once('close', () => {
        fs.chmod(dest, srcStat.mode, err => {
          if (err) return cb(err)
          if (options.preserveTimestamps) {
            return utimes(dest, srcStat.atime, srcStat.mtime, cb)
          }
          return cb()
        })
      })
    }
  }

  function onDir (srcStat) {
    checkDest(dest, (err, res) => {
      if (err) return cb(err)
      if (res === DEST_NOENT) {
        // if dest is a subdir of src, prevent copying into itself
        if (isSrcKid(src, dest)) return cb(new Error(`Cannot copy directory '${src}' into itself '${dest}'`))
        fs.mkdir(dest, srcStat.mode, err => {
          if (err) return cb(err)
          fs.chmod(dest, srcStat.mode, err => {
            if (err) return cb(err)
            return cpDir()
          })
        })
      } else if (res === DEST_EXISTS) {
        if (isSrcKid(src, dest)) return cb(new Error(`Cannot copy directory '${src}' into itself '${dest}'`))
        return cpDir()
      } else { // dest exists and is a link
        if (src === res) return cb()
        if (isSrcKid(src, res)) return cb(new Error(`Cannot copy directory '${src}' into itself '${res}'`))
        return cpDir()
      }
    })

    function cpDir () {
      fs.readdir(src, (err, items) => {
        if (err) return cb(err)
        Promise.all(items.map(item => {
          return new Promise((resolve, reject) => {
            copy(path.join(src, item), path.join(dest, item), options, err => {
              if (err) reject(err)
              else resolve()
            })
          })
        })).then(() => cb())
          .catch(cb)
      })
    }
  }

  function onLink () {
    fs.readlink(src, (err, resolvedSrcPath) => {
      if (err) return cb(err)

      if (options.dereference) {
        resolvedSrcPath = path.resolve(process.cwd(), resolvedSrcPath)
      }

      checkDest(dest, (err, resolvedDestPath) => {
        if (err) return cb(err)

        if (resolvedDestPath === DEST_NOENT) {
          // if dest is a subdir of resolved src path
          if (isSrcKid(resolvedSrcPath, dest)) {
            return cb(new Error(`Cannot copy directory '${resolvedSrcPath}' into itself '${dest}'`))
          }
          return fs.symlink(resolvedSrcPath, dest, cb)
        } else if (resolvedDestPath === DEST_EXISTS) { // dest exists but is not a link
          // if src points to dest
          if (resolvedSrcPath === dest) return cb()

          // if dest is a subdir of src
          if (isSrcKid(resolvedSrcPath, dest)) {
            return cb(new Error(`Cannot copy directory '${resolvedSrcPath}' into itself '${dest}'`))
          }

          // if src is a subdir of dest, prevent making broken link
          if (isSrcKid(dest, resolvedSrcPath)) {
            return cb(new Error(`'${dest}' already exists and contains '${src}'`))
          }

          // we cannot use fs.unlink here since dest is not a link
          remove(dest, err => {
            if (err) return cb(err)
            return fs.symlink(resolvedSrcPath, dest, cb)
          })
        } else { // dest exists and is a link
          if (options.dereference) {
            resolvedDestPath = path.resolve(process.cwd(), resolvedDestPath)
          }
          if (resolvedSrcPath === resolvedDestPath) return cb()

          // if resolved dest path is a subdir of resolved src path, prevent copying into itself
          if (isSrcKid(resolvedSrcPath, resolvedDestPath)) {
            return cb(new Error(`Cannot copy directory '${resolvedSrcPath}' into itself '${resolvedDestPath}'`))
          }

          // if src is a subdir of dest, prevent making broken link
          if (isSrcKid(resolvedDestPath, resolvedSrcPath)) {
            return cb(new Error(`'${dest}' already exists and contains '${src}'`))
          }

          fs.unlink(dest, err => {
            if (err) return cb(err)
            return fs.symlink(resolvedSrcPath, dest, cb)
          })
        }
      })
    })
  }
}

// check dest to see if it exists and/or is a link
function checkDest (dest, cb) {
  fs.readlink(dest, (err, resolvedDestPath) => {
    if (err) {
      if (err.code === 'ENOENT') return cb(null, DEST_NOENT)
      // dest exists but is not a link, Windows throws UNKNOWN error
      if (err.code === 'EINVAL' || err.code === 'UNKNOWN') return cb(null, DEST_EXISTS)
      return cb(err)
    }
    // dest exists and is a link
    return cb(null, resolvedDestPath)
  })
}

// return true if dest is a subdir of src, otherwise false.
// extract dest base dir and check if that is the same as src basename
function isSrcKid (src, dest) {
  src = path.resolve(src)
  dest = path.resolve(dest)
  try {
    return src !== dest &&
           dest.indexOf(src) > -1 &&
           dest.split(path.dirname(src) + path.sep)[1].split(path.sep)[0] === path.basename(src)
  } catch (e) {
    return false
  }
}

module.exports = copy
