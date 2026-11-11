# isEmptyDirSync(dir)

Returns `true` if the directory is empty, or `false` if it contains at least one entry. Only the first directory entry is read.

- `dir` `<String>`

## Example:

```js
const fs = require('fs-extra')

const empty = fs.isEmptyDirSync('/tmp/some/dir')
console.log(empty ? 'empty' : 'not empty')
```
