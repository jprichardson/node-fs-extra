(function() {
  var rimraf, rmrf, rmrfSync;

  rimraf = require('rimraf');

  rmrfSync = function(dir) {
    return rimraf.sync(dir);
  };

  rmrf = function(dir, cb) {
    return rimraf(dir, cb);
  };

  module.exports.rmrfSync = rmrfSync;

  module.exports.rmrf = rmrf;

}).call(this);
