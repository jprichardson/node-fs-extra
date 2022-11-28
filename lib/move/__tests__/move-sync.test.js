'use strict'

// TODO: enable this once graceful-fs supports bigint option.
// const fs = require('graceful-fs')
const fs = require('fs')
const os = require('os')
const fse = require('../..')
const path = require('path')
const assert = require('assert')

/* global afterEach, beforeEach, describe, it */

const describeIfWindows = process.platform === 'win32' ? describe : describe.skip

function createSyncErrFn (errCode) {
  const fn = function () {
    const err = new Error()
    err.code = errCode
    throw err
  }
  return fn
}

const originalRenameSync = fs.renameSync

function setUpMockFs (errCode) {
  fs.renameSync = createSyncErrFn(errCode)
}

function tearDownMockFs () {
  fs.renameSync = originalRenameSync
}

describe('moveSync()', () => {
  let TEST_DIR

  beforeEach(() => {
    TEST_DIR = path.join(os.tmpdir(), 'fs-extra', 'move-sync')
    fse.emptyDirSync(TEST_DIR)

    // Create fixtures
    fse.outputFileSync(path.join(TEST_DIR, 'a-file'), 'sonic the hedgehog\n')
    fse.outputFileSync(path.join(TEST_DIR, 'a-folder/another-file'), 'tails\n')
    fse.outputFileSync(path.join(TEST_DIR, 'a-folder/another-folder/file3'), 'knuckles\n')
  })

  afterEach(() => fse.removeSync(TEST_DIR))

  it('should not move if src and dest are the same', () => {
    const src = `${TEST_DIR}/a-file`
    const dest = `${TEST_DIR}/a-file`

    let errThrown = false
    try {
      fse.moveSync(src, dest)
    } catch (err) {
      assert.strictEqual(err.message, 'Source and destination must not be the same.')
      errThrown = true
    } finally {
      assert(errThrown)
    }

    // assert src not affected
    const contents = fs.readFileSync(src, 'utf8')
    const expected = /^sonic the hedgehog\r?\n$/
    assert(contents.match(expected))
  })

  it('should error if src and dest are the same and src does not exist', () => {
    const src = `${TEST_DIR}/non-existent`
    const dest = src
    assert.throws(() => fse.moveSync(src, dest))
  })

  it('should rename a file on the same device', () => {
    const src = `${TEST_DIR}/a-file`
    const dest = `${TEST_DIR}/a-file-dest`

    fse.moveSync(src, dest)

    const contents = fs.readFileSync(dest, 'utf8')
    const expected = /^sonic the hedgehog\r?\n$/
    assert(contents.match(expected))
  })

  it('should not overwrite the destination by default', () => {
    const src = `${TEST_DIR}/a-file`
    const dest = `${TEST_DIR}/a-folder/another-file`

    // verify file exists already
    assert(fs.existsSync(dest))

    try {
      fse.moveSync(src, dest)
    } catch (err) {
      assert.strictEqual(err.message, 'dest already exists.')
    }
  })

  it('should not overwrite if overwrite = false', () => {
    const src = `${TEST_DIR}/a-file`
    const dest = `${TEST_DIR}/a-folder/another-file`

    // verify file exists already
    assert(fs.existsSync(dest))

    try {
      fse.moveSync(src, dest, { overwrite: false })
    } catch (err) {
      assert.strictEqual(err.message, 'dest already exists.')
    }
  })

  it('should overwrite file if overwrite = true', () => {
    const src = `${TEST_DIR}/a-file`
    const dest = `${TEST_DIR}/a-folder/another-file`

    // verify file exists already
    assert(fs.existsSync(dest))

    fse.moveSync(src, dest, { overwrite: true })

    const contents = fs.readFileSync(dest, 'utf8')
    const expected = /^sonic the hedgehog\r?\n$/
    assert.ok(contents.match(expected))
  })

  it('should overwrite the destination directory if overwrite = true', () => {
    // Create src
    const src = path.join(TEST_DIR, 'src')
    fse.ensureDirSync(src)
    fse.mkdirsSync(path.join(src, 'some-folder'))
    fs.writeFileSync(path.join(src, 'some-file'), 'hi')

    const dest = path.join(TEST_DIR, 'a-folder')

    // verify dest has stuff in it
    const pathsBefore = fs.readdirSync(dest)
    assert(pathsBefore.indexOf('another-file') >= 0)
    assert(pathsBefore.indexOf('another-folder') >= 0)

    fse.moveSync(src, dest, { overwrite: true })

    // verify dest does not have old stuff
    const pathsAfter = fs.readdirSync(dest)
    assert.strictEqual(pathsAfter.indexOf('another-file'), -1)
    assert.strictEqual(pathsAfter.indexOf('another-folder'), -1)

    // verify dest has new stuff
    assert(pathsAfter.indexOf('some-file') >= 0)
    assert(pathsAfter.indexOf('some-folder') >= 0)
  })

  it('should create directory structure by default', () => {
    const src = `${TEST_DIR}/a-file`
    const dest = `${TEST_DIR}/does/not/exist/a-file-dest`

    // verify dest directory does not exist
    assert(!fs.existsSync(path.dirname(dest)))

    fse.moveSync(src, dest)

    const contents = fs.readFileSync(dest, 'utf8')
    const expected = /^sonic the hedgehog\r?\n$/
    assert(contents.match(expected))
  })

  it('should work across devices', () => {
    const src = `${TEST_DIR}/a-file`
    const dest = `${TEST_DIR}/a-file-dest`

    setUpMockFs('EXDEV')

    fse.moveSync(src, dest)

    const contents = fs.readFileSync(dest, 'utf8')
    const expected = /^sonic the hedgehog\r?\n$/
    assert(contents.match(expected))
    tearDownMockFs()
  })

  it('should move folders', () => {
    const src = `${TEST_DIR}/a-folder`
    const dest = `${TEST_DIR}/a-folder-dest`

    // verify it doesn't exist
    assert(!fs.existsSync(dest))

    fse.moveSync(src, dest)

    const contents = fs.readFileSync(dest + '/another-file', 'utf8')
    const expected = /^tails\r?\n$/
    assert(contents.match(expected))
  })

  it('should overwrite folders across devices', () => {
    const src = `${TEST_DIR}/a-folder`
    const dest = `${TEST_DIR}/a-folder-dest`
    fs.mkdirSync(dest)

    setUpMockFs('EXDEV')

    fse.moveSync(src, dest, { overwrite: true })

    const contents = fs.readFileSync(dest + '/another-folder/file3', 'utf8')
    const expected = /^knuckles\r?\n$/
    assert(contents.match(expected))
    tearDownMockFs()
  })

  it('should move folders across devices with EXDEV error', () => {
    const src = `${TEST_DIR}/a-folder`
    const dest = `${TEST_DIR}/a-folder-dest`

    setUpMockFs('EXDEV')

    fse.moveSync(src, dest)

    const contents = fs.readFileSync(dest + '/another-folder/file3', 'utf8')
    const expected = /^knuckles\r?\n$/
    assert(contents.match(expected))
    tearDownMockFs()
  })

  describe('clobber', () => {
    it('should be an alias for overwrite', () => {
      const src = `${TEST_DIR}/a-file`
      const dest = `${TEST_DIR}/a-folder/another-file`

      // verify file exists already
      assert(fs.existsSync(dest))

      fse.moveSync(src, dest, { clobber: true })

      const contents = fs.readFileSync(dest, 'utf8')
      const expected = /^sonic the hedgehog\r?\n$/
      assert(contents.match(expected))
    })
  })

  describe('> when trying to move a folder into itself', () => {
    it('should produce an error', () => {
      const SRC_DIR = path.join(TEST_DIR, 'src')
      const DEST_DIR = path.join(TEST_DIR, 'src', 'dest')

      assert(!fs.existsSync(SRC_DIR))
      fs.mkdirSync(SRC_DIR)
      assert(fs.existsSync(SRC_DIR))

      try {
        fse.moveSync(SRC_DIR, DEST_DIR)
      } catch (err) {
        assert(err.message, `Cannot move ${SRC_DIR} into itself ${DEST_DIR}.`)
        assert(fs.existsSync(SRC_DIR))
        assert(!fs.existsSync(DEST_DIR))
      }
    })
  })

  describe('> when trying to move a file into its parent subdirectory', () => {
    it('should move successfully', () => {
      const src = `${TEST_DIR}/a-file`
      const dest = `${TEST_DIR}/dest/a-file-dest`

      fse.moveSync(src, dest)

      const contents = fs.readFileSync(dest, 'utf8')
      const expected = /^sonic the hedgehog\r?\n$/
      assert(contents.match(expected))
    })
  })

  describeIfWindows('> when dest parent is root', () => {
    let dest

    afterEach(() => fse.removeSync(dest))

    it('should not create parent directory', () => {
      const src = path.join(TEST_DIR, 'a-file')
      dest = path.join(path.parse(TEST_DIR).root, 'another-file')

      fse.moveSync(src, dest)

      const contents = fs.readFileSync(dest, 'utf8')
      const expected = /^sonic the hedgehog\r?\n$/
      assert(contents.match(expected))
    })
  })

  describe('> when actually trying to move a folder across devices', () => {
    const differentDevice = '/mnt'
    let __skipTests = false

    // must set this up, if not, exit silently
    if (!fs.existsSync(differentDevice)) {
      console.log('Skipping cross-device moveSync test')
      __skipTests = true
    }

    // make sure we have permission on device
    try {
      fs.writeFileSync(path.join(differentDevice, 'file'), 'hi')
    } catch {
      console.log("Can't write to device. Skipping moveSync test.")
      __skipTests = true
    }

    const _it = __skipTests ? it.skip : it

    describe('> just the folder', () => {
      _it('should move the folder', () => {
        const src = '/mnt/some/weird/dir-really-weird'
        const dest = path.join(TEST_DIR, 'device-weird')

        if (!fs.existsSync(src)) fse.mkdirpSync(src)
        assert(!fs.existsSync(dest))
        assert(fs.lstatSync(src).isDirectory())

        fse.moveSync(src, dest)

        assert(fs.existsSync(dest))
        assert(fs.lstatSync(dest).isDirectory())
      })
    })
  })
})
