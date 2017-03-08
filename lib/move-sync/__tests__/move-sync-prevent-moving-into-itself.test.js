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

describe('+ moveSync() - prevent moving into itself', () => {
  let TEST_DIR, src, dest

  beforeEach(() => {
    TEST_DIR = path.join(os.tmpdir(), 'fs-extra', 'move-sync-prevent-moving-into-itself')
    src = path.join(TEST_DIR, 'src')
    fs.mkdirsSync(src)

    fs.outputFileSync(path.join(src, FILES[0]), dat0)
    fs.outputFileSync(path.join(src, FILES[1]), dat1)
    fs.outputFileSync(path.join(src, FILES[2]), dat2)
    fs.outputFileSync(path.join(src, FILES[3]), dat3)
  })

  afterEach(() => fs.removeSync(TEST_DIR))

  describe('> when source is a file', () => {
    it(`should move the file successfully even when dest parent is 'src/dest'`, () => {
      const destFile = path.join(TEST_DIR, 'src', 'dest', 'destfile.txt')
      return testSuccessFile(src, destFile)
    })

    it(`should move the file successfully when dest parent is 'src/src_dest'`, () => {
      const destFile = path.join(TEST_DIR, 'src', 'src_dest', 'destfile.txt')
      return testSuccessFile(src, destFile)
    })

    it(`should move the file successfully when dest parent is 'src/dest_src'`, () => {
      const destFile = path.join(TEST_DIR, 'src', 'dest_src', 'destfile.txt')
      return testSuccessFile(src, destFile)
    })

    it(`should move the file successfully when dest parent is 'src/dest/src'`, () => {
      const destFile = path.join(TEST_DIR, 'src', 'dest', 'src', 'destfile.txt')
      return testSuccessFile(src, destFile)
    })

    it(`should move the file successfully when dest parent is 'srcsrc/dest'`, () => {
      const destFile = path.join(TEST_DIR, 'srcsrc', 'dest', 'destfile.txt')
      return testSuccessFile(src, destFile)
    })
  })

  describe('> when source is a directory', () => {
    it(`should move the directory successfully when dest is 'src_dest'`, () => {
      dest = path.join(TEST_DIR, 'src_dest')
      return testSuccessDir(src, dest)
    })

    it(`should move the directory successfully when dest is 'src-dest'`, () => {
      dest = path.join(TEST_DIR, 'src-dest')
      return testSuccessDir(src, dest)
    })

    it(`should move the directory successfully when dest is 'dest_src'`, () => {
      dest = path.join(TEST_DIR, 'dest_src')
      return testSuccessDir(src, dest)
    })

    it(`should move the directory successfully when dest is 'src_dest/src'`, () => {
      dest = path.join(TEST_DIR, 'src_dest', 'src')
      return testSuccessDir(src, dest)
    })

    it(`should move the directory successfully when dest is 'src-dest/src'`, () => {
      dest = path.join(TEST_DIR, 'src-dest', 'src')
      return testSuccessDir(src, dest)
    })

    it(`should move the directory successfully when dest is 'dest_src/src'`, () => {
      dest = path.join(TEST_DIR, 'dest_src', 'src')
      return testSuccessDir(src, dest)
    })

    it(`should move the directory successfully when dest is 'src_src/dest'`, () => {
      dest = path.join(TEST_DIR, 'src_src', 'dest')
      return testSuccessDir(src, dest)
    })

    it(`should move the directory successfully when dest is 'src-src/dest'`, () => {
      dest = path.join(TEST_DIR, 'src-src', 'dest')
      return testSuccessDir(src, dest)
    })

    it(`should move the directory successfully when dest is 'srcsrc/dest'`, () => {
      dest = path.join(TEST_DIR, 'srcsrc', 'dest')
      return testSuccessDir(src, dest)
    })

    it(`should move the directory successfully when dest is 'dest/src'`, () => {
      dest = path.join(TEST_DIR, 'dest', 'src')
      return testSuccessDir(src, dest)
    })

    it('should move the directory successfully when dest is very nested that all its parents need to be created', () => {
      dest = path.join(TEST_DIR, 'dest', 'src', 'foo', 'bar', 'baz', 'qux', 'quux', 'waldo',
        'grault', 'garply', 'fred', 'plugh', 'thud', 'some', 'highly', 'deeply',
        'badly', 'nasty', 'crazy', 'mad', 'nested', 'dest')
      assert(!fs.existsSync(dest))
      return testSuccessDir(src, dest)
    })

    it(`should throw error when dest is 'src/dest'`, () => {
      dest = path.join(TEST_DIR, 'src', 'dest')
      return testError(src, dest)
    })

    it(`should throw error when dest is 'src/src_dest'`, () => {
      dest = path.join(TEST_DIR, 'src', 'src_dest')
      return testError(src, dest)
    })

    it(`should throw error when dest is 'src/dest_src'`, () => {
      dest = path.join(TEST_DIR, 'src', 'dest_src')
      return testError(src, dest)
    })

    it(`should throw error when dest is 'src/dest/src'`, () => {
      dest = path.join(TEST_DIR, 'src', 'dest', 'src')
      return testError(src, dest)
    })
  })
})

function testSuccessFile (src, destFile) {
  const srcFile = path.join(src, FILES[0])

  fs.moveSync(srcFile, destFile)

  const o0 = fs.readFileSync(destFile, 'utf8')
  assert.strictEqual(o0, dat0, 'file contents matched')
  assert(!fs.existsSync(srcFile))
}

function testSuccessDir (src, dest) {
  const srclen = klawSync(src).length
  // assert src has contents
  assert(srclen > 2)

  fs.moveSync(src, dest)

  const destlen = klawSync(dest).length

  // assert src and dest length are the same
  assert.strictEqual(destlen, srclen, 'src and dest length should be equal')

  const o0 = fs.readFileSync(path.join(dest, FILES[0]), 'utf8')
  const o1 = fs.readFileSync(path.join(dest, FILES[1]), 'utf8')
  const o2 = fs.readFileSync(path.join(dest, FILES[2]), 'utf8')
  const o3 = fs.readFileSync(path.join(dest, FILES[3]), 'utf8')

  assert.strictEqual(o0, dat0, 'file contents matched')
  assert.strictEqual(o1, dat1, 'file contents matched')
  assert.strictEqual(o2, dat2, 'file contents matched')
  assert.strictEqual(o3, dat3, 'file contents matched')
  assert(!fs.existsSync(src))
}

function testError (src, dest) {
  try {
    fs.moveSync(src, dest)
  } catch (err) {
    assert.strictEqual(err.message, `Cannot move '${src}' into itself '${dest}'.`)
    assert(fs.existsSync(src))
    assert(!fs.existsSync(dest))
  }
}
