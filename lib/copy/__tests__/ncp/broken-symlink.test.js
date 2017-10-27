'use strict'

const fs = require('fs')
const os = require('os')
const fse = require(process.cwd())
const ncp = require('../../copy')
const path = require('path')
const assert = require('assert')

/* global afterEach, beforeEach, describe, it */

describe('ncp broken symlink', function () {
  const TEST_DIR = path.join(os.tmpdir(), 'fs-extra', 'ncp-broken-symlinks')
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
    ncp(src, out, err => {
      if (err) return done(err)
      assert.equal(fs.readlinkSync(path.join(out, 'broken-symlink')), path.join(src, 'does-not-exist'))
      done()
    })
  })

  it('should return an error when dereference=true', done => {
    ncp(src, out, {dereference: true}, err => {
      assert.equal(err.code, 'ENOENT')
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
