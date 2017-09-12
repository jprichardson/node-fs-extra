'use strict'

/* eslint-env mocha */

const fse = require('..')

const methods = [
  'copy',
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
})
