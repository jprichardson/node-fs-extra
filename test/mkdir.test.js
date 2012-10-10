var fs = require('../lib')
  , path = require('path-extra')
  , testutil = require('testutil');

describe('fs-extra', function() {
  
  describe('+ mkdir()', function() {
    it('should make the directory', function(done) {
      var dir = path.join(path.tempdir(), 'tmp-' + Date.now() + Math.random());
      
      F (fs.existsSync(dir));
      
      fs.mkdir(dir, function(err) {
        T (err === null);
        T (fs.existsSync(dir));
        
        done();
      })
    })
    
    it('should make the entire directory path', function(done) {
      var dir = path.join(path.tempdir(), 'tmp-' + Date.now() + Math.random())
        , newDir = path.join(dir, 'dfdf', 'ffff', 'aaa');
      
      F (fs.existsSync(dir));
      
      fs.mkdir(newDir, function(err) {
        T (err === null);
        T (fs.existsSync(newDir));
        
        done();
      });
    })
  })
  
  describe('+ mkdirSync()', function() {
    it('should make the directory', function(done) {
      var dir = path.join(path.tempdir(), 'tmp-' + Date.now() + Math.random());
      
      F (fs.existsSync(dir));
      fs.mkdirSync(dir);
      T (fs.existsSync(dir));
      
      done();
    })

    it('should make the entire directory path', function(done) {
      var dir = path.join(path.tempdir(), 'tmp-' + Date.now() + Math.random())
        , newDir = path.join(dir, 'dfdf', 'ffff', 'aaa');
      
      F (fs.existsSync(dir));
      fs.mkdirSync(dir);
      T (fs.existsSync(dir));
      
      done();
    })
  })

})


