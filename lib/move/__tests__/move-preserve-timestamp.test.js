'use strict'

const fs = require('../../')
const os = require('os')
const path = require('path')
const utimesSync = require('../../util/utimes').utimesMillisSync
const assert = require('assert')
const fse = require('../../index')

/* global beforeEach, afterEach, describe, it */

if (process.arch === 'ia32') console.warn('32 bit arch; skipping move timestamp tests')

const describeIfPractical = process.arch === 'ia32' ? describe.skip : describe

describeIfPractical('move() - across different devices', () => {
  let TEST_DIR, SRC, DEST, FILES
  let __skipTests = false
  const differentDevicePath = '/mnt'

  // must set this up, if not, exit silently
  if (!fs.existsSync(differentDevicePath)) {
    console.log('Skipping cross-device move test')
    __skipTests = true
  }

  // make sure we have permission on device
  try {
    fs.writeFileSync(path.join(differentDevicePath, 'file'), 'hi')
  } catch {
    console.log("Can't write to device. Skipping move test.")
    __skipTests = true
  }

  function setupFixture (readonly) {
    TEST_DIR = path.join(os.tmpdir(), 'fs-extra', 'move-sync-preserve-timestamp')
    SRC = path.join(differentDevicePath, 'some/weird/dir-really-weird')
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

  const _it = __skipTests ? it.skip : it

  afterEach(() => {
    fse.removeSync(TEST_DIR)
    fse.removeSync(SRC)
  })

  describe('> default behaviour', () => {
    ;[
      { subcase: 'writable', readonly: false },
      { subcase: 'readonly', readonly: true }
    ].forEach(params => {
      describe(`>> with ${params.subcase} source files`, () => {
        beforeEach(() => setupFixture(params.readonly))

        _it('should have the same timestamps after move', done => {
          const originalTimestamps = FILES.map(file => {
            const originalPath = path.join(SRC, file)
            const originalStat = fs.statSync(originalPath)
            return {
              mtime: originalStat.mtime.getTime(),
              atime: originalStat.atime.getTime()
            }
          })
          fse.move(SRC, DEST, {}, (err) => {
            if (err) return done(err)
            FILES.forEach(testFile({}, originalTimestamps))
            done()
          })
        })
      })
    })
  })

  function testFile (options, originalTimestamps) {
    return function (file, idx) {
      const originalTimestamp = originalTimestamps[idx]
      const currentPath = path.join(DEST, file)
      const currentStats = fs.statSync(currentPath)
      assert.strictEqual(currentStats.mtime.getTime(), originalTimestamp.mtime, 'different mtime values')
      assert.strictEqual(currentStats.atime.getTime(), originalTimestamp.atime, 'different atime values')
    }
  }
})
