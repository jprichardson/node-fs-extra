'use strict'

const fs = require('../fs')

// TODO: remove `utimesMillis` once all internal usage has switched to the Promise-based `utimesMillisAsync` API
function utimesMillis (path, atime, mtime, callback) {
  // if (!HAS_MILLIS_RES) return fs.utimes(path, atime, mtime, callback)
  fs.open(path, 'r+', (err, fd) => {
    if (err) return callback(err)
    fs.futimes(fd, atime, mtime, futimesErr => {
      fs.close(fd, closeErr => {
        if (callback) callback(futimesErr || closeErr)
      })
    })
  })
}

async function utimesMillisAsync (path, atime, mtime) {
  // if (!HAS_MILLIS_RES) return fs.utimes(path, atime, mtime, callback)
  const fd = await fs.open(path, 'r+')

  let futimesErr = null
  try {
    await fs.futimes(fd, atime, mtime)
  } catch (e) {
    futimesErr = e
  }

  let closeErr = null

  try {
    await fs.close(fd)
  } catch (e) {
    closeErr = e
  }

  if (futimesErr) {
    throw futimesErr
  }
  if (closeErr) {
    throw closeErr
  }
}

function utimesMillisSync (path, atime, mtime) {
  const fd = fs.openSync(path, 'r+')
  fs.futimesSync(fd, atime, mtime)
  return fs.closeSync(fd)
}

module.exports = {
  utimesMillis,
  utimesMillisAsync,
  utimesMillisSync
}
