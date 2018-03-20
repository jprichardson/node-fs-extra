'use strict'

const u = require('universalify').fromCallback

const _jsonFile = require('jsonfile')

module.exports = fs => {
  // TODO: Make jsonfile module use input fs
  const jsonFile = _jsonFile

  return {
    // jsonfile exports
    readJson: u(jsonFile.readFile),
    readJsonSync: jsonFile.readFileSync,
    writeJson: u(jsonFile.writeFile),
    writeJsonSync: jsonFile.writeFileSync
  }
}
