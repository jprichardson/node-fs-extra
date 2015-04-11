var assert = require('assert')
var fs = require('fs')
var path = require('path')
var os = require('os')
var fse = require('../')

/* global afterEach, beforeEach, describe, it */

describe('fs-extra', function () {
  var TEST_DIR

  beforeEach(function (done) {
    TEST_DIR = path.join(os.tmpdir(), 'fs-extra', 'mkdir')
    fse.emptyDir(TEST_DIR, done)
  })

  afterEach(function (done) {
    fse.remove(TEST_DIR, done)
  })

  describe('+ mkdirs()', function () {
    it('should make the directory', function (done) {
      var dir = path.join(TEST_DIR, 'tmp-' + Date.now() + Math.random())

      assert(!fs.existsSync(dir))

      fse.mkdirs(dir, function (err) {
        assert.ifError(err)
        assert(fs.existsSync(dir))
        done()
      })
    })

    it('should make the entire directory path', function (done) {
      var dir = path.join(TEST_DIR, 'tmp-' + Date.now() + Math.random())
      var newDir = path.join(TEST_DIR, 'dfdf', 'ffff', 'aaa')

      assert(!fs.existsSync(dir))

      fse.mkdirs(newDir, function (err) {
        assert.ifError(err)
        assert(fs.existsSync(newDir))
        done()
      })
    })
  })

  describe('+ mkdirsSync()', function () {
    it('should make the directory', function (done) {
      var dir = path.join(TEST_DIR, 'tmp-' + Date.now() + Math.random())

      assert(!fs.existsSync(dir))
      fse.mkdirsSync(dir)
      assert(fs.existsSync(dir))

      done()
    })

    it('should make the entire directory path', function (done) {
      var dir = path.join(TEST_DIR, 'tmp-' + Date.now() + Math.random())
      var newDir = path.join(dir, 'dfdf', 'ffff', 'aaa')

      assert(!fs.existsSync(newDir))
      fse.mkdirsSync(newDir)
      assert(fs.existsSync(newDir))

      done()
    })
  })
})
