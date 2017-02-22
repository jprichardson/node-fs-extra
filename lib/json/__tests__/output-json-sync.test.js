'use strict'

const fs = require('fs')
const os = require('os')
const fse = require(process.cwd())
const path = require('path')
const assert = require('assert')
const outputJsonSync = require('../output-json-sync')

/* global beforeEach, describe, it */

describe('json', () => {
  let TEST_DIR

  beforeEach(done => {
    TEST_DIR = path.join(os.tmpdir(), 'fs-extra')
    fse.emptyDir(TEST_DIR, done)
  })

  describe('+ outputJsonSync(file, data)', () => {
    it('should write the file regardless of whether the directory exists or not', () => {
      const file = path.join(TEST_DIR, 'this-dir', 'does-not', 'exist', 'file.json')
      assert(!fs.existsSync(file))

      const data = {name: 'JP'}
      outputJsonSync(file, data)

      assert(fs.existsSync(file))
      const newData = JSON.parse(fs.readFileSync(file, 'utf8'))

      assert.equal(data.name, newData.name)
    })

    describe('> when an option is passed, like JSON replacer', () => {
      it('should pass the option along to jsonfile module', () => {
        const file = path.join(TEST_DIR, 'this-dir', 'does-not', 'exist', 'really', 'file.json')
        assert(!fs.existsSync(file))

        const replacer = (k, v) => v === 'JP' ? 'Jon Paul' : v
        const data = {name: 'JP'}

        outputJsonSync(file, data, { replacer })
        const newData = JSON.parse(fs.readFileSync(file, 'utf8'))

        assert.equal(newData.name, 'Jon Paul')
      })
    })
  })
})
