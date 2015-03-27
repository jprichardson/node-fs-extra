var path = require('path')
var fs = require('graceful-fs')
var mkdir = require('./mkdir')

function createOutputStream (file, options, callback) {
  if (typeof options === 'function') {
    callback = options
    options = null
  }

  var dir = path.dirname(file)
  fs.exists(dir, function(itDoes) {
    if (itDoes) return callback(null, fs.createWriteStream(file, options))

    mkdir.mkdirs(dir, function(err) {
      if (err) return callback(err)

      callback(null, fs.createWriteStream(file, options))
    })
  })
}

function createOutputStreamSync (file, options) {
  var dir = path.dirname(file)
  if (!fs.existsSync(dir)) {
    mkdir.mkdirsSync(dir)
  }
  return fs.createWriteStream(file, options)
}

module.exports = {
  createOutputStream: createOutputStream,
  createOutputStreamSync: createOutputStreamSync
}
