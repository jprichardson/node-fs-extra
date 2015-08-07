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
    [['./missing.txt', './missing-dir/link.txt'], 'file-error', 'file-error'],
    [['./foo.txt', './link.txt'], 'file-success', 'file-success'],
    [['./dir-foo/foo.txt', './link.txt'], 'file-success', 'file-success'],
    [['./missing.txt', './link.txt'], 'file-error', 'file-error'],
    [['../foo.txt', './link.txt'], 'file-error', 'file-error'],
    [['../dir-foo/foo.txt', './link.txt'], 'file-error', 'file-error'],
    // error is thrown if destination path exists
    [['./foo.txt', './dir-foo/foo.txt'], 'file-error', 'file-dest-exists'],
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
      var dstdirExistsBefore = fs.existsSync(path.dirname(dstpath))
      function callback (err) {
        assert.equal(err instanceof Error, true)
        // ensure that directories aren't created if there's an error
        var dstdirExistsAfter = fs.existsSync(path.dirname(dstpath))
        assert.equal(dstdirExistsBefore, dstdirExistsAfter)
        return done()
      }
      args.push(callback)
      return fn.apply(null, args)
    })
  }

  function fileDestExists (args, fn) {
    var srcpath = args[0]
    var dstpath = args[1]
    var should = util.format('should do nothing using src `%s` and dst `%s`', srcpath, dstpath)
    it(should, function (done) {
      var destinationContentBefore = fs.readFileSync(dstpath, 'utf8')
      var callback = function (err) {
        if (err) return done(err)
        var destinationContentAfter = fs.readFileSync(dstpath, 'utf8')
        assert.equal(destinationContentBefore, destinationContentAfter)
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
      // will fail if dstdir is created and there's an error
      var dstdirExistsBefore = fs.existsSync(path.dirname(dstpath))
      var err = null
      try {
        fn.apply(null, args)
      } catch (e) {
        err = e
      }
      assert.equal(err instanceof Error, true)
      var dstdirExistsAfter = fs.existsSync(path.dirname(dstpath))
      assert.equal(dstdirExistsBefore, dstdirExistsAfter)
    })
  }

  function fileDestExistsSync (args, fn) {
    var srcpath = args[0]
    var dstpath = args[1]
    var should = util.format('should do nothing using src `%s` and dst `%s`', srcpath, dstpath)
    it(should, function () {
      var destinationContentBefore = fs.readFileSync(dstpath, 'utf8')
      fn.apply(null, args)
      var destinationContentAfter = fs.readFileSync(dstpath, 'utf8')
      assert.equal(destinationContentBefore, destinationContentAfter)
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
      if (nativeBehavior === 'file-dest-exists') fileDestExists(args, fn)
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
      if (newBehavior === 'file-dest-exists') fileDestExists(args, fn)
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
      if (nativeBehavior === 'file-dest-exists') fileDestExists(args, fn)
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
      if (newBehavior === 'file-dest-exists') fileDestExistsSync(args, fn)
    })
  })

})
