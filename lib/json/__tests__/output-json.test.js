'use strict'

const fs = require('fs')
const os = require('os')
const fse = require(process.cwd())
const path = require('path')
const assert = require('assert')

/* global beforeEach, describe, it */

describe('json', () => {
  let TEST_DIR

  beforeEach(done => {
    TEST_DIR = path.join(os.tmpdir(), 'fs-extra-output-json')
    fse.emptyDir(TEST_DIR, done)
  })

  describe('+ outputJson(file, data)', () => {
    it('should write the file regardless of whether the directory exists or not', done => {
      const file = path.join(TEST_DIR, 'this-dir', 'prob-does-not', 'exist', 'file.json')
      assert(!fs.existsSync(file))

      const data = { name: 'JP' }
      fse.outputJson(file, data, err => {
        if (err) return done(err)

        assert(fs.existsSync(file))
        const newData = JSON.parse(fs.readFileSync(file, 'utf8'))

        assert.strictEqual(data.name, newData.name)
        done()
      })
    })

    it('should be mutation-proof', async () => {
      const dir = path.join(TEST_DIR, 'this-dir', 'certanly-does-not', 'exist')
      const file = path.join(dir, 'file.json')
      assert(!fs.existsSync(dir), 'directory cannot exist')

      const name = 'JP'
      const data = { name }
      const promise = fse.outputJson(file, data)
      // Mutate data right after call
      data.name = 'Ryan'
      // now await for the call to finish
      await promise

      assert(fs.existsSync(file))
      const newData = JSON.parse(fs.readFileSync(file, 'utf8'))

      // mutation did not change data
      assert.strictEqual(newData.name, name)
    })

    it('should support Promises', () => {
      const file = path.join(TEST_DIR, 'this-dir', 'prob-does-not', 'exist', 'file.json')
      assert(!fs.existsSync(file))

      const data = { name: 'JP' }
      return fse.outputJson(file, data)
    })

    describe('> when an option is passed, like JSON replacer', () => {
      it('should pass the option along to jsonfile module', done => {
        const file = path.join(TEST_DIR, 'this-dir', 'does-not', 'exist', 'really', 'file.json')
        assert(!fs.existsSync(file))

        const replacer = (k, v) => v === 'JP' ? 'Jon Paul' : v
        const data = { name: 'JP' }

        fse.outputJson(file, data, { replacer }, err => {
          assert.ifError(err)
          const newData = JSON.parse(fs.readFileSync(file, 'utf8'))
          assert.strictEqual(newData.name, 'Jon Paul')
          done()
        })
      })
    })

    describe('> exit with error when missing or invalid arguments', () => {
      it('passing non-string for file should result in error', done => {
        fse.outputJson(3, {}).catch(err => {
          assert.strictEqual(err.toString(), 'TypeError: [ERR_INVALID_ARG_TYPE] the "file" argument must be of type string')
          done()
        })
      })

      it('passing non-object for data should result in error', done => {
        fse.outputJson('file.json', 'bad arg').catch(err => {
          assert.strictEqual(err.toString(), 'TypeError: [ERR_INVALID_ARG_TYPE] the "data" argument must be of type object')
          done()
        })
      })

      it('passing only a callback argument should result in error', done => {
        fse.outputJson(() => {}).catch(err => {
          assert.strictEqual(err.toString(), 'TypeError: [ERR_INVALID_ARG_TYPE] the "file" argument must be of type string')
          done()
        })
      })
    })
  })
})
