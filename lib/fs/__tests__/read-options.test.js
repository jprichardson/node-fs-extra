'use strict'
/* eslint-env mocha */
const assert = require('assert')
const os = require('os')
const path = require('path')
const fs = require('../..')

describe('fs.read() options', () => {
  let file
  let fd
  let dir

  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'fs-extra-read-options-'))
    file = path.join(dir, 'input')
    fs.writeFileSync(file, 'abcdef')
    fd = fs.openSync(file, 'r')
  })

  afterEach(async () => {
    await fs.close(fd)
    await fs.remove(dir)
  })

  const cases = [
    ['an options object with a buffer', () => [{ buffer: Buffer.alloc(5), offset: 1, length: 3, position: 2 }], 'cde', 1],
    ['an options object without a buffer', () => [{ length: 3, position: 1 }], 'bcd'],
    ['an empty options object', () => [{}], 'abcdef'],
    ['no options', () => [], 'abcdef']
  ]
  const [major, minor] = process.versions.node.split('.').map(Number)
  if (major >= 18 || (major === 16 && minor >= 17)) {
    cases.push(
      ['a buffer and options', () => [Buffer.alloc(5), { offset: 1, length: 3, position: 2 }], 'cde', 1],
      ['a buffer without options', () => [Buffer.alloc(3)], 'abc']
    )
  }

  for (const [name, args, expected, offset = 0] of cases) {
    it(`supports ${name} with promises`, async () => {
      const { bytesRead, buffer } = await fs.read(fd, ...args())
      assert.strictEqual(bytesRead, expected.length)
      assert.strictEqual(buffer.toString('utf8', offset, offset + bytesRead), expected)
    })

    it(`supports ${name} with callbacks`, done => {
      fs.read(fd, ...args(), (err, bytesRead, buffer) => {
        if (err) return done(err)
        try {
          assert.strictEqual(bytesRead, expected.length)
          assert.strictEqual(buffer.toString('utf8', offset, offset + bytesRead), expected)
          done()
        } catch (error) {
          done(error)
        }
      })
    })
  }
})
