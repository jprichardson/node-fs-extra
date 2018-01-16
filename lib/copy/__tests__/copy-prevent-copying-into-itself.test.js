'use strict'

const assert = require('assert')
const os = require('os')
const path = require('path')
const fs = require(process.cwd())
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

describe('+ copy() - prevent copying into itself', () => {
  let TEST_DIR, src

  beforeEach(done => {
    TEST_DIR = path.join(os.tmpdir(), 'fs-extra', 'copy-prevent-copying-into-itself')
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
    it('should copy the file successfully even when dest parent is a subdir of src', done => {
      const srcFile = path.join(TEST_DIR, 'src', 'srcfile.txt')
      const destFile = path.join(TEST_DIR, 'src', 'dest', 'destfile.txt')
      fs.writeFileSync(srcFile, dat0)

      fs.copy(srcFile, destFile, err => {
        assert.ifError(err)

        assert(fs.existsSync(destFile, 'file copied'))
        const out = fs.readFileSync(destFile, 'utf8')
        assert.strictEqual(out, dat0, 'file contents matched')
        done()
      })
    })
  })

  // test for these cases:
  //  - src is directory, dest is directory
  //  - src is directory, dest is symlink
  //  - src is symlink, dest is directory
  //  - src is symlink, dest is symlink

  describe('> when source is a directory', () => {
    describe('>> when dest is a directory', () => {
      it(`of not itself`, done => {
        const dest = path.join(TEST_DIR, src.replace(/^\w:/, ''))
        return testSuccess(src, dest, done)
      })
      it(`of itself`, done => {
        const dest = path.join(src, 'dest')
        return testError(src, dest, done)
      })
      it(`should copy the directory successfully when dest is 'src_dest'`, done => {
        const dest = path.join(TEST_DIR, 'src_dest')
        return testSuccess(src, dest, done)
      })
      it(`should copy the directory successfully when dest is 'src-dest'`, done => {
        const dest = path.join(TEST_DIR, 'src-dest')
        return testSuccess(src, dest, done)
      })

      it(`should copy the directory successfully when dest is 'dest_src'`, done => {
        const dest = path.join(TEST_DIR, 'dest_src')
        return testSuccess(src, dest, done)
      })

      it(`should copy the directory successfully when dest is 'src_dest/src'`, done => {
        const dest = path.join(TEST_DIR, 'src_dest', 'src')
        return testSuccess(src, dest, done)
      })

      it(`should copy the directory successfully when dest is 'src-dest/src'`, done => {
        const dest = path.join(TEST_DIR, 'src-dest', 'src')
        return testSuccess(src, dest, done)
      })

      it(`should copy the directory successfully when dest is 'dest_src/src'`, done => {
        const dest = path.join(TEST_DIR, 'dest_src', 'src')
        return testSuccess(src, dest, done)
      })

      it(`should copy the directory successfully when dest is 'src_src/dest'`, done => {
        const dest = path.join(TEST_DIR, 'src_src', 'dest')
        return testSuccess(src, dest, done)
      })

      it(`should copy the directory successfully when dest is 'src-src/dest'`, done => {
        const dest = path.join(TEST_DIR, 'src-src', 'dest')
        return testSuccess(src, dest, done)
      })

      it(`should copy the directory successfully when dest is 'srcsrc/dest'`, done => {
        const dest = path.join(TEST_DIR, 'srcsrc', 'dest')
        return testSuccess(src, dest, done)
      })

      it(`should copy the directory successfully when dest is 'dest/src'`, done => {
        const dest = path.join(TEST_DIR, 'dest', 'src')
        return testSuccess(src, dest, done)
      })

      it('should copy the directory successfully when dest is very nested that all its parents need to be created', done => {
        const dest = path.join(TEST_DIR, 'dest', 'src', 'foo', 'bar', 'baz', 'qux', 'quux', 'waldo',
          'grault', 'garply', 'fred', 'plugh', 'thud', 'some', 'highly', 'deeply',
          'badly', 'nasty', 'crazy', 'mad', 'nested', 'dest')
        return testSuccess(src, dest, done)
      })

      it(`should error when dest is 'src/dest'`, done => {
        const dest = path.join(TEST_DIR, 'src', 'dest')
        return testError(src, dest, done)
      })

      it(`should error when dest is 'src/src_dest'`, done => {
        const dest = path.join(TEST_DIR, 'src', 'src_dest')
        return testError(src, dest, done)
      })

      it(`should error when dest is 'src/dest_src'`, done => {
        const dest = path.join(TEST_DIR, 'src', 'dest_src')
        return testError(src, dest, done)
      })

      it(`should error when dest is 'src/dest/src'`, done => {
        const dest = path.join(TEST_DIR, 'src', 'dest', 'src')
        return testError(src, dest, done)
      })
    })

    describe('>> when dest is a symlink', () => {
      it('should not copy and return when dest points exactly to src', done => {
        const destLink = path.join(TEST_DIR, 'dest-symlink')
        fs.symlinkSync(src, destLink, 'dir')

        const srclenBefore = klawSync(src).length
        assert(srclenBefore > 2)

        fs.copy(src, destLink, err => {
          assert.ifError(err)

          const srclenAfter = klawSync(src).length
          assert.strictEqual(srclenAfter, srclenBefore, 'src length should not change')

          const link = fs.readlinkSync(destLink)
          assert.strictEqual(link, src)
          done()
        })
      })

      it('should copy the directory successfully when src is a subdir of resolved dest path', done => {
        const srcInDest = path.join(TEST_DIR, 'dest', 'some', 'nested', 'src')
        const destLink = path.join(TEST_DIR, 'dest-symlink')
        fs.copySync(src, srcInDest) // put some stuff in srcInDest

        const dest = path.join(TEST_DIR, 'dest')
        fs.symlinkSync(dest, destLink, 'dir')

        const srclen = klawSync(srcInDest).length
        const destlenBefore = klawSync(dest).length

        assert(srclen > 2)
        fs.copy(srcInDest, destLink, err => {
          assert.ifError(err)

          const destlenAfter = klawSync(dest).length

          // assert dest length is oldlen + length of stuff copied from src
          assert.strictEqual(destlenAfter, destlenBefore + srclen, 'dest length should be equal to old length + copied legnth')

          FILES.forEach(f => assert(fs.existsSync(path.join(dest, f)), 'file copied'))

          const o0 = fs.readFileSync(path.join(dest, FILES[0]), 'utf8')
          const o1 = fs.readFileSync(path.join(dest, FILES[1]), 'utf8')
          const o2 = fs.readFileSync(path.join(dest, FILES[2]), 'utf8')
          const o3 = fs.readFileSync(path.join(dest, FILES[3]), 'utf8')

          assert.strictEqual(o0, dat0, 'files contents matched')
          assert.strictEqual(o1, dat1, 'files contents matched')
          assert.strictEqual(o2, dat2, 'files contents matched')
          assert.strictEqual(o3, dat3, 'files contents matched')
          done()
        })
      })
    })
  })

  describe('> when source is a symlink', () => {
    describe('>> when dest is a directory', () => {
      it('should error when resolved src path points to dest', done => {
        const srcLink = path.join(TEST_DIR, 'src-symlink')
        fs.symlinkSync(src, srcLink, 'dir')

        const dest = path.join(TEST_DIR, 'src')

        fs.copy(srcLink, dest, err => {
          assert(err)
          // assert source not affected
          const link = fs.readlinkSync(srcLink)
          assert.strictEqual(link, src)
          done()
        })
      })

      it('should error when dest is a subdir of resolved src path', done => {
        const srcLink = path.join(TEST_DIR, 'src-symlink')
        fs.symlinkSync(src, srcLink, 'dir')

        const dest = path.join(TEST_DIR, 'src', 'some', 'nested', 'dest')
        fs.mkdirsSync(dest)

        fs.copy(srcLink, dest, err => {
          assert(err)
          const link = fs.readlinkSync(srcLink)
          assert.strictEqual(link, src)
          done()
        })
      })

      it('should error when resolved src path is a subdir of dest', done => {
        const dest = path.join(TEST_DIR, 'dest')

        const resolvedSrcPath = path.join(dest, 'contains', 'src')
        const srcLink = path.join(TEST_DIR, 'src-symlink')
        fs.copySync(src, resolvedSrcPath)

        // make symlink that points to a subdir in dest
        fs.symlinkSync(resolvedSrcPath, srcLink, 'dir')

        fs.copy(srcLink, dest, err => {
          assert(err)
          done()
        })
      })

      it(`should copy the directory successfully when dest is 'src_src/dest'`, done => {
        const srcLink = path.join(TEST_DIR, 'src-symlink')
        fs.symlinkSync(src, srcLink, 'dir')

        const dest = path.join(TEST_DIR, 'src_src', 'dest')
        testSuccess(srcLink, dest, () => {
          const link = fs.readlinkSync(dest)
          assert.strictEqual(link, src)
          done()
        })
      })

      it(`should copy the directory successfully when dest is 'srcsrc/dest'`, done => {
        const srcLink = path.join(TEST_DIR, 'src-symlink')
        fs.symlinkSync(src, srcLink, 'dir')

        const dest = path.join(TEST_DIR, 'srcsrc', 'dest')
        testSuccess(srcLink, dest, () => {
          const link = fs.readlinkSync(dest)
          assert.strictEqual(link, src)
          done()
        })
      })
    })

    describe('>> when dest is a symlink', () => {
      it('should silently return when resolved dest path is exactly the same as resolved src path', done => {
        const srcLink = path.join(TEST_DIR, 'src-symlink')
        fs.symlinkSync(src, srcLink, 'dir')
        const destLink = path.join(TEST_DIR, 'dest-symlink')
        fs.symlinkSync(src, destLink, 'dir')

        const srclenBefore = klawSync(srcLink).length
        const destlenBefore = klawSync(destLink).length
        assert(srclenBefore > 2)
        assert(destlenBefore > 2)

        fs.copy(srcLink, destLink, err => {
          assert.ifError(err)

          const srclenAfter = klawSync(srcLink).length
          assert.strictEqual(srclenAfter, srclenBefore, 'src length should not change')
          const destlenAfter = klawSync(destLink).length
          assert.strictEqual(destlenAfter, destlenBefore, 'dest length should not change')

          const srcln = fs.readlinkSync(srcLink)
          assert.strictEqual(srcln, src)
          const destln = fs.readlinkSync(destLink)
          assert.strictEqual(destln, src)
          done()
        })
      })

      it('should error when resolved dest path is a subdir of resolved src path', done => {
        const srcLink = path.join(TEST_DIR, 'src-symlink')
        fs.symlinkSync(src, srcLink, 'dir')

        const destLink = path.join(TEST_DIR, 'dest-symlink')
        const resolvedDestPath = path.join(TEST_DIR, 'src', 'some', 'nested', 'dest')
        fs.ensureFileSync(path.join(resolvedDestPath, 'subdir', 'somefile.txt'))

        fs.symlinkSync(resolvedDestPath, destLink, 'dir')

        fs.copy(srcLink, destLink, err => {
          assert.ifError(err)
          const destln = fs.readlinkSync(destLink)
          assert.strictEqual(destln, src)
          done()
        })
      })

      it('should error when resolved src path is a subdir of resolved dest path', done => {
        const srcInDest = path.join(TEST_DIR, 'dest', 'some', 'nested', 'src')
        const srcLink = path.join(TEST_DIR, 'src-symlink')
        const destLink = path.join(TEST_DIR, 'dest-symlink')

        const dest = path.join(TEST_DIR, 'dest')

        fs.mkdirSync(dest)

        fs.symlinkSync(srcInDest, srcLink, 'dir')
        fs.symlinkSync(dest, destLink, 'dir')

        fs.copy(srcLink, destLink, err => {
          assert.strictEqual(err.message, `Cannot overwrite '${dest}' with '${srcInDest}'.`)
          const destln = fs.readlinkSync(destLink)
          assert.strictEqual(destln, dest)
          done()
        })
      })
    })
  })
})

function testSuccess (src, dest, done) {
  const srclen = klawSync(src).length
  assert(srclen > 2)
  fs.copy(src, dest, err => {
    assert.ifError(err)

    const destlen = klawSync(dest).length

    assert.strictEqual(destlen, srclen)

    FILES.forEach(f => assert(fs.existsSync(path.join(dest, f)), 'file copied'))

    const o0 = fs.readFileSync(path.join(dest, FILES[0]), 'utf8')
    const o1 = fs.readFileSync(path.join(dest, FILES[1]), 'utf8')
    const o2 = fs.readFileSync(path.join(dest, FILES[2]), 'utf8')
    const o3 = fs.readFileSync(path.join(dest, FILES[3]), 'utf8')

    assert.strictEqual(o0, dat0, 'file contents matched')
    assert.strictEqual(o1, dat1, 'file contents matched')
    assert.strictEqual(o2, dat2, 'file contents matched')
    assert.strictEqual(o3, dat3, 'file contents matched')
    done()
  })
}

function testError (src, dest, done) {
  fs.copy(src, dest, err => {
    assert.strictEqual(err.message, `Cannot copy '${src}' to a subdirectory of itself, '${dest}'.`)
    done()
  })
}
