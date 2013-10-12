"use strict"

var fs = require('fs')
  , ncp = require('ncp').ncp
  , path = require('path')
  , mkdir = require('./mkdir'),
    create = require('./create')

module.exports.copy = copy;
module.exports.copySync = copySync;

var BUF_LENGTH = 64 * 1024
var _buff = new Buffer(BUF_LENGTH)

var copyFileSync = function(srcFile, destFile) {
  var bytesRead, fdr, fdw, pos;
  fdr = fs.openSync(srcFile, 'r');
  fdw = fs.openSync(destFile, 'w');
  bytesRead = 1;
  pos = 0;
  while (bytesRead > 0) {
    bytesRead = fs.readSync(fdr, _buff, 0, BUF_LENGTH, pos);
    fs.writeSync(fdw, _buff, 0, bytesRead);
    pos += bytesRead;
  }
  fs.closeSync(fdr);
  return fs.closeSync(fdw);
}

function copy(src, dest, callback) {
  callback = callback || function(){}

  fs.lstat(src, function(err, stats) {
    if (err) callback(err)

    var dir = null
    if (stats.isDirectory()) {
      var parts = dest.split(path.sep)
      parts.pop()
      dir = parts.join(path.sep)
    } else {
      dir = path.dirname(dest)
    }

    fs.exists(dir, function(dirExists) {
      if (dirExists) return ncp(src, dest, callback)
      mkdir.mkdirs(dir, function(err) {
        if (err) return callback(err)
        ncp(src, dest, callback)
      })
    })
  })
}

function copySync(src, dest) {
  var stats = fs.lstatSync(src),
      destExists = fs.exists(dest);
  if (stats.isFile()) {
    if (!destExists) create.createFileSync(dest);
    copyFileSync(src, dest);
  }
  else if (stats.isDirectory()) {
    if (!destExists) mkdir.mkdirsSync(dest);
    var contents = fs.readdirSync(src);
    contents.forEach(function (content) {
      copySync(src + "/" + content, dest + "/" + content);
    });
  }
}

