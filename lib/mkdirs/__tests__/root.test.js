'use strict'

const fs = require('fs')
const fse = require('../../')
const path = require('path')
const assert = require('assert')

/* global describe, it */

describe('mkdirp / root', () => {
  // '/' on unix
  const dir = path.normalize(path.resolve(path.sep)).toLowerCase()

  // Windows does not have permission to mkdir on root
  if (process.platform === 'win32') return

  it('should', done => {
    fse.mkdirp(dir, 0o755, err => {
      if (err) return done(err)
      fs.stat(dir, (er, stat) => {
        if (er) return done(er)
        assert.ok(stat.isDirectory(), 'target is a directory')
        done()
      })
    })
  })
})
