var assert = require('assert')
var fs = require('fs')
var path = require('path')
var fse = require('../../')
var testutil = require('testutil')

describe('mkdirp / sync', function() {
  it('should', function (done) {
    var x = Math.floor(Math.random() * Math.pow(16,4)).toString(16)
    var y = Math.floor(Math.random() * Math.pow(16,4)).toString(16)
    var z = Math.floor(Math.random() * Math.pow(16,4)).toString(16)

    var file = testutil.createTestDir('fs-extra') + '/' + [x,y,z].join('/')

    try {
      fse.mkdirpSync(file, 0755)
    } catch (err) {
      assert.fail(err)
    }

    fs.exists(file, function (ex) {
      assert.ok(ex, 'file created')
      fs.stat(file, function (err, stat) {
        assert.ifError(err)
        assert.equal(stat.mode & 0777, 0755)
        assert.ok(stat.isDirectory(), 'target not a directory')
        done()
      })
    })
  })
})
