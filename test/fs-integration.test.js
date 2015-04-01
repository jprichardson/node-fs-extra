var assert = require('assert')
var path = require('path')
var fse = require('../')
var testutil = require('testutil')

/* global afterEach, beforeEach, describe, it */

var TEST_DIR

describe('native fs', function () {
  beforeEach(function () {
    TEST_DIR = testutil.createTestDir('fs-extra')
  })

  afterEach(function (done) {
    fse.remove(TEST_DIR, done)
  })

  it('should use native fs methods', function () {
    var file = path.join(TEST_DIR, 'write.txt')
    fse.writeFileSync(file, 'hello')
    var data = fse.readFileSync(file, 'utf8')
    assert.equal(data, 'hello')
  })
})
