crypto = require('crypto')
fs = require('../lib')
path = require('path-extra')
testutil = require('testutil')
mkdir = require('mkdirp')

SIZE = 16*64*1024+7
DIR = ''

describe 'fs-extra', ->
  beforeEach (done) ->
    DIR = testutil.createTempDir()
    done()

  afterEach (done) ->
    fs.remove DIR, (done)

  ###
  describe '+ copyFileSync()', ->
    it 'should copy synchronously', ->
      fileSrc = path.join(DIR, "TEST_fs-extra_src")
      fileDest = path.join(DIR, "TEST_fs-extra_copy")

      fileSrc = testutil.createFileWithData(fileSrc, SIZE)
      srcMd5 = crypto.createHash('md5').update(fs.readFileSync(fileSrc)).digest('hex')
      fs.copyFileSync(fileSrc, fileDest)
      destMd5 = crypto.createHash('md5').update(fs.readFileSync(fileDest)).digest("hex")

      T srcMd5 is destMd5
  ###

  describe '+ copy()', ->
    it 'should copy the file asynchronously', (done) ->
      fileSrc = path.join(DIR, "TEST_fs-extra_src")
      fileDest = path.join(DIR, "TEST_fs-extra_copy")

      fileSrc = testutil.createFileWithData(fileSrc, SIZE)
      srcMd5 = crypto.createHash('md5').update(fs.readFileSync(fileSrc)).digest("hex")

      destMd5 = ''
      fs.copy fileSrc, fileDest, (err) ->
        destMd5 = crypto.createHash('md5').update(fs.readFileSync(fileDest)).digest("hex")
        #T bufMd5 is destMd5
        T srcMd5 is destMd5
        done()

    
    it 'should copy the directory asynchronously', (done) ->
      FILES = 2
      src = path.join(DIR, 'src')
      dest = path.join(DIR, 'dest')

      mkdir src, (err) ->
        testutil.createFileWithData(path.join(src, i.toString()), SIZE) for i in [0...FILES] #create 3 files

        subdir = path.join(src, 'subdir')
        mkdir subdir, (err) ->
          testutil.createFileWithData(path.join(subdir, i.toString()), SIZE) for i in [0...FILES] #create 3 files

          fs.copy src, dest, (err) ->
            T err is null
            T fs.existsSync dest
            T fs.existsSync path.join(dest, i.toString()) for i in [0...FILES]
            destSub = path.join(dest, 'subdir')
            T fs.existsSync path.join(destSub, i.toString()) for i in [0...FILES]
            done()




