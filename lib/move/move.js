'use strict'

const path = require('path')
const memoize = require('memoize-weak')
const buildPartialFs = require('../util/build-partial-fs')
const copyFac = require('../copy')
const removeFac = require('../remove')
const mkdirsFac = require('../mkdirs')
const pathExistsFac = require('../path-exists')
const statFac = require('../util/stat')

function moveFactory (fs) {
  const { copy, remove, mkdirp, pathExists } = buildPartialFs(
    fs,
    copyFac,
    removeFac,
    mkdirsFac,
    pathExistsFac
  )
  const stat = statFac(fs)

  return function move (src, dest, opts, cb) {
    if (typeof opts === 'function') {
      cb = opts
      opts = {}
    }

    const overwrite = opts.overwrite || opts.clobber || false

    stat.checkPaths(src, dest, 'move', (err, stats) => {
      if (err) return cb(err)
      const { srcStat } = stats
      stat.checkParentPaths(src, srcStat, dest, 'move', err => {
        if (err) return cb(err)
        mkdirp(path.dirname(dest), err => {
          if (err) return cb(err)
          return doRename(src, dest, overwrite, cb)
        })
      })
    })
  }

  function doRename (src, dest, overwrite, cb) {
    if (overwrite) {
      return remove(dest, err => {
        if (err) return cb(err)
        return rename(src, dest, overwrite, cb)
      })
    }
    pathExists(dest, (err, destExists) => {
      if (err) return cb(err)
      if (destExists) return cb(new Error('dest already exists.'))
      return rename(src, dest, overwrite, cb)
    })
  }

  function rename (src, dest, overwrite, cb) {
    fs.rename(src, dest, err => {
      if (!err) return cb()
      if (err.code !== 'EXDEV') return cb(err)
      return moveAcrossDevice(src, dest, overwrite, cb)
    })
  }

  function moveAcrossDevice (src, dest, overwrite, cb) {
    const opts = {
      overwrite,
      errorOnExist: true
    }
    copy(src, dest, opts, err => {
      if (err) return cb(err)
      return remove(src, cb)
    })
  }
}

module.exports = memoize(moveFactory)
