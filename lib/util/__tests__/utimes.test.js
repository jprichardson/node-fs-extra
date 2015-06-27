var assert = require('assert')
var path = require('path')
var os = require('os')
var fs = require('fs')
var fse = require(process.cwd())
var semver = require('semver')
var utimes = require('../utimes')

/* global beforeEach, describe, it */

describe('utimes', function () {
  var TEST_DIR

  // ignore Node.js v0.10.x
  if (semver.lt(process.version, '0.11.0')) return

  beforeEach(function (done) {
    TEST_DIR = path.join(os.tmpdir(), 'fs-extra', 'utimes')
    fse.emptyDir(TEST_DIR, done)
  })

  describe('hasMillisResSync()', function () {
    it('should return a boolean indicating whether it has support', function () {
      var res = utimes.hasMillisResSync()
      assert.equal(typeof res, 'boolean')

      // HFS => false
      if (process.platform === 'darwin') {
        assert.equal(res, false)
      }

      // does anyone use FAT anymore?
      /*if (process.platform === 'win32') {
        assert.equal(res, true)
      }*/
      // fails on appveyor... could appveyor be using FAT?

      // this would fail if ext2/ext3
      if (process.platform === 'linux') {
        assert.equal(res, true)
      }
    })
  })

  describe('timeRemoveMills()', function () {
    it('should remove millisecond precision from a timestamp', function () {
      var ts = 1334990868773
      var ets = 1334990868000
      assert.strictEqual(utimes.timeRemoveMillis(ts), ets)
      assert.strictEqual(utimes.timeRemoveMillis(new Date(ts)).getTime(), ets)
    })
  })

  describe('utimesMillis()', function () {
    // see discussion https://github.com/jprichardson/node-fs-extra/pull/141
    it('should set the utimes w/ millisecond precision', function (done) {
      var tmpFile = path.join(TEST_DIR, 'someFile')
      fs.writeFileSync(tmpFile, 'hello')

      var stats = fs.lstatSync(tmpFile)

      // Apr 21st, 2012
      var awhileAgo = new Date(1334990868773)
      var awhileAgoNoMillis = new Date(1334990868000)

      assert.notDeepEqual(stats.mtime, awhileAgo)
      assert.notDeepEqual(stats.atime, awhileAgo)

      utimes.utimesMillis(tmpFile, awhileAgo, awhileAgo, function (err) {
        assert.ifError(err)
        stats = fs.statSync(tmpFile)
        if (utimes.HAS_MILLIS_RES) {
          assert.deepEqual(stats.mtime, awhileAgo)
          assert.deepEqual(stats.atime, awhileAgo)
        } else {
          assert.deepEqual(stats.mtime, awhileAgoNoMillis)
          assert.deepEqual(stats.atime, awhileAgoNoMillis)
        }
        done()
      })
    })
  })
})
