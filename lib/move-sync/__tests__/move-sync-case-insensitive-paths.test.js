'use strict'

const assert = require('assert')
const os = require('os')
const path = require('path')
const fs = require('../../')
const platform = os.platform()

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
    it('should behave correctly based on the OS', () => {
      src = path.join(TEST_DIR, 'srcdir')
      fs.outputFileSync(path.join(src, 'subdir', 'file.txt'), 'some data')
      dest = path.join(TEST_DIR, 'srcDir')
      let errThrown = false

      try {
        fs.moveSync(src, dest)
      } catch (err) {
        if (platform === 'darwin' || platform === 'win32') {
          assert.strictEqual(err.message, 'Source and destination must not be the same.')
          errThrown = true
        }
      }
      if (platform === 'darwin' || platform === 'win32') assert(errThrown)
      if (platform === 'linux') {
        assert(fs.existsSync(dest))
        assert.strictEqual(fs.readFileSync(path.join(dest, 'subdir', 'file.txt'), 'utf8'), 'some data')
        assert(!errThrown)
      }
    })
  })

  describe('> when src is a file', () => {
    it('should behave correctly based on the OS', () => {
      src = path.join(TEST_DIR, 'srcfile')
      fs.outputFileSync(src, 'some data')
      dest = path.join(TEST_DIR, 'srcFile')
      let errThrown = false

      try {
        fs.moveSync(src, dest)
      } catch (err) {
        if (platform === 'darwin' || platform === 'win32') {
          assert.strictEqual(err.message, 'Source and destination must not be the same.')
          errThrown = true
        }
      }
      if (platform === 'darwin' || platform === 'win32') assert(errThrown)
      if (platform === 'linux') {
        assert(fs.existsSync(dest))
        assert.strictEqual(fs.readFileSync(dest, 'utf8'), 'some data')
        assert(!errThrown)
      }
    })
  })

  describe('> when src is a symlink', () => {
    it('should behave correctly based on the OS, symlink dir', () => {
      src = path.join(TEST_DIR, 'srcdir')
      fs.outputFileSync(path.join(src, 'subdir', 'file.txt'), 'some data')
      const srcLink = path.join(TEST_DIR, 'src-symlink')
      fs.symlinkSync(src, srcLink, 'dir')
      dest = path.join(TEST_DIR, 'src-Symlink')
      let errThrown = false

      try {
        fs.moveSync(srcLink, dest)
      } catch (err) {
        if (platform === 'darwin' || platform === 'win32') {
          assert.strictEqual(err.message, 'Source and destination must not be the same.')
          errThrown = true
        }
      }
      if (platform === 'darwin' || platform === 'win32') assert(errThrown)
      if (platform === 'linux') {
        assert(fs.existsSync(dest))
        assert.strictEqual(fs.readFileSync(path.join(dest, 'subdir', 'file.txt'), 'utf8'), 'some data')
        const destLink = fs.readlinkSync(dest)
        assert.strictEqual(destLink, src)
        assert(!errThrown)
      }
    })

    it('should behave correctly based on the OS, symlink file', () => {
      src = path.join(TEST_DIR, 'srcfile')
      fs.outputFileSync(src, 'some data')
      const srcLink = path.join(TEST_DIR, 'src-symlink')
      fs.symlinkSync(src, srcLink, 'file')
      dest = path.join(TEST_DIR, 'src-Symlink')
      let errThrown = false

      try {
        fs.moveSync(srcLink, dest)
      } catch (err) {
        if (platform === 'darwin' || platform === 'win32') {
          assert.strictEqual(err.message, 'Source and destination must not be the same.')
          errThrown = true
        }
      }
      if (platform === 'darwin' || platform === 'win32') assert(errThrown)
      if (platform === 'linux') {
        assert(fs.existsSync(dest))
        assert.strictEqual(fs.readFileSync(dest, 'utf8'), 'some data')
        const destLink = fs.readlinkSync(dest)
        assert.strictEqual(destLink, src)
        assert(!errThrown)
      }
    })
  })
})
