"use strict"

var fs = null
  , path = require('path')
  , jsonFile = require('jsonfile')
  , json = require('./json')
  , fse = {};

try {
  // optional dependency
  fs = require("graceful-fs")
} catch (er) {
  fs = require("fs")
}

Object.keys(fs).forEach(function(key) {
  var func = fs[key];
  if (typeof func == 'function')
    fse[key] = func;
});

fs = fse;

// copy

fs.copy = require('./copy').copy;
fs.copySync = require('./copy').copySync;


// remove

var remove = require('./remove');
fs.remove = remove.remove;
fs.removeSync = remove.removeSync;
fs['delete'] = fs.remove
fs.deleteSync = fs.removeSync

// mkdir

var mkdir = require('./mkdir')
fs.mkdirs = mkdir.mkdirs
fs.mkdirsSync = mkdir.mkdirsSync
fs.mkdirp = mkdir.mkdirs
fs.mkdirpSync = mkdir.mkdirsSync

// create

var create = require('./create')
fs.createFile = create.createFile;
fs.createFileSync = create.createFileSync;


// ensure

var ensure = require('./ensure')
fs.ensureFile = create.createFile
fs.ensureFileSync = create.createFileSync

fs.ensureDir = mkdir.mkdirs
fs.ensureDirSync = mkdir.mkdirsSync


// move

var move = require('./move')
fs.move = function(src, dest, opts, callback) {
  if (typeof opts == 'function') {
    callback = opts
    opts = {}
  }

  if (opts.mkdirp == null) opts.mkdirp = true
  if (opts.clobber == null) opts.clobber = false

  move(src, dest, opts, callback)
}

//deprecated
fs.touch = function touch() {
  console.log('fs.touch() is deprecated. Please use fs.createFile().')
  fs.createFile.apply(null, arguments)
}

fs.touchSync = function touchSync() {
  console.log('fs.touchSync() is deprecated. Please use fs.createFileSync().')
  fs.createFileSync.apply(null, arguments)
}

// output

var output = require('./output');
fs.outputFile = output.outputFile;
fs.outputFileSync = output.outputFileSync;

// read

/*fs.readTextFile = function(file, callback) {
  return fs.readFile(file, 'utf8', callback)
}

fs.readTextFileSync = function(file, callback) {
  return fs.readFileSync(file, 'utf8')
}*/

// json files

fs.readJsonFile = jsonFile.readFile;
fs.readJSONFile = jsonFile.readFile;
fs.readJsonFileSync = jsonFile.readFileSync;
fs.readJSONFileSync = jsonFile.readFileSync;

fs.readJson = jsonFile.readFile;
fs.readJSON = jsonFile.readFile;
fs.readJsonSync = jsonFile.readFileSync;
fs.readJSONSync = jsonFile.readFileSync;

fs.outputJsonSync = json.outputJsonSync;
fs.outputJSONSync = json.outputJsonSync;
fs.outputJson = json.outputJson;
fs.outputJSON = json.outputJson;

fs.writeJsonFile = jsonFile.writeFile;
fs.writeJSONFile = jsonFile.writeFile;
fs.writeJsonFileSync = jsonFile.writeFileSync;
fs.writeJSONFileSync = jsonFile.writeFileSync;

fs.writeJson = jsonFile.writeFile;
fs.writeJSON = jsonFile.writeFile;
fs.writeJsonSync = jsonFile.writeFileSync;
fs.writeJSONSync = jsonFile.writeFileSync;

// emptydir
var emptydir = require('./emptydir');
fs.emptyDir = emptydir.emptyDir;
fs.emptyDirs = emptydir.emptyDirs;
fs.emptyDirsSync = emptydir.emptyDirsSync;


module.exports = fs

jsonFile.spaces = 2; //set to 2
module.exports.jsonfile = jsonFile; //so users of fs-extra can modify jsonFile.spaces;

