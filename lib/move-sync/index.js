'use strict'

// most of this code was written by Andrew Kelley
// licensed under the BSD license: see
// https://github.com/andrewrk/node-mv/blob/master/package.json
// This is the sync version that somehow follows the same pattern.

const fs = require('graceful-fs')
const path = require('path')
const copySync = require('../copy-sync').copySync
const removeSync = require('../remove').removeSync
const mkdirpSync = require('../mkdirs').mkdirsSync

function moveSync (src, dest, options) {
  options = options || {}
  const overwrite = options.overwrite || options.clobber || false

  if (path.resolve(src) === path.resolve(dest)) return

  mkdirpSync(path.dirname(dest))
  tryRenameSync()

  function tryRenameSync () {
    if (overwrite) {
      try {
        return fs.renameSync(src, dest)
      } catch (err) {
        if (err.code === 'ENOTEMPTY' || err.code === 'EEXIST' || err.code === 'EPERM') {
          removeSync(dest)
          options.overwrite = false // just overwriteed it, no need to do it again
          return moveSync(src, dest, options)
        }

        if (err.code !== 'EXDEV') throw err
        return moveSyncAcrossDevice(src, dest, overwrite)
      }
    } else {
      try {
        fs.linkSync(src, dest)
        return fs.unlinkSync(src)
      } catch (err) {
        if (err.code === 'EXDEV' || err.code === 'EISDIR' || err.code === 'EPERM' || err.code === 'ENOTSUP') {
          return moveSyncAcrossDevice(src, dest, overwrite)
        }
        throw err
      }
    }
  }
}

function moveSyncAcrossDevice (src, dest, overwrite) {
  const stat = fs.statSync(src)

  if (stat.isDirectory()) {
    return moveDirSyncAcrossDevice(src, dest, overwrite)
  } else {
    return moveFileSyncAcrossDevice(src, dest, overwrite)
  }
}

function moveFileSyncAcrossDevice (src, dest, overwrite) {
  const BUF_LENGTH = 64 * 1024
  const _buff = Buffer.alloc(BUF_LENGTH)

  const flags = overwrite ? 'w' : 'wx'

  try {
    const fdr = fs.openSync(src, 'r')
    const stat = fs.fstatSync(fdr)
    const fdw = fs.openSync(dest, flags, stat.mode)
    let bytesRead = 1
    let pos = 0

    while (bytesRead > 0) {
      bytesRead = fs.readSync(fdr, _buff, 0, BUF_LENGTH, pos)
      fs.writeSync(fdw, _buff, 0, bytesRead)
      pos += bytesRead
    }

    fs.closeSync(fdr)
    fs.closeSync(fdw)
    return fs.unlinkSync(src)
  } catch (err) {
    // may want to create a directory but `out` line above
    // creates an empty file for us: See #108
    // don't care about error here
    fs.unlinkSync(dest)
    // note: `err` here is from the fdr error
    if (err.code === 'EISDIR' || err.code === 'EPERM') {
      return moveDirSyncAcrossDevice(src, dest, overwrite)
    }
    throw err
  }
}

function moveDirSyncAcrossDevice (src, dest, overwrite) {
  const options = {
    overwrite: false
  }

  if (overwrite) {
    removeSync(dest)
    tryCopySync()
  } else {
    tryCopySync()
  }

  function tryCopySync () {
    copySync(src, dest, options)
    return removeSync(src)
  }
}

module.exports = {
  moveSync
}
