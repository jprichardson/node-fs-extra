# writeJson(file, object, [options], callback)

Writes an object to a JSON file. `options` are the same that
you'd pass to [`jsonFile.writeFile()`](https://github.com/jprichardson/node-jsonfile#writefilefilename-options-callback).

**Alias:** `writeJSON()`

**Sync:** `writeJsonSync()`, `writeJSONSync()`

## Example:

```js
var fs = require('fs-extra')
fs.writeJson('./package.json', {name: 'fs-extra'}, function (err) {
  console.log(err)
})
```

---

**See also:** [`outputJson()`](outputJson.md)
