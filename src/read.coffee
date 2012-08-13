fs = require('fs')

readJSONFile = (file, callback) ->
  fs.readFile file, (err, data) ->
    obj = {}
    try
      data = data.toString()
      obj = JSON.parse(data)   
    catch error
      callback(error, null); return
    callback(null, obj)

module.exports.readJSONFile = readJSONFile