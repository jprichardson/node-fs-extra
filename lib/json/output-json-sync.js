'use strict'

const path = require('path')

const _mkdir = require('../mkdirs')
const _jsonFile = require('./jsonfile')

const prep = fs => {
  const mkdir = _mkdir(fs)
  const jsonFile = _jsonFile(fs)

  function outputJsonSync (file, data, options) {
    const dir = path.dirname(file)

    if (!fs.existsSync(dir)) {
      mkdir.mkdirsSync(dir)
    }

    jsonFile.writeJsonSync(file, data, options)
  }

  return outputJsonSync
}

module.exports = prep
