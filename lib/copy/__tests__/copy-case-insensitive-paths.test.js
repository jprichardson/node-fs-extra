'use strict'

const assert = require('assert')
const os = require('os')
const path = require('path')
const fs = require('../../')
const platform = os.platform()

console.log('platform: ' + platform)

/* global beforeEach, afterEach, describe, it */

describe('+ copy() - case insensitive paths', () => {
  let TEST_DIR = ''
  let src = ''
  let dest = ''

  beforeEach(done => {
    TEST_DIR = path.join(os.tmpdir(), 'fs-extra', 'copy-case-insensitive-paths')
    fs.emptyDir(TEST_DIR, done)
  })

  afterEach(done => fs.remove(TEST_DIR, done))

  describe('> when src is a directory', () => {
    it('should behave correctly based on the OS', done => {
      src = path.join(TEST_DIR, 'srcdir')
      fs.outputFileSync(path.join(src, 'subdir', 'file.txt'), 'some data')
      dest = path.join(TEST_DIR, 'srcDir')

      fs.copy(src, dest, err => {
        if (platform === 'linux') {
          assert.ifError(err)
          assert(fs.existsSync(dest))
          assert.strictEqual(fs.readFileSync(path.join(dest, 'subdir', 'file.txt'), 'utf8'), 'some data')
        }
        if (platform === 'darwin' || platform === 'win32') {
          assert.strictEqual(err.message, 'Source and destination must not be the same.')
        }
        done()
      })
    })
  })

  describe('> when src is a file', () => {
    it('should behave correctly based on the OS', done => {
      src = path.join(TEST_DIR, 'srcfile')
      fs.outputFileSync(src, 'some data')
      dest = path.join(TEST_DIR, 'srcFile')

      fs.copy(src, dest, err => {
        if (platform === 'linux') {
          assert.ifError(err)
          assert(fs.existsSync(dest))
          assert.strictEqual(fs.readFileSync(dest, 'utf8'), 'some data')
        }
        if (platform === 'darwin' || platform === 'win32') {
          assert.strictEqual(err.message, 'Source and destination must not be the same.')
        }
        done()
      })
    })
  })

  describe('> when src is a symlink', () => {
    it('should behave correctly based on the OS, symlink dir', done => {
      src = path.join(TEST_DIR, 'srcdir')
      fs.outputFileSync(path.join(src, 'subdir', 'file.txt'), 'some data')
      const srcLink = path.join(TEST_DIR, 'src-symlink')
      fs.symlinkSync(src, srcLink, 'dir')
      dest = path.join(TEST_DIR, 'src-Symlink')

      fs.copy(srcLink, dest, err => {
        if (platform === 'linux') {
          assert.ifError(err)
          assert(fs.existsSync(dest))
          assert.strictEqual(fs.readFileSync(path.join(dest, 'subdir', 'file.txt'), 'utf8'), 'some data')
          const destLink = fs.readlinkSync(dest)
          assert.strictEqual(destLink, src)
        }
        if (platform === 'darwin' || platform === 'win32') {
          assert.strictEqual(err.message, 'Source and destination must not be the same.')
        }
        done()
      })
    })

    it('should behave correctly based on the OS, symlink file', done => {
      src = path.join(TEST_DIR, 'srcfile')
      fs.outputFileSync(src, 'some data')
      const srcLink = path.join(TEST_DIR, 'src-symlink')
      fs.symlinkSync(src, srcLink, 'file')
      dest = path.join(TEST_DIR, 'src-Symlink')

      fs.copy(srcLink, dest, err => {
        if (platform === 'linux') {
          assert.ifError(err)
          assert(fs.existsSync(dest))
          assert.strictEqual(fs.readFileSync(dest, 'utf8'), 'some data')
          const destLink = fs.readlinkSync(dest)
          assert.strictEqual(destLink, src)
        }
        if (platform === 'darwin' || platform === 'win32') {
          assert.strictEqual(err.message, 'Source and destination must not be the same.')
        }
        done()
      })
    })
  })
})
