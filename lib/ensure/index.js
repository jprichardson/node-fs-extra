var path = require('path')
var fs = require('graceful-fs')
var mkdir = require('../mkdirs')

function createFile (file, content, callback) {
  callback = (typeof content === 'function') ? content : callback
  content = (typeof content === 'function') ? '' : content

  function makeFile () {
    fs.writeFile(file, content, function (err) {
      if (err) return callback(err)
      callback()
    })
  }

  fs.exists(file, function (fileExists) {
    if (fileExists) return callback()
    var dir = path.dirname(file)
    fs.exists(dir, function (dirExists) {
      if (dirExists) return makeFile()
      mkdir.mkdirs(dir, function (err) {
        if (err) return callback(err)
        makeFile()
      })
    })
  })
}

function createFileSync (file, content) {
  content = (typeof content === 'function') ? '' : content

  if (fs.existsSync(file)) return

  var dir = path.dirname(file)
  if (!fs.existsSync(dir)) {
    mkdir.mkdirsSync(dir)
  }

  fs.writeFileSync(file, content)
}

module.exports = {
  createFile: createFile,
  createFileSync: createFileSync,
  // alias
  ensureFile: createFile,
  ensureFileSync: createFileSync
}
