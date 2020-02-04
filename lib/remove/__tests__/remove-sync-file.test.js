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
    it('should delete a file synchronously', () => {
      const file = path.join(TEST_DIR, 'file')
      fs.writeFileSync(file, 'hello')
      assert(fs.existsSync(file))
      fse.removeSync(file)
      assert(!fs.existsSync(file))
    })

    it('should delete file with invalid UTF-8 name passed as a Buffer', () => {
      assert(fs.existsSync(TEST_DIR))
      const separator = Buffer.from(path.sep, 'utf8')
      const base = Buffer.from(TEST_DIR, 'utf8')
      const file = Buffer.concat([base, separator, Buffer.from([0x41, 0xDF])])
      fs.writeFileSync(file, 'hello')
      assert(fs.existsSync(file))
      fse.removeSync(file)
      assert(!fs.existsSync(file))
    })
  })
})
