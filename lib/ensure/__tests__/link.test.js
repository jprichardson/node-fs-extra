'use strict'

const CWD = process.cwd()

const fs = require('graceful-fs')
const os = require('os')
const fse = require(CWD)
const path = require('path')
const assert = require('assert')
const ensureLink = fse.ensureLink
const ensureLinkSync = fse.ensureLinkSync

/* global afterEach, beforeEach, describe, it, after, before */

describe('fse-ensure-link', () => {
  const TEST_DIR = path.join(os.tmpdir(), 'fs-extra', 'ensure-symlink')

  const tests = [
    // [[srcpath, dstpath], fs.link expect, ensureLink expect]
    [['./foo.txt', './link.txt'], 'file-success', 'file-success'],
    [['./foo.txt', './dir-foo/link.txt'], 'file-success', 'file-success'],
    [['./foo.txt', './empty-dir/link.txt'], 'file-success', 'file-success'],
    [['./foo.txt', './real-alpha/link.txt'], 'file-success', 'file-success'],
    [['./foo.txt', './real-alpha/real-beta/link.txt'], 'file-success', 'file-success'],
    [['./foo.txt', './real-alpha/real-beta/real-gamma/link.txt'], 'file-success', 'file-success'],
    [['./foo.txt', './alpha/link.txt'], 'file-error', 'file-success'],
    [['./foo.txt', './alpha/beta/link.txt'], 'file-error', 'file-success'],
    [['./foo.txt', './alpha/beta/gamma/link.txt'], 'file-error', 'file-success'],
    [['./missing.txt', './link.txt'], 'file-error', 'file-error'],
    [['./missing.txt', './missing-dir/link.txt'], 'file-error', 'file-error'],
    [['./foo.txt', './link.txt'], 'file-success', 'file-success'],
    [['./dir-foo/foo.txt', './link.txt'], 'file-success', 'file-success'],
    [['./missing.txt', './link.txt'], 'file-error', 'file-error'],
    [['../foo.txt', './link.txt'], 'file-error', 'file-error'],
    [['../dir-foo/foo.txt', './link.txt'], 'file-error', 'file-error'],
    // error is thrown if destination path exists
    [['./foo.txt', './dir-foo/foo.txt'], 'file-error', 'file-dest-exists'],
    [[path.resolve(path.join(TEST_DIR, './foo.txt')), './link.txt'], 'file-success', 'file-success'],
    [[path.resolve(path.join(TEST_DIR, './dir-foo/foo.txt')), './link.txt'], 'file-success', 'file-success'],
    [[path.resolve(path.join(TEST_DIR, './missing.txt')), './link.txt'], 'file-error', 'file-error'],
    [[path.resolve(path.join(TEST_DIR, '../foo.txt')), './link.txt'], 'file-error', 'file-error'],
    [[path.resolve(path.join(TEST_DIR, '../dir-foo/foo.txt')), './link.txt'], 'file-error', 'file-error']
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
  })

  afterEach(done => fse.emptyDir(TEST_DIR, done))

  after(() => {
    process.chdir(CWD)
    fse.removeSync(TEST_DIR)
  })

  function fileSuccess (args, fn) {
    const srcpath = args[0]
    const dstpath = args[1]

    it(`should create link file using src ${srcpath} and dst ${dstpath}`, done => {
      const callback = err => {
        if (err) return done(err)

        const srcContent = fs.readFileSync(srcpath, 'utf8')
        const dstDir = path.dirname(dstpath)
        const dstBasename = path.basename(dstpath)
        const isSymlink = fs.lstatSync(dstpath).isFile()
        const dstContent = fs.readFileSync(dstpath, 'utf8')
        const dstDirContents = fs.readdirSync(dstDir)

        assert.equal(isSymlink, true)
        assert.equal(srcContent, dstContent)
        assert(dstDirContents.indexOf(dstBasename) >= 0)
        return done()
      }
      args.push(callback)
      return fn(...args)
    })
  }

  function fileError (args, fn) {
    const srcpath = args[0]
    const dstpath = args[1]

    it(`should return error when creating link file using src ${srcpath} and dst ${dstpath}`, done => {
      const dstdirExistsBefore = fs.existsSync(path.dirname(dstpath))
      const callback = err => {
        assert.equal(err instanceof Error, true)
        // ensure that directories aren't created if there's an error
        const dstdirExistsAfter = fs.existsSync(path.dirname(dstpath))
        assert.equal(dstdirExistsBefore, dstdirExistsAfter)
        return done()
      }
      args.push(callback)
      return fn(...args)
    })
  }

  function fileDestExists (args, fn) {
    const srcpath = args[0]
    const dstpath = args[1]

    it(`should do nothing using src ${srcpath} and dst ${dstpath}`, done => {
      const destinationContentBefore = fs.readFileSync(dstpath, 'utf8')
      const callback = err => {
        if (err) return done(err)
        const destinationContentAfter = fs.readFileSync(dstpath, 'utf8')
        assert.equal(destinationContentBefore, destinationContentAfter)
        return done()
      }
      args.push(callback)
      return fn(...args)
    })
  }

  function fileSuccessSync (args, fn) {
    const srcpath = args[0]
    const dstpath = args[1]

    it(`should create link file using src ${srcpath} and dst ${dstpath}`, () => {
      fn(...args)
      const srcContent = fs.readFileSync(srcpath, 'utf8')
      const dstDir = path.dirname(dstpath)
      const dstBasename = path.basename(dstpath)
      const isSymlink = fs.lstatSync(dstpath).isFile()
      const dstContent = fs.readFileSync(dstpath, 'utf8')
      const dstDirContents = fs.readdirSync(dstDir)
      assert.equal(isSymlink, true)
      assert.equal(srcContent, dstContent)
      assert(dstDirContents.indexOf(dstBasename) >= 0)
    })
  }

  function fileErrorSync (args, fn) {
    const srcpath = args[0]
    const dstpath = args[1]

    it(`should throw error using src ${srcpath} and dst ${dstpath}`, () => {
      // will fail if dstdir is created and there's an error
      const dstdirExistsBefore = fs.existsSync(path.dirname(dstpath))
      let err = null
      try {
        fn(...args)
      } catch (e) {
        err = e
      }
      assert.equal(err instanceof Error, true)
      const dstdirExistsAfter = fs.existsSync(path.dirname(dstpath))
      assert.equal(dstdirExistsBefore, dstdirExistsAfter)
    })
  }

  function fileDestExistsSync (args, fn) {
    const srcpath = args[0]
    const dstpath = args[1]

    it(`should do nothing using src ${srcpath} and dst ${dstpath}`, () => {
      const destinationContentBefore = fs.readFileSync(dstpath, 'utf8')
      fn(...args)
      const destinationContentAfter = fs.readFileSync(dstpath, 'utf8')
      assert.equal(destinationContentBefore, destinationContentAfter)
    })
  }

  describe('fs.link()', () => {
    const fn = fs.link
    tests.forEach(test => {
      const args = test[0].slice(0)
      const nativeBehavior = test[1]
      // const newBehavior = test[2]
      if (nativeBehavior === 'file-success') fileSuccess(args, fn)
      if (nativeBehavior === 'file-error') fileError(args, fn)
      if (nativeBehavior === 'file-dest-exists') fileDestExists(args, fn)
    })
  })

  describe('ensureLink()', () => {
    const fn = ensureLink
    tests.forEach(test => {
      const args = test[0].slice(0)
      // const nativeBehavior = test[1]
      const newBehavior = test[2]
      if (newBehavior === 'file-success') fileSuccess(args, fn)
      if (newBehavior === 'file-error') fileError(args, fn)
      if (newBehavior === 'file-dest-exists') fileDestExists(args, fn)
    })
  })

  describe('ensureLink() promise support', () => {
    tests.filter(test => test[2] === 'file-success').forEach(test => {
      const args = test[0].slice(0)
      const srcpath = args[0]
      const dstpath = args[1]

      it(`should create link file using src ${srcpath} and dst ${dstpath}`, () => {
        return ensureLink(srcpath, dstpath)
          .then(() => {
            const srcContent = fs.readFileSync(srcpath, 'utf8')
            const dstDir = path.dirname(dstpath)
            const dstBasename = path.basename(dstpath)
            const isSymlink = fs.lstatSync(dstpath).isFile()
            const dstContent = fs.readFileSync(dstpath, 'utf8')
            const dstDirContents = fs.readdirSync(dstDir)

            assert.equal(isSymlink, true)
            assert.equal(srcContent, dstContent)
            assert(dstDirContents.indexOf(dstBasename) >= 0)
          })
      })
    })
  })

  describe('fs.linkSync()', () => {
    const fn = fs.linkSync
    tests.forEach(test => {
      const args = test[0].slice(0)
      const nativeBehavior = test[1]
      // const newBehavior = test[2]
      if (nativeBehavior === 'file-success') fileSuccessSync(args, fn)
      if (nativeBehavior === 'file-error') fileErrorSync(args, fn)
      if (nativeBehavior === 'file-dest-exists') fileDestExists(args, fn)
    })
  })

  describe('ensureLinkSync()', () => {
    const fn = ensureLinkSync
    tests.forEach(test => {
      const args = test[0].slice(0)
      // const nativeBehavior = test[1]
      const newBehavior = test[2]
      if (newBehavior === 'file-success') fileSuccessSync(args, fn)
      if (newBehavior === 'file-error') fileErrorSync(args, fn)
      if (newBehavior === 'file-dest-exists') fileDestExistsSync(args, fn)
    })
  })
})
