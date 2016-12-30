var assert = require('assert')
var fs = require('fs')
var path = require('path')
var os = require('os')
var fse = require(process.cwd())

/* global afterEach, beforeEach, describe, it */

describe('move / overwrite', function () {
  var TEST_DIR, FIXTURES_DIR

  beforeEach(function (done) {
    TEST_DIR = path.join(os.tmpdir(), 'fs-extra', 'move')
    fse.emptyDir(TEST_DIR, function (err) {
      assert.ifError(err)

      FIXTURES_DIR = path.join(TEST_DIR, 'fixtures')
      fse.remove(FIXTURES_DIR, function (err) {
        assert.ifError(err)
        fse.copy(path.join(__dirname, './fixtures'), FIXTURES_DIR, done)
      })
    })
  })

  afterEach(function (done) {
    fse.remove(TEST_DIR, done)
  })

  describe('> when overwrite = true', function () {
    describe('> when dest is a directory', function () {
      it('should overwrite the destination', function (done) {
        // Tests fail on appveyor/Windows due to
        // https://github.com/isaacs/node-graceful-fs/issues/98.
        // Workaround by increasing the timeout by a minute (because
        // graceful times out after a minute).
        this.timeout(90000)

        // use fixtures dir as dest since it has stuff
        var dest = FIXTURES_DIR
        var paths = fs.readdirSync(dest)

        // verify dest has stuff
        assert(paths.indexOf('a-file') >= 0)
        assert(paths.indexOf('a-folder') >= 0)

        // create new source dir
        var src = path.join(TEST_DIR, 'src')
        fse.ensureDirSync(src)
        fse.mkdirsSync(path.join(src, 'some-folder'))
        fs.writeFileSync(path.join(src, 'some-file'), 'hi')

        // verify source has stuff
        paths = fs.readdirSync(src)
        assert(paths.indexOf('some-file') >= 0)
        assert(paths.indexOf('some-folder') >= 0)

        fse.move(src, dest, {overwrite: true}, function (err) {
          if (err) return done(err)

          // verify dest does not have old stuff
          var paths = fs.readdirSync(dest)
          assert.strictEqual(paths.indexOf('a-file'), -1)
          assert.strictEqual(paths.indexOf('a-folder'), -1)

          // verify dest has new stuff
          assert(paths.indexOf('some-file') >= 0)
          assert(paths.indexOf('some-folder') >= 0)

          done()
        })
      })
    })
  })
  describe('> clobber', function () {
    it('is an alias for overwrite', function (done) {
      // Tests fail on appveyor/Windows due to
      // https://github.com/isaacs/node-graceful-fs/issues/98.
      // Workaround by increasing the timeout by a minute (because
      // graceful times out after a minute).
      this.timeout(90000)

      // use fixtures dir as dest since it has stuff
      var dest = FIXTURES_DIR
      var paths = fs.readdirSync(dest)

      // verify dest has stuff
      assert(paths.indexOf('a-file') >= 0)

      // create new source dir
      var src = path.join(TEST_DIR, 'src')
      fse.ensureDirSync(src)
      fs.writeFileSync(path.join(src, 'some-file'), 'hi')

      // verify source has stuff
      paths = fs.readdirSync(src)
      assert(paths.indexOf('some-file') >= 0)

      fse.move(src, dest, {clobber: true}, function (err) {
        if (err) return done(err)

        // verify dest does not have old stuff
        var paths = fs.readdirSync(dest)
        assert.strictEqual(paths.indexOf('a-file'), -1)

        // verify dest has new stuff
        assert(paths.indexOf('some-file') >= 0)

        done()
      })
    })
  })
})
