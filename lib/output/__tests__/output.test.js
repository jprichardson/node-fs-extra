'use strict'

const fs = require('fs')
const os = require('os')
const fse = require(process.cwd())
const path = require('path')
const assert = require('assert')

/* global afterEach, beforeEach, describe, it */

describe('output', () => {
  let TEST_DIR

  beforeEach(done => {
    TEST_DIR = path.join(os.tmpdir(), 'fs-extra', 'output')
    fse.emptyDir(TEST_DIR, done)
  })

  afterEach(done => fse.remove(TEST_DIR, done))

  describe('+ outputFile', () => {
    describe('> when the file and directory does not exist', () => {
      it('should create the file', done => {
        const file = path.join(TEST_DIR, Math.random() + 't-ne', Math.random() + '.txt')
        assert(!fs.existsSync(file))
        fse.outputFile(file, 'hi jp', err => {
          assert.ifError(err)
          assert(fs.existsSync(file))
          assert.strictEqual(fs.readFileSync(file, 'utf8'), 'hi jp')
          done()
        })
      })
      it('should support promises', () => {
        const file = path.join(TEST_DIR, Math.random() + 't-ne', Math.random() + '.txt')
        assert(!fs.existsSync(file))
        return fse.outputFile(file, 'hi jp')
      })
    })

    describe('> when the file does exist', () => {
      it('should still modify the file', done => {
        const file = path.join(TEST_DIR, Math.random() + 't-e', Math.random() + '.txt')
        fse.mkdirsSync(path.dirname(file))
        fs.writeFileSync(file, 'hello world')
        fse.outputFile(file, 'hello jp', err => {
          if (err) return done(err)
          assert.strictEqual(fs.readFileSync(file, 'utf8'), 'hello jp')
          done()
        })
      })
    })
  })

  describe('+ outputFileSync', () => {
    describe('> when the file and directory does not exist', () => {
      it('should create the file', () => {
        const file = path.join(TEST_DIR, Math.random() + 'ts-ne', Math.random() + '.txt')
        assert(!fs.existsSync(file))
        fse.outputFileSync(file, 'hello man')
        assert(fs.existsSync(file))
        assert.strictEqual(fs.readFileSync(file, 'utf8'), 'hello man')
      })
    })

    describe('> when the file does exist', () => {
      it('should still modify the file', () => {
        const file = path.join(TEST_DIR, Math.random() + 'ts-e', Math.random() + '.txt')
        fse.mkdirsSync(path.dirname(file))
        fs.writeFileSync(file, 'hello world')
        fse.outputFileSync(file, 'hello man')
        assert.strictEqual(fs.readFileSync(file, 'utf8'), 'hello man')
      })
    })
  })
})
