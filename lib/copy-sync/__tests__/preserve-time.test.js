var assert = require('assert')
var fs = require('fs')
var os = require('os')
var path = require('path')
var copySync = require('../copy-sync')
var utimes = require('../../util/utimes')

/* global beforeEach, describe, it */

describe('copy', function () {
  var TEST_DIR

  beforeEach(function (done) {
    TEST_DIR = path.join(os.tmpdir(), 'fs-extra', 'copy')
    require(process.cwd()).emptyDir(TEST_DIR, done)
  })

  describe('> modification option', function () {
    var SRC_FIXTURES_DIR = path.join(__dirname, './fixtures')
    var FILES = ['a-file', path.join('a-folder', 'another-file'), path.join('a-folder', 'another-folder', 'file3')]

    describe('> when modified option is turned off', function () {
      it('should have different timestamps on copy', function () {
        var from = path.join(SRC_FIXTURES_DIR)
        copySync(from, TEST_DIR, {preserveTimestamps: false})
        FILES.forEach(testFile({preserveTimestamps: false}))
      })
    })

    describe('> when modified option is turned on', function () {
      it('should have the same timestamps on copy', function () {
        var from = path.join(SRC_FIXTURES_DIR)
        copySync(from, TEST_DIR, {preserveTimestamps: true})
        FILES.forEach(testFile({preserveTimestamps: true}))
      })
    })

    function testFile (options) {
      return function (file) {
        var a = path.join(SRC_FIXTURES_DIR, file)
        var b = path.join(TEST_DIR, file)
        var fromStat = fs.statSync(a)
        var toStat = fs.statSync(b)
        if (options.preserveTimestamps) {
          // https://github.com/nodejs/io.js/issues/2069
          if (process.platform !== 'win32') {
            assert.strictEqual(toStat.mtime.getTime(), fromStat.mtime.getTime())
            assert.strictEqual(toStat.atime.getTime(), fromStat.atime.getTime())
          } else {
            assert.strictEqual(toStat.mtime.getTime(), utimes.timeRemoveMillis(fromStat.mtime.getTime()))
            assert.strictEqual(toStat.atime.getTime(), utimes.timeRemoveMillis(fromStat.atime.getTime()))
          }
        } else {
          assert.notEqual(toStat.mtime.getTime(), fromStat.mtime.getTime())
          // the access time might actually be the same, so check only modification time
        }
      }
    }

  })
})
