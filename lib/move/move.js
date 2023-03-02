'use strict'

const fs = require('graceful-fs')
const path = require('path')
const copy = require('../copy').copy
const remove = require('../remove').remove
const mkdirp = require('../mkdirs').mkdirp
const pathExists = require('../path-exists').pathExists
const stat = require('../util/stat')

function move (src, dest, opts, cb) {
  if (typeof opts === 'function') {
    cb = opts
    opts = {}
  }

  opts = opts || {}
  opts.overwrite = opts.overwrite || opts.clobber || false

  stat.checkPaths(src, dest, 'move', opts, (err, stats) => {
    if (err) return cb(err)
    const { srcStat, isChangingCase = false } = stats
    stat.checkParentPaths(src, srcStat, dest, 'move', err => {
      if (err) return cb(err)
      if (isParentRoot(dest)) return doRename(src, dest, opts, isChangingCase, cb)
      mkdirp(path.dirname(dest), err => {
        if (err) return cb(err)
        return doRename(src, dest, opts, isChangingCase, cb)
      })
    })
  })
}

function isParentRoot (dest) {
  const parent = path.dirname(dest)
  const parsedPath = path.parse(parent)
  return parsedPath.root === parent
}

function doRename (src, dest, opts, isChangingCase, cb) {
  if (isChangingCase) return rename(src, dest, opts, cb)
  if (opts.overwrite) {
    return remove(dest, err => {
      if (err) return cb(err)
      return rename(src, dest, opts, cb)
    })
  }
  pathExists(dest, (err, destExists) => {
    if (err) return cb(err)
    if (destExists) return cb(new Error('dest already exists.'))
    return rename(src, dest, opts, cb)
  })
}

function rename (src, dest, opts, cb) {
  fs.rename(src, dest, err => {
    if (!err) return cb()
    if (err.code !== 'EXDEV') return cb(err)
    return moveAcrossDevice(src, dest, opts, cb)
  })
}

function moveAcrossDevice (src, dest, opts, cb) {
  opts.errorOnExist = true
  opts.preserveTimestamps = true
  copy(src, dest, opts, err => {
    if (err) return cb(err)
    return remove(src, cb)
  })
}

module.exports = move
