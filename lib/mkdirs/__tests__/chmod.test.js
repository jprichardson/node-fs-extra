'use strict'

const fs = require('fs')
const os = require('os')
const fse = require('../../')
const path = require('path')
const assert = require('assert')

/* global afterEach, beforeEach, describe, it */

describe('mkdirp / chmod', () => {
  let TEST_DIR
  let TEST_SUBDIR

  beforeEach(done => {
    const ps = []
    for (let i = 0; i < 15; i++) {
      const dir = Math.floor(Math.random() * Math.pow(16, 4)).toString(16)
      ps.push(dir)
    }

    TEST_SUBDIR = ps.join(path.sep)

    TEST_DIR = path.join(os.tmpdir(), 'fs-extra', 'mkdirp-chmod')
    TEST_SUBDIR = path.join(TEST_DIR, TEST_SUBDIR)

    fse.emptyDir(TEST_DIR, done)
  })

  afterEach(done => fse.remove(TEST_DIR, done))

  it('chmod-pre', done => {
    const mode = 0o744
    fse.mkdirp(TEST_SUBDIR, mode, err => {
      assert.ifError(err, 'should not error')
      fs.stat(TEST_SUBDIR, (err, stat) => {
        assert.ifError(err, 'should exist')
        assert.ok(stat && stat.isDirectory(), 'should be directory')

        if (os.platform().indexOf('win') === 0) {
          assert.strictEqual(stat && stat.mode & 0o777, 0o666, 'windows shit')
        } else {
          assert.strictEqual(stat && stat.mode & 0o777, mode, 'should be 0744')
        }

        done()
      })
    })
  })

  it('chmod', done => {
    const mode = 0o755
    fse.mkdirp(TEST_SUBDIR, mode, err => {
      assert.ifError(err, 'should not error')
      fs.stat(TEST_SUBDIR, (err, stat) => {
        assert.ifError(err, 'should exist')
        assert.ok(stat && stat.isDirectory(), 'should be directory')
        done()
      })
    })
  })
})
