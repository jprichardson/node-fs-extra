var assert = require('assert')
var fs = require('fs')
var os = require('os')
var path = require('path')
var fse = require(process.cwd())

/* global beforeEach, describe, it */

describe('json', function () {
  var TEST_DIR

  beforeEach(function (done) {
    TEST_DIR = path.join(os.tmpdir(), 'fs-extra')
    fse.emptyDir(TEST_DIR, done)
  })

  describe('+ outputJson(file, data)', function () {
    var outputJson = require('../output-json')

    it('should write the file regardless of whether the directory exists or not', function (done) {
      var file = path.join(TEST_DIR, 'this-dir', 'prob-does-not', 'exist', 'file.json')
      assert(!fs.existsSync(file))

      var data = {name: 'JP'}
      outputJson(file, data, function (err) {
        if (err) return done(err)

        assert(fs.existsSync(file))
        var newData = JSON.parse(fs.readFileSync(file, 'utf8'))

        assert.equal(data.name, newData.name)
        done()
      })
    })

    describe('> when an option is passed, like JSON replacer', function () {
      it('should pass the option along to jsonfile module', function (done) {
        var file = path.join(TEST_DIR, 'this-dir', 'does-not', 'exist', 'really', 'file.json')
        assert(!fs.existsSync(file))

        var replacer = function (k, v) { if (v === 'JP') return 'Jon Paul'; else return v }
        var data = {name: 'JP'}

        outputJson(file, data, {replacer: replacer}, function (err) {
          assert.ifError(err)
          var newData = JSON.parse(fs.readFileSync(file, 'utf8'))
          assert.equal(newData.name, 'Jon Paul')
          done()
        })
      })
    })
  })
})
