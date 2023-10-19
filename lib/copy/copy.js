'use strict'

const fs = require('graceful-fs')
const path = require('path')
const { mkdirs } = require('../mkdirs')
const { pathExists } = require('../path-exists')
const { utimesMillisAsync } = require('../util/utimes')
const stat = require('../util/stat')

const { promisify } = require('util')

// TODO: re-exports promisified version of graceful-fs functions from lib/fs/promise.js
const fs$stat = promisify(fs.stat)
const fs$lstat = promisify(fs.lstat)
const fs$unlink = promisify(fs.unlink)
const fs$copyFile = promisify(fs.copyFile)
const fs$mkdir = promisify(fs.mkdir)
const fs$chmod = promisify(fs.chmod)
const fs$readdir = promisify(fs.readdir)
const fs$readlink = promisify(fs.readlink)
const fs$symlink = promisify(fs.symlink)

async function copy (src, dest, opts) {
  if (typeof opts === 'function') {
    opts = { filter: opts }
  }

  opts = opts || {}

  opts.clobber = 'clobber' in opts ? !!opts.clobber : true // default to true for now
  opts.overwrite = 'overwrite' in opts ? !!opts.overwrite : opts.clobber // overwrite falls back to clobber

  // Warn about using preserveTimestamps on 32-bit node
  if (opts.preserveTimestamps && process.arch === 'ia32') {
    process.emitWarning(
      'Using the preserveTimestamps option in 32-bit node is not recommended;\n\n' +
      '\tsee https://github.com/jprichardson/node-fs-extra/issues/269',
      'Warning', 'fs-extra-WARN0001'
    )
  }

  const { srcStat, destStat } = await stat.checkPathsAsync(src, dest, 'copy', opts)

  await stat.checkParentPathsAsync(src, srcStat, dest, 'copy')

  const include = await runFilter(src, dest, opts)

  if (!include) return

  return checkParentDir(destStat, src, dest, opts)
}

async function checkParentDir (destStat, src, dest, opts) {
  const destParent = path.dirname(dest)

  const dirExists = await pathExists(destParent)

  if (dirExists) return getStats(destStat, src, dest, opts)

  const parentDirExists = await pathExists(destParent)
  if (parentDirExists) return getStats(destStat, src, dest, opts)

  await mkdirs(destParent)

  return getStats(destStat, src, dest, opts)
}

async function runFilter (src, dest, opts) {
  if (!opts.filter) return true
  return opts.filter(src, dest)
}

async function getStats (destStat, src, dest, opts) {
  const statFn = opts.dereference ? fs$stat : fs$lstat
  const srcStat = await statFn(src)

  if (srcStat.isDirectory()) return onDir(srcStat, destStat, src, dest, opts)

  if (
    srcStat.isFile() ||
    srcStat.isCharacterDevice() ||
    srcStat.isBlockDevice()
  ) return onFile(srcStat, destStat, src, dest, opts)

  if (srcStat.isSymbolicLink()) return onLink(destStat, src, dest, opts)
  if (srcStat.isSocket()) throw new Error(`Cannot copy a socket file: ${src}`)
  if (srcStat.isFIFO()) throw new Error(`Cannot copy a FIFO pipe: ${src}`)
  throw new Error(`Unknown file: ${src}`)
}

function onFile (srcStat, destStat, src, dest, opts) {
  if (!destStat) return copyFile(srcStat, src, dest, opts)
  return mayCopyFile(srcStat, src, dest, opts)
}

async function mayCopyFile (srcStat, src, dest, opts) {
  if (opts.overwrite) {
    await fs$unlink(dest)
    return copyFile(srcStat, src, dest, opts)
  }
  if (opts.errorOnExist) {
    throw new Error(`'${dest}' already exists`)
  }
}

async function copyFile (srcStat, src, dest, opts) {
  await fs$copyFile(src, dest)
  if (opts.preserveTimestamps) {
    return handleTimestampsAndMode(srcStat.mode, src, dest)
  }
  return setDestMode(dest, srcStat.mode)
}

