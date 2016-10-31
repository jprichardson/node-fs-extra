var assign = require('./util/assign')

var fse = {}
var gfs = require('graceful-fs')

// attach fs methods to fse
Object.keys(gfs).forEach(function (key) {
  fse[key] = gfs[key]
})

var fs = fse

assign(fs, require('./copy/index.js'))
assign(fs, require('./copy-sync/index.js'))
assign(fs, require('./mkdirs/index.js'))
assign(fs, require('./remove/index.js'))
assign(fs, require('./json/index.js'))
assign(fs, require('./move/index.js'))
assign(fs, require('./empty/index.js'))
assign(fs, require('./ensure/index.js'))
assign(fs, require('./output/index.js'))
assign(fs, require('./walk/index.js'))

module.exports = fs

// maintain backwards compatibility for awhile
var jsonfile = {}
Object.defineProperty(jsonfile, 'spaces', {
  get: function () {
    return fs.spaces // found in ./json
  },
  set: function (val) {
    fs.spaces = val
  }
})

module.exports.jsonfile = jsonfile // so users of fs-extra can modify jsonFile.spaces
