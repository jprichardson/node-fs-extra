'use strict'

const fs = require('graceful-fs')
const os = require('os')
const fse = require(process.cwd())
const path = require('path')
const assert = require('assert')

/* global afterEach, beforeEach, describe, it */

function createAsyncErrFn (errCode) {
  const fn = function (...args) {
    fn.callCount++
    const callback = args.pop()
    setTimeout(() => {
      const err = new Error()
      err.code = errCode
      callback(err)
    }, 10)
  }
  fn.callCount = 0
  return fn
}

const originalRename = fs.rename

function setUpMockFs (errCode) {
  fs.rename = createAsyncErrFn(errCode)
}

function tearDownMockFs () {
  fs.rename = originalRename
}

describe('+ move()', () => {
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

  afterEach(done => fse.remove(TEST_DIR, done))

  describe('> when overwrite = true', () => {
    it('should overwrite file', done => {
      const src = path.join(TEST_DIR, 'a-file')
      const dest = path.join(TEST_DIR, 'a-folder', 'another-file')

      // verify file exists already
      assert(fs.existsSync(dest))

      fse.move(src, dest, {overwrite: true}, err => {
        assert.ifError(err)
        fs.readFile(dest, 'utf8', (err, contents) => {
          const expected = /^sonic the hedgehog\r?\n$/
          assert.ifError(err)
          assert.ok(contents.match(expected), `${contents} match ${expected}`)
          done()
        })
      })
    })

    it('should overwrite the destination directory', done => {
      // Create src
      const src = path.join(TEST_DIR, 'src')
      fse.ensureDirSync(src)
      fse.mkdirsSync(path.join(src, 'some-folder'))
      fs.writeFileSync(path.join(src, 'some-file'), 'hi')

      const dest = path.join(TEST_DIR, 'a-folder')

      // verify dest has stuff in it
      const paths = fs.readdirSync(dest)
      assert(paths.indexOf('another-file') >= 0)
      assert(paths.indexOf('another-folder') >= 0)

      fse.move(src, dest, {overwrite: true}, err => {
        assert.ifError(err)

        // verify dest does not have old stuff
        const paths = fs.readdirSync(dest)
        assert.strictEqual(paths.indexOf('another-file'), -1)
        assert.strictEqual(paths.indexOf('another-folder'), -1)

        // verify dest has new stuff
        assert(paths.indexOf('some-file') >= 0)
        assert(paths.indexOf('some-folder') >= 0)

        done()
      })
    })

    it('should overwrite folders across devices', done => {
      const src = path.join(TEST_DIR, 'a-folder')
      const dest = path.join(TEST_DIR, 'a-folder-dest')

      fs.mkdirSync(dest)

      setUpMockFs('EXDEV')

      fse.move(src, dest, {overwrite: true}, err => {
        assert.ifError(err)
        assert.strictEqual(fs.rename.callCount, 1)

        fs.readFile(path.join(dest, 'another-folder', 'file3'), 'utf8', (err, contents) => {
          const expected = /^knuckles\r?\n$/
          assert.ifError(err)
          assert.ok(contents.match(expected), `${contents} match ${expected}`)
          tearDownMockFs()
          done()
        })
      })
    })
  })

  describe('> when overwrite = false', () => {
    it('should rename a file on the same device', done => {
      const src = path.join(TEST_DIR, 'a-file')
      const dest = path.join(TEST_DIR, 'a-file-dest')

      fse.move(src, dest, err => {
        assert.ifError(err)
        fs.readFile(dest, 'utf8', (err, contents) => {
          const expected = /^sonic the hedgehog\r?\n$/
          assert.ifError(err)
          assert.ok(contents.match(expected), `${contents} match ${expected}`)
          done()
        })
      })
    })

    it('should not move a file if source and destination are the same', done => {
      const src = path.join(TEST_DIR, 'a-file')
      const dest = src

      fse.move(src, dest, err => {
        assert.ifError(err)
        done()
      })
    })

    it('should error if source and destination are the same and source does not exist', done => {
      const src = path.join(TEST_DIR, 'non-existent')
      const dest = src

      fse.move(src, dest, err => {
        assert(err)
        done()
      })
    })

    it('should not move a directory if source and destination are the same', done => {
      const src = path.join(TEST_DIR, 'a-folder')
      const dest = src

      fse.move(src, dest, err => {
        assert.ifError(err)
        done()
      })
    })

    it('should not overwrite the destination by default', done => {
      const src = path.join(TEST_DIR, 'a-file')
      const dest = path.join(TEST_DIR, 'a-folder', 'another-file')

      // verify file exists already
      assert(fs.existsSync(dest))

      fse.move(src, dest, err => {
        assert.strictEqual(err.message, 'dest already exists.')
        done()
      })
    })

    it('should not overwrite if overwrite = false', done => {
      const src = path.join(TEST_DIR, 'a-file')
      const dest = path.join(TEST_DIR, 'a-folder', 'another-file')

      // verify file exists already
      assert(fs.existsSync(dest))

      fse.move(src, dest, {overwrite: false}, err => {
        assert.strictEqual(err.message, 'dest already exists.')
        done()
      })
    })

    it('should create directory structure by default', done => {
      const src = path.join(TEST_DIR, 'a-file')
      const dest = path.join(TEST_DIR, 'does', 'not', 'exist', 'a-file-dest')

      // verify dest directory does not exist
      assert(!fs.existsSync(path.dirname(dest)))

      fse.move(src, dest, err => {
        assert.ifError(err)
        fs.readFile(dest, 'utf8', (err, contents) => {
          const expected = /^sonic the hedgehog\r?\n$/
          assert.ifError(err)
          assert.ok(contents.match(expected), `${contents} match ${expected}`)
          done()
        })
      })
    })

    it('should work across devices', done => {
      const src = path.join(TEST_DIR, 'a-file')
      const dest = path.join(TEST_DIR, 'a-file-dest')

      setUpMockFs('EXDEV')

      fse.move(src, dest, err => {
        assert.ifError(err)
        assert.strictEqual(fs.rename.callCount, 1)

        fs.readFile(dest, 'utf8', (err, contents) => {
          const expected = /^sonic the hedgehog\r?\n$/
          assert.ifError(err)
          assert.ok(contents.match(expected), `${contents} match ${expected}`)
          tearDownMockFs()
          done()
        })
      })
    })

    it('should move folders', done => {
      const src = path.join(TEST_DIR, 'a-folder')
      const dest = path.join(TEST_DIR, 'a-folder-dest')

      // verify it doesn't exist
      assert(!fs.existsSync(dest))

      fse.move(src, dest, err => {
        assert.ifError(err)
        fs.readFile(path.join(dest, 'another-file'), 'utf8', (err, contents) => {
          const expected = /^tails\r?\n$/
          assert.ifError(err)
          assert.ok(contents.match(expected), `${contents} match ${expected}`)
          done()
        })
      })
    })

    it('should move folders across devices with EXDEV error', done => {
      const src = path.join(TEST_DIR, 'a-folder')
      const dest = path.join(TEST_DIR, 'a-folder-dest')

      setUpMockFs('EXDEV')

      fse.move(src, dest, err => {
        assert.ifError(err)
        assert.strictEqual(fs.rename.callCount, 1)

        fs.readFile(path.join(dest, 'another-folder', 'file3'), 'utf8', (err, contents) => {
          const expected = /^knuckles\r?\n$/
          assert.ifError(err)
          assert.ok(contents.match(expected), `${contents} match ${expected}`)
          tearDownMockFs()
          done()
        })
      })
    })
  })

  describe('> clobber', () => {
    it('should be an alias for overwrite', done => {
      const src = path.join(TEST_DIR, 'a-file')
      const dest = path.join(TEST_DIR, 'a-folder', 'another-file')

      // verify file exists already
      assert(fs.existsSync(dest))

      fse.move(src, dest, {clobber: true}, err => {
        assert.ifError(err)
        fs.readFile(dest, 'utf8', (err, contents) => {
          const expected = /^sonic the hedgehog\r?\n$/
          assert.ifError(err)
          assert.ok(contents.match(expected), `${contents} match ${expected}`)
          done()
        })
      })
    })
  })

  describe('> when trying to move a folder into itself', () => {
    it('should produce an error', done => {
      const SRC_DIR = path.join(TEST_DIR, 'test')
      const DEST_DIR = path.join(TEST_DIR, 'test', 'test')

      assert(!fs.existsSync(SRC_DIR))
      fs.mkdirSync(SRC_DIR)
      assert(fs.existsSync(SRC_DIR))

      fse.move(SRC_DIR, DEST_DIR, err => {
        assert(fs.existsSync(SRC_DIR))
        assert.equal(err.message, `Cannot move '${SRC_DIR}' to a subdirectory of itself, '${DEST_DIR}'.`)
        done()
      })
    })
  })

  // tested on Linux ubuntu 3.13.0-32-generic #57-Ubuntu SMP i686 i686 GNU/Linux
  // this won't trigger a bug on Mac OS X Yosimite with a USB drive (/Volumes)
  // see issue #108
  describe('> when actually trying to move a folder across devices', () => {
    const differentDevice = '/mnt'
    let __skipTests = false

    // must set this up, if not, exit silently
    if (!fs.existsSync(differentDevice)) {
      console.log('Skipping cross-device move test')
      __skipTests = true
    }

    // make sure we have permission on device
    try {
      fs.writeFileSync(path.join(differentDevice, 'file'), 'hi')
    } catch (err) {
      console.log("Can't write to device. Skipping move test.")
      __skipTests = true
    }

    const _it = __skipTests ? it.skip : it

    describe('>> just the folder', () => {
      _it('should move the folder', done => {
        const src = '/mnt/some/weird/dir-really-weird'
        const dest = path.join(TEST_DIR, 'device-weird')

        if (!fs.existsSync(src)) {
          fse.mkdirpSync(src)
        }

        assert(!fs.existsSync(dest))

        assert(fs.lstatSync(src).isDirectory())

        fse.move(src, dest, err => {
          assert.ifError(err)
          assert(fs.existsSync(dest))
          assert(fs.lstatSync(dest).isDirectory())
          done()
        })
      })
    })
  })
})
