var assert = require('assert')
var fs = require('fs')
var path = require('path')
var os = require('os')
var fse = require('../../')

/* global afterEach, beforeEach, describe, it */

var o755 = parseInt('755', 8)
var o744 = parseInt('744', 8)
var o777 = parseInt('777', 8)

describe('mkdirp / chmod', function () {
  var TEST_DIR
  var TEST_SUBDIR

  beforeEach(function (done) {
    var ps = []
    for (var i = 0; i < 15; i++) {
      var dir = Math.floor(Math.random() * Math.pow(16, 4)).toString(16)
      ps.push(dir)
    }

    TEST_SUBDIR = ps.join('/')

    TEST_DIR = path.join(os.tmpdir(), 'fs-extra', 'mkdirp-chmod')
    TEST_SUBDIR = path.join(TEST_DIR, TEST_SUBDIR)

    fse.emptyDir(TEST_DIR, done)
  })

  afterEach(function (done) {
    fse.remove(TEST_DIR, done)
  })

  it('chmod-pre', function (done) {
    var mode = o744
    fse.mkdirp(TEST_SUBDIR, mode, function (er) {
      assert.ifError(er, 'should not error')
      fs.stat(TEST_SUBDIR, function (er, stat) {
        assert.ifError(er, 'should exist')
        assert.ok(stat && stat.isDirectory(), 'should be directory')
        assert.equal(stat && stat.mode & o777, mode, 'should be 0744')
        done()
      })
    })
  })

  it('chmod', function (done) {
    var mode = o755
    fse.mkdirp(TEST_SUBDIR, mode, function (er) {
      assert.ifError(er, 'should not error')
      fs.stat(TEST_SUBDIR, function (er, stat) {
        assert.ifError(er, 'should exist')
        assert.ok(stat && stat.isDirectory(), 'should be directory')
        done()
      })
    })
  })
})
