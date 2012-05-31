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
