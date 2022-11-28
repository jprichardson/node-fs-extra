'use strict'

const os = require('os')
const fse = require('../..')
const path = require('path')
const assert = require('assert')
const util = require('util')

/* global before, describe, it */

describe('mkdirp: issue-93, win32, when drive does not exist, it should return a cleaner error', () => {
  let TEST_DIR

  // only seems to be an issue on Windows.
  if (process.platform !== 'win32') return

  before(done => {
    TEST_DIR = path.join(os.tmpdir(), 'tests', 'fs-extra', 'mkdirp-issue-93')
    fse.emptyDir(TEST_DIR, err => {
      assert.ifError(err)
      done()
    })
  })

  it('should return a cleaner error than inifinite loop, stack crash', done => {
    const file = 'R:\\afasd\\afaff\\fdfd' // hopefully drive 'r' does not exist on appveyor
    // Different error codes on different Node versions (matches native mkdir behavior)
    const assertErr = (err) => assert(
      ['EPERM', 'ENOENT'].includes(err.code),
      `expected 'EPERM' or 'ENOENT', got ${util.inspect(err.code)}`
    )

    fse.mkdirp(file, err => {
      assertErr(err)

      try {
        fse.mkdirsSync(file)
      } catch (err) {
        assertErr(err)
      }

      done()
    })
  })
})
