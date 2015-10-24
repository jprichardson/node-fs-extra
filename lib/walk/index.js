var Walker = require('./walker')

function walk (path) {
  return new Walker(path)// .start()
}

module.exports = {
  walk: walk
}
