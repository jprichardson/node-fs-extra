// This is adapted from https://github.com/normalize/mz
// Copyright (c) 2014-2016 Jonathan Ong me@jongleberry.com and Contributors
const u = require('../promises').fromCallback
const fs = require('graceful-fs')
const boundUtilPromisify = require('util.promisify')

const api = [
  'access',
  'appendFile',
  'chmod',
  'chown',
  'close',
  'fchmod',
  'fchown',
  'fdatasync',
  'fstat',
  'fsync',
  'ftruncate',
  'futimes',
  'lchown',
  'link',
  'lstat',
  'mkdir',
  'open',
  'read',
  'readFile',
  'readdir',
  'readlink',
  'realpath',
  'rename',
  'rmdir',
  'stat',
  'symlink',
  'truncate',
  'unlink',
  'utimes',
  'write',
  'writeFile'
]
// fs.mkdtemp() was added in Node.js v5.10.0, so check if it exists
typeof fs.mkdtemp === 'function' && api.push('mkdtemp')

// Export all keys:
Object.keys(fs).forEach(key => {
  exports[key] = fs[key]
})

// NOTE: Currently graceful-fs does not use nor it emulates `util.promisify`.
//       So we make sure to always return the node-v8 version of things here:

// Create the special promise generator for the `read` function according to the docs
exports['read'][boundUtilPromisify.custom] = (function (fn) {
  return function () {
    return new Promise((resolve, reject) => {
      arguments[arguments.length] = (err, bytesRead, buffer) => {
        if (err) return reject(err)
        // Build result according to docs
        resolve({bytesRead, buffer})
      }
      arguments.length++
      fn.apply(this, arguments)
    })
  }
})(exports['read'])

// Create the special promise generator for the `write` function according to the docs
exports['write'][boundUtilPromisify.custom] = (function (fn) {
  return function () {
    return new Promise((resolve, reject) => {
      arguments[arguments.length] = (err, bytesWritten, buffer) => {
        if (err) return reject(err)
        // Build result according to docs
        resolve({bytesWritten, buffer})
      }
      arguments.length++
      fn.apply(this, arguments)
    })
  }
})(exports['write'])

// Make all async methods support both callbacks and Promises
api.forEach(method => {
  exports[method] = u(fs[method])
})

// We differ from mz/fs in that we still ship the old, broken, fs.exists()
// since we are a drop-in replacement for the native module
exports.exists = function (filename, callback) {
  if (typeof callback === 'function') {
    return fs.exists(filename, callback)
  }
  return new Promise(resolve => {
    return fs.exists(filename, resolve)
  })
}
