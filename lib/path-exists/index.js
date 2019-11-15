'use strict'
const u = require('universalify').fromPromise
const fsFac = require('../fs')

function pathExistsFac (fs) {
  const self = fsFac(fs)
  function pathExists (path) {
    return self.access(path).then(() => true).catch(() => false)
  }

  return {
    pathExists: u(pathExists),
    pathExistsSync: self.existsSync
  }
}
module.exports = pathExistsFac
