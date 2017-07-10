'use strict'

const assert = require('assert')
const os = require('os')
const path = require('path')
const fs = require(process.cwd())
const klawSync = require('klaw-sync')

/* global beforeEach, afterEach, describe, it */

const FILES = [
  'file0.txt',
  path.join('dir1', 'file1.txt'),
  path.join('dir1', 'dir2', 'file2.txt'),
  path.join('dir1', 'dir2', 'dir3', 'file3.txt')
]

const dat0 = 'file0'
const dat1 = 'file1'
const dat2 = 'file2'
const dat3 = 'file3'

describe('+ move() - prevent moving into itself', () => {
  let TEST_DIR, src, dest

  beforeEach(() => {
    TEST_DIR = path.join(os.tmpdir(), 'fs-extra', 'move-prevent-moving-into-itself')
    src = path.join(TEST_DIR, 'src')
    fs.mkdirpSync(src)

    fs.outputFileSync(path.join(src, FILES[0]), dat0)
    fs.outputFileSync(path.join(src, FILES[1]), dat1)
    fs.outputFileSync(path.join(src, FILES[2]), dat2)
    fs.outputFileSync(path.join(src, FILES[3]), dat3)
  })

  afterEach(() => fs.removeSync(TEST_DIR))

  describe('> when source is a file', () => {
    it(`should move the file successfully even when dest parent is 'src/dest'`, done => {
      const destFile = path.join(TEST_DIR, 'src', 'dest', 'destfile.txt')
      return testSuccessFile(src, destFile, done)
    })

    it(`should move the file successfully when dest parent is 'src/src_dest'`, done => {
      const destFile = path.join(TEST_DIR, 'src', 'src_dest', 'destfile.txt')
      return testSuccessFile(src, destFile, done)
    })

    it(`should move the file successfully when dest parent is 'src/dest_src'`, done => {
      const destFile = path.join(TEST_DIR, 'src', 'dest_src', 'destfile.txt')
      return testSuccessFile(src, destFile, done)
    })

    it(`should move the file successfully when dest parent is 'src/dest/src'`, done => {
      const destFile = path.join(TEST_DIR, 'src', 'dest', 'src', 'destfile.txt')
      return testSuccessFile(src, destFile, done)
    })

    it(`should move the file successfully when dest parent is 'srcsrc/dest'`, done => {
      const destFile = path.join(TEST_DIR, 'srcsrc', 'dest', 'destfile.txt')
      return testSuccessFile(src, destFile, done)
    })
  })

  describe('> when source is a directory', () => {
    it(`should move the directory successfully when dest is 'src_dest'`, done => {
      dest = path.join(TEST_DIR, 'src_dest')
      return testSuccessDir(src, dest, done)
    })

    it(`should move the directory successfully when dest is 'src-dest'`, done => {
      dest = path.join(TEST_DIR, 'src-dest')
      return testSuccessDir(src, dest, done)
    })

    it(`should move the directory successfully when dest is 'dest_src'`, done => {
      dest = path.join(TEST_DIR, 'dest_src')
      return testSuccessDir(src, dest, done)
    })

    it(`should move the directory successfully when dest is 'src_dest/src'`, done => {
      dest = path.join(TEST_DIR, 'src_dest', 'src')
      return testSuccessDir(src, dest, done)
    })

    it(`should move the directory successfully when dest is 'src-dest/src'`, done => {
      dest = path.join(TEST_DIR, 'src-dest', 'src')
      return testSuccessDir(src, dest, done)
    })

    it(`should move the directory successfully when dest is 'dest_src/src'`, done => {
      dest = path.join(TEST_DIR, 'dest_src', 'src')
      return testSuccessDir(src, dest, done)
    })

    it(`should move the directory successfully when dest is 'src_src/dest'`, done => {
      dest = path.join(TEST_DIR, 'src_src', 'dest')
      return testSuccessDir(src, dest, done)
    })

    it(`should move the directory successfully when dest is 'src-src/dest'`, done => {
      dest = path.join(TEST_DIR, 'src-src', 'dest')
      return testSuccessDir(src, dest, done)
    })

    it(`should move the directory successfully when dest is 'srcsrc/dest'`, done => {
      dest = path.join(TEST_DIR, 'srcsrc', 'dest')
      return testSuccessDir(src, dest, done)
    })

    it(`should move the directory successfully when dest is 'dest/src'`, done => {
      dest = path.join(TEST_DIR, 'dest', 'src')
      return testSuccessDir(src, dest, done)
    })

    it('should move the directory successfully when dest is very nested that all its parents need to be created', done => {
      dest = path.join(TEST_DIR, 'dest', 'src', 'foo', 'bar', 'baz', 'qux', 'quux', 'waldo',
        'grault', 'garply', 'fred', 'plugh', 'thud', 'some', 'highly', 'deeply',
        'badly', 'nasty', 'crazy', 'mad', 'nested', 'dest')
      assert(!fs.existsSync(dest))
      return testSuccessDir(src, dest, done)
    })

    it(`should return error when dest is 'src/dest'`, done => {
      dest = path.join(TEST_DIR, 'src', 'dest')
      return testError(src, dest, done)
    })

    it(`should return error when dest is 'src/src_dest'`, done => {
      dest = path.join(TEST_DIR, 'src', 'src_dest')
      return testError(src, dest, done)
    })

    it(`should return error when dest is 'src/dest_src'`, done => {
      dest = path.join(TEST_DIR, 'src', 'dest_src')
      return testError(src, dest, done)
    })

    it(`should return error when dest is 'src/dest/src'`, done => {
      dest = path.join(TEST_DIR, 'src', 'dest', 'src')
      return testError(src, dest, done)
    })
  })
})

function testSuccessFile (src, destFile, done) {
  const srcFile = path.join(src, FILES[0])

  fs.move(srcFile, destFile, err => {
    assert.ifError(err)
    const f0 = fs.readFileSync(destFile, 'utf8')
    assert.strictEqual(f0, dat0, 'file contents matched')
    assert(!fs.existsSync(srcFile))
    return done()
  })
}

function testSuccessDir (src, dest, done) {
  const srclen = klawSync(src).length

  assert(srclen > 2) // assert src has contents

  fs.move(src, dest, err => {
    assert.ifError(err)
    const destlen = klawSync(dest).length

    assert.strictEqual(destlen, srclen, 'src and dest length should be equal')

    const f0 = fs.readFileSync(path.join(dest, FILES[0]), 'utf8')
    const f1 = fs.readFileSync(path.join(dest, FILES[1]), 'utf8')
    const f2 = fs.readFileSync(path.join(dest, FILES[2]), 'utf8')
    const f3 = fs.readFileSync(path.join(dest, FILES[3]), 'utf8')

    assert.strictEqual(f0, dat0, 'file contents matched')
    assert.strictEqual(f1, dat1, 'file contents matched')
    assert.strictEqual(f2, dat2, 'file contents matched')
    assert.strictEqual(f3, dat3, 'file contents matched')
    assert(!fs.existsSync(src))
    return done()
  })
}

function testError (src, dest, done) {
  fs.move(src, dest, err => {
    assert(err)
    assert.strictEqual(err.message, `Cannot move '${src}' to a subdirectory of itself, '${dest}'.`)
    assert(fs.existsSync(src))
    assert(!fs.existsSync(dest))
    return done()
  })
}
