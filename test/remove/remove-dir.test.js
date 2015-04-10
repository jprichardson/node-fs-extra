var assert = require('assert')
var fs = require('fs')
var path = require('path')
var os = require('os')
var fse = require(process.cwd())

/* global beforeEach, describe, it */

describe('remove / async / dir', function () {
  var TEST_DIR

  beforeEach(function (done) {
    TEST_DIR = path.join(os.tmpdir(), 'fs-extra', 'remove-alias')
    fse.emptyDir(TEST_DIR, done)
  })

  describe('> when dir does not exist', function () {
    it('should not throw an error', function (done) {
      var someDir = path.join(TEST_DIR, 'some-dir/')
      assert.equal(fs.existsSync(someDir), false)
      fse.remove(someDir, function (err) {
        assert.ifError(err)
        done()
      })
    })
  })
})
