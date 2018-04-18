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

    it('should error when overwrite=false and file exists', done => {
      const src = path.join(TEST_DIR, 'src.txt')
      const dest = path.join(TEST_DIR, 'dest.txt')

      fse.ensureFileSync(src)
      fse.ensureFileSync(dest)
      fse.copy(src, dest, {overwrite: false, errorOnExist: true}, err => {
        assert(err)
        done()
      })
    })

    it('should error when overwrite=false and file exists in a dir', done => {
      const src = path.join(TEST_DIR, 'src', 'sfile.txt')
      const dest = path.join(TEST_DIR, 'dest', 'dfile.txt')

      fse.ensureFileSync(src)
      fse.ensureFileSync(dest)
      fse.copy(src, dest, {overwrite: false, errorOnExist: true}, err => {
        assert(err)
        done()
      })
    })

    describe('> when src is a file', () => {
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

      it('should return an error if src file does not exist', done => {
        const fileSrc = 'we-simply-assume-this-file-does-not-exist.bin'
        const fileDest = path.join(TEST_DIR, 'TEST_fs-extra_copy')

        fse.copy(fileSrc, fileDest, err => {
          assert(err)
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

    describe('> when src is a directory', () => {
      describe('> when src directory does not exist', () => {
        it('should return an error', done => {
          const ts = path.join(TEST_DIR, 'this_dir_does_not_exist')
          const td = path.join(TEST_DIR, 'this_dir_really_does_not_matter')
          fse.copy(ts, td, err => {
            assert(err)
            done()
          })
        })
      })

      describe('> when dest exists and is a file', () => {
        it('should return an error', done => {
          const src = path.join(TEST_DIR, 'src')
          const dest = path.join(TEST_DIR, 'file.txt')
          fs.mkdirSync(src)
          fse.ensureFileSync(dest)

          fse.copy(src, dest, err => {
            assert.strictEqual(err.message, `Cannot overwrite non-directory '${dest}' with directory '${src}'.`)
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

    describe('> when filter is used', () => {
      it('should do nothing if filter fails', done => {
        const srcDir = path.join(TEST_DIR, 'src')
        const srcFile = path.join(srcDir, 'srcfile.css')
        fse.outputFileSync(srcFile, 'src contents')
        const destDir = path.join(TEST_DIR, 'dest')
        const destFile = path.join(destDir, 'destfile.css')
        const filter = s => path.extname(s) !== '.css' && !fs.statSync(s).isDirectory()

        fse.copy(srcFile, destFile, filter, err => {
          assert.ifError(err)
          assert(!fs.existsSync(destDir))
          done()
        })
      })

      it('should only copy files allowed by filter fn', done => {
        const srcFile1 = path.join(TEST_DIR, '1.css')
        fs.writeFileSync(srcFile1, '')
        const destFile1 = path.join(TEST_DIR, 'dest1.css')
        const filter = s => s.split('.').pop() !== 'css'

        fse.copy(srcFile1, destFile1, filter, err => {
          assert(!err)
          assert(!fs.existsSync(destFile1))
          done()
        })
      })

      it('accepts options object in place of filter', done => {
        const srcFile1 = path.join(TEST_DIR, '1.jade')
        fs.writeFileSync(srcFile1, '')
        const destFile1 = path.join(TEST_DIR, 'dest1.jade')
        const options = { filter: s => /.html$|.css$/i.test(s) }

        fse.copy(srcFile1, destFile1, options, (err) => {
          assert(!err)
          assert(!fs.existsSync(destFile1))
          done()
        })
      })

      it('allows filter fn to return a promise', done => {
        const srcFile1 = path.join(TEST_DIR, '1.css')
        fs.writeFileSync(srcFile1, '')
        const destFile1 = path.join(TEST_DIR, 'dest1.css')
        const filter = s => Promise.resolve(s.split('.').pop() !== 'css')

        fse.copy(srcFile1, destFile1, filter, err => {
          assert(!err)
          assert(!fs.existsSync(destFile1))
          done()
        })
      })

      it('should apply filter recursively', done => {
        const FILES = 2
        // Don't match anything that ends with a digit higher than 0:
        const filter = s => /(0|\D)$/i.test(s)

        const src = path.join(TEST_DIR, 'src')
        fse.mkdirsSync(src)

        for (let i = 0; i < FILES; ++i) {
          fs.writeFileSync(path.join(src, i.toString()), crypto.randomBytes(SIZE))
        }

        const subdir = path.join(src, 'subdir')
        fse.mkdirsSync(subdir)

        for (let i = 0; i < FILES; ++i) {
          fs.writeFileSync(path.join(subdir, i.toString()), crypto.randomBytes(SIZE))
        }
        const dest = path.join(TEST_DIR, 'dest')
        fse.copy(src, dest, filter, err => {
          assert(!err)

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
      })

      it('should apply filter to directory names', done => {
        const IGNORE = 'ignore'
        const filter = p => !~p.indexOf(IGNORE)

        const src = path.join(TEST_DIR, 'src')
        fse.mkdirsSync(src)

        const ignoreDir = path.join(src, IGNORE)
        fse.mkdirsSync(ignoreDir)

        fse.writeFileSync(path.join(ignoreDir, 'file'), crypto.randomBytes(SIZE))

        const dest = path.join(TEST_DIR, 'dest')

        fse.copySync(src, dest, filter)

        assert(!fs.existsSync(path.join(dest, IGNORE)), 'directory was not ignored')
        assert(!fs.existsSync(path.join(dest, IGNORE, 'file')), 'file was not ignored')
        done()
      })

      it('should apply filter when it is applied only to dest', done => {
        const timeCond = new Date().getTime()

        const filter = (s, d) => fs.statSync(d).birthtime.getTime() < timeCond

        const src = path.join(TEST_DIR, 'src')
        fse.mkdirsSync(src)
        const subdir = path.join(src, 'subdir')
        fse.mkdirsSync(subdir)

        const dest = path.join(TEST_DIR, 'dest')

        setTimeout(() => {
          fse.mkdirsSync(dest)

          fse.copy(src, dest, filter, err => {
            assert(!err)
            assert(!fs.existsSync(path.join(dest, 'subdir')))
            done()
          })
        }, 1000)
      })

      it('should apply filter when it is applied to both src and dest', done => {
        const timeCond = new Date().getTime()
        const filter = (s, d) => s.split('.').pop() !== 'css' && fs.statSync(path.dirname(d)).birthtime.getTime() > timeCond

        const dest = path.join(TEST_DIR, 'dest')
        setTimeout(() => {
          fse.mkdirsSync(dest)

          const srcFile1 = path.join(TEST_DIR, '1.html')
          const srcFile2 = path.join(TEST_DIR, '2.css')
          const srcFile3 = path.join(TEST_DIR, '3.jade')

          fse.writeFileSync(srcFile1, '')
          fse.writeFileSync(srcFile2, '')
          fse.writeFileSync(srcFile3, '')

          const destFile1 = path.join(dest, 'dest1.html')
          const destFile2 = path.join(dest, 'dest2.css')
          const destFile3 = path.join(dest, 'dest3.jade')

          fse.copy(srcFile1, destFile1, filter, err => {
            assert(!err)
            assert(fs.existsSync(destFile1))

            fse.copy(srcFile2, destFile2, filter, err => {
              assert(!err)
              assert(!fs.existsSync(destFile2))

              fse.copy(srcFile3, destFile3, filter, err => {
                assert(!err)
                assert(fs.existsSync(destFile3))
                done()
              })
            })
          })
        }, 1000)
      })
    })
  })
})
