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
            assert.equal(srcStat.atime.getTime(),
              destStat.atime.getTime(),
              `atime ${srcStat.atime} should match ${destStat.atime}`
            )
            assert.equal(srcStat.mtime.getTime(),
              destStat.mtime.getTime(),
              `mtime ${srcStat.mtime} should match ${destStat.mtime}`
            )
            done()
          })
        })
      })
    }, 1500)
  })
})
