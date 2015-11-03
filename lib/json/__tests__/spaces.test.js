var assert = require('assert')
var fs = require('fs')
var path = require('path')
var os = require('os')
var fse = require('../../')

/* global afterEach, beforeEach, describe, it */
// trinity: mocha

describe('json spaces', function () {
  var TEST_DIR

  beforeEach(function (done) {
    TEST_DIR = path.join(os.tmpdir(), 'fs-extra', 'json-spaces')
    fse.emptyDir(TEST_DIR, done)
  })

  afterEach(function (done) {
    fse.remove(TEST_DIR, done)
  })

  it('should write out the file with appropriate spacing (2)', function () {
    fse.spaces = 2 // for legacy compatibility
    assert.strictEqual(fse.spaces, 2)

    var tempFile = path.join(TEST_DIR, 'temp.json')

    var data = { first: 'JP', last: 'Richardson' }
    fse.outputJsonSync(tempFile, data)

    var dataRead = fs.readFileSync(tempFile, 'utf8')
    assert.strictEqual(dataRead, JSON.stringify(data, null, 2) + '\n')
  })
})
