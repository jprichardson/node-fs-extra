var assert = require('assert')
var fs = require('fs')
var path = require('path')
var fse = require('../../')

/* global describe, it */

var o755 = parseInt('755', 8)

describe('mkdirp / root', function () {
  // '/' on unix, 'c:/' on windows.
  var dir = path.normalize(path.resolve(path.sep)).toLowerCase()

  // if not 'c:\\' or 'd:\\', it's probably a network mounted drive, this fails then. TODO: investigate
  if (process.platform === 'win32' && (dir.indexOf('c:\\') === -1) && (dir.indexOf('d:\\') === -1)) return

  it('should', function (done) {
    fse.mkdirp(dir, o755, function (err) {
      if (err) throw err
      fs.stat(dir, function (er, stat) {
        if (er) throw er
        assert.ok(stat.isDirectory(), 'target is a directory')
        done()
      })
    })
  })
})
