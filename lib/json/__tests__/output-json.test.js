'use strict'

const fs = require('fs')
const os = require('os')
const fse = require(process.cwd())
const path = require('path')
const assert = require('assert')
const outputJson = require('../output-json')

/* global beforeEach, describe, it */

describe('json', () => {
  let TEST_DIR

  beforeEach(done => {
    TEST_DIR = path.join(os.tmpdir(), 'fs-extra')
    fse.emptyDir(TEST_DIR, done)
  })

  describe('+ outputJson(file, data)', () => {
    it('should write the file regardless of whether the directory exists or not', done => {
      const file = path.join(TEST_DIR, 'this-dir', 'prob-does-not', 'exist', 'file.json')
      assert(!fs.existsSync(file))

      const data = {name: 'JP'}
      outputJson(file, data, err => {
        if (err) return done(err)

        assert(fs.existsSync(file))
        const newData = JSON.parse(fs.readFileSync(file, 'utf8'))

        assert.strictEqual(data.name, newData.name)
        done()
      })
    })

    it('should support Promises', () => {
      const file = path.join(TEST_DIR, 'this-dir', 'prob-does-not', 'exist', 'file.json')
      assert(!fs.existsSync(file))

      const data = {name: 'JP'}
      return outputJson(file, data)
    })

    describe('> when an option is passed, like JSON replacer', () => {
      it('should pass the option along to jsonfile module', done => {
        const file = path.join(TEST_DIR, 'this-dir', 'does-not', 'exist', 'really', 'file.json')
        assert(!fs.existsSync(file))

        const replacer = (k, v) => v === 'JP' ? 'Jon Paul' : v
        const data = {name: 'JP'}

        outputJson(file, data, { replacer }, err => {
          assert.ifError(err)
          const newData = JSON.parse(fs.readFileSync(file, 'utf8'))
          assert.strictEqual(newData.name, 'Jon Paul')
          done()
        })
      })
    })
  })
})
