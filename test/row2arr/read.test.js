var assert = require('assert')
var fs = require('fs')
var path = require('path')
var os = require('os')
var fse = require(process.cwd())

/* global afterEach, beforeEach, describe, it */

describe('read', function () {
  var TEST_DIR

  beforeEach(function (done) {
    TEST_DIR = path.join(os.tmpdir(), 'fs-extra', 'read-json')
    fse.emptyDir(TEST_DIR, done)
  })

  afterEach(function (done) {
    fse.remove(TEST_DIR, done)
  })

  describe('+ readJSON', function () {
    it('should read a file and parse the json', function (done) {
      var text = "aaaa\nbbbb\ncccc\ndddd"

      var file = path.join(TEST_DIR, 'file.txt')
      fs.writeFileSync(file, text)

      fse.readRow2Arr(file, function (err, arr) {
        assert.ifError(err)
        assert.strictEqual(arr[0], "aaaa")
        assert.strictEqual(arr[1], "bbbb")

        done()
      })
    })
  })
})
