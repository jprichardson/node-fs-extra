'use strict'

const assign = require('./util/assign')

const prep = fs_ => {
  const fs = {}

  // Export fs:
  assign(fs, require('./fs')(fs_))
  // Export extra methods:
  assign(fs, require('./copy')(fs_))
  assign(fs, require('./copy-sync')(fs_))
  assign(fs, require('./mkdirs')(fs_))
  assign(fs, require('./remove')(fs_))
  assign(fs, require('./json')(fs_))
  assign(fs, require('./move')(fs_))
  assign(fs, require('./move-sync')(fs_))
  assign(fs, require('./empty')(fs_))
  assign(fs, require('./ensure')(fs_))
  assign(fs, require('./output')(fs_))
  assign(fs, require('./path-exists')(fs_))

  return fs
}

module.exports = prep(require('graceful-fs'))
