var assert = require('assert')
var fs = require('fs')
var path = require('path')
var fse = require('../../')
var testutil = require('testutil')

describe('mkdirp / root', function () {

  it('should', function(done) {
    // '/' on unix, 'c:/' on windows.
    var file = path.resolve('/')

    fse.mkdirp(file, 0755, function (err) {
      if (err) throw err
      fs.stat(file, function (er, stat) {
        if (er) throw er
        assert.ok(stat.isDirectory(), 'target is a directory')
        done()
      })
    })
  })
})