var assert = require('assert')
var fs = require('fs')
var path = require('path')
var fse = require('../../')

/* global describe, it */

var o755 = parseInt('755', 8)

describe('mkdirp / root', function () {
  it('should', function (done) {
    // '/' on unix, 'c:/' on windows.
    var file = path.resolve(path.sep)

    fse.mkdirp(file, o755, function (err) {
      if (err) throw err
      fs.stat(file, function (er, stat) {
        if (er) throw er
        assert.ok(stat.isDirectory(), 'target is a directory')
        done()
      })
    })
  })
})
