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

  it('should return all items of a dir containing path and stats data successfully', function (done) {
    var items = fse.walkSync(fixturesDir)
    var files = ['dir1/file1_2', 'dir2/dir2_1/file2_1_1', 'file1']
    files = files.map(function (item) {
      return path.join(fixturesDir, item)
    })
    var dirs = ['dir1', 'dir2', 'dir2/dir2_1']
    dirs = dirs.map(function (item) {
      return path.join(fixturesDir, item)
    })
    var expectedItems = [
      {path: dirs[0], stats: fse.lstatSync(dirs[0])},
      {path: files[0], stats: fse.lstatSync(files[0])},
      {path: dirs[1], stats: fse.lstatSync(dirs[1])},
      {path: dirs[2], stats: fse.lstatSync(dirs[2])},
      {path: files[1], stats: fse.lstatSync(files[1])},
      {path: files[2], stats: fse.lstatSync(files[2])}
    ]
    items.forEach(function (elem, i) {
      assert.deepEqual(elem, expectedItems[i])
      assert.strictEqual(elem.path, expectedItems[i].path)
      assert.deepEqual(elem.stats, expectedItems[i].stats)
    })
    done()
  })
})
