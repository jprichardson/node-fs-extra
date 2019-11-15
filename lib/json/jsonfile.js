'use strict'

const { JsonFile } = require('@jzetlen/jsonfile')
const memoize = require('memoize-weak')

function jsonFileFac (fs) {
  const jsonFile = new JsonFile(fs)
  return {
  // jsonfile exports
    readJson: jsonFile.readFile,
    readJsonSync: jsonFile.readFileSync,
    writeJson: jsonFile.writeFile,
    writeJsonSync: jsonFile.writeFileSync
  }
}

module.exports = memoize(jsonFileFac)
