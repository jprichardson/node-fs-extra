'use strict'

const u = require('universalify').fromCallback
const path = require('path')

const _mkdirs = require('../mkdirs')
const _symlinkPaths = require('./symlink-paths')
const _symlinkType = require('./symlink-type')
const _pathExists = require('../path-exists')

const prep = fs => {
  const { mkdirs, mkdirsSync } = _mkdirs(fs)
  const { symlinkPaths, symlinkPathsSync } = _symlinkPaths(fs)
  const { symlinkType, symlinkTypeSync } = _symlinkType(fs)
  const { pathExists } = _pathExists(fs)

  function createSymlink (srcpath, dstpath, type, callback) {
    callback = (typeof type === 'function') ? type : callback
    type = (typeof type === 'function') ? false : type

    pathExists(dstpath, (err, destinationExists) => {
      if (err) return callback(err)
      if (destinationExists) return callback(null)
      symlinkPaths(srcpath, dstpath, (err, relative) => {
        if (err) return callback(err)
        srcpath = relative.toDst
        symlinkType(relative.toCwd, type, (err, type) => {
          if (err) return callback(err)
          const dir = path.dirname(dstpath)
          pathExists(dir, (err, dirExists) => {
            if (err) return callback(err)
            if (dirExists) return fs.symlink(srcpath, dstpath, type, callback)
            mkdirs(dir, err => {
              if (err) return callback(err)
              fs.symlink(srcpath, dstpath, type, callback)
            })
          })
        })
      })
    })
  }

  function createSymlinkSync (srcpath, dstpath, type, callback) {
    callback = (typeof type === 'function') ? type : callback
    type = (typeof type === 'function') ? false : type

    const destinationExists = fs.existsSync(dstpath)
    if (destinationExists) return undefined

    const relative = symlinkPathsSync(srcpath, dstpath)
    srcpath = relative.toDst
    type = symlinkTypeSync(relative.toCwd, type)
    const dir = path.dirname(dstpath)
    const exists = fs.existsSync(dir)
    if (exists) return fs.symlinkSync(srcpath, dstpath, type)
    mkdirsSync(dir)
    return fs.symlinkSync(srcpath, dstpath, type)
  }

  return {
    createSymlink: u(createSymlink),
    createSymlinkSync
  }
}

module.exports = prep
