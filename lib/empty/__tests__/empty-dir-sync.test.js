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

  afterEach(function (done) {
    fse.remove(TEST_DIR, done)
  })

  describe('> when directory exists and contains items', function () {
    it('should delete all of the items', function () {
      // verify nothing
      assert.equal(fs.readdirSync(TEST_DIR).length, 0)
      fse.ensureFileSync(path.join(TEST_DIR, 'some-file'))
      fse.ensureFileSync(path.join(TEST_DIR, 'some-file-2'))
      fse.ensureDirSync(path.join(TEST_DIR, 'some-dir'))
      assert.equal(fs.readdirSync(TEST_DIR).length, 3)

      fse.emptyDirSync(TEST_DIR)
      assert.equal(fs.readdirSync(TEST_DIR).length, 0)
    })
  })

  describe('> when directory exists and contains no items', function () {
    it('should do nothing', function () {
      assert.equal(fs.readdirSync(TEST_DIR).length, 0)
      fse.emptyDirSync(TEST_DIR)
      assert.equal(fs.readdirSync(TEST_DIR).length, 0)
    })
  })

  describe('> when directory does not exist', function () {
    it('should create it', function () {
      fse.removeSync(TEST_DIR)
      assert(!fs.existsSync(TEST_DIR))
      fse.emptyDirSync(TEST_DIR)
      assert.equal(fs.readdirSync(TEST_DIR).length, 0)
    })
  })
})
