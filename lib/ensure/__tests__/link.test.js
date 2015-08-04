var assert = require('assert')
var util = require('util')
var path = require('path')
var os = require('os')
var fs = require('graceful-fs')
var CWD = process.cwd()
var fse = require(CWD)
var ensureLink = fse.ensureLink
var ensureLinkSync = fse.ensureLinkSync

/* global afterEach, beforeEach, describe, it, after, before */

var TEST_DIR

describe('fse-ensure-link', function () {
  TEST_DIR = path.join(os.tmpdir(), 'fs-extra', 'ensure-symlink')

  var tests = [
    // [[srcpath, dstpath], fs.link expect, ensureLink expect]
    [['./foo.txt', './link.txt'], 'file-success', 'file-success'],
    [['./foo.txt', './dir-foo/link.txt'], 'file-success', 'file-success'],
    [['./foo.txt', './empty-dir/link.txt'], 'file-success', 'file-success'],
    [['./foo.txt', './real-alpha/link.txt'], 'file-success', 'file-success'],
    [['./foo.txt', './real-alpha/real-beta/link.txt'], 'file-success', 'file-success'],
    [['./foo.txt', './real-alpha/real-beta/real-gamma/link.txt'], 'file-success', 'file-success'],
    [['./foo.txt', './alpha/link.txt'], 'file-error', 'file-success'],
    [['./foo.txt', './alpha/beta/link.txt'], 'file-error', 'file-success'],
    [['./foo.txt', './alpha/beta/gamma/link.txt'], 'file-error', 'file-success'],
    [['./missing.txt', './link.txt'], 'file-error', 'file-error'],
    [[path.resolve(path.join(TEST_DIR, './foo.txt')), './link.txt'], 'file-success', 'file-success'],
    [[path.resolve(path.join(TEST_DIR, './dir-foo/foo.txt')), './link.txt'], 'file-success', 'file-success'],
    [[path.resolve(path.join(TEST_DIR, './missing.txt')), './link.txt'], 'file-error', 'file-error'],
    [[path.resolve(path.join(TEST_DIR, '../foo.txt')), './link.txt'], 'file-error', 'file-error'],
    [[path.resolve(path.join(TEST_DIR, '../dir-foo/foo.txt')), './link.txt'], 'file-error', 'file-error']
  ]

  before(function () {
    fse.emptyDirSync(TEST_DIR)
    process.chdir(TEST_DIR)
  })

  beforeEach(function () {
    fs.writeFileSync('./foo.txt', 'foo\n')
    fse.mkdirsSync('empty-dir')
    fse.mkdirsSync('dir-foo')
    fs.writeFileSync('dir-foo/foo.txt', 'dir-foo\n')
    fse.mkdirsSync('dir-bar')
    fs.writeFileSync('dir-bar/bar.txt', 'dir-bar\n')
    fse.mkdirsSync('real-alpha/real-beta/real-gamma')
  })

  afterEach(function (done) {
    fse.emptyDir(TEST_DIR, done)
  })

  after(function () {
    process.chdir(CWD)
    fse.removeSync(TEST_DIR)
  })

  function fileSuccess (args, fn) {
    var srcpath = args[0]
    var dstpath = args[1]
    var should = util.format('should create link file using src `%s` and dst `%s`', srcpath, dstpath)
    it(should, function (done) {
      var callback = function (err) {
        if (err) return done(err)
        var srcContent = fs.readFileSync(srcpath, 'utf8')
        var dstDir = path.dirname(dstpath)
        var dstBasename = path.basename(dstpath)
        var isSymlink = fs.lstatSync(dstpath).isFile()
        var dstContent = fs.readFileSync(dstpath, 'utf8')
        var dstDirContents = fs.readdirSync(dstDir)
        assert.equal(isSymlink, true)
        assert.equal(srcContent, dstContent)
        assert(dstDirContents.indexOf(dstBasename) >= 0)
        return done()
      }
      args.push(callback)
      return fn.apply(null, args)
    })
  }

  function fileError (args, fn) {
    var srcpath = args[0]
    var dstpath = args[1]
    var should = util.format('should return error when creating link file using src `%s` and dst `%s`', srcpath, dstpath)
    it(should, function (done) {
      var callback = function (err) {
        assert.equal(err instanceof Error, true)
        return done()
      }
      args.push(callback)
      return fn.apply(null, args)
    })
  }

  function fileSuccessSync (args, fn) {
    var srcpath = args[0]
    var dstpath = args[1]
    var should = util.format('should create link file using src `%s` and dst `%s`', srcpath, dstpath)
    it(should, function () {
      fn.apply(null, args)
      var srcContent = fs.readFileSync(srcpath, 'utf8')
      var dstDir = path.dirname(dstpath)
      var dstBasename = path.basename(dstpath)
      var isSymlink = fs.lstatSync(dstpath).isFile()
      var dstContent = fs.readFileSync(dstpath, 'utf8')
      var dstDirContents = fs.readdirSync(dstDir)
      assert.equal(isSymlink, true)
      assert.equal(srcContent, dstContent)
      assert(dstDirContents.indexOf(dstBasename) >= 0)
    })
  }

  function fileErrorSync (args, fn) {
    var srcpath = args[0]
    var dstpath = args[1]
    var should = util.format('should throw error using` src `%s` and dst `%s`', srcpath, dstpath)
    it(should, function () {
      assert.throws(function () {
        return fn.apply(null, args)
      }, Error)
    })
  }

  describe('fs.link()', function () {
    var fn = fs.link
    tests.forEach(function (test) {
      var args = test[0].slice(0)
      var nativeBehavior = test[1]
      // var newBehavior = test[2]
      if (nativeBehavior === 'file-success') fileSuccess(args, fn)
      if (nativeBehavior === 'file-error') fileError(args, fn)
    })
  })

  describe('ensureLink()', function () {
    var fn = ensureLink
    tests.forEach(function (test) {
      var args = test[0].slice(0)
      // var nativeBehavior = test[1]
      var newBehavior = test[2]
      if (newBehavior === 'file-success') fileSuccess(args, fn)
      if (newBehavior === 'file-error') fileError(args, fn)
    })
  })

  describe('fs.linkSync()', function () {
    var fn = fs.linkSync
    tests.forEach(function (test) {
      var args = test[0].slice(0)
      var nativeBehavior = test[1]
      // var newBehavior = test[2]
      if (nativeBehavior === 'file-success') fileSuccessSync(args, fn)
      if (nativeBehavior === 'file-error') fileErrorSync(args, fn)
    })
  })

  describe('ensureLinkSync()', function () {
    var fn = ensureLinkSync
    tests.forEach(function (test) {
      var args = test[0].slice(0)
      // var nativeBehavior = test[1]
      var newBehavior = test[2]
      if (newBehavior === 'file-success') fileSuccessSync(args, fn)
      if (newBehavior === 'file-error') fileErrorSync(args, fn)
    })
  })

})
