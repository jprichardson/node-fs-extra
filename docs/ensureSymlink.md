# ensureSymlink(srcPath, destPath[, type][, callback])

Ensures that the symlink exists. If the directory structure does not exist, it is created.

**Alias:** `createSymlink()`

- `srcPath` `<String>`
- `destPath` `<String>`
- `type` `<String>` It is only available on Windows and ignored on other platforms. It can be set to `dir`, `file`, or `junction`.
- `callback` `<Function>`
  - `err` `<Error>`

## Example:

```js
const fs = require('fs-extra')

const srcPath = '/tmp/file.txt'
const destPath = '/tmp/this/path/does/not/exist/file.txt'

// With a callback:
fs.ensureSymlink(srcPath, destPath, err => {
  console.log(err) // => null
  // symlink has now been created, including the directory it is to be placed in
})

// With Promises:
fs.ensureSymlink(srcPath, destPath)
.then(() => {
  console.log('success!')
})
.catch(err => {
  console.error(err)
})

// With async/await:
async function example (src, dest) {
  try {
    await fs.ensureSymlink(src, dest)
    console.log('success!')
  } catch (err) {
    console.error(err)
  }
}

example(srcPath, destPath)
```
