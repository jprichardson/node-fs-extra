'use strict'

const fs = require('fs')
const os = require('os')
const path = require('path')
const utimes = require('../../util/utimes')
const assert = require('assert')
const copySync = require('../copy-sync')

/* global beforeEach, describe, it */

describe('copy', () => {
  let TEST_DIR

  beforeEach(done => {
    TEST_DIR = path.join(os.tmpdir(), 'fs-extra', 'copy-sync-preserve-time')
    require(process.cwd()).emptyDir(TEST_DIR, done)
  })

  describe('> modification option', () => {
    const SRC_FIXTURES_DIR = path.join(__dirname, './fixtures')
    const FILES = ['a-file', path.join('a-folder', 'another-file'), path.join('a-folder', 'another-folder', 'file3')]

    describe('> when modified option is turned off', () => {
      it('should have different timestamps on copy', () => {
        const from = path.join(SRC_FIXTURES_DIR)
        copySync(from, TEST_DIR, {preserveTimestamps: false})
        FILES.forEach(testFile({preserveTimestamps: false}))
      })
    })

    describe('> when modified option is turned on', () => {
      it('should have the same timestamps on copy', () => {
        const from = path.join(SRC_FIXTURES_DIR)
        copySync(from, TEST_DIR, {preserveTimestamps: true})
        FILES.forEach(testFile({preserveTimestamps: true}))
      })
    })

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
