var assert = require('assert')
var fs = require('fs')
var path = require('path')
var os = require('os')
var fse = require(process.cwd())

/* global before, describe, it */

var o755 = parseInt('755', 8)

describe('mkdirp / clobber', function () {
  var TEST_DIR
  var ps, file, itw

  before(function (done) {
    TEST_DIR = path.join(os.tmpdir(), 'fs-extra', 'mkdirp-clobber')
    fse.emptyDir(TEST_DIR, function (err) {
      assert.ifError(err)

      ps = ['', TEST_DIR]

      for (var i = 0; i < 15; i++) {
        var dir = Math.floor(Math.random() * Math.pow(16, 4)).toString(16)
        ps.push(dir)
      }

      file = ps.join(path.sep)

      // a file in the way
      itw = ps.slice(0, 3).join(path.sep)

      fs.writeFileSync(itw, 'I AM IN THE WAY, THE TRUTH, AND THE LIGHT.')

      fs.stat(itw, function (er, stat) {
        assert.ifError(er)
        assert.ok(stat && stat.isFile(), 'should be file')
        done()
      })
    })
  })

  it('should clobber', function (done) {
    fse.mkdirp(file, o755, function (err) {
      assert.ok(err)
      assert.equal(err.code, 'ENOTDIR')
      done()
    })
  })
})
