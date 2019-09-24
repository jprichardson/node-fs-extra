# multiSync(method, files)

[`copySync`](copy-sync.md) or [`moveSync`](move-sync.md) multiple files or directories.

- `method` `<string>` Methods may be `copy` or `move`.
- `files` `<Object>` Destinations, options and callback functions or `<string>` as only destinations for each file. Each key of `<Object>` is referred to `src` (see: [`copySync`](copy-sync.md) or [`moveSync`](move-sync.md)).
  - `dest` `<string>` Destination
  - `opts` `<Object>` Options
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
    dest: '/tmp/mynewfile',
    overwrite: false
  },

  '/tmp/mysecondfile': '/tmp/mysecondnewfile'
}

fs.multiSync('copy', files)
```