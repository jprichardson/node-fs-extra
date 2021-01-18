'use strict'

const fse = require('../..')
const os = require('os')
const path = require('path')
const assert = require('assert')
const atLeastNode = require('at-least-node')

/* eslint-env mocha */

// Used for tests on Node 14.14.0+ only
const describeNode14 = atLeastNode('14.14.0') ? describe : describe.skip

describeNode14('fs.rm', () => {
  let TEST_FILE

  beforeEach(done => {
    TEST_FILE = path.join(os.tmpdir(), 'fs-extra', 'fs-rm')
    fse.remove(TEST_FILE, done)
  })

  afterEach(done => fse.remove(TEST_FILE, done))

  it('supports promises', () => {
    fse.writeFileSync(TEST_FILE, 'hello')
    return fse.rm(TEST_FILE).then(() => {
      assert(!fse.pathExistsSync(TEST_FILE))
    })
  })
})
