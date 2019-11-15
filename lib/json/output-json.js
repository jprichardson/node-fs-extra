'use strict'

const path = require('path')
const memoize = require('memoize-weak')
const u = require('universalify').fromCallback
const mkdirFac = require('../mkdirs')
const pathExistsFac = require('../path-exists')
const jsonFileFac = require('./jsonfile')

function outputJsonFac (fs) {
  const mkdir = mkdirFac(fs)
  const { pathExists } = pathExistsFac(fs)
  const jsonFile = jsonFileFac(fs)

  function outputJson (file, data, options, callback) {
    if (typeof options === 'function') {
      callback = options
      options = {}
    }

    const dir = path.dirname(file)

    pathExists(dir, (err, itDoes) => {
      if (err) return callback(err)
      if (itDoes) return jsonFile.writeJson(file, data, options, callback)

      mkdir.mkdirs(dir, err => {
        if (err) return callback(err)
        jsonFile.writeJson(file, data, options, callback)
      })
    })
  }

  return u(outputJson)
}

module.exports = memoize(outputJsonFac)
