fs = require('fs')

#fs-extra
copy = require('./lib/copy')
fs.copyFileSync = copy.copyFileSync

module.exports = fs