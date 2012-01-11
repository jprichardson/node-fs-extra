fs = require('fs')

#fs-extra
copy = require('./lib/copy')
fs.copyFileSync = copy.copyFileSync
fs.copyFile = copy.copyFile

remove = require('./lib/remove')
fs.rmrfSync = remove.rmrfSync
fs.rmrf = remove.rmrf

module.exports = fs