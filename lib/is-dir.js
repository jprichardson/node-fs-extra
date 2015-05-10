var fs = require('fs')

function isDirectory (path, callback) {
  fs.stat(path, function (err, stats) {
    if (err) return callback(err)

    callback(null, stats.isDirectory())
  })
}

function isDirectorySync (path) {
  return fs.statSync(path).isDirectory()
}

module.exports = {
  isDirectory: isDirectory,
  isDirectorySync: isDirectorySync
}
