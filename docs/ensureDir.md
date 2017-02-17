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

---

The callback receives a second argument, containing the path to the first directory that was created in the process. If no directories were made, this will be `null`.
```js
var fs = require('fs-extra')

// Let's assume that /var/www exists

var dir = '/var/www/this/path/does/not/exist'
fs.ensureDir(dir, function (err, created) {
  console.log(created) // => /var/www/this
  // second argument contains the first directory in the path that did not exist before
})
```
