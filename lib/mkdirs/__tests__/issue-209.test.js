'use strict'

const assert = require('assert')
const fse = require('../..')

/* global describe, it */

describe('mkdirp: issue-209, win32, when bad path, should return a cleaner error', () => {
  // only seems to be an issue on Windows.
  if (process.platform !== 'win32') return

  it('should return a callback', done => {
    const file = './bad?dir'
    fse.mkdirp(file, err => {
      assert(err, 'error is present')
      assert.strictEqual(err.code, 'EINVAL')

      const file2 = 'c:\\tmp\foo:moo'
      fse.mkdirp(file2, err => {
        assert(err, 'error is present')
        assert.strictEqual(err.code, 'EINVAL')
        done()
      })
    })
  })

  describe('> sync', () => {
    it('should throw an error', () => {
      let didErr
      try {
        const file = 'c:\\tmp\foo:moo'
        fse.mkdirpSync(file)
      } catch {
        didErr = true
      }
      assert(didErr)
    })
  })
})
