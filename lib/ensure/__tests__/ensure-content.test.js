var assert = require('assert')
var util = require('util')
var path = require('path')
var os = require('os')
var fs = require('graceful-fs')
var CWD = process.cwd()
var fse = require(CWD)
var ensureFile = fse.ensureFile
var ensureFileSync = fse.ensureFileSync

/* global afterEach, describe, it, after, before */

var TEST_DIR

describe('fse-ensure-file', function () {
  TEST_DIR = path.join(os.tmpdir(), 'fs-extra', 'ensure-symlink')

  var tests = [
    // [[srcpath, dstpath], fs.writeFile expect, ensureFile expect]
    [['./foo.txt', 'foo'], 'file-success', 'file-success']
  ]

  before(function () {
    fse.emptyDirSync(TEST_DIR)
    process.chdir(TEST_DIR)
  })

  // beforeEach(function () {
  //   fs.writeFileSync('./foo.txt', 'foo\n')
  //   fse.mkdirsSync('empty-dir')
  //   fse.mkdirsSync('dir-foo')
  //   fs.writeFileSync('dir-foo/foo.txt', 'dir-foo\n')
  //   fse.mkdirsSync('dir-bar')
  //   fs.writeFileSync('dir-bar/bar.txt', 'dir-bar\n')
  //   fse.mkdirsSync('real-alpha/real-beta/real-gamma')
  // })

  afterEach(function (done) {
    fse.emptyDir(TEST_DIR, done)
  })

  after(function () {
    process.chdir(CWD)
    fse.removeSync(TEST_DIR)
  })

  function fileSuccess (args, fn) {
    var dstpath = args[0]
    var content = args[1]
    var should = util.format('should create file `%s` with content `%s`', dstpath, content)
    it(should, function (done) {
      var callback = function (err) {
        if (err) return done(err)
        var fileContent = fs.readFileSync(dstpath, 'utf8')
        assert.equal(content, fileContent)
        return done()
      }
      args.push(callback)
      return fn.apply(null, args)
    })
  }

  function fileSuccessSync (args, fn) {
    var dstpath = args[0]
    var content = args[1]
    var should = util.format('should create file `%s` with content `%s`', dstpath, content)
    it(should, function () {
      fn.apply(null, args)
      var fileContent = fs.readFileSync(dstpath, 'utf8')
      assert.equal(content, fileContent)
    })
  }

  describe('fs.writeFile()', function () {
    var fn = fs.writeFile
    tests.forEach(function (test) {
      var args = test[0].slice(0)
      var nativeBehavior = test[1]
      // var newBehavior = test[2]
      if (nativeBehavior === 'file-success') fileSuccess(args, fn)
      // if (nativeBehavior === 'file-error') fileError(args, fn)
    })
  })

  describe('ensureFile()', function () {
    var fn = ensureFile
    tests.forEach(function (test) {
      var args = test[0].slice(0)
      // var nativeBehavior = test[1]
      var newBehavior = test[2]
      if (newBehavior === 'file-success') fileSuccess(args, fn)
      // if (newBehavior === 'file-error') fileError(args, fn)
    })
  })

  describe('fs.writeFileSync()', function () {
    var fn = fs.writeFileSync
    tests.forEach(function (test) {
      var args = test[0].slice(0)
      var nativeBehavior = test[1]
      // var newBehavior = test[2]
      if (nativeBehavior === 'file-success') fileSuccessSync(args, fn)
      // if (nativeBehavior === 'file-error') fileErrorSync(args, fn)
    })
  })

  describe('ensureFileSync()', function () {
    var fn = ensureFileSync
    tests.forEach(function (test) {
      var args = test[0].slice(0)
      // var nativeBehavior = test[1]
      var newBehavior = test[2]
      if (newBehavior === 'file-success') fileSuccessSync(args, fn)
      // if (newBehavior === 'file-error') fileErrorSync(args, fn)
    })
  })

})
