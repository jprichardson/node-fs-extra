'use strict'

const fs = require('graceful-fs')
const path = require('path')
const buffer = require('../util/buffer')
const mkdirpSync = require('../mkdirs').mkdirsSync

function copySync (src, dest, options) {
  if (typeof options === 'function' || options instanceof RegExp) {
    options = {filter: options}
  }

  options = options || {}

  // default to true for now
  options.clobber = 'clobber' in options ? !!options.clobber : true
  // overwrite falls back to clobber
  options.overwrite = 'overwrite' in options ? !!options.overwrite : options.clobber
  options.dereference = 'dereference' in options ? !!options.dereference : false
  options.preserveTimestamps = 'preserveTimestamps' in options ? !!options.preserveTimestamps : false
  options.filter = options.filter || function () { return true }

  // Warn about using preserveTimestamps on 32-bit node:
  if (options.preserveTimestamps && process.arch === 'ia32') {
    console.warn(`fs-extra: Using the preserveTimestamps option in 32-bit node is not recommended;\n
    see https://github.com/jprichardson/node-fs-extra/issues/269`)
  }

  const stats = !options.dereference ? fs.lstatSync(src) : fs.statSync(src)

  if (stats.isDirectory()) {
    if (options.filter) return filterDir()
    return onDir()
  } else if (stats.isFile() || stats.isCharacterDevice() || stats.isBlockDevice()) {
    if (options.filter) return filterFile()
    return onFile()
  } else if (stats.isSymbolicLink()) {
    return onLink()
  }

  function onDir () {
    mkdirpSync(path.dirname(dest))
    fs.readdirSync(src).forEach(item => copySync(path.join(src, item), path.join(dest, item), options))
  }

  function onFile () {
    mkdirpSync(path.dirname(dest))
    return copyFileSync()
  }

  function onLink () {
    mkdirpSync(path.dirname(dest))
    return fs.symlinkSync(fs.readlinkSync(src), dest)
  }

  function filterDir () {
    if (options.filter instanceof RegExp) {
      console.warn('Warning: fs-extra: Passing a RegExp filter is deprecated, use a function')
      if (!options.filter.test(src)) return readFailedDir()
      return onDir()
    } else if (typeof options.filter === 'function') {
      if (!options.filter(src, dest)) return readFailedDir()
      return onDir()
    }

    function readFailedDir () {
      fs.readdirSync(src).forEach(item => copySync(path.join(src, item), path.join(dest, item), options))
    }
  }

  function filterFile () {
    if (options.filter instanceof RegExp) {
      if (!options.filter(src)) return
      return onFile()
    } else if (typeof options.filter === 'function') {
      if (!options.filter(src, dest)) return
      return onFile()
    }
  }

  function copyFileSync () {
    const BUF_LENGTH = 64 * 1024
    const _buff = buffer(BUF_LENGTH)

    if (fs.existsSync(dest)) {
      if (options.overwrite) {
        fs.unlinkSync(dest)
      } else if (options.errorOnExist) {
        throw new Error(`${dest} already exists`)
      } else return
    }

    const fdr = fs.openSync(src, 'r')
    const stat = fs.fstatSync(fdr)
    const fdw = fs.openSync(dest, 'w', stat.mode)
    let bytesRead = 1
    let pos = 0

    while (bytesRead > 0) {
      bytesRead = fs.readSync(fdr, _buff, 0, BUF_LENGTH, pos)
      fs.writeSync(fdw, _buff, 0, bytesRead)
      pos += bytesRead
    }

    if (options.preserveTimestamps) {
      fs.futimesSync(fdw, stat.atime, stat.mtime)
    }

    fs.closeSync(fdr)
    fs.closeSync(fdw)
  }
}

module.exports = copySync
