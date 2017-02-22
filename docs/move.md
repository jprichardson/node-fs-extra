# move(src, dest, [options], callback)

Moves a file or directory, even across devices.

## Options:
- overwrite (boolean): overwrite existing file or directory, default is `false`

## Example:

```js
const fs = require('fs-extra')

fs.move('/tmp/somefile', '/tmp/does/not/exist/yet/somefile', err => {
  if (err) return console.error(err)

  console.log('success!')
})
```
