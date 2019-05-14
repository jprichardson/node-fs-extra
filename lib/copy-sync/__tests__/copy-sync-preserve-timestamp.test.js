'use strict'

const fs = require('../../')
const os = require('os')
const path = require('path')
const utimes = require('../../util/utimes')
const assert = require('assert')
const semver = require('semver')
const nodeVersion = process.version
const nodeVersionMajor = semver.major(nodeVersion)

/* global beforeEach, afterEach, describe, it */

if (process.arch === 'ia32') console.warn('32 bit arch; skipping copySync timestamp tests')
if (nodeVersionMajor < 8) console.warn(`old node version (v${nodeVersion}); skipping copySync timestamp tests`)

const describeIfPractical = (process.arch === 'ia32' || nodeVersionMajor < 8) ? describe.skip : describe

describeIfPractical('copySync() - preserveTimestamps option', () => {
  let TEST_DIR, SRC, DEST, FILES

  beforeEach(done => {
    TEST_DIR = path.join(os.tmpdir(), 'fs-extra', 'copy-sync-preserve-time')
    SRC = path.join(TEST_DIR, 'src')
    DEST = path.join(TEST_DIR, 'dest')
    FILES = ['a-file', path.join('a-folder', 'another-file'), path.join('a-folder', 'another-folder', 'file3')]
    FILES.forEach(f => fs.ensureFileSync(path.join(SRC, f)))
    done()
  })

  afterEach(done => fs.remove(TEST_DIR, done))

  describe('> when preserveTimestamps option is true', () => {
    it('should have the same timestamps on copy', () => {
      fs.copySync(SRC, DEST, { preserveTimestamps: true })
      FILES.forEach(testFile({ preserveTimestamps: true }))
    })
  })

  function testFile (options) {
    return function (file) {
      const a = path.join(SRC, file)
      const b = path.join(DEST, file)
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
        assert.notStrictEqual(toStat.mtime.getTime(), fromStat.mtime.getTime())
        // the access time might actually be the same, so check only modification time
      }
    }
  }
})
