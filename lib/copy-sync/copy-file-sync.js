var fs = require('graceful-fs')

var BUF_LENGTH = 64 * 1024
var _buff = new Buffer(BUF_LENGTH)

function copyFileSync (srcFile, destFile, options) {
  var overwrite = options.overwrite
  var errorOnExist = options.errorOnExist
  var preserveTimestamps = options.preserveTimestamps

  if (fs.existsSync(destFile)) {
    if (overwrite) {
      fs.unlinkSync(destFile)
    } else if (errorOnExist) {
      throw new Error(destFile + ' already exists')
    } else return
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

  if (preserveTimestamps) {
    fs.futimesSync(fdw, stat.atime, stat.mtime)
  }

  fs.closeSync(fdr)
  fs.closeSync(fdw)
}

module.exports = copyFileSync
