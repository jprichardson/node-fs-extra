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

describe('mkdirp / sync', () => {
  let TEST_DIR
  let file

  beforeEach(done => {
    TEST_DIR = path.join(os.tmpdir(), 'fs-extra', 'mkdirp-sync')
    fse.emptyDir(TEST_DIR, err => {
      assert.ifError(err)

      const x = Math.floor(Math.random() * Math.pow(16, 4)).toString(16)
      const y = Math.floor(Math.random() * Math.pow(16, 4)).toString(16)
      const z = Math.floor(Math.random() * Math.pow(16, 4)).toString(16)

      file = path.join(TEST_DIR, x, y, z)

      done()
    })
  })

  afterEach(done => fse.remove(TEST_DIR, done))

  it('should', done => {
    try {
      fse.mkdirpSync(file, o755)
    } catch (err) {
      assert.fail(err)
    }

    fs.exists(file, ex => {
      assert.ok(ex, 'file created')
      fs.stat(file, (err, stat) => {
        assert.ifError(err)
        // http://stackoverflow.com/questions/592448/c-how-to-set-file-permissions-cross-platform
        if (os.platform().indexOf('win') === 0) {
          assert.equal(stat.mode & o777, o666)
        } else {
          assert.equal(stat.mode & o777, o755)
        }

        assert.ok(stat.isDirectory(), 'target not a directory')
        done()
      })
    })
  })
})
