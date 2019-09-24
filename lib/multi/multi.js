const fs = {
  copy: require('../copy'),
  move: require('../move')
}

function multi (method, files, callback) {
  for (const [src, prop_] of Object.entries(files)) {
    let prop = { opts: {} }

    if (typeof prop_ === 'string') prop.dest = prop_
    else if (typeof prop_ === 'object') prop = prop_
    else {
      console.error(`Value is: ${prop_} and type is: ${typeof prop_}, it must be string or Object`)
      continue
    }
    if (typeof prop.callback !== 'function') prop.callback = err => { if (err) console.error(err) }
    fs[method](src, prop.dest, prop.opts, prop.callback)
  }
  callback()
}

module.exports = multi
