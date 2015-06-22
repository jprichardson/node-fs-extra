var assert = require('assert')
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

function timeRemoveMillis (timestamp) {
  if (typeof timestamp === 'number') {
    return Math.floor(timestamp / 1000) * 1000
  } else if (timestamp instanceof Date) {
    return new Date(Math.floor(timestamp.getTime() / 1000) * 1000)
  } else {
    assert('fs-extra: timeRemoveMillis() unknown parameter type')
  }
}

module.exports = {
  hasMillisRes: hasMillisRes,
  timeRemoveMillis: timeRemoveMillis
}
