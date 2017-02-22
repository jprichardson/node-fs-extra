# ensureSymlink(srcpath, dstpath, [type], callback)

Ensures that the symlink exists. If the directory structure does not exist, it is created.

**Sync:** `ensureSymlinkSync()`

## Example:

```js
const fs = require('fs-extra')

const srcpath = '/tmp/file.txt'
const dstpath = '/tmp/this/path/does/not/exist/file.txt'
fs.ensureSymlink(srcpath, dstpath, err => {
  console.log(err) // => null
  // symlink has now been created, including the directory it is to be placed in
})
```
