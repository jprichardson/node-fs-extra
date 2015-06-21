var assert = require('assert')
var crypto = require('crypto')
var fs = require('fs')
var os = require('os')
var path = require('path')
var fse = require('../../')

/* global afterEach, beforeEach, describe, it */

var o777 = parseInt('777', 8)
var o666 = parseInt('666', 8)
var o444 = parseInt('444', 8)

var SIZE = 16 * 64 * 1024 + 7
var TEST_DIR = ''

describe('fs-extra', function () {
  beforeEach(function (done) {
    TEST_DIR = path.join(os.tmpdir(), 'fs-extra', 'copy')
    fse.emptyDir(TEST_DIR, done)
  })

  afterEach(function (done) {
    fse.remove(TEST_DIR, done)
  })

  describe('+ copy()', function () {
    describe('> when the source is a file', function () {
      it('should copy the file asynchronously', function (done) {
        var fileSrc = path.join(TEST_DIR, 'TEST_fs-extra_src')
        var fileDest = path.join(TEST_DIR, 'TEST_fs-extra_copy')
        fs.writeFileSync(fileSrc, crypto.randomBytes(SIZE))
        var srcMd5 = crypto.createHash('md5').update(fs.readFileSync(fileSrc)).digest('hex')
        var destMd5 = ''

        fse.copy(fileSrc, fileDest, function (err) {
          assert(!err)
          destMd5 = crypto.createHash('md5').update(fs.readFileSync(fileDest)).digest('hex')
          assert.strictEqual(srcMd5, destMd5)
          done()
        })
      })

      it('should return an error if the source file does not exist', function (done) {
        var fileSrc = 'we-simply-assume-this-file-does-not-exist.bin'
        var fileDest = path.join(TEST_DIR, 'TEST_fs-extra_copy')

        fse.copy(fileSrc, fileDest, function (err) {
          assert(err)
          done()
        })
      })

      it('should only copy files allowed by filter regex', function (done) {
        var srcFile1 = path.join(TEST_DIR, '1.jade')
        fs.writeFileSync(srcFile1, '')
        var destFile1 = path.join(TEST_DIR, 'dest1.jade')
        var filter = /.html$|.css$/i
        fse.copy(srcFile1, destFile1, filter, function () {
          assert(!fs.existsSync(destFile1))
          done()
        })
      })

      it('should only copy files allowed by filter fn', function (done) {
        var srcFile1 = path.join(TEST_DIR, '1.css')
        fs.writeFileSync(srcFile1, '')
        var destFile1 = path.join(TEST_DIR, 'dest1.css')
        var filter = function (s) { return s.split('.').pop() !== 'css'}
        fse.copy(srcFile1, destFile1, filter, function () {
          assert(!fs.existsSync(destFile1))
          done()
        })
      })

      it('accepts options object in place of filter', function (done) {
        var srcFile1 = path.join(TEST_DIR, '1.jade')
        fs.writeFileSync(srcFile1, '')
        var destFile1 = path.join(TEST_DIR, 'dest1.jade')
        var options = {filter: /.html$|.css$/i}
        fse.copy(srcFile1, destFile1, options, function () {
          assert(!fs.existsSync(destFile1))
          done()
        })
      })

      describe('> when the destination dir does not exist', function () {
        it('should create the destination directory and copy the file', function (done) {
          var src = path.join(TEST_DIR, 'file.txt')
          var dest = path.join(TEST_DIR, 'this/path/does/not/exist/copied.txt')
          var data = 'did it copy?\n'

          fs.writeFileSync(src, data, 'utf8')

          fse.copy(src, dest, function (err) {
            var data2 = fs.readFileSync(dest, 'utf8')
            assert.strictEqual(data, data2)
            done(err)
          })
        })
      })
    })

    describe('> when the source is a directory', function () {
      describe('> when the source directory does not exist', function () {
        it('should return an error', function (done) {
          var ts = path.join(TEST_DIR, 'this_dir_does_not_exist')
          var td = path.join(TEST_DIR, 'this_dir_really_does_not_matter')
          fse.copy(ts, td, function (err) {
            assert(err)
            done()
          })
        })
      })

      it('should copy the directory asynchronously', function (done) {
        var FILES = 2
        var src = path.join(TEST_DIR, 'src')
        var dest = path.join(TEST_DIR, 'dest')

        fse.mkdirs(src, function (err) {
          assert(!err)
          for (var i = 0; i < FILES; ++i) {
            fs.writeFileSync(path.join(src, i.toString()), crypto.randomBytes(SIZE))
          }

          var subdir = path.join(src, 'subdir')
          fse.mkdirs(subdir, function (err) {
            assert(!err)
            for (var i = 0; i < FILES; ++i) {
              fs.writeFileSync(path.join(subdir, i.toString()), crypto.randomBytes(SIZE))
            }

            fse.copy(src, dest, function (err) {
              assert.ifError(err)
              assert(fs.existsSync(dest))

              for (var i = 0; i < FILES; ++i) {
                assert(fs.existsSync(path.join(dest, i.toString())))
              }

              var destSub = path.join(dest, 'subdir')
              for (var j = 0; j < FILES; ++j) {
                assert(fs.existsSync(path.join(destSub, j.toString())))
              }

              done()
            })
          })
        })
      })

      describe('> when the destination dir does not exist', function () {
        it('should create the destination directory and copy the file', function (done) {
          var src = path.join(TEST_DIR, 'data/')
          fse.mkdirsSync(src)
          var d1 = 'file1'
          var d2 = 'file2'

          fs.writeFileSync(path.join(src, 'f1.txt'), d1)
          fs.writeFileSync(path.join(src, 'f2.txt'), d2)

          var dest = path.join(TEST_DIR, 'this/path/does/not/exist/outputDir')

          fse.copy(src, dest, function (err) {
            var o1 = fs.readFileSync(path.join(dest, 'f1.txt'), 'utf8')
            var o2 = fs.readFileSync(path.join(dest, 'f2.txt'), 'utf8')

            assert.strictEqual(d1, o1)
            assert.strictEqual(d2, o2)

            done(err)
          })
        })
      })

      describe('> when src dir does not exist', function () {
        it('should return an error', function (done) {
          fse.copy('/does/not/exist', '/something/else', function (err) {
            assert(err instanceof Error)
            done()
          })
        })
      })
    })

    describe.skip('> REGRESSIONS', function () {
      // pretty UNIX specific, may not pass on windows... only test on Mac OS X 10.9
      it('should maintain file permissions and ownership', function (done) {
        var userid = require('userid')

        // http://man7.org/linux/man-pages/man2/stat.2.html
        var S_IFREG = parseInt('0100000', 8) // regular file
        var S_IFDIR = parseInt('0040000', 8) // directory

        var permDir = path.join(TEST_DIR, 'perms')
        fs.mkdirSync(permDir)

        var srcDir = path.join(permDir, 'src')
        fs.mkdirSync(srcDir)

        var f1 = path.join(srcDir, 'f1.txt')
        fs.writeFileSync(f1, '')
        fs.chmodSync(f1, o666)
        fs.chownSync(f1, process.getuid(), userid.gid('wheel'))
        var f1stats = fs.lstatSync(f1)
        assert.strictEqual(f1stats.mode - S_IFREG, o666)

        var d1 = path.join(srcDir, 'somedir')
        fs.mkdirSync(d1)
        fs.chmodSync(d1, o777)
        fs.chownSync(d1, process.getuid(), userid.gid('staff'))
        var d1stats = fs.lstatSync(d1)
        assert.strictEqual(d1stats.mode - S_IFDIR, o777)

        var f2 = path.join(d1, 'f2.bin')
        fs.writeFileSync(f2, '')
        fs.chmodSync(f2, o777)
        fs.chownSync(f2, process.getuid(), userid.gid('staff'))
        var f2stats = fs.lstatSync(f2)
        assert.strictEqual(f2stats.mode - S_IFREG, o777)

        var d2 = path.join(srcDir, 'crazydir')
        fs.mkdirSync(d2)
        fs.chmodSync(d2, o444)
        fs.chownSync(d2, process.getuid(), userid.gid('wheel'))
        var d2stats = fs.lstatSync(d2)
        assert.strictEqual(d2stats.mode - S_IFDIR, o444)

        var destDir = path.join(permDir, 'dest')
        fse.copy(srcDir, destDir, function (err) {
          assert.ifError(err)

          var newf1stats = fs.lstatSync(path.join(permDir, 'dest/f1.txt'))
          var newd1stats = fs.lstatSync(path.join(permDir, 'dest/somedir'))
          var newf2stats = fs.lstatSync(path.join(permDir, 'dest/somedir/f2.bin'))
          var newd2stats = fs.lstatSync(path.join(permDir, 'dest/crazydir'))

          assert.strictEqual(newf1stats.mode, f1stats.mode)
          assert.strictEqual(newd1stats.mode, d1stats.mode)
          assert.strictEqual(newf2stats.mode, f2stats.mode)
          assert.strictEqual(newd2stats.mode, d2stats.mode)

          done()
        })
      })
    })
  })
})
