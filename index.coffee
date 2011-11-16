fs = require('fs')

#fs-extra
copy = require('./lib/copy')
fs.copyFileSync = copy.copyFileSync
fs.copyFile = copy.copyFile

module.exports = fs