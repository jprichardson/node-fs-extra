# ensureLink(srcpath, dstpath, callback)

Ensures that the link exists. If the directory structure does not exist, it is created.

**Sync:** `ensureLinkSync()`


## Example:

```js
var fs = require('fs-extra')

var srcpath = '/tmp/file.txt'
var dstpath = '/tmp/this/path/does/not/exist/file.txt'
fs.ensureLink(srcpath, dstpath, function (err) {
  console.log(err) // => null
  // link has now been created, including the directory it is to be placed in
})
```
