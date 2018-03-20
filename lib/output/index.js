'use strict'

const u = require('universalify').fromCallback
const path = require('path')

const _mkdir = require('../mkdirs')
const _pathExists = require('../path-exists')

const prep = fs => {
  const mkdir = _mkdir(fs)
  const pathExists = _pathExists(fs).pathExists

  function outputFile (file, data, encoding, callback) {
    if (typeof encoding === 'function') {
      callback = encoding
      encoding = 'utf8'
    }

    const dir = path.dirname(file)
    pathExists(dir, (err, itDoes) => {
      if (err) return callback(err)
      if (itDoes) return fs.writeFile(file, data, encoding, callback)

      mkdir.mkdirs(dir, err => {
        if (err) return callback(err)

        fs.writeFile(file, data, encoding, callback)
      })
    })
  }

  function outputFileSync (file, data, encoding) {
    const dir = path.dirname(file)
    if (fs.existsSync(dir)) {
      return fs.writeFileSync.apply(fs, arguments)
    }
    mkdir.mkdirsSync(dir)
    fs.writeFileSync.apply(fs, arguments)
  }

  return {
    outputFile: u(outputFile),
    outputFileSync
  }
}

module.exports = prep
