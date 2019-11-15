/* global afterEach, beforeEach, describe, it */
'use strict'

/* eslint-env mocha */

const assert = require('assert')
const os = require('os')
const path = require('path')
const { Volume, createFsFromVolume } = require('memfs')
const realFse = require('..')

describe('constructor with virtual fs implementation', () => {
  let TEST_DIR = ''
  let fseInstance
  let vol

  beforeEach(() => {
    TEST_DIR = path.join(os.tmpdir(), 'fs-extra', 'alternative-fs')
    vol = new Volume()
    fseInstance = new realFse.FsExtra(createFsFromVolume(vol))
  })

  afterEach(done => realFse.remove(TEST_DIR, done))

  it('uses the passed fs instead of the real module', async () => {
    const jsonFile = path.join(TEST_DIR, 'some.json')
    await assert.doesNotReject(fseInstance.outputJson(jsonFile, { some: 'json' }))
    assert.throws(() => realFse.readFileSync(jsonFile), 'not written to real filesystem')
    let writtenJson
    assert.doesNotThrow(() => {
      writtenJson = JSON.parse(vol.readFileSync(jsonFile))
    }, 'written to virtual filesystem')
    assert.deepStrictEqual(writtenJson, { some: 'json' }, 'expected json')
  })
})
