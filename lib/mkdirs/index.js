'use strict'
const u = require('universalify').fromCallback

const _mkdirs = require('./mkdirs')
const _mkdirsSync = require('./mkdirs-sync')

module.exports = fs => {
  const mkdirs = u(_mkdirs(fs))
  const mkdirsSync = _mkdirsSync(fs)

  return {
    mkdirs: mkdirs,
    mkdirsSync: mkdirsSync,
    // alias
    mkdirp: mkdirs,
    mkdirpSync: mkdirsSync,
    ensureDir: mkdirs,
    ensureDirSync: mkdirsSync
  }
}
