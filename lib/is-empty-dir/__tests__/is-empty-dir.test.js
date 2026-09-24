'use strict'

const fs = require('fs')
const os = require('os')
const fse = require('../..')
const path = require('path')
const assert = require('assert')
const proxyquire = require('proxyquire')

const { describe, it, beforeEach, afterEach } = global

describe('+ isEmptyDir()', () => {
  let TEST_DIR

  beforeEach(() => {
    TEST_DIR = path.join(os.tmpdir(), 'test-fs-extra', 'is-empty-dir')
    if (fs.existsSync(TEST_DIR)) {
      fse.removeSync(TEST_DIR)
    }
    fse.ensureDirSync(TEST_DIR)
  })

  afterEach(done => fse.remove(TEST_DIR, done))

  it('should return true for an empty directory', async () => {
    assert.strictEqual(await fse.isEmptyDir(TEST_DIR), true)
  })

  it('should return false for a nonempty directory', async () => {
    fs.writeFileSync(path.join(TEST_DIR, 'file'), '')
    assert.strictEqual(await fse.isEmptyDir(TEST_DIR), false)
  })

  it('should support callbacks', done => {
    fse.isEmptyDir(TEST_DIR, (err, result) => {
      assert.ifError(err)
      assert.strictEqual(result, true)
      done()
    })
  })

  it('should reject missing paths', async () => {
    await assert.rejects(fse.isEmptyDir(path.join(TEST_DIR, 'missing')), err => err.code === 'ENOENT')
  })

  it('should reject file paths', async () => {
    const file = path.join(TEST_DIR, 'file')
    fs.writeFileSync(file, '')
    await assert.rejects(fse.isEmptyDir(file), err => err.code === 'ENOTDIR')
  })

  it('should support symlinks to directories', async () => {
    const target = path.join(TEST_DIR, 'target')
    const symlink = path.join(TEST_DIR, 'symlink')
    fs.mkdirSync(target)
    fs.symlinkSync(target, symlink)
    assert.strictEqual(await fse.isEmptyDir(symlink), true)
  })

  it('should preserve read errors and close the directory', async () => {
    const error = Object.assign(new Error('read failed'), { code: 'EIO' })
    let reads = 0
    let closes = 0
    const { isEmptyDir } = proxyquire('..', {
      '../fs': {
        opendir: async () => ({
          read: callback => {
            reads++
            callback(error)
          },
          close: callback => {
            closes++
            callback()
          }
        })
      }
    })

    await assert.rejects(isEmptyDir(TEST_DIR), err => err === error)
    assert.strictEqual(reads, 1)
    assert.strictEqual(closes, 1)
  })

  it('should close the directory after reading the first entry', async () => {
    let reads = 0
    let closes = 0
    const { isEmptyDir } = proxyquire('..', {
      '../fs': {
        opendir: async () => ({
          read: callback => {
            reads++
            callback(null, { name: 'file' })
          },
          close: callback => {
            closes++
            callback()
          }
        })
      }
    })

    assert.strictEqual(await isEmptyDir(TEST_DIR), false)
    assert.strictEqual(reads, 1)
    assert.strictEqual(closes, 1)
  })
})

describe('+ isEmptyDirSync()', () => {
  let TEST_DIR

  beforeEach(() => {
    TEST_DIR = path.join(os.tmpdir(), 'test-fs-extra', 'is-empty-dir-sync')
    if (fs.existsSync(TEST_DIR)) {
      fse.removeSync(TEST_DIR)
    }
    fse.ensureDirSync(TEST_DIR)
  })

  afterEach(done => fse.remove(TEST_DIR, done))

  it('should return true for an empty directory', () => {
    assert.strictEqual(fse.isEmptyDirSync(TEST_DIR), true)
  })

  it('should return false for a nonempty directory', () => {
    fs.writeFileSync(path.join(TEST_DIR, 'file'), '')
    assert.strictEqual(fse.isEmptyDirSync(TEST_DIR), false)
  })

  it('should throw for missing paths', () => {
    assert.throws(() => fse.isEmptyDirSync(path.join(TEST_DIR, 'missing')), err => err.code === 'ENOENT')
  })

  it('should throw for file paths', () => {
    const file = path.join(TEST_DIR, 'file')
    fs.writeFileSync(file, '')
    assert.throws(() => fse.isEmptyDirSync(file), err => err.code === 'ENOTDIR')
  })

  it('should support symlinks to directories', () => {
    const target = path.join(TEST_DIR, 'target')
    const symlink = path.join(TEST_DIR, 'symlink')
    fs.mkdirSync(target)
    fs.symlinkSync(target, symlink)
    assert.strictEqual(fse.isEmptyDirSync(symlink), true)
  })

  it('should preserve read errors and close the directory', () => {
    const error = Object.assign(new Error('read failed'), { code: 'EIO' })
    let reads = 0
    let closes = 0
    const { isEmptyDirSync } = proxyquire('..', {
      '../fs': {
        opendirSync: () => ({
          readSync: () => {
            reads++
            throw error
          },
          closeSync: () => {
            closes++
          }
        })
      }
    })

    assert.throws(() => isEmptyDirSync(TEST_DIR), err => err === error)
    assert.strictEqual(reads, 1)
    assert.strictEqual(closes, 1)
  })

  it('should close the directory after reading the first entry', () => {
    let reads = 0
    let closes = 0
    const { isEmptyDirSync } = proxyquire('..', {
      '../fs': {
        opendirSync: () => ({
          readSync: () => {
            reads++
            return { name: 'file' }
          },
          closeSync: () => {
            closes++
          }
        })
      }
    })

    assert.strictEqual(isEmptyDirSync(TEST_DIR), false)
    assert.strictEqual(reads, 1)
    assert.strictEqual(closes, 1)
  })
})
