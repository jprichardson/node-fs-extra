var assert = require('assert')
var fs = require('fs')
var path = require('path')
var testutil = require('../_lib/util')
var fse = require('../../')

/* global afterEach, beforeEach, describe, it */

var TEST_DIR = ''
var oct777 = parseInt('777', 8)

describe('mkdirp', function () {
  var _rndDir

  beforeEach(function () {
    TEST_DIR = testutil.createTestDir()
    TEST_DIR = path.join(TEST_DIR, 'mkdirp')

    // verify clean directory
    assert(!fs.existsSync(TEST_DIR))
    fs.mkdirSync(TEST_DIR)

    // for actual tests
    var x = Math.floor(Math.random() * Math.pow(16, 6)).toString(16)
    var y = Math.floor(Math.random() * Math.pow(16, 6)).toString(16)
    var z = Math.floor(Math.random() * Math.pow(16, 6)).toString(16)

    _rndDir = path.join(TEST_DIR, [x, y, z].join(path.sep))

    // just to be safe, although unnecessary
    assert(!fs.existsSync(_rndDir))
  })

  afterEach(function (done) {
    fse.remove(TEST_DIR, done)
  })

  describe('umask', function () {
    describe('async', function () {
      it('should have proper umask', function (done) {
        fse.mkdirp(_rndDir, function (err) {
          assert.ifError(err)
          fs.exists(_rndDir, function (ex) {
            assert.ok(ex, 'file created')
            fs.stat(_rndDir, function (err, stat) {
              assert.ifError(err)
              assert.equal(stat.mode & oct777, oct777 & (~process.umask()))
              assert.ok(stat.isDirectory(), 'target not a directory')
              done()
            })
          })
        })
      })
    })

    describe('sync', function () {
      it('should have proper umask', function (done) {
        try {
          fse.mkdirpSync(_rndDir)
        } catch (err) {
          return done(err)
        }

        fs.exists(_rndDir, function (ex) {
          assert.ok(ex, 'file created')
          fs.stat(_rndDir, function (err, stat) {
            assert.ifError(err)
            assert.equal(stat.mode & oct777, (oct777 & (~process.umask())))
            assert.ok(stat.isDirectory(), 'target not a directory')
            done()
          })
        })
      })
    })
  })
})
