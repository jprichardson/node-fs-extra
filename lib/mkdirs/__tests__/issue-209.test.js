var assert = require('assert')
var fse = require(process.cwd())

/* global describe, it */

describe('mkdirp: issue-209, win32, when bad path, should return a cleaner error', function () {
  // only seems to be an issue on Windows.
  if (process.platform !== 'win32') return

  it('should return a callback', function (done) {
    var file = './bad?dir'
    fse.mkdirp(file, function (err) {
      assert(err, 'error is present')
      assert.strictEqual(err.code, 'EINVAL')

      var file2 = 'c:\\tmp\foo:moo'
      fse.mkdirp(file2, function (err) {
        assert(err, 'error is present')
        assert.strictEqual(err.code, 'EINVAL')
        done()
      })
    })
  })

  describe('> sync', function () {
    it('should throw an error', function () {
      var didErr
      try {
        var file = 'c:\\tmp\foo:moo'
        fse.mkdirpSync(file)
      } catch (err) {
        // console.error(err)
        didErr = true
      }
      assert(didErr)
    })
  })
})
