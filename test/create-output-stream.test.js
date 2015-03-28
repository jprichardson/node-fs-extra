var assert = require('assert')
var fs = require('fs')
var path = require('path')
var testutil = require('testutil')
var fse = require('../')

/* global afterEach, beforeEach, describe, it */

var TEST_DIR = ''

describe('createOutputStream', function () {
  beforeEach(function() {
    TEST_DIR = testutil.createTestDir('fs-extra')
  })

  afterEach(function(done) {
    fse.remove(TEST_DIR, done)
  })

  describe('+ createOutputStream', function() {
    describe('> when the file and directory does not exist', function() {
      it('should create the stream', function(done) {
        var file = path.join(TEST_DIR, Math.random() + 't-ne', Math.random() + '.txt')
        assert(!fs.existsSync(file))
        stream = fse.createOutputStream(file)
        stream.end('hi jp', 'utf8', function(){
          assert(fs.existsSync(file))
          assert.equal(fs.readFileSync(file, 'utf8'), 'hi jp')
          done()
        })
      })
    })

    describe('> when the dir does exist', function() {
      it('should still modify the file', function(done) {
        var file = path.join(TEST_DIR, Math.random() + 't-e', Math.random() + '.txt')
        fse.mkdirsSync(path.dirname(file))
        fs.writeFileSync(file, 'hello world')
        stream = fse.createOutputStream(file)
        stream.end('hi jp', 'utf8', function(){
          assert(fs.existsSync(file))
          assert.equal(fs.readFileSync(file, 'utf8'), 'hi jp')
          done()
        })
      })
    })
  })
})
