# ensureSymlinkSync(srcPath, destPath[, type])

Ensures that the symlink exists. If the directory structure does not exist, it is created.

**Alias:** `createSymlinkSync()`

- `srcPath` `<String>`
- `destPath` `<String>`
- `type` `<String>` It is only available on Windows and ignored on other platforms. It can be set to `dir`, `file`, or `junction`.

## Example:

```js
const fs = require('fs-extra')

const srcPath = '/tmp/file.txt'
const destPath = '/tmp/this/path/does/not/exist/file.txt'
fs.ensureSymlinkSync(srcPath, destPath)
// symlink has now been created, including the directory it is to be placed in
```
