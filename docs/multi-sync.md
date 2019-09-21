# multiSync(method, files)

[`copySync`](copy-sync.md) or [`moveSync`](move-sync.md) multiple files or directories.

- `method` `<String>` Methods may be `copySync` or `moveSync`.
- `files` `<Object>` Destinations, options and callback functions for each file. Each key of `<Object>` is referred to `src` (see: [`copySync`](copy-sync.md) or [`moveSync`](move-sync.md)).
  - `dest` `<String>`
  - `opts` `<Object>`
      - `overwrite` `<boolean>`: default is `true` for [`copySync`](copy-sync.md) or default is `false` for [`moveSync`](move-sync.md)
      - `errorOnExist` `<boolean>`: for [`copySync`](copy-sync.md)
      - `dereference` `<boolean>`: for [`copySync`](copy-sync.md)
      - `preserveTimestamps` `<boolean>`: for [`copySync`](copy-sync.md)
      - `filter` `<Function>`: for [`copySync`](copy-sync.md)

## Example:

```js
const fs = require('fs-extra')

let files = {
  '/tmp/myfile': {
    target: '/tmp/mynewfile'
  },

  '/tmp/mysecondfile': {
    target: '/tmp/mysecondnewfile'
  }
}

fs.multiSync('copy', files)
```