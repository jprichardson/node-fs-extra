'use strict'

const fs = require('fs')
const os = require('os')
const fse = require(process.cwd())
const path = require('path')
const assert = require('assert')

/* global afterEach, beforeEach, describe, it */

describe('fs-extra', () => {
  let TEST_DIR

  beforeEach(done => {
    TEST_DIR = path.join(os.tmpdir(), 'fs-extra', 'mkdir')
    fse.emptyDir(TEST_DIR, done)
  })

  afterEach(done => fse.remove(TEST_DIR, done))

  describe('+ mkdirs()', () => {
    it('should make the directory', done => {
      const dir = path.join(TEST_DIR, 'tmp-' + Date.now() + Math.random())

      assert(!fs.existsSync(dir))

      fse.mkdirs(dir, err => {
        assert.ifError(err)
        assert(fs.existsSync(dir))
        done()
      })
    })

    it('should make the entire directory path', done => {
      const dir = path.join(TEST_DIR, 'tmp-' + Date.now() + Math.random())
      const newDir = path.join(TEST_DIR, 'dfdf', 'ffff', 'aaa')

      assert(!fs.existsSync(dir))

      fse.mkdirs(newDir, err => {
        assert.ifError(err)
        assert(fs.existsSync(newDir))
        done()
      })
    })
  })

  describe('+ mkdirsSync()', () => {
    it('should make the directory', done => {
      const dir = path.join(TEST_DIR, 'tmp-' + Date.now() + Math.random())

      assert(!fs.existsSync(dir))
      fse.mkdirsSync(dir)
      assert(fs.existsSync(dir))

      done()
    })

    it('should make the entire directory path', done => {
      const dir = path.join(TEST_DIR, 'tmp-' + Date.now() + Math.random())
      const newDir = path.join(dir, 'dfdf', 'ffff', 'aaa')

      assert(!fs.existsSync(newDir))
      fse.mkdirsSync(newDir)
      assert(fs.existsSync(newDir))

      done()
    })
  })
})
