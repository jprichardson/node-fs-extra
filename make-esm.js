const fs = require('./lib')

const list = [
  '{',
  ...Object.keys(fs).sort().map(key => `  ${key},`),
  '  promises',
  '}'
].join('\n')

fs.outputFile('./lib/index.mjs', `
import fs from './index.js'

const ${list} = fs

export ${list}
`.trimStart())
