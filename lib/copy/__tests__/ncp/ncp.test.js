'use strict'

const fs = require('fs')
const { copy: ncp } = require('../../')
const path = require('path')
const rimraf = require('rimraf')
const assert = require('assert')
const readDirFiles = require('read-dir-files').read // temporary, will remove

/* eslint-env mocha */

const fixturesDir = path.join(__dirname, 'fixtures')

describe('ncp', () => {
  describe('regular files and directories', () => {
    const fixtures = path.join(fixturesDir, 'regular-fixtures')
    const src = path.join(fixtures, 'src')
    const out = path.join(fixtures, 'out')

    before(cb => rimraf(out, () => ncp(src, out, cb)))

    describe('when copying a directory of files', () => {
      it('files are copied correctly', cb => {
        readDirFiles(src, 'utf8', (srcErr, srcFiles) => {
          readDirFiles(out, 'utf8', (outErr, outFiles) => {
            assert.ifError(srcErr)
            assert.deepStrictEqual(srcFiles, outFiles)
            cb()
          })
        })
      })
    })

    describe('when copying files using filter', () => {
      before(cb => {
        const filter = name => name.slice(-1) !== 'a'

        rimraf(out, () => ncp(src, out, { filter }, cb))
      })

      it('files are copied correctly', cb => {
        readDirFiles(src, 'utf8', (srcErr, srcFiles) => {
          function filter (files) {
            for (const fileName in files) {
              const curFile = files[fileName]
              if (curFile instanceof Object) {
                filter(curFile)
              } else if (fileName.slice(-1) === 'a') {
                delete files[fileName]
              }
            }
          }
          filter(srcFiles)
          readDirFiles(out, 'utf8', (outErr, outFiles) => {
            assert.ifError(outErr)
            assert.deepStrictEqual(srcFiles, outFiles)
            cb()
          })
        })
      })
    })

    describe('when using overwrite=true', () => {
      before(function () {
        this.originalCreateReadStream = fs.createReadStream
      })

      after(function () {
        fs.createReadStream = this.originalCreateReadStream
      })

      it('the copy is complete after callback', done => {
        ncp(src, out, { overwrite: true }, err => {
          fs.createReadStream = () => done(new Error('createReadStream after callback'))

          assert.ifError(err)
          process.nextTick(done)
        })
      })
    })

    describe('when using overwrite=false', () => {
      beforeEach(done => rimraf(out, done))

      it('works', cb => {
        ncp(src, out, { overwrite: false }, err => {
          assert.ifError(err)
          cb()
        })
      })

      it('should not error if files exist', cb => {
        ncp(src, out, () => {
          ncp(src, out, { overwrite: false }, err => {
            assert.ifError(err)
            cb()
          })
        })
      })

      it('should error if errorOnExist and file exists', cb => {
        ncp(src, out, () => {
          ncp(src, out, {
            overwrite: false,
            errorOnExist: true
          }, err => {
            assert(err)
            cb()
          })
        })
      })
    })

    describe('clobber', () => {
      beforeEach(done => rimraf(out, done))

      it('is an alias for overwrite', cb => {
        ncp(src, out, () => {
          ncp(src, out, {
            clobber: false,
            errorOnExist: true
          }, err => {
            assert(err)
            cb()
          })
        })
      })
    })

    describe('when using transform', () => {
      it('file descriptors are passed correctly', cb => {
        ncp(src, out, {
          transform: (read, write, file) => {
            assert.notStrictEqual(file.name, undefined)
            assert.strictEqual(typeof file.mode, 'number')
            read.pipe(write)
          }
        }, cb)
      })
    })
  })

  // see https://github.com/AvianFlu/ncp/issues/71
  describe('Issue 71: Odd Async Behaviors', () => {
    const fixtures = path.join(__dirname, 'fixtures', 'regular-fixtures')
    const src = path.join(fixtures, 'src')
    const out = path.join(fixtures, 'out')

    let totalCallbacks = 0

    function copyAssertAndCount (callback) {
      // rimraf(out, function() {
      ncp(src, out, err => {
        assert(!err)
        totalCallbacks += 1
        readDirFiles(src, 'utf8', (srcErr, srcFiles) => {
          readDirFiles(out, 'utf8', (outErr, outFiles) => {
            assert.ifError(srcErr)
            assert.deepStrictEqual(srcFiles, outFiles)
            callback()
          })
        })
      })
      // })
    }

    describe('when copying a directory of files without cleaning the destination', () => {
      it('callback fires once per run and directories are equal', done => {
        const expected = 10
        let count = 10

        function next () {
          if (count > 0) {
            setTimeout(() => {
              copyAssertAndCount(() => {
                count -= 1
                next()
              })
            }, 100)
          } else {
            // console.log('Total callback count is', totalCallbacks)
            assert.strictEqual(totalCallbacks, expected)
            done()
          }
        }

        next()
      })
    })
  })
})
