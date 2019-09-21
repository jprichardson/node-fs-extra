# multi(method, files[, callback])

[`copy`](copy.md) or [`move`](move.md) multiple files or directories.

- `method` `<String>` Methods may be `copy` or `move`.
- `files` `<Object>` Destinations, options and callback functions for each file. Each key of `<Object>` is referred to `src` (see: [`copy`](copy.md) or [`move`](move.md)).
  - `dest` `<String>`
  - `opts` `<Object>`
      - `overwrite` `<boolean>`: default is `true` for [`copy`](copy.md) or default is `false` for [`move`](move.md)
      - `errorOnExist` `<boolean>`: fot [`copy`](copy.md)
      - `dereference` `<boolean>`: [`copy`](copy.md)
      - `preserveTimestamps` `<boolean>`: [`copy`](copy.md)
      - `filter` `<Function>`: [`copy`](copy.md)
  - `callback` `<Function>`
- `callback` `<Function>`

## Example:

```js
const fs = require('fs-extra')

let files = {
  '/tmp/myfile': {
    target: '/tmp/mynewfile',
    callback: err => {
      if (err) console.error(err)
      else console.log('myfile success!')
    }
  },

  '/tmp/mysecondfile': {
    target: '/tmp/mysecondnewfile'
  }
}

fs.multi('copy', files, () => console.log('multiple processes completed'))
```