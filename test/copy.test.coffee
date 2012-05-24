crypto = require('crypto')
fs = require('../lib')
path = require('path-extra')
testutil = require('testutil')

SIZE = 16*64*1024+7
DIR = ''

describe 'fs-extra', ->
  beforeEach (done) ->
    DIR = testutil.createTempDir()
    done()

  afterEach (done) ->
    fs.rmrf DIR, (done)


  describe '+ copyFileSync()', ->
    it 'should copy synchronously', ->
      fileSrc = path.join(DIR, "TEST_fs-extra_src")
      fileDest = path.join(DIR, "TEST_fs-extra_copy")

      fileSrc = testutil.createFileWithData(fileSrc, SIZE)
      srcMd5 = crypto.createHash('md5').update(fs.readFileSync(fileSrc)).digest('hex')
      fs.copyFileSync(fileSrc, fileDest)
      destMd5 = crypto.createHash('md5').update(fs.readFileSync(fileDest)).digest("hex")

      T srcMd5 is destMd5


  describe '+ copyFile()', ->
    it 'should copy asynchronously', (done) ->
      fileSrc = path.join(DIR, "TEST_fs-extra_src")
      fileDest = path.join(DIR, "TEST_fs-extra_copy")

      fileSrc = testutil.createFileWithData(fileSrc, SIZE)
      srcMd5 = crypto.createHash('md5').update(fs.readFileSync(fileSrc)).digest("hex")

      destMd5 = ''
      fs.copyFile fileSrc, fileDest, (err) ->
        destMd5 = crypto.createHash('md5').update(fs.readFileSync(fileDest)).digest("hex")
        #T bufMd5 is destMd5
        T srcMd5 is destMd5
        done()

      

      




