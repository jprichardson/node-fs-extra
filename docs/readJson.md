# readJson(file, [options], callback)

Reads a JSON file and then parses it into an object. `options` are the same
that you'd pass to [`jsonFile.readFile`](https://github.com/jprichardson/node-jsonfile#readfilefilename-options-callback).

**Alias:** `readJSON()`

## Example:

```js
const fs = require('fs-extra')

fs.readJson('./package.json', (err, packageObj) => {
  console.log(packageObj.version) // => 0.1.3
})
```

---

`readJsonSync()` can take a `throws` option set to `false` and it won't throw if the JSON is invalid. Example:

```js
const fs = require('fs-extra')
const file = path.join('/tmp/some-invalid.json')
const data = '{not valid JSON'
fs.writeFileSync(file, data)

const obj = fs.readJsonSync(file, {throws: false})
console.log(obj) // => null
```
