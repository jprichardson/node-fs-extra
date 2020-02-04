'use strict'

const fs = require('fs')
const os = require('os')
const fse = require(process.cwd())
const path = require('path')
const assert = require('assert')

/* global beforeEach, describe, it */

describe('remove/sync', () => {
  let TEST_DIR

  beforeEach(done => {
    TEST_DIR = path.join(os.tmpdir(), 'fs-extra', 'remove-sync')
    fse.emptyDir(TEST_DIR, done)
  })

  describe('+ removeSync()', () => {
    it('should delete directories and files synchronously', () => {
      assert(fs.existsSync(TEST_DIR))
      fs.writeFileSync(path.join(TEST_DIR, 'somefile'), 'somedata')
      fse.removeSync(TEST_DIR)
      assert(!fs.existsSync(TEST_DIR))
    })

    it('should delete an empty directory synchronously', () => {
      assert(fs.existsSync(TEST_DIR))
      fse.removeSync(TEST_DIR)
      assert(!fs.existsSync(TEST_DIR))
    })

    it('should delete contained files and dirs with invalid UTF-8 names', () => {
      assert(fs.existsSync(TEST_DIR))
      const separator = Buffer.from(path.sep, 'utf8')
      const base = Buffer.from(TEST_DIR, 'utf8')
      const subdir = Buffer.concat([base, separator, Buffer.from([0x80])])
      const file = Buffer.concat([subdir, separator, Buffer.from([0x41, 0xDF])])
      fs.mkdirSync(subdir)
      assert(fs.existsSync(subdir))
      fs.writeFileSync(file, 'somedata')
      fse.removeSync(TEST_DIR)
      assert(!fs.existsSync(TEST_DIR))
    })

    it('should delete dir with invalid UTF-8 name passed as a Buffer', () => {
      assert(fs.existsSync(TEST_DIR))
      const separator = Buffer.from(path.sep, 'utf8')
      const base = Buffer.from(TEST_DIR, 'utf8')
      const subdir = Buffer.concat([base, separator, Buffer.from([0x80])])
      const file = Buffer.concat([subdir, separator, Buffer.from([0x41, 0xDF])])
      fs.mkdirSync(subdir)
      assert(fs.existsSync(subdir))
      fs.writeFileSync(file, 'somedata')
      fse.removeSync(subdir)
      assert(!fs.existsSync(subdir))
    })
  })
})
