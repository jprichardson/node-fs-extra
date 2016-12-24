var assert = require('assert')
var fs = require('fs')
var path = require('path')
var rimraf = require('rimraf')
var readDirFiles = require('read-dir-files').read // temporary, will remove
var ncp = require('../../ncp')

/* eslint-env mocha */

var fixturesDir = path.join(__dirname, 'fixtures')

describe('ncp', function () {
  describe('regular files and directories', function () {
    var fixtures = path.join(fixturesDir, 'regular-fixtures')
    var src = path.join(fixtures, 'src')
    var out = path.join(fixtures, 'out')

    before(function (cb) {
      rimraf(out, function () {
        ncp(src, out, cb)
      })
    })

    describe('when copying a directory of files', function () {
      it('files are copied correctly', function (cb) {
        readDirFiles(src, 'utf8', function (srcErr, srcFiles) {
          readDirFiles(out, 'utf8', function (outErr, outFiles) {
            assert.ifError(srcErr)
            assert.deepEqual(srcFiles, outFiles)
            cb()
          })
        })
      })
    })

    describe('when copying files using filter', function () {
      before(function (cb) {
        var filter = function (name) {
          return name.substr(name.length - 1) !== 'a'
        }
        rimraf(out, function () {
          ncp(src, out, {filter: filter}, cb)
        })
      })

      it('files are copied correctly', function (cb) {
        readDirFiles(src, 'utf8', function (srcErr, srcFiles) {
          function filter (files) {
            for (var fileName in files) {
              var curFile = files[fileName]
              if (curFile instanceof Object) {
                return filter(curFile)
              }

              if (fileName.substr(fileName.length - 1) === 'a') {
                delete files[fileName]
              }
            }
          }
          filter(srcFiles)
          readDirFiles(out, 'utf8', function (outErr, outFiles) {
            assert.ifError(outErr)
            assert.deepEqual(srcFiles, outFiles)
            cb()
          })
        })
      })
    })

    describe('when using clobber=true', function () {
      before(function () {
        this.originalCreateReadStream = fs.createReadStream
      })

      after(function () {
        fs.createReadStream = this.originalCreateReadStream
      })

      it('the copy is complete after callback', function (done) {
        ncp(src, out, {clobber: true}, function (err) {
          fs.createReadStream = function () {
            done(new Error('createReadStream after callback'))
          }
          assert.ifError(err)
          process.nextTick(done)
        })
      })
    })

    describe('when using clobber=false', function () {
      beforeEach(function (done) {
        rimraf(out, done)
      })
      it('works', function (cb) {
        ncp(src, out, {clobber: false}, function (err) {
          assert.ifError(err)
          cb()
        })
      })
      it('should not error if files exist', function (cb) {
        ncp(src, out, function () {
          ncp(src, out, {clobber: false}, function (err) {
            assert.ifError(err)
            cb()
          })
        })
      })
      it('should error if errorOnExist and file exists', function (cb) {
        ncp(src, out, function () {
          ncp(src, out, {
            clobber: false,
            errorOnExist: true
          }, function (err) {
            assert(err)
            cb()
          })
        })
      })
    })

    describe('when using transform', function () {
      it('file descriptors are passed correctly', function (cb) {
        ncp(src, out, {
          transform: function (read, write, file) {
            assert.notEqual(file.name, undefined)
            assert.strictEqual(typeof file.mode, 'number')
            read.pipe(write)
          }
        }, cb)
      })
    })
  })

  // see https://github.com/AvianFlu/ncp/issues/71
  describe('Issue 71: Odd Async Behaviors', function (cb) {
    var fixtures = path.join(__dirname, 'fixtures', 'regular-fixtures')
    var src = path.join(fixtures, 'src')
    var out = path.join(fixtures, 'out')

    var totalCallbacks = 0

    function copyAssertAndCount (callback) {
      // rimraf(out, function() {
      ncp(src, out, function (err) {
        assert(!err)
        totalCallbacks += 1
        readDirFiles(src, 'utf8', function (srcErr, srcFiles) {
          readDirFiles(out, 'utf8', function (outErr, outFiles) {
            assert.ifError(srcErr)
            assert.deepEqual(srcFiles, outFiles)
            callback()
          })
        })
      })
      // })
    }

    describe('when copying a directory of files without cleaning the destination', function () {
      it('callback fires once per run and directories are equal', function (done) {
        var expected = 10
        var count = 10

        function next () {
          if (count > 0) {
            setTimeout(function () {
              copyAssertAndCount(function () {
                count -= 1
                next()
              })
            }, 100)
          } else {
            // console.log('Total callback count is', totalCallbacks)
            assert.equal(totalCallbacks, expected)
            done()
          }
        }

        next()
      })
    })
  })
})
