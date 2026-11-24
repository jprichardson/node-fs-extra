'use strict'

const fs = require('fs')
const os = require('os')
const fse = require('../..')
const path = require('path')
const assert = require('assert')
const proxyquire = require('proxyquire')

// Simulate another writer after the original stat has observed ENOENT.
function statWithRace (racedPath, createEntry) {
  return target => {
    try {
      return fs.statSync(target)
    } catch (err) {
      if (target === racedPath && err.code === 'ENOENT') createEntry()
      throw err
    }
  }
}

/* global afterEach, beforeEach, describe, it */

describe('fs-extra', () => {
  let TEST_DIR

  beforeEach(done => {
    TEST_DIR = path.join(os.tmpdir(), 'fs-extra', 'create')
    fse.emptyDir(TEST_DIR, done)
  })

  afterEach(done => fse.remove(TEST_DIR, done))

  describe('+ createFile', () => {
    describe('> when the file and directory does not exist', () => {
      it('should create the file', done => {
        const file = path.join(TEST_DIR, Math.random() + 't-ne', Math.random() + '.txt')
        assert(!fs.existsSync(file))
        fse.createFile(file, err => {
          assert.ifError(err)
          assert(fs.existsSync(file))
          done()
        })
      })
    })

    describe('> when the file needs to be opened for creation', () => {
      it('should preserve the new file contents', async () => {
        const file = path.join(TEST_DIR, 'file.txt')
        const stat = statWithRace(file, () => fs.writeFileSync(file, 'created concurrently'))
        const { createFile } = proxyquire('../file', { '../fs': { stat: async target => stat(target) } })

        await createFile(file)

        assert.strictEqual(fs.readFileSync(file, 'utf8'), 'created concurrently')
      })

      it('should preserve the new file contents when its parent was missing', async () => {
        const parent = path.join(TEST_DIR, 'new-parent')
        const file = path.join(parent, 'file.txt')
        const stat = statWithRace(parent, () => {
          fs.mkdirSync(parent)
          fs.writeFileSync(file, 'created concurrently')
        })
        const { createFile } = proxyquire('../file', { '../fs': { stat: async target => stat(target) } })

        await createFile(file)

        assert.strictEqual(fs.readFileSync(file, 'utf8'), 'created concurrently')
      })

      it('should reject a directory at the file path', async () => {
        const file = path.join(TEST_DIR, 'file.txt')
        const stat = statWithRace(file, () => fs.mkdirSync(file))
        const { createFile } = proxyquire('../file', { '../fs': { stat: async target => stat(target) } })

        await assert.rejects(createFile(file), { code: 'EISDIR' })
      })

      it('should close the descriptor if checking the opened file fails', async () => {
        const file = path.join(TEST_DIR, 'file.txt')
        const error = new Error('cannot stat descriptor')
        let fd
        const { createFile } = proxyquire('../file', {
          '../fs': {
            open: async (...args) => {
              fd = fs.openSync(...args)
              return fd
            },
            fstat: async () => { throw error }
          }
        })

        await assert.rejects(createFile(file), err => err === error)
        assert.throws(() => fs.fstatSync(fd), { code: 'EBADF' })
      })
    })

    describe('> when the file does exist', () => {
      it('should not modify the file', done => {
        const file = path.join(TEST_DIR, Math.random() + 't-e', Math.random() + '.txt')
        fse.mkdirsSync(path.dirname(file))
        fs.writeFileSync(file, 'hello world')
        fse.createFile(file, err => {
          assert.ifError(err)
          assert.strictEqual(fs.readFileSync(file, 'utf8'), 'hello world')
          done()
        })
      })

      it('should give clear error if node in directory tree is a file', done => {
        const existingFile = path.join(TEST_DIR, Math.random() + 'ts-e', Math.random() + '.txt')
        fse.mkdirsSync(path.dirname(existingFile))
        fs.writeFileSync(existingFile, '')

        const file = path.join(existingFile, Math.random() + '.txt')
        fse.createFile(file, err => {
          assert.strictEqual(err.code, 'ENOTDIR')
          done()
        })
      })
    })
  })

  describe('+ createFileSync', () => {
    describe('> when the file and directory does not exist', () => {
      it('should create the file', () => {
        const file = path.join(TEST_DIR, Math.random() + 'ts-ne', Math.random() + '.txt')
        assert(!fs.existsSync(file))
        fse.createFileSync(file)
        assert(fs.existsSync(file))
      })
    })

    describe('> when the file needs to be opened for creation', () => {
      it('should preserve the new file contents', () => {
        const file = path.join(TEST_DIR, 'file.txt')
        const stat = statWithRace(file, () => fs.writeFileSync(file, 'created concurrently'))
        const { createFileSync } = proxyquire('../file', { '../fs': { statSync: stat } })

        createFileSync(file)

        assert.strictEqual(fs.readFileSync(file, 'utf8'), 'created concurrently')
      })

      it('should preserve the new file contents when its parent was missing', () => {
        const parent = path.join(TEST_DIR, 'new-parent')
        const file = path.join(parent, 'file.txt')
        const stat = statWithRace(parent, () => {
          fs.mkdirSync(parent)
          fs.writeFileSync(file, 'created concurrently')
        })
        const { createFileSync } = proxyquire('../file', { '../fs': { statSync: stat } })

        createFileSync(file)

        assert.strictEqual(fs.readFileSync(file, 'utf8'), 'created concurrently')
      })

      it('should reject a directory at the file path', () => {
        const file = path.join(TEST_DIR, 'file.txt')
        const stat = statWithRace(file, () => fs.mkdirSync(file))
        const { createFileSync } = proxyquire('../file', { '../fs': { statSync: stat } })

        assert.throws(() => createFileSync(file), { code: 'EISDIR' })
      })

      it('should close the descriptor if checking the opened file fails', () => {
        const file = path.join(TEST_DIR, 'file.txt')
        const error = new Error('cannot stat descriptor')
        let fd
        const { createFileSync } = proxyquire('../file', {
          '../fs': {
            openSync: (...args) => {
              fd = fs.openSync(...args)
              return fd
            },
            fstatSync: () => { throw error }
          }
        })

        assert.throws(() => createFileSync(file), err => err === error)
        assert.throws(() => fs.fstatSync(fd), { code: 'EBADF' })
      })
    })

    describe('> when the file does exist', () => {
      it('should not modify the file', () => {
        const file = path.join(TEST_DIR, Math.random() + 'ts-e', Math.random() + '.txt')
        fse.mkdirsSync(path.dirname(file))
        fs.writeFileSync(file, 'hello world')
        fse.createFileSync(file)
        assert.strictEqual(fs.readFileSync(file, 'utf8'), 'hello world')
      })

      it('should give clear error if node in directory tree is a file', () => {
        const existingFile = path.join(TEST_DIR, Math.random() + 'ts-e', Math.random() + '.txt')
        fse.mkdirsSync(path.dirname(existingFile))
        fs.writeFileSync(existingFile, '')

        const file = path.join(existingFile, Math.random() + '.txt')
        try {
          fse.createFileSync(file)
          assert.fail()
        } catch (err) {
          assert.strictEqual(err.code, 'ENOTDIR')
        }
      })
    })
  })
})
