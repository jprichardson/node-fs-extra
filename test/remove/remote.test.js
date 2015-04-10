var assert = require('assert')
var fs = require('fs')
var path = require('path')
var sr = require('secure-random')
var testutil = require('testutil')
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
  beforeEach(function () {
    TEST_DIR = testutil.createTestDir('fs-extra')
  })

  afterEach(function () {
    if (fs.existsSync(TEST_DIR)) fse.removeSync(TEST_DIR)
  })

  describe('+ removeSync()', function () {
    it('should delete directories and files synchronously', function () {
      assert(fs.existsSync(TEST_DIR))
      fse.removeSync(TEST_DIR)
      assert(!fs.existsSync(TEST_DIR))
    })

    it('should delete an empty directory synchronously', function () {
      assert(fs.existsSync(TEST_DIR))
      fse.removeSync(TEST_DIR)
      assert(!fs.existsSync(TEST_DIR))
    })

    it('should delete a file synchronously', function () {
      var file = path.join(TEST_DIR, 'file')
      fs.writeFileSync(file, 'hello')
      assert(fs.existsSync(file))
      fse.removeSync(file)
      assert(!fs.existsSync(file))
    })
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
