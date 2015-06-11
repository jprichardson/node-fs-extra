var fs = require('graceful-fs')

var BUF_LENGTH = 64 * 1024
var _buff = new Buffer(BUF_LENGTH)

function copyFileSync (srcFile, destFile, clobber) {
  if (fs.existsSync(destFile) && !clobber) {
    throw Error('EEXIST')
  }

  var fdr = fs.openSync(srcFile, 'r')
  var stat = fs.fstatSync(fdr)
  var fdw = fs.openSync(destFile, 'w', stat.mode)
  var bytesRead = 1
  var pos = 0

  while (bytesRead > 0) {
    bytesRead = fs.readSync(fdr, _buff, 0, BUF_LENGTH, pos)
    fs.writeSync(fdw, _buff, 0, bytesRead)
    pos += bytesRead
  }

  fs.closeSync(fdr)
  fs.closeSync(fdw)
}

module.exports = copyFileSync
