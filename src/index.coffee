fs = require('fs')

#fs-extra
copy = require('./copy')
fs.copyFileSync = copy.copyFileSync
fs.copyFile = copy.copyFile

remove = require('./remove')
fs.rmrfSync = remove.rmrfSync
fs.rmrf = remove.rmrf

module.exports = fs