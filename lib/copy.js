(function() {
  var BUF_LENGTH, copyFile, copyFileSync, fs, _buff;

  fs = require('fs');

  BUF_LENGTH = 64 * 1024;

  _buff = new Buffer(BUF_LENGTH);

  copyFileSync = function(srcFile, destFile) {
    var bytesRead, fdr, fdw, pos;
    fdr = fs.openSync(srcFile, 'r');
    fdw = fs.openSync(destFile, 'w');
    bytesRead = 1;
    pos = 0;
    while (bytesRead > 0) {
      bytesRead = fs.readSync(fdr, _buff, 0, BUF_LENGTH, pos);
      fs.writeSync(fdw, _buff, 0, bytesRead);
      pos += bytesRead;
    }
    fs.closeSync(fdr);
    return fs.closeSync(fdw);
  };

  copyFile = function(srcFile, destFile, cb) {
    var fdr, fdw;
    fdr = fs.createReadStream(srcFile);
    fdw = fs.createWriteStream(destFile);
    fdr.on('end', function() {
      return cb(null);
    });
    return fdr.pipe(fdw);
  };

  module.exports.copyFileSync = copyFileSync;

  module.exports.copyFile = copyFile;

}).call(this);
