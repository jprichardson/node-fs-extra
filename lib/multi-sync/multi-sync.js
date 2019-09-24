const fs = {
  copy: require('../copy-sync'),
  move: require('../move-sync')
}

const multiSync = (method, files) => {
  for (const [src, prop_] of Object.entries(files)) {
    let prop = { opts: {} }

    if (typeof prop_ === 'string') prop.dest = prop_
    else if (typeof prop_ === 'object') prop = prop_
    else {
      console.error(`Value is: ${prop_} and type is: ${typeof prop_}, it must be string or Object`)
      continue
    }
    fs[method](src, prop.dest, prop.opts)
  }
}

module.exports = multiSync
