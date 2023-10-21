'use strict'

const u = require('universalify').fromPromise
const path = require('path')
const fs = require('../fs')

const { mkdirs, mkdirsSync } = require('../mkdirs')

const { symlinkPaths, symlinkPathsSync } = require('./symlink-paths')
const { symlinkType, symlinkTypeSync } = require('./symlink-type')

const { pathExists } = require('../path-exists')

const { areIdentical } = require('../util/stat')

async function createSymlink (srcpath, dstpath, type = false) {
  try {
    const stats = await fs.lstat(dstpath)

    if (stats.isSymbolicLink()) {
      const [srcStat, dstStat] = await Promise.all([
        fs.stat(srcpath),
        fs.stat(dstpath)
      ])

      if (areIdentical(srcStat, dstStat)) return
    }

    return _createSymlink(srcpath, dstpath, type)
  } catch {}
}

function _createSymlink (srcpath, dstpath, type, callback) {
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
}

function createSymlinkSync (srcpath, dstpath, type) {
  let stats
  try {
    stats = fs.lstatSync(dstpath)
  } catch {}
  if (stats && stats.isSymbolicLink()) {
    const srcStat = fs.statSync(srcpath)
    const dstStat = fs.statSync(dstpath)
    if (areIdentical(srcStat, dstStat)) return
  }

  const relative = symlinkPathsSync(srcpath, dstpath)
  srcpath = relative.toDst
  type = symlinkTypeSync(relative.toCwd, type)
  const dir = path.dirname(dstpath)
  const exists = fs.existsSync(dir)
  if (exists) return fs.symlinkSync(srcpath, dstpath, type)
  mkdirsSync(dir)
  return fs.symlinkSync(srcpath, dstpath, type)
}

module.exports = {
  createSymlink: u(createSymlink),
  createSymlinkSync
}
