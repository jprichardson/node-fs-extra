'use strict'
/* eslint-env mocha */
const assert = require('assert')
const path = require('path')
const crypto = require('crypto')
const os = require('os')
const semver = require('semver')
const fs = require('../..')

const SIZE = 1000

// Used for tests on Node 7.2.0+ only
const onNode7it = semver.gte(process.version, '7.2.0') ? it : it.skip

describe('fs.read()', () => {
  let TEST_FILE
  let TEST_DATA
  let TEST_FD

  beforeEach(() => {
    TEST_FILE = path.join(os.tmpdir(), 'fs-extra', 'read-test-file')
    TEST_DATA = crypto.randomBytes(SIZE)
    fs.writeFileSync(TEST_FILE, TEST_DATA)
    TEST_FD = fs.openSync(TEST_FILE, 'r')
  })

  afterEach(() => {
    return fs.close(TEST_FD)
      .then(() => fs.remove(TEST_FILE))
  })

  describe('with promises', () => {
    it('returns an object', () => {
      return fs.read(TEST_FD, Buffer.alloc(SIZE), 0, SIZE, 0)
        .then(results => {
          const bytesRead = results.bytesRead
          const buffer = results.buffer
          assert.equal(bytesRead, SIZE, 'bytesRead is correct')
          assert(buffer.equals(TEST_DATA), 'data is correct')
        })
    })

    it('returns an object when position is not set', () => {
      return fs.read(TEST_FD, Buffer.alloc(SIZE), 0, SIZE)
        .then(results => {
          const bytesRead = results.bytesRead
          const buffer = results.buffer
          assert.equal(bytesRead, SIZE, 'bytesRead is correct')
          assert(buffer.equals(TEST_DATA), 'data is correct')
        })
    })
  })

  describe('with callbacks', () => {
    it('works', done => {
      fs.read(TEST_FD, Buffer.alloc(SIZE), 0, SIZE, 0, (err, bytesRead, buffer) => {
        assert.ifError(err)
        assert.equal(bytesRead, SIZE, 'bytesRead is correct')
        assert(buffer.equals(TEST_DATA), 'data is correct')
        done()
      })
    })

    it('works when position is null', done => {
      fs.read(TEST_FD, Buffer.alloc(SIZE), 0, SIZE, null, (err, bytesRead, buffer) => {
        assert.ifError(err)
        assert.equal(bytesRead, SIZE, 'bytesRead is correct')
        assert(buffer.equals(TEST_DATA), 'data is correct')
        done()
      })
    })
  })
})

describe('fs.write()', () => {
  let TEST_FILE
  let TEST_DATA
  let TEST_FD

  beforeEach(() => {
    TEST_FILE = path.join(os.tmpdir(), 'fs-extra', 'write-test-file')
    TEST_DATA = crypto.randomBytes(SIZE)
    fs.ensureDirSync(path.dirname(TEST_FILE))
    TEST_FD = fs.openSync(TEST_FILE, 'w')
  })

  afterEach(() => {
    return fs.close(TEST_FD)
      .then(() => fs.remove(TEST_FILE))
  })

  describe('with promises', () => {
    it('returns an object', () => {
      return fs.write(TEST_FD, TEST_DATA, 0, SIZE, 0)
        .then(results => {
          const bytesWritten = results.bytesWritten
          const buffer = results.buffer
          assert.equal(bytesWritten, SIZE, 'bytesWritten is correct')
          assert(buffer.equals(TEST_DATA), 'data is correct')
        })
    })

    onNode7it('returns an object when minimal arguments are passed', () => {
      return fs.write(TEST_FD, TEST_DATA)
        .then(results => {
          const bytesWritten = results.bytesWritten
          const buffer = results.buffer
          assert.equal(bytesWritten, SIZE, 'bytesWritten is correct')
          assert(buffer.equals(TEST_DATA), 'data is correct')
        })
    })

    it('returns an object when writing a string', () => {
      const message = 'Hello World!'
      return fs.write(TEST_FD, message)
        .then(results => {
          const bytesWritten = results.bytesWritten
          const buffer = results.buffer
          assert.equal(bytesWritten, message.length, 'bytesWritten is correct')
          assert.equal(buffer, message, 'data is correct')
        })
    })
  })

  describe('with callbacks', () => {
    it('works', done => {
      fs.write(TEST_FD, TEST_DATA, 0, SIZE, 0, (err, bytesWritten, buffer) => {
        assert.ifError(err)
        assert.equal(bytesWritten, SIZE, 'bytesWritten is correct')
        assert(buffer.equals(TEST_DATA), 'data is correct')
        done()
      })
    })

    onNode7it('works when minimal arguments are passed', done => {
      fs.write(TEST_FD, TEST_DATA, (err, bytesWritten, buffer) => {
        assert.ifError(err)
        assert.equal(bytesWritten, SIZE, 'bytesWritten is correct')
        assert(buffer.equals(TEST_DATA), 'data is correct')
        done()
      })
    })

    it('works when writing a string', done => {
      const message = 'Hello World!'
      return fs.write(TEST_FD, message, (err, bytesWritten, buffer) => {
        assert.ifError(err)
        assert.equal(bytesWritten, message.length, 'bytesWritten is correct')
        assert.equal(buffer, message, 'data is correct')
        done()
      })
    })
  })
})
