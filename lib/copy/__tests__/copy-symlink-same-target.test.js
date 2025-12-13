'use strict'

const os = require('os')
const fs = require('../..')
const path = require('path')
const assert = require('assert')

/* global afterEach, beforeEach, describe, it */

describe('copy() / symlink same target', () => {
  const TEST_DIR = path.join(os.tmpdir(), 'fs-extra', 'copy-symlink-same-target')

  beforeEach(done => {
    fs.emptyDir(TEST_DIR, done)
  })

  afterEach(done => {
    fs.remove(TEST_DIR, done)
  })

  describe('> when copying directory containing symlink', () => {
    it('should copy symlink when dest has no existing symlink', done => {
      const target = path.join(TEST_DIR, 'target')
      const src = path.join(TEST_DIR, 'src')
      const dest = path.join(TEST_DIR, 'dest')

      // Setup
      fs.mkdirpSync(target)
      fs.writeFileSync(path.join(target, 'file.txt'), 'content')
      fs.mkdirpSync(src)
      fs.symlinkSync(target, path.join(src, 'link'), 'dir')

      // Copy
      fs.copy(src, dest, err => {
        assert.ifError(err)

        // Verify symlink was copied
        const destLink = path.join(dest, 'link')
        assert.ok(fs.lstatSync(destLink).isSymbolicLink())
        assert.strictEqual(fs.readlinkSync(destLink), target)
        done()
      })
    })

    it('should overwrite symlink when dest has existing symlink pointing to SAME target', done => {
      const target = path.join(TEST_DIR, 'target')
      const src = path.join(TEST_DIR, 'src')
      const dest = path.join(TEST_DIR, 'dest')

      // Setup
      fs.mkdirpSync(target)
      fs.writeFileSync(path.join(target, 'file.txt'), 'content')
      fs.mkdirpSync(src)
      fs.mkdirpSync(dest)
      // Create symlinks pointing to the same target
      fs.symlinkSync(target, path.join(src, 'link'), 'dir')
      fs.symlinkSync(target, path.join(dest, 'link'), 'dir')

      // Copy should work - two different symlinks pointing to same target are NOT the same file
      fs.copy(src, dest)
        .then(() => {
          // Verify symlink was copied/overwritten
          const destLink = path.join(dest, 'link')
          assert.ok(fs.lstatSync(destLink).isSymbolicLink())
          assert.strictEqual(fs.readlinkSync(destLink), target)
          done()
        })
        .catch(done)
    })

    it('should overwrite symlink when dest has existing symlink pointing to DIFFERENT target', done => {
      const target1 = path.join(TEST_DIR, 'target1')
      const target2 = path.join(TEST_DIR, 'target2')
      const src = path.join(TEST_DIR, 'src')
      const dest = path.join(TEST_DIR, 'dest')

      // Setup
      fs.mkdirpSync(target1)
      fs.mkdirpSync(target2)
      fs.writeFileSync(path.join(target1, 'file.txt'), 'content1')
      fs.writeFileSync(path.join(target2, 'file.txt'), 'content2')
      fs.mkdirpSync(src)
      fs.mkdirpSync(dest)
      // Create symlinks pointing to different targets
      fs.symlinkSync(target1, path.join(src, 'link'), 'dir')
      fs.symlinkSync(target2, path.join(dest, 'link'), 'dir')

      // Copy should work
      fs.copy(src, dest, err => {
        assert.ifError(err)

        // Verify symlink was copied/overwritten to point to target1
        const destLink = path.join(dest, 'link')
        assert.ok(fs.lstatSync(destLink).isSymbolicLink())
        assert.strictEqual(fs.readlinkSync(destLink), target1)
        done()
      })
    })
  })

  describe('> when copying file symlinks', () => {
    it('should overwrite file symlink when dest has existing symlink pointing to SAME target', done => {
      const target = path.join(TEST_DIR, 'target.txt')
      const src = path.join(TEST_DIR, 'src')
      const dest = path.join(TEST_DIR, 'dest')

      // Setup
      fs.writeFileSync(target, 'content')
      fs.mkdirpSync(src)
      fs.mkdirpSync(dest)
      // Create file symlinks pointing to the same target
      fs.symlinkSync(target, path.join(src, 'link'), 'file')
      fs.symlinkSync(target, path.join(dest, 'link'), 'file')

      // Copy should work
      fs.copy(src, dest)
        .then(() => {
          // Verify symlink was copied/overwritten
          const destLink = path.join(dest, 'link')
          assert.ok(fs.lstatSync(destLink).isSymbolicLink())
          assert.strictEqual(fs.readlinkSync(destLink), target)
          done()
        })
        .catch(done)
    })
  })

  describe('> edge cases', () => {
    it('should still prevent copying a symlink to itself', done => {
      const target = path.join(TEST_DIR, 'target')
      const link = path.join(TEST_DIR, 'link')

      // Setup
      fs.mkdirpSync(target)
      fs.symlinkSync(target, link, 'dir')

      // Copying a symlink to itself should fail
      fs.copy(link, link)
        .then(() => {
          done(new Error('Expected error to be thrown'))
        })
        .catch(err => {
          assert.strictEqual(err.message, 'Source and destination must not be the same.')
          done()
        })
    })

    it('should allow copying symlink to subdirectory of its target (symlink copy, not recursive)', done => {
      // When copying a symlink (not dereferencing), we just copy the link itself
      // This should be allowed because we're not recursively copying the target's contents
      const target = path.join(TEST_DIR, 'target')
      const src = path.join(TEST_DIR, 'src')

      // Setup
      fs.mkdirpSync(target)
      fs.mkdirpSync(path.join(target, 'subdir'))
      fs.mkdirpSync(src)
      fs.symlinkSync(target, path.join(src, 'link'), 'dir')

      // Dest is inside src's resolved target
      const dest = path.join(target, 'subdir', 'dest')

      // This should work - we're just copying the symlink, not following it
      fs.copy(src, dest)
        .then(() => {
          // Verify symlink was copied
          const destLink = path.join(dest, 'link')
          assert.ok(fs.lstatSync(destLink).isSymbolicLink())
          assert.strictEqual(fs.readlinkSync(destLink), target)
          done()
        })
        .catch(done)
    })
  })
})
