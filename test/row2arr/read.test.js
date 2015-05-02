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

  describe('+ convert to array', function () {
    it('should read a file and convert row to arr', function (done) {
      var text = "aaaa\nbbbb\ncccc\ndddd"

      var file = path.join(TEST_DIR, 'file.txt')
      fs.writeFileSync(file, text)

      fse.readRow2Arr(file, function (err, arr) {
        assert.ifError(err)
        assert.strictEqual(arr[0], "aaaa")
        assert.strictEqual(arr[1], "bbbb")
        assert.strictEqual(arr[2], "cccc")

        done()
      })
    })

    it('should read a file and convert row to arr by sync', function () {
      var text = "aaaa\nbbbb\ncccc\ndddd"

      var file = path.join(TEST_DIR, 'file.txt')
      fs.writeFileSync(file, text)

      var rowarr = fse.readRow2ArrSync(file)

      assert.strictEqual(rowarr[0], "aaaa")
      assert.strictEqual(rowarr[1], "bbbb")
      assert.strictEqual(rowarr[2], "cccc")
    })

    it('should be ignore comment line', function () {
      var text = "aaaa\nbbbb\ncccc\n# ignore line\ndddd"

      var file = path.join(TEST_DIR, 'file.txt')
      fs.writeFileSync(file, text)

      var rowarr = fse.readRow2ArrSync(file)

      assert.strictEqual(rowarr[0], "aaaa")
      assert.strictEqual(rowarr[1], "bbbb")
      assert.strictEqual(rowarr[2], "cccc")
      assert.strictEqual(rowarr[3], "dddd")
    })
  })
})
