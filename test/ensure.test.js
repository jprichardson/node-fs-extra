var testutil = require('testutil')
var fs = require('../')
var path = require('path')

var TEST_DIR = ''

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
})

