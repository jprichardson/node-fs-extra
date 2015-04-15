var assert = require('assert')
var fs = require('fs')
var path = require('path')
var os = require('os')
var fse = require(process.cwd())

/* global afterEach, beforeEach, describe, it */

var o755 = parseInt('755', 8)
var o777 = parseInt('777', 8)

describe('mkdirp / relative', function () {
  var TEST_DIR, file

  beforeEach(function (done) {
    TEST_DIR = path.join(os.tmpdir(), 'fs-extra', 'mkdirp-relative')
    fse.emptyDir(TEST_DIR, function (err) {
      assert.ifError(err)

      var x = Math.floor(Math.random() * Math.pow(16, 4)).toString(16)
      var y = Math.floor(Math.random() * Math.pow(16, 4)).toString(16)
      var z = Math.floor(Math.random() * Math.pow(16, 4)).toString(16)

      // relative path
      file = path.join(x, y, z)

      done()
    })
  })

  afterEach(function (done) {
    fse.remove(TEST_DIR, done)
  })

  it('should make the directory with relative path', function (done) {
    var cwd = process.cwd()
    process.chdir(TEST_DIR)

    fse.mkdirp(file, o755, function (err) {
      assert.ifError(err)
      fs.exists(file, function (ex) {
        assert.ok(ex, 'file created')
        fs.stat(file, function (err, stat) {
          assert.ifError(err)
          process.chdir(cwd)
          assert.equal(stat.mode & o777, o755)
          assert.ok(stat.isDirectory(), 'target not a directory')
          done()
        })
      })
    })
  })
})
