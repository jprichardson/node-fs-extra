'use strict'

const fileFac = require('./file')
const linkFac = require('./link')
const symlinkFac = require('./symlink')

function ensureMethodsFac (fs) {
  const file = fileFac(fs)
  const link = linkFac(fs)
  const symlink = symlinkFac(fs)
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

module.exports = ensureMethodsFac
