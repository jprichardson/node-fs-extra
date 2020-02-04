'use strict'

const os = require('os')
const fse = require('../..')
const path = require('path')
const assert = require('assert')

/* eslint-env mocha */

describe('fs.copyFile', () => {
  let TEST_DIR

  beforeEach(done => {
    TEST_DIR = path.join(os.tmpdir(), 'fs-extra', 'fs-copyfile')
    fse.emptyDir(TEST_DIR, done)
  })

  afterEach(done => fse.remove(TEST_DIR, done))

  it('supports promises', () => {
    const src = path.join(TEST_DIR, 'init.txt')
    const dest = path.join(TEST_DIR, 'copy.txt')
    fse.writeFileSync(src, 'hello')
    return fse.copyFile(src, dest).then(() => {
      const data = fse.readFileSync(dest, 'utf8')
      assert.strictEqual(data, 'hello')
    })
  })
})
