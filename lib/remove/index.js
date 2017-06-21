'use strict'

const u = require('../promises').fromCallback
const rimraf = require('./rimraf')

module.exports = {
  remove: u(rimraf),
  removeSync: rimraf.sync
}
