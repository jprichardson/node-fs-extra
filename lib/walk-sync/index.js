var fs = require('graceful-fs')
var path = require('path')

var walkSync = function (dir, list) {
  var files = fs.readdirSync(path.resolve(dir))
  list = list || []
  files.forEach(function (file) {
    var nestedPath = path.join(dir, file)
    var stat = fs.lstatSync(nestedPath)
    if (stat.isDirectory()) {
      list.push({path: nestedPath, stats: stat})
      list = walkSync(nestedPath, list)
    } else {
      list.push({path: nestedPath, stats: stat})
    }
  })
  return list
}

module.exports = {
  walkSync: walkSync
}
