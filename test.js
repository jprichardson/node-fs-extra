'use strict'

const os = require('os')
const path = require('path')
const klaw = require('klaw')
const Mocha = require('mocha')

const argv = require('minimist')(process.argv.slice(2))

const mochaOpts = {
  ui: 'bdd',
  reporter: 'dot',
  timeout: 30000,
  ...argv
}

const mocha = new Mocha(mochaOpts)
const testExt = '.test.js'

klaw('./lib').on('readable', function () {
  let item
  while ((item = this.read())) {
    if (!item.stats.isFile()) return
    if (item.path.lastIndexOf(testExt) !== (item.path.length - testExt.length)) return
    mocha.addFile(item.path)
  }
}).on('end', () => {
  mocha.run(failures => {
    require('./lib').remove(path.join(os.tmpdir(), 'fs-extra'), () => process.exit(failures))
  })
})
