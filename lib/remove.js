(function() {
  var fs, rimraf, rmrf, rmrfSync;

  rimraf = require('rimraf');

  fs = require('fs');

  rmrfSync = function(dir) {
    return rimraf.sync(dir);
  };

  rmrf = function(dir, cb) {
    return rimraf(dir, cb);
  };

  /*
  remove = (path, callback) ->
    fs.lstat path, (err, stats) ->
      if stats.isDirectory()
        rimraf(path, callback)
      else
        fs.unlink(path, callback)
  */

  module.exports.rmrfSync = rmrfSync;

  module.exports.rmrf = rmrf;

  module.exports.remove = rmrf;

  module.exports.removeSync = rmrfSync;

}).call(this);
