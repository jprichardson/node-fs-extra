'use strict'
// This is adapted from https://github.com/normalize/mz
// Copyright (c) 2014-2016 Jonathan Ong me@jongleberry.com and Contributors

/* eslint-env mocha */
const assert = require('assert')
const fs = require('../..')

describe('fs', () => {
  it('.stat()', done => {
    fs.stat(__filename).then(stats => {
      assert.equal(typeof stats.size, 'number')
      done()
    }).catch(done)
  })

  it('.statSync()', () => {
    const stats = fs.statSync(__filename)
    assert.equal(typeof stats.size, 'number')
  })

  it('.exists()', done => {
    fs.exists(__filename).then(exists => {
      assert(exists)
      done()
    }).catch(done)
  })

  it('.existsSync()', () => {
    const exists = fs.existsSync(__filename)
    assert(exists)
  })

  describe('callback support', () => {
    it('.stat()', done => {
      fs.stat(__filename, (err, stats) => {
        assert(!err)
        assert.equal(typeof stats.size, 'number')
        done()
      })
    })

    // This test is different from mz/fs, since we are a drop-in replacement for native fs
    it('.exists()', done => {
      fs.exists(__filename, exists => {
        assert(exists)
        done()
      })
    })
  })
})
