'use strict'

const fs = require('fs')
const os = require('os')
const fse = require('../../')
const path = require('path')
const assert = require('assert')

/* global afterEach, beforeEach, describe, it */

let TEST_DIR = ''

describe('fs-extra', () => {
  beforeEach(done => {
    TEST_DIR = path.join(os.tmpdir(), 'test', 'fs-extra', 'copy-dev-null')
    fse.emptyDir(TEST_DIR, done)
  })

  afterEach(done => fse.remove(TEST_DIR, done))

  describe('+ copy()', () => {
    it('should error', done => {
      // no /dev/null on windows
      if (process.platform === 'win32') return done()

      const tmpFile = path.join(TEST_DIR, 'foo')

      fse.copy('/dev/null', tmpFile, err => {
        assert.ifError(err)
        const stats = fs.lstatSync(tmpFile)
        assert.strictEqual(stats.size, 0)
        done()
      })
    })
  })
})
