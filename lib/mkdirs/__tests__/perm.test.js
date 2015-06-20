var assert = require('assert')
var fs = require('fs')
var path = require('path')
var os = require('os')
var fse = require('../../')

/* global afterEach, beforeEach, describe, it */

var o755 = parseInt('755', 8)
var o777 = parseInt('777', 8)
var o666 = parseInt('666', 8)

describe('mkdirp / perm', function () {
  var TEST_DIR

  beforeEach(function (done) {
    TEST_DIR = path.join(os.tmpdir(), 'fs-extra', 'mkdirp-perm')
    fse.emptyDir(TEST_DIR, done)
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

          if (os.platform().indexOf('win') === 0) {
            assert.equal(stat.mode & o777, o666)
          } else {
            assert.equal(stat.mode & o777, o755)
          }

          assert.ok(stat.isDirectory(), 'target not a directory')
          done()
        })
      })
    })
  })

  it('async root perm', function (done) {
    fse.mkdirp(path.join(os.tmpdir(), 'tmp'), o755, function (err) {
      assert.ifError(err)
      done()
    })
  })
})
