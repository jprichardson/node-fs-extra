'use strict'

const path = require('path')
const memoize = require('memoize-weak')
const mkdirFac = require('../mkdirs')
const jsonFileFac = require('./jsonfile')

function outputJsonSyncFac (fs) {
  const mkdir = mkdirFac(fs)
  const jsonFile = jsonFileFac(fs)

  function outputJsonSync (file, data, options) {
    const dir = path.dirname(file)

    if (!fs.existsSync(dir)) {
      mkdir.mkdirsSync(dir)
    }

    jsonFile.writeJsonSync(file, data, options)
  }

  return outputJsonSync
}
module.exports = memoize(outputJsonSyncFac)
