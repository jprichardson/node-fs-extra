var rimraf = require('rimraf')
var fs = require('fs')

function removeSync(dir) {
  return rimraf.sync(dir)
}

function remove(dir, callback) {
  return callback ? rimraf(dir, callback) : rimraf(dir, function(){})
}

module.exports = {
  remove: remove,
  removeSync: removeSync
}
