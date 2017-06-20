'use strict'
const u = require('universalify').fromCallback
const fs = require('../fs')

function pathExists (path, cb) {
  return fs.access(path, function (err) {
    return cb(null, !err)
  })
}

module.exports = {
  pathExists: u(pathExists),
  pathExistsSync: fs.existsSync
}
