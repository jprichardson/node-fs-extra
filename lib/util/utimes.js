var fs = require('graceful-fs')
var path = require('path')

// HFS, ext{2,3}, FAT do not, Node.js v0.10 does not
function hasMillisRes () {
  // 550 millis past UNIX epoch
  var d = new Date(550)
  var tmpfile = path.join(require('os').tmpdir(), 'millis-test')
  fs.writeFileSync(tmpfile, 'https://github.com/jprichardson/node-fs-extra/pull/141')
  var fd = fs.openSync(tmpfile, 'r+')
  fs.futimesSync(fd, d, d)
  fs.closeSync(fd)
  return fs.statSync(tmpfile).mtime > 0
}

module.exports = {
  hasMillisRes: hasMillisRes
}
