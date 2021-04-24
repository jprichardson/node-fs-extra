'use strict'

const CWD = process.cwd()

const fs = require('graceful-fs')
const os = require('os')
const fse = require(CWD)
const path = require('path')
const assert = require('assert')
const _symlinkPaths = require('../symlink-paths')
const symlinkPathsSync = _symlinkPaths.symlinkPathsSync
const ensureSymlink = fse.ensureSymlink
const ensureSymlinkSync = fse.ensureSymlinkSync

/* global afterEach, beforeEach, describe, it, after, before */

let TEST_DIR

describe('fse-ensure-symlink', () => {
  TEST_DIR = path.join(os.tmpdir(), 'fs-extra', 'ensure-symlink')

  const tests = [
    // [[srcpath, dstpath], fs.symlink expect, fse.ensureSymlink expect]
    [['./foo.txt', './symlink.txt'], 'file-success', 'file-success'],
    [['../foo.txt', './empty-dir/symlink.txt'], 'file-success', 'file-success'],
    [['../foo.txt', './empty-dir/symlink.txt'], 'file-success', 'file-success'],
    [['./foo.txt', './dir-foo/symlink.txt'], 'file-success', 'file-success'],
    [['./foo.txt', './empty-dir/symlink.txt'], 'file-broken', 'file-success'],
    [['./foo.txt', './real-alpha/symlink.txt'], 'file-broken', 'file-success'],
    [['./foo.txt', './real-alpha/real-beta/symlink.txt'], 'file-broken', 'file-success'],
    [['./foo.txt', './real-alpha/real-beta/real-gamma/symlink.txt'], 'file-broken', 'file-success'],
    [['./foo.txt', './alpha/symlink.txt'], 'file-error', 'file-success'],
    [['./foo.txt', './alpha/beta/symlink.txt'], 'file-error', 'file-success'],
    [['./foo.txt', './alpha/beta/gamma/symlink.txt'], 'file-error', 'file-success'],
    [['./foo.txt', './real-symlink.txt'], 'file-error', 'file-success'],
    [['./dir-foo/foo.txt', './real-symlink.txt'], 'file-error', 'file-error'],
    [['./missing.txt', './symlink.txt'], 'file-broken', 'file-error'],
    [['./missing.txt', './missing-dir/symlink.txt'], 'file-error', 'file-error'],
    // error is thrown if destination path exists
    [['./foo.txt', './dir-foo/foo.txt'], 'file-error', 'file-error'],
    [['./dir-foo', './symlink-dir-foo'], 'dir-success', 'dir-success'],
    [['../dir-bar', './dir-foo/symlink-dir-bar'], 'dir-success', 'dir-success'],
    [['./dir-bar', './dir-foo/symlink-dir-bar'], 'dir-broken', 'dir-success'],
    [['./dir-bar', './empty-dir/symlink-dir-bar'], 'dir-broken', 'dir-success'],
    [['./dir-bar', './real-alpha/symlink-dir-bar'], 'dir-broken', 'dir-success'],
    [['./dir-bar', './real-alpha/real-beta/symlink-dir-bar'], 'dir-broken', 'dir-success'],
    [['./dir-bar', './real-alpha/real-beta/real-gamma/symlink-dir-bar'], 'dir-broken', 'dir-success'],
    [['./dir-foo', './alpha/dir-foo'], 'dir-error', 'dir-success'],
    [['./dir-foo', './alpha/beta/dir-foo'], 'dir-error', 'dir-success'],
    [['./dir-foo', './alpha/beta/gamma/dir-foo'], 'dir-error', 'dir-success'],
    [['./dir-foo', './real-symlink-dir-foo'], 'dir-error', 'dir-success'],
    [['./dir-bar', './real-symlink-dir-foo'], 'dir-error', 'dir-error'],
    [['./missing', './dir-foo/symlink-dir-missing'], 'dir-broken', 'dir-error'],
    // error is thrown if destination path exists
    [['./dir-foo', './real-alpha/real-beta'], 'dir-error', 'dir-error'],
    [[path.resolve(path.join(TEST_DIR, './foo.txt')), './symlink.txt'], 'file-success', 'file-success'],
    [[path.resolve(path.join(TEST_DIR, './dir-foo/foo.txt')), './symlink.txt'], 'file-success', 'file-success'],
    [[path.resolve(path.join(TEST_DIR, './missing.txt')), './symlink.txt'], 'file-broken', 'file-error'],
    [[path.resolve(path.join(TEST_DIR, '../foo.txt')), './symlink.txt'], 'file-broken', 'file-error'],
    [[path.resolve(path.join(TEST_DIR, '../dir-foo/foo.txt')), './symlink.txt'], 'file-broken', 'file-error']
  ]

  before(() => {
    fse.emptyDirSync(TEST_DIR)
    process.chdir(TEST_DIR)
  })

  beforeEach(() => {
    fs.writeFileSync('./foo.txt', 'foo\n')
    fse.mkdirsSync('empty-dir')
    fse.mkdirsSync('dir-foo')
    fs.writeFileSync('dir-foo/foo.txt', 'dir-foo\n')
    fse.mkdirsSync('dir-bar')
    fs.writeFileSync('dir-bar/bar.txt', 'dir-bar\n')
    fse.mkdirsSync('real-alpha/real-beta/real-gamma')
    fs.symlinkSync('foo.txt', 'real-symlink.txt')
    fs.symlinkSync('dir-foo', 'real-symlink-dir-foo')
  })

  afterEach(done => fse.emptyDir(TEST_DIR, done))

  after(() => {
    process.chdir(CWD)
    fse.removeSync(TEST_DIR)
  })

  function fileSuccess (args, fn) {
    const srcpath = args[0]
    const dstpath = args[1]
    it(`should create symlink file using src ${srcpath} and dst ${dstpath}`, done => {
      const callback = err => {
        if (err) return done(err)
        const relative = symlinkPathsSync(srcpath, dstpath)
        const srcContent = fs.readFileSync(relative.toCwd, 'utf8')
        const dstDir = path.dirname(dstpath)
        const dstBasename = path.basename(dstpath)
        const isSymlink = fs.lstatSync(dstpath).isSymbolicLink()
        const dstContent = fs.readFileSync(dstpath, 'utf8')
        const dstDirContents = fs.readdirSync(dstDir)
        assert.strictEqual(isSymlink, true)
        assert.strictEqual(srcContent, dstContent)
        assert(dstDirContents.indexOf(dstBasename) >= 0)
        return done()
      }
      args.push(callback)
      return fn(...args)
    })
  }

  function fileBroken (args, fn) {
    const srcpath = args[0]
    const dstpath = args[1]
    it(`should create broken symlink file using src ${srcpath} and dst ${dstpath}`, done => {
      const callback = err => {
        if (err) return done(err)
        const dstDir = path.dirname(dstpath)
        const dstBasename = path.basename(dstpath)
        const isSymlink = fs.lstatSync(dstpath).isSymbolicLink()
        const dstDirContents = fs.readdirSync(dstDir)
        assert.strictEqual(isSymlink, true)
        assert(dstDirContents.indexOf(dstBasename) >= 0)
        assert.throws(() => fs.readFileSync(dstpath, 'utf8'), Error)
        return done()
      }
      args.push(callback)
      return fn(...args)
    })
  }

  function fileError (args, fn) {
    const srcpath = args[0]
    const dstpath = args[1]
    it(`should return error when creating symlink file using src ${srcpath} and dst ${dstpath}`, done => {
      const dstdirExistsBefore = fs.existsSync(path.dirname(dstpath))
      const callback = err => {
        assert.strictEqual(err instanceof Error, true)
        // ensure that directories aren't created if there's an error
        const dstdirExistsAfter = fs.existsSync(path.dirname(dstpath))
        assert.strictEqual(dstdirExistsBefore, dstdirExistsAfter)
        return done()
      }
      args.push(callback)
      return fn(...args)
    })
  }

  function dirSuccess (args, fn) {
    const srcpath = args[0]
    const dstpath = args[1]
    it(`should create symlink dir using src ${srcpath} and dst ${dstpath}`, done => {
      const callback = err => {
        if (err) return done(err)
        const relative = symlinkPathsSync(srcpath, dstpath)
        const srcContents = fs.readdirSync(relative.toCwd)
        const dstDir = path.dirname(dstpath)
        const dstBasename = path.basename(dstpath)
        const isSymlink = fs.lstatSync(dstpath).isSymbolicLink()
        const dstContents = fs.readdirSync(dstpath)
        const dstDirContents = fs.readdirSync(dstDir)
        assert.strictEqual(isSymlink, true)
        assert.deepStrictEqual(srcContents, dstContents)
        assert(dstDirContents.indexOf(dstBasename) >= 0)
        return done()
      }
      args.push(callback)
      return fn(...args)
    })
  }

  function dirBroken (args, fn) {
    const srcpath = args[0]
    const dstpath = args[1]
    it(`should create broken symlink dir using src ${srcpath} and dst ${dstpath}`, done => {
      const callback = err => {
        if (err) return done(err)
        const dstDir = path.dirname(dstpath)
        const dstBasename = path.basename(dstpath)
        const isSymlink = fs.lstatSync(dstpath).isSymbolicLink()
        const dstDirContents = fs.readdirSync(dstDir)
        assert.strictEqual(isSymlink, true)
        assert(dstDirContents.indexOf(dstBasename) >= 0)
        assert.throws(() => fs.readdirSync(dstpath), Error)
        return done()
      }
      args.push(callback)
      return fn(...args)
    })
  }

  function dirError (args, fn) {
    const srcpath = args[0]
    const dstpath = args[1]
    it(`should return error when creating symlink dir using src ${srcpath} and dst ${dstpath}`, done => {
      const dstdirExistsBefore = fs.existsSync(path.dirname(dstpath))
      const callback = err => {
        assert.strictEqual(err instanceof Error, true)
        // ensure that directories aren't created if there's an error
        const dstdirExistsAfter = fs.existsSync(path.dirname(dstpath))
        assert.strictEqual(dstdirExistsBefore, dstdirExistsAfter)
        return done()
      }
      args.push(callback)
      return fn(...args)
    })
  }

  function fileSuccessSync (args, fn) {
    const srcpath = args[0]
    const dstpath = args[1]
    it(`should create symlink file using src ${srcpath} and dst ${dstpath}`, () => {
      fn(...args)
      const relative = symlinkPathsSync(srcpath, dstpath)
      const srcContent = fs.readFileSync(relative.toCwd, 'utf8')
      const dstDir = path.dirname(dstpath)
      const dstBasename = path.basename(dstpath)
      const isSymlink = fs.lstatSync(dstpath).isSymbolicLink()
      const dstContent = fs.readFileSync(dstpath, 'utf8')
      const dstDirContents = fs.readdirSync(dstDir)
      assert.strictEqual(isSymlink, true)
      assert.strictEqual(srcContent, dstContent)
      assert(dstDirContents.indexOf(dstBasename) >= 0)
    })
  }

  function fileBrokenSync (args, fn) {
    const srcpath = args[0]
    const dstpath = args[1]
    it(`should create broken symlink file using src ${srcpath} and dst ${dstpath}`, () => {
      fn(...args)
      const dstDir = path.dirname(dstpath)
      const dstBasename = path.basename(dstpath)
      const isSymlink = fs.lstatSync(dstpath).isSymbolicLink()
      const dstDirContents = fs.readdirSync(dstDir)
      assert.strictEqual(isSymlink, true)
      assert(dstDirContents.indexOf(dstBasename) >= 0)
      assert.throws(() => fs.readFileSync(dstpath, 'utf8'), Error)
    })
  }

  function fileErrorSync (args, fn) {
    const srcpath = args[0]
    const dstpath = args[1]
    it(`should throw error using src ${srcpath} and dst ${dstpath}`, () => {
      const dstdirExistsBefore = fs.existsSync(path.dirname(dstpath))
      let err = null
      try {
        fn(...args)
      } catch (e) {
        err = e
      }
      assert.strictEqual(err instanceof Error, true)
      const dstdirExistsAfter = fs.existsSync(path.dirname(dstpath))
      assert.strictEqual(dstdirExistsBefore, dstdirExistsAfter)
    })
  }

  function dirSuccessSync (args, fn) {
    const srcpath = args[0]
    const dstpath = args[1]
    it(`should create symlink dir using src ${srcpath} and dst ${dstpath}`, () => {
      fn(...args)
      const relative = symlinkPathsSync(srcpath, dstpath)
      const srcContents = fs.readdirSync(relative.toCwd)
      const dstDir = path.dirname(dstpath)
      const dstBasename = path.basename(dstpath)
      const isSymlink = fs.lstatSync(dstpath).isSymbolicLink()
      const dstContents = fs.readdirSync(dstpath)
      const dstDirContents = fs.readdirSync(dstDir)
      assert.strictEqual(isSymlink, true)
      assert.deepStrictEqual(srcContents, dstContents)
      assert(dstDirContents.indexOf(dstBasename) >= 0)
    })
  }

  function dirBrokenSync (args, fn) {
    const srcpath = args[0]
    const dstpath = args[1]
    it(`should create broken symlink dir using src ${srcpath} and dst ${dstpath}`, () => {
      fn(...args)
      const dstDir = path.dirname(dstpath)
      const dstBasename = path.basename(dstpath)
      const isSymlink = fs.lstatSync(dstpath).isSymbolicLink()
      const dstDirContents = fs.readdirSync(dstDir)
      assert.strictEqual(isSymlink, true)
      assert(dstDirContents.indexOf(dstBasename) >= 0)
      assert.throws(() => fs.readdirSync(dstpath), Error)
    })
  }

  function dirErrorSync (args, fn) {
    const srcpath = args[0]
    const dstpath = args[1]
    it(`should throw error when creating symlink dir using src ${srcpath} and dst ${dstpath}`, () => {
      const dstdirExistsBefore = fs.existsSync(path.dirname(dstpath))
      let err = null
      try {
        fn(...args)
      } catch (e) {
        err = e
      }
      assert.strictEqual(err instanceof Error, true)
      const dstdirExistsAfter = fs.existsSync(path.dirname(dstpath))
      assert.strictEqual(dstdirExistsBefore, dstdirExistsAfter)
    })
  }

  describe('ensureSymlink()', () => {
    const fn = ensureSymlink
    tests.forEach(test => {
      const args = test[0]
      // const nativeBehavior = test[1]
      const newBehavior = test[2]
      if (newBehavior === 'file-success') fileSuccess(args, fn)
      if (newBehavior === 'file-broken') fileBroken(args, fn)
      if (newBehavior === 'file-error') fileError(args, fn)
      if (newBehavior === 'dir-success') dirSuccess(args, fn)
      if (newBehavior === 'dir-broken') dirBroken(args, fn)
      if (newBehavior === 'dir-error') dirError(args, fn)
    })
  })

  describe('ensureSymlink() promise support', () => {
    tests.filter(test => test[2] === 'file-success').forEach(test => {
      const args = test[0]
      const srcpath = args[0]
      const dstpath = args[1]
      it(`should create symlink file using src ${srcpath} and dst ${dstpath}`, () => {
        return ensureSymlink(srcpath, dstpath)
          .then(() => {
            const relative = symlinkPathsSync(srcpath, dstpath)
            const srcContent = fs.readFileSync(relative.toCwd, 'utf8')
            const dstDir = path.dirname(dstpath)
            const dstBasename = path.basename(dstpath)
            const isSymlink = fs.lstatSync(dstpath).isSymbolicLink()
            const dstContent = fs.readFileSync(dstpath, 'utf8')
            const dstDirContents = fs.readdirSync(dstDir)
            assert.strictEqual(isSymlink, true)
            assert.strictEqual(srcContent, dstContent)
            assert(dstDirContents.indexOf(dstBasename) >= 0)
          })
      })
    })
  })

  describe('ensureSymlinkSync()', () => {
    const fn = ensureSymlinkSync
    tests.forEach(test => {
      const args = test[0]
      // const nativeBehavior = test[1]
      const newBehavior = test[2]
      if (newBehavior === 'file-success') fileSuccessSync(args, fn)
      if (newBehavior === 'file-broken') fileBrokenSync(args, fn)
      if (newBehavior === 'file-error') fileErrorSync(args, fn)
      if (newBehavior === 'dir-success') dirSuccessSync(args, fn)
      if (newBehavior === 'dir-broken') dirBrokenSync(args, fn)
      if (newBehavior === 'dir-error') dirErrorSync(args, fn)
    })
  })
})
