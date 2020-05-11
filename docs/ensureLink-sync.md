# ensureLinkSync(srcPath, destPath)

Ensures that the link exists. If the directory structure does not exist, it is created.

**Alias:** `createLinkSync()`

- `srcPath` `<String>`
- `destPath` `<String>`

## Example:

```js
const fs = require('fs-extra')

const srcPath = '/tmp/file.txt'
const destPath = '/tmp/this/path/does/not/exist/file.txt'
fs.ensureLinkSync(srcPath, destPath)
// link has now been created, including the directory it is to be placed in
```
