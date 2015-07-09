var assign = require('object-assign')
var os = require('os')
var path = require('path')
var Mocha = require('mocha')
var walk = require('./lib/walk/')

var argv = require('minimist')(process.argv.slice(2))

var mochaOpts = assign({
  ui: 'bdd',
  reporter: 'dot',
  timeout: 30000
}, argv)

var mocha = new Mocha(mochaOpts)

walk('./lib')
  .on('data', function (item, stat) {
    if (!stat.isFile()) return
    if (item.lastIndexOf('.test.js') !== (item.length - '.test.js'.length)) return
    mocha.addFile(item)
  })
  .on('end', function () {
    mocha.run(function (failures) {
      require('./').remove(path.join(os.tmpdir(), 'fs-extra'), function () {
        process.exit(failures)
      })
    })
  })
