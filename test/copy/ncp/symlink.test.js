var assert = require('assert')
var fs = require('fs')
var path = require('path')
var os = require('os')
var fse = require(process.cwd())
var ncp = require('../../../lib/copy/_copy').ncp

/* global afterEach, beforeEach, describe, it */

describe('ncp / symlink', function () {
  var TEST_DIR = path.join(os.tmpdir(), 'fs-extra', 'ncp-symlinks')
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

  it('copies symlinks by default', function (done) {
    ncp(src, out, function (err) {
      assert.ifError(err)

      assert.equal(fs.readlinkSync(path.join(out, 'file-symlink')), path.join(src, 'foo'))
      assert.equal(fs.readlinkSync(path.join(out, 'dir-symlink')), path.join(src, 'dir'))

      done()
    })
  })

  it('copies file contents when dereference=true', function (done) {
    ncp(src, out, {dereference: true}, function (err) {
      assert.ifError(err)

      var fileSymlinkPath = path.join(out, 'file-symlink')
      assert.ok(fs.lstatSync(fileSymlinkPath).isFile())
      assert.equal(fs.readFileSync(fileSymlinkPath), 'foo contents')

      var dirSymlinkPath = path.join(out, 'dir-symlink')
      assert.ok(fs.lstatSync(dirSymlinkPath).isDirectory())
      assert.deepEqual(fs.readdirSync(dirSymlinkPath), ['bar'])

      done()
    })
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
