rimraf = require('rimraf')

rmrfSync = (dir) ->
  rimraf.sync(dir)

rmrf = (dir,cb) ->
  rimraf(dir,cb)

module.exports.rmrfSync = rmrfSync
module.exports.rmrf = rmrf