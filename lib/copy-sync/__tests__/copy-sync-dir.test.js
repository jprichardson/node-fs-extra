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

  describe('> when filter is used', () => {
    it('should should apply filter recursively', done => {
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
      done()
    })

    it('should apply the filter to directory names', done => {
      const IGNORE = 'ignore'
      const filter = p => !~p.indexOf(IGNORE)

      fs.mkdirsSync(src)

      const ignoreDir = path.join(src, IGNORE)
      fs.mkdirsSync(ignoreDir)

      fs.writeFileSync(path.join(ignoreDir, 'file'), crypto.randomBytes(SIZE))

      fs.copySync(src, dest, filter)

      assert(!fs.existsSync(path.join(dest, IGNORE)), 'directory was not ignored')
      assert(!fs.existsSync(path.join(dest, IGNORE, 'file')), 'file was not ignored')
      done()
    })

    it('should apply filter when it is applied only to dest', done => {
      const timeCond = new Date().getTime()

      const filter = (s, d) => fs.statSync(d).birthtime.getTime() < timeCond

      const subdir = path.join(src, 'subdir')
      fs.mkdirsSync(subdir)

      const dest = path.join(TEST_DIR, 'dest')

      setTimeout(() => {
        fs.mkdirsSync(dest)
        try {
          fs.copySync(src, dest, filter)
        } catch (err) {
          assert.ifError(err)
        }
        assert(!fs.existsSync(path.join(dest, 'subdir')))
        done()
      }, 1000)
    })

    it('should apply filter when it is applied to both src and dest', done => {
      const timeCond = new Date().getTime()
      const filter = (s, d) => s.split('.').pop() !== 'css' && fs.statSync(path.dirname(d)).birthtime.getTime() > timeCond

      const dest = path.join(TEST_DIR, 'dest')

      const srcFile1 = path.join(TEST_DIR, '1.html')
      const srcFile2 = path.join(TEST_DIR, '2.css')
      const srcFile3 = path.join(TEST_DIR, '3.jade')

      fs.writeFileSync(srcFile1, '')
      fs.writeFileSync(srcFile2, '')
      fs.writeFileSync(srcFile3, '')

      const destFile1 = path.join(dest, 'dest1.html')
      const destFile2 = path.join(dest, 'dest2.css')
      const destFile3 = path.join(dest, 'dest3.jade')

      setTimeout(() => {
        fs.mkdirsSync(dest)

        fs.copySync(srcFile1, destFile1, filter)
        fs.copySync(srcFile2, destFile2, filter)
        fs.copySync(srcFile3, destFile3, filter)

        assert(fs.existsSync(destFile1))
        assert(!fs.existsSync(destFile2))
        assert(fs.existsSync(destFile3))
        done()
      }, 1000)
    })
  })
})
