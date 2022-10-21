# outputFile(file, data[, options][, callback])

Almost the same as `writeFile` (i.e. it overwrites), except that if the parent directory does not exist, it's created. `file` must be a file path (a buffer or a file descriptor is not allowed).

- `file` `<String>`
- `data` `<String> | <Buffer> | <Uint8Array>`
- `options` `<Object> | <String>` (the same as [`fs.writeFile()` options](https://nodejs.org/api/fs.html#fs_fs_writefile_file_data_options_callback))
- `callback` `<Function>`
  - `err` `<Error>`

## Example:

```js
const fs = require('fs-extra')

const file = '/tmp/this/path/does/not/exist/file.txt'

// With a callback:
fs.outputFile(file, 'hello!', err => {
  console.log(err) // => null

  fs.readFile(file, 'utf8', (err, data) => {
    if (err) return console.error(err)
    console.log(data) // => hello!
  })
})

// With Promises:
fs.outputFile(file, 'hello!')
.then(() => fs.readFile(file, 'utf8'))
.then(data => {
  console.log(data) // => hello!
})
.catch(err => {
  console.error(err)
})

// With async/await:
async function example (f) {
  try {
    await fs.outputFile(f, 'hello!')

    const data = await fs.readFile(f, 'utf8')

    console.log(data) // => hello!
  } catch (err) {
    console.error(err)
  }
}

example(file)
```
