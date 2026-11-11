'use strict'
/* eslint-env mocha */

const assert = require('assert')
const os = require('os')
const path = require('path')
const fs = require('../..')

for (const method of ['copy', 'copySync']) {
  describe(`${method}() / symlink overwrite options`, () => {
    const TEST_DIR = path.join(os.tmpdir(), 'fs-extra', `${method}-symlink-overwrite`)
    const src = path.join(TEST_DIR, 'src')
    const dest = path.join(TEST_DIR, 'dest')
    const srcTarget = path.join(TEST_DIR, 'source-target')
    const destTarget = path.join(TEST_DIR, 'destination-target')

    beforeEach(() => {
      fs.emptyDirSync(TEST_DIR)
      fs.writeFileSync(srcTarget, 'source content')
      fs.symlinkSync(srcTarget, src, 'file')
    })

    afterEach(() => fs.removeSync(TEST_DIR))

    for (const broken of [false, true]) {
      describe(`with a ${broken ? 'broken' : 'valid'} destination symlink`, () => {
        beforeEach(() => {
          if (!broken) fs.writeFileSync(destTarget, 'destination content')
          fs.symlinkSync(destTarget, dest, 'file')
        })

        for (const option of ['overwrite', 'clobber']) {
          it(`does not replace the destination when ${option} is false`, async () => {
            await fs[method](src, dest, { [option]: false })
            assert.strictEqual(fs.readlinkSync(dest), destTarget)
          })
        }

        it('reports an existing destination when errorOnExist is true', async () => {
          await assert.rejects(async () => fs[method](src, dest, {
            overwrite: false,
            errorOnExist: true
          }), { message: `'${dest}' already exists` })
          assert.strictEqual(fs.readlinkSync(dest), destTarget)
        })

        it('still replaces the destination by default', async () => {
          await fs[method](src, dest)
          assert.strictEqual(fs.readlinkSync(dest), srcTarget)
        })
      })
    }

    it('copies to a missing destination when overwrite is false', async () => {
      await fs[method](src, dest, { overwrite: false, errorOnExist: true })
      assert.strictEqual(fs.readlinkSync(dest), srcTarget)
    })
  })
}
