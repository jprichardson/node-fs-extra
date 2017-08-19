'use strict'

const fs = require('fs')
const os = require('os')
const path = require('path')
const copy = require('../copy')
const utimes = require('../../util/utimes')
const assert = require('assert')

/* global beforeEach, describe, it */

if (process.arch === 'ia32') console.warn('32 bit arch; skipping copy timestamp tests')

const describeIf64 = process.arch === 'ia32' ? describe.skip : describe

describeIf64('copy', () => {
  const TEST_DIR = path.join(os.tmpdir(), 'fs-extra', 'copy')

  beforeEach(done => {
    require(process.cwd()).emptyDir(TEST_DIR, done)
  })

  describe('> modification option', () => {
    const SRC_FIXTURES_DIR = path.join(__dirname, '/fixtures')
    const FILES = ['a-file', path.join('a-folder', 'another-file'), path.join('a-folder', 'another-folder', 'file3')]
    const readOnlyFile = 'b-file'

    describe('> when modified option is turned off', () => {
      it('should have different timestamps on copy', done => {
        const from = path.join(SRC_FIXTURES_DIR)
        const to = path.join(TEST_DIR)

        copy(from, to, {preserveTimestamps: false}, () => {
          FILES.forEach(testFile({preserveTimestamps: false}))
          done()
        })
      })
    })

    describe('> when modified option is turned on', () => {
      it('should have the same timestamps on copy', done => {
        const from = path.join(SRC_FIXTURES_DIR)
        const to = path.join(TEST_DIR)

        copy(from, to, {preserveTimestamps: true}, () => {
          FILES.forEach(testFile({preserveTimestamps: true}))
          done()
        })
      })

      describe('> with a read-only file', () => {
        const src = path.join(SRC_FIXTURES_DIR, readOnlyFile)
        const dest = path.join(TEST_DIR, readOnlyFile)

        beforeEach(() => assertPermission(src, '444', {
          tryToSet: true,
          message: `Couldn't assert read-only permission`
        }))

        it('should have the same timestamps on copy', done => {
          copy(src, dest, { preserveTimestamps: true }, () => {
            testFile({ preserveTimestamps: true })(readOnlyFile)
            done()
          })
        })
      })
    })

    function assertPermission (file, permissionString, options) {
      options = options || {}
      const stat = fs.statSync(file)
      const statPerm = (stat.mode & parseInt('777', 8)).toString(8)
      if (statPerm !== permissionString && options.tryToSet) {
        fs.chmodSync(file, permissionString)
      }
      assert.equal(permissionString, statPerm, options.message)
    }

    function testFile (options) {
      return function (file) {
        const a = path.join(SRC_FIXTURES_DIR, file)
        const b = path.join(TEST_DIR, file)
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
})
