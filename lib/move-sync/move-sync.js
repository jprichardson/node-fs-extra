'use strict'

const path = require('path')
const memoize = require('memoize-weak')
const buildPartialFs = require('../util/build-partial-fs')
const copySyncFac = require('../copy-sync')
const removeSyncFac = require('../remove')
const mkdirFac = require('../mkdirs')
const statFac = require('../util/stat')

function moveSyncFac (fs) {
  const { copySync, removeSync, mkdirpSync } = buildPartialFs(
    fs,
    copySyncFac,
    removeSyncFac,
    mkdirFac
  )
  const stat = statFac(fs)
  function moveSync (src, dest, opts) {
    opts = opts || {}
    const overwrite = opts.overwrite || opts.clobber || false

    const { srcStat } = stat.checkPathsSync(src, dest, 'move')
    stat.checkParentPathsSync(src, srcStat, dest, 'move')
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

  return moveSync
}
module.exports = memoize(moveSyncFac)
