'use strict'

const fs = require('fs')
const os = require('os')
const fse = require('../../')
const path = require('path')
const assert = require('assert')

/* global afterEach, beforeEach, describe, it */
// trinity: mocha

describe('json spaces', () => {
  let TEST_DIR

  beforeEach(done => {
    TEST_DIR = path.join(os.tmpdir(), 'fs-extra', 'json-spaces')
    fse.emptyDir(TEST_DIR, done)
  })

  afterEach(done => fse.remove(TEST_DIR, done))

  it('should write out the file with appropriate spacing (2)', () => {
    fse.spaces = 2 // for legacy compatibility
    assert.strictEqual(fse.spaces, 2)

    const tempFile = path.join(TEST_DIR, 'temp.json')

    const data = { first: 'JP', last: 'Richardson' }
    fse.outputJsonSync(tempFile, data)

    const dataRead = fs.readFileSync(tempFile, 'utf8')
    assert.strictEqual(dataRead, JSON.stringify(data, null, 2) + '\n')
  })
})
