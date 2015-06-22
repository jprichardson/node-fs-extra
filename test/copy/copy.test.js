var assert = require('assert')
var fs = require('fs')
var path = require('path')
var os = require('os')
var fse = require(process.cwd())

/* global afterEach, beforeEach, describe, it */

describe('fs-extra', function () {
  var TEST_DIR
  var SRC_FIXTURES_DIR = path.join(__dirname, './fixtures')
  var FILES = ['a-file', path.join('a-folder', 'another-file'), path.join('a-folder', 'another-folder', 'file3')]

  beforeEach(function (done) {
    TEST_DIR = path.join(os.tmpdir(), 'fs-extra', 'copy')
    fse.emptyDir(TEST_DIR, done)
  })

  afterEach(function (done) {
    fse.remove(TEST_DIR, done)
  })

  describe('+ copySync', function () {
    describe('> when modified option is turned off', function () {
      it('should have different timestamps on copy', function (done) {
        var from = path.join(SRC_FIXTURES_DIR)

        fse.copySync(from, TEST_DIR, {preserveTimestamps: false})

        FILES.forEach(testFile({preserveTimestamps: false}))
        done()
      })
    })

    describe('> when modified option is turned on', function () {
      it('should have the same timestamps on copy', function (done) {
        var from = path.join(SRC_FIXTURES_DIR)

        fse.copySync(from, TEST_DIR, {preserveTimestamps: true})

        FILES.forEach(testFile({preserveTimestamps: true}))

        done()
      })
    })

  })

  describe('+ copy', function () {
    describe('> when modified option is turned off', function () {
      it('should have different timestamps on copy', function (done) {
        var from = path.join(SRC_FIXTURES_DIR)
        var to = path.join(TEST_DIR)

        fse.copy(from, to, {preserveTimestamps: false}, function () {
          FILES.forEach(testFile({preserveTimestamps: false}))
          done()
        })
      })
    })

    describe('> when modified option is turned on', function () {
      it('should have the same timestamps on copy', function (done) {
        var from = path.join(SRC_FIXTURES_DIR)
        var to = path.join(TEST_DIR)

        fse.copy(from, to, {preserveTimestamps: true}, function () {
          FILES.forEach(testFile({preserveTimestamps: true}))
          done()
        })
      })
    })

  })

  function testFile (options) {
    return function (file) {
      var a = path.join(SRC_FIXTURES_DIR, file)
      var b = path.join(TEST_DIR, file)
      var fromStat = fs.statSync(a)
      var toStat = fs.statSync(b)
      if (options.preserveTimestamps) {
        assert.deepEqual(toStat.mtime, fromStat.mtime)
        assert.deepEqual(toStat.atime, fromStat.atime)
      } else {
        assert.notEqual(toStat.mtime, fromStat.mtime)
        assert.notEqual(toStat.atime, fromStat.atime)
      }
    }
  }
})
