# outputFile(file, data, [options], callback)

Almost the same as `writeFile` (i.e. it [overwrites](http://pages.citebite.com/v2o5n8l2f5reb)), except that if the parent directory does not exist, it's created. `options` are what you'd pass to [`fs.writeFile()`](https://nodejs.org/api/fs.html#fs_fs_writefile_file_data_options_callback).

**Sync:** `outputFileSync()`


## Example:

```js
var fs = require('fs-extra')
var file = '/tmp/this/path/does/not/exist/file.txt'

fs.outputFile(file, 'hello!', function (err) {
  console.log(err) // => null

  fs.readFile(file, 'utf8', function (err, data) {
    console.log(data) // => hello!
  })
})
```
