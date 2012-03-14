crypto = require('crypto')
fs = require('fs-extra')
path = require('path-extra')
assert = require('assert')

T = (v) -> assert(v)
F = (v) -> assert(!v)

buildDir = ->
  buf = new Buffer(5) #small buffer for data
  bytesWritten = 0
  while bytesWritten < buf.length
    buf[bytesWritten] = Math.floor((Math.random()*256))
    bytesWritten += 1
  
  ex = Date.now()
  baseDir = path.join(path.tempdir(), "TEST_fs-extra_rmrf-#{ex}")
  fs.mkdirSync(baseDir)

  fs.writeFileSync(path.join(baseDir, Math.random() + ''), buf)
  fs.writeFileSync(path.join(baseDir, Math.random() + ''), buf)

  subDir = path.join(path.tempdir(), Math.random() + '')
  fs.mkdirSync(subDir)

  fs.writeFileSync(path.join(subDir, Math.random() + ''))
  baseDir

describe 'fs-extra', ->
  describe '+ rmrfSync()', ->
    it 'should remove directories and files synchronously', ->
      dir = buildDir()
      T path.existsSync(dir)
      fs.rmrfSync(dir)
      F path.existsSync(dir)
      

  describe '+ rmrf()', ->
    it 'should remove directories and files asynchronously', (done) ->
      dir = buildDir()
      T path.existsSync(dir)
      fs.rmrf dir, ->
        F path.existsSync(dir)
        done()
      


