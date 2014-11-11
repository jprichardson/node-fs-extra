var assert = require('assert')
var fs = require('fs')
var path = require('path')
var fse = require('../../')
var testutil = require('testutil')

describe('mkdirp / mkdirp', function() {

})

test('woo', function (t) {
  t.plan(5)
  var x = Math.floor(Math.random() * Math.pow(16,4)).toString(16)
  var y = Math.floor(Math.random() * Math.pow(16,4)).toString(16)
  var z = Math.floor(Math.random() * Math.pow(16,4)).toString(16)
  
  var file = '/tmp/' + [x,y,z].join('/')
  
  mkdirp(file, 0755, function (err) {
    t.ifError(err)
    exists(file, function (ex) {
      t.ok(ex, 'file created')
      fs.stat(file, function (err, stat) {
        t.ifError(err)
        t.equal(stat.mode & 0777, 0755)
        t.ok(stat.isDirectory(), 'target not a directory')
      })
    })
  })
})