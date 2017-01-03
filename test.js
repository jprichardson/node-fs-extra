var os = require('os')
var path = require('path')
var Mocha = require('mocha')
var assign = require('./lib/util/assign')
var klaw = require('klaw')

var argv = require('minimist')(process.argv.slice(2))

var mochaOpts = assign({
  ui: 'bdd',
  reporter: 'dot',
  timeout: 30000
}, argv)

var mocha = new Mocha(mochaOpts)

klaw('./lib').on('readable', function () {
  var item
  while ((item = this.read())) {
    if (!item.stats.isFile()) return
    if (item.path.lastIndexOf('.test.js') !== (item.path.length - '.test.js'.length)) return
    mocha.addFile(item.path)
  }
}).on('end', function () {
  mocha.run(function (failures) {
    require('./').remove(path.join(os.tmpdir(), 'fs-extra'), function () {
      process.exit(failures)
    })
  })
})
