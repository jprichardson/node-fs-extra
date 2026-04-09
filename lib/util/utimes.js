'use strict'

const fs = require('../fs')
const u = require('universalify').fromPromise

async function utimesMillis (path, atime, mtime) {
  const fd = await fs.open(path, 'r+')

  let error = null

  try {
    await fs.futimes(fd, atime, mtime)
  } catch (futimesErr) {
    error = futimesErr
  } finally {
    try {
      await fs.close(fd)
    } catch (closeErr) {
      error = closeErr
    }
  }

  if (error) {
    throw error
  }
}

function utimesMillisSync (path, atime, mtime) {
  const fd = fs.openSync(path, 'r+')
  fs.futimesSync(fd, atime, mtime)
  return fs.closeSync(fd)
}

module.exports = {
  utimesMillis: u(utimesMillis),
  utimesMillisSync
}
