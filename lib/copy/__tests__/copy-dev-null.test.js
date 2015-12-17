var assert = require('assert')
var os = require('os')
var path = require('path')
var fse = require('../../')

/* global afterEach, beforeEach, describe, it */

var TEST_DIR = ''

describe.skip('fs-extra', function () {
  beforeEach(function (done) {
    TEST_DIR = path.join(os.tmpdir(), 'test', 'fs-extra', 'copy-dev-null')
    fse.emptyDir(TEST_DIR, done)
  })

  afterEach(function (done) {
    fse.remove(TEST_DIR, done)
  })

  describe('+ copy()', function () {
    it('should error', function (done) {
      // no /dev/null on windows
      if (process.platform === 'win32') return done()
      var tmpFile = path.join(TEST_DIR, 'foo')
      fse.copy('/dev/null', tmpFile, function (err) {
        assert(err)
      })
    })
  })
})
