var assert = require('assert')
var fs = require('fs')
var fse = require(process.cwd())
var testutil = require('testutil')

/* global beforeEach, describe, it */

var o755 = parseInt('755', 8)
var o777 = parseInt('777', 8)

describe('mkdirp / mkdirp', function () {
  var TEST_DIR

  beforeEach(function () {
    TEST_DIR = testutil.createTestDir('fs-extra')
  })

  it('woo', function (done) {
    var x = Math.floor(Math.random() * Math.pow(16, 4)).toString(16)
    var y = Math.floor(Math.random() * Math.pow(16, 4)).toString(16)
    var z = Math.floor(Math.random() * Math.pow(16, 4)).toString(16)

    var file = TEST_DIR + [x, y, z].join('/')

    fse.mkdirp(file, o755, function (err) {
      assert.ifError(err)
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
})
