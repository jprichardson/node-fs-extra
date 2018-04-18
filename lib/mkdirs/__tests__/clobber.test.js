'use strict'

const fs = require('fs')
const os = require('os')
const fse = require(process.cwd())
const path = require('path')
const assert = require('assert')

/* global before, describe, it */

const o755 = parseInt('755', 8)

describe('mkdirp / clobber', () => {
  let TEST_DIR
  let file

  before(done => {
    TEST_DIR = path.join(os.tmpdir(), 'fs-extra', 'mkdirp-clobber')
    fse.emptyDir(TEST_DIR, err => {
      assert.ifError(err)

      const ps = [ TEST_DIR ]

      for (let i = 0; i < 15; i++) {
        const dir = Math.floor(Math.random() * Math.pow(16, 4)).toString(16)
        ps.push(dir)
      }

      file = ps.join(path.sep)

      // a file in the way
      const itw = ps.slice(0, 2).join(path.sep)

      fs.writeFileSync(itw, 'I AM IN THE WAY, THE TRUTH, AND THE LIGHT.')

      fs.stat(itw, (err, stat) => {
        assert.ifError(err)
        assert.ok(stat && stat.isFile(), 'should be file')
        done()
      })
    })
  })

  it('should clobber', done => {
    fse.mkdirp(file, o755, err => {
      assert.ok(err)
      if (os.platform().indexOf('win') === 0) {
        assert.strictEqual(err.code, 'EEXIST')
      } else {
        assert.strictEqual(err.code, 'ENOTDIR')
      }
      done()
    })
  })
})
