var assert = require('assert')
var crypto = require('crypto')
var os = require('os')
var path = require('path')
var fs = require(process.cwd())

/* global beforeEach, describe, it */

describe('+ copySync()', function () {
  var TEST_DIR
  var SIZE = 16 * 64 * 1024 + 7
  var src, dest

  beforeEach(function (done) {
    TEST_DIR = path.join(os.tmpdir(), 'fs-extra', 'copy-sync-dir')
    src = path.join(TEST_DIR, 'src')
    dest = path.join(TEST_DIR, 'dest')
    fs.emptyDir(TEST_DIR, done)
  })

  describe('> when the source is a directory', function () {
    it('should copy the directory synchronously', function () {
      var FILES = 2
      var i, j
      var src = path.join(TEST_DIR, 'src')
      var dest = path.join(TEST_DIR, 'dest')

      fs.mkdirsSync(src)

      for (i = 0; i < FILES; ++i) {
        fs.writeFileSync(path.join(src, i.toString()), crypto.randomBytes(SIZE))
      }

      var subdir = path.join(src, 'subdir')

      fs.mkdirsSync(subdir)

      for (i = 0; i < FILES; ++i) {
        fs.writeFileSync(path.join(subdir, i.toString()), crypto.randomBytes(SIZE))
      }

      fs.copySync(src, dest)
      assert(fs.existsSync(dest))

      for (i = 0; i < FILES; ++i) {
        assert(fs.existsSync(path.join(dest, i.toString())))
      }

      var destSub = path.join(dest, 'subdir')
      for (j = 0; j < FILES; ++j) {
        assert(fs.existsSync(path.join(destSub, j.toString())))
      }
    })

    it('should preserve symbolic links', function () {
      fs.mkdirsSync(src)
      fs.symlinkSync('destination', path.join(src, 'symlink'))

      fs.copySync(src, dest)

      var link = fs.readlinkSync(path.join(dest, 'symlink'))
      assert.strictEqual(link, 'destination')
    })

    it('should should apply filter recursively', function () {
      var FILES = 2
      var filter = function (s) {
        // Don't match anything that ends with a digit higher than 0:
        return /(0|\D)$/i.test(s)
      }

      fs.mkdirsSync(src)

      for (var i = 0; i < FILES; ++i) {
        fs.writeFileSync(path.join(src, i.toString()), crypto.randomBytes(SIZE))
      }

      var subdir = path.join(src, 'subdir')
      fs.mkdirsSync(subdir)

      for (i = 0; i < FILES; ++i) {
        fs.writeFileSync(path.join(subdir, i.toString()), crypto.randomBytes(SIZE))
      }

      fs.copySync(src, dest, filter)

      assert(fs.existsSync(dest))
      assert(FILES > 1)

      for (i = 0; i < FILES; ++i) {
        if (i === 0) {
          assert(fs.existsSync(path.join(dest, i.toString())))
        } else {
          assert(!fs.existsSync(path.join(dest, i.toString())))
        }
      }

      var destSub = path.join(dest, 'subdir')

      for (var j = 0; j < FILES; ++j) {
        if (j === 0) {
          assert(fs.existsSync(path.join(destSub, j.toString())))
        } else {
          assert(!fs.existsSync(path.join(destSub, j.toString())))
        }
      }
    })

    it('should apply the filter to directory names', function () {
      var IGNORE = 'ignore'
      var filter = function (p) {
        return !~p.indexOf(IGNORE)
      }

      fs.mkdirsSync(src)

      var ignoreDir = path.join(src, IGNORE)
      fs.mkdirsSync(ignoreDir)

      fs.writeFileSync(path.join(ignoreDir, 'file'), crypto.randomBytes(SIZE))

      fs.copySync(src, dest, filter)

      assert(!fs.existsSync(path.join(dest, IGNORE)), 'directory was not ignored')
      assert(!fs.existsSync(path.join(dest, IGNORE, 'file')), 'file was not ignored')
    })

    describe('> when the destination dir does not exist', function () {
      it('should create the destination directory and copy the file', function () {
        var src = path.join(TEST_DIR, 'data/')
        fs.mkdirSync(src)

        var d1 = 'file1'
        var d2 = 'file2'

        fs.writeFileSync(path.join(src, 'f1.txt'), d1)
        fs.writeFileSync(path.join(src, 'f2.txt'), d2)

        var dest = path.join(TEST_DIR, 'this/path/does/not/exist/outputDir')

        fs.copySync(src, dest)

        var o1 = fs.readFileSync(path.join(dest, 'f1.txt'), 'utf8')
        var o2 = fs.readFileSync(path.join(dest, 'f2.txt'), 'utf8')

        assert.strictEqual(d1, o1)
        assert.strictEqual(d2, o2)
      })
    })
  })
})
