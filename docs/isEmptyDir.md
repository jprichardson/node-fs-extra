# isEmptyDir(dir[, callback])

Returns a promise that resolves to `true` if the directory is empty, or `false` if it contains at least one entry. Only the first directory entry is read.

- `dir` `<String>`
- `callback` `<Function>`
  - `err` `<Error>`
  - `empty` `<Boolean>`

## Example:

```js
const fs = require('fs-extra')

fs.isEmptyDir('/tmp/some/dir', (err, empty) => {
  if (err) return console.error(err)
  console.log(empty ? 'empty' : 'not empty')
})
```

```js
const fs = require('fs-extra')

fs.isEmptyDir('/tmp/some/dir')
  .then(empty => {
    console.log(empty ? 'empty' : 'not empty')
  })
  .catch(err => console.error(err))
```
