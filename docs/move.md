# move(src, dest[, options][, callback])

Moves a file or directory, even across devices.

- `src` `<String>`
- `dest` `<String>` Note: When `src` is a file, `dest` must be a file and when `src` is a directory, `dest` must be a directory.
- `options` `<Object>`
  - `overwrite` `<boolean>`: overwrite existing file or directory, default is `false`.
- `callback` `<Function>`
  - `err` `<Error>`

## Example:

```js
const fs = require('fs-extra')

const src = '/tmp/file.txt'
const dest = '/tmp/this/path/does/not/exist/file.txt'

// With a callback:
fs.move(src, dest, err => {
  if (err) return console.error(err)
  console.log('success!')
})

// With Promises:
fs.move(src, dest)
.then(() => {
  console.log('success!')
})
.catch(err => {
  console.error(err)
})

// With async/await:
async function example (src, dest) {
  try {
    await fs.move(src, dest)
    console.log('success!')
  } catch (err) {
    console.error(err)
  }
}

example(src, dest)
```

**Using `overwrite` option**

```js
const fs = require('fs-extra')

fs.move('/tmp/somedir', '/tmp/may/already/exist/somedir', { overwrite: true }, err => {
  if (err) return console.error(err)
  console.log('success!')
})
```
