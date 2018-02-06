'use strict'

const u = require('universalify').fromCallback
const fs = require('graceful-fs')
const path = require('path')
const copy = require('../copy').copy
const remove = require('../remove').remove
const mkdirp = require('../mkdirs').mkdirp

const destIsFile = Symbol('destIsFile')
const destIsDir = Symbol('destIsDir')

function move (src, dest, opts, cb) {
  if (typeof opts === 'function') {
    cb = opts
    opts = {}
  }

  const overwrite = opts.overwrite || opts.clobber || false

  src = path.resolve(src)
  dest = path.resolve(dest)

  if (src === dest) return fs.access(src, cb)

  fs.stat(src, (err, st) => {
    if (err) return cb(err)

    const srcIsDir = st.isDirectory()
    if (srcIsDir && isSrcSubdir(src, dest)) return cb(new Error(`Cannot move '${src}' to a subdirectory of itself, '${dest}'.`))

    checkDest(dest, (err, res) => {
      if (err) return cb(err)
      if (!overwrite && res) return cb(new Error('dest already exists.'))
      if (srcIsDir && res === destIsFile) return cb(new Error(`Cannot move directory '${src}' to file '${dest}'.`))
      if (!srcIsDir && res === destIsDir) return cb(new Error(`Cannot move file '${src}' to directory '${dest}'.`))
      return doRename(src, dest, overwrite, cb)
    })
  })
}

function doRename (src, dest, overwrite, cb) {
  mkdirp(path.dirname(dest), err => {
    if (err) return cb(err)
    if (overwrite) return renameOverwrite(src, dest, overwrite, cb)
    return rename(src, dest, overwrite, cb)
  })
}

function renameOverwrite (src, dest, overwrite, cb) {
  fs.rename(src, dest, err => {
    if (!err) return cb()
    if (err.code === 'ENOTEMPTY' || err.code === 'EEXIST' || err.code === 'EPERM') {
      return remove(dest, err => {
        if (err) return cb(err)
        return move(src, dest, {overwrite: overwrite}, cb)
      })
    }
    if (err.code !== 'EXDEV') return cb(err)
    return moveAcrossDevice(src, dest, overwrite, cb)
  })
}

function rename (src, dest, overwrite, cb) {
  fs.rename(src, dest, err => {
    if (!err) return cb()
    if (err.code === 'EPERM') return moveAcrossDevice(src, dest, overwrite, cb)
    if (err.code !== 'EXDEV') return cb(err)
    return moveAcrossDevice(src, dest, overwrite, cb)
  })
}

function moveAcrossDevice (src, dest, overwrite, cb) {
  const opts = {
    overwrite: overwrite,
    errorOnExist: true
  }

  copy(src, dest, opts, err => {
    if (err) return cb(err)
    return remove(src, cb)
  })
}

function checkDest (dest, cb) {
  fs.stat(dest, (err, st) => {
    if (err) {
      if (err.code === 'ENOENT') return cb()
      return cb(err)
    }
    return cb(null, st.isDirectory() ? destIsDir : destIsFile)
  })
}

function isSrcSubdir (src, dest) {
  const srcArray = src.split(path.sep)
  const destArray = dest.split(path.sep)

  return srcArray.reduce((acc, current, i) => {
    return acc && destArray[i] === current
  }, true)
}

module.exports = {
  move: u(move)
}
