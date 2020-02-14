'use strict'

/* eslint-env mocha */

const assert = require('assert')
const fs = require('fs')
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

  if (Object.getOwnPropertyDescriptor(fs, 'promises')) {
    it('provides fse.promises API', () => {
      const desc = Object.getOwnPropertyDescriptor(fse, 'promises')
      assert.ok(desc)
      assert.strictEqual(typeof desc.get, 'function')
    })
  }
})
