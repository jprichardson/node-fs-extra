var assert = require('assert')
var fs = require('fs')
var path = require('path')
var os = require('os')
var fse = require(process.cwd())

/* global beforeEach, describe, it */

describe('remove / delete alias', function () {
  var TEST_DIR

  beforeEach(function (done) {
    TEST_DIR = path.join(os.tmpdir(), 'fs-extra', 'remove-alias')
    fse.emptyDir(TEST_DIR, done)
  })

  describe('+ delete()', function () {
    it('should delete an empty directory', function (done) {
      assert(fs.existsSync(TEST_DIR))
      fse.delete(TEST_DIR, function (err) {
        assert.ifError(err)
        assert(!fs.existsSync(TEST_DIR))
        done()
      })
    })
  })

  describe('+ deleteSync()', function () {
    it('should delete directories and files synchronously', function () {
      assert(fs.existsSync(TEST_DIR))
      fse.deleteSync(TEST_DIR)
      assert(!fs.existsSync(TEST_DIR))
    })
  })
})
