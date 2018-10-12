'use strict'

const fs = require('../../')
const os = require('os')
const path = require('path')
const copySync = require('../copy-sync')
const utimesSync = require('../../util/utimes').utimesMillisSync
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

  function setupFixture (readonly) {
    TEST_DIR = path.join(os.tmpdir(), 'fs-extra', 'copy-sync-preserve-timestamp')
    SRC = path.join(TEST_DIR, 'src')
    DEST = path.join(TEST_DIR, 'dest')
    FILES = ['a-file', path.join('a-folder', 'another-file'), path.join('a-folder', 'another-folder', 'file3')]
    const timestamp = Date.now() / 1000 - 5
    FILES.forEach(f => {
      const filePath = path.join(SRC, f)
      fs.ensureFileSync(filePath)
      // rewind timestamps to make sure that coarser OS timestamp resolution
      // does not alter results
      utimesSync(filePath, timestamp, timestamp)
      if (readonly) {
        fs.chmodSync(filePath, 0o444)
      }
    })
  }

  afterEach(done => fs.remove(TEST_DIR, done))

  describe('> when preserveTimestamps option is true', () => {
    ;[
      { subcase: 'writable', readonly: false },
      { subcase: 'readonly', readonly: true }
    ].forEach(params => {
      describe(`>> with ${params.subcase} source files`, () => {
        beforeEach(() => setupFixture(params.readonly))

        it('should have the same timestamps on copy', () => {
          copySync(SRC, DEST, { preserveTimestamps: true })
          FILES.forEach(testFile({ preserveTimestamps: true }))
        })
      })
    })
  })

  function testFile (options) {
    return function (file) {
      const a = path.join(SRC, file)
      const b = path.join(DEST, file)
      const fromStat = fs.statSync(a)
      const toStat = fs.statSync(b)
      if (options.preserveTimestamps) {
        // Windows sub-second precision fixed: https://github.com/nodejs/io.js/issues/2069
        assert.strictEqual(toStat.mtime.getTime(), fromStat.mtime.getTime(), 'different mtime values')
        assert.strictEqual(toStat.atime.getTime(), fromStat.atime.getTime(), 'different atime values')
      } else {
        assert.notStrictEqual(toStat.mtime.getTime(), fromStat.mtime.getTime(), 'same mtime values')
        // the access time might actually be the same, so check only modification time
      }
    }
  }
})
