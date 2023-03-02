'use strict'

const fs = require('graceful-fs')
const path = require('path')
const copySync = require('../copy').copySync
const removeSync = require('../remove').removeSync
const mkdirpSync = require('../mkdirs').mkdirpSync
const stat = require('../util/stat')

function moveSync (src, dest, opts) {
  opts = opts || {}
  opts.overwrite = opts.overwrite || opts.clobber || false
  const { srcStat, isChangingCase = false } = stat.checkPathsSync(src, dest, 'move', opts)
  stat.checkParentPathsSync(src, srcStat, dest, 'move')
  if (!isParentRoot(dest)) mkdirpSync(path.dirname(dest))
  return doRename(src, dest, isChangingCase, opts)
}

function isParentRoot (dest) {
  const parent = path.dirname(dest)
  const parsedPath = path.parse(parent)
  return parsedPath.root === parent
}

function doRename (src, dest, isChangingCase, opts) {
  if (isChangingCase) return rename(src, dest, opts)
  if (opts.overwrite) {
    removeSync(dest)
    return rename(src, dest, opts)
  }
  if (fs.existsSync(dest)) throw new Error('dest already exists.')
  return rename(src, dest, opts)
}

function rename (src, dest, opts) {
  try {
    fs.renameSync(src, dest)
  } catch (err) {
    if (err.code !== 'EXDEV') throw err
    return moveAcrossDevice(src, dest, opts)
  }
}

function moveAcrossDevice (src, dest, opts) {
  opts.errorOnExist = true
  opts.preserveTimestamps = true
  copySync(src, dest, opts)
  return removeSync(src)
}

module.exports = moveSync
