var assert = require('assert')
var fs = require('fs')
var path = require('path')
var fse = require('../')
var testutil = require('testutil')

/* global afterEach, beforeEach, describe, it */

var TEST_DIR = ''

describe('read', function () {
  beforeEach(function () {
    TEST_DIR = testutil.createTestDir('fs-extra')
  })

  afterEach(function (done) {
    fse.remove(TEST_DIR, done)
  })

  describe('+ readJSON', function () {
    it('should read a file and parse the json', function (done) {
      var obj1 = {
        firstName: 'JP',
        lastName: 'Richardson'
      }

      var file = path.join(TEST_DIR, 'file.json')
      fs.writeFileSync(file, JSON.stringify(obj1))
      fse.readJSON(file, function (err, obj2) {
        assert.ifError(err)
        assert.strictEqual(obj1.firstName, obj2.firstName)
        assert.strictEqual(obj1.lastName, obj2.lastName)

        done()
      })
    })

    it('should error if it cant parse the json', function (done) {
      var file = path.join(TEST_DIR, 'file2.json')
      fs.writeFileSync(file, '%asdfasdff444')
      fse.readJSON(file, function (err, obj) {
        assert(err)
        assert(!obj)
        done()
      })
    })
  })
})
