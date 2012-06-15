rimraf = require('rimraf')
fs = require('fs')

rmrfSync = (dir) ->
  rimraf.sync(dir)

rmrf = (dir,cb) ->
  if cb?
    rimraf(dir,cb)
  else #rimraf throughs an error without a callback
    rimraf(dir, (->))

###
remove = (path, callback) ->
  fs.lstat path, (err, stats) ->
    if stats.isDirectory()
      rimraf(path, callback)
    else
      fs.unlink(path, callback)
###

module.exports.rmrfSync = rmrfSync
module.exports.rmrf = rmrf
module.exports.remove = rmrf
module.exports.removeSync = rmrfSync