'use strict'

const fs = require('fs')
const os = require('os')
const fse = require(process.cwd())
const path = require('path')
const assert = require('assert')

/* global afterEach, beforeEach, describe, it */

describe('output', () => {
  let TEST_DIR

  beforeEach(done => {
    TEST_DIR = path.join(os.tmpdir(), 'fs-extra', 'wapper')
    fse.emptyDir(TEST_DIR, done)
  })

  // afterEach(done => fse.remove(TEST_DIR, done))

  describe('wrap', () => {

    describe(' > when the directory is empty', () => {
      it(' > should do nothing', done => {

        let TEST_WRAP_DIR = path.join(TEST_DIR, 'wrap');
        fs.mkdirSync(TEST_WRAP_DIR);
        fse.wrap(TEST_WRAP_DIR, 'wrapped', err => {
          assert.ifError(!err);
          assert(!fs.existsSync(path.join(TEST_DIR, 'wrap', 'wrapped')));
          done()
        })
      })
    })

    describe('> when the directory is not empty', () => {
      it(' > should wrap the content of the src folder in dst folder', done => {

        let TEST_WRAP_DIR_0 = path.join(TEST_DIR, 'wrap');
        let TEST_WRAP_DIR_1 = path.join(TEST_DIR, 'wrap', 'wrap_1');
        fs.mkdirSync(TEST_WRAP_DIR_0);
        fs.mkdirSync(TEST_WRAP_DIR_1);

        let TEST_WRAP_FIL_0 = path.join(TEST_WRAP_DIR_0, Math.random() + '.txt');
        let TEST_WRAP_FIL_1 = path.join(TEST_WRAP_DIR_1, Math.random() + '.txt');
        fs.writeFileSync(TEST_WRAP_FIL_0, 'File inside path ' + TEST_WRAP_DIR_0)
        fs.writeFileSync(TEST_WRAP_FIL_1, 'File inside path ' + TEST_WRAP_DIR_1)

        fse.wrap(TEST_DIR, 'wrapped', err => {
          assert.ifError(err);
          assert(fs.existsSync(path.join(TEST_DIR, 'wrapped','wrap')));
          assert(fs.existsSync(path.join(TEST_DIR, 'wrapped','wrap', TEST_WRAP_FIL_0)));
          assert(fs.existsSync(path.join(TEST_DIR, 'wrapped','wrap', 'wrap_1')));
          assert(fs.existsSync(path.join(TEST_DIR, 'wrapped','wrap', 'wrap_1', TEST_WRAP_FIL_1)));
          done()
        })
      })
    })
  })
})
