'use strict'

const u = require('universalify').fromCallback
function moveFactory (fs) {
  return {
    move: u(require('./move')(fs))
  }
}

module.exports = moveFactory
