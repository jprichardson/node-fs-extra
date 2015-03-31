var fs = require('fs')
var path = require('path')
var mkdir = require('./mkdir')
var remove = require('./remove')

function emptyDirSync (dir) {
  var items
  try {
    items = fs.readdirSync(dir)
  } catch (err) {
    return mkdir.mkdirsSync(dir)
  }

  items.forEach(function (item) {
    item = path.join(dir, item)
    remove.removeSync(item)
  })
}

module.exports = {
  emptyDirSync: emptyDirSync,
  emptydirSync: emptyDirSync
}
