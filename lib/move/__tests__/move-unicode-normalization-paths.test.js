'use strict'

const assert = require('assert')
const os = require('os')
const path = require('path')
const fs = require('../../')

/* global beforeEach, afterEach, describe, it */

describe('+ move() - unicode normalization paths', () => {
  let TEST_DIR = ''
  let src = ''
  let dest = ''

  // 'é' as one precomposed codepoint (NFC) vs 'e' + combining acute accent (NFD).
  // Visually identical, different byte representation.
  const nfc = 'café'.normalize('NFC')
  const nfd = 'café'.normalize('NFD')

  beforeEach(done => {
    TEST_DIR = path.join(os.tmpdir(), 'fs-extra', 'move-unicode-normalization-paths')
    fs.emptyDir(TEST_DIR, done)
  })

  afterEach(() => fs.removeSync(TEST_DIR))

  describe('> when src is a directory', () => {
    it('should move successfully', done => {
      src = path.join(TEST_DIR, `${nfd}-dir`)
      fs.outputFileSync(path.join(src, 'subdir', 'file.txt'), 'some data')
      dest = path.join(TEST_DIR, `${nfc}-dir`)

      fs.move(src, dest, err => {
        assert.ifError(err)
        assert(fs.existsSync(dest))
        assert.strictEqual(fs.readFileSync(path.join(dest, 'subdir', 'file.txt'), 'utf8'), 'some data')
        done()
      })
    })
  })

  describe('> when src is a file', () => {
    it('should move successfully', done => {
      src = path.join(TEST_DIR, `${nfd}-file`)
      fs.outputFileSync(src, 'some data')
      dest = path.join(TEST_DIR, `${nfc}-file`)

      fs.move(src, dest, err => {
        assert.ifError(err)
        assert(fs.existsSync(dest))
        assert.strictEqual(fs.readFileSync(dest, 'utf8'), 'some data')
        done()
      })
    })
  })
})
