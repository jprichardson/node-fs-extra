var assert = require('assert')
var fs = require('fs')
var path = require('path')
var testutil = require('testutil')
var fse = require('../')

var TEST_DIR = ''

describe('fs-extra', function () {
  beforeEach(function() {
    TEST_DIR = testutil.createTestDir('fs-extra')
  })

  afterEach(function(done) {
    fse.remove(TEST_DIR, done)
  })

  describe('+ createFile', function() {
    describe('> when the file and directory does not exist', function() {
      it('should create the file', function(done) {
        var file = path.join(TEST_DIR, Math.random() + 't-ne', Math.random() + '.txt')
        assert(!fs.existsSync(file))
        fse.createFile(file, function(err) {
          assert.ifError(err)
          assert(fs.existsSync(file))
          done()
        })
      })
    })

    describe('> when the file does exist', function() {
      it('should not modify the file', function(done) {
        var file = path.join(TEST_DIR, Math.random() + 't-e', Math.random() + '.txt')
        fse.mkdirsSync(path.dirname(file))
        fs.writeFileSync(file, 'hello world')
        fse.createFile(file, function(err) {
          assert.ifError(err)
          assert.equal(fs.readFileSync(file, 'utf8'), 'hello world')
          done()
        })
      })
    })
  })

  describe('+ createFileSync', function() {
    describe('> when the file and directory does not exist', function() {
      it('should create the file', function() {
        var file = path.join(TEST_DIR, Math.random() + 'ts-ne', Math.random() + '.txt')
        assert(!fs.existsSync(file))
        fse.createFileSync(file)
        assert(fs.existsSync(file))
      })
    })

    describe('> when the file does exist', function() {
      it('should not modify the file', function() {
        var file = path.join(TEST_DIR, Math.random() + 'ts-e', Math.random() + '.txt')
        fse.mkdirsSync(path.dirname(file))
        fs.writeFileSync(file, 'hello world')
        fse.createFileSync(file)
        assert.equal(fs.readFileSync(file, 'utf8'), 'hello world')
      })
    })
  })
})
