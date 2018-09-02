'use strict'

const os = require('os')
const fs = require('../../')
const path = require('path')
const assert = require('assert')
const copySync = require('../copy-sync')

/* global afterEach, beforeEach, describe, it */

describe('copy-sync / symlink', () => {
  const TEST_DIR = path.join(os.tmpdir(), 'fs-extra', 'copy-sync-symlinks')
  const src = path.join(TEST_DIR, 'src')
  const out = path.join(TEST_DIR, 'out')

  beforeEach(done => {
    fs.emptyDir(TEST_DIR, err => {
      assert.ifError(err)
      createFixtures(src, done)
    })
  })

  afterEach(done => {
    fs.remove(TEST_DIR, done)
  })

  it('copies symlinks by default', () => {
    assert.doesNotThrow(() => {
      copySync(src, out)
    })

    assert.strictEqual(fs.readlinkSync(path.join(out, 'file-symlink')), path.join(src, 'foo'))
    assert.strictEqual(fs.readlinkSync(path.join(out, 'dir-symlink')), path.join(src, 'dir'))
  })

  it('copies file contents when dereference=true', () => {
    try {
      copySync(src, out, {dereference: true})
    } catch (err) {
      assert.ifError(err)
    }

    const fileSymlinkPath = path.join(out, 'file-symlink')
    assert.ok(fs.lstatSync(fileSymlinkPath).isFile())
    assert.strictEqual(fs.readFileSync(fileSymlinkPath, 'utf8'), 'foo contents')

    const dirSymlinkPath = path.join(out, 'dir-symlink')
    assert.ok(fs.lstatSync(dirSymlinkPath).isDirectory())
    assert.deepStrictEqual(fs.readdirSync(dirSymlinkPath), ['bar'])
  })
})

function createFixtures (srcDir, callback) {
  fs.mkdir(srcDir, err => {
    if (err) return callback(err)

    // note: third parameter in symlinkSync is type e.g. 'file' or 'dir'
    // https://nodejs.org/api/fs.html#fs_fs_symlink_srcpath_dstpath_type_callback
    try {
      const fooFile = path.join(srcDir, 'foo')
      const fooFileLink = path.join(srcDir, 'file-symlink')
      fs.writeFileSync(fooFile, 'foo contents')
      fs.symlinkSync(fooFile, fooFileLink, 'file')

      const dir = path.join(srcDir, 'dir')
      const dirFile = path.join(dir, 'bar')
      const dirLink = path.join(srcDir, 'dir-symlink')
      fs.mkdirSync(dir)
      fs.writeFileSync(dirFile, 'bar contents')
      fs.symlinkSync(dir, dirLink, 'dir')
    } catch (err) {
      callback(err)
    }

    callback()
  })
}
