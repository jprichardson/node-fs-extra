var Mocha = require('mocha')
var walk = require('./lib/walk/')

var mocha = new Mocha({
  ui: 'bdd',
  reporter: 'dot',
  timeout: 30000
})

walk('./')
  .on('data', function (item, stat) {
    if (!stat.isFile()) return
    if (item.indexOf('node_modules') >= 0) return
    if (item.lastIndexOf('.test.js') !== (item.length - '.test.js'.length)) return
    mocha.addFile(item)
  })
  .on('end', function () {
    mocha.run(function (failures) {
      process.exit(failures)
    })
  })
