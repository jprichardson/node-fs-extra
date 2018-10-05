# ensureDirSync(dir[,options])

Ensures that the directory exists. If the directory structure does not exist, it is created. Like `mkdir -p`. If provided, options may specify the desired mode for the directory. 

**Aliases:** `mkdirsSync()`, `mkdirpSync()`

- `dir` `<String>`
- `options` `<Integer>|<Object>`
## Example:

```js
const fs = require('fs-extra')

const dir = '/tmp/this/path/does/not/exist'

const desiredMode = 0o2775
const options = {
  mode: 0o2775
}

fs.ensureDirSync(dir)
// dir has now been created, including the directory it is to be placed in

fs.ensureDirSync(dir, desiredMode)
// dir has now been created, including the directory it is to be placed in with permission 0o2775

fs.ensureDirSync(dir, options)
// dir has now been created, including the directory it is to be placed in with permission 0o2775
```
