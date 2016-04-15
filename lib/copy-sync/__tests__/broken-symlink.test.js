var assert = require('assert')
var fs = require('fs')
var path = require('path')
var os = require('os')
var fse = require(process.cwd())
var copySync = require('../copy-sync')

/* global afterEach, beforeEach, describe, it */

describe('copy-sync / broken symlink', function () {
  var TEST_DIR = path.join(os.tmpdir(), 'fs-extra', 'copy-sync-broken-symlinks')
  var src = path.join(TEST_DIR, 'src')
  var out = path.join(TEST_DIR, 'out')

  beforeEach(function (done) {
    fse.emptyDir(TEST_DIR, function (err) {
      assert.ifError(err)
      createFixtures(src, done)
    })
  })

  afterEach(function (done) {
    fse.remove(TEST_DIR, done)
  })

  it('should copy broken symlinks by default', function () {
    assert.doesNotThrow(function () {
      copySync(src, out)
    })

    assert.equal(fs.readlinkSync(path.join(out, 'broken-symlink')), path.join(src, 'does-not-exist'))
  })

  it('should throw an error when dereference=true', function () {
    assert.throws(function () {
      copySync(src, out, {dereference: true})
    }, function (err) {
      return err.code === 'ENOENT'
    })
  })
})

function createFixtures (srcDir, callback) {
  fs.mkdir(srcDir, function (err) {
    if (err) return callback(err)

    try {
      var brokenFile = path.join(srcDir, 'does-not-exist')
      var brokenFileLink = path.join(srcDir, 'broken-symlink')
      fs.writeFileSync(brokenFile, 'does not matter')
      fs.symlinkSync(brokenFile, brokenFileLink, 'file')
    } catch (err) {
      callback(err)
    }

    // break the symlink now
    fse.remove(brokenFile, callback)
  })
}
