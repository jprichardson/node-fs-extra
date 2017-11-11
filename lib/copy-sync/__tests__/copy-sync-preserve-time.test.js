'use strict'

const fs = require(process.cwd())
const os = require('os')
const path = require('path')
const utimes = require('../../util/utimes')
const assert = require('assert')

/* global beforeEach, afterEach, describe, it */

if (process.arch === 'ia32') console.warn('32 bit arch; skipping copySync timestamp tests')

const describeIf64 = process.arch === 'ia32' ? describe.skip : describe

describeIf64('copySync() - preserveTimestamps option', () => {
  let TEST_DIR, src, dest

  beforeEach(done => {
    TEST_DIR = path.join(os.tmpdir(), 'fs-extra', 'copy-sync-preserve-time')
    fs.emptyDir(TEST_DIR, done)
  })

  afterEach(done => fs.remove(TEST_DIR, done))

  const FILES = ['a-file', path.join('a-folder', 'another-file'), path.join('a-folder', 'another-folder', 'file3')]

  describe('> when preserveTimestamps option is false', () => {
    it('should have different timestamps on copy', done => {
      src = path.join(TEST_DIR, 'src')
      dest = path.join(TEST_DIR, 'dest')
      FILES.forEach(f => fs.ensureFileSync(path.join(src, f)))

      setTimeout(() => {
        fs.copySync(src, dest, {preserveTimestamps: false})
        FILES.forEach(testFile({preserveTimestamps: false}))
        done()
      }, 100)
    })
  })

  describe('> when preserveTimestamps option is true', () => {
    it('should have the same timestamps on copy', () => {
      src = path.join(TEST_DIR, 'src')
      dest = path.join(TEST_DIR, 'dest')
      FILES.forEach(f => fs.ensureFileSync(path.join(src, f)))

      fs.copySync(src, dest, {preserveTimestamps: true})
      FILES.forEach(testFile({preserveTimestamps: true}))
    })
  })

  function testFile (options) {
    return function (file) {
      const a = path.join(src, file)
      const b = path.join(dest, file)
      const fromStat = fs.statSync(a)
      const toStat = fs.statSync(b)
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
