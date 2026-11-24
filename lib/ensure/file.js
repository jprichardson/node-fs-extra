'use strict'

const u = require('universalify').fromPromise
const path = require('path')
const fs = require('../fs')
const mkdir = require('../mkdirs')

async function createFile (file) {
  let stats
  try {
    stats = await fs.stat(file)
  } catch { }
  if (stats && stats.isFile()) return

  const dir = path.dirname(file)

  let dirStats = null
  try {
    dirStats = await fs.stat(dir)
  } catch (err) {
    // if the directory doesn't exist, make it
    if (err.code === 'ENOENT') {
      await mkdir.mkdirs(dir)
      await createEmptyFile(file)
      return
    } else {
      throw err
    }
  }

  if (dirStats.isDirectory()) {
    await createEmptyFile(file)
  } else {
    // parent is not a directory
    // This is just to cause an internal ENOTDIR error to be thrown
    await fs.readdir(dir)
  }
}

function createFileSync (file) {
  let stats
  try {
    stats = fs.statSync(file)
  } catch { }
  if (stats && stats.isFile()) return

  const dir = path.dirname(file)
  try {
    if (!fs.statSync(dir).isDirectory()) {
      // parent is not a directory
      // This is just to cause an internal ENOTDIR error to be thrown
      fs.readdirSync(dir)
    }
  } catch (err) {
    // If the stat call above failed because the directory doesn't exist, create it
    if (err && err.code === 'ENOENT') mkdir.mkdirsSync(dir)
    else throw err
  }

  createEmptyFileSync(file)
}

function checkDirectory (stats, file) {
  // Windows can open directories in append mode, so validate the open handle.
  if (stats.isDirectory()) {
    throw Object.assign(new Error(`EISDIR: illegal operation on a directory, open '${file}'`), {
      code: 'EISDIR',
      syscall: 'open',
      path: file
    })
  }
}

async function createEmptyFile (file) {
  const fd = await fs.open(file, 'a')
  try {
    checkDirectory(await fs.fstat(fd), file)
  } finally {
    await fs.close(fd)
  }
}

function createEmptyFileSync (file) {
  const fd = fs.openSync(file, 'a')
  try {
    checkDirectory(fs.fstatSync(fd), file)
  } finally {
    fs.closeSync(fd)
  }
}

module.exports = {
  createFile: u(createFile),
  createFileSync
}
