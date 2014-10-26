var testutil = require('testutil')
var fs = require('../')
var path = require('path')
var assert = require('assert')
var rimraf = require('rimraf')

var terst = require('terst')

var TEST_DIR = ''

// makes fs.rename return cross-device error.
var mock_fs = {};
mock_fs.rename = function(src, dest, cb) {
  setTimeout(function() {
    var err = new Error();
    err.code = 'EXDEV';
    cb(err);
  }, 10);
};

describe('fs-extra', function() {
  /*beforeEach(function() {
    TEST_DIR = testutil.createTestDir('fs-extra');
  })

  afterEach(function(done) {
    fs.remove(TEST_DIR, done);
  })*/

  describe("move", function() {
    
    it("should rename a file on the same device", function (done) {
      fs.move("test/a-file", "test/a-file-dest", function (err) {
        assert.ifError(err);
        fs.readFile("test/a-file-dest", 'utf8', function (err, contents) {
          assert.ifError(err);
          assert.strictEqual(contents, "sonic the hedgehog\n");
          // move it back
          fs.move("test/a-file-dest", "test/a-file", done);
        });
      });
    });

    it("should not overwrite if clobber = false", function (done) {
      fs.move("test/a-file", "test/a-folder/another-file", {clobber: false}, function (err) {
        assert.ok(err && err.code === 'EEXIST', "throw EEXIST");
        done();
      });
    });

    it("should not create directory structure if mkdirp is false", function (done) {
      fs.move("test/a-file", "test/does/not/exist/a-file-dest", {mkdirp: false}, function (err) {
        assert.strictEqual(err.code, 'ENOENT');
        done();
      });
    });

    it("should create directory structure by default", function (done) {
      fs.move("test/a-file", "test/does/not/exist/a-file-dest", function (err) {
        assert.ifError(err);
        fs.readFile("test/does/not/exist/a-file-dest", 'utf8', function (err, contents) {
          assert.ifError(err);
          assert.strictEqual(contents, "sonic the hedgehog\n");
          // move it back
          fs.move("test/does/not/exist/a-file-dest", "test/a-file", function(err) {
            assert.ifError(err);
            rimraf("test/does", done);
          });
        });
      });
    });

    it("should work across devices", function (done) {
      var oldRename = fs.rename
      fs.rename = mock_fs.rename

      fs.move("test/a-file", "test/a-file-dest", function (err) {
        assert.ifError(err);
        fs.readFile("test/a-file-dest", 'utf8', function (err, contents) {
          assert.ifError(err);
          assert.strictEqual(contents, "sonic the hedgehog\n");
          // move it back
          fs.move("test/a-file-dest", "test/a-file", done);

          //restore
          fs.rename = oldRename
        });
      });
    });

    it("should move folders", function (done) {
      fs.move("test/a-folder", "test/a-folder-dest", function (err) {
        assert.ifError(err);
        fs.readFile("test/a-folder-dest/another-file", 'utf8', function (err, contents) {
          assert.ifError(err);
          assert.strictEqual(contents, "tails\n");
          // move it back
          fs.move("test/a-folder-dest", "test/a-folder", done);
        });
      });
    });

    it("should move folders across devices", function (done) {
      var oldRename = fs.rename
      fs.rename = mock_fs.rename

      fs.move("test/a-folder", "test/a-folder-dest", function (err) {
        assert.ifError(err);
        fs.readFile("test/a-folder-dest/another-folder/file3", 'utf8', function (err, contents) {
          assert.ifError(err);
          assert.strictEqual(contents, "knuckles\n");
          // move it back
          fs.move("test/a-folder-dest", "test/a-folder", done);

          //restore
          fs.rename = oldRename
        });
      });
    });
  });
})



