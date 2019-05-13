'use strict'

const fs = require('fs')
const fse = require('../..')
const assert = require('assert')

/* eslint-env mocha */

// fs.realpath.native only available in Node v9.2+
if (typeof fs.realpath.native === 'function') {
  describe('realpath.native', () => {
    it('works with callbacks', () => {
      fse.realpath.native(__dirname, (err, path) => {
        assert.ifError(err)
        assert.equal(path, __dirname)
      })
    })

    it('works with promises', async function () {
      const path = await fse.realpath.native(__dirname)
      assert.equal(path, __dirname)
    })
  })
}
