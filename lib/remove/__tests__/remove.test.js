'use strict'

const assert = require('assert')
const fs = require('fs')
const os = require('os')
const path = require('path')
const sr = require('secure-random')
const fse = require(process.cwd())

/* global afterEach, beforeEach, describe, it */

let TEST_DIR

function buildFixtureDir () {
  const buf = sr.randomBuffer(5)
  const baseDir = path.join(TEST_DIR, `TEST_fs-extra_remove-${Date.now()}`)

  fs.mkdirSync(baseDir)
  fs.writeFileSync(path.join(baseDir, Math.random() + ''), buf)
  fs.writeFileSync(path.join(baseDir, Math.random() + ''), buf)

  const subDir = path.join(TEST_DIR, Math.random() + '')
  fs.mkdirSync(subDir)
  fs.writeFileSync(path.join(subDir, Math.random() + ''))
  return baseDir
}

describe('remove', () => {
  beforeEach(done => {
    TEST_DIR = path.join(os.tmpdir(), 'fs-extra', 'remove')
    fse.emptyDir(TEST_DIR, done)
  })

  afterEach(done => fse.remove(TEST_DIR, done))

  describe('+ remove()', () => {
    it('should delete an empty directory', done => {
      assert(fs.existsSync(TEST_DIR))
      fse.remove(TEST_DIR, err => {
        assert.ifError(err)
        assert(!fs.existsSync(TEST_DIR))
        done()
      })
    })

    it('should delete a directory full of directories and files', done => {
      buildFixtureDir()
      assert(fs.existsSync(TEST_DIR))
      fse.remove(TEST_DIR, err => {
        assert.ifError(err)
        assert(!fs.existsSync(TEST_DIR))
        done()
      })
    })

    it('should delete a file', done => {
      const file = path.join(TEST_DIR, 'file')
      fs.writeFileSync(file, 'hello')

      assert(fs.existsSync(file))
      fse.remove(file, err => {
        assert.ifError(err)
        assert(!fs.existsSync(file))
        done()
      })
    })

    it('should delete a directory full of directories and files with invalid UTF-8 names', done => {
      const separator = Buffer.from(path.sep, 'utf8')
      const base = Buffer.from(TEST_DIR, 'utf8')
      const subdir = Buffer.concat([base, separator, Buffer.from([0x80])])
      const file = Buffer.concat([subdir, separator, Buffer.from([0x41, 0xDF])])

      fs.mkdirSync(subdir)
      assert(fs.existsSync(subdir))
      fs.writeFileSync(file, 'somedata')
      assert(fs.readdirSync(TEST_DIR).length === 1)

      fse.remove(TEST_DIR, err => {
        assert.ifError(err)
        assert(!fs.existsSync(TEST_DIR))
        done()
      })
    })

    it('should delete a directory with invalid UTF-8 name passed as a Buffer', done => {
      const separator = Buffer.from(path.sep, 'utf8')
      const base = Buffer.from(TEST_DIR, 'utf8')
      const subdir = Buffer.concat([base, separator, Buffer.from([0x80])])
      const file = Buffer.concat([subdir, separator, Buffer.from([0x41, 0xDF])])

      fs.mkdirSync(subdir)
      assert(fs.existsSync(subdir))
      fs.writeFileSync(file, 'somedata')
      assert(fs.readdirSync(TEST_DIR).length === 1)

      fse.remove(subdir, err => {
        assert.ifError(err)
        assert(!fs.existsSync(subdir))
        done()
      })
    })

    it('should delete a file with invalid UTF-8 name passed as a Buffer', done => {
      const separator = Buffer.from(path.sep, 'utf8')
      const base = Buffer.from(TEST_DIR, 'utf8')
      const file = Buffer.concat([base, separator, Buffer.from([0x41, 0xDF])])

      fs.writeFileSync(file, 'somedata')
      assert(fs.existsSync(file))

      fse.remove(file, err => {
        assert.ifError(err)
        assert(!fs.existsSync(file))
        done()
      })
    })

    it('should delete without a callback', done => {
      const file = path.join(TEST_DIR, 'file')
      fs.writeFileSync(file, 'hello')

      assert(fs.existsSync(file))
      const existsChecker = setInterval(() => {
        fse.pathExists(file, (err, itDoes) => {
          assert.ifError(err)
          if (!itDoes) {
            clearInterval(existsChecker)
            done()
          }
        })
      }, 25)
      fse.remove(file)
    })

    it('shouldn’t delete glob matches', function (done) {
      const file = path.join(TEST_DIR, 'file?')
      try {
        fs.writeFileSync(file, 'hello')
      } catch (ex) {
        if (ex.code === 'ENOENT') return this.skip('Windows does not support filenames with ‘?’ or ‘*’ in them.')
        throw ex
      }

      const wrongFile = path.join(TEST_DIR, 'file1')
      fs.writeFileSync(wrongFile, 'yo')

      assert(fs.existsSync(file))
      assert(fs.existsSync(wrongFile))
      fse.remove(file, err => {
        assert.ifError(err)
        assert(!fs.existsSync(file))
        assert(fs.existsSync(wrongFile))
        done()
      })
    })

    it('shouldn’t delete glob matches when file doesn’t exist', done => {
      const nonexistentFile = path.join(TEST_DIR, 'file?')

      const wrongFile = path.join(TEST_DIR, 'file1')
      fs.writeFileSync(wrongFile, 'yo')

      assert(!fs.existsSync(nonexistentFile))
      assert(fs.existsSync(wrongFile))
      fse.remove(nonexistentFile, err => {
        assert.ifError(err)
        assert(!fs.existsSync(nonexistentFile))
        assert(fs.existsSync(wrongFile))
        done()
      })
    })
  })
})
