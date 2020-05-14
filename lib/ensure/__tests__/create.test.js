'use strict'

const fs = require('fs')
const os = require('os')
const fse = require(process.cwd())
const path = require('path')
const assert = require('assert')

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
