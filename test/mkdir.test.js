var fs = require('fs')
var path = require('path')
var testutil = require('testutil')
var terst = require('terst')
var fse = require('../')

var TEST_DIR = ''

describe('fs-extra', function() {
  beforeEach(function() {
    TEST_DIR = testutil.createTestDir('fs-extra')
  })

  afterEach(function(done) {
    fse.remove(TEST_DIR, done)
  })

  describe('+ mkdirs()', function() {
    it('should make the directory', function(done) {
      var dir = path.join(TEST_DIR, 'tmp-' + Date.now() + Math.random())
      
      F (fs.existsSync(dir))
      
      fse.mkdirs(dir, function(err) {
        T (err === null)
        T (fs.existsSync(dir))
        
        done()
      })
    })
    
    it('should make the entire directory path', function(done) {
      var dir = path.join(TEST_DIR, 'tmp-' + Date.now() + Math.random())
      var newDir = path.join(TEST_DIR, 'dfdf', 'ffff', 'aaa')
      
      F (fs.existsSync(dir))
      
      fse.mkdirs(newDir, function(err) {
        T (err === null)
        T (fs.existsSync(newDir))
        
        done()
      })
    })
  })
  
  describe('+ mkdirsSync()', function() {
    it('should make the directory', function(done) {
      var dir = path.join(TEST_DIR, 'tmp-' + Date.now() + Math.random())
      
      F (fs.existsSync(dir))
      fse.mkdirsSync(dir)
      T (fs.existsSync(dir))
      
      done()
    })

    it('should make the entire directory path', function(done) {
      var dir = path.join(TEST_DIR, 'tmp-' + Date.now() + Math.random())
      var newDir = path.join(dir, 'dfdf', 'ffff', 'aaa')
      
      F (fs.existsSync(dir))
      fse.mkdirsSync(dir)
      T (fs.existsSync(dir))
      
      done()
    })
  })

})


