var fs = require('../lib')
  , path = require('path-extra')
  , testutil = require('testutil');

var TEST_DIR = ''

var testMkdirsWithLimit = function(limit, should_pass, done) {
  var newDir = path.join(TEST_DIR, 'dfdf', 'ffff', 'aaa');
  // should work the same way with dangling seperators
  var another = path.join(TEST_DIR, 'dfdf', 'ffff', 'bbb', '');
  
  F (fs.existsSync(newDir));
  F (fs.existsSync(another));
  
  fs.mkdirs(newDir, limit, function(err) {
  	if (should_pass) {
  	  if (err !== null) { throw new Error('unexpected error: ' + err); }
	  T (fs.existsSync(newDir));
    } else {
      F (err === null);
      F (fs.existsSync(newDir));
    }
    fs.mkdirs(another, limit, function(err) {
	  if (should_pass) {
	    if (err !== null) { throw new Error('unexpected error: ' + err); }
	    T (fs.existsSync(another));
	  } else {
	    F (err === null);
	    F (fs.existsSync(another));
	  }
	  done();
    });
  });
};

var testMkdirsSyncWithLimit = function(limit, should_pass, done) {
  var newDir = path.join(TEST_DIR, 'dfdf', 'ffff', 'aaa');
  // should work the same way with dangling seperators
  var another = path.join(TEST_DIR, 'dfdf', 'ffff', 'bbb', '');
  
  F (fs.existsSync(newDir));
  F (fs.existsSync(another));

  try {
	fs.mkdirsSync(newDir, limit);
  } catch (err) {
  	if (should_pass) { throw new Error('unexpected error: ' + err); }
  }
  if (should_pass) {
	T (fs.existsSync(newDir));
  } else {
    F (fs.existsSync(newDir));
  }
  try {
	fs.mkdirsSync(another, limit);
  } catch (err) {
  	if (should_pass) { throw new Error('unexpected error: ' + err); }
  }
  if (should_pass) {
	T (fs.existsSync(another));
  } else {
    F (fs.existsSync(another));
  }

  done();
}

describe('fs-extra', function() {
  beforeEach(function() {
    TEST_DIR = testutil.createTestDir('fs-extra')
  })

  describe('+ mkdirs()', function() {
    it('should make the directory', function(done) {
      var dir = path.join(TEST_DIR, 'tmp-' + Date.now() + Math.random());
      
      F (fs.existsSync(dir));
      
      fs.mkdirs(dir, function(err) {
        T (err === null);
        T (fs.existsSync(dir));
        
        done();
      })
    })
    
    it('should make the entire directory path', function(done) {
      var newDir = path.join(TEST_DIR, 'dfdf', 'ffff', 'aaa');
      
      F (fs.existsSync(newDir));
      
      fs.mkdirs(newDir, function(err) {
        T (err === null);
        T (fs.existsSync(newDir));
        
        done();
      });
    })
    
    it('should make the entire directory path with limit 2', function(done) {
      testMkdirsWithLimit(2, true, done);
    })

    it('should make the entire directory path with limit -1', function(done) {
      testMkdirsWithLimit(-1, true, done);
    })

    it('should make the entire directory path with limit null', function(done) {
      testMkdirsWithLimit(null, true, done);
    })

    it('should refuse to make the entire directory path with limit 0', function(done) {
      testMkdirsWithLimit(0, false, done);
    })
    
    it('should refuse to make the entire directory path with limit 1', function(done) {
      testMkdirsWithLimit(1, false, done);
    })
    
  })
  
  describe('+ mkdirsSync()', function() {
    it('should make the directory', function(done) {
      var dir = path.join(TEST_DIR, 'tmp-' + Date.now() + Math.random());
      
      F (fs.existsSync(dir));
      fs.mkdirsSync(dir);
      T (fs.existsSync(dir));
      
      done();
    })

    it('should make the entire directory path', function(done) {
      var dir = path.join(TEST_DIR, 'tmp-' + Date.now() + Math.random())
        , newDir = path.join(dir, 'dfdf', 'ffff', 'aaa');
      
      F (fs.existsSync(dir));
      fs.mkdirsSync(dir);
      T (fs.existsSync(dir));
      
      done();
    })
    
    it('should make the entire directory path with limit 2', function(done) {
      testMkdirsSyncWithLimit(2, true, done);
    })

    it('should make the entire directory path with limit -1', function(done) {
      testMkdirsSyncWithLimit(-1, true, done);
    })

    it('should make the entire directory path with limit null', function(done) {
      testMkdirsSyncWithLimit(null, true, done);
    })

    it('should refuse to make the entire directory path with limit 0', function(done) {
      testMkdirsSyncWithLimit(0, false, done);
    })
    
    it('should refuse to make the entire directory path with limit 1', function(done) {
      testMkdirsSyncWithLimit(1, false, done);
    })
  })

})


