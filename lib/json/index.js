'use strict'

const u = require('universalify').fromCallback

const _jsonFile = require('./jsonfile')
const _outputJson = require('./output-json')
const _outputJsonSync = require('./output-json-sync')

const prep = fs => {
  const jsonFile = _jsonFile(fs)

  jsonFile.outputJson = u(_outputJson(fs))
  jsonFile.outputJsonSync = _outputJsonSync(fs)
  // aliases
  jsonFile.outputJSON = jsonFile.outputJson
  jsonFile.outputJSONSync = jsonFile.outputJsonSync
  jsonFile.writeJSON = jsonFile.writeJson
  jsonFile.writeJSONSync = jsonFile.writeJsonSync
  jsonFile.readJSON = jsonFile.readJson
  jsonFile.readJSONSync = jsonFile.readJsonSync

  return jsonFile
}

module.exports = prep
