const fsExtra = require('./lib/index')
const path = require('path')
const { difference } = require('lodash')

function scan () {
  const excludes = [
    'FileReadStream',
    'FileWriteStream',
    '_toUnixTimestamp',
    'F_OK',
    'R_OK',
    'W_OK',
    'X_OK',
    'gracefulify'
  ]
  return difference(Object.keys(fsExtra), excludes)
}

function generate (list) {
  return (
    'import fsExtra from \'./index\'\n' +
    list.map((item) => `export const ${item} = fsExtra.${item}\n`).join('') +
    `export default {${list
      .map((item) => `${item}: fsExtra.${item},`)
      .join('')}}`
  )
}

async function build () {
  const list = scan()
  const code = generate(list)
  await fsExtra.writeFile(path.resolve(__dirname, 'lib/esm.mjs'), code)
}

build()
