'use strict'

const jsonFileFac = require('./jsonfile')
const outputJsonFac = require('./output-json')
const outputJsonSyncFac = require('./output-json-sync')

function jsonFac (fs) {
  const jsonFile = jsonFileFac(fs)
  jsonFile.outputJson = outputJsonFac(fs)
  jsonFile.outputJsonSync = outputJsonSyncFac(fs)
  // aliases
  jsonFile.outputJSON = jsonFile.outputJson
  jsonFile.outputJSONSync = jsonFile.outputJsonSync
  jsonFile.writeJSON = jsonFile.writeJson
  jsonFile.writeJSONSync = jsonFile.writeJsonSync
  jsonFile.readJSON = jsonFile.readJson
  jsonFile.readJSONSync = jsonFile.readJsonSync

  return jsonFile
}
module.exports = jsonFac
