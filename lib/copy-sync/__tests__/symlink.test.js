var assert = require('assert')
var fs = require('fs')
var path = require('path')
var os = require('os')
var fse = require(process.cwd())
var copySync = require('../copy-sync')

/* global afterEach, beforeEach, describe, it */

describe('copy-sync / symlink', function () {
  var TEST_DIR = path.join(os.tmpdir(), 'fs-extra', 'copy-sync-symlinks')
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

  it('copies symlinks by default', function () {
    assert.doesNotThrow(function () {
      copySync(src, out)
    })

    assert.equal(fs.readlinkSync(path.join(out, 'file-symlink')), path.join(src, 'foo'))
    assert.equal(fs.readlinkSync(path.join(out, 'dir-symlink')), path.join(src, 'dir'))
  })

  it('copies file contents when dereference=true', function () {
    try {
      copySync(src, out, {dereference: true})
    } catch (err) {
      assert.ifError(err)
    }

    var fileSymlinkPath = path.join(out, 'file-symlink')
    assert.ok(fs.lstatSync(fileSymlinkPath).isFile())
    assert.equal(fs.readFileSync(fileSymlinkPath), 'foo contents')

    var dirSymlinkPath = path.join(out, 'dir-symlink')
    assert.ok(fs.lstatSync(dirSymlinkPath).isDirectory())
    assert.deepEqual(fs.readdirSync(dirSymlinkPath), ['bar'])
  })
})

function createFixtures (srcDir, callback) {
  fs.mkdir(srcDir, function (err) {
    if (err) return callback(err)

    // note: third parameter in symlinkSync is type e.g. 'file' or 'dir'
    // https://nodejs.org/api/fs.html#fs_fs_symlink_srcpath_dstpath_type_callback
    try {
      var fooFile = path.join(srcDir, 'foo')
      var fooFileLink = path.join(srcDir, 'file-symlink')
      fs.writeFileSync(fooFile, 'foo contents')
      fs.symlinkSync(fooFile, fooFileLink, 'file')

      var dir = path.join(srcDir, 'dir')
      var dirFile = path.join(dir, 'bar')
      var dirLink = path.join(srcDir, 'dir-symlink')
      fs.mkdirSync(dir)
      fs.writeFileSync(dirFile, 'bar contents')
      fs.symlinkSync(dir, dirLink, 'dir')
    } catch (err) {
      callback(err)
    }

    callback()
  })
}
