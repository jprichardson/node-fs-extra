'use strict'

const u = require('universalify').fromCallback
const _rimraf = require('./rimraf')

module.exports = fs => {
  const rimraf = _rimraf(fs)

  return {
    remove: u(rimraf),
    removeSync: rimraf.sync
  }
}
