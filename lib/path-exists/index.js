'use strict'
const fs = require('../fs')

function pathExists (path, callback = undefined) {
  if (typeof path !== 'string') {
    throw TypeError('[ERR_INVALID_ARG_TYPE] the "path" argument must be of type string')
  }
  const res = fs.access(path).then(() => true).catch(() => false)
  if (callback) {
    res.then(r => callback(null, r), callback) // this is the fromPromise behaviour
  } else {
    return res
  }
}

module.exports = {
  pathExists: pathExists,
  pathExistsSync: fs.existsSync
}
