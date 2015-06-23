var fs = require('graceful-fs')
var path = require('path')

var HAS_MILLIS_RES = hasMillisRes()

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
    throw new Error('fs-extra: timeRemoveMillis() unknown parameter type')
  }
}

function utimesMillis (path, atime, mtime, callback) {
  if (!HAS_MILLIS_RES) return fs.utimes(path, atime, mtime, callback)
  fs.open(path, 'r+', function (err, fd) {
    if (err) return callback(err)
    fs.futimes(fd, atime, mtime, function (err) {
      if (err) return callback(err)
      fs.close(fd, callback)
    })
  })
}

module.exports = {
  hasMillisRes: hasMillisRes,
  timeRemoveMillis: timeRemoveMillis,
  utimesMillis: utimesMillis,
  HAS_MILLIS_RES: HAS_MILLIS_RES
}
