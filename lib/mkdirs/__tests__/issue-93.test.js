var assert = require('assert')
var path = require('path')
var os = require('os')
var fse = require(process.cwd())

/* global before, describe, it */

describe('mkdirp: issue-93, win32, when drive does not exist, it should return a cleaner error', function () {
  var TEST_DIR

  // only seems to be an issue on Windows.
  if (process.platform !== 'win32') return

  before(function (done) {
    TEST_DIR = path.join(os.tmpdir(), 'tests', 'fs-extra', 'mkdirp-issue-93')
    fse.emptyDir(TEST_DIR, function (err) {
      assert.ifError(err)
      done()
    })
  })

  it('should return a cleaner error than inifinite loop, stack crash', function (done) {
    var file = 'R:\\afasd\\afaff\\fdfd' // hopefully drive 'r' does not exist on appveyor
    fse.mkdirp(file, function (err) {
      assert.strictEqual(err.code, 'ENOENT')

      try {
        fse.mkdirsSync(file)
      } catch (err) {
        assert.strictEqual(err.code, 'ENOENT')
      }

      done()
    })
  })
})
