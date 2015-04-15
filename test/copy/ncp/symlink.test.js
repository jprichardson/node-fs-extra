var assert = require('assert')
var fs = require('fs')
var path = require('path')
var rimraf = require('rimraf')
var ncp = require('../../../lib/_copy').ncp

/* global beforeEach, describe, it */

var fixturesDir = path.join(__dirname, 'fixtures')

describe('ncp / symlink', function () {
  var fixtures = path.join(fixturesDir, 'symlink-fixtures')
  var src = path.join(fixtures, 'src')
  var out = path.join(fixtures, 'out')

  beforeEach(function (cb) {
    rimraf(out, cb)
  })

  it('copies symlinks by default', function (cb) {
    ncp(src, out, function (err) {
      if (err) return cb(err)
      assert.equal(fs.readlinkSync(path.join(out, 'file-symlink')), 'foo')
      assert.equal(fs.readlinkSync(path.join(out, 'dir-symlink')), 'dir')
      cb()
    })
  })

  it('copies file contents when dereference=true', function (cb) {
    ncp(src, out, { dereference: true }, function (err) {
      assert(!err)
      var fileSymlinkPath = path.join(out, 'file-symlink')
      assert.ok(fs.lstatSync(fileSymlinkPath).isFile())
      assert.equal(fs.readFileSync(fileSymlinkPath), 'foo contents')

      var dirSymlinkPath = path.join(out, 'dir-symlink')
      assert.ok(fs.lstatSync(dirSymlinkPath).isDirectory())
      assert.deepEqual(fs.readdirSync(dirSymlinkPath), ['bar'])

      cb()
    })
  })
})
