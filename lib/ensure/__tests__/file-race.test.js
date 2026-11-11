'use strict'
/* eslint-env mocha */
const assert = require('assert')
const os = require('os')
const path = require('path')
const fs = require('fs')
const proxyquire = require('proxyquire')
const fse = require('../..')
const promiseFs = require('../../fs')

describe('ensureFile concurrent creation', () => {
  let dir

  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'fs-extra-ensure-race-'))
  })

  afterEach(() => fse.remove(dir))

  for (const api of ['promise', 'callback', 'sync']) {
    for (const missingParent of [false, true]) {
      it(`preserves a file created after stat with ${api} (missing parent: ${missingParent})`, async () => {
        const file = path.join(dir, missingParent ? 'nested/file' : 'file')
        const content = 'written by another creator'
        const missing = Object.assign(new Error('not found at stat time'), { code: 'ENOENT' })
        const statSync = target => {
          if (target === file || (missingParent && target === path.dirname(file))) {
            if (!missingParent || target === path.dirname(file)) {
              fs.mkdirSync(path.dirname(file), { recursive: true })
              fs.writeFileSync(file, content)
            }
            throw missing
          }
          return fs.statSync(target)
        }
        const { createFile, createFileSync } = proxyquire('../file', {
          '../fs': { stat: async target => statSync(target), statSync }
        })

        if (api === 'sync') createFileSync(file)
        else if (api === 'promise') await createFile(file)
        else {
          await new Promise((resolve, reject) => {
            createFile(file, err => err ? reject(err) : resolve())
          })
        }

        assert.strictEqual(fs.readFileSync(file, 'utf8'), content)
      })
    }
  }

  for (const synchronous of [false, true]) {
    it(`rejects a directory created after stat (sync: ${synchronous})`, async () => {
      const file = path.join(dir, 'directory')
      const statSync = target => {
        if (target === file) {
          fs.mkdirSync(file)
          throw Object.assign(new Error('not found at stat time'), { code: 'ENOENT' })
        }
        return fs.statSync(target)
      }
      const { createFile, createFileSync } = proxyquire('../file', {
        '../fs': { stat: async target => statSync(target), statSync }
      })
      if (synchronous) assert.throws(() => createFileSync(file), { code: 'EISDIR' })
      else await assert.rejects(createFile(file), { code: 'EISDIR' })
    })

    it(`closes the handle if fstat fails (sync: ${synchronous})`, async () => {
      const file = path.join(dir, 'file')
      const error = new Error('cannot stat handle')
      let fd
      const { createFile, createFileSync } = proxyquire('../file', {
        '../fs': {
          open: async (...args) => { fd = await promiseFs.open(...args); return fd },
          openSync: (...args) => { fd = fs.openSync(...args); return fd },
          fstat: async () => { throw error },
          fstatSync: () => { throw error }
        }
      })
      if (synchronous) assert.throws(() => createFileSync(file), err => err === error)
      else await assert.rejects(createFile(file), err => err === error)
      assert.throws(() => fs.fstatSync(fd), { code: 'EBADF' })
    })
  }
})
