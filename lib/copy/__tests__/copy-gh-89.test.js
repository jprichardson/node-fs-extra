'use strict'

// relevant: https://github.com/jprichardson/node-fs-extra/issues/89
// come up with better file name

const fs = require('fs')
const os = require('os')
const fse = require(process.cwd())
const path = require('path')
const assert = require('assert')

/* global afterEach, beforeEach, describe, it */

describe('copy() - gh #89', () => {
  const TEST_DIR = path.join(os.tmpdir(), 'fs-extra', 'copy-gh-89')

  beforeEach(done => {
    fse.emptyDir(TEST_DIR, done)
  })

  afterEach(done => {
    fse.remove(TEST_DIR, done)
  })

  it('should copy successfully', done => {
    const A = path.join(TEST_DIR, 'A')
    const B = path.join(TEST_DIR, 'B')
    fs.mkdirSync(A)
    fs.mkdirSync(B)

    const one = path.join(A, 'one.txt')
    const two = path.join(A, 'two.txt')
    const three = path.join(B, 'three.txt')
    const four = path.join(B, 'four.txt')

    fs.writeFileSync(one, '1')
    fs.writeFileSync(two, '2')
    fs.writeFileSync(three, '3')
    fs.writeFileSync(four, '4')

    const C = path.join(TEST_DIR, 'C')
    fse.copy(A, C, err => {
      if (err) return done(err)

      fse.copy(B, C, err => {
        if (err) return done(err)

        assert(fs.existsSync(path.join(C, 'one.txt')))
        assert(fs.existsSync(path.join(C, 'two.txt')))
        assert(fs.existsSync(path.join(C, 'three.txt')))
        assert(fs.existsSync(path.join(C, 'four.txt')))
        done()
      })
    })
  })
})
