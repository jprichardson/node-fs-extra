var assert = require('assert')
var fs = require('fs')
var path = require('path')
var mkdirp = require('../../').mkdirp

var ps = [ '', 'tmp' ]

for (var i = 0; i < 25; i++) {
  var dir = Math.floor(Math.random() * Math.pow(16,4)).toString(16)
  ps.push(dir)
}

var file = ps.join('/')

describe('mkdirp / chmod', function() {
  it('chmod-pre', function (done) {
    var mode = 0744
    mkdirp(file, mode, function (er) {
      t.ifError(er, 'should not error')
      fs.stat(file, function (er, stat) {
        t.ifError(er, 'should exist')
        t.ok(stat && stat.isDirectory(), 'should be directory')
        t.equal(stat && stat.mode & 0777, mode, 'should be 0744')
        t.end()
      })
    })
  })

  it('chmod', function (done) {
    var mode = 0755
    mkdirp(file, mode, function (er) {
      t.ifError(er, 'should not error')
      fs.stat(file, function (er, stat) {
        t.ifError(er, 'should exist')
        t.ok(stat && stat.isDirectory(), 'should be directory')
        t.end()
      })
    })
  })
})

