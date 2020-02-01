'use strict'

const fse = require('../..')
const assert = require('assert')

/* eslint-env mocha */

describe('realpath.native', () => {
  it('works with callbacks', () => {
    fse.realpath.native(__dirname, (err, path) => {
      assert.ifError(err)
      assert.strictEqual(path, __dirname)
    })
  })

  it('works with promises', (done) => {
    fse.realpath.native(__dirname)
      .then(path => {
        assert.strictEqual(path, __dirname)
        done()
      })
      .catch(done)
  })

  it('works with sync version', () => {
    const path = fse.realpathSync.native(__dirname)
    assert.strictEqual(path, __dirname)
  })
})
