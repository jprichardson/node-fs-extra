'use strict'
/* eslint-disable node/no-deprecated-api */
module.exports = function (size) {
  if (typeof Buffer.allocUnsafe === 'function') {
    try {
      return Buffer.allocUnsafe(size)
    } catch {
      return new Buffer(size)
    }
  }
  return new Buffer(size)
}
