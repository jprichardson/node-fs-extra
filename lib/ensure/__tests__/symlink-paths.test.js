var assert = require('assert')
var util = require('util')
var path = require('path')
var os = require('os')
var fs = require('graceful-fs')
var CWD = process.cwd()
var fse = require(CWD)
var _symlinkPaths = require('../symlink-paths')
var symlinkPaths = _symlinkPaths.symlinkPaths
var symlinkPathsSync = _symlinkPaths.symlinkPathsSync
var TEST_DIR = path.join(os.tmpdir(), 'fs-extra', 'ensure-symlink')

/* global afterEach, beforeEach, describe, it, after, before */

describe('symlink-type', function () {
  before(function () {
    fse.emptyDirSync(TEST_DIR)
    process.chdir(TEST_DIR)
  })

  beforeEach(function () {
    fs.writeFileSync('./foo.txt', 'foo\n')
    fse.mkdirsSync('./empty-dir')
    fse.mkdirsSync('./dir-foo')
    fs.writeFileSync('./dir-foo/foo.txt', 'dir-foo\n')
    fse.mkdirsSync('./dir-bar')
    fs.writeFileSync('./dir-bar/bar.txt', 'dir-bar\n')
    fse.mkdirsSync('./real-alpha/real-beta/real-gamma')
  })

  afterEach(function (done) {
    fse.emptyDir(TEST_DIR, done)
  })

  after(function () {
    process.chdir(CWD)
    fse.removeSync(TEST_DIR)
  })

  var tests = [
    [['foo.txt', 'symlink.txt'], {toCwd: 'foo.txt', toDst: 'foo.txt'}], // smart && nodestyle
    [['foo.txt', 'empty-dir/symlink.txt'], {toCwd: 'foo.txt', toDst: '../foo.txt'}], // smart
    [['../foo.txt', 'empty-dir/symlink.txt'], {toCwd: 'foo.txt', toDst: '../foo.txt'}], // nodestyle
    [['foo.txt', 'dir-bar/symlink.txt'], {toCwd: 'foo.txt', toDst: '../foo.txt'}], // smart
    [['../foo.txt', 'dir-bar/symlink.txt'], {toCwd: 'foo.txt', toDst: '../foo.txt'}], // nodestyle
    // this is to preserve node's symlink capability these arguments say create
    // a link to 'dir-foo/foo.txt' this works because it exists this is unlike
    // the previous example with 'empty-dir' because 'empty-dir/foo.txt' does not exist.
    [['foo.txt', 'dir-foo/symlink.txt'], {toCwd: 'dir-foo/foo.txt', toDst: 'foo.txt'}], // nodestyle
    [['foo.txt', 'real-alpha/real-beta/real-gamma/symlink.txt'], {toCwd: 'foo.txt', toDst: '../../../foo.txt'}]
  ]

  // formats paths to pass on multiple operating systems
  tests.forEach(function (test) {
    test[0][0] = path.join(test[0][0])
    test[0][1] = path.join(test[0][1])
    test[1] = {
      toCwd: path.join(test[1].toCwd),
      toDst: path.join(test[1].toDst)
    }
  })

  describe('symlinkPaths()', function () {
    tests.forEach(function (test) {
      var args = test[0].slice(0)
      var expectedRelativePaths = test[1]
      var should = util.format('should return \'%s\' when src \'%s\' and dst is \'%s\'', JSON.stringify(expectedRelativePaths), args[0], args[1])
      it(should, function (done) {
        var callback = function (err, relativePaths) {
          if (err) done(err)
          assert.deepEqual(relativePaths, expectedRelativePaths)
          done()
        }
        args.push(callback)
        return symlinkPaths.apply(null, args)
      })
    })
  })

  describe('symlinkPathsSync()', function () {
    tests.forEach(function (test) {
      var args = test[0].slice(0)
      var expectedRelativePaths = test[1]
      var should = util.format('should return \'%s\' when src \'%s\' and dst is \'%s\'', JSON.stringify(expectedRelativePaths), args[0], args[1])
      it(should, function () {
        var relativePaths = symlinkPathsSync.apply(null, args)
        assert.deepEqual(relativePaths, expectedRelativePaths)
      })
    })
  })
})
