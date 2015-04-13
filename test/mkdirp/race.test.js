var assert = require('assert')
var fs = require('fs')
var path = require('path')
var fse = require('../../')
var testutil = require('testutil')

/* global describe, it */

var o755 = parseInt('755', 8)
var o777 = parseInt('777', 8)

describe('mkdirp / race', function () {
  it('race', function (done) {
    var ps = ['', testutil.createTestDir('fs-extra') ]

    for (var i = 0; i < 25; i++) {
      var dir = Math.floor(Math.random() * Math.pow(16, 4)).toString(16)
      ps.push(dir)
    }
    var file = ps.join(path.sep)

    var res = 2
    mk(file, function () {
      if (--res === 0) done()
    })

    mk(file, function () {
      if (--res === 0) done()
    })

    function mk (file, cb) {
      fse.mkdirp(file, o755, function (err) {
        assert.ifError(err)
        fs.exists(file, function (ex) {
          assert.ok(ex, 'file created')
          fs.stat(file, function (err, stat) {
            assert.ifError(err)
            assert.equal(stat.mode & o777, o755)
            assert.ok(stat.isDirectory(), 'target not a directory')
            if (cb) cb()
          })
        })
      })
    }
  })
})
