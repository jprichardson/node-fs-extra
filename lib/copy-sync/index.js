'use strict'

const copySyncFactory = require('./copy-sync')
function copySyncMethodsFactory (fs) {
  return { copySync: copySyncFactory(fs) }
}

module.exports = copySyncMethodsFactory
