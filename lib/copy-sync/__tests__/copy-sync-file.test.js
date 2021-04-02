'use strict'

const fs = require('../../')
const os = require('os')
const path = require('path')
const assert = require('assert')
const crypto = require('crypto')

/* global afterEach, beforeEach, describe, it */

const SIZE = 16 * 64 * 1024 + 7

describe('+ copySync() / file', () => {
  let TEST_DIR

  beforeEach(done => {
    TEST_DIR = path.join(os.tmpdir(), 'fs-extra', 'copy-sync-file')
    fs.emptyDir(TEST_DIR, done)
  })

  afterEach(done => fs.remove(TEST_DIR, done))

  describe('> when src is a file', () => {
    describe('> when dest exists and is a directory', () => {
      it('should throw error', () => {
        const src = path.join(TEST_DIR, 'file.txt')
        const dest = path.join(TEST_DIR, 'dir')
        fs.ensureFileSync(src)
        fs.ensureDirSync(dest)

        try {
          fs.copySync(src, dest)
        } catch (err) {
          assert.strictEqual(err.message, `Cannot overwrite directory '${dest}' with non-directory '${src}'.`)
        }
      })
    })

    it('should copy the file synchronously', () => {
      const fileSrc = path.join(TEST_DIR, 'TEST_fs-extra_src')
      const fileDest = path.join(TEST_DIR, 'TEST_fs-extra_copy')

      fs.writeFileSync(fileSrc, crypto.randomBytes(SIZE))

      const srcMd5 = crypto.createHash('md5').update(fs.readFileSync(fileSrc)).digest('hex')
      let destMd5 = ''

      fs.copySync(fileSrc, fileDest)

      destMd5 = crypto.createHash('md5').update(fs.readFileSync(fileDest)).digest('hex')
      assert.strictEqual(srcMd5, destMd5)
    })

    it('should follow symlinks', () => {
      const fileSrc = path.join(TEST_DIR, 'TEST_fs-extra_src')
      const fileDest = path.join(TEST_DIR, 'TEST_fs-extra_copy')
      const linkSrc = path.join(TEST_DIR, 'TEST_fs-extra_copy_link')

      fs.writeFileSync(fileSrc, crypto.randomBytes(SIZE))

      const srcMd5 = crypto.createHash('md5').update(fs.readFileSync(fileSrc)).digest('hex')
      let destMd5 = ''

      fs.symlinkSync(fileSrc, linkSrc)
      fs.copySync(linkSrc, fileDest)
      destMd5 = crypto.createHash('md5').update(fs.readFileSync(fileDest)).digest('hex')
      assert.strictEqual(srcMd5, destMd5)
    })

    it('should maintain file mode', () => {
      const fileSrc = path.join(TEST_DIR, 'TEST_fs-extra_src')
      const fileDest = path.join(TEST_DIR, 'TEST_fs-extra_copy')
      fs.writeFileSync(fileSrc, crypto.randomBytes(SIZE))

      fs.chmodSync(fileSrc, 0o750)
      fs.copySync(fileSrc, fileDest)

      const statSrc = fs.statSync(fileSrc)
      const statDest = fs.statSync(fileDest)
      assert.strictEqual(statSrc.mode, statDest.mode)
    })

    it('should only copy files allowed by filter fn', () => {
      const srcFile1 = path.join(TEST_DIR, '1.html')
      const srcFile2 = path.join(TEST_DIR, '2.css')
      const srcFile3 = path.join(TEST_DIR, '3.jade')

      fs.writeFileSync(srcFile1, '')
      fs.writeFileSync(srcFile2, '')
      fs.writeFileSync(srcFile3, '')

      const destFile1 = path.join(TEST_DIR, 'dest1.html')
      const destFile2 = path.join(TEST_DIR, 'dest2.css')
      const destFile3 = path.join(TEST_DIR, 'dest3.jade')

      const filter = s => s.split('.').pop() !== 'css'

      fs.copySync(srcFile1, destFile1, filter)
      fs.copySync(srcFile2, destFile2, filter)
      fs.copySync(srcFile3, destFile3, filter)

      assert(fs.existsSync(destFile1))
      assert(!fs.existsSync(destFile2))
      assert(fs.existsSync(destFile3))
    })

    it('should not call filter fn more than needed', () => {
      const src = path.join(TEST_DIR, 'foo')

      fs.writeFileSync(src, '')

      const dest = path.join(TEST_DIR, 'bar')

      let filterCallCount = 0
      const filter = () => {
        filterCallCount++
        return true
      }

      fs.copySync(src, dest, filter)

      assert.strictEqual(filterCallCount, 1)
      assert(fs.existsSync(dest))
    })

    describe('> when the destination dir does not exist', () => {
      it('should create the destination directory and copy the file', () => {
        const src = path.join(TEST_DIR, 'file.txt')
        const dest = path.join(TEST_DIR, 'this/path/does/not/exist/copied.txt')
        const data = 'did it copy?\n'

        fs.writeFileSync(src, data, 'utf8')
        fs.copySync(src, dest)

        const data2 = fs.readFileSync(dest, 'utf8')

        assert.strictEqual(data, data2)
      })
    })

    describe('> when src file does not have write permissions', () => {
      it('should be able to copy contents of file', () => {
        const fileSrc = path.join(TEST_DIR, 'file.txt')
        const fileDest = path.join(TEST_DIR, 'file-copy.txt')
        const data = 'did it copy?'

        fs.writeFileSync(fileSrc, data, 'utf8')
        fs.chmodSync(fileSrc, '0444')

        fs.copySync(fileSrc, fileDest)

        const data2 = fs.readFileSync(fileDest, 'utf8')

        assert.strictEqual(data, data2)
      })
    })

    describe('> when overwrite option is passed', () => {
      const srcData = 'some src data'
      let src, dest

      beforeEach(() => {
        src = path.join(TEST_DIR, 'src-file')
        dest = path.join(TEST_DIR, 'des-file')

        // source file must always exist in these cases
        fs.writeFileSync(src, srcData)
      })

      describe('> when destination file does NOT exist', () => {
        describe('> when overwrite is true', () => {
          it('should copy the file and not throw an error', () => {
            fs.copySync(src, dest, { overwrite: true })
            const destData = fs.readFileSync(dest, 'utf8')
            assert.strictEqual(srcData, destData)
          })
        })

        describe('> when overwrite is false', () => {
          it('should copy the file and not throw an error', () => {
            fs.copySync(src, dest, { overwrite: false })
            const destData = fs.readFileSync(dest, 'utf8')
            assert.strictEqual(srcData, destData)
          })
        })
      })

      describe('when destination file does exist', () => {
        let destData

        beforeEach(() => {
          destData = 'some dest data'
          fs.writeFileSync(dest, destData)
        })

        describe('> when overwrite is true', () => {
          it('should copy the file and not throw an error', () => {
            fs.copySync(src, dest, { overwrite: true })
            destData = fs.readFileSync(dest, 'utf8')
            assert.strictEqual(srcData, destData)
          })
        })

        describe('> when overwrite is false', () => {
          it('should not throw an error', () => {
            fs.copySync(src, dest, { overwrite: false })

            // copy never happened
            const destDataNew = fs.readFileSync(dest, 'utf8')
            assert.strictEqual(destData, destDataNew)
          })
          it('should throw an error when errorOnExist is true', () => {
            assert.throws(() => fs.copySync(src, dest, { overwrite: false, errorOnExist: true }))

            // copy never happened
            const destDataNew = fs.readFileSync(dest, 'utf8')
            assert.strictEqual(destData, destDataNew)
          })
        })

        describe('> when overwrite is true and dest is readonly', () => {
          it('should copy the file and not throw an error', () => {
            try {
              fs.chmodSync(dest, 0o444)
              fs.copySync(src, dest, { overwrite: true })
              destData = fs.readFileSync(dest, 'utf8')
              assert.strictEqual(srcData, destData)
            } finally {
              // destination file is readonly so just remove it so we don't affect other tests
              fs.unlinkSync(dest)
            }
          })
        })
      })
    })
    describe('clobber', () => {
      let src, dest, srcData, destData

      beforeEach(() => {
        src = path.join(TEST_DIR, 'src-file')
        dest = path.join(TEST_DIR, 'des-file')
        srcData = 'some src data'
        destData = 'some dest data'
        fs.writeFileSync(src, srcData)
        fs.writeFileSync(dest, destData)
      })

      it('is an alias for overwrite', () => {
        fs.copySync(src, dest, { clobber: false })

        // copy never happened
        const destDataNew = fs.readFileSync(dest, 'utf8')
        assert.strictEqual(destData, destDataNew)
      })
    })
  })
})
