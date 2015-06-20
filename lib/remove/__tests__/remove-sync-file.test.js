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
    it('should delete a file synchronously', function () {
      var file = path.join(TEST_DIR, 'file')
      fs.writeFileSync(file, 'hello')
      assert(fs.existsSync(file))
      fse.removeSync(file)
      assert(!fs.existsSync(file))
    })
  })
})
