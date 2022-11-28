import assert from 'assert'
import fsLegacy from './lib/index.js'
// NOTE: eslint comments needed because we're importing the same file multiple times
import fsDefault from './lib/esm.mjs' // eslint-disable-line
import * as fsStar from './lib/esm.mjs'
import {
  copy,
  copySync,
  emptyDirSync,
  emptydirSync,
  emptyDir,
  emptydir,
  createFile,
  createFileSync,
  ensureFile,
  ensureFileSync,
  createLink,
  createLinkSync,
  ensureLink,
  ensureLinkSync,
  createSymlink,
  createSymlinkSync,
  ensureSymlink,
  ensureSymlinkSync,
  readJson,
  readJsonSync,
  writeJson,
  writeJsonSync,
  outputJson,
  outputJsonSync,
  outputJSON,
  outputJSONSync,
  writeJSON,
  writeJSONSync,
  readJSON,
  readJSONSync,
  mkdirs,
  mkdirsSync,
  mkdirp,
  mkdirpSync,
  ensureDir,
  ensureDirSync,
  move,
  moveSync,
  outputFile,
  outputFileSync,
  pathExists,
  pathExistsSync,
  remove,
  removeSync
} from './lib/esm.mjs' // eslint-disable-line
const fsNamed = [
  copy,
  copySync,
  emptyDirSync,
  emptydirSync,
  emptyDir,
  emptydir,
  createFile,
  createFileSync,
  ensureFile,
  ensureFileSync,
  createLink,
  createLinkSync,
  ensureLink,
  ensureLinkSync,
  createSymlink,
  createSymlinkSync,
  ensureSymlink,
  ensureSymlinkSync,
  readJson,
  readJsonSync,
  writeJson,
  writeJsonSync,
  outputJson,
  outputJsonSync,
  outputJSON,
  outputJSONSync,
  writeJSON,
  writeJSONSync,
  readJSON,
  readJSONSync,
  mkdirs,
  mkdirsSync,
  mkdirp,
  mkdirpSync,
  ensureDir,
  ensureDirSync,
  move,
  moveSync,
  outputFile,
  outputFileSync,
  pathExists,
  pathExistsSync,
  remove,
  removeSync
]

const keys = Object.keys(fsDefault)

assert.deepStrictEqual(Object.values(fsDefault), fsNamed, 'named and default exports should match')
assert.deepStrictEqual(
  Object.entries(fsStar)
    .filter(([name]) => name !== 'default') // remove "default" property here
    .sort(([nameA], [nameB]) => keys.indexOf(nameA) - keys.indexOf(nameB)) // sort for exact match
    .map(([name, fn]) => fn),
  Object.values(fsDefault),
  'star and default exports should match'
)

// default exports a subset of the legacy implementation, but functions are the same
Object.entries(fsDefault).forEach(([name, fn]) => {
  assert.strictEqual(fn, fsLegacy[name], `${name}() should match legacy implementation`)
})

console.warn('ESM tests pass!')
