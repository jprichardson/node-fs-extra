var assert = require('assert')
var util = require('util')
var path = require('path')
var os = require('os')
var fs = require('graceful-fs')
var CWD = process.cwd()
var fse = require(CWD)
var _symlinkType = require('../symlink-type')
var symlinkType = _symlinkType.symlinkType
var symlinkTypeSync = _symlinkType.symlinkTypeSync
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

  var tests = {
    success: [
      // [{arguments} [srcpath, dirpath, [type] , result]
      // smart file type checking
      [['./foo.txt'], 'file'],
      [['./empty-dir'], 'dir'],
      [['./dir-foo/foo.txt'], 'file'],
      [['./dir-bar'], 'dir'],
      [['./dir-bar/bar.txt'], 'file'],
      [['./real-alpha/real-beta/real-gamma'], 'dir'],
      // force dir
      [['./foo.txt', 'dir'], 'dir'],
      [['./empty-dir', 'dir'], 'dir'],
      [['./dir-foo/foo.txt', 'dir'], 'dir'],
      [['./dir-bar', 'dir'], 'dir'],
      [['./dir-bar/bar.txt', 'dir'], 'dir'],
      [['./real-alpha/real-beta/real-gamma', 'dir'], 'dir'],
      // force file
      [['./foo.txt', 'file'], 'file'],
      [['./empty-dir', 'file'], 'file'],
      [['./dir-foo/foo.txt', 'file'], 'file'],
      [['./dir-bar', 'file'], 'file'],
      [['./dir-bar/bar.txt', 'file'], 'file'],
      [['./real-alpha/real-beta/real-gamma', 'file'], 'file'],
      // default for files or dirs that don't exist is file
      [['./missing.txt'], 'file'],
      [['./missing'], 'file'],
      [['./missing.txt'], 'file'],
      [['./missing'], 'file'],
      [['./empty-dir/missing.txt'], 'file'],
      [['./empty-dir/missing'], 'file'],
      [['./empty-dir/missing.txt'], 'file'],
      [['./empty-dir/missing'], 'file'],
      // when src doesnt exist and provided type 'file'
      [['./missing.txt', 'file'], 'file'],
      [['./missing', 'file'], 'file'],
      [['./missing.txt', 'file'], 'file'],
      [['./missing', 'file'], 'file'],
      [['./empty-dir/missing.txt', 'file'], 'file'],
      [['./empty-dir/missing', 'file'], 'file'],
      [['./empty-dir/missing.txt', 'file'], 'file'],
      [['./empty-dir/missing', 'file'], 'file'],
      // when src doesnt exist and provided type 'dir'
      [['./missing.txt', 'dir'], 'dir'],
      [['./missing', 'dir'], 'dir'],
      [['./missing.txt', 'dir'], 'dir'],
      [['./missing', 'dir'], 'dir'],
      [['./empty-dir/missing.txt', 'dir'], 'dir'],
      [['./empty-dir/missing', 'dir'], 'dir'],
      [['./empty-dir/missing.txt', 'dir'], 'dir'],
      [['./empty-dir/missing', 'dir'], 'dir']
    ]
  }

  describe('symlinkType()', function () {
    tests.success.forEach(function (test) {
      var args = test[0].slice(0)
      var expectedType = test[1]
      var should = util.format('should return \'%s\' when src \'%s\'', expectedType, args[0])
      it(should, function (done) {
        var callback = function (err, type) {
          if (err) done(err)
          assert.equal(type, expectedType)
          done()
        }
        args.push(callback)
        return symlinkType.apply(null, args)
      })
    })
  })

  describe('symlinkTypeSync()', function () {
    tests.success.forEach(function (test) {
      var args = test[0]
      var expectedType = test[1]
      var should = util.format('should return \'%s\' when src \'%s\'', expectedType, args[0])
      it(should, function () {
        var type = symlinkTypeSync.apply(null, args)
        assert.equal(type, expectedType)
      })
    })
  })
})
