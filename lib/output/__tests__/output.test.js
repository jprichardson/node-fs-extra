var assert = require('assert')
var fs = require('fs')
var path = require('path')
var os = require('os')
var fse = require(process.cwd())

/* global afterEach, beforeEach, describe, it */

describe('output', function () {
  var TEST_DIR

  beforeEach(function (done) {
    TEST_DIR = path.join(os.tmpdir(), 'fs-extra', 'output')
    fse.emptyDir(TEST_DIR, done)
  })

  afterEach(function (done) {
    fse.remove(TEST_DIR, done)
  })

  describe('+ outputFile', function () {
    describe('> when the file and directory does not exist', function () {
      it('should create the file', function (done) {
        var file = path.join(TEST_DIR, Math.random() + 't-ne', Math.random() + '.txt')
        assert(!fs.existsSync(file))
        fse.outputFile(file, 'hi jp', function (err) {
          assert.ifError(err)
          assert(fs.existsSync(file))
          assert.equal(fs.readFileSync(file, 'utf8'), 'hi jp')
          done()
        })
      })
    })

    describe('> when the file does exist', function () {
      it('should still modify the file', function (done) {
        var file = path.join(TEST_DIR, Math.random() + 't-e', Math.random() + '.txt')
        fse.mkdirsSync(path.dirname(file))
        fs.writeFileSync(file, 'hello world')
        fse.outputFile(file, 'hello jp', function (err) {
          if (err) return done(err)
          assert.equal(fs.readFileSync(file, 'utf8'), 'hello jp')
          done()
        })
      })
    })
  })

  describe('+ outputFileSync', function () {
    describe('> when the file and directory does not exist', function () {
      it('should create the file', function () {
        var file = path.join(TEST_DIR, Math.random() + 'ts-ne', Math.random() + '.txt')
        assert(!fs.existsSync(file))
        fse.outputFileSync(file, 'hello man')
        assert(fs.existsSync(file))
        assert.equal(fs.readFileSync(file, 'utf8'), 'hello man')
      })
    })

    describe('> when the file does exist', function () {
      it('should still modify the file', function () {
        var file = path.join(TEST_DIR, Math.random() + 'ts-e', Math.random() + '.txt')
        fse.mkdirsSync(path.dirname(file))
        fs.writeFileSync(file, 'hello world')
        fse.outputFileSync(file, 'hello man')
        assert.equal(fs.readFileSync(file, 'utf8'), 'hello man')
      })
    })
  })
})
