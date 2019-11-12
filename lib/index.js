'use strict'
const fs = require('fs')

function FsExtra (baseFs) {
  this._fs = baseFs
}

Object.assign(
  FsExtra.prototype,
  // Export promiseified graceful-fs:
  require('./fs'),
  // Export extra methods:
  require('./copy-sync'),
  require('./copy'),
  require('./empty'),
  require('./ensure'),
  require('./json'),
  require('./mkdirs'),
  require('./move-sync'),
  require('./move'),
  require('./output'),
  require('./path-exists'),
  require('./remove')
)

// Export fs.promises as a getter property so that we don't trigger
// ExperimentalWarning before fs.promises is actually accessed.
if (Object.getOwnPropertyDescriptor(fs, 'promises')) {
  Object.defineProperty(FsExtra.prototype, 'promises', {
    get () {
      return fs.promises
    }
  })
}

// Backwards compatibility: Default export is an instance using the real FS
module.exports = new FsExtra(fs)
module.exports.FsExtra = FsExtra
