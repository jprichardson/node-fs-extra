'use strict'

const fs = require('fs')
const os = require('os')
const fse = require(process.cwd())
const path = require('path')
const assert = require('assert')
const copy = require('../copy')

/* global afterEach, beforeEach, describe, it */

describe('copy() - symlink', () => {
  const TEST_DIR = path.join(os.tmpdir(), 'fs-extra', 'copy-symlinks')
  const src = path.join(TEST_DIR, 'src')
  const out = path.join(TEST_DIR, 'out')

  beforeEach(done => {
    fse.emptyDir(TEST_DIR, err => {
      assert.ifError(err)
      createFixtures(src, done)
    })
  })

  afterEach(done => {
    fse.remove(TEST_DIR, done)
  })

  it('should copy symlinks by default', done => {
    copy(src, out, err => {
      assert.ifError(err)

      assert.equal(fs.readlinkSync(path.join(out, 'file-symlink')), path.join(src, 'foo'))
      assert.equal(fs.readlinkSync(path.join(out, 'dir-symlink')), path.join(src, 'dir'))
      done()
    })
  })

  it('should copy file contents when dereference=true and dest not exist', done => {
    copy(src, out, {dereference: true}, err => {
      assert.ifError(err)

      const fileSymlinkPath = path.join(out, 'file-symlink')
      assert.ok(fs.lstatSync(fileSymlinkPath).isFile())
      assert.equal(fs.readFileSync(fileSymlinkPath), 'foo contents')

      const dirSymlinkPath = path.join(out, 'dir-symlink')
      assert.ok(fs.lstatSync(dirSymlinkPath).isDirectory())
      assert.deepEqual(fs.readdirSync(dirSymlinkPath), ['bar'])
      done()
    })
  })

  it('should copy file contents when dereference=true and dest exists', done => {
    const dest = path.join(TEST_DIR, 'dest')
    fse.mkdirsSync(dest)
    const destLink = path.join(TEST_DIR, 'dest_symlink')
    fs.symlinkSync(dest, destLink, 'dir')

    copy(src, destLink, {dereference: true}, err => {
      assert.ifError(err)

      const fileSymlinkPath = path.join(destLink, 'file-symlink')
      assert.ok(fs.lstatSync(fileSymlinkPath).isFile())
      assert.equal(fs.readFileSync(fileSymlinkPath), 'foo contents')

      const dirSymlinkPath = path.join(destLink, 'dir-symlink')
      assert.ok(fs.lstatSync(dirSymlinkPath).isDirectory())
      assert.deepEqual(fs.readdirSync(dirSymlinkPath), ['bar'])
      done()
    })
  })

  it('should copy file contents when dereference=true and src is a link and dest is regular', done => {
    const dest = path.join(TEST_DIR, 'dest')
    fse.mkdirsSync(dest)
    const srcLink = path.join(TEST_DIR, 'src_symlink')
    fs.symlinkSync(src, srcLink, 'dir')

    copy(srcLink, dest, {dereference: true}, err => {
      assert.ifError(err)

      const fileSymlinkPath = path.join(dest, 'file-symlink')
      assert.ok(fs.lstatSync(fileSymlinkPath).isFile())
      assert.equal(fs.readFileSync(fileSymlinkPath), 'foo contents')

      const dirSymlinkPath = path.join(dest, 'dir-symlink')
      assert.ok(fs.lstatSync(dirSymlinkPath).isDirectory())
      assert.deepEqual(fs.readdirSync(dirSymlinkPath), ['bar'])
      done()
    })
  })

  it('should copy file contents when dereference=true and src and dest are links', done => {
    const dest = path.join(TEST_DIR, 'dest')
    fse.mkdirsSync(dest)
    const srcLink = path.join(TEST_DIR, 'src_symlink')
    fs.symlinkSync(src, srcLink, 'dir')
    const destLink = path.join(TEST_DIR, 'dest_symlink')
    fs.symlinkSync(dest, destLink, 'dir')

    copy(srcLink, destLink, {dereference: true}, err => {
      assert.ifError(err)

      const fileSymlinkPath = path.join(destLink, 'file-symlink')
      assert.ok(fs.lstatSync(fileSymlinkPath).isFile())
      assert.equal(fs.readFileSync(fileSymlinkPath), 'foo contents')

      const dirSymlinkPath = path.join(destLink, 'dir-symlink')
      assert.ok(fs.lstatSync(dirSymlinkPath).isDirectory())
      assert.deepEqual(fs.readdirSync(dirSymlinkPath), ['bar'])
      done()
    })
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