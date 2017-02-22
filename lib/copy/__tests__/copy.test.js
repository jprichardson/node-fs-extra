'use strict'

const fs = require('fs')
const os = require('os')
const fse = require('../../')
const path = require('path')
const assert = require('assert')
const crypto = require('crypto')

/* global afterEach, beforeEach, describe, it */

const SIZE = 16 * 64 * 1024 + 7
let TEST_DIR = ''

describe('fs-extra', () => {
  beforeEach(done => {
    TEST_DIR = path.join(os.tmpdir(), 'fs-extra', 'copy')
    fse.emptyDir(TEST_DIR, done)
  })

  afterEach(done => fse.remove(TEST_DIR, done))

  describe('+ copy()', () => {
    it('should return an error if src and dest are the same', done => {
      const fileSrc = path.join(TEST_DIR, 'TEST_fs-extra_copy')
      const fileDest = path.join(TEST_DIR, 'TEST_fs-extra_copy')
      fse.copy(fileSrc, fileDest, err => {
        assert.equal(err.message, 'Source and destination must not be the same.')
        done()
      })
    })

    describe('> when the source is a file', () => {
      it('should copy the file asynchronously', done => {
        const fileSrc = path.join(TEST_DIR, 'TEST_fs-extra_src')
        const fileDest = path.join(TEST_DIR, 'TEST_fs-extra_copy')
        fs.writeFileSync(fileSrc, crypto.randomBytes(SIZE))
        const srcMd5 = crypto.createHash('md5').update(fs.readFileSync(fileSrc)).digest('hex')
        let destMd5 = ''

        fse.copy(fileSrc, fileDest, err => {
          assert(!err)
          destMd5 = crypto.createHash('md5').update(fs.readFileSync(fileDest)).digest('hex')
          assert.strictEqual(srcMd5, destMd5)
          done()
        })
      })

      it('should return an error if the source file does not exist', done => {
        const fileSrc = 'we-simply-assume-this-file-does-not-exist.bin'
        const fileDest = path.join(TEST_DIR, 'TEST_fs-extra_copy')

        fse.copy(fileSrc, fileDest, err => {
          assert(err)
          done()
        })
      })

      it('should only copy files allowed by filter fn', done => {
        const srcFile1 = path.join(TEST_DIR, '1.css')
        fs.writeFileSync(srcFile1, '')
        const destFile1 = path.join(TEST_DIR, 'dest1.css')
        const filter = s => s.split('.').pop() !== 'css'
        fse.copy(srcFile1, destFile1, filter, () => {
          assert(!fs.existsSync(destFile1))
          done()
        })
      })

      it('accepts options object in place of filter', done => {
        const srcFile1 = path.join(TEST_DIR, '1.jade')
        fs.writeFileSync(srcFile1, '')
        const destFile1 = path.join(TEST_DIR, 'dest1.jade')
        const options = { filter: s => /.html$|.css$/i.test(s) }
        fse.copy(srcFile1, destFile1, options, () => {
          assert(!fs.existsSync(destFile1))
          done()
        })
      })

      it('should copy to a destination file with two \'$\' characters in name (eg: TEST_fs-extra_$$_copy)', done => {
        const fileSrc = path.join(TEST_DIR, 'TEST_fs-extra_src')
        const fileDest = path.join(TEST_DIR, 'TEST_fs-extra_$$_copy')

        fs.writeFileSync(fileSrc, '')

        fse.copy(fileSrc, fileDest, err => {
          assert(!err)
          fs.statSync(fileDest)
          done()
        })
      })

      describe('> when the destination dir does not exist', () => {
        it('should create the destination directory and copy the file', done => {
          const src = path.join(TEST_DIR, 'file.txt')
          const dest = path.join(TEST_DIR, 'this/path/does/not/exist/copied.txt')
          const data = 'did it copy?\n'

          fs.writeFileSync(src, data, 'utf8')

          fse.copy(src, dest, err => {
            const data2 = fs.readFileSync(dest, 'utf8')
            assert.strictEqual(data, data2)
            done(err)
          })
        })
      })
    })

    describe('> when the source is a directory', () => {
      describe('> when the source directory does not exist', () => {
        it('should return an error', done => {
          const ts = path.join(TEST_DIR, 'this_dir_does_not_exist')
          const td = path.join(TEST_DIR, 'this_dir_really_does_not_matter')
          fse.copy(ts, td, err => {
            assert(err)
            done()
          })
        })
      })

      it('should copy the directory asynchronously', done => {
        const FILES = 2
        const src = path.join(TEST_DIR, 'src')
        const dest = path.join(TEST_DIR, 'dest')

        fse.mkdirs(src, err => {
          assert(!err)
          for (let i = 0; i < FILES; ++i) {
            fs.writeFileSync(path.join(src, i.toString()), crypto.randomBytes(SIZE))
          }

          const subdir = path.join(src, 'subdir')
          fse.mkdirs(subdir, err => {
            assert(!err)
            for (let i = 0; i < FILES; ++i) {
              fs.writeFileSync(path.join(subdir, i.toString()), crypto.randomBytes(SIZE))
            }

            fse.copy(src, dest, err => {
              assert.ifError(err)
              assert(fs.existsSync(dest))

              for (let i = 0; i < FILES; ++i) {
                assert(fs.existsSync(path.join(dest, i.toString())))
              }

              const destSub = path.join(dest, 'subdir')
              for (let j = 0; j < FILES; ++j) {
                assert(fs.existsSync(path.join(destSub, j.toString())))
              }

              done()
            })
          })
        })
      })

      describe('> when the destination dir does not exist', () => {
        it('should create the destination directory and copy the file', done => {
          const src = path.join(TEST_DIR, 'data/')
          fse.mkdirsSync(src)
          const d1 = 'file1'
          const d2 = 'file2'

          fs.writeFileSync(path.join(src, 'f1.txt'), d1)
          fs.writeFileSync(path.join(src, 'f2.txt'), d2)

          const dest = path.join(TEST_DIR, 'this/path/does/not/exist/outputDir')

          fse.copy(src, dest, err => {
            const o1 = fs.readFileSync(path.join(dest, 'f1.txt'), 'utf8')
            const o2 = fs.readFileSync(path.join(dest, 'f2.txt'), 'utf8')

            assert.strictEqual(d1, o1)
            assert.strictEqual(d2, o2)

            done(err)
          })
        })
      })

      describe('> when src dir does not exist', () => {
        it('should return an error', done => {
          fse.copy('/does/not/exist', '/something/else', err => {
            assert(err instanceof Error)
            done()
          })
        })
      })
    })
  })
})
