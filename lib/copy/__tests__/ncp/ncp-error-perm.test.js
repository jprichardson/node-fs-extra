// file in reference: https://github.com/jprichardson/node-fs-extra/issues/56

var assert = require('assert')
var fs = require('fs')
var path = require('path')
var os = require('os')
var fse = require(process.cwd())
var ncp = require('../../ncp')

/* global afterEach, beforeEach, describe, it */

// skip test for windows
// eslint-disable globalReturn */
// if (os.platform().indexOf('win') === 0) return
// eslint-enable globalReturn */

describe('ncp / error / dest-permission', function () {
  var TEST_DIR = path.join(os.tmpdir(), 'fs-extra', 'ncp-error-dest-perm')
  var src = path.join(TEST_DIR, 'src')
  var dest = path.join(TEST_DIR, 'dest')

  if (os.platform().indexOf('win') === 0) return

  beforeEach(function (done) {
    fse.emptyDir(TEST_DIR, function (err) {
      assert.ifError(err)
      done()
    })
  })

  afterEach(function (done) {
    fse.remove(TEST_DIR, done)
  })

  it('should return an error', function (done) {
    var someFile = path.join(src, 'some-file')
    fse.outputFileSync(someFile, 'hello')

    fse.mkdirsSync(dest)
    fs.chmodSync(dest, parseInt('444', 8))

    var subdest = path.join(dest, 'another-dir')

    ncp(src, subdest, function (err) {
      assert(err)
      assert.equal(err[0].code, 'EACCES')
      done()
    })
  })
})
