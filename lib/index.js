var assign = require('./util/assign')

var fse = {}
var gfs = require('graceful-fs')

// attach fs methods to fse
Object.keys(gfs).forEach(function (key) {
  fse[key] = gfs[key]
})

var fs = fse

assign(fs, require('./copy'))
assign(fs, require('./mkdirs'))
assign(fs, require('./remove'))
assign(fs, require('./json'))
assign(fs, require('./move'))
assign(fs, require('./streams'))
assign(fs, require('./empty-dir'))

var create = require('./create')
fs.createFile = create.createFile
fs.createFileSync = create.createFileSync

fs.ensureFile = create.createFile
fs.ensureFileSync = create.createFileSync

var output = require('./output')
fs.outputFile = output.outputFile
fs.outputFileSync = output.outputFileSync

module.exports = fs

var jsonFile = require('jsonfile')
jsonFile.spaces = 2 // set to 2
module.exports.jsonfile = jsonFile // so users of fs-extra can modify jsonFile.spaces
