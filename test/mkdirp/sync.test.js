var assert = require('assert')
var fs = require('fs')
var path = require('path')
var fse = require('../../')
var testutil = require('testutil')

/* global describe, it */

var o755 = parseInt('755', 8)
var o777 = parseInt('777', 8)

describe('mkdirp / sync', function () {
  it('should', function (done) {
    var x = Math.floor(Math.random() * Math.pow(16, 4)).toString(16)
    var y = Math.floor(Math.random() * Math.pow(16, 4)).toString(16)
    var z = Math.floor(Math.random() * Math.pow(16, 4)).toString(16)

    var file = testutil.createTestDir('fs-extra') + path.sep + [x, y, z].join(path.sep)

    try {
      fse.mkdirpSync(file, o755)
    } catch (err) {
      assert.fail(err)
    }

    fs.exists(file, function (ex) {
      assert.ok(ex, 'file created')
      fs.stat(file, function (err, stat) {
        assert.ifError(err)
        assert.equal(stat.mode & o777, o755)
        assert.ok(stat.isDirectory(), 'target not a directory')
        done()
      })
    })
  })
})
