'use strict'

const assert = require('assert')
const fs = require('fs')
const os = require('os')
const path = require('path')
const fse = require(process.cwd())

/* global afterEach, beforeEach, describe, it */

let TEST_DIR

describe('+ remove() - filter option', () => {
  beforeEach(done => {
    TEST_DIR = path.join(os.tmpdir(), 'fs-extra', 'remove-filter')
    fse.emptyDir(TEST_DIR, done)
  })

  afterEach(done => fse.remove(TEST_DIR, done))

  describe('> when filter is used', () => {
    it('should only remove files allowed by filter fn when path is a file', done => {
      const f1 = path.join(TEST_DIR, '1.css')
      fse.outputFileSync(f1, '')

      const filter = p => path.extname(p) !== '.css'

      fse.remove(f1, {filter: filter}, err => {
        assert.ifError(err)
        assert(fs.existsSync(f1))
        done()
      })
    })

    it('should only remove files allowed by filter fn when path is a directory', done => {
      const src = path.join(TEST_DIR, 'src')
      const f1 = path.join(src, '1.css')
      const f2 = path.join(src, '2.js')
      fse.outputFileSync(f1, '')
      fse.outputFileSync(f2, '')

      const filter = p => path.extname(p) !== '.css' && p !== src

      fse.remove(src, {filter: filter}, err => {
        assert.ifError(err)
        assert(fs.existsSync(f1))
        assert(!fs.existsSync(f2))
        done()
      })
    })

    it('should not remove and return when nothing matched', done => {
      const src = path.join(TEST_DIR, 'src')
      const f1 = path.join(src, '1.md')
      const f2 = path.join(src, '2.js')
      fse.outputFileSync(f1, '')
      fse.outputFileSync(f2, '')

      const filter = p => path.extname(p) === '.css'

      fse.remove(src, {filter: filter}, err => {
        assert.ifError(err)
        assert(fs.existsSync(f1))
        assert(fs.existsSync(f2))
        done()
      })
    })

    it('should apply filter recursively when applied on file', done => {
      const src = path.join(TEST_DIR, 'src')
      const srcFile1 = path.join(src, '1.js')
      const srcFile2 = path.join(src, '2.css')
      const srcFile3 = path.join(src, 'node_modules', '3.css')
      fse.outputFileSync(srcFile1, 'file 1 stuff')
      fse.outputFileSync(srcFile2, 'file 2 stuff')
      fse.outputFileSync(srcFile3, 'file 3 stuff')

      const filter = p => path.extname(p) === '.css'

      fse.remove(src, {filter: filter}, err => {
        assert.ifError(err)
        assert(fs.existsSync(srcFile1))
        assert(!fs.existsSync(srcFile2))
        assert(!fs.existsSync(srcFile3))
        done()
      })
    })

    it('should apply filter recursively when applied on dir', done => {
      const src = path.join(TEST_DIR, 'src')
      const srcFile1 = path.join(src, '1.js')
      const subdir1 = path.join(src, 'subdir1')
      // one subdir in root (should be reomved)
      const subdir2 = path.join(src, 'subdir2')
      const srcFile2 = path.join(subdir2, '2.css')
      // other subdir in some subdir (should be removed)
      const subdir22 = path.join(subdir1, 'subdir2')
      const srcFile22 = path.join(subdir22, '22.css')
      const subdir3 = path.join(subdir1, 'subdir3')
      fse.outputFileSync(srcFile1, 'file 1 stuff')
      fse.outputFileSync(srcFile2, 'file 2 stuff')
      fse.outputFileSync(srcFile22, 'file 22 stuff')
      fse.ensureDir(subdir3)

      const filter = p => p.indexOf('subdir2') > -1

      fse.remove(src, {filter: filter}, err => {
        assert.ifError(err)
        assert(fs.existsSync(srcFile1))
        assert(fs.existsSync(subdir1))
        assert(!fs.existsSync(subdir2))
        assert(!fs.existsSync(subdir22))
        assert(fs.existsSync(subdir3))
        done()
      })
    })
  })
})
