// This is adapted from https://github.com/normalize/mz
// Copyright (c) 2014-2016 Jonathan Ong me@jongleberry.com and Contributors
const u = require('universalify').fromCallback
const fs = require('graceful-fs')

const api = [
  'rename',
  'ftruncate',
  'chown',
  'fchown',
  'lchown',
  'chmod',
  'fchmod',
  'stat',
  'lstat',
  'fstat',
  'link',
  'symlink',
  'readlink',
  'realpath',
  'unlink',
  'rmdir',
  'mkdir',
  'readdir',
  'close',
  'open',
  'utimes',
  'futimes',
  'fsync',
  'fdatasync',
  'write',
  'read',
  'readFile',
  'writeFile',
  'appendFile',
  'truncate'
]
// fs.mkdtemp() was added in Node.js v5.10.0, so check if it exists
typeof fs.mkdtemp === 'function' && api.push('mkdtemp')

// Export all keys:
Object.keys(fs).forEach(key => {
  exports[key] = fs[key]
})

// Universalify async methods:
api.forEach(method => {
  exports[method] = u(fs[method])
})

// We differ from mz/fs in that we still ship the old, broken, fs.exists()
// since we are a drop-in replacement for the native module
exports.exists = function (filename, callback) {
  if (typeof callback === 'function') {
    return fs.exists(filename, function (exists) {
      callback(exists)
    })
  }
  return new Promise(function (resolve) {
    return fs.exists(filename, function (exists) {
      resolve(exists)
    })
  })
}
