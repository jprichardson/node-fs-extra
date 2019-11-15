'use strict'

const u = require('universalify').fromCallback
function copyMethodsFactory (fs) {
  return {
    copy: u(require('./copy')(fs))
  }
}

module.exports = copyMethodsFactory
