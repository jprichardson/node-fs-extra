'use strict'

const assert = require('assert')
const os = require('os')
const path = require('path')
const fs = require('../../')

/* global beforeEach, afterEach, describe, it */

describe('+ moveSync() - case insensitive paths', () => {
  let TEST_DIR = ''
  let src = ''
  let dest = ''

  beforeEach(done => {
    TEST_DIR = path.join(os.tmpdir(), 'fs-extra', 'move-sync-case-insensitive-paths')
    fs.emptyDir(TEST_DIR, done)
  })

  afterEach(() => fs.removeSync(TEST_DIR))

  describe('> when src is a directory', () => {
    it('should move successfully', () => {
      src = path.join(TEST_DIR, 'srcdir')
      fs.outputFileSync(path.join(src, 'subdir', 'file.txt'), 'some data')
      dest = path.join(TEST_DIR, 'srcDir')

      fs.moveSync(src, dest)
      assert(fs.existsSync(dest))
      assert.strictEqual(fs.readFileSync(path.join(dest, 'subdir', 'file.txt'), 'utf8'), 'some data')
    })
  })

  describe('> when src is a file', () => {
    it('should move successfully', () => {
      src = path.join(TEST_DIR, 'srcfile')
      fs.outputFileSync(src, 'some data')
      dest = path.join(TEST_DIR, 'srcFile')

      fs.moveSync(src, dest)
      assert(fs.existsSync(dest))
      assert.strictEqual(fs.readFileSync(dest, 'utf8'), 'some data')
    })
  })

  describe('> when src is a symlink', () => {
    it('should move successfully, symlink dir', () => {
      src = path.join(TEST_DIR, 'srcdir')
      fs.outputFileSync(path.join(src, 'subdir', 'file.txt'), 'some data')
      const srcLink = path.join(TEST_DIR, 'src-symlink')
      fs.symlinkSync(src, srcLink, 'dir')
      dest = path.join(TEST_DIR, 'src-Symlink')

      fs.moveSync(srcLink, dest)
      assert(fs.existsSync(dest))
      assert.strictEqual(fs.readFileSync(path.join(dest, 'subdir', 'file.txt'), 'utf8'), 'some data')
      const destLink = fs.readlinkSync(dest)
      assert.strictEqual(destLink, src)
    })

    it('should move successfully, symlink file', () => {
      src = path.join(TEST_DIR, 'srcfile')
      fs.outputFileSync(src, 'some data')
      const srcLink = path.join(TEST_DIR, 'src-symlink')
      fs.symlinkSync(src, srcLink, 'file')
      dest = path.join(TEST_DIR, 'src-Symlink')

      fs.moveSync(srcLink, dest)
      assert(fs.existsSync(dest))
      assert.strictEqual(fs.readFileSync(dest, 'utf8'), 'some data')
      const destLink = fs.readlinkSync(dest)
      assert.strictEqual(destLink, src)
    })
  })
})
