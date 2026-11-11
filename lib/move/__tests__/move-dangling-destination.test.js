'use strict'

const fs = require('../../..')
const path = require('path')
const os = require('os')
const assert = require('assert')

/* global describe, it, beforeEach, afterEach */

describe('move() - dangling destination symlink', () => {
  let dir, source, dest

  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'fs-extra-move-link-'))
    source = path.join(dir, 'source')
    dest = path.join(dir, 'dest')
    fs.writeFileSync(path.join(dir, 'target'), 'original source data')
    fs.symlinkSync('target', source)
    fs.symlinkSync('missing-target', dest)
  })

  afterEach(() => fs.removeSync(dir))

  it('should not overwrite the destination by default', async () => {
    await assert.rejects(fs.move(source, dest), /dest already exists/)
    assert.strictEqual(fs.readlinkSync(dest), 'missing-target')
    assert.strictEqual(fs.readlinkSync(source), 'target')
    assert.strictEqual(fs.readFileSync(source, 'utf8'), 'original source data')
  })

  it('should not overwrite if overwrite = false', async () => {
    await assert.rejects(fs.move(source, dest, { overwrite: false }), /dest already exists/)
    assert.strictEqual(fs.readlinkSync(dest), 'missing-target')
    assert.strictEqual(fs.readlinkSync(source), 'target')
    assert.strictEqual(fs.readFileSync(source, 'utf8'), 'original source data')
  })

  it('should overwrite if overwrite = true', async () => {
    await fs.move(source, dest, { overwrite: true })
    assert(!fs.existsSync(source))
    assert.strictEqual(fs.readlinkSync(dest), 'target')
    assert.strictEqual(fs.readFileSync(dest, 'utf8'), 'original source data')
  })
})
