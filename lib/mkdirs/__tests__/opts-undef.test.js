var assert = require('assert')
var fs = require('fs')
var path = require('path')
var os = require('os')
var fse = require(process.cwd())
var mkdirs = require('../mkdirs')

/* global beforeEach, describe, it */

describe('mkdirs / opts-undef', function () {
  var TEST_DIR

  beforeEach(function (done) {
    TEST_DIR = path.join(os.tmpdir(), 'fs-extra', 'mkdirs')
    fse.emptyDir(TEST_DIR, done)
  })

  // https://github.com/substack/node-mkdirp/issues/45
  it('should not hang', function (done) {
    var newDir = path.join(TEST_DIR, 'doest', 'not', 'exist')
    assert(!fs.existsSync(newDir))

    mkdirs(newDir, undefined, function (err) {
      assert.ifError(err)
      assert(fs.existsSync(newDir))
      done()
    })
  })
})
