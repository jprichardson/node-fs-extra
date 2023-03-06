'use strict'

const fs = require('../../')
const os = require('os')
const path = require('path')
const utimesSync = require('../../util/utimes').utimesMillisSync
const assert = require('assert')
const fse = require('../../index')
const { differentDevice, ifCrossDeviceEnabled } = require('./cross-device-utils')

/* global beforeEach, afterEach, describe, it */

if (process.arch === 'ia32') console.warn('32 bit arch; skipping move timestamp tests')

const describeIfPractical = process.arch === 'ia32' ? describe.skip : describe

describeIfPractical('moveSync() - across different devices', () => {
  let TEST_DIR, SRC, DEST, FILES

  function setupFixture (readonly) {
    TEST_DIR = path.join(os.tmpdir(), 'fs-extra', 'move-sync-preserve-timestamp')
    SRC = path.join(differentDevice, 'some/weird/dir-really-weird')
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

  afterEach(() => {
    fse.removeSync(TEST_DIR)
    fse.removeSync(SRC)
  })

  ifCrossDeviceEnabled(describe)('> default behaviour', () => {
    ;[
      { subcase: 'writable', readonly: false },
      { subcase: 'readonly', readonly: true }
    ].forEach(params => {
      describe(`>> with ${params.subcase} source files`, () => {
        beforeEach(() => setupFixture(params.readonly))

        it('should have the same timestamps after move', () => {
          const originalTimestamps = FILES.map(file => {
            const originalPath = path.join(SRC, file)
            const originalStat = fs.statSync(originalPath)
            return {
              mtime: originalStat.mtime.getTime(),
              atime: originalStat.atime.getTime()
            }
          })
          fse.moveSync(SRC, DEST, {})
          FILES.forEach(testFile({}, originalTimestamps))
        })
      })
    })
  })

  function testFile (options, originalTimestamps) {
    return function (file, idx) {
      const originalTimestamp = originalTimestamps[idx]
      const currentPath = path.join(DEST, file)
      const currentStats = fs.statSync(currentPath)
      // Windows sub-second precision fixed: https://github.com/nodejs/io.js/issues/2069
      assert.strictEqual(currentStats.mtime.getTime(), originalTimestamp.mtime, 'different mtime values')
      assert.strictEqual(currentStats.atime.getTime(), originalTimestamp.atime, 'different atime values')
    }
  }
})
