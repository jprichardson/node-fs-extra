/**
 * Created by user on 2017/3/8.
 */
'use strict'

const fs = require('graceful-fs')
const os = require('os')
const fse = require(process.cwd())
const path = require('path')
const assert = require('assert')
const rimraf = require('rimraf')

/* global afterEach, beforeEach, describe, it */

function createAsyncErrFn (errCode) {
  const fn = function () {
    fn.callCount++
    const callback = arguments[arguments.length - 1]
    setTimeout(() => {
      const err = new Error()
      err.code = errCode
      callback(err)
    }, 10)
  }
  fn.callCount = 0
  return fn
}

const originalRename = fs.rename
const originalLink = fs.link

function setUpMockFs (errCode) {
  fs.rename = createAsyncErrFn(errCode)
  fs.link = createAsyncErrFn(errCode)
}

function tearDownMockFs () {
  fs.rename = originalRename
  fs.link = originalLink
}

function testFile (src, dest, options) {
  return function (file) {
    const a = src
    const b = dest
    const fromStat = fs.statSync(a)
    const toStat = fs.statSync(b)
    if (options.preserveTimestamps) {
      // https://github.com/nodejs/io.js/issues/2069
      if (process.platform !== 'win32') {
        assert.strictEqual(toStat.mtime.getTime(), fromStat.mtime.getTime())
        assert.strictEqual(toStat.atime.getTime(), fromStat.atime.getTime())
      } else {
        assert.strictEqual(toStat.mtime.getTime(), utimes.timeRemoveMillis(fromStat.mtime.getTime()))
        assert.strictEqual(toStat.atime.getTime(), utimes.timeRemoveMillis(fromStat.atime.getTime()))
      }
    } else {
      assert.notEqual(toStat.mtime.getTime(), fromStat.mtime.getTime())
      // the access time might actually be the same, so check only modification time
    }
  }
}

describe('move', () => {
  let TEST_DIR

  beforeEach(() => {
    TEST_DIR = path.join(os.tmpdir(), 'fs-extra', 'move')

    fse.emptyDirSync(TEST_DIR)

    // Create fixtures:
    fs.writeFileSync(path.join(TEST_DIR, 'a-file'), 'sonic the hedgehog\n')
    fs.mkdirSync(path.join(TEST_DIR, 'a-folder'))
    fs.writeFileSync(path.join(TEST_DIR, 'a-folder/another-file'), 'tails\n')
    fs.mkdirSync(path.join(TEST_DIR, 'a-folder/another-folder'))
    fs.writeFileSync(path.join(TEST_DIR, 'a-folder/another-folder/file3'), 'knuckles\n')
  })

  afterEach(done => rimraf(TEST_DIR, done))

  it('should preserve timestamps', done => {
    const src = `${TEST_DIR}/a-file`
    const dest = `${TEST_DIR}/a-folder/another-folder/a-file-dest`

    const options = {
      preserveTimestamps: true
    }

    fs.stat(src, (srcErr, srcStat) => {
      assert.ifError(srcErr)
      setTimeout(() => {
        fse.move(src, dest, options, err => {
          assert.ifError(err)
          fs.stat(dest, (descErr, destStat) => {
            assert.ifError(descErr)
            testFile (src, dest, options)
            done()
          })
        })
      })
    }, 1500)
  })

  it('should preserve timestamps across devices', done => {
    const src = `${TEST_DIR}/a-file`
    const dest = `${TEST_DIR}/a-folder/another-folder/a-file-dest`

    const options = {
      preserveTimestamps: true
    }

    setUpMockFs('EXDEV')

    fs.stat(src, (srcErr, srcStat) => {
      assert.ifError(srcErr)
      setTimeout(() => {
        fse.move(src, dest, options, err => {
          assert.ifError(err)
          fs.stat(dest, (descErr, destStat) => {
            assert.ifError(descErr)
            testFile (src, dest, options)
            tearDownMockFs()
            done()
          })
        })
      })
    }, 1500)
  })
})
