var assert = require('assert')
var crypto = require('crypto')
var os = require('os')
var path = require('path')
var fs = require(process.cwd())

/* global afterEach, beforeEach, describe, it */

var SIZE = 16 * 64 * 1024 + 7

describe('+ copySync()', function () {
  var TEST_DIR

  beforeEach(function (done) {
    TEST_DIR = path.join(os.tmpdir(), 'fs-extra', 'copy-sync')
    fs.emptyDir(TEST_DIR, done)
  })

  afterEach(function (done) {
    fs.remove(TEST_DIR, done)
  })

  describe('> when the source is a file', function () {
    it('should copy the file synchronously', function () {
      var fileSrc = path.join(TEST_DIR, 'TEST_fs-extra_src')
      var fileDest = path.join(TEST_DIR, 'TEST_fs-extra_copy')

      fs.writeFileSync(fileSrc, crypto.randomBytes(SIZE))

      var srcMd5 = crypto.createHash('md5').update(fs.readFileSync(fileSrc)).digest('hex')
      var destMd5 = ''

      fs.copySync(fileSrc, fileDest)

      destMd5 = crypto.createHash('md5').update(fs.readFileSync(fileDest)).digest('hex')
      assert.strictEqual(srcMd5, destMd5)
    })

    it('should follow symlinks', function () {
      var fileSrc = path.join(TEST_DIR, 'TEST_fs-extra_src')
      var fileDest = path.join(TEST_DIR, 'TEST_fs-extra_copy')
      var linkSrc = path.join(TEST_DIR, 'TEST_fs-extra_copy_link')

      fs.writeFileSync(fileSrc, crypto.randomBytes(SIZE))

      var srcMd5 = crypto.createHash('md5').update(fs.readFileSync(fileSrc)).digest('hex')
      var destMd5 = ''

      fs.symlinkSync(fileSrc, linkSrc)
      fs.copySync(linkSrc, fileDest)
      destMd5 = crypto.createHash('md5').update(fs.readFileSync(fileDest)).digest('hex')
      assert.strictEqual(srcMd5, destMd5)
    })

    it('should maintain file mode', function () {
      var fileSrc = path.join(TEST_DIR, 'TEST_fs-extra_src')
      var fileDest = path.join(TEST_DIR, 'TEST_fs-extra_copy')
      fs.writeFileSync(fileSrc, crypto.randomBytes(SIZE))

      fs.chmodSync(fileSrc, parseInt('750', 8))
      fs.copySync(fileSrc, fileDest)

      var statSrc = fs.statSync(fileSrc)
      var statDest = fs.statSync(fileDest)
      assert.strictEqual(statSrc.mode, statDest.mode)
    })

    it('should only copy files allowed by filter regex', function () {
      var srcFile1 = path.join(TEST_DIR, '1.html')
      var srcFile2 = path.join(TEST_DIR, '2.css')
      var srcFile3 = path.join(TEST_DIR, '3.jade')

      fs.writeFileSync(srcFile1, '')
      fs.writeFileSync(srcFile2, '')
      fs.writeFileSync(srcFile3, '')

      var destFile1 = path.join(TEST_DIR, 'dest1.html')
      var destFile2 = path.join(TEST_DIR, 'dest2.css')
      var destFile3 = path.join(TEST_DIR, 'dest3.jade')
      var filter = /.html$|.css$/i

      fs.copySync(srcFile1, destFile1, {filter: filter})
      fs.copySync(srcFile2, destFile2, {filter: filter})
      fs.copySync(srcFile3, destFile3, {filter: filter})

      assert(fs.existsSync(destFile1))
      assert(fs.existsSync(destFile2))
      assert(!fs.existsSync(destFile3))
    })

    it('should only copy files allowed by filter fn', function () {
      var srcFile1 = path.join(TEST_DIR, '1.html')
      var srcFile2 = path.join(TEST_DIR, '2.css')
      var srcFile3 = path.join(TEST_DIR, '3.jade')

      fs.writeFileSync(srcFile1, '')
      fs.writeFileSync(srcFile2, '')
      fs.writeFileSync(srcFile3, '')

      var destFile1 = path.join(TEST_DIR, 'dest1.html')
      var destFile2 = path.join(TEST_DIR, 'dest2.css')
      var destFile3 = path.join(TEST_DIR, 'dest3.jade')

      var filter = function (s) { return s.split('.').pop() !== 'css' }

      fs.copySync(srcFile1, destFile1, filter)
      fs.copySync(srcFile2, destFile2, filter)
      fs.copySync(srcFile3, destFile3, filter)

      assert(fs.existsSync(destFile1))
      assert(!fs.existsSync(destFile2))
      assert(fs.existsSync(destFile3))
    })

    describe('> when the destination dir does not exist', function () {
      it('should create the destination directory and copy the file', function () {
        var src = path.join(TEST_DIR, 'file.txt')
        var dest = path.join(TEST_DIR, 'this/path/does/not/exist/copied.txt')
        var data = 'did it copy?\n'

        fs.writeFileSync(src, data, 'utf8')
        fs.copySync(src, dest)

        var data2 = fs.readFileSync(dest, 'utf8')

        assert.strictEqual(data, data2)
      })
    })

    describe('> when clobber option is passed', function () {
      var src, dest
      var srcData = 'some src data'

      beforeEach(function () {
        src = path.join(TEST_DIR, 'src-file')
        dest = path.join(TEST_DIR, 'des-file')

        // source file must always exist in these cases
        fs.writeFileSync(src, srcData)
      })

      describe('> when destination file does NOT exist', function () {
        describe('> when clobber is true', function () {
          it('should copy the file and not throw an error', function () {
            fs.copySync(src, dest, {clobber: true})
            var destData = fs.readFileSync(dest, 'utf8')
            assert.strictEqual(srcData, destData)
          })
        })

        describe('> when clobber is false', function () {
          it('should copy the file and not throw an error', function () {
            fs.copySync(src, dest, {clobber: false})
            var destData = fs.readFileSync(dest, 'utf8')
            assert.strictEqual(srcData, destData)
          })
        })
      })

      describe('when destination file does exist', function () {
        var destData
        beforeEach(function () {
          destData = 'some dest data'
          fs.writeFileSync(dest, destData)
        })

        describe('> when clobber is true', function () {
          it('should copy the file and not throw an error', function () {
            fs.copySync(src, dest, {clobber: true})
            destData = fs.readFileSync(dest, 'utf8')
            assert.strictEqual(srcData, destData)
          })
        })

        describe('> when clobber is false', function () {
          it('should copy the file and THROW an error', function () {
            assert.throws(function () {
              fs.copySync(src, dest, {clobber: false})
            })

            // copy never happened
            var destDataNew = fs.readFileSync(dest, 'utf8')
            assert.strictEqual(destData, destDataNew)
          })
        })

        describe('> when clobber is true and dest is readonly', function () {
          it('should copy the file and not throw an error', function () {
            try {
              fs.chmodSync(dest, parseInt('444', 8))
              fs.copySync(src, dest, {clobber: true})
              destData = fs.readFileSync(dest, 'utf8')
              assert.strictEqual(srcData, destData)
            } finally {
              // destination file is readonly so just remove it so we don't affect other tests
              fs.unlinkSync(dest)
            }
          })
        })
      })
    })
  })
})
