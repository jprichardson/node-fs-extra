# ensureDir(dir, callback)

Ensures that the directory exists. If the directory structure does not exist, it is created. Like `mkdir -p`.

**Aliases:** `mkdirs()`, `mkdirp()`

**Sync:** `ensureDirSync()`, `mkdirsSync()`, `mkdirpSync()`


## Example:

```js
var fs = require('fs-extra')

var dir = '/tmp/this/path/does/not/exist'
fs.ensureDir(dir, function (err) {
  console.log(err) // => null
  // dir has now been created, including the directory it is to be placed in
})
```
