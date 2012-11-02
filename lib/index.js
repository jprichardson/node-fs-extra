var fs = require('fs')
  , path = require('path')
  , jsonFile = require('jsonfile')
  , fse = {};

for (var funcName in fs) {
    var func = fs[funcName];
    if (fs.hasOwnProperty(funcName)) {
        if (typeof func == 'function')
            fse[funcName] = func;
    }
}

fs = fse;

fs.copy = require('./copy').copy;

var remove = require('./remove');
fs.remove = remove.remove;
fs.removeSync = remove.removeSync;
fs['delete'] = fs.remove
fs.deleteSync = fs.removeSync

var mkdir = require('./mkdir')
fs.mkdirs = mkdir.mkdirs
fs.mkdirsSync = mkdir.mkdirsSync
fs.mkdirp = mkdir.mkdirs
fs.mkdirpSync = mkdir.mkdirsSync

var touch = require('./touch')
fs.touch = touch.touch;
fs.touchSync = touch.touchSync;

fs.readJsonFile = jsonFile.readFile;
fs.readJSONFile = jsonFile.readFile;
fs.readJsonFileSync = jsonFile.readFileSync;
fs.readJSONFileSync = jsonFile.readFileSync;

fs.writeJsonFile = jsonFile.writeFile;
fs.writeJSONFile = jsonFile.writeFile;
fs.writeJsonFileSync = jsonFile.writeFileSync;
fs.writeJSONFileSync = jsonFile.writeFileSync;

//make compatible for Node v0.8
if (typeof fs.exists == 'undefined')
  fs.exists = path.exists
if  (typeof fs.existsSync == 'undefined')
  fs.existsSync = path.existsSync

module.exports = fs
module.exports.jsonfile = jsonFile; //so users of fs-extra can modify jsonFile.spaces;

