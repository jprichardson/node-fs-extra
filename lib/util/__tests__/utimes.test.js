var assert = require('assert')
var path = require('path')
var os = require('os')
var fse = require(process.cwd())
var semver = require('semver')
var utimes = require('../utimes')

/* global beforeEach, describe, it */

describe('utimes', function () {
  var TEST_DIR

  // ignore Node.js v0.10.x
  if (semver.lt(process.version, '0.11.0')) return

  beforeEach(function (done) {
    TEST_DIR = path.join(os.tmpdir(), 'fs-extra', 'utimes')
    fse.emptyDir(TEST_DIR, done)
  })

  describe('hasMillisRes()', function () {
    it('should return a boolean indicating whether it has support', function () {
      var res = utimes.hasMillisRes()
      assert.equal(typeof res, 'boolean')

      // HFS => false
      if (process.platform === 'darwin') {
        assert.equal(res, false)
      }

      // does anyone use FAT anymore?
      if (process.platform === 'win32') {
        assert.equal(res, true)
      }

      // this would fail if ext2/ext3
      if (process.platform === 'linux') {
        assert.equal(res, true)
      }
    })
  })
})
