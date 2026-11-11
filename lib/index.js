'use strict'

module.exports = {
  // Export promiseified graceful-fs:
  ...require('./fs'),
  // Export extra methods:
  ...require('./copy'),
  ...require('./empty'),
  ...require('./ensure'),
  ...require('./is-empty-dir'),
  ...require('./json'),
  ...require('./mkdirs'),
  ...require('./move'),
  ...require('./output-file'),
  ...require('./path-exists'),
  ...require('./remove')
}
