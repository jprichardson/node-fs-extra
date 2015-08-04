var util = require('util')
var path = require('path')
var chai = require('chai')
var os = require('os')
var fs = require('graceful-fs')
var expect = chai.expect
var CWD = process.cwd()
var fse = require(CWD)
var ensureLink = fse.ensureLink
var ensureLinkSync = fse.ensureLinkSync

/* global afterEach, beforeEach, describe, it, after, before */

var TEST_DIR
var TESTS

describe('fse-ensure-link', function () {
  TEST_DIR = path.join(os.tmpdir(), 'fs-extra', 'ensure-symlink')

  var linkErrorString = 'ENOENT: no such file or directory, link \'%s\' -> \'%s\''

  TESTS = {
    native: {
      fileSuccess: [ // creates working symlinks
        // srcpath, dstpath, fileContent
        ['./foo.txt', './link.txt', 'foo\n'],
        // ['../foo.txt', './empty-dir/link.txt', 'foo\n'],
        // the following uses `./dir-foo/foo.txt` not `foo.txt` & passes
        ['./foo.txt', './dir-foo/link.txt', 'foo\n'],
        ['./foo.txt', './empty-dir/link.txt', 'foo\n'],
        ['./foo.txt', './real-alpha/link.txt', 'foo\n'],
        ['./foo.txt', './real-alpha/real-beta/link.txt', 'foo\n'],
        ['./foo.txt', './real-alpha/real-beta/real-gamma/link.txt', 'foo\n']
      ],
      fileError: [
        ['./missing.txt', './link.txt', util.format(linkErrorString, './missing.txt', './link.txt')],
        // native doesn't ensure directories
        // (if this did work these symlinks would be broken shown above)
        [path.resolve(path.join(TEST_DIR, './alpha/link.txt')), './link.txt', util.format(linkErrorString, path.resolve(path.join(TEST_DIR, './alpha/link.txt')), './link.txt')],
        [path.resolve(path.join(TEST_DIR, './alpha/beta/link.txt')), './link.txt', util.format(linkErrorString, path.resolve(path.join(TEST_DIR, './alpha/beta/link.txt')), './link.txt')],
        [path.resolve(path.join(TEST_DIR, './alpha/beta/gamma/link.txt')), './link.txt', util.format(linkErrorString, path.resolve(path.join(TEST_DIR, './alpha/beta/gamma/link.txt')), './link.txt')]
      ]
    },
    ensure: {
      fileSuccess: [ // creates working symlinks
        // srcpath, dstpath, fileContent
        ['./foo.txt', './link.txt', 'foo\n'],
        // ['../foo.txt', './empty-dir/link.txt', 'foo\n'],
        ['./foo.txt', './dir-foo/link.txt', 'foo\n'],
        // the following can't be handled by native
        // symlinkPath pulls the file relative and supplies
        // ensureSymlink with correct file note the content
        ['./foo.txt', './empty-dir/link.txt', 'foo\n'],
        ['./foo.txt', './real-alpha/link.txt', 'foo\n'],
        ['./foo.txt', './real-alpha/real-beta/real-link.txt', 'foo\n'],
        ['./foo.txt', './real-alpha/real-beta/real-gamma/real-link.txt', 'foo\n'],
        // the following shows that nested directores are created (with a relative-to-CWD-srcpath)
        ['./foo.txt', './alpha/link.txt', 'foo\n'],
        ['./foo.txt', './alpha/beta/link.txt', 'foo\n'],
        ['./foo.txt', './alpha/beta/gamma/link.txt', 'foo\n']
        // [path.resolve('./foo.txt'), './link.txt', 'foo\n'],
        // [path.resolve('./dir-foo/foo.txt'), './link.txt', 'dir-foo\n']
      ],
      fileError: [
        // srcpath, dstpath, message
        ['./missing.txt', './link.txt', util.format(linkErrorString, './missing.txt', './link.txt')],
        [path.resolve(path.join(TEST_DIR, './missing.txt')), './link.txt', util.format(linkErrorString, path.resolve(path.join(TEST_DIR, './missing.txt')), './link.txt')],
        [path.resolve(path.join(TEST_DIR, '../foo.txt')), './link.txt', util.format(linkErrorString, path.resolve(path.join(TEST_DIR, '../foo.txt')), './link.txt')],
        [path.resolve(path.join(TEST_DIR, '../dir-foo/foo.txt')), './link.txt', util.format(linkErrorString, path.resolve(path.join(TEST_DIR, '../dir-foo/foo.txt')), './link.txt')]
      ]
    }
  }

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

  function fileSuccess (tests, fn, signature) {
    tests.forEach(function (test) {
      var srcpath = test[0]
      var dstpath = test[1]
      var fileContent = test[2]
      var should = util.format('should create link using src `%s` and dst `%s`', srcpath, dstpath)
      it(should, function (done) {
        var callback = function (err) {
          if (err) return done(err)
          // the symlink exists in the file system
          var dstDir = path.dirname(dstpath)
          var dstBasename = path.basename(dstpath)
          expect(fs.readdirSync(dstDir)).to.contain(dstBasename)
          // only works if it's a symlink file
          expect(fs.lstatSync(dstpath).isFile()).to.equal(true)
          // the symlink is unreadable
          expect(fs.readFileSync(dstpath, 'utf8')).to.equal(fileContent)
          return done()
        }
        var _signature = (signature) ? signature(srcpath, dstpath, callback) : [srcpath, dstpath, callback]
        return fn.apply(null, _signature)
      })
    })
  }

  function fileError (tests, fn, signature) {
    tests.forEach(function (test) {
      var srcpath = test[0]
      var dstpath = test[1]
      var errorMessage = test[2]
      var should = util.format('should return error when creating link using src `%s` and dst `%s`', srcpath, dstpath)
      it(should, function (done) {
        var callback = function (err) {
          expect(err).to.have.property('message')
          expect(err.message).to.equal(errorMessage)
          return done()
        }
        var _signature = (signature) ? signature(srcpath, dstpath, callback) : [srcpath, dstpath, callback]
        return fn.apply(null, _signature)
      })
    })
  }

  function fileSuccessSync (tests, fn, signature) {
    tests.forEach(function (test) {
      var srcpath = test[0]
      var dstpath = test[1]
      var fileContent = test[2]
      var should = util.format('should create link using src `%s` and dst `%s`', srcpath, dstpath)
      it(should, function () {
        var _signature = (signature) ? signature(srcpath, dstpath) : [srcpath, dstpath]
        fn.apply(null, _signature)
        var dstDir = path.dirname(dstpath)
        var dstBasename = path.basename(dstpath)
        expect(fs.readdirSync(dstDir)).to.contain(dstBasename)
        // only works if it's a symlink file
        expect(fs.lstatSync(dstpath).isFile()).to.equal(true)
        // the symlink is unreadable
        expect(fs.readFileSync(dstpath, 'utf8')).to.equal(fileContent)
      })
    })
  }

  function fileErrorSync (tests, fn, signature) {
    tests.forEach(function (test) {
      var srcpath = test[0]
      var dstpath = test[1]
      var should = util.format('should throw error using` src `%s` and dst `%s`', srcpath, dstpath)
      it(should, function () {
        var _signature = (signature) ? signature(srcpath, dstpath) : [srcpath, dstpath]
        expect(function () {
          return fn.apply(null, _signature)
        }).to.throw
      })
    })
  }

  describe('fs.link()', function () {
    fileSuccess(TESTS.native.fileSuccess, fs.link)
    fileError(TESTS.native.fileError, fs.link)
  })

  describe('ensureLink()', function () {
    fileSuccess(TESTS.ensure.fileSuccess, ensureLink)
    fileError(TESTS.ensure.fileError, ensureLink)
  })

  describe('fs.linkSync()', function () {
    fileSuccessSync(TESTS.native.fileSuccess, fs.linkSync)
    fileErrorSync(TESTS.native.fileError, fs.linkSync)
  })

  describe('ensureLinkSync()', function () {
    fileSuccessSync(TESTS.ensure.fileSuccess, ensureLinkSync)
    fileErrorSync(TESTS.ensure.fileError, ensureLinkSync)
  })

})
