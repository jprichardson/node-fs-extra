var assert = require('assert')
var fs = require('fs')
var path = require('path')
var os = require('os')
var fse = require('../')

/* global afterEach, beforeEach, describe, it */

describe('fs-extra', function () {
  var TEST_DIR

  beforeEach(function (done) {
    TEST_DIR = path.join(os.tmpdir(), 'fs-extra', 'ensure')
    fse.emptyDir(TEST_DIR, done)
  })

  afterEach(function (done) {
    fse.remove(TEST_DIR, done)
  })

  describe('+ ensureFile()', function () {
    describe('> when file exists', function () {
      it('should not do anything', function (done) {
        var file = path.join(TEST_DIR, 'file.txt')
        fs.writeFileSync(file, 'blah')

        assert(fs.existsSync(file))
        fse.ensureFile(file, function (err) {
          assert.ifError(err)
          assert(fs.existsSync(file))
          done()
        })
      })
    })

    describe('> when file does not exist', function () {
      it('should create the file', function (done) {
        var file = path.join(TEST_DIR, 'dir/that/does/not/exist', 'file.txt')

        assert(!fs.existsSync(file))
        fse.ensureFile(file, function (err) {
          assert.ifError(err)
          assert(fs.existsSync(file))
          done()
        })
      })
    })
  })

  describe('+ ensureFileSync()', function () {
    describe('> when file exists', function () {
      it('should not do anything', function () {
        var file = path.join(TEST_DIR, 'file.txt')
        fs.writeFileSync(file, 'blah')

        assert(fs.existsSync(file))
        fse.ensureFileSync(file)
        assert(fs.existsSync(file))
      })
    })

    describe('> when file does not exist', function () {
      it('should create the file', function () {
        var file = path.join(TEST_DIR, 'dir/that/does/not/exist', 'file.txt')

        assert(!fs.existsSync(file))
        fse.ensureFileSync(file)
        assert(fs.existsSync(file))
      })
    })
  })

  describe('+ ensureDir()', function () {
    describe('> when dir exists', function () {
      it('should not do anything', function (done) {
        var dir = path.join(TEST_DIR, 'dir/does/not/exist')
        fse.mkdirpSync(dir)

        assert(fs.existsSync(dir))
        fse.ensureDir(dir, function (err) {
          assert.ifError(err)
          assert(fs.existsSync(dir))
          done()
        })
      })
    })

    describe('> when dir does not exist', function () {
      it('should create the dir', function (done) {
        var dir = path.join(TEST_DIR, 'dir/that/does/not/exist')

        assert(!fs.existsSync(dir))
        fse.ensureDir(dir, function (err) {
          assert.ifError(err)
          assert(fs.existsSync(dir))
          done()
        })
      })
    })
  })

  describe('+ ensureDirSync()', function () {
    describe('> when dir exists', function () {
      it('should not do anything', function () {
        var dir = path.join(TEST_DIR, 'dir/does/not/exist')
        fse.mkdirpSync(dir)

        assert(fs.existsSync(dir))
        fse.ensureDirSync(dir)
        assert(fs.existsSync(dir))
      })
    })

    describe('> when dir does not exist', function () {
      it('should create the dir', function () {
        var dir = path.join(TEST_DIR, 'dir/that/does/not/exist')

        assert(!fs.existsSync(dir))
        fse.ensureDirSync(dir)
        assert(fs.existsSync(dir))
      })
    })
  })
})
