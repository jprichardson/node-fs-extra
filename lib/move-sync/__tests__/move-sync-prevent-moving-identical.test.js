'use strict'

const assert = require('assert')
const os = require('os')
const path = require('path')
const fs = require('../../')
const klawSync = require('klaw-sync')

/* global beforeEach, afterEach, describe, it */

describe('+ moveSync() - prevent moving identical files and dirs', () => {
  let TEST_DIR = ''
  let src = ''
  let dest = ''

  beforeEach(done => {
    TEST_DIR = path.join(os.tmpdir(), 'fs-extra', 'move-sync-prevent-moving-identical')
    fs.emptyDir(TEST_DIR, done)
  })

  afterEach(done => fs.remove(TEST_DIR, done))

  it('should return an error if src and dest are the same', () => {
    const fileSrc = path.join(TEST_DIR, 'TEST_fs-extra_move_sync')
    const fileDest = path.join(TEST_DIR, 'TEST_fs-extra_move_sync')
    fs.ensureFileSync(fileSrc)

    try {
      fs.moveSync(fileSrc, fileDest)
    } catch (err) {
      assert.strictEqual(err.message, 'Source and destination must not be the same.')
    }
  })

  describe('dest with parent symlink', () => {
    describe('first parent is symlink', () => {
      it('should error when src is file', () => {
        const src = path.join(TEST_DIR, 'a', 'file.txt')
        const dest = path.join(TEST_DIR, 'b', 'file.txt')
        const srcParent = path.join(TEST_DIR, 'a')
        const destParent = path.join(TEST_DIR, 'b')
        fs.ensureFileSync(src)
        fs.ensureSymlinkSync(srcParent, destParent, 'dir')

        try {
          fs.moveSync(src, dest)
        } catch (err) {
          assert.strictEqual(err.message, 'Source and destination must not be the same.')
        } finally {
          assert(fs.existsSync(src))
        }
      })

      it('should error when src is directory', () => {
        const src = path.join(TEST_DIR, 'a', 'foo')
        const dest = path.join(TEST_DIR, 'b', 'foo')
        const srcParent = path.join(TEST_DIR, 'a')
        const destParent = path.join(TEST_DIR, 'b')
        fs.ensureDirSync(src)
        fs.ensureSymlinkSync(srcParent, destParent, 'dir')

        try {
          fs.moveSync(src, dest)
        } catch (err) {
          assert.strictEqual(err.message, 'Source and destination must not be the same.')
        } finally {
          assert(fs.existsSync(src))
        }
      })
    })

    describe('nested dest', () => {
      it('should error when src is file', () => {
        const src = path.join(TEST_DIR, 'a', 'dir', 'file.txt')
        const dest = path.join(TEST_DIR, 'b', 'dir', 'file.txt')
        const srcParent = path.join(TEST_DIR, 'a')
        const destParent = path.join(TEST_DIR, 'b')
        fs.ensureFileSync(src)
        fs.ensureSymlinkSync(srcParent, destParent, 'dir')

        try {
          fs.moveSync(src, dest)
        } catch (err) {
          assert.strictEqual(err.message, 'Source and destination must not be the same.')
        } finally {
          assert(fs.existsSync(src))
        }
      })

      it('should error when src is directory', () => {
        const src = path.join(TEST_DIR, 'a', 'dir', 'foo')
        const dest = path.join(TEST_DIR, 'b', 'dir', 'foo')
        const srcParent = path.join(TEST_DIR, 'a')
        const destParent = path.join(TEST_DIR, 'b')
        fs.ensureDirSync(src)
        fs.ensureSymlinkSync(srcParent, destParent, 'dir')

        try {
          fs.moveSync(src, dest)
        } catch (err) {
          assert.strictEqual(err.message, 'Source and destination must not be the same.')
        } finally {
          assert(fs.existsSync(src))
        }
      })
    })
  })

  // src is directory:
  //  src is regular, dest is symlink
  //  src is symlink, dest is regular
  //  src is symlink, dest is symlink

  describe('> when src is a directory', () => {
    describe('>> when src is regular and dest is a symlink that points to src', () => {
      it('should error', () => {
        src = path.join(TEST_DIR, 'src')
        fs.mkdirsSync(src)
        const subdir = path.join(TEST_DIR, 'src', 'subdir')
        fs.mkdirsSync(subdir)
        fs.writeFileSync(path.join(subdir, 'file.txt'), 'some data')

        const destLink = path.join(TEST_DIR, 'dest-symlink')
        fs.symlinkSync(src, destLink, 'dir')

        const oldlen = klawSync(src).length

        try {
          fs.moveSync(src, destLink)
        } catch (err) {
          assert.strictEqual(err.message, 'Source and destination must not be the same.')
        }

        const newlen = klawSync(src).length
        assert.strictEqual(newlen, oldlen)
        const link = fs.readlinkSync(destLink)
        assert.strictEqual(link, src)
      })
    })

    describe('>> when src is a symlink that points to a regular dest', () => {
      it('should throw error', () => {
        dest = path.join(TEST_DIR, 'dest')
        fs.mkdirsSync(dest)
        const subdir = path.join(TEST_DIR, 'dest', 'subdir')
        fs.mkdirsSync(subdir)
        fs.writeFileSync(path.join(subdir, 'file.txt'), 'some data')

        const srcLink = path.join(TEST_DIR, 'src-symlink')
        fs.symlinkSync(dest, srcLink, 'dir')

        const oldlen = klawSync(dest).length

        try {
          fs.moveSync(srcLink, dest)
        } catch (err) {
          assert(err)
        }

        // assert nothing copied
        const newlen = klawSync(dest).length
        assert.strictEqual(newlen, oldlen)
        const link = fs.readlinkSync(srcLink)
        assert.strictEqual(link, dest)
      })
    })

    describe('>> when src and dest are symlinks that point to the exact same path', () => {
      it('should error src and dest are the same', () => {
        src = path.join(TEST_DIR, 'src')
        fs.mkdirsSync(src)
        const srcLink = path.join(TEST_DIR, 'src_symlink')
        fs.symlinkSync(src, srcLink, 'dir')
        const destLink = path.join(TEST_DIR, 'dest_symlink')
        fs.symlinkSync(src, destLink, 'dir')

        const srclenBefore = klawSync(srcLink).length
        const destlenBefore = klawSync(destLink).length

        try {
          fs.moveSync(srcLink, destLink)
        } catch (err) {
          assert.strictEqual(err.message, 'Source and destination must not be the same.')
        }

        const srclenAfter = klawSync(srcLink).length
        assert.strictEqual(srclenAfter, srclenBefore, 'src length should not change')
        const destlenAfter = klawSync(destLink).length
        assert.strictEqual(destlenAfter, destlenBefore, 'dest length should not change')

        const srcln = fs.readlinkSync(srcLink)
        assert.strictEqual(srcln, src)
        const destln = fs.readlinkSync(destLink)
        assert.strictEqual(destln, src)
      })
    })
  })

  // src is file:
  //  src is regular, dest is symlink
  //  src is symlink, dest is regular
  //  src is symlink, dest is symlink

  describe('> when src is a file', () => {
    describe('>> when src is regular and dest is a symlink that points to src', () => {
      it('should error', () => {
        src = path.join(TEST_DIR, 'src', 'somefile.txt')
        fs.ensureFileSync(src)
        fs.writeFileSync(src, 'some data')

        const destLink = path.join(TEST_DIR, 'dest-symlink')
        fs.symlinkSync(src, destLink, 'file')

        try {
          fs.moveSync(src, destLink)
        } catch (err) {
          assert.strictEqual(err.message, 'Source and destination must not be the same.')
        }

        const link = fs.readlinkSync(destLink)
        assert.strictEqual(link, src)
        assert(fs.readFileSync(link, 'utf8'), 'some data')
      })
    })

    describe('>> when src is a symlink that points to a regular dest', () => {
      it('should throw error', () => {
        dest = path.join(TEST_DIR, 'dest', 'somefile.txt')
        fs.outputFileSync(dest, 'some data')

        const srcLink = path.join(TEST_DIR, 'src-symlink')
        fs.symlinkSync(dest, srcLink, 'file')

        try {
          fs.moveSync(srcLink, dest)
        } catch (err) {
          assert.ok(err)
        }
        const link = fs.readlinkSync(srcLink)
        assert.strictEqual(link, dest)
        assert(fs.readFileSync(link, 'utf8'), 'some data')
      })
    })

    describe('>> when src and dest are symlinks that point to the exact same path', () => {
      it('should error src and dest are the same', () => {
        src = path.join(TEST_DIR, 'src', 'srcfile.txt')
        fs.outputFileSync(src, 'src data')

        const srcLink = path.join(TEST_DIR, 'src_symlink')
        fs.symlinkSync(src, srcLink, 'file')

        const destLink = path.join(TEST_DIR, 'dest_symlink')
        fs.symlinkSync(src, destLink, 'file')

        try {
          fs.moveSync(srcLink, destLink)
        } catch (err) {
          assert.strictEqual(err.message, 'Source and destination must not be the same.')
        }

        const srcln = fs.readlinkSync(srcLink)
        assert.strictEqual(srcln, src)
        const destln = fs.readlinkSync(destLink)
        assert.strictEqual(destln, src)
        assert(fs.readFileSync(srcln, 'utf8'), 'src data')
        assert(fs.readFileSync(destln, 'utf8'), 'src data')
      })
    })
  })
})
