const fs = {
  copy: require('../copy-sync'),
  move: require('../move-sync')
}

const multiSync = (method, arr) => {
  for (const [src, prop] of Object.entries(arr)) {
    fs[method](src, prop.target, prop.opts)
  }
}

module.exports = multiSync
