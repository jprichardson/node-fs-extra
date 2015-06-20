var assert = require('assert')
var fs = require('fs')
var os = require('os')
var path = require('path')
var fse = require(process.cwd())

/* global beforeEach, describe, it */

describe('remove/sync', function () {
  var TEST_DIR

  beforeEach(function (done) {
    TEST_DIR = path.join(os.tmpdir(), 'fs-extra', 'remove-sync')
    fse.emptyDir(TEST_DIR, done)
  })

  describe('+ removeSync()', function () {
    it('should delete directories and files synchronously', function () {
      assert(fs.existsSync(TEST_DIR))
      fs.writeFileSync(path.join(TEST_DIR, 'somefile'), 'somedata')
      fse.removeSync(TEST_DIR)
      assert(!fs.existsSync(TEST_DIR))
    })

    it('should delete an empty directory synchronously', function () {
      assert(fs.existsSync(TEST_DIR))
      fse.removeSync(TEST_DIR)
      assert(!fs.existsSync(TEST_DIR))
    })
  })
})
