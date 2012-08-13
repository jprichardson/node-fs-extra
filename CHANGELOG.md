0.1.3 / 2012-08-13
==================
* Added method `readJSONFile`.

0.1.2 / 2012-06-15
==================
* Bug fix: `deleteSync()` didn't exist.
* Verified Node v0.8 compatibility.

0.1.1 / 2012-06-15
==================
* Fixed bug in `remove()`/`delete()` that wouldn't execute the function if a callback wasn't passed.

0.1.0 / 2012-05-31
==================
* Renamed `copyFile()` to `copy()`. `copy()` can now copy directories (recursively) too.
* Renamed `rmrf()` to `remove()`. 
* `remove()` aliased with `delete()`.
* Added `mkdirp` capabilities. Named: `mkdir()`. Hides Node.js native `mkdir()`.
* Instead of exporting the native `fs` module with new functions, I now copy over the native methods to a new object and export that instead.

0.0.4 / 2012-03-14
==================
* Removed CoffeeScript dependency

0.0.3 / 2012-01-11
==================
* Added methods rmrf and rmrfSync
* Moved tests from Jasmine to Mocha
