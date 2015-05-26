var assert = require('assert')
var fs = require('fs')
var os = require('os')
var path = require('path')
var sr = require('secure-random')
var fse = require(process.cwd())

/* global afterEach, beforeEach, describe, it */

var TEST_DIR

function buildFixtureDir () {
  var buf = sr.randomBuffer(5)
  var baseDir = path.join(TEST_DIR, 'TEST_fs-extra_remove-' + Date.now())

  fs.mkdirSync(baseDir)
  fs.writeFileSync(path.join(baseDir, Math.random() + ''), buf)
  fs.writeFileSync(path.join(baseDir, Math.random() + ''), buf)

  var subDir = path.join(TEST_DIR, Math.random() + '')
  fs.mkdirSync(subDir)
  fs.writeFileSync(path.join(subDir, Math.random() + ''))
  return baseDir
}

describe('remove', function () {
  beforeEach(function (done) {
    TEST_DIR = path.join(os.tmpdir(), 'fs-extra', 'remove')
    fse.emptyDir(TEST_DIR, done)
  })

  afterEach(function (done) {
    fse.remove(TEST_DIR, done)
  })

  describe('+ remove()', function () {
    it('should delete an empty directory', function (done) {
      assert(fs.existsSync(TEST_DIR))
      fse.remove(TEST_DIR, function (err) {
        assert.ifError(err)
        assert(!fs.existsSync(TEST_DIR))
        done()
      })
    })

    it('should delete a directory full of directories and files', function (done) {
      buildFixtureDir()
      assert(fs.existsSync(TEST_DIR))
      fse.remove(TEST_DIR, function (err) {
        assert.ifError(err)
        assert(!fs.existsSync(TEST_DIR))
        done()
      })
    })

    it('should delete a file', function (done) {
      var file = path.join(TEST_DIR, 'file')
      fs.writeFileSync(file, 'hello')

      assert(fs.existsSync(file))
      fse.remove(file, function (err) {
        assert.ifError(err)
        assert(!fs.existsSync(file))
        done()
      })
    })

    it('should delete without a callback', function (done) {
      var file = path.join(TEST_DIR, 'file')
      fs.writeFileSync(file, 'hello')

      assert(fs.existsSync(file))
      var existsChecker = setInterval(function () {
        fs.exists(file, function (itDoes) {
          if (!itDoes) {
            clearInterval(existsChecker)
            done()
          }
        })
      }, 25)
      fse.remove(file)
    })
  })
})
