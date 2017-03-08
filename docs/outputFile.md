# outputFile(file, data, [options], callback)

Almost the same as `writeFile` (i.e. it [overwrites](http://pages.citebite.com/v2o5n8l2f5reb)), except that if the parent directory does not exist, it's created. `file` must be a file path (a buffer or a file descriptor is not allowed). `options` are what you'd pass to [`fs.writeFile()`](https://nodejs.org/api/fs.html#fs_fs_writefile_file_data_options_callback).

## Example:

```js
const fs = require('fs-extra')

const file = '/tmp/this/path/does/not/exist/file.txt'
fs.outputFile(file, 'hello!', err => {
  console.log(err) // => null

  fs.readFile(file, 'utf8', (err, data) => {
    console.log(data) // => hello!
  })
})
```
