var assert = require('assert')
var fs = require('fs')
var path = require('path')
var os = require('os')
var fse = require(process.cwd())

/* global afterEach, beforeEach, describe, it */

describe('jsonfile-integration', function () {
  var TEST_DIR

  beforeEach(function (done) {
    TEST_DIR = path.join(os.tmpdir(), 'fs-extra', 'json')
    fse.emptyDir(TEST_DIR, done)
  })

  afterEach(function (done) {
    fse.remove(TEST_DIR, done)
  })

  describe('+ writeJsonSync / spaces', function () {
    it('should read a file and parse the json', function () {
      var obj1 = {
        firstName: 'JP',
        lastName: 'Richardson'
      }

      var oldSpaces = fse.jsonfile.spaces
      fse.jsonfile.spaces = 4

      var file = path.join(TEST_DIR, 'file.json')
      fse.writeJsonSync(file, obj1)
      var data = fs.readFileSync(file, 'utf8')
      assert.strictEqual(data, JSON.stringify(obj1, null, 4) + '\n')

      fse.jsonfile.spaces = oldSpaces
    })
  })
})
