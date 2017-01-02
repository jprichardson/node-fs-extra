# readJson(file, [options], callback)

Reads a JSON file and then parses it into an object. `options` are the same
that you'd pass to [`jsonFile.readFile`](https://github.com/jprichardson/node-jsonfile#readfilefilename-options-callback).

**Alias:** `readJSON()`

**Sync:** `readJsonSync()`, `readJSONSync()`


## Example:

```js
var fs = require('fs-extra')

fs.readJson('./package.json', function (err, packageObj) {
  console.log(packageObj.version) // => 0.1.3
})
```

---

`readJsonSync()` can take a `throws` option set to `false` and it won't throw if the JSON is invalid. Example:

```js
var fs = require('fs-extra')
var file = path.join('/tmp/some-invalid.json')
var data = '{not valid JSON'
fs.writeFileSync(file, data)

var obj = fs.readJsonSync(file, {throws: false})
console.log(obj) // => null
```
