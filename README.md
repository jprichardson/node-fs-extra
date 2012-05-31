Node.js: fs-extra
=================

This module adds a few extra file system methods that aren't included in the native `fs` module. It is a drop in replacement for `fs`.

Installation
------------

    npm install --production fs-extra

Usage
-----

```javascript
var fs = require('fs-extra');
```

Naming
------

I put a lot of thought into the naming of these function. Inspired by @coolaj86's request. So he deserves much of the credit for raising the issue. See discussion(s) here:

* https://github.com/jprichardson/node-fs-extra/issues/2
* https://github.com/flatiron/utile/issues/11
* https://github.com/ryanmcgrath/wrench-js/issues/29
* https://github.com/substack/node-mkdirp/issues/17

First, I believe that in as many cases as possible, the [Node.js naming schemes](http://nodejs.org/api/fs.html) should be chosen. However, there are problems with the Node.js own naming schemes.

For example, `fs.readFile()` and `fs.readdir()`: the **F** is capitalized in *File* and the **d** is not capitalized in *dir*. Perhaps a bit pedantic, but they should still be consistent. Also, Node.js has chosen a lot of POSIX naming schemes, which I believe is great. See: `fs.mkdir()`, `fs.rmdir()`, `fs.chown()`, etc.

We have a dilemma though. How do you consistently name methods perform the following POSIX commands: `cp`, `cp -r`, `mkdir -p`, and `rm -rf`?

My perspective: when in doubt, err on the side of simplicity. Consider that for a moment. A directory is just a hierarchical grouping of directories and files. So when you want to copy it or remove it, in most cases you'll want to copy or remove all of its contents. When you want to create a directory, if the directory that it's suppose to be contained in does not exist, then in most cases you'll want to create that too. 

So, if you want to remove a file or a directory regardless of whether it has contents, just call `fs.remove(path)` or its alias `fs.delete(path)`. If you want to copy a file or a directory whether it has contents, just call `fs.copy(source, destination)`. If you want to create a directory regardless of whether its parent directories exist, just call `fs.mkdir(path)`. (Note: you can still use the native Node.js `fs.mkdir()` method by requiring `fs` and calling `mkdir` on that object)


Compromise
----------

If you feel that this module should add functionality, please let me know. If you don't like the naming scheme, let me know that as well. I'm willing to work with the community so that we can develop a logical grouping of file system functions that aren't found Node.js.


Methods
-------

**NOTE:** You can still use the native Node.js methods. They are copied over to `fs-extra`.

### copy()

Copy a file or directory. The directory can have contents. Like `cp -r`. There isn't a synchronous version implemented yet.

Examples:

```javascript
var fs = require('fs-extra');

fs.copy('/tmp/myfile', '/tmp/mynewfile', function(err){
  if (err) {
    console.error(err);
  }
  else {
    console.log("success!")
  }
}); //copies file

fs.copy('/tmp/mydir', '/tmp/mynewdir'function(err){
  if (err) {
    console.error(err);
  }
  else {
    console.log("success!")
  }
}); //copies directory, even if it has subdirectories or files
```


### remove()

Removes a file or directory. The directory can have contents. Like `rm -rf`.

Alias: `delete()`.

Examples:

```javascript
var fs = require('fs-extra');

fs.remove('/tmp/myfile', function(err){
  if (err) {
    console.error(err);
  }
  else {
    console.log("success!")
  }
});

fs.removeSync('/home/jprichardson'); //I just deleted my entire HOME directory. 
```


### mkdir()

Creates a directory. If the parent hierarchy doesn't exist, it's created. Like `mkdir -p`.

Examples:

```javascript
var fs = require('fs');
var fse = require('fs-extra');

fse.mkdir('/tmp/some/long/path/that/prob/doesnt/exist', function(err){
  if (err) {
    console.error(err);
  }
  else {
    console.log("success!")
  }
});

fse.mkdirSync('/tmp/another/path');

//now use Node.js native mkdir()

fs.mkdir('/tmp/node/cant/do/this', function(err){
  console.log('this wasnt successful');
});
```

### exists() / existsSync()

These methods are actually from `path`. But in Node v0.8 they are moved from `path` to `fs`. So you might as well start future proofing your code now.


## License

Licensed under MIT

Copyright (c) 2011-2012 JP Richardson

[1]: http://nodejs.org/docs/latest/api/fs.html 

