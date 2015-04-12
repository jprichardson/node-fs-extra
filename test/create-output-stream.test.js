var assert = require('assert')
var fs = require('fs')
var path = require('path')
var os = require('os')
var fse = require('../')

/* global afterEach, beforeEach, describe, it */

describe('createOutputStream', function () {
  var TEST_DIR

  beforeEach(function (done) {
    TEST_DIR = path.join(os.tmpdir(), 'fs-extra', 'create')
    fse.emptyDir(TEST_DIR, done)
  })

  afterEach(function (done) {
    fse.remove(TEST_DIR, done)
  })

  describe('+ createOutputStream', function () {
    describe('> when the file and directory does not exist', function () {
      it('should create the stream', function (done) {
        var file = path.join(TEST_DIR, Math.random() + 't-ne', Math.random() + '.txt')
        assert(!fs.existsSync(file))
        var stream = fse.createOutputStream(file)
        stream.end('hi jp', 'utf8', function () {
          assert(fs.existsSync(file))
          assert.equal(fs.readFileSync(file, 'utf8'), 'hi jp')
          done()
        })
      })
    })

    describe('> when the dir does exist', function () {
      it('should still modify the file', function (done) {
        var file = path.join(TEST_DIR, Math.random() + 't-e', Math.random() + '.txt')
        fse.mkdirsSync(path.dirname(file))
        fs.writeFileSync(file, 'hello world')
        var stream = fse.createOutputStream(file)
        stream.end('hi jp', 'utf8', function () {
          assert(fs.existsSync(file))
          assert.equal(fs.readFileSync(file, 'utf8'), 'hi jp')
          done()
        })
      })
    })
  })
})
