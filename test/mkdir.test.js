var assert = require('assert')
var fs = require('fs')
var path = require('path')
var testutil = require('testutil')
var fse = require('../')

/* global afterEach, beforeEach, describe, it */

var TEST_DIR = ''

describe('fs-extra', function () {
  beforeEach(function () {
    TEST_DIR = testutil.createTestDir('fs-extra')
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
