'use strict'

const fs = require('graceful-fs')
const path = require('path')
const copySync = require('../copy-sync').copySync
const removeSync = require('../remove').removeSync
const mkdirpSync = require('../mkdirs').mkdirpSync

function moveSync (src, dest, opts) {
  opts = opts || {}
  const overwrite = opts.overwrite || opts.clobber || false
  src = path.resolve(src)
  dest = path.resolve(dest)
  if (src === dest) return fs.accessSync(src)

  const st = fs.statSync(src)
  if (st.isDirectory() && isSrcSubdir(src, dest)) throw new Error(`Cannot move '${src}' to a subdirectory of itself, '${dest}'.`)
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

function isSrcSubdir (src, dest) {
  const srcArr = src.split(path.sep)
  const destArr = dest.split(path.sep)
  return srcArr.reduce((acc, curr, i) => acc && destArr[i] === curr, true)
}

module.exports = { moveSync }
