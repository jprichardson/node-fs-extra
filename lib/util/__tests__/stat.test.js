'use strict'

const fs = require(process.cwd())
const os = require('os')
const path = require('path')
const assert = require('assert')
const stat = require('../stat.js')

/* global beforeEach, afterEach, describe, it */

describe('util/stat', () => {
  let TEST_DIR

  beforeEach(done => {
    TEST_DIR = path.join(os.tmpdir(), 'fs-extra', 'util-stat')
    fs.emptyDir(TEST_DIR, done)
  })

  afterEach(done => fs.remove(TEST_DIR, done))

  describe('should use stats with bigint type', () => {
    it('stat.checkPaths()', () => {
      const src = path.join(TEST_DIR, 'src')
      const dest = path.join(TEST_DIR, 'dest')
      fs.ensureFileSync(src)
      fs.ensureFileSync(dest)
      stat.checkPaths(src, dest, 'copy', {}, (err, stats) => {
        assert.ifError(err)
        assert.strictEqual(typeof stats.srcStat.ino, 'bigint')
      })
    })

    it('stat.checkPathsSync()', () => {
      const src = path.join(TEST_DIR, 'src')
      const dest = path.join(TEST_DIR, 'dest')
      fs.ensureFileSync(src)
      fs.ensureFileSync(dest)
      const { srcStat } = stat.checkPathsSync(src, dest, 'copy', {})
      assert.strictEqual(typeof srcStat.ino, 'bigint')
    })
  })

  describe('should stop at src or root path and not throw max call stack size error', () => {
    it('stat.checkParentPaths()', () => {
      const src = path.join(TEST_DIR, 'src')
      let dest = path.join(TEST_DIR, 'dest')
      fs.ensureFileSync(src)
      fs.ensureFileSync(dest)
      dest = path.basename(dest)
      const srcStat = fs.statSync(src)
      stat.checkParentPaths(src, srcStat, dest, 'copy', err => {
        assert.ifError(err)
      })
    })

    it('stat.checkParentPathsSync()', () => {
      const src = path.join(TEST_DIR, 'src')
      let dest = path.join(TEST_DIR, 'dest')
      fs.ensureFileSync(src)
      fs.ensureFileSync(dest)
      dest = path.basename(dest)
      const srcStat = fs.statSync(src)
      stat.checkParentPathsSync(src, srcStat, dest, 'copy')
    })
  })
})
