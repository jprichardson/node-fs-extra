'use strict'

const fs = require('fs')
const fse = require('../../')
const path = require('path')
const assert = require('assert')

/* global describe, it */

describe('mkdirp / root', () => {
  // '/' on unix, 'c:/' on windows.
  const dir = path.normalize(path.resolve(path.sep)).toLowerCase()

  // if not 'c:\\' or 'd:\\', it's probably a network mounted drive, this fails then. TODO: investigate
  if (process.platform === 'win32' && (dir.indexOf('c:\\') === -1) && (dir.indexOf('d:\\') === -1)) return

  it('should', done => {
    fse.mkdirp(dir, 0o755, err => {
      if (err) throw err
      fs.stat(dir, (er, stat) => {
        if (er) throw er
        assert.ok(stat.isDirectory(), 'target is a directory')
        done()
      })
    })
  })
})
