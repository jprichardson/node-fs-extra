# Node.js: fs-extra

This module simply patches the Node.js 'fs' object with extra methods.

## Installation

    npm install --production fs-extra

Make sure that you run the test script to verify that it works on your system.
Navigate to the directory for the module and run: `make test`

## Usage

```javascript
fs = require('fs-extra')
```

Note that you can still use all of the [vanilla Node.js file methods][1].

## Methods

```javascript
fs.copyFileSync(srcFile, destFile) //synchronously copies a file
fs.copyFile(srcFile, destFile, function(err)) //asynchronously copies a file

fs.rmrfSync(dir) //recursively deletes directory, like rm -rf on Unix
fs.rmrf(dir, callback)  //asynchronous version as before
```

## License

Dual licensed under MIT and Apache v2

Copyright (c) 2011-2012 JP Richardson

[1]: http://nodejs.org/docs/latest/api/fs.html 