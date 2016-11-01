var assert = require('assert')
var path = require('path')

var fse = require('../../')

/* global describe, it */
var fixturesDir = path.join(__dirname, 'fixtures')

describe('walk-sync', function () {
  it('should return an error if the source dir does not exist', function (done) {
    try {
      fse.walkSync('dirDoesNotExist/')
    } catch (err) {
      assert.equal(err.code, 'ENOENT')
    } finally {
      done()
    }
  })

  it('should return an error if the source is not a dir', function (done) {
    try {
      fse.walkSync(path.join(fixturesDir, 'dir1/file1_2'))
    } catch (err) {
      assert.equal(err.code, 'ENOTDIR')
    } finally {
      done()
    }
  })

  it('should return all files successfully for a dir', function (done) {
    var files = fse.walkSync(fixturesDir)
    var expectedFiles = ['dir1/file1_2', 'dir2/dir2_1/file2_1_1', 'file1']
    expectedFiles = expectedFiles.map(function (item) {
      return path.join(fixturesDir, item)
    })
    files.forEach(function (elem, i) {
      assert.equal(elem, expectedFiles[i])
    })
    done()
  })
})
