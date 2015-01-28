var assert = require('assert')
var path = require('path')
var rimraf = require('rimraf')
var fs =  require('fs')
var fse = require('../')
var testutil = require('./lib/util')

var TEST_DIR = ''
var FIXTURES_DIR = ''
var SRC_FIXTURES_DIR = 'test/fixtures/move'

// makes fs.rename return cross-device error.
var mock_fs = {}
mock_fs.rename = function(src, dest, callback) {
  setTimeout(function() {
    var err = new Error()
    err.code = 'EXDEV'
    callback(err)
  }, 10)
}

describe("move", function() {
  beforeEach(function() {
    TEST_DIR = testutil.createTestDir('fs-extra')
    TEST_DIR = path.join(TEST_DIR, 'move')
    if (!fs.existsSync(TEST_DIR))
      fs.mkdirSync(TEST_DIR)
    FIXTURES_DIR = path.join(TEST_DIR, 'fixtures')
    fse.copySync(SRC_FIXTURES_DIR, FIXTURES_DIR)
  })

  afterEach(function() {
    rimraf.sync(TEST_DIR)
  })

  it("should rename a file on the same device", function (done) {
    var src = FIXTURES_DIR + '/a-file'
    var dest = FIXTURES_DIR + '/a-file-dest'

    fse.move(src, dest, function (err) {
      assert.ifError(err)
      fs.readFile(dest, 'utf8', function (err, contents) {
        assert.ifError(err)
        assert.strictEqual(contents, "sonic the hedgehog\n")
        done()
      })
    })
  })

  it("should not overwrite if clobber = false", function (done) {
    var src = FIXTURES_DIR + "/a-file"
    var dest = FIXTURES_DIR + "/a-folder/another-file" 

    // verify file exists already
    assert(fs.existsSync(dest))

    fse.move(src, dest, {clobber: false}, function (err) {
      assert.ok(err && err.code === 'EEXIST', "throw EEXIST")
      done()
    })
  })

  it("should not create directory structure if mkdirp is false", function (done) {
    var src = FIXTURES_DIR + "/a-file"
    var dest = FIXTURES_DIR + "/does/not/exist/a-file-dest"

    // verify dest directory does not exist
    assert(!fs.existsSync(path.dirname(dest)))

    fse.move(src, dest, {mkdirp: false}, function (err) {
      assert.strictEqual(err.code, 'ENOENT')
      done()
    })
  })

  it("should create directory structure by default", function (done) {
    var src = FIXTURES_DIR + "/a-file"
    var dest = FIXTURES_DIR + "/does/not/exist/a-file-dest" 

    // verify dest directory does not exist
    assert(!fs.existsSync(path.dirname(dest)))

    fse.move(src, dest, function (err) {
      assert.ifError(err)
      fs.readFile(dest, 'utf8', function (err, contents) {
        assert.ifError(err)
        assert.strictEqual(contents, "sonic the hedgehog\n")
        done()
      })
    })
  })

  it("should work across devices", function (done) {
    var src = FIXTURES_DIR + "/a-file"
    var dest = FIXTURES_DIR + "/a-file-dest"

    var oldRename = fs.rename
    fs.rename = mock_fs.rename

    fse.move(src, dest, function (err) {
      assert.ifError(err)
      fs.readFile(dest, 'utf8', function (err, contents) {
        assert.ifError(err)
        assert.strictEqual(contents, "sonic the hedgehog\n")
        
        // restore
        fs.rename = oldRename

        done()
      })
    })
  })

  it("should move folders", function (done) {
    var src = FIXTURES_DIR + "/a-folder"
    var dest = FIXTURES_DIR + "/a-folder-dest"

    // verify it doesn't exist
    assert(!fs.existsSync(dest))

    fse.move(src, dest, function (err) {
      assert.ifError(err)
      fs.readFile(dest + "/another-file", 'utf8', function (err, contents) {
        assert.ifError(err)
        assert.strictEqual(contents, "tails\n")
        done()  
      })
    })
  })

  it("should move folders across devices", function (done) {
    var src = FIXTURES_DIR + "/a-folder"
    var dest = FIXTURES_DIR + "/a-folder-dest"

    var oldRename = fs.rename
    fs.rename = mock_fs.rename

    fse.move(src, dest, function (err) {
      assert.ifError(err)
      fs.readFile(dest + "/another-folder/file3", 'utf8', function (err, contents) {
        assert.ifError(err)
        assert.strictEqual(contents, "knuckles\n")
        
        // restore
        fs.rename = oldRename
      
        done()
      })
    })
  })

  describe('> when trying to a move a folder into itself', function() {
    it('should produce an error', function(done) {
      var SRC_DIR = path.join(TEST_DIR, 'test')
      var DEST_DIR = path.join(TEST_DIR, 'test', 'test')

      assert(!fs.existsSync(SRC_DIR))
      fs.mkdirSync(SRC_DIR)
      assert(fs.existsSync(SRC_DIR))

      fse.move(SRC_DIR, DEST_DIR, function(err) {
        assert(fs.existsSync(SRC_DIR))        
        assert(err)
        done()
      })
    })
  })

  // tested on Linux ubuntu 3.13.0-32-generic #57-Ubuntu SMP i686 i686 GNU/Linux
  // this won't trigger a bug on Mac OS X Yosimite with a USB drive (/Volumes)
  describe('> when actually trying to a move a folder across devices', function() {
    it('should move the folder', function(done) {
      var differentDevice = '/mnt'

      // must set this up, if not, exit silently
      if (!fs.existsSync(differentDevice)) {
        console.log('Skipping cross-device move test')
        return done()
      }

      // make sure we have permission on device
      try {
        fs.writeFileSync(path.join(differentDevice, 'file'), 'hi')
      } catch (err) {
        console.log("Can't write to device. Skipping test.")
        return
      }

      var src = '/mnt/some/weird/dir-really-weird'
      var dest = path.join(TEST_DIR, 'device-weird')

      if (!fs.existsSync(src))
        fse.mkdirpSync(src)

      assert(!fs.existsSync(dest))

      assert(fs.lstatSync(src).isDirectory())

      fse.move(src, dest, function(err) {
        assert.ifError(err)
        assert(fs.existsSync(dest))
        //console.log(path.normalize(dest))
        assert(fs.lstatSync(dest).isDirectory())
        done()
      })
    })
  })
})




