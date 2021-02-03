'use strict'

const { stringify } = require('jsonfile/utils')
const { outputFile } = require('../output')

async function outputJson (file, data, options = {}, callback = undefined) {
  if (typeof file !== 'string') {
    throw TypeError('[ERR_INVALID_ARG_TYPE] the "file" argument must be of type string')
  }
  if (typeof data !== 'object') {
    throw TypeError('[ERR_INVALID_ARG_TYPE] the "data" argument must be a JSON object')
  }

  // if the options argument is a function and there is no callback argument
  // then the options argument specifies the callback
  if (typeof options === 'function' && !callback) {
    callback = options
    options = {}
  }

  const str = stringify(data, options)

  const res = outputFile(file, str, options)
  if (callback) {
    res.then(r => callback(null, r), callback) // this is the fromPromise behaviour
  }
  await res
}

module.exports = outputJson
