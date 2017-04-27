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

describe('mkdirp / perm_sync', () => {
  let TEST_DIR

  beforeEach(done => {
    TEST_DIR = path.join(os.tmpdir(), 'fs-extra', 'mkdirp-perm-sync')
    fse.emptyDir(TEST_DIR, done)
  })

  afterEach(done => fse.remove(TEST_DIR, done))

  it('sync perm', done => {
    const file = path.join(TEST_DIR, (Math.random() * (1 << 30)).toString(16) + '.json')

    fse.mkdirpSync(file, o755)
    fse.pathExists(file, (err, ex) => {
      assert.ifError(err)
      assert.ok(ex, 'file created')
      fs.stat(file, (err, stat) => {
        assert.ifError(err)

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

  it('sync root perm', done => {
    const file = TEST_DIR
    fse.mkdirpSync(file, o755)
    fse.pathExists(file, (err, ex) => {
      assert.ifError(err)
      assert.ok(ex, 'file created')
      fs.stat(file, (err, stat) => {
        assert.ifError(err)
        assert.ok(stat.isDirectory(), 'target not a directory')
        done()
      })
    })
  })
})
