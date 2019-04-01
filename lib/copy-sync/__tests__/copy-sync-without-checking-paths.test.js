'use strict'

const assert = require('assert')
const os = require('os')
const path = require('path')
const fs = require('../../')
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

describe('+ copySync() - without checking paths', () => {
  let TEST_DIR, src

  beforeEach(done => {
    TEST_DIR = path.join(os.tmpdir(), 'fs-extra', 'copy-sync-without-checking-paths')
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
    it('should copy the file successfully even if dest parent is a subdir of src', () => {
      const srcFile = path.join(TEST_DIR, 'src', 'srcfile.txt')
      const destFile = path.join(TEST_DIR, 'src', 'dest', 'destfile.txt')
      fs.writeFileSync(srcFile, dat0)

      fs.copySync(srcFile, destFile, { checkPathsBeforeCopying: false })

      assert(fs.existsSync(destFile))
      const out = fs.readFileSync(destFile, 'utf8')
      assert.strictEqual(out, dat0)
    })
  })

  // test for these cases:
  //  - src is directory, dest is directory
  //  - src is directory, dest is symlink
  //  - src is symlink, dest is directory
  //  - src is symlink, dest is symlink

  describe('> when source is a directory', () => {
    describe('>> when dest is a directory', () => {
      it(`of not itself`, () => {
        const dest = path.join(TEST_DIR, src.replace(/^\w:/, ''))
        return testSuccess(src, dest)
      })
      it(`should copy the directory successfully when dest is 'src_dest'`, () => {
        const dest = path.join(TEST_DIR, 'src_dest')
        return testSuccess(src, dest)
      })
      it(`should copy the directory successfully when dest is 'src-dest'`, () => {
        const dest = path.join(TEST_DIR, 'src-dest')
        return testSuccess(src, dest)
      })

      it(`should copy the directory successfully when dest is 'dest_src'`, () => {
        const dest = path.join(TEST_DIR, 'dest_src')
        return testSuccess(src, dest)
      })

      it(`should copy the directory successfully when dest is 'src_dest/src'`, () => {
        const dest = path.join(TEST_DIR, 'src_dest', 'src')
        return testSuccess(src, dest)
      })

      it(`should copy the directory successfully when dest is 'src-dest/src'`, () => {
        const dest = path.join(TEST_DIR, 'src-dest', 'src')
        return testSuccess(src, dest)
      })

      it(`should copy the directory successfully when dest is 'dest_src/src'`, () => {
        const dest = path.join(TEST_DIR, 'dest_src', 'src')
        return testSuccess(src, dest)
      })

      it(`should copy the directory successfully when dest is 'src_src/dest'`, () => {
        const dest = path.join(TEST_DIR, 'src_src', 'dest')
        return testSuccess(src, dest)
      })

      it(`should copy the directory successfully when dest is 'src-src/dest'`, () => {
        const dest = path.join(TEST_DIR, 'src-src', 'dest')
        return testSuccess(src, dest)
      })

      it(`should copy the directory successfully when dest is 'srcsrc/dest'`, () => {
        const dest = path.join(TEST_DIR, 'srcsrc', 'dest')
        return testSuccess(src, dest)
      })

      it(`should copy the directory successfully when dest is 'dest/src'`, () => {
        const dest = path.join(TEST_DIR, 'dest', 'src')
        return testSuccess(src, dest)
      })

      it('should copy the directory successfully when dest is very nested that all its parents need to be created', () => {
        const dest = path.join(TEST_DIR, 'dest', 'src', 'foo', 'bar', 'baz', 'qux', 'quux', 'waldo',
          'grault', 'garply', 'fred', 'plugh', 'thud', 'some', 'highly', 'deeply',
          'badly', 'nasty', 'crazy', 'mad', 'nested', 'dest')
        return testSuccess(src, dest)
      })
    })

    describe('>> when dest is a symlink', () => {
      it('should copy the directory successfully when src is a subdir of resolved dest path', () => {
        const srcInDest = path.join(TEST_DIR, 'dest', 'some', 'nested', 'src')
        const destLink = path.join(TEST_DIR, 'dest-symlink')
        fs.copySync(src, srcInDest) // put some stuff in srcInDest

        const dest = path.join(TEST_DIR, 'dest')
        fs.symlinkSync(dest, destLink, 'dir')

        const srclen = klawSync(srcInDest).length
        const destlenBefore = klawSync(dest).length

        assert(srclen > 2)
        fs.copySync(srcInDest, destLink, { checkPathsBeforeCopying: false })

        const destlenAfter = klawSync(dest).length

        // assert dest length is oldlen + length of stuff copied from src
        assert.strictEqual(destlenAfter, destlenBefore + srclen, 'dest length should be equal to old length + copied legnth')

        FILES.forEach(f => assert(fs.existsSync(path.join(dest, f))))

        const o0 = fs.readFileSync(path.join(dest, FILES[0]), 'utf8')
        const o1 = fs.readFileSync(path.join(dest, FILES[1]), 'utf8')
        const o2 = fs.readFileSync(path.join(dest, FILES[2]), 'utf8')
        const o3 = fs.readFileSync(path.join(dest, FILES[3]), 'utf8')

        assert.strictEqual(o0, dat0)
        assert.strictEqual(o1, dat1)
        assert.strictEqual(o2, dat2)
        assert.strictEqual(o3, dat3)
      })
    })
  })

  describe('> when source is a symlink', () => {
    describe('>> when dest is a directory', () => {
      it('should error when resolved src path points to dest', () => {
        const srcLink = path.join(TEST_DIR, 'src-symlink')
        fs.symlinkSync(src, srcLink, 'dir')
        const dest = path.join(TEST_DIR, 'src')
        let errThrown
        try {
          fs.copySync(srcLink, dest, { checkPathsBeforeCopying: false })
        } catch (err) {
          errThrown = err
        }
        assert(errThrown)

        // assert source not affected
        const link = fs.readlinkSync(srcLink)
        assert.strictEqual(link, src)
      })

      it('should error when dest is a subdir of resolved src path', () => {
        const srcLink = path.join(TEST_DIR, 'src-symlink')
        fs.symlinkSync(src, srcLink, 'dir')

        const dest = path.join(TEST_DIR, 'src', 'some', 'nested', 'dest')
        fs.mkdirsSync(dest)

        let errThrown
        try {
          fs.copySync(srcLink, dest, { checkPathsBeforeCopying: false })
        } catch (err) {
          errThrown = err
        }
        assert(errThrown)
        const link = fs.readlinkSync(srcLink)
        assert.strictEqual(link, src)
      })

      it('should error when resolved src path is a subdir of dest', () => {
        const dest = path.join(TEST_DIR, 'dest')

        const resolvedSrcPath = path.join(dest, 'contains', 'src')
        const srcLink = path.join(TEST_DIR, 'src-symlink')
        fs.copySync(src, resolvedSrcPath)

        // make symlink that points to a subdir in dest
        fs.symlinkSync(resolvedSrcPath, srcLink, 'dir')

        let errThrown
        try {
          fs.copySync(srcLink, dest, { checkPathsBeforeCopying: false })
        } catch (err) {
          errThrown = err
        }
        assert(errThrown)
      })

      it(`should copy the directory successfully when dest is 'src_src/dest'`, () => {
        const srcLink = path.join(TEST_DIR, 'src-symlink')
        fs.symlinkSync(src, srcLink, 'dir')

        const dest = path.join(TEST_DIR, 'src_src', 'dest')
        testSuccess(srcLink, dest)
        const link = fs.readlinkSync(dest)
        assert.strictEqual(link, src)
      })

      it(`should copy the directory successfully when dest is 'srcsrc/dest'`, () => {
        const srcLink = path.join(TEST_DIR, 'src-symlink')
        fs.symlinkSync(src, srcLink, 'dir')

        const dest = path.join(TEST_DIR, 'srcsrc', 'dest')
        testSuccess(srcLink, dest)
        const link = fs.readlinkSync(dest)
        assert.strictEqual(link, src)
      })
    })

    describe('>> when dest is a symlink', () => {
      it('should error when resolved dest path is a subdir of resolved src path', () => {
        const srcLink = path.join(TEST_DIR, 'src-symlink')
        fs.symlinkSync(src, srcLink, 'dir')

        const destLink = path.join(TEST_DIR, 'dest-symlink')
        const resolvedDestPath = path.join(TEST_DIR, 'src', 'some', 'nested', 'dest')
        fs.ensureFileSync(path.join(resolvedDestPath, 'subdir', 'somefile.txt'))
        fs.symlinkSync(resolvedDestPath, destLink, 'dir')

        let errThrown
        try {
          fs.copySync(srcLink, destLink, { checkPathsBeforeCopying: false })
        } catch (err) {
          errThrown = err
        }
        assert.strictEqual(errThrown.message, `Cannot copy '${src}' to a subdirectory of itself, '${resolvedDestPath}'.`)
        const destln = fs.readlinkSync(destLink)
        assert.strictEqual(destln, resolvedDestPath)
      })

      it('should error when resolved src path is a subdir of resolved dest path', () => {
        const srcInDest = path.join(TEST_DIR, 'dest', 'some', 'nested', 'src')
        const srcLink = path.join(TEST_DIR, 'src-symlink')
        const destLink = path.join(TEST_DIR, 'dest-symlink')
        const dest = path.join(TEST_DIR, 'dest')

        fs.ensureDirSync(srcInDest)
        fs.ensureSymlinkSync(srcInDest, srcLink, 'dir')
        fs.ensureSymlinkSync(dest, destLink, 'dir')

        let errThrown
        try {
          fs.copySync(srcLink, destLink, { checkPathsBeforeCopying: false })
        } catch (err) {
          errThrown = err
        }
        assert.strictEqual(errThrown.message, `Cannot overwrite '${dest}' with '${srcInDest}'.`)
        const destln = fs.readlinkSync(destLink)
        assert.strictEqual(destln, dest)
      })
    })
  })
})

function testSuccess (src, dest) {
  const srclen = klawSync(src).length
  assert(srclen > 2)
  fs.copySync(src, dest, { checkPathsBeforeCopying: false })

  FILES.forEach(f => assert(fs.existsSync(path.join(dest, f))))

  const o0 = fs.readFileSync(path.join(dest, FILES[0]), 'utf8')
  const o1 = fs.readFileSync(path.join(dest, FILES[1]), 'utf8')
  const o2 = fs.readFileSync(path.join(dest, FILES[2]), 'utf8')
  const o3 = fs.readFileSync(path.join(dest, FILES[3]), 'utf8')

  assert.strictEqual(o0, dat0)
  assert.strictEqual(o1, dat1)
  assert.strictEqual(o2, dat2)
  assert.strictEqual(o3, dat3)
}
