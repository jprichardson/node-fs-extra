var fs = require('graceful-fs')
var path = require('path')
var jsonFile = require('jsonfile')
var mkdir = require('../mkdirs')

function outputJson (file, data, callback) {
  var dir = path.dirname(file)

  fs.exists(dir, function (itDoes) {
    if (itDoes) return jsonFile.writeFile(file, data, callback)

    mkdir.mkdirs(dir, function (err) {
      if (err) return callback(err)
      jsonFile.writeFile(file, data, callback)
    })
  })
}

module.exports = outputJson
