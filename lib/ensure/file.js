'use strict'

const u = require('universalify').fromCallback
const path = require('path')
const memoize = require('memoize-weak')

const mkdirFac = require('../mkdirs')
const pathExistsFac = require('../path-exists')

function ensureFileFac (fs) {
  const mkdir = mkdirFac(fs)
  const { pathExists } = pathExistsFac(fs)
  function createFile (file, callback) {
    function makeFile () {
      fs.writeFile(file, '', err => {
        if (err) return callback(err)
        callback()
      })
    }

    fs.stat(file, (err, stats) => { // eslint-disable-line handle-callback-err
      if (!err && stats.isFile()) return callback()
      const dir = path.dirname(file)
      pathExists(dir, (err, dirExists) => {
        if (err) return callback(err)
        if (dirExists) return makeFile()
        mkdir.mkdirs(dir, err => {
          if (err) return callback(err)
          makeFile()
        })
      })
    })
  }

  function createFileSync (file) {
    let stats
    try {
      stats = fs.statSync(file)
    } catch (e) {}
    if (stats && stats.isFile()) return

    const dir = path.dirname(file)
    if (!fs.existsSync(dir)) {
      mkdir.mkdirsSync(dir)
    }

    fs.writeFileSync(file, '')
  }

  return {
    createFile: u(createFile),
    createFileSync
  }
}

module.exports = memoize(ensureFileFac)
