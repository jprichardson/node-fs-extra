# copySync(src, dest[, options])

Copy a file or directory. The directory can have contents.

- `src` `<String>` Note that if `src` is a directory it will copy everything inside of this directory, not the entire directory itself (see [issue #537](https://github.com/jprichardson/node-fs-extra/issues/537)).
- `dest` `<String>` Note that if `src` is a file, `dest` cannot be a directory (see [issue #323](https://github.com/jprichardson/node-fs-extra/issues/323)).
- `options` `<Object>`
  - `overwrite` `<boolean>`: overwrite existing file or directory, default is `true`. _Note that the copy operation will silently fail if you set this to `false` and the destination exists._ Use the `errorOnExist` option to change this behavior.
  - `errorOnExist` `<boolean>`: when `overwrite` is `false` and the destination exists, throw an error. Default is `false`.
  - `dereference` `<boolean>`: dereference symlinks, default is `false`.
  - `preserveTimestamps` `<boolean>`: When true, will set last modification and access times to the ones of the original source files. When false, timestamp behavior is OS-dependent. Default is `false`.
  - `mode` `<integer>`: modifiers for copy operation, default is `0`.
    - `fs.constants.COPYFILE_EXCL` - The copy operation will fail if dest already exists.
    - `fs.constants.COPYFILE_FICLONE` - The copy operation will attempt to create a copy-on-write reflink. If the platform does not support copy-on-write, then a fallback copy mechanism is used.
    - `fs.constants.COPYFILE_FICLONE_FORCE` - The copy operation will attempt to create a copy-on-write reflink. If the platform does not support copy-on-write, then the operation will fail.
  - `filter` `<Function>`: Function to filter copied files. Return `true` to include, `false` to exclude.

## Example:

```js
const fs = require('fs-extra')

// copy file
fs.copySync('/tmp/myfile', '/tmp/mynewfile')

// copy directory, even if it has subdirectories or files
fs.copySync('/tmp/mydir', '/tmp/mynewdir')
```

**Using filter function**

```js
const fs = require('fs-extra')

const filterFunc = (src, dest) => {
  // your logic here
  // it will be copied if return true
}

fs.copySync('/tmp/mydir', '/tmp/mynewdir', { filter: filterFunc })
```
