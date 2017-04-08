'use strict'

/* eslint-env mocha */

const fse = require('..')

const methods = [
  'copy',
  'emptyDir',
  'ensureFile',
  'ensureDir',
  'ensureLink',
  'ensureSymlink',
  'mkdirs',
  'move',
  'readJson',
  'readJSON',
  'remove',
  'writeJson',
  'writeJSON'
]

describe('promise support', () => {
  methods.forEach(method => {
    it(method, done => {
      fse[method]().catch(() => done())
    })
  })
})