async function handleTimestampsAndMode (srcMode, src, dest) {
  // Make sure the file is writable before setting the timestamp
  // otherwise open fails with EPERM when invoked with 'r+'
  // (through utimes call)
  if (fileIsNotWritable(srcMode)) {
    await makeFileWritable(dest, srcMode)
    return setDestTimestampsAndMode(srcMode, src, dest)
  }
  return setDestTimestampsAndMode(srcMode, src, dest)
}

function fileIsNotWritable (srcMode) {
  return (srcMode & 0o200) === 0
}

function makeFileWritable (dest, srcMode) {
  return setDestMode(dest, srcMode | 0o200)
}

async function setDestTimestampsAndMode (srcMode, src, dest) {
  await setDestTimestamps(src, dest)
  return setDestMode(dest, srcMode)
}

function setDestMode (dest, srcMode) {
  return fs$chmod(dest, srcMode)
}

async function setDestTimestamps (src, dest) {
  // The initial srcStat.atime cannot be trusted
  // because it is modified by the read(2) system call
  // (See https://nodejs.org/api/fs.html#fs$stat_time_values)
  const updatedSrcStat = await fs$stat(src)

  return utimesMillisAsync(dest, updatedSrcStat.atime, updatedSrcStat.mtime)
}

function onDir (srcStat, destStat, src, dest, opts) {
  if (!destStat) return mkDirAndCopy(srcStat.mode, src, dest, opts)
  return copyDir(src, dest, opts)
}

async function mkDirAndCopy (srcMode, src, dest, opts) {
  await fs$mkdir(dest)
  await copyDir(src, dest, opts)

  return setDestMode(dest, srcMode)
}

async function copyDir (src, dest, opts) {
  const items = await fs$readdir(src)
  return copyDirItems(items, src, dest, opts)
}

function copyDirItems (items, src, dest, opts) {
  const item = items.pop()
  if (!item) return
  return copyDirItem(items, item, src, dest, opts)
}

async function copyDirItem (items, item, src, dest, opts) {
  const srcItem = path.join(src, item)
  const destItem = path.join(dest, item)

  const include = await runFilter(srcItem, destItem, opts)
  if (!include) return copyDirItems(items, src, dest, opts)

  const { destStat } = await stat.checkPathsAsync(srcItem, destItem, 'copy', opts)

  await getStats(destStat, srcItem, destItem, opts)

  return copyDirItems(items, src, dest, opts)
}

async function onLink (destStat, src, dest, opts) {
  let resolvedSrc = await fs$readlink(src)
  if (opts.dereference) {
    resolvedSrc = path.resolve(process.cwd(), resolvedSrc)
  }
  if (!destStat) {
    return fs$symlink(resolvedSrc, dest)
  }

  let resolvedDest = null
  try {
    resolvedDest = await fs$readlink(dest)
  } catch (e) {
    if (e.code === 'EINVAL' || e.code === 'UNKNOWN') return fs$symlink(resolvedSrc, dest)
    throw e
  }
  if (opts.dereference) {
    resolvedDest = path.resolve(process.cwd(), resolvedDest)
  }
  if (stat.isSrcSubdir(resolvedSrc, resolvedDest)) {
    throw new Error(`Cannot copy '${resolvedSrc}' to a subdirectory of itself, '${resolvedDest}'.`)
  }

  // do not copy if src is a subdir of dest since unlinking
  // dest in this case would result in removing src contents
  // and therefore a broken symlink would be created.
  if (stat.isSrcSubdir(resolvedDest, resolvedSrc)) {
    throw new Error(`Cannot overwrite '${resolvedDest}' with '${resolvedSrc}'.`)
  }

  return copyLink(resolvedSrc, dest)
}

async function copyLink (resolvedSrc, dest) {
  await fs$unlink(dest)
  return fs$symlink(resolvedSrc, dest)
}

module.exports = copy
