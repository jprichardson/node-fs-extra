// relevant: https://github.com/jprichardson/node-fs-extra/issues/89
// come up with better file name

var fs = require('fs')
var path = require('path')
var os = require('os')
var fse = require(process.cwd())

/* global afterEach, beforeEach, describe, it */

describe('copy / gh #89', function () {
  var TEST_DIR = path.join(os.tmpdir(), 'fs-extra', 'copy-gh-89')

  beforeEach(function (done) {
    fse.emptyDir(TEST_DIR, done)
  })

  afterEach(function (done) {
    fse.remove(TEST_DIR, done)
  })

  it('should...', function (done) {
    var A = path.join(TEST_DIR, 'A')
    var B = path.join(TEST_DIR, 'B')
    fs.mkdirSync(A)
    fs.mkdirSync(B)

    var one = path.join(A, 'one.txt')
    var two = path.join(A, 'two.txt')
    var three = path.join(B, 'three.txt')
    var four = path.join(B, 'four.txt')

    fs.writeFileSync(one, '1')
    fs.writeFileSync(two, '2')
    fs.writeFileSync(three, '3')
    fs.writeFileSync(four, '4')

    // shit
    // TODO: decide behavior
    done()
  })
})
