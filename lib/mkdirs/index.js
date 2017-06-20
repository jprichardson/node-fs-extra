'use strict'
const u = require('../promises').fromCallback
const mkdirs = u(require('./mkdirs'))
const mkdirsSync = require('./mkdirs-sync')

module.exports = {
  mkdirs: mkdirs,
  mkdirsSync: mkdirsSync,
  // alias
  mkdirp: mkdirs,
  mkdirpSync: mkdirsSync,
  ensureDir: mkdirs,
  ensureDirSync: mkdirsSync
}
