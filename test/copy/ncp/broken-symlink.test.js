var assert = require('assert')
var fs = require('fs')
var path = require('path')
var os = require('os')
var fse = require(process.cwd())
var ncp = require('../../../lib/copy/_copy').ncp

/* global afterEach, beforeEach, describe, it */

describe('ncp broken symlink', function () {
  var TEST_DIR = path.join(os.tmpdir(), 'fs-extra', 'ncp-broken-symlinks')
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

  it('should copy broken symlinks by default', function (done) {
    ncp(src, out, function (err) {
      if (err) return done(err)
      assert.equal(fs.readlinkSync(path.join(out, 'broken-symlink')), path.join(src, 'does-not-exist'))
      done()
    })
  })

  it('should return an error when dereference=true', function (done) {
    ncp(src, out, {dereference: true}, function (err) {
      assert.equal(err.length, 1)
      assert.equal(err[0].code, 'ENOENT')
      done()
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
