'use strict'

const fs = require('graceful-fs')
const memfs = require('memfs')
const os = require('os')
const fse = require(process.cwd())
const path = require('path')
const assert = require('assert')
const utimesFac = require('../utimes')
let utimes

/* global beforeEach, describe, it */

describe('utimes', () => {
  let TEST_DIR

  beforeEach(done => {
    TEST_DIR = path.join(os.tmpdir(), 'fs-extra', 'utimes')
    fse.emptyDir(TEST_DIR, done)
    // reset stubs
    utimes = utimesFac(fs)
  })

  describe('hasMillisResSync()', () => {
    it('should return a boolean indicating whether it has support', () => {
      const res = utimes.hasMillisResSync()
      assert.strictEqual(typeof res, 'boolean')
      
      // HFS => true
      if (process.platform === 'darwin') assert.strictEqual(res, true)

      // does anyone use FAT anymore?
      // if (process.platform === 'win32') assert.strictEqual(res, true)
      // fails on appveyor... could appveyor be using FAT?

      // this would fail if ext2/ext3
      if (process.platform === 'linux') assert.strictEqual(res, true)

      // memfs => false, because os.tmpdir() does not exist so we can't
      // make sure
      assert.strictEqual(utimesFac(memfs).hasMillisResSync(), false)
    })
  })

  describe('timeRemoveMills()', () => {
    it('should remove millisecond precision from a timestamp', () => {
      const ts = 1334990868773
      const ets = 1334990868000
      assert.strictEqual(utimes.timeRemoveMillis(ts), ets)
      assert.strictEqual(utimes.timeRemoveMillis(new Date(ts)).getTime(), ets)
    })
  })

  describe('utimesMillis()', () => {
    // see discussion https://github.com/jprichardson/node-fs-extra/pull/141
    it('should set the utimes w/ millisecond precision', done => {
      const tmpFile = path.join(TEST_DIR, 'someFile')
      fs.writeFileSync(tmpFile, 'hello')

      let stats = fs.lstatSync(tmpFile)

      // Apr 21st, 2012
      const awhileAgo = new Date(1334990868773)
      const awhileAgoNoMillis = new Date(1334990868000)

      assert.notDeepStrictEqual(stats.mtime, awhileAgo)
      assert.notDeepStrictEqual(stats.atime, awhileAgo)

      utimes.utimesMillis(tmpFile, awhileAgo, awhileAgo, err => {
        assert.ifError(err)
        stats = fs.statSync(tmpFile)
        if (utimes.hasMillisResSync()) {
          assert.deepStrictEqual(stats.mtime, awhileAgo)
          assert.deepStrictEqual(stats.atime, awhileAgo)
        } else {
          assert.deepStrictEqual(stats.mtime, awhileAgoNoMillis)
          assert.deepStrictEqual(stats.atime, awhileAgoNoMillis)
        }
        done()
      })
    })

    it('should close open file desciptors after encountering an error', done => {
      const fakeFd = Math.random()
      const gracefulFsStub = Object.assign({}, fs)

      gracefulFsStub.open = (pathIgnored, flagsIgnored, modeIgnored, callback) => {
        if (typeof modeIgnored === 'function') callback = modeIgnored
        process.nextTick(() => callback(null, fakeFd))
      }

      let closeCalled = false
      gracefulFsStub.close = (fd, callback) => {
        assert.strictEqual(fd, fakeFd)
        closeCalled = true
        if (callback) process.nextTick(callback)
      }

      let testError
      gracefulFsStub.futimes = (fd, atimeIgnored, mtimeIgnored, callback) => {
        process.nextTick(() => {
          testError = new Error('A test error')
          callback(testError)
        })
      }
      
      utimes = utimesFac(gracefulFsStub)

      utimes.utimesMillis('ignored', 'ignored', 'ignored', err => {
        assert.strictEqual(err, testError)
        assert(closeCalled)
        done()
      })
    })
  })
})
