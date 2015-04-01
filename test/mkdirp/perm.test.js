var assert = require('assert')
var fs = require('fs')
var path = require('path')
var fse = require('../../')
var testutil = require('testutil')

/* global afterEach, beforeEach, describe, it */

var o755 = parseInt('755', 8)
var o777 = parseInt('777', 8)

describe('mkdirp / perm', function () {
  var TEST_DIR

  beforeEach(function () {
    TEST_DIR = testutil.createTestDir('fs-extra')
  })

  afterEach(function (done) {
    fse.remove(TEST_DIR, done)
  })

  it('async perm', function (done) {
    var file = path.join(TEST_DIR, (Math.random() * (1 << 30)).toString(16))

    fse.mkdirp(file, o755, function (err) {
      assert.ifError(err)
      fs.exists(file, function (ex) {
        assert.ok(ex, 'file created')
        fs.stat(file, function (err, stat) {
          assert.ifError(err)
          assert.equal(stat.mode & o777, o755)
          assert.ok(stat.isDirectory(), 'target not a directory')
          done()
        })
      })
    })
  })

  it('async root perm', function (done) {
    fse.mkdirp('/tmp', o755, function (err) {
      assert.ifError(err)
      done()
    })
  })
})
