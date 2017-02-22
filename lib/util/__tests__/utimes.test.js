'use strict'

const fs = require('fs')
const os = require('os')
const fse = require(process.cwd())
const path = require('path')
const assert = require('assert')
const proxyquire = require('proxyquire')
let gracefulFsStub
let utimes

/* global beforeEach, describe, it */

describe('utimes', () => {
  let TEST_DIR

  beforeEach(done => {
    TEST_DIR = path.join(os.tmpdir(), 'fs-extra', 'utimes')
    fse.emptyDir(TEST_DIR, done)
    // reset stubs
    gracefulFsStub = {}
    utimes = proxyquire('../utimes', {'graceful-fs': gracefulFsStub})
  })

  describe('hasMillisResSync()', () => {
    it('should return a boolean indicating whether it has support', () => {
      const res = utimes.hasMillisResSync()
      assert.equal(typeof res, 'boolean')

      // HFS => false
      if (process.platform === 'darwin') assert.equal(res, false)

      // does anyone use FAT anymore?
      // if (process.platform === 'win32') assert.equal(res, true)
      // fails on appveyor... could appveyor be using FAT?

      // this would fail if ext2/ext3
      if (process.platform === 'linux') assert.equal(res, true)
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

      assert.notDeepEqual(stats.mtime, awhileAgo)
      assert.notDeepEqual(stats.atime, awhileAgo)

      utimes.utimesMillis(tmpFile, awhileAgo, awhileAgo, err => {
        assert.ifError(err)
        stats = fs.statSync(tmpFile)
        if (utimes.hasMillisResSync()) {
          assert.deepEqual(stats.mtime, awhileAgo)
          assert.deepEqual(stats.atime, awhileAgo)
        } else {
          assert.deepEqual(stats.mtime, awhileAgoNoMillis)
          assert.deepEqual(stats.atime, awhileAgoNoMillis)
        }
        done()
      })
    })

    it('should close open file desciptors after encountering an error', done => {
      const fakeFd = Math.random()

      gracefulFsStub.open = (pathIgnored, flagsIgnored, modeIgnored, callback) => {
        if (typeof modeIgnored === 'function') callback = modeIgnored
        process.nextTick(() => callback(null, fakeFd))
      }

      let closeCalled = false
      gracefulFsStub.close = (fd, callback) => {
        assert.equal(fd, fakeFd)
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

      utimes.utimesMillis('ignored', 'ignored', 'ignored', err => {
        assert.equal(err, testError)
        assert(closeCalled)
        done()
      })
    })
  })
})
