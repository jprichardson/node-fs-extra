'use strict'

const fs = require('fs')
const path = require('path')
const assert = require('assert')

/* eslint-env mocha */

describe('realpath.native does not exist', () => {
  let warning
  const warningListener = error => {
    if (error.name === 'Warning') {
      if (error.code.startsWith('fs-extra-WARN0003')) {
        warning = error
      }
    }
  }

  const realpathNativeBackup = fs.realpath.native
  const clearFseCache = () => {
    const fsePath = path.dirname(require.resolve('../..'))
    for (const entry in require.cache) {
      if (entry.startsWith(fsePath)) {
        delete require.cache[entry]
      }
    }
  }

  before(() => {
    process.on('warning', warningListener)

    // clear existing require.cache
    clearFseCache()

    // simulate fs monkey-patch
    delete fs.realpath.native
  })

  after(() => {
    process.off('warning', warningListener)

    // clear stubbed require.cache
    clearFseCache()

    // reinstate fs.realpath.native
    fs.realpath.native = realpathNativeBackup
  })

  it('fse should not export realpath.native', done => {
    const fse = require('../..')

    // next event loop to allow event emitter/listener to happen
    setImmediate(() => {
      assert(warning, 'fs-extra-WARN0003 should be emitted')
      done()
    })

    assert(!fse.realpath.native)
  })
})

describe('realpath.native', () => {
  const fse = require('../..')

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
