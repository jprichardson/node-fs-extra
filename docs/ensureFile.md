# ensureFile(file, callback)

Ensures that the file exists. If the file that is requested to be created is in directories that do not exist, these directories are created. If the file already exists, it is **NOT MODIFIED**.

**Alias:** `createFile()`

**Sync:** `createFileSync()`,`ensureFileSync()`


## Example:

```js
var fs = require('fs-extra')

var file = '/tmp/this/path/does/not/exist/file.txt'
fs.ensureFile(file, function (err) {
  console.log(err) // => null
  // file has now been created, including the directory it is to be placed in
})
```
