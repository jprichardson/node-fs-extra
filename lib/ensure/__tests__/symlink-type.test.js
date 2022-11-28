'use strict'

const CWD = process.cwd()

const fs = require('graceful-fs')
const os = require('os')
const fse = require('../..')
const path = require('path')
const assert = require('assert')
const _symlinkType = require('../symlink-type')
const symlinkType = _symlinkType.symlinkType
const symlinkTypeSync = _symlinkType.symlinkTypeSync
const TEST_DIR = path.join(os.tmpdir(), 'fs-extra', 'ensure-symlink')

/* global afterEach, beforeEach, describe, it, after, before */

describe('symlink-type', () => {
  before(() => {
    fse.emptyDirSync(TEST_DIR)
    process.chdir(TEST_DIR)
  })

  beforeEach(() => {
    fs.writeFileSync('./foo.txt', 'foo\n')
    fse.mkdirsSync('./empty-dir')
    fse.mkdirsSync('./dir-foo')
    fs.writeFileSync('./dir-foo/foo.txt', 'dir-foo\n')
    fse.mkdirsSync('./dir-bar')
    fs.writeFileSync('./dir-bar/bar.txt', 'dir-bar\n')
    fse.mkdirsSync('./real-alpha/real-beta/real-gamma')
  })

  afterEach(done => fse.emptyDir(TEST_DIR, done))

  after(() => {
    process.chdir(CWD)
    fse.removeSync(TEST_DIR)
  })

  const tests = {
    success: [
      // [{arguments} [srcpath, dirpath, [type] , result]
      // smart file type checking
      [['./foo.txt'], 'file'],
      [['./empty-dir'], 'dir'],
      [['./dir-foo/foo.txt'], 'file'],
      [['./dir-bar'], 'dir'],
      [['./dir-bar/bar.txt'], 'file'],
      [['./real-alpha/real-beta/real-gamma'], 'dir'],
      // force dir
      [['./foo.txt', 'dir'], 'dir'],
      [['./empty-dir', 'dir'], 'dir'],
      [['./dir-foo/foo.txt', 'dir'], 'dir'],
      [['./dir-bar', 'dir'], 'dir'],
      [['./dir-bar/bar.txt', 'dir'], 'dir'],
      [['./real-alpha/real-beta/real-gamma', 'dir'], 'dir'],
      // force file
      [['./foo.txt', 'file'], 'file'],
      [['./empty-dir', 'file'], 'file'],
      [['./dir-foo/foo.txt', 'file'], 'file'],
      [['./dir-bar', 'file'], 'file'],
      [['./dir-bar/bar.txt', 'file'], 'file'],
      [['./real-alpha/real-beta/real-gamma', 'file'], 'file'],
      // default for files or dirs that don't exist is file
      [['./missing.txt'], 'file'],
      [['./missing'], 'file'],
      [['./missing.txt'], 'file'],
      [['./missing'], 'file'],
      [['./empty-dir/missing.txt'], 'file'],
      [['./empty-dir/missing'], 'file'],
      [['./empty-dir/missing.txt'], 'file'],
      [['./empty-dir/missing'], 'file'],
      // when src doesnt exist and provided type 'file'
      [['./missing.txt', 'file'], 'file'],
      [['./missing', 'file'], 'file'],
      [['./missing.txt', 'file'], 'file'],
      [['./missing', 'file'], 'file'],
      [['./empty-dir/missing.txt', 'file'], 'file'],
      [['./empty-dir/missing', 'file'], 'file'],
      [['./empty-dir/missing.txt', 'file'], 'file'],
      [['./empty-dir/missing', 'file'], 'file'],
      // when src doesnt exist and provided type 'dir'
      [['./missing.txt', 'dir'], 'dir'],
      [['./missing', 'dir'], 'dir'],
      [['./missing.txt', 'dir'], 'dir'],
      [['./missing', 'dir'], 'dir'],
      [['./empty-dir/missing.txt', 'dir'], 'dir'],
      [['./empty-dir/missing', 'dir'], 'dir'],
      [['./empty-dir/missing.txt', 'dir'], 'dir'],
      [['./empty-dir/missing', 'dir'], 'dir']
    ]
  }

  describe('symlinkType()', () => {
    tests.success.forEach(test => {
      const args = test[0].slice(0)
      const expectedType = test[1]
      it(`should return '${expectedType}' when src '${args[0]}'`, done => {
        const callback = (err, type) => {
          if (err) done(err)
          assert.strictEqual(type, expectedType)
          done()
        }
        args.push(callback)
        return symlinkType(...args)
      })
    })
  })

  describe('symlinkTypeSync()', () => {
    tests.success.forEach(test => {
      const args = test[0]
      const expectedType = test[1]
      it(`should return '${expectedType}' when src '${args[0]}'`, () => {
        const type = symlinkTypeSync(...args)
        assert.strictEqual(type, expectedType)
      })
    })
  })
})
