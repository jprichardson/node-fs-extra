'use strict'

/* eslint-env mocha */

const assert = require('assert')
const fse = require('..')

const methods = [
  'emptyDir',
  'ensureFile',
  'ensureDir',
  'mkdirs',
  'move',
  'readJson',
  'readJSON',
  'remove'
]

describe('promise support', () => {
  methods.forEach(method => {
    it(method, done => {
      fse[method]().catch(() => done())
    })
  })

  it('provides fse.promises API', () => {
    assert.ok(fse.promises)
    assert.strictEqual(typeof fse.promises.writeFile, 'function')
  })
})
