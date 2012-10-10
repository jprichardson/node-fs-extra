var fs = require('../lib')
  , testutil = require('testutil')
  , path = require('path');

var DIR = '';

describe('fs-extra', function() {
  beforeEach(function(done) {
    DIR = testutil.createTempDir();
    done();
  })

  afterEach(function(done) {
    fs.remove(DIR, done);
  })

  describe('+ readJSONFile', function() {
    it('should read a file and parse the json', function(done) {
      var obj1 = {
        firstName: 'JP',
        lastName: 'Richardson'
      };
      var file = path.join(DIR, 'file.json');
      
      fs.writeFileSync(file, JSON.stringify(obj1));
      
      fs.readJSONFile(file, function(err, obj2) {
        F (err != null);
        T (obj1.firstName === obj2.firstName);
        T (obj1.lastName === obj2.lastName);
        
        done();
      })
    })

    it('should error if it cant parse the json', function(done) {
      var file = path.join(DIR, 'file2.json');
      fs.writeFileSync(file, '%asdfasdff444');
      fs.readJSONFile(file, function(err, obj) {
        T (err != null);
        F (obj);
        done();
      })
    })
  })

})


