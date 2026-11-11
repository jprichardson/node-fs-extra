'use strict'

const u = require('universalify').fromPromise
const fs = require('../fs')

function readFirst (dir) {
  return new Promise((resolve, reject) => {
    dir.read((err, dirent) => {
      if (err) return reject(err)
      resolve(dirent)
    })
  })
}

function close (dir) {
  return new Promise((resolve, reject) => {
    dir.close(err => {
      if (err) return reject(err)
      resolve()
    })
  })
}

async function isEmptyDir (dir) {
  const handle = await fs.opendir(dir)
  let result
  let error

  try {
    result = (await readFirst(handle)) === null
  } catch (err) {
    error = err
  }

  try {
    await close(handle)
  } catch (err) {
    if (!error) error = err
  }

  if (error) throw error
  return result
}

function isEmptyDirSync (dir) {
  const handle = fs.opendirSync(dir)
  let result
  let error

  try {
    result = handle.readSync() === null
  } catch (err) {
    error = err
  }

  try {
    handle.closeSync()
  } catch (err) {
    if (!error) error = err
  }

  if (error) throw error
  return result
}

module.exports = {
  isEmptyDir: u(isEmptyDir),
  isEmptyDirSync
}
