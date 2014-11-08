var assert = require('assert')
var path = require('path')
var rimraf = require('rimraf')
var fs = require('../')

var TEST_DIR = ''
var FIXTURES_DIR = 'test/fixtures'

// makes fs.rename return cross-device error.
var mock_fs = {}
mock_fs.rename = function(src, dest, cb) {
  setTimeout(function() {
    var err = new Error()
    err.code = 'EXDEV'
    cb(err)
  }, 10)
}


describe("move", function() {
  it("should rename a file on the same device", function (done) {
    fs.move(FIXTURES_DIR + '/a-file', FIXTURES_DIR + '/a-file-dest', function (err) {
      assert.ifError(err)
      fs.readFile(FIXTURES_DIR + "/a-file-dest", 'utf8', function (err, contents) {
        assert.ifError(err)
        assert.strictEqual(contents, "sonic the hedgehog\n")
        // move it back
        fs.move(FIXTURES_DIR + "/a-file-dest", FIXTURES_DIR + "/a-file", done)
      })
    })
  })

  it("should not overwrite if clobber = false", function (done) {
    fs.move(FIXTURES_DIR + "/a-file", FIXTURES_DIR + "/a-folder/another-file", {clobber: false}, function (err) {
      assert.ok(err && err.code === 'EEXIST', "throw EEXIST")
      done()
    })
  })

  it("should not create directory structure if mkdirp is false", function (done) {
    fs.move(FIXTURES_DIR + "/a-file", FIXTURES_DIR + "/does/not/exist/a-file-dest", {mkdirp: false}, function (err) {
      assert.strictEqual(err.code, 'ENOENT')
      done()
    })
  })

  it("should create directory structure by default", function (done) {
    fs.move(FIXTURES_DIR + "/a-file", FIXTURES_DIR + "/does/not/exist/a-file-dest", function (err) {
      assert.ifError(err)
      fs.readFile(FIXTURES_DIR + "/does/not/exist/a-file-dest", 'utf8', function (err, contents) {
        assert.ifError(err)
        assert.strictEqual(contents, "sonic the hedgehog\n")
        // move it back
        fs.move(FIXTURES_DIR + "/does/not/exist/a-file-dest", FIXTURES_DIR + "/a-file", function(err) {
          assert.ifError(err)
          rimraf(FIXTURES_DIR + "/does", done)
        })
      })
    })
  })

  it("should work across devices", function (done) {
    var oldRename = fs.rename
    fs.rename = mock_fs.rename

    fs.move(FIXTURES_DIR + "/a-file", FIXTURES_DIR + "/a-file-dest", function (err) {
      assert.ifError(err)
      fs.readFile(FIXTURES_DIR + "/a-file-dest", 'utf8', function (err, contents) {
        assert.ifError(err)
        assert.strictEqual(contents, "sonic the hedgehog\n")
        // move it back
        fs.move(FIXTURES_DIR + "/a-file-dest", FIXTURES_DIR + "/a-file", done)

        //restore
        fs.rename = oldRename
      })
    })
  })

  it("should move folders", function (done) {
    fs.move(FIXTURES_DIR + "/a-folder", FIXTURES_DIR + "/a-folder-dest", function (err) {
      assert.ifError(err)
      fs.readFile(FIXTURES_DIR + "/a-folder-dest/another-file", 'utf8', function (err, contents) {
        assert.ifError(err)
        assert.strictEqual(contents, "tails\n")
        // move it back
        fs.move(FIXTURES_DIR + "/a-folder-dest", FIXTURES_DIR + "/a-folder", done)
      })
    })
  })

  it("should move folders across devices", function (done) {
    var oldRename = fs.rename
    fs.rename = mock_fs.rename

    fs.move(FIXTURES_DIR + "/a-folder", FIXTURES_DIR + "/a-folder-dest", function (err) {
      assert.ifError(err)
      fs.readFile(FIXTURES_DIR + "/a-folder-dest/another-folder/file3", 'utf8', function (err, contents) {
        assert.ifError(err)
        assert.strictEqual(contents, "knuckles\n")
        // move it back
        fs.move(FIXTURES_DIR + "/a-folder-dest", FIXTURES_DIR + "/a-folder", done)

        //restore
        fs.rename = oldRename
      })
    })
  })
})




