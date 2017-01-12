# outputJson(file, data, [options], callback)

Almost the same as [`writeJson`](writeJson.md), except that if the directory does not exist, it's created.
`options` are what you'd pass to [`jsonFile.writeFile()`](https://github.com/jprichardson/node-jsonfile#writefilefilename-options-callback).

**Alias:** `outputJSON()`

**Sync:** `outputJsonSync()`, `outputJSONSync()`


## Example:

```js
var fs = require('fs-extra')
var file = '/tmp/this/path/does/not/exist/file.txt'

fs.outputJson(file, {name: 'JP'}, function (err) {
  console.log(err) // => null

  fs.readJson(file, function(err, data) {
    console.log(data.name) // => JP
  })
})
```
