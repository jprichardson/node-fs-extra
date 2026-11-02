'use strict'

/* eslint-env mocha */
const assert = require('assert')
const { asyncIteratorConcurrentProcess } = require('../async')

describe('asyncIteratorConcurrentProcess', () => {
  for (const failure of ['task', 'iterator']) {
    it(`waits for pending work before rejecting the ${failure} error`, async () => {
      const error = new Error(`${failure} failed`)
      let release
      const pending = new Promise(resolve => { release = resolve })
      let completed = false
      let settled = false

      async function * items () {
        yield 'pending'
        if (failure === 'iterator') throw error
        yield 'failing'
      }

      const result = asyncIteratorConcurrentProcess(items(), async item => {
        if (item === 'failing') throw error
        await pending
        completed = true
      })
      result.catch(() => { settled = true })

      // Let iteration and the failing task finish while the other task is held.
      await new Promise(resolve => setImmediate(resolve))
      const settledBeforeRelease = settled
      release()
      await assert.rejects(result, err => err === error)

      assert.strictEqual(settledBeforeRelease, false)
      assert.strictEqual(completed, true)
    })
  }
})
