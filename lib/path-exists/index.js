'use strict'
const u = require('universalify').fromPromise

const _fs = require('../fs')

const prep = fsi => {
  const fs = _fs(fsi)

  function pathExists (path) {
    return fs.access(path).then(() => true).catch(() => false)
  }

  return {
    pathExists: u(pathExists),
    pathExistsSync: fs.existsSync
  }
}

module.exports = prep
