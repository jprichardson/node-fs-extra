'use strict'

const u = require('universalify').fromCallback
const memoize = require('memoize-weak')
const rimrafFactory = require('./rimraf')

function removeFactory (fs) {
  const rimraf = rimrafFactory(fs)
  return {
    remove: u(rimraf),
    removeSync: rimraf.sync
  }
}

module.exports = memoize(removeFactory)
