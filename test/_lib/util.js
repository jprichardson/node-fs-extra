var fs = require('fs')
var path = require('path')
var os = require('os')
var rimraf = require('rimraf')
var sr = require('secure-random')

function tmpdir () {
  if (os.type().toLowerCase().indexOf('win') === 0) {
    return process.env['TEMP']
  } else {
    return '/tmp'
  }
}

function createFileWithData (file, size) {
  fs.writeFileSync(file, sr.randomBuffer(size))
  return file
}

function createTestDir () {
  var app = 'fs-extra'
  var dir = path.join(tmpdir(), 'test-' + app)
  if (fs.existsSync(dir)) {
    var files = fs.readdirSync(dir)
    files.forEach(function (file) {
      return rimraf.sync(path.join(dir, file))
    })
  } else {
    fs.mkdirSync(dir)
  }
  return dir
}

module.exports = {
  createFileWithData: createFileWithData,
  createTestDir: createTestDir
}
