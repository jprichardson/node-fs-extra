'use strict'

// https://github.com/jprichardson/node-fs-extra/issues/1056
// Performing parallel operations on each item of an async iterator is
// surprisingly hard; you need to have handlers in place to avoid getting an
// UnhandledPromiseRejectionWarning.
// NOTE: This function does not presently handle return values, only errors
async function asyncIteratorConcurrentProcess (iterator, fn) {
  const promises = []
  let results
  try {
    for await (const item of iterator) {
      promises.push(
        fn(item).then(
          () => null,
          (err) => err ?? new Error('unknown error')
        )
      )
    }
  } finally {
    // Even if iteration fails, wait for all started operations before returning.
    results = await Promise.all(promises)
  }
  for (const possibleErr of results) {
    if (possibleErr !== null) throw possibleErr
  }
}

module.exports = {
  asyncIteratorConcurrentProcess
}
