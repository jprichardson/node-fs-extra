crypto = require('crypto')
fs = require('fs-extra')
path = require('path-extra')
assert = require('assert')

T = (v) -> assert(v)
F = (v) -> assert(!v)

buildBuffer = (size) ->
  buf = new Buffer(size)
  bytesWritten = 0
  while bytesWritten < buf.length
    stringOrNum = (Math.random() <= 0.5)
    data = Math.random()
    if stringOrNum
      buf[bytesWritten] = Math.floor((Math.random()*256))
      bytesWritten += 1
    else
      d = data.toString().replace('0.','')
      bytesWritten += buf.write(d.substring(0,4), bytesWritten)
  buf

describe 'fs-extra', ->

  describe 'copyFileSync', ->
    it 'should copy synchronously', ->
      buf = buildBuffer(16*64*1024+7)
      ex = Date.now()
      fileSrc = path.join(path.tempdir(), "TEST_fs-extra_write-#{ex}")
      fileDest = path.join(path.tempdir(), "TEST_fs-extra_copy-#{ex}")

      bufMd5 = crypto.createHash('md5').update(buf).digest("hex")
      fs.writeFileSync(fileSrc, buf)
      srcMd5 = crypto.createHash('md5').update(fs.readFileSync(fileSrc)).digest("hex")
      fs.copyFileSync(fileSrc, fileDest)
      destMd5 = crypto.createHash('md5').update(fs.readFileSync(fileDest)).digest("hex")

      T bufMd5 is destMd5
      T srcMd5 is destMd5


  describe 'copyFile', ->
    it 'should copy asynchronously', ->
      buf = buildBuffer(16*64*1024+7)
      ex = Date.now()
      fileSrc = path.join(path.tempdir(), "TEST_fs-extra_write-#{ex}")
      fileDest = path.join(path.tempdir(), "TEST_fs-extra_copy-#{ex}")

      bufMd5 = crypto.createHash('md5').update(buf).digest("hex")
      fs.writeFileSync(fileSrc, buf)
      srcMd5 = crypto.createHash('md5').update(fs.readFileSync(fileSrc)).digest("hex")

      destMd5 = ''

      runs ->
        fs.copyFile fileSrc, fileDest, (err) ->
          destMd5 = crypto.createHash('md5').update(fs.readFileSync(fileDest)).digest("hex")
      waitsFor -> destMd5 isnt ''
      runs ->
        T bufMd5 is destMd5
        T srcMd5 is destMd5
      




