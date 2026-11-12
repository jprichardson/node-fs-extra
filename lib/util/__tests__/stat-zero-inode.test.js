'use strict'

const assert = require('assert')
const os = require('os')
const path = require('path')
const fs = require('../..')
const nativeFs = require('../../fs')
const proxyquire = require('proxyquire')
const stat = require('../stat')

/* global describe, it, beforeEach, afterEach */

describe('file identity without inode numbers', () => {
  const metadata = {
    ino: 0n,
    dev: 1n,
    size: 12n,
    mode: 0o100644n,
    nlink: 1n,
    mtimeNs: 1000001n,
    ctimeNs: 2000001n,
    birthtimeNs: 3000001n
  }

  it('should still recognize matching metadata', () => {
    assert.strictEqual(stat.areIdentical(metadata, { ...metadata }), true)
  })

  for (const field of ['size', 'mode', 'nlink', 'mtimeNs', 'ctimeNs', 'birthtimeNs']) {
    it(`should distinguish files with different ${field}`, () => {
      const other = { ...metadata, [field]: metadata[field] + 1n }
      assert.strictEqual(stat.areIdentical(metadata, other), false)
      assert.strictEqual(stat.areIdentical(other, metadata), false)
    })
  }

  it('should ignore access times, which can change when the file is read', () => {
    assert.strictEqual(stat.areIdentical(
      { ...metadata, atimeNs: 1n },
      { ...metadata, atimeNs: 2n }
    ), true)
  })

  it('should continue to trust nonzero inode numbers even if metadata changes', () => {
    assert.strictEqual(stat.areIdentical(
      { ...metadata, ino: 1n, dev: 0n },
      { ...metadata, ino: 1n, dev: 0n, size: 100n, ctimeNs: 9n }
    ), true)
  })

  // Keep real filesystem behavior, but simulate a filesystem such as Citrix
  // Client Drive Mapping that reports 0n for every inode number.
  const zeroInode = stats => {
    stats.ino = 0n
    return stats
  }
  const fsStub = {
    stat: async (...args) => zeroInode(await nativeFs.stat(...args)),
    lstat: async (...args) => zeroInode(await nativeFs.lstat(...args)),
    statSync: (...args) => zeroInode(nativeFs.statSync(...args)),
    lstatSync: (...args) => zeroInode(nativeFs.lstatSync(...args))
  }
  const zeroStat = proxyquire('../stat', { '../fs': fsStub })

  for (const method of ['copy', 'copySync', 'move', 'moveSync']) {
    const operation = method.startsWith('copy') ? 'copy' : 'move'
    const filename = method.endsWith('Sync') ? `${operation}-sync` : operation
    const run = proxyquire(`../../${operation}/${filename}`, { '../util/stat': zeroStat })
    let dir, src, dest

    describe(`${method}()`, () => {
      beforeEach(() => {
        dir = fs.mkdtempSync(path.join(os.tmpdir(), 'fs-extra-zero-inode-'))
        src = path.join(dir, 'source')
        dest = path.join(dir, 'dest')
        fs.writeFileSync(src, 'source data')
      })

      afterEach(() => fs.removeSync(dir))

      it('should overwrite a different file even when its size matches', async () => {
        fs.writeFileSync(dest, 'target data')
        fs.utimesSync(src, 1000, 1000)
        fs.utimesSync(dest, 2000, 2000)

        await run(src, dest, { overwrite: true })

        assert.strictEqual(fs.readFileSync(dest, 'utf8'), 'source data')
        assert.strictEqual(fs.existsSync(src), operation === 'copy')
      })

      it('should allow an unrelated destination parent', async () => {
        const parent = path.join(dir, 'unrelated')
        fs.mkdirSync(parent)
        dest = path.join(parent, 'new-file')

        await run(src, dest)

        assert.strictEqual(fs.readFileSync(dest, 'utf8'), 'source data')
      })

      it('should reject overwriting the source itself without deleting it', async () => {
        await assert.rejects(async () => run(src, src, { overwrite: true }), /Source and destination must not be the same/)
        assert.strictEqual(fs.readFileSync(src, 'utf8'), 'source data')
      })

      it('should reject overwriting a hard link to the source', async () => {
        fs.linkSync(src, dest)

        await assert.rejects(async () => run(src, dest, { overwrite: true }), /Source and destination must not be the same/)

        assert.strictEqual(fs.readFileSync(src, 'utf8'), 'source data')
        assert.strictEqual(fs.readFileSync(dest, 'utf8'), 'source data')
      })

      it('should reject a destination reached through a directory link into the source', async () => {
        fs.removeSync(src)
        fs.mkdirSync(src)
        fs.writeFileSync(path.join(src, 'file'), 'source data')
        const link = path.join(dir, 'alias')
        fs.symlinkSync(src, link, process.platform === 'win32' ? 'junction' : 'dir')
        dest = path.join(link, 'missing', 'child')

        await assert.rejects(async () => run(src, dest), /subdirectory of itself/)

        assert.strictEqual(fs.existsSync(path.join(src, 'missing')), false)
        assert.strictEqual(fs.readFileSync(path.join(src, 'file'), 'utf8'), 'source data')
      })
    })
  }

  for (const sync of [false, true]) {
    const suffix = sync ? 'Sync' : ''
    const link = proxyquire('../../ensure/link', { '../fs': fsStub })[`createLink${suffix}`]
    const symlink = proxyquire('../../ensure/symlink', { '../fs': fsStub })[`createSymlink${suffix}`]
    let dir, src, dest

    describe(`ensure links (${sync ? 'sync' : 'async'})`, () => {
      beforeEach(() => {
        dir = fs.mkdtempSync(path.join(os.tmpdir(), 'fs-extra-zero-inode-'))
        src = path.join(dir, 'source')
        dest = path.join(dir, 'dest')
      })

      afterEach(() => fs.removeSync(dir))

      it('should accept an existing hard link', async () => {
        fs.writeFileSync(src, 'source data')
        fs.linkSync(src, dest)
        await link(src, dest)
      })

      it('should not treat a different file as an existing hard link', async () => {
        fs.writeFileSync(src, 'source data')
        fs.writeFileSync(dest, 'other')

        await assert.rejects(async () => link(src, dest), { code: 'EEXIST' })

        assert.strictEqual(fs.readFileSync(dest, 'utf8'), 'other')
      })

      it('should accept an existing directory link to the source', async () => {
        fs.mkdirSync(src)
        const type = process.platform === 'win32' ? 'junction' : 'dir'
        fs.symlinkSync(src, dest, type)
        await symlink(src, dest, type)
      })

      it('should not accept a directory link to a different target', async () => {
        fs.mkdirSync(src)
        const other = path.join(dir, 'other')
        fs.mkdirSync(other)
        fs.utimesSync(src, 1000, 1000)
        fs.utimesSync(other, 2000, 2000)
        const type = process.platform === 'win32' ? 'junction' : 'dir'
        fs.symlinkSync(other, dest, type)

        await assert.rejects(async () => symlink(src, dest, type), { code: 'EEXIST' })

        assert.strictEqual(fs.realpathSync(dest), fs.realpathSync(other))
      })
    })
  }
})
