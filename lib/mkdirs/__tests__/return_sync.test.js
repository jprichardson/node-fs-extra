var assert = require('assert')
var os = require('os')
var path = require('path')
var fse = require('../../')

/* global afterEach, beforeEach, describe, it */

describe('mkdirp / return value', function () {
  var TEST_DIR

  beforeEach(function (done) {
    TEST_DIR = path.join(os.tmpdir(), 'fs-extra', 'mkdirp-return')
    fse.emptyDir(TEST_DIR, done)
  })

  afterEach(function (done) {
    fse.remove(TEST_DIR, done)
  })

  it('should', function () {
    var x = Math.floor(Math.random() * Math.pow(16, 4)).toString(16)
    var y = Math.floor(Math.random() * Math.pow(16, 4)).toString(16)
    var z = Math.floor(Math.random() * Math.pow(16, 4)).toString(16)

    var dir = TEST_DIR + path.sep
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
