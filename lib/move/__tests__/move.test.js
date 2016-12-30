var assert = require('assert')
var os = require('os')
var path = require('path')
var rimraf = require('rimraf')
var fs = require('graceful-fs')
var fse = require(process.cwd())

/* global afterEach, beforeEach, describe, it */

var FIXTURES_DIR = ''
var SRC_FIXTURES_DIR = path.join(__dirname, './fixtures')

function createAsyncErrFn (errCode) {
  var fn = function () {
    fn.callCount++
    var callback = arguments[arguments.length - 1]
    setTimeout(function () {
      var err = new Error()
      err.code = errCode
      callback(err)
    }, 10)
  }
  fn.callCount = 0
  return fn
}

var originalRename = fs.rename
var originalLink = fs.link

function setUpMockFs (errCode) {
  fs.rename = createAsyncErrFn(errCode)
  fs.link = createAsyncErrFn(errCode)
}

function tearDownMockFs () {
  fs.rename = originalRename
  fs.link = originalLink
}

describe('move', function () {
  var TEST_DIR

  beforeEach(function () {
    TEST_DIR = path.join(os.tmpdir(), 'fs-extra', 'move')

    fse.emptyDirSync(TEST_DIR)

    FIXTURES_DIR = path.join(TEST_DIR, 'fixtures')
    fse.copySync(SRC_FIXTURES_DIR, FIXTURES_DIR)
  })

  afterEach(function (done) {
    rimraf(TEST_DIR, done)
  })

  it('should rename a file on the same device', function (done) {
    var src = FIXTURES_DIR + '/a-file'
    var dest = FIXTURES_DIR + '/a-file-dest'

    fse.move(src, dest, function (err) {
      assert.ifError(err)
      fs.readFile(dest, 'utf8', function (err, contents) {
        var expected = /^sonic the hedgehog\r?\n$/
        assert.ifError(err)
        assert.ok(contents.match(expected), contents + ' match ' + expected)
        done()
      })
    })
  })

  it('should not overwrite if overwrite = false', function (done) {
    var src = FIXTURES_DIR + '/a-file'
    var dest = FIXTURES_DIR + '/a-folder/another-file'

    // verify file exists already
    assert(fs.existsSync(dest))

    fse.move(src, dest, {overwrite: false}, function (err) {
      assert.ok(err && err.code === 'EEXIST', 'throw EEXIST')
      done()
    })
  })

  it('should not create directory structure if mkdirp is false', function (done) {
    var src = FIXTURES_DIR + '/a-file'
    var dest = FIXTURES_DIR + '/does/not/exist/a-file-dest'

    // verify dest directory does not exist
    assert(!fs.existsSync(path.dirname(dest)))

    fse.move(src, dest, {mkdirp: false}, function (err) {
      assert.strictEqual(err.code, 'ENOENT')
      done()
    })
  })

  it('should create directory structure by default', function (done) {
    var src = FIXTURES_DIR + '/a-file'
    var dest = FIXTURES_DIR + '/does/not/exist/a-file-dest'

    // verify dest directory does not exist
    assert(!fs.existsSync(path.dirname(dest)))

    fse.move(src, dest, function (err) {
      assert.ifError(err)
      fs.readFile(dest, 'utf8', function (err, contents) {
        var expected = /^sonic the hedgehog\r?\n$/
        assert.ifError(err)
        assert.ok(contents.match(expected), contents + ' match ' + expected)
        done()
      })
    })
  })

  it('should work across devices', function (done) {
    var src = FIXTURES_DIR + '/a-file'
    var dest = FIXTURES_DIR + '/a-file-dest'

    setUpMockFs('EXDEV')

    fse.move(src, dest, function (err) {
      assert.ifError(err)
      assert.strictEqual(fs.link.callCount, 1)

      fs.readFile(dest, 'utf8', function (err, contents) {
        var expected = /^sonic the hedgehog\r?\n$/
        assert.ifError(err)
        assert.ok(contents.match(expected), contents + ' match ' + expected)

        tearDownMockFs()
        done()
      })
    })
  })

  it('should move folders', function (done) {
    var src = FIXTURES_DIR + '/a-folder'
    var dest = FIXTURES_DIR + '/a-folder-dest'

    // verify it doesn't exist
    assert(!fs.existsSync(dest))

    fse.move(src, dest, function (err) {
      assert.ifError(err)
      fs.readFile(dest + '/another-file', 'utf8', function (err, contents) {
        var expected = /^tails\r?\n$/
        assert.ifError(err)
        assert.ok(contents.match(expected), contents + ' match ' + expected)
        done()
      })
    })
  })

  it('should move folders across devices with EISDIR erro', function (done) {
    var src = FIXTURES_DIR + '/a-folder'
    var dest = FIXTURES_DIR + '/a-folder-dest'

    setUpMockFs('EISDIR')

    fse.move(src, dest, function (err) {
      assert.ifError(err)
      assert.strictEqual(fs.link.callCount, 1)

      fs.readFile(dest + '/another-folder/file3', 'utf8', function (err, contents) {
        var expected = /^knuckles\r?\n$/
        assert.ifError(err)
        assert.ok(contents.match(expected), contents + ' match ' + expected)

        tearDownMockFs('EISDIR')

        done()
      })
    })
  })

  it('should overwrite folders across devices', function (done) {
    var src = FIXTURES_DIR + '/a-folder'
    var dest = FIXTURES_DIR + '/a-folder-dest'

    fs.mkdirSync(dest)

    setUpMockFs('EXDEV')

    fse.move(src, dest, {overwrite: true}, function (err) {
      assert.ifError(err)
      assert.strictEqual(fs.rename.callCount, 1)

      fs.readFile(dest + '/another-folder/file3', 'utf8', function (err, contents) {
        var expected = /^knuckles\r?\n$/
        assert.ifError(err)
        assert.ok(contents.match(expected), contents + ' match ' + expected)

        tearDownMockFs('EXDEV')

        done()
      })
    })
  })

  it('should move folders across devices with EXDEV error', function (done) {
    var src = FIXTURES_DIR + '/a-folder'
    var dest = FIXTURES_DIR + '/a-folder-dest'

    setUpMockFs('EXDEV')

    fse.move(src, dest, function (err) {
      assert.ifError(err)
      assert.strictEqual(fs.link.callCount, 1)

      fs.readFile(dest + '/another-folder/file3', 'utf8', function (err, contents) {
        var expected = /^knuckles\r?\n$/
        assert.ifError(err)
        assert.ok(contents.match(expected), contents + ' match ' + expected)

        tearDownMockFs()

        done()
      })
    })
  })

  describe.skip('> when trying to a move a folder into itself', function () {
    it('should produce an error', function (done) {
      var SRC_DIR = path.join(TEST_DIR, 'test')
      var DEST_DIR = path.join(TEST_DIR, 'test', 'test')

      assert(!fs.existsSync(SRC_DIR))
      fs.mkdirSync(SRC_DIR)
      assert(fs.existsSync(SRC_DIR))

      fse.move(SRC_DIR, DEST_DIR, function (err) {
        assert(fs.existsSync(SRC_DIR))
        assert(err)
        done()
      })
    })
  })

  // tested on Linux ubuntu 3.13.0-32-generic #57-Ubuntu SMP i686 i686 GNU/Linux
  // this won't trigger a bug on Mac OS X Yosimite with a USB drive (/Volumes)
  // see issue #108
  describe('> when actually trying to a move a folder across devices', function () {
    var differentDevice = '/mnt'
    var __skipTests = false

    // must set this up, if not, exit silently
    if (!fs.existsSync(differentDevice)) {
      console.log('Skipping cross-device move test')
      __skipTests = true
    }

    // make sure we have permission on device
    try {
      fs.writeFileSync(path.join(differentDevice, 'file'), 'hi')
    } catch (err) {
      console.log("Can't write to device. Skipping test.")
      __skipTests = true
    }

    var _it = __skipTests ? it.skip : it

    describe('> just the folder', function () {
      _it('should move the folder', function (done) {
        var src = '/mnt/some/weird/dir-really-weird'
        var dest = path.join(TEST_DIR, 'device-weird')

        if (!fs.existsSync(src)) {
          fse.mkdirpSync(src)
        }

        assert(!fs.existsSync(dest))

        assert(fs.lstatSync(src).isDirectory())

        fse.move(src, dest, function (err) {
          assert.ifError(err)
          assert(fs.existsSync(dest))
          // console.log(path.normalize(dest))
          assert(fs.lstatSync(dest).isDirectory())
          done()
        })
      })
    })
  })
})
