'use strict'

const fs = require('fs')
const os = require('os')
const fse = require(process.cwd())
const path = require('path')
const assert = require('assert')
const copy = require('../copy')

/* global afterEach, beforeEach, describe, it */

describe('copy() - broken symlink', () => {
  const TEST_DIR = path.join(os.tmpdir(), 'fs-extra', 'copy-broken-symlinks')
  const src = path.join(TEST_DIR, 'src')
  const out = path.join(TEST_DIR, 'out')

  beforeEach(done => {
    fse.emptyDir(TEST_DIR, err => {
      assert.ifError(err)
      createFixtures(src, done)
    })
  })

  afterEach(done => fse.remove(TEST_DIR, done))

  it('should copy broken symlinks by default', done => {
    copy(src, out, err => {
      assert.ifError(err)
      assert.equal(fs.readlinkSync(path.join(out, 'broken-symlink')), path.join(src, 'does-not-exist'))
      done()
    })
  })

  it('should throw an error when dereference=true', done => {
    copy(src, out, {dereference: true}, err => {
      assert.strictEqual(err.code, 'ENOENT')
      done()
    })
  })
})

function createFixtures (srcDir, callback) {
  fs.mkdir(srcDir, err => {
    let brokenFile
    let brokenFileLink

    if (err) return callback(err)

    try {
      brokenFile = path.join(srcDir, 'does-not-exist')
      brokenFileLink = path.join(srcDir, 'broken-symlink')
      fs.writeFileSync(brokenFile, 'does not matter')
      fs.symlinkSync(brokenFile, brokenFileLink, 'file')
    } catch (err) {
      callback(err)
    }

    // break the symlink now
    fse.remove(brokenFile, callback)
  })
}
