'use strict'

const u = require('universalify').fromPromise
const path = require('path')
const fs = require('../fs')

const { mkdirs, mkdirsSync } = require('../mkdirs')

const { symlinkPaths, symlinkPathsSync } = require('./symlink-paths')
const { symlinkType, symlinkTypeSync } = require('./symlink-type')

const { pathExists } = require('../path-exists')

const { areIdentical } = require('../util/stat')

async function createSymlink (srcpath, dstpath, type) {
  let stats
  try {
    stats = await fs.lstat(dstpath)
  } catch { }

  if (stats && stats.isSymbolicLink()) {
    // When srcpath is relative, resolve it relative to dstpath's directory
    // (standard symlink behavior) or fall back to cwd if that doesn't exist
    let srcStat
    if (path.isAbsolute(srcpath)) {
      srcStat = await fs.stat(srcpath, { bigint: true })
    } else {
      const dstdir = path.dirname(dstpath)
      const relativeToDst = path.join(dstdir, srcpath)
      try {
        srcStat = await fs.stat(relativeToDst, { bigint: true })
      } catch {
        srcStat = await fs.stat(srcpath, { bigint: true })
      }
    }

    // Following the existing symlink fails with ENOENT if it's broken; in that
    // case fall through so fs.symlink reports EEXIST, rather than leaking the
    // stat ENOENT. Any other error is unexpected, so rethrow it.
    let dstStat
    try {
      dstStat = await fs.stat(dstpath, { bigint: true })
    } catch (err) {
      if (err.code !== 'ENOENT') throw err
    }
    if (dstStat && areIdentical(srcStat, dstStat)) return
  }

  const relative = await symlinkPaths(srcpath, dstpath)
  srcpath = relative.toDst
  const toType = await symlinkType(relative.toCwd, type)
  const dir = path.dirname(dstpath)

  if (!(await pathExists(dir))) {
    await mkdirs(dir)
  }

  return fs.symlink(srcpath, dstpath, toType)
}

function createSymlinkSync (srcpath, dstpath, type) {
  let stats
  try {
    stats = fs.lstatSync(dstpath)
  } catch { }
  if (stats && stats.isSymbolicLink()) {
    // When srcpath is relative, resolve it relative to dstpath's directory
    // (standard symlink behavior) or fall back to cwd if that doesn't exist
    let srcStat
    if (path.isAbsolute(srcpath)) {
      srcStat = fs.statSync(srcpath, { bigint: true })
    } else {
      const dstdir = path.dirname(dstpath)
      const relativeToDst = path.join(dstdir, srcpath)
      try {
        srcStat = fs.statSync(relativeToDst, { bigint: true })
      } catch {
        srcStat = fs.statSync(srcpath, { bigint: true })
      }
    }

    // Following the existing symlink fails with ENOENT if it's broken; in that
    // case fall through so fs.symlinkSync reports EEXIST, rather than leaking the
    // stat ENOENT. Any other error is unexpected, so rethrow it.
    let dstStat
    try {
      dstStat = fs.statSync(dstpath, { bigint: true })
    } catch (err) {
      if (err.code !== 'ENOENT') throw err
    }
    if (dstStat && areIdentical(srcStat, dstStat)) return
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
