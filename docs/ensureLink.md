# ensureLink(srcPath, destPath[, callback])

Ensures that the link exists. If the directory structure does not exist, it is created.

**Alias:** `createLink()`

- `srcPath` `<String>`
- `destPath` `<String>`
- `callback` `<Function>`
  - `err` `<Error>`

## Example:

```js
const fs = require('fs-extra')

const srcPath = '/tmp/file.txt'
const destPath = '/tmp/this/path/does/not/exist/file.txt'

// With a callback:
fs.ensureLink(srcPath, destPath, err => {
  console.log(err) // => null
  // link has now been created, including the directory it is to be placed in
})

// With Promises:
fs.ensureLink(srcPath, destPath)
.then(() => {
  console.log('success!')
})
.catch(err => {
  console.error(err)
})

// With async/await:
async function example (src, dest) {
  try {
    await fs.ensureLink(src, dest)
    console.log('success!')
  } catch (err) {
    console.error(err)
  }
}

example(srcPath, destPath)
```
