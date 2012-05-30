(function() {
  var copy, fs, path, remove;

  fs = require('fs');

  path = require('path');

  copy = require('./copy');

  fs.copy = copy.copy;

  remove = require('./remove');

  fs.remove = remove.remove;

  fs.removeSync = remove.removeSync;

  if (!(fs.exists != null)) fs.exists = path.exists;

  if (!(fs.existsSync != null)) fs.existsSync = path.existsSync;

  module.exports = fs;

}).call(this);
