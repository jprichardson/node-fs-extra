'use strict'

const _file = require('./file')
const _link = require('./link')
const _symlink = require('./symlink')

module.exports = fs => {
  const file = _file(fs)
  const link = _link(fs)
  const symlink = _symlink(fs)

  return {
    // file
    createFile: file.createFile,
    createFileSync: file.createFileSync,
    ensureFile: file.createFile,
    ensureFileSync: file.createFileSync,
    // link
    createLink: link.createLink,
    createLinkSync: link.createLinkSync,
    ensureLink: link.createLink,
    ensureLinkSync: link.createLinkSync,
    // symlink
    createSymlink: symlink.createSymlink,
    createSymlinkSync: symlink.createSymlinkSync,
    ensureSymlink: symlink.createSymlink,
    ensureSymlinkSync: symlink.createSymlinkSync
  }
}
