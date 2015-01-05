return // skip for now

var assert = require('assert')
var fs = require('fs')
var path = require('path')
var fse = require('../../')
var testutil = require('testutil')
var mockfs = require('mock-fs')

describe('mkdirp / opts_fs', function() {
  it('opts.fs', function (done) {    
    var x = Math.floor(Math.random() * Math.pow(16,4)).toString(16)
    var y = Math.floor(Math.random() * Math.pow(16,4)).toString(16)
    var z = Math.floor(Math.random() * Math.pow(16,4)).toString(16)
    
    var file = '/beep/boop/' + [x,y,z].join('/')
    var xfs = mockfs.fs()
    
    fse.mkdirpSync(file, { fs: xfs, mode: 0755 })
    xfs.exists(file, function (ex) {
      assert.ok(ex, 'created file')
      xfs.stat(file, function (err, stat) {
        assert.ifError(err)
        assert.equal(stat.mode & 0777, 0755)
        assert.ok(stat.isDirectory(), 'target not a directory')
        done()
      })
    })  
  })
})
