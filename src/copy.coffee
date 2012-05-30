fs = require('fs')
ncp = require('ncp').ncp

BUF_LENGTH = 64*1024
_buff = new Buffer(BUF_LENGTH)

copyFileSync = (srcFile, destFile) ->
  fdr = fs.openSync(srcFile, 'r')
  fdw = fs.openSync(destFile, 'w')
  bytesRead = 1
  pos = 0
  while bytesRead > 0
    bytesRead = fs.readSync(fdr, _buff, 0, BUF_LENGTH, pos)
    fs.writeSync(fdw,_buff,0,bytesRead)
    pos += bytesRead
  fs.closeSync(fdr)
  fs.closeSync(fdw)

copyFile = (srcFile, destFile, cb) ->
  fdr = fs.createReadStream(srcFile)
  fdw = fs.createWriteStream(destFile)
  fdr.on 'end', ->
    cb(null)
  fdr.pipe(fdw)


copy = (source, dest, callback) ->
  ncp(source, dest, callback)

module.exports.copyFileSync = copyFileSync
module.exports.copyFile = copyFile
module.exports.copy = copy