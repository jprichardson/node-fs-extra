const fs = {
  copy: require('../copy'),
  move: require('../move')
}

const multi = async function (method, files, callback) {
  for (const [src, prop] of Object.entries(files)) {
    if (typeof prop.callback !== 'function') prop.callback = err => { if (err) console.error(err) }
    await fs[method](src, prop.dest, prop.opts, prop.callback)
  }
  callback()
}

module.exports = multi
