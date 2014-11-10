var assert = require('assert')
var fs = require('fs')
var path = require('path')
var fse = require('../../')
var testutil = require('testutil')

describe('mkdirp / clobber', function() {
  var ps, file, itw

  before(function(done) {
    ps = [ '', testutil.createTestDir('fs-extra')]

    for (var i = 0; i < 25; i++) {
      var dir = Math.floor(Math.random() * Math.pow(16,4)).toString(16)
      ps.push(dir)
    }

    file = ps.join('/')

    // a file in the way
    itw = ps.slice(0, 3).join('/')

    console.error("about to write to "+itw)
    fs.writeFileSync(itw, 'I AM IN THE WAY, THE TRUTH, AND THE LIGHT.')

    fs.stat(itw, function (er, stat) {
      assert.ifError(er)
      assert.ok(stat && stat.isFile(), 'should be file')
      done()
    })
  })

  it('should clobber', function (done) {
    fse.mkdirp(file, 0755, function (err) {
      assert.ok(err)
      assert.equal(err.code, 'ENOTDIR')
      done()
    })
  })
})

