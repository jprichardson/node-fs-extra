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
    TEST_DIR = path.join(os.tmpdir(), 'fs-extra', 'ensure')
    fse.emptyDir(TEST_DIR, done)
  })

  afterEach(done => fse.remove(TEST_DIR, done))

  describe('+ ensureFile()', () => {
    describe('> when file exists', () => {
      it('should not do anything', done => {
        const file = path.join(TEST_DIR, 'file.txt')
        fs.writeFileSync(file, 'blah')

        assert(fs.existsSync(file))
        fse.ensureFile(file, err => {
          assert.ifError(err)
          assert(fs.existsSync(file))
          done()
        })
      })
    })

    describe('> when file does not exist', () => {
      it('should create the file', done => {
        const file = path.join(TEST_DIR, 'dir/that/does/not/exist', 'file.txt')

        assert(!fs.existsSync(file))
        fse.ensureFile(file, err => {
          assert.ifError(err)
          assert(fs.existsSync(file))
          done()
        })
      })
    })

    describe('> when there is a directory at that path', () => {
      it('should error', done => {
        const p = path.join(TEST_DIR, 'somedir')
        fs.mkdirSync(p)

        fse.ensureFile(p, err => {
          assert(err)
          assert.equal(err.code, 'EISDIR')
          done()
        })
      })
    })
  })

  describe('+ ensureFileSync()', () => {
    describe('> when file exists', () => {
      it('should not do anything', () => {
        const file = path.join(TEST_DIR, 'file.txt')
        fs.writeFileSync(file, 'blah')

        assert(fs.existsSync(file))
        fse.ensureFileSync(file)
        assert(fs.existsSync(file))
      })
    })

    describe('> when file does not exist', () => {
      it('should create the file', () => {
        const file = path.join(TEST_DIR, 'dir/that/does/not/exist', 'file.txt')

        assert(!fs.existsSync(file))
        fse.ensureFileSync(file)
        assert(fs.existsSync(file))
      })
    })

    describe('> when there is a directory at that path', () => {
      it('should error', () => {
        const p = path.join(TEST_DIR, 'somedir2')
        fs.mkdirSync(p)

        assert.throws(() => {
          try {
            fse.ensureFileSync(p)
          } catch (e) {
            assert.equal(e.code, 'EISDIR')
            throw e
          }
        })
      })
    })
  })

  describe('+ ensureDir()', () => {
    describe('> when dir exists', () => {
      it('should not do anything', done => {
        const dir = path.join(TEST_DIR, 'dir/does/not/exist')
        fse.mkdirpSync(dir)

        assert(fs.existsSync(dir))
        fse.ensureDir(dir, err => {
          assert.ifError(err)
          assert(fs.existsSync(dir))
          done()
        })
      })
    })

    describe('> when dir does not exist', () => {
      it('should create the dir', done => {
        const dir = path.join(TEST_DIR, 'dir/that/does/not/exist')

        assert(!fs.existsSync(dir))
        fse.ensureDir(dir, err => {
          assert.ifError(err)
          assert(fs.existsSync(dir))
          done()
        })
      })
    })
  })

  describe('+ ensureDirSync()', () => {
    describe('> when dir exists', () => {
      it('should not do anything', () => {
        const dir = path.join(TEST_DIR, 'dir/does/not/exist')
        fse.mkdirpSync(dir)

        assert(fs.existsSync(dir))
        fse.ensureDirSync(dir)
        assert(fs.existsSync(dir))
      })
    })

    describe('> when dir does not exist', () => {
      it('should create the dir', () => {
        const dir = path.join(TEST_DIR, 'dir/that/does/not/exist')

        assert(!fs.existsSync(dir))
        fse.ensureDirSync(dir)
        assert(fs.existsSync(dir))
      })
    })
  })
})
