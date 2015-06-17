var Mocha = require('mocha')
var walk = require('./lib/walk/')

var mocha = new Mocha({
  ui: 'bdd',
  reporter: 'spec',
  timeout: 30000,
})

var filter = function (item, stat) {
  if (stat.isDirectory()) return true
  return  item.lastIndexOf('.test.js') === (item.length - '.test.js'.length)
}

var walker = walk('./test', filter)
  .on('data', function (item, stat) {
    if (!stat.isFile()) return
    mocha.addFile(item)
  })
  .on('end', function () {
    mocha.run(function(failures){
      process.exit(failures);
    })
  })


