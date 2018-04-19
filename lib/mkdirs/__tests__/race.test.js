'use strict'

const fs = require('fs')
const os = require('os')
const fse = require(process.cwd())
const path = require('path')
const assert = require('assert')

/* global afterEach, beforeEach, describe, it */

const o755 = parseInt('755', 8)
const o777 = parseInt('777', 8)
const o666 = parseInt('666', 8)

describe('mkdirp / race', () => {
  let TEST_DIR
  let file

  beforeEach(done => {
    TEST_DIR = path.join(os.tmpdir(), 'fs-extra', 'mkdirp-race')
    fse.emptyDir(TEST_DIR, err => {
      assert.ifError(err)

      const ps = [ TEST_DIR ]

      for (let i = 0; i < 15; i++) {
        const dir = Math.floor(Math.random() * Math.pow(16, 4)).toString(16)
        ps.push(dir)
      }

      file = path.join(...ps)
      done()
    })
  })

  afterEach(done => fse.remove(TEST_DIR, done))

  it('race', done => {
    let res = 2

    mk(file, () => --res === 0 ? done() : undefined)
    mk(file, () => --res === 0 ? done() : undefined)

    function mk (file, callback) {
      fse.mkdirp(file, o755, err => {
        assert.ifError(err)
        fse.pathExists(file, (err, ex) => {
          assert.ifError(err)
          assert.ok(ex, 'file created')
          fs.stat(file, (err, stat) => {
            assert.ifError(err)

            if (os.platform().indexOf('win') === 0) {
              assert.strictEqual(stat.mode & o777, o666)
            } else {
              assert.strictEqual(stat.mode & o777, o755)
            }

            assert.ok(stat.isDirectory(), 'target not a directory')
            if (callback) callback()
          })
        })
      })
    }
  })
})
