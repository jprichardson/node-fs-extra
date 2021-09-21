'use strict'

const assert = require('assert')
const os = require('os')
const path = require('path')
const fs = require('../../')
const klawSync = require('klaw-sync')

/* global beforeEach, afterEach, describe, it */

// these files are used for all tests
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
  let TEST_DIR, src

  beforeEach(done => {
    TEST_DIR = path.join(os.tmpdir(), 'fs-extra', 'move-sync-prevent-moving-into-itself')
    src = path.join(TEST_DIR, 'src')
    fs.mkdirpSync(src)

    fs.outputFileSync(path.join(src, FILES[0]), dat0)
    fs.outputFileSync(path.join(src, FILES[1]), dat1)
    fs.outputFileSync(path.join(src, FILES[2]), dat2)
    fs.outputFileSync(path.join(src, FILES[3]), dat3)
    done()
  })

  afterEach(done => fs.remove(TEST_DIR, done))

  describe('> when source is a file', () => {
    it('should move the file successfully even if dest parent is a subdir of src', () => {
      const srcFile = path.join(TEST_DIR, 'src', 'srcfile.txt')
      const destFile = path.join(TEST_DIR, 'src', 'dest', 'destfile.txt')
      fs.writeFileSync(srcFile, dat0)

      fs.moveSync(srcFile, destFile)

      assert(fs.existsSync(destFile))
      const out = fs.readFileSync(destFile, 'utf8')
      assert.strictEqual(out, dat0, 'file contents matched')
    })
  })

  describe('> when source is a file', () => {
    it("should move the file successfully even when dest parent is 'src/dest'", () => {
      const destFile = path.join(TEST_DIR, 'src', 'dest', 'destfile.txt')
      return testSuccessFile(src, destFile)
    })

    it("should move the file successfully when dest parent is 'src/src_dest'", () => {
      const destFile = path.join(TEST_DIR, 'src', 'src_dest', 'destfile.txt')
      return testSuccessFile(src, destFile)
    })

    it("should move the file successfully when dest parent is 'src/dest_src'", () => {
      const destFile = path.join(TEST_DIR, 'src', 'dest_src', 'destfile.txt')
      return testSuccessFile(src, destFile)
    })

    it("should move the file successfully when dest parent is 'src/dest/src'", () => {
      const destFile = path.join(TEST_DIR, 'src', 'dest', 'src', 'destfile.txt')
      return testSuccessFile(src, destFile)
    })

    it("should move the file successfully when dest parent is 'srcsrc/dest'", () => {
      const destFile = path.join(TEST_DIR, 'srcsrc', 'dest', 'destfile.txt')
      return testSuccessFile(src, destFile)
    })
  })

  describe('> when source is a directory', () => {
    describe('>> when dest is a directory', () => {
      it('of not itself', () => {
        const dest = path.join(TEST_DIR, src.replace(/^\w:/, ''))
        return testSuccessDir(src, dest)
      })
      it('of itself', () => {
        const dest = path.join(src, 'dest')
        return testError(src, dest)
      })
      it("should move the directory successfully when dest is 'src_dest'", () => {
        const dest = path.join(TEST_DIR, 'src_dest')
        return testSuccessDir(src, dest)
      })
      it("should move the directory successfully when dest is 'src-dest'", () => {
        const dest = path.join(TEST_DIR, 'src-dest')
        return testSuccessDir(src, dest)
      })

      it("should move the directory successfully when dest is 'dest_src'", () => {
        const dest = path.join(TEST_DIR, 'dest_src')
        return testSuccessDir(src, dest)
      })

      it("should move the directory successfully when dest is 'src_dest/src'", () => {
        const dest = path.join(TEST_DIR, 'src_dest', 'src')
        return testSuccessDir(src, dest)
      })

      it("should move the directory successfully when dest is 'src-dest/src'", () => {
        const dest = path.join(TEST_DIR, 'src-dest', 'src')
        return testSuccessDir(src, dest)
      })

      it("should move the directory successfully when dest is 'dest_src/src'", () => {
        const dest = path.join(TEST_DIR, 'dest_src', 'src')
        return testSuccessDir(src, dest)
      })

      it("should move the directory successfully when dest is 'src_src/dest'", () => {
        const dest = path.join(TEST_DIR, 'src_src', 'dest')
        return testSuccessDir(src, dest)
      })

      it("should move the directory successfully when dest is 'src-src/dest'", () => {
        const dest = path.join(TEST_DIR, 'src-src', 'dest')
        return testSuccessDir(src, dest)
      })

      it("should move the directory successfully when dest is 'srcsrc/dest'", () => {
        const dest = path.join(TEST_DIR, 'srcsrc', 'dest')
        return testSuccessDir(src, dest)
      })

      it("should move the directory successfully when dest is 'dest/src'", () => {
        const dest = path.join(TEST_DIR, 'dest', 'src')
        return testSuccessDir(src, dest)
      })

      it('should move the directory successfully when dest is very nested that all its parents need to be created', () => {
        const dest = path.join(TEST_DIR, 'dest', 'src', 'foo', 'bar', 'baz', 'qux', 'quux', 'waldo',
          'grault', 'garply', 'fred', 'plugh', 'thud', 'some', 'highly', 'deeply',
          'badly', 'nasty', 'crazy', 'mad', 'nested', 'dest')
        return testSuccessDir(src, dest)
      })

      it("should error when dest is 'src/dest'", () => {
        const dest = path.join(TEST_DIR, 'src', 'dest')
        return testError(src, dest)
      })

      it("should error when dest is 'src/src_dest'", () => {
        const dest = path.join(TEST_DIR, 'src', 'src_dest')
        return testError(src, dest)
      })

      it("should error when dest is 'src/dest_src'", () => {
        const dest = path.join(TEST_DIR, 'src', 'dest_src')
        return testError(src, dest)
      })

      it("should error when dest is 'src/dest/src'", () => {
        const dest = path.join(TEST_DIR, 'src', 'dest', 'src')
        return testError(src, dest)
      })
    })

    describe('>> when dest is a symlink', () => {
      it('should error when dest points exactly to src and dereference is true', () => {
        const destLink = path.join(TEST_DIR, 'dest-symlink')
        fs.symlinkSync(src, destLink, 'dir')

        const srclenBefore = klawSync(src).length
        assert(srclenBefore > 2)
        let errThrown = false
        try {
          fs.moveSync(src, destLink, { dereference: true })
        } catch (err) {
          assert.strictEqual(err.message, 'Source and destination must not be the same.')
          errThrown = true
        } finally {
          assert(errThrown)
          const srclenAfter = klawSync(src).length
          assert.strictEqual(srclenAfter, srclenBefore, 'src length should not change')
          const link = fs.readlinkSync(destLink)
          assert.strictEqual(link, src)
        }
      })

      it('should error when dest is a subdirectory of src (bind-mounted directory with subdirectory)', () => {
        const destLink = path.join(TEST_DIR, 'dest-symlink')
        fs.symlinkSync(src, destLink, 'dir')

        const srclenBefore = klawSync(src).length
        assert(srclenBefore > 2)

        const dest = path.join(destLink, 'dir1')
        assert(fs.existsSync(dest))
        let errThrown = false
        try {
          fs.moveSync(src, dest)
        } catch (err) {
          assert.strictEqual(err.message, `Cannot move '${src}' to a subdirectory of itself, '${dest}'.`)
          errThrown = true
        } finally {
          assert(errThrown)
          const srclenAfter = klawSync(src).length
          assert.strictEqual(srclenAfter, srclenBefore, 'src length should not change')
          const link = fs.readlinkSync(destLink)
          assert.strictEqual(link, src)
        }
      })

      it('should error when dest is a subdirectory of src (more than one level depth)', () => {
        const destLink = path.join(TEST_DIR, 'dest-symlink')
        fs.symlinkSync(src, destLink, 'dir')

        const srclenBefore = klawSync(src).length
        assert(srclenBefore > 2)

        const dest = path.join(destLink, 'dir1', 'dir2')
        assert(fs.existsSync(dest))
        let errThrown = false
        try {
          fs.moveSync(src, dest)
        } catch (err) {
          assert.strictEqual(err.message, `Cannot move '${src}' to a subdirectory of itself, '${path.join(destLink, 'dir1')}'.`)
          errThrown = true
        } finally {
          assert(errThrown)
          const srclenAfter = klawSync(src).length
          assert.strictEqual(srclenAfter, srclenBefore, 'src length should not change')
          const link = fs.readlinkSync(destLink)
          assert.strictEqual(link, src)
        }
      })
    })
  })

  describe('> when source is a symlink', () => {
    describe('>> when dest is a directory', () => {
      it('should error when resolved src path points to dest', () => {
        const srcLink = path.join(TEST_DIR, 'src-symlink')
        fs.symlinkSync(src, srcLink, 'dir')

        const dest = path.join(TEST_DIR, 'src')
        let errThrown = false
        try {
          fs.moveSync(srcLink, dest)
        } catch (err) {
          assert(err)
          errThrown = true
        } finally {
          assert(errThrown)
          // assert source not affected
          const link = fs.readlinkSync(srcLink)
          assert.strictEqual(link, src)
        }
      })

      it('should error when dest is a subdir of resolved src path', () => {
        const srcLink = path.join(TEST_DIR, 'src-symlink')
        fs.symlinkSync(src, srcLink, 'dir')

        const dest = path.join(TEST_DIR, 'src', 'some', 'nested', 'dest')
        fs.mkdirsSync(dest)
        let errThrown = false
        try {
          fs.moveSync(srcLink, dest)
        } catch (err) {
          assert(err)
          errThrown = true
        } finally {
          assert(errThrown)
          const link = fs.readlinkSync(srcLink)
          assert.strictEqual(link, src)
        }
      })

      it('should error when resolved src path is a subdir of dest', () => {
        const dest = path.join(TEST_DIR, 'dest')

        const resolvedSrcPath = path.join(dest, 'contains', 'src')
        const srcLink = path.join(TEST_DIR, 'src-symlink')
        fs.copySync(src, resolvedSrcPath)

        // make symlink that points to a subdir in dest
        fs.symlinkSync(resolvedSrcPath, srcLink, 'dir')

        let errThrown = false
        try {
          fs.moveSync(srcLink, dest)
        } catch (err) {
          assert(err)
          errThrown = true
        } finally {
          assert(errThrown)
        }
      })

      it("should move the directory successfully when dest is 'src_src/dest'", () => {
        const srcLink = path.join(TEST_DIR, 'src-symlink')
        fs.symlinkSync(src, srcLink, 'dir')

        const dest = path.join(TEST_DIR, 'src_src', 'dest')
        testSuccessDir(srcLink, dest)
        const link = fs.readlinkSync(dest)
        assert.strictEqual(link, src)
      })

      it("should move the directory successfully when dest is 'srcsrc/dest'", () => {
        const srcLink = path.join(TEST_DIR, 'src-symlink')
        fs.symlinkSync(src, srcLink, 'dir')

        const dest = path.join(TEST_DIR, 'srcsrc', 'dest')
        testSuccessDir(srcLink, dest)
        const link = fs.readlinkSync(dest)
        assert.strictEqual(link, src)
      })
    })

    describe('>> when dest is a symlink', () => {
      it('should error when resolved dest path is exactly the same as resolved src path and dereferene is true', () => {
        const srcLink = path.join(TEST_DIR, 'src-symlink')
        fs.symlinkSync(src, srcLink, 'dir')
        const destLink = path.join(TEST_DIR, 'dest-symlink')
        fs.symlinkSync(src, destLink, 'dir')

        const srclenBefore = klawSync(srcLink).length
        const destlenBefore = klawSync(destLink).length
        assert(srclenBefore > 2)
        assert(destlenBefore > 2)
        let errThrown = false
        try {
          fs.moveSync(srcLink, destLink, { dereference: true })
        } catch (err) {
          assert.strictEqual(err.message, 'Source and destination must not be the same.')
          errThrown = true
        } finally {
          assert(errThrown)
          const srclenAfter = klawSync(srcLink).length
          assert.strictEqual(srclenAfter, srclenBefore, 'src length should not change')
          const destlenAfter = klawSync(destLink).length
          assert.strictEqual(destlenAfter, destlenBefore, 'dest length should not change')

          const srcln = fs.readlinkSync(srcLink)
          assert.strictEqual(srcln, src)
          const destln = fs.readlinkSync(destLink)
          assert.strictEqual(destln, src)
        }
      })
    })
  })
})

function testSuccessFile (src, destFile) {
  const srcFile = path.join(src, FILES[0])

  fs.moveSync(srcFile, destFile)
  const f0 = fs.readFileSync(destFile, 'utf8')
  assert.strictEqual(f0, dat0, 'file contents matched')
  assert(!fs.existsSync(srcFile))
}

function testSuccessDir (src, dest) {
  const srclen = klawSync(src).length

  assert(srclen > 2) // assert src has contents

  fs.moveSync(src, dest)
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
}

function testError (src, dest) {
  let errThrown = false
  try {
    fs.moveSync(src, dest)
  } catch (err) {
    assert.strictEqual(err.message, `Cannot move '${src}' to a subdirectory of itself, '${dest}'.`)
    assert(fs.existsSync(src))
    assert(!fs.existsSync(dest))
    errThrown = true
  } finally {
    assert(errThrown)
  }
}
