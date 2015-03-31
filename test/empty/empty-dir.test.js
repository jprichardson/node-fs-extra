var assert = require('assert')
var fs = require('fs')
var path = require('path')
var os = require('os')
var fse = require(process.cwd())

/* global afterEach, beforeEach, describe, it */

describe('+ emptyDir()', function () {
  var TEST_DIR

  beforeEach(function () {
    TEST_DIR = path.join(os.tmpdir(), 'test-fs-extra', 'empty-dir')
    if (fs.existsSync(TEST_DIR)) {
      fse.removeSync(TEST_DIR)
    }
    fse.ensureDirSync(TEST_DIR)
  })

  afterEach(function () {
    fse.removeSync(TEST_DIR)
  })

  describe('> when directory exists and contains items', function () {
    it('should delete all of the items', function (done) {
      // verify nothing
      assert.equal(fs.readdirSync(TEST_DIR).length, 0)
      fse.ensureFileSync(path.join(TEST_DIR, 'some-file'))
      fse.ensureFileSync(path.join(TEST_DIR, 'some-file-2'))
      fse.ensureDirSync(path.join(TEST_DIR, 'some-dir'))
      assert.equal(fs.readdirSync(TEST_DIR).length, 3)

      fse.emptyDir(TEST_DIR, function (err) {
        assert.ifError(err)
        assert.equal(fs.readdirSync(TEST_DIR).length, 0)
        done()
      })
    })
  })

  describe('> when directory exists and contains no items', function () {
    it('should do nothing', function (done) {
      assert.equal(fs.readdirSync(TEST_DIR).length, 0)
      fse.emptyDir(TEST_DIR, function (err) {
        assert.ifError(err)
        assert.equal(fs.readdirSync(TEST_DIR).length, 0)
        done()
      })
    })
  })

  describe('> when directory does not exist', function () {
    it('should create it', function (done) {
      fse.removeSync(TEST_DIR)
      assert(!fs.existsSync(TEST_DIR))
      fse.emptyDir(TEST_DIR, function (err) {
        assert.ifError(err)
        assert.equal(fs.readdirSync(TEST_DIR).length, 0)
        done()
      })
    })
  })
})
