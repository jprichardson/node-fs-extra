var assert = require('assert')
var path = require('path')
var os = require('os')
var fse = require('../../')
var fixtures = require('./fixtures')

/* global afterEach, beforeEach, describe, it */
// trinity: mocha

describe('walk()', function () {
  var TEST_DIR

  beforeEach(function (done) {
    TEST_DIR = path.join(os.tmpdir(), 'fs-extra', 'walk')
    fse.emptyDir(TEST_DIR, function (err) {
      if (err) return done(err)
      fixtures.forEach(function (f) {
        f = path.join(TEST_DIR, f)
        fse.outputFileSync(f, path.basename(f, path.extname(f)))
      })
      done()
    })
  })

  afterEach(function (done) {
    fse.remove(TEST_DIR, done)
  })

  it('should work w/ streams 1', function (done) {
    var items = []
    fse.walk(TEST_DIR)
      .on('data', function (item) {
        assert.strictEqual(typeof item.stats, 'object') // verify that property is there
        items.push(item.path)
      })
      .on('end', function () {
        items.sort()
        var expected = ['a', 'a/b', 'a/b/c', 'a/b/c/d.txt', 'a/e.jpg', 'h', 'h/i', 'h/i/j',
          'h/i/j/k.txt', 'h/i/l.txt', 'h/i/m.jpg']
        expected = expected.map(function (item) {
          return path.join(path.join(TEST_DIR, item))
        })
        expected.unshift(TEST_DIR)

        assert.deepEqual(items, expected)
        done()
      })
  })

  it('should work w/ streams 2/3', function (done) {
    var items = []
    fse.walk(TEST_DIR)
      .on('readable', function () {
        var item
        while ((item = this.read())) {
          assert.strictEqual(typeof item.stats, 'object') // verify that property is there
          items.push(item.path)
        }
      })
      .on('end', function () {
        items.sort()
        var expected = ['a', 'a/b', 'a/b/c', 'a/b/c/d.txt', 'a/e.jpg', 'h', 'h/i', 'h/i/j',
          'h/i/j/k.txt', 'h/i/l.txt', 'h/i/m.jpg']
        expected = expected.map(function (item) {
          return path.join(path.join(TEST_DIR, item))
        })
        expected.unshift(TEST_DIR)

        assert.deepEqual(items, expected)
        done()
      })
  })
})
