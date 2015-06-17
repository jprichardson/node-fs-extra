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

var create = require('./create')
fs.createFile = create.createFile
fs.createFileSync = create.createFileSync

fs.ensureFile = create.createFile
fs.ensureFileSync = create.createFileSync

var createOutputStream = require('./create-output-stream')
fs.createOutputStream = createOutputStream.createOutputStream
fs.createOutputStreamSync = createOutputStream.createOutputStreamSync

var output = require('./output')
fs.outputFile = output.outputFile
fs.outputFileSync = output.outputFileSync

var empty = require('./empty-dir')
Object.keys(empty).forEach(function (method) {
  fs[method] = empty[method]
})

module.exports = fs

var jsonFile = require('jsonfile')
jsonFile.spaces = 2 // set to 2
module.exports.jsonfile = jsonFile // so users of fs-extra can modify jsonFile.spaces
