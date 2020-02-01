'use strict'

const assert = require('assert')
const fs = require('fs')
const path = require('path')
const os = require('os')
const fse = require('../../')

/* global afterEach, beforeEach, describe, it */

describe('mkdirp', () => {
  let TEST_DIR
  let _rndDir

  // should investigate this test and file more
  if (os.platform().indexOf('win') === 0) return

  beforeEach(done => {
    TEST_DIR = path.join(os.tmpdir(), 'mkdirp')
    fse.emptyDir(TEST_DIR, () => {
      // for actual tests
      const x = Math.floor(Math.random() * Math.pow(16, 6)).toString(16)
      const y = Math.floor(Math.random() * Math.pow(16, 6)).toString(16)
      const z = Math.floor(Math.random() * Math.pow(16, 6)).toString(16)

      _rndDir = path.join(TEST_DIR, [x, y, z].join(path.sep))

      // just to be safe, although unnecessary
      assert(!fs.existsSync(_rndDir))
      done()
    })
  })

  afterEach(done => fse.remove(TEST_DIR, done))

  describe('umask', () => {
    describe('async', () => {
      it('should have proper umask', done => {
        process.umask(0)

        fse.mkdirp(_rndDir, err => {
          assert.ifError(err)
          fse.pathExists(_rndDir, (err, ex) => {
            assert.ifError(err)
            assert.ok(ex, 'file created')
            fs.stat(_rndDir, (err, stat) => {
              assert.ifError(err)
              assert.strictEqual(stat.mode & 0o777, 0o777 & (~process.umask()))
              assert.ok(stat.isDirectory(), 'target not a directory')
              done()
            })
          })
        })
      })
    })

    describe('sync', () => {
      it('should have proper umask', done => {
        process.umask(0)

        try {
          fse.mkdirpSync(_rndDir)
        } catch (err) {
          return done(err)
        }

        fse.pathExists(_rndDir, (err, ex) => {
          assert.ifError(err)
          assert.ok(ex, 'file created')
          fs.stat(_rndDir, (err, stat) => {
            assert.ifError(err)
            assert.strictEqual(stat.mode & 0o777, (0o777 & (~process.umask())))
            assert.ok(stat.isDirectory(), 'target not a directory')
            done()
          })
        })
      })
    })
  })
})
