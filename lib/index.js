'use strict'
const realFs = require('graceful-fs')
const buildPartialFs = require('./util/build-partial-fs')

// Each decorator is a function which builds some of the final fs object.
const decorators = [
  require('./fs'),
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
]

function FsExtra (baseFs) {
  Object.assign(this, buildPartialFs(baseFs, ...decorators))

  // Export fs.promises as a getter property so that we don't trigger
  // ExperimentalWarning before fs.promises is actually accessed.
  if (Object.getOwnPropertyDescriptor(baseFs, 'promises')) {
    Object.defineProperty(this, 'promises', {
      get () {
        return baseFs.promises
      }
    })
  }
}

// Backwards compatibility: Default export is an instance using the real FS
module.exports = new FsExtra(realFs)
module.exports.FsExtra = FsExtra
