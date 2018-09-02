'use strict'

const fs = require('graceful-fs')
const path = require('path')
const copySync = require('../copy-sync').copySync
const removeSync = require('../remove').removeSync
const mkdirpSync = require('../mkdirs').mkdirpSync

function moveSync (src, dest, opts) {
  opts = opts || {}
  const overwrite = opts.overwrite || opts.clobber || false

  const srcStat = checkPaths(src, dest)
  checkParentStats(src, srcStat, dest)

  mkdirpSync(path.dirname(dest))
  return doRename(src, dest, overwrite)
}

function doRename (src, dest, overwrite) {
  if (overwrite) {
    removeSync(dest)
    return rename(src, dest, overwrite)
  }
  if (fs.existsSync(dest)) throw new Error('dest already exists.')
  return rename(src, dest, overwrite)
}

function rename (src, dest, overwrite) {
  try {
    fs.renameSync(src, dest)
  } catch (err) {
    if (err.code !== 'EXDEV') throw err
    return moveAcrossDevice(src, dest, overwrite)
  }
}

function moveAcrossDevice (src, dest, overwrite) {
  const opts = {
    overwrite,
    errorOnExist: true
  }

  copySync(src, dest, opts)
  return removeSync(src)
}

// return true if dest is a subdir of src, otherwise false.
// It only checks the path strings.
function isSrcSubdir (src, dest) {
  const srcArr = path.resolve(src).split(path.sep).filter(i => i)
  const destArr = path.resolve(dest).split(path.sep).filter(i => i)
  return srcArr.reduce((acc, cur, i) => acc && destArr[i] === cur, true)
}

function checkStats (src, dest) {
  const srcStat = fs.statSync(src)
  let destStat
  try {
    destStat = fs.statSync(dest)
  } catch (err) {
    if (err.code === 'ENOENT') return {srcStat}
    throw err
  }
  return {srcStat, destStat}
}

// recursively check if dest parent is a subdirectory of src.
// It works for all file types including symlinks since it
// checks the src and dest inodes. It starts from the deepest
// parent and stops once it reaches the src parent or the root path.
function checkParentStats (src, srcStat, dest) {
  const destParent = path.dirname(dest)
  if (destParent && (destParent === path.dirname(src) || destParent === path.parse(destParent).root)) return
  let destStat
  try {
    destStat = fs.statSync(destParent)
  } catch (err) {
    if (err.code === 'ENOENT') return
    throw err
  }
  if (destStat.ino && destStat.ino === srcStat.ino) {
    throw new Error(`Cannot move '${src}' to a subdirectory of itself, '${dest}'.`)
  }
  return checkParentStats(src, srcStat, destParent)
}

function checkPaths (src, dest) {
  const {srcStat, destStat} = checkStats(src, dest)
  if (destStat && destStat.ino && destStat.ino === srcStat.ino) {
    throw new Error('Source and destination must not be the same.')
  }
  if (srcStat.isDirectory() && isSrcSubdir(src, dest)) {
    throw new Error(`Cannot move '${src}' to a subdirectory of itself, '${dest}'.`)
  }
  return srcStat
}

module.exports = { moveSync }
