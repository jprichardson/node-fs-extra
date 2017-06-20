const boundUtilPromisify = require('util.promisify')

exports.fromCallback = function (fn) {
  // Cache this.
  // Unless someone really messes up with the native libraries with patches, this should be no problem.
  const promisifiedFn = boundUtilPromisify(fn)

  // This is the wrapped fn, returning a Promise from `util.promisify` if called without a callback.
  const wrappedFn = function () {
    if (typeof arguments[arguments.length - 1] === 'function') {
      fn.apply(this, arguments)
    } else {
      return promisifiedFn.apply(this, arguments)
    }
  }

  if (fn.name) {
    // Forward original function's name to the wrapper
    Object.defineProperty(wrappedFn, 'name', {
      enumerable: false,
      value: fn.name
    })
  }

  if (fn[boundUtilPromisify.custom]) {
    // Forward original function's custom `promisify` to the wrapper
    Object.defineProperty(wrappedFn, boundUtilPromisify.custom, {
      enumerable: false,
      get: promisifiedFn
    })
  }

  return wrappedFn
}
