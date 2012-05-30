fs = require('fs')
path = require('path')

#fs-extra
copy = require('./copy')
#fs.copyFileSync = copy.copyFileSync
#fs.copyFile = copy.copyFile
fs.copy = copy.copy

remove = require('./remove')
#fs.rmrfSync = remove.rmrfSync
#fs.rmrf = remove.rmrf
fs.remove = remove.remove
fs.removeSync = remove.removeSync

#make compatible for Node v0.8
if not fs.exists?
  fs.exists = path.exists
if not fs.existsSync?
  fs.existsSync = path.existsSync

module.exports = fs