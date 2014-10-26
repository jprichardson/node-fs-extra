var testutil = require('testutil')
var fs = require('../')
var path = require('path')

var TEST_DIR = ''

var terst = require('terst')

describe('fs-extra', function() {
  beforeEach(function() {
    TEST_DIR = testutil.createTestDir('fs-extra');
  })

  afterEach(function(done) {
    fs.remove(TEST_DIR, done);
  })

  describe('+ ensureFile()', function() {
    describe('> when file exists', function() {
      it('should not do anything', function(done) {
        var file = path.join(TEST_DIR, 'file.txt')
        fs.writeFileSync(file, 'blah')

        T (fs.existsSync(file))
        fs.ensureFile(file, function(err) {
          F (err)
          T (fs.existsSync(file))
          done()
        })
      })
    })

    describe('> when file does not exist', function() {
      it('should create the file', function(done) {
        var file = path.join(TEST_DIR, 'dir/that/does/not/exist', 'file.txt')

        F (fs.existsSync(file))
        fs.ensureFile(file, function(err) {
          F (err)
          T (fs.existsSync(file))
          done()
        })
      })
    })
  })

  describe('+ ensureFileSync()', function() {
    describe('> when file exists', function() {
      it('should not do anything', function() {
        var file = path.join(TEST_DIR, 'file.txt')
        fs.writeFileSync(file, 'blah')

        T (fs.existsSync(file))
        fs.ensureFileSync(file)
        T (fs.existsSync(file))
      })
    })

    describe('> when file does not exist', function() {
      it('should create the file', function() {
        var file = path.join(TEST_DIR, 'dir/that/does/not/exist', 'file.txt')

        F (fs.existsSync(file))
        fs.ensureFileSync(file)
        T (fs.existsSync(file))
      })
    })
  })

  describe('+ ensureDir()', function() {
    describe('> when dir exists', function() {
      it('should not do anything', function(done) {
        var dir = path.join(TEST_DIR, 'dir/does/not/exist')
        fs.mkdirpSync(dir)

        T (fs.existsSync(dir))
        fs.ensureDir(dir, function(err) {
          F (err)
          T (fs.existsSync(dir))
          done()
        })
      })
    })

    describe('> when dir does not exist', function() {
      it('should create the dir', function(done) {
        var dir = path.join(TEST_DIR, 'dir/that/does/not/exist')

        F (fs.existsSync(dir))
        fs.ensureDir(dir, function(err) {
          F (err)
          T (fs.existsSync(dir))
          done()
        })
      })
    })
  })

  describe('+ ensureDirSync()', function() {
    describe('> when dir exists', function() {
      it('should not do anything', function() {
        var dir = path.join(TEST_DIR, 'dir/does/not/exist')
        fs.mkdirpSync(dir)

        T (fs.existsSync(dir))
        fs.ensureDirSync(dir)
        T (fs.existsSync(dir))
      })
    })

    describe('> when dir does not exist', function() {
      it('should create the dir', function() {
        var dir = path.join(TEST_DIR, 'dir/that/does/not/exist')

        F (fs.existsSync(dir))
        fs.ensureDirSync(dir)
        T (fs.existsSync(dir))
      })
    })
  })
})

