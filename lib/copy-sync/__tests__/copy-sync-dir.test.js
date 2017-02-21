'use strict'

const fs = require(process.cwd())
const os = require('os')
const path = require('path')
const assert = require('assert')
const crypto = require('crypto')

/* global beforeEach, describe, it */

describe('+ copySync()', () => {
  const SIZE = 16 * 64 * 1024 + 7
  let TEST_DIR
  let src, dest

  beforeEach(done => {
    TEST_DIR = path.join(os.tmpdir(), 'fs-extra', 'copy-sync-dir')
    src = path.join(TEST_DIR, 'src')
    dest = path.join(TEST_DIR, 'dest')
    fs.emptyDir(TEST_DIR, done)
  })

  describe('> when the source is a directory', () => {
    it('should copy the directory synchronously', () => {
      const FILES = 2

      src = path.join(TEST_DIR, 'src')
      dest = path.join(TEST_DIR, 'dest')

      fs.mkdirsSync(src)

      for (let i = 0; i < FILES; ++i) {
        fs.writeFileSync(path.join(src, i.toString()), crypto.randomBytes(SIZE))
      }

      const subdir = path.join(src, 'subdir')

      fs.mkdirsSync(subdir)

      for (let i = 0; i < FILES; ++i) {
        fs.writeFileSync(path.join(subdir, i.toString()), crypto.randomBytes(SIZE))
      }

      fs.copySync(src, dest)
      assert(fs.existsSync(dest))

      for (let i = 0; i < FILES; ++i) {
        assert(fs.existsSync(path.join(dest, i.toString())))
      }

      const destSub = path.join(dest, 'subdir')
      for (let j = 0; j < FILES; ++j) {
        assert(fs.existsSync(path.join(destSub, j.toString())))
      }
    })

    it('should preserve symbolic links', () => {
      fs.mkdirsSync(src)
      fs.symlinkSync('destination', path.join(src, 'symlink'))

      fs.copySync(src, dest)

      const link = fs.readlinkSync(path.join(dest, 'symlink'))
      assert.strictEqual(link, 'destination')
    })

    it('should should apply filter recursively', () => {
      const FILES = 2
      // Don't match anything that ends with a digit higher than 0:
      const filter = s => /(0|\D)$/i.test(s)

      fs.mkdirsSync(src)

      for (let i = 0; i < FILES; ++i) {
        fs.writeFileSync(path.join(src, i.toString()), crypto.randomBytes(SIZE))
      }

      const subdir = path.join(src, 'subdir')
      fs.mkdirsSync(subdir)

      for (let i = 0; i < FILES; ++i) {
        fs.writeFileSync(path.join(subdir, i.toString()), crypto.randomBytes(SIZE))
      }

      fs.copySync(src, dest, filter)

      assert(fs.existsSync(dest))
      assert(FILES > 1)

      for (let i = 0; i < FILES; ++i) {
        if (i === 0) {
          assert(fs.existsSync(path.join(dest, i.toString())))
        } else {
          assert(!fs.existsSync(path.join(dest, i.toString())))
        }
      }

      const destSub = path.join(dest, 'subdir')

      for (let j = 0; j < FILES; ++j) {
        if (j === 0) {
          assert(fs.existsSync(path.join(destSub, j.toString())))
        } else {
          assert(!fs.existsSync(path.join(destSub, j.toString())))
        }
      }
    })

    it('should apply the filter to directory names', () => {
      const IGNORE = 'ignore'
      const filter = p => !~p.indexOf(IGNORE)

      fs.mkdirsSync(src)

      const ignoreDir = path.join(src, IGNORE)
      fs.mkdirsSync(ignoreDir)

      fs.writeFileSync(path.join(ignoreDir, 'file'), crypto.randomBytes(SIZE))

      fs.copySync(src, dest, filter)

      assert(!fs.existsSync(path.join(dest, IGNORE)), 'directory was not ignored')
      assert(!fs.existsSync(path.join(dest, IGNORE, 'file')), 'file was not ignored')
    })

    describe('> when the destination dir does not exist', () => {
      it('should create the destination directory and copy the file', () => {
        const src = path.join(TEST_DIR, 'data/')
        fs.mkdirSync(src)

        const d1 = 'file1'
        const d2 = 'file2'

        fs.writeFileSync(path.join(src, 'f1.txt'), d1)
        fs.writeFileSync(path.join(src, 'f2.txt'), d2)

        const dest = path.join(TEST_DIR, 'this/path/does/not/exist/outputDir')

        fs.copySync(src, dest)

        const o1 = fs.readFileSync(path.join(dest, 'f1.txt'), 'utf8')
        const o2 = fs.readFileSync(path.join(dest, 'f2.txt'), 'utf8')

        assert.strictEqual(d1, o1)
        assert.strictEqual(d2, o2)
      })
    })
  })
})
