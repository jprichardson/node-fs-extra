# copy(src, dest, [options], callback)

Copy a file or directory. The directory can have contents. Like `cp -r`.

**Sync:** `copySync()`

## Options:
- overwrite (boolean): overwrite existing file or directory, default is `true`. _Note that the copy operation will silently fail if you set this to `false` and the destination exists._ Use the `errorOnExist` option to change this behavior.
- errorOnExist (boolean): when `overwrite` is `false` and the destination exists, throw an error. Default is `false`.
- dereference (boolean): dereference symlinks, default is `false`.
- preserveTimestamps (boolean): will set last modification and access times to the ones of the original source files, default is `false`.
- filter: Function to filter copied files. Return `true` to include, `false` to exclude. This can also be a RegExp, however this is deprecated (See [issue #239](https://github.com/jprichardson/node-fs-extra/issues/239) for background).

## Example:

```js
var fs = require('fs-extra')

fs.copy('/tmp/myfile', '/tmp/mynewfile', function (err) {
  if (err) return console.error(err)
  console.log("success!")
}) // copies file

fs.copy('/tmp/mydir', '/tmp/mynewdir', function (err) {
  if (err) return console.error(err)
  console.log('success!')
}) // copies directory, even if it has subdirectories or files
```

**Using filter function**

```js
var fs = require('fs-extra')

var mtimeCondition = new Date(2016, 11, 17).getTime()

var filterFunc = function (src, dest) {
  fs.lstat(dest, function (err, destStat) {
    if (err) return false
    return src.indexOf('node_modules') < 0 && destStat.mtime.getTime() > mtimeCondition
  })
}

fs.copy('/tmp/mydir', '/tmp/mynewdir', { filter: filterFunc }, function (err) {
  if (err) return console.error(err)
  console.log('success!')
})
```
