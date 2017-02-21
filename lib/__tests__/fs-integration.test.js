'use strict'

const os = require('os')
const fs = require('fs')
const fse = require('../')
const path = require('path')
const assert = require('assert')

/* global afterEach, beforeEach, describe, it */

describe('native fs', () => {
  let TEST_DIR

  beforeEach(done => {
    TEST_DIR = path.join(os.tmpdir(), 'fs-extra', 'native-fs')
    fse.emptyDir(TEST_DIR, done)
  })

  afterEach(done => fse.remove(TEST_DIR, done))

  it('should use native fs methods', () => {
    const file = path.join(TEST_DIR, 'write.txt')
    fse.writeFileSync(file, 'hello')
    const data = fse.readFileSync(file, 'utf8')
    assert.equal(data, 'hello')
  })

  it('should have native fs constants', () => {
    // Node.js v0.12 / IO.js
    if ('F_OK' in fs) {
      assert.equal(fse.F_OK, fs.F_OK)
    }
  })
})
