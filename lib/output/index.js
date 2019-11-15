'use strict'

const u = require('universalify').fromCallback
const memoize = require('memoize-weak')
const path = require('path')
const mkdirsFac = require('../mkdirs')
const pathExistsFac = require('../path-exists')

function outputFac (fs) {
  const mkdir = mkdirsFac(fs)
  const { pathExists } = pathExistsFac(fs)

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

  function outputFileSync (file, ...args) {
    const dir = path.dirname(file)
    if (fs.existsSync(dir)) {
      return fs.writeFileSync(file, ...args)
    }
    mkdir.mkdirsSync(dir)
    fs.writeFileSync(file, ...args)
  }

  return {
    outputFile: u(outputFile),
    outputFileSync
  }
}
module.exports = memoize(outputFac)
