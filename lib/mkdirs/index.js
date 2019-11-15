'use strict'
const u = require('universalify').fromCallback
const mkdirFactory = require('./mkdirs')
const mkdirSyncFactory = require('./mkdirs-sync')

function mkdirMethodsFac (fs) {
  const mkdirs = u(mkdirFactory(fs))
  const mkdirsSync = mkdirSyncFactory(fs)

  return {
    mkdirs,
    mkdirsSync,
    // alias
    mkdirp: mkdirs,
    mkdirpSync: mkdirsSync,
    ensureDir: mkdirs,
    ensureDirSync: mkdirsSync
  }
}

module.exports = mkdirMethodsFac
