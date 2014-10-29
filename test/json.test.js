var fs = require('fs')
var path = require('path')
var testutil = require('testutil')
var terst = require('terst')
var fse = require('../')

var TEST_DIR = null

describe('json', function() {
  beforeEach(function() {
    TEST_DIR = testutil.createTestDir('fs-extra')    
  })

  afterEach(function(done) {
    fse.remove(TEST_DIR, done)
  })

  describe('+ outputJsonSync(file, data)', function() {
    it('should write the file regardless of whether the directory exists or not', function() {
      var file = path.join(TEST_DIR, 'this-dir', 'does-not', 'exist', 'file.json')
      F (fs.existsSync(file))

      var data = {name: 'JP'}
      fse.outputJsonSync(file, data)
      
      T (fs.existsSync(file))
      var newData = JSON.parse(fs.readFileSync(file, 'utf8'))

      EQ (data.name, newData.name)
    })
  })

  describe('+ outputJson(file, data)', function() {
    it('should write the file regardless of whether the directory exists or not', function(done) {
      var file = path.join(TEST_DIR, 'this-dir', 'prob-does-not', 'exist', 'file.json')
      F (fs.existsSync(file))

      var data = {name: 'JP'}
      fse.outputJson(file, data, function(err) {
        if (err) return done(err)

        T (fs.existsSync(file))
        var newData = JSON.parse(fs.readFileSync(file, 'utf8'))

        EQ (data.name, newData.name)
        done()
      })
    })
  })
})
