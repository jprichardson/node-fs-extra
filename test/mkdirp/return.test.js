var assert = require('assert')
var fse = require('../../')
var testutil = require('testutil')

/* global describe, it */

describe('mkdirp / return value', function () {
  it('should', function (done) {
    var x = Math.floor(Math.random() * Math.pow(16, 4)).toString(16)
    var y = Math.floor(Math.random() * Math.pow(16, 4)).toString(16)
    var z = Math.floor(Math.random() * Math.pow(16, 4)).toString(16)

    var dir = testutil.createTestDir('fs-extra') + '/'
    var file = dir + [x, y, z].join('/')

    // should return the first dir created.
    // By this point, it would be profoundly surprising if /tmp didn't
    // already exist, since every other test makes things in there.
    fse.mkdirp(file, function (err, made) {
      assert.ifError(err)
      assert.equal(made, dir + x)
      fse.mkdirp(file, function (err, made) {
        assert.ifError(err)
        assert.equal(made, null)
        done()
      })
    })
  })
})
