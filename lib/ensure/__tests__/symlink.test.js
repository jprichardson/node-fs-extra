var assert = require('assert')
var util = require('util')
var path = require('path')
var os = require('os')
var fs = require('graceful-fs')
var CWD = process.cwd()
var fse = require(CWD)

var _symlinkPaths = require('../symlink-paths')
var symlinkPathsSync = _symlinkPaths.symlinkPathsSync

var ensureSymlink = fse.ensureSymlink
var ensureSymlinkSync = fse.ensureSymlinkSync

/* global afterEach, beforeEach, describe, it, after, before */

var TEST_DIR

describe('fse-ensure-symlink', function () {
  TEST_DIR = path.join(os.tmpdir(), 'fs-extra', 'ensure-symlink')

  var tests = [
    // [[srcpath, dstpath], fs.symlink expect, fse.ensureSymlink expect]
    [['./foo.txt', './symlink.txt'], 'file-success', 'file-success'],
    [['../foo.txt', './empty-dir/symlink.txt'], 'file-success', 'file-success'],
    [['../foo.txt', './empty-dir/symlink.txt'], 'file-success', 'file-success'],
    [['./foo.txt', './dir-foo/symlink.txt'], 'file-success', 'file-success'],
    [['./foo.txt', './empty-dir/symlink.txt'], 'file-broken', 'file-success'],
    [['./foo.txt', './real-alpha/symlink.txt'], 'file-broken', 'file-success'],
    [['./foo.txt', './real-alpha/real-beta/symlink.txt'], 'file-broken', 'file-success'],
    [['./foo.txt', './real-alpha/real-beta/real-gamma/symlink.txt'], 'file-broken', 'file-success'],
    [['./foo.txt', './alpha/symlink.txt'], 'file-error', 'file-success'],
    [['./foo.txt', './alpha/beta/symlink.txt'], 'file-error', 'file-success'],
    [['./foo.txt', './alpha/beta/gamma/symlink.txt'], 'file-error', 'file-success'],
    [['./missing.txt', './symlink.txt'], 'file-broken', 'file-error'],
    [['./missing.txt', './missing-dir/symlink.txt'], 'file-error', 'file-error'],
    // error is thrown if destination path exists
    [['./foo.txt', './dir-foo/foo.txt'], 'file-error', 'file-dest-exists'],
    [['./dir-foo', './symlink-dir-foo'], 'dir-success', 'dir-success'],
    [['../dir-bar', './dir-foo/symlink-dir-bar'], 'dir-success', 'dir-success'],
    [['./dir-bar', './dir-foo/symlink-dir-bar'], 'dir-broken', 'dir-success'],
    [['./dir-bar', './empty-dir/symlink-dir-bar'], 'dir-broken', 'dir-success'],
    [['./dir-bar', './real-alpha/symlink-dir-bar'], 'dir-broken', 'dir-success'],
    [['./dir-bar', './real-alpha/real-beta/symlink-dir-bar'], 'dir-broken', 'dir-success'],
    [['./dir-bar', './real-alpha/real-beta/real-gamma/symlink-dir-bar'], 'dir-broken', 'dir-success'],
    [['./dir-foo', './alpha/dir-foo'], 'dir-error', 'dir-success'],
    [['./dir-foo', './alpha/beta/dir-foo'], 'dir-error', 'dir-success'],
    [['./dir-foo', './alpha/beta/gamma/dir-foo'], 'dir-error', 'dir-success'],
    [['./missing', './dir-foo/symlink-dir-missing'], 'dir-broken', 'dir-error'],
    // error is thrown if destination path exists
    [['./dir-foo', './real-alpha/real-beta'], 'dir-error', 'dir-dest-exists'],
    [[path.resolve(path.join(TEST_DIR, './foo.txt')), './symlink.txt'], 'file-success', 'file-success'],
    [[path.resolve(path.join(TEST_DIR, './dir-foo/foo.txt')), './symlink.txt'], 'file-success', 'file-success'],
    [[path.resolve(path.join(TEST_DIR, './missing.txt')), './symlink.txt'], 'file-broken', 'file-error'],
    [[path.resolve(path.join(TEST_DIR, '../foo.txt')), './symlink.txt'], 'file-broken', 'file-error'],
    [[path.resolve(path.join(TEST_DIR, '../dir-foo/foo.txt')), './symlink.txt'], 'file-broken', 'file-error']
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
    var should = util.format('should create symlink file using src `%s` and dst `%s`', srcpath, dstpath)
    it(should, function (done) {
      var callback = function (err) {
        if (err) return done(err)
        var relative = symlinkPathsSync(srcpath, dstpath)
        var srcContent = fs.readFileSync(relative.toCwd, 'utf8')
        var dstDir = path.dirname(dstpath)
        var dstBasename = path.basename(dstpath)
        var isSymlink = fs.lstatSync(dstpath).isSymbolicLink()
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

  function fileBroken (args, fn) {
    var srcpath = args[0]
    var dstpath = args[1]
    var should = util.format('should create broken symlink file using src `%s` and dst `%s`', srcpath, dstpath)
    it(should, function (done) {
      var callback = function (err) {
        if (err) return done(err)
        var dstDir = path.dirname(dstpath)
        var dstBasename = path.basename(dstpath)
        var isSymlink = fs.lstatSync(dstpath).isSymbolicLink()
        var dstDirContents = fs.readdirSync(dstDir)
        assert.equal(isSymlink, true)
        assert(dstDirContents.indexOf(dstBasename) >= 0)
        assert.throws(function () {
          return fs.readFileSync(dstpath, 'utf8')
        }, Error)
        return done()
      }
      args.push(callback)
      return fn.apply(null, args)
    })
  }

  function fileError (args, fn) {
    var srcpath = args[0]
    var dstpath = args[1]
    var should = util.format('should return error when creating symlink file using src `%s` and dst `%s`', srcpath, dstpath)
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

  function dirSuccess (args, fn) {
    var srcpath = args[0]
    var dstpath = args[1]
    var should = util.format('should create symlink dir using src `%s` and dst `%s`', srcpath, dstpath)
    it(should, function (done) {
      var callback = function (err) {
        if (err) return done(err)
        var relative = symlinkPathsSync(srcpath, dstpath)
        var srcContents = fs.readdirSync(relative.toCwd)
        var dstDir = path.dirname(dstpath)
        var dstBasename = path.basename(dstpath)
        var isSymlink = fs.lstatSync(dstpath).isSymbolicLink()
        var dstContents = fs.readdirSync(dstpath)
        var dstDirContents = fs.readdirSync(dstDir)
        assert.equal(isSymlink, true)
        assert.deepEqual(srcContents, dstContents)
        assert(dstDirContents.indexOf(dstBasename) >= 0)
        return done()
      }
      args.push(callback)
      return fn.apply(null, args)
    })
  }

  function dirBroken (args, fn) {
    var srcpath = args[0]
    var dstpath = args[1]
    var should = util.format('should create broken symlink dir using src `%s` and dst `%s`', srcpath, dstpath)
    it(should, function (done) {
      var callback = function (err) {
        if (err) return done(err)
        var dstDir = path.dirname(dstpath)
        var dstBasename = path.basename(dstpath)
        var isSymlink = fs.lstatSync(dstpath).isSymbolicLink()
        var dstDirContents = fs.readdirSync(dstDir)
        assert.equal(isSymlink, true)
        assert(dstDirContents.indexOf(dstBasename) >= 0)
        assert.throws(function () {
          return fs.readdirSync(dstpath)
        }, Error)
        return done()
      }
      args.push(callback)
      return fn.apply(null, args)
    })
  }

  function dirError (args, fn) {
    var srcpath = args[0]
    var dstpath = args[1]
    var should = util.format('should return error when creating symlink dir using src `%s` and dst `%s`', srcpath, dstpath)
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

  function dirDestExists (args, fn) {
    var srcpath = args[0]
    var dstpath = args[1]
    var should = util.format('should do nothing using src `%s` and dst `%s`', srcpath, dstpath)
    it(should, function (done) {
      var destinationContentBefore = fs.readdirSync(dstpath)
      var callback = function (err) {
        if (err) return done(err)
        var destinationContentAfter = fs.readdirSync(dstpath)
        assert.deepEqual(destinationContentBefore, destinationContentAfter)
        return done()
      }
      args.push(callback)
      return fn.apply(null, args)
    })
  }

  function fileSuccessSync (args, fn) {
    var srcpath = args[0]
    var dstpath = args[1]
    var should = util.format('should create symlink file using src `%s` and dst `%s`', srcpath, dstpath)
    it(should, function () {
      fn.apply(null, args)
      var relative = symlinkPathsSync(srcpath, dstpath)
      var srcContent = fs.readFileSync(relative.toCwd, 'utf8')
      var dstDir = path.dirname(dstpath)
      var dstBasename = path.basename(dstpath)
      var isSymlink = fs.lstatSync(dstpath).isSymbolicLink()
      var dstContent = fs.readFileSync(dstpath, 'utf8')
      var dstDirContents = fs.readdirSync(dstDir)
      assert.equal(isSymlink, true)
      assert.equal(srcContent, dstContent)
      assert(dstDirContents.indexOf(dstBasename) >= 0)
    })
  }

  function fileBrokenSync (args, fn) {
    var srcpath = args[0]
    var dstpath = args[1]
    var should = util.format('should create broken symlink file using src `%s` and dst `%s`', srcpath, dstpath)
    it(should, function () {
      fn.apply(null, args)
      var dstDir = path.dirname(dstpath)
      var dstBasename = path.basename(dstpath)
      var isSymlink = fs.lstatSync(dstpath).isSymbolicLink()
      var dstDirContents = fs.readdirSync(dstDir)
      assert.equal(isSymlink, true)
      assert(dstDirContents.indexOf(dstBasename) >= 0)
      assert.throws(function () {
        return fs.readFileSync(dstpath, 'utf8')
      }, Error)
    })
  }

  function fileErrorSync (args, fn) {
    var srcpath = args[0]
    var dstpath = args[1]
    var should = util.format('should throw error using` src `%s` and dst `%s`', srcpath, dstpath)
    it(should, function () {
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

  function dirSuccessSync (args, fn) {
    var srcpath = args[0]
    var dstpath = args[1]
    var should = util.format('should create symlink dir using src `%s` and dst `%s`', srcpath, dstpath)
    it(should, function () {
      fn.apply(null, args)
      var relative = symlinkPathsSync(srcpath, dstpath)
      var srcContents = fs.readdirSync(relative.toCwd)
      var dstDir = path.dirname(dstpath)
      var dstBasename = path.basename(dstpath)
      var isSymlink = fs.lstatSync(dstpath).isSymbolicLink()
      var dstContents = fs.readdirSync(dstpath)
      var dstDirContents = fs.readdirSync(dstDir)
      assert.equal(isSymlink, true)
      assert.deepEqual(srcContents, dstContents)
      assert(dstDirContents.indexOf(dstBasename) >= 0)
    })
  }

  function dirBrokenSync (args, fn) {
    var srcpath = args[0]
    var dstpath = args[1]
    var should = util.format('should create broken symlink dir using src `%s` and dst `%s`', srcpath, dstpath)
    it(should, function () {
      fn.apply(null, args)
      var dstDir = path.dirname(dstpath)
      var dstBasename = path.basename(dstpath)
      var isSymlink = fs.lstatSync(dstpath).isSymbolicLink()
      var dstDirContents = fs.readdirSync(dstDir)
      assert.equal(isSymlink, true)
      assert(dstDirContents.indexOf(dstBasename) >= 0)
      assert.throws(function () {
        return fs.readdirSync(dstpath)
      }, Error)
    })
  }

  function dirErrorSync (args, fn) {
    var srcpath = args[0]
    var dstpath = args[1]
    var should = util.format('should throw error when creating symlink dir using src `%s` and dst `%s`', srcpath, dstpath)
    it(should, function () {
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

  function dirDestExistsSync (args, fn) {
    var srcpath = args[0]
    var dstpath = args[1]
    var should = util.format('should do nothing using src `%s` and dst `%s`', srcpath, dstpath)
    it(should, function () {
      var destinationContentBefore = fs.readdirSync(dstpath)
      fn.apply(null, args)
      var destinationContentAfter = fs.readdirSync(dstpath)
      assert.deepEqual(destinationContentBefore, destinationContentAfter)
    })
  }

  describe('fs.symlink()', function () {
    var fn = fs.symlink
    tests.forEach(function (test) {
      var args = test[0].slice(0)
      var nativeBehavior = test[1]
      // var newBehavior = test[2]
      if (nativeBehavior === 'file-success') fileSuccess(args, fn)
      if (nativeBehavior === 'file-broken') fileBroken(args, fn)
      if (nativeBehavior === 'file-error') fileError(args, fn)
      if (nativeBehavior === 'file-dest-exists') fileDestExists(args, fn)
      args.push('dir')
      if (nativeBehavior === 'dir-success') dirSuccess(args, fn)
      if (nativeBehavior === 'dir-broken') dirBroken(args, fn)
      if (nativeBehavior === 'dir-error') dirError(args, fn)
      if (nativeBehavior === 'dir-dest-exists') dirDestExists(args, fn)
    })
  })

  describe('ensureSymlink()', function () {
    var fn = ensureSymlink
    tests.forEach(function (test) {
      var args = test[0]
      // var nativeBehavior = test[1]
      var newBehavior = test[2]
      if (newBehavior === 'file-success') fileSuccess(args, fn)
      if (newBehavior === 'file-broken') fileBroken(args, fn)
      if (newBehavior === 'file-error') fileError(args, fn)
      if (newBehavior === 'file-dest-exists') fileDestExists(args, fn)
      if (newBehavior === 'dir-success') dirSuccess(args, fn)
      if (newBehavior === 'dir-broken') dirBroken(args, fn)
      if (newBehavior === 'dir-error') dirError(args, fn)
      if (newBehavior === 'dir-dest-exists') dirDestExists(args, fn)
    })
  })

  describe('fs.symlinkSync()', function () {
    var fn = fs.symlinkSync
    tests.forEach(function (test) {
      var args = test[0].slice(0)
      var nativeBehavior = test[1]
      // var newBehavior = test[2]
      if (nativeBehavior === 'file-success') fileSuccessSync(args, fn)
      if (nativeBehavior === 'file-broken') fileBrokenSync(args, fn)
      if (nativeBehavior === 'file-error') fileErrorSync(args, fn)
      if (nativeBehavior === 'file-dest-exists') fileDestExistsSync(args, fn)
      args.push('dir')
      if (nativeBehavior === 'dir-success') dirSuccessSync(args, fn)
      if (nativeBehavior === 'dir-broken') dirBrokenSync(args, fn)
      if (nativeBehavior === 'dir-error') dirErrorSync(args, fn)
      if (nativeBehavior === 'dir-dest-exists') dirDestExistsSync(args, fn)
    })
  })

  describe('ensureSymlinkSync()', function () {
    var fn = ensureSymlinkSync
    tests.forEach(function (test) {
      var args = test[0]
      // var nativeBehavior = test[1]
      var newBehavior = test[2]
      if (newBehavior === 'file-success') fileSuccessSync(args, fn)
      if (newBehavior === 'file-broken') fileBrokenSync(args, fn)
      if (newBehavior === 'file-error') fileErrorSync(args, fn)
      if (newBehavior === 'file-dest-exists') fileDestExistsSync(args, fn)
      if (newBehavior === 'dir-success') dirSuccessSync(args, fn)
      if (newBehavior === 'dir-broken') dirBrokenSync(args, fn)
      if (newBehavior === 'dir-error') dirErrorSync(args, fn)
      if (newBehavior === 'dir-dest-exists') dirDestExistsSync(args, fn)
    })
  })

})
