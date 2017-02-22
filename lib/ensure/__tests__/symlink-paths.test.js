'use strict'

const CWD = process.cwd()

const fs = require('graceful-fs')
const os = require('os')
const fse = require(CWD)
const path = require('path')
const assert = require('assert')
const _symlinkPaths = require('../symlink-paths')
const symlinkPaths = _symlinkPaths.symlinkPaths
const symlinkPathsSync = _symlinkPaths.symlinkPathsSync
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

  const tests = [
    [['foo.txt', 'symlink.txt'], {toCwd: 'foo.txt', toDst: 'foo.txt'}], // smart && nodestyle
    [['foo.txt', 'empty-dir/symlink.txt'], {toCwd: 'foo.txt', toDst: '../foo.txt'}], // smart
    [['../foo.txt', 'empty-dir/symlink.txt'], {toCwd: 'foo.txt', toDst: '../foo.txt'}], // nodestyle
    [['foo.txt', 'dir-bar/symlink.txt'], {toCwd: 'foo.txt', toDst: '../foo.txt'}], // smart
    [['../foo.txt', 'dir-bar/symlink.txt'], {toCwd: 'foo.txt', toDst: '../foo.txt'}], // nodestyle
    // this is to preserve node's symlink capability these arguments say create
    // a link to 'dir-foo/foo.txt' this works because it exists this is unlike
    // the previous example with 'empty-dir' because 'empty-dir/foo.txt' does not exist.
    [['foo.txt', 'dir-foo/symlink.txt'], {toCwd: 'dir-foo/foo.txt', toDst: 'foo.txt'}], // nodestyle
    [['foo.txt', 'real-alpha/real-beta/real-gamma/symlink.txt'], {toCwd: 'foo.txt', toDst: '../../../foo.txt'}]
  ]

  // formats paths to pass on multiple operating systems
  tests.forEach(test => {
    test[0][0] = path.join(test[0][0])
    test[0][1] = path.join(test[0][1])
    test[1] = {
      toCwd: path.join(test[1].toCwd),
      toDst: path.join(test[1].toDst)
    }
  })

  describe('symlinkPaths()', () => {
    tests.forEach(test => {
      const args = test[0].slice(0)
      const expectedRelativePaths = test[1]
      it(`should return '${JSON.stringify(expectedRelativePaths)}' when src '${args[0]}' and dst is '${args[1]}'`, done => {
        const callback = (err, relativePaths) => {
          if (err) done(err)
          assert.deepEqual(relativePaths, expectedRelativePaths)
          done()
        }
        args.push(callback)
        return symlinkPaths.apply(null, args)
      })
    })
  })

  describe('symlinkPathsSync()', () => {
    tests.forEach(test => {
      const args = test[0].slice(0)
      const expectedRelativePaths = test[1]
      it(`should return '${JSON.stringify(expectedRelativePaths)}' when src '${args[0]}' and dst is '${args[1]}'`, () => {
        const relativePaths = symlinkPathsSync.apply(null, args)
        assert.deepEqual(relativePaths, expectedRelativePaths)
      })
    })
  })
})
