var assert = require('assert')
var path = require('path')
var fse = require('../../')
var testutil = require('testutil')

/* global describe, it */

describe('mkdirp / return value', function () {
  it('should', function () {
    var x = Math.floor(Math.random() * Math.pow(16, 4)).toString(16)
    var y = Math.floor(Math.random() * Math.pow(16, 4)).toString(16)
    var z = Math.floor(Math.random() * Math.pow(16, 4)).toString(16)

    var dir = testutil.createTestDir('fs-extra') + path.sep
    var file = dir + [x, y, z].join(path.sep)

    // should return the first dir created.
    // By this point, it would be profoundly surprising if /tmp didn't
    // already exist, since every other test makes things in there.
    // Note that this will throw on failure, which will fail the test.
    var made = fse.mkdirpSync(file)
    assert.equal(made, dir + x)

    // making the same file again should have no effect.
    made = fse.mkdirpSync(file)
    assert.equal(made, null)
  })
})
