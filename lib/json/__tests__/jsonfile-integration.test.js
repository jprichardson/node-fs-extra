'use strict'

const fs = require('fs')
const os = require('os')
const fse = require(process.cwd())
const path = require('path')
const assert = require('assert')

/* global afterEach, beforeEach, describe, it */

describe('jsonfile-integration', () => {
  let TEST_DIR

  beforeEach(done => {
    TEST_DIR = path.join(os.tmpdir(), 'fs-extra', 'json')
    fse.emptyDir(TEST_DIR, done)
  })

  afterEach(done => fse.remove(TEST_DIR, done))

  describe('+ writeJsonSync / spaces', () => {
    it('should read a file and parse the json', () => {
      const obj1 = {
        firstName: 'JP',
        lastName: 'Richardson'
      }

      const file = path.join(TEST_DIR, 'file.json')
      fse.writeJsonSync(file, obj1)
      const data = fs.readFileSync(file, 'utf8')
      assert.strictEqual(data, JSON.stringify(obj1) + '\n')
    })
  })
})
