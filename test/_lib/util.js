var fs = require('fs')
var sr = require('secure-random')

function createFileWithData (file, size) {
  fs.writeFileSync(file, sr.randomBuffer(size))
  return file
}

module.exports = {
  createFileWithData: createFileWithData
}
