'use strict'

const path = require('path')

const _mkdir = require('../mkdirs')
const _pathExists = require('../path-exists')
const _jsonFile = require('./jsonfile')

const prep = fs => {
  const mkdir = _mkdir(fs)
  const pathExists = _pathExists(fs).pathExists
  const jsonFile = _jsonFile(fs)

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

  return outputJson
}

module.exports = prep
