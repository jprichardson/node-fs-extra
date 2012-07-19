fs = require('fs')
path = require('path')

fse = {}

for key,val of fs
  if typeof val is 'function'
    fse[key] = val

fs = fse

#fs-extra
copy = require('./copy')
fs.copy = copy.copy

remove = require('./remove')
fs.remove = remove.remove
fs.removeSync = remove.removeSync
fs.delete = fs.remove
fs.deleteSync = fs.removeSync

mkdir = require('./mkdir')
fs.mkdir = mkdir.mkdir
fs.mkdirSync = mkdir.mkdirSync

#make compatible for Node v0.8
if not fs.exists?
  fs.exists = path.exists
if not fs.existsSync?
  fs.existsSync = path.existsSync

module.exports = fs