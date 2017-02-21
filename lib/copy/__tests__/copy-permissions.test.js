'use strict'

const fs = require('fs')
const os = require('os')
const fse = require('../../')
const path = require('path')
const assert = require('assert')

/* global beforeEach, describe, it */

const o777 = parseInt('777', 8)
const o666 = parseInt('666', 8)
const o444 = parseInt('444', 8)

describe('copy', () => {
  let TEST_DIR

  beforeEach(done => {
    TEST_DIR = path.join(os.tmpdir(), 'fs-extra', 'copy')
    fse.emptyDir(TEST_DIR, done)
  })

  // pretty UNIX specific, may not pass on windows... only tested on Mac OS X 10.9
  it('should maintain file permissions and ownership', done => {
    if (process.platform === 'win32') return done()

    // var userid = require('userid')

    // http://man7.org/linux/man-pages/man2/stat.2.html
    const S_IFREG = parseInt('0100000', 8) // regular file
    const S_IFDIR = parseInt('0040000', 8) // directory

    // these are Mac specific I think (at least staff), should find Linux equivalent
    let gidWheel
    let gidStaff

    try {
      gidWheel = process.getgid() // userid.gid('wheel')
    } catch (err) {
      gidWheel = process.getgid()
    }

    try {
      gidStaff = process.getgid() // userid.gid('staff')
    } catch (err) {
      gidStaff = process.getgid()
    }

    const permDir = path.join(TEST_DIR, 'perms')
    fs.mkdirSync(permDir)

    const srcDir = path.join(permDir, 'src')
    fs.mkdirSync(srcDir)

    const f1 = path.join(srcDir, 'f1.txt')
    fs.writeFileSync(f1, '')
    fs.chmodSync(f1, o666)
    fs.chownSync(f1, process.getuid(), gidWheel)
    const f1stats = fs.lstatSync(f1)
    assert.strictEqual(f1stats.mode - S_IFREG, o666)

    const d1 = path.join(srcDir, 'somedir')
    fs.mkdirSync(d1)
    fs.chmodSync(d1, o777)
    fs.chownSync(d1, process.getuid(), gidStaff)
    const d1stats = fs.lstatSync(d1)
    assert.strictEqual(d1stats.mode - S_IFDIR, o777)

    const f2 = path.join(d1, 'f2.bin')
    fs.writeFileSync(f2, '')
    fs.chmodSync(f2, o777)
    fs.chownSync(f2, process.getuid(), gidStaff)
    const f2stats = fs.lstatSync(f2)
    assert.strictEqual(f2stats.mode - S_IFREG, o777)

    const d2 = path.join(srcDir, 'crazydir')
    fs.mkdirSync(d2)
    fs.chmodSync(d2, o444)
    fs.chownSync(d2, process.getuid(), gidWheel)
    const d2stats = fs.lstatSync(d2)
    assert.strictEqual(d2stats.mode - S_IFDIR, o444)

    const destDir = path.join(permDir, 'dest')
    fse.copy(srcDir, destDir, err => {
      assert.ifError(err)

      const newf1stats = fs.lstatSync(path.join(permDir, 'dest/f1.txt'))
      const newd1stats = fs.lstatSync(path.join(permDir, 'dest/somedir'))
      const newf2stats = fs.lstatSync(path.join(permDir, 'dest/somedir/f2.bin'))
      const newd2stats = fs.lstatSync(path.join(permDir, 'dest/crazydir'))

      assert.strictEqual(newf1stats.mode, f1stats.mode)
      assert.strictEqual(newd1stats.mode, d1stats.mode)
      assert.strictEqual(newf2stats.mode, f2stats.mode)
      assert.strictEqual(newd2stats.mode, d2stats.mode)

      assert.strictEqual(newf1stats.gid, f1stats.gid)
      assert.strictEqual(newd1stats.gid, d1stats.gid)
      assert.strictEqual(newf2stats.gid, f2stats.gid)
      assert.strictEqual(newd2stats.gid, d2stats.gid)

      assert.strictEqual(newf1stats.uid, f1stats.uid)
      assert.strictEqual(newd1stats.uid, d1stats.uid)
      assert.strictEqual(newf2stats.uid, f2stats.uid)
      assert.strictEqual(newd2stats.uid, d2stats.uid)

      done()
    })
  })
})
