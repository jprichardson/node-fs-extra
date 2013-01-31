[![build status](https://secure.travis-ci.org/jprichardson/node-fs-extra.png)](http://travis-ci.org/jprichardson/node-fs-extra)

Node.js: fs-extra
=================

This module adds a few extra file system methods that aren't included in the native `fs` module. It is a drop in replacement for `fs`.



Why?
----

I got tired of including `mkdirp` and `rimraf` in most of my projects. 



Naming
------

I put a lot of thought into the naming of these function. Inspired by @coolaj86's request. So he deserves much of the credit for raising the issue. See discussion(s) here:

* https://github.com/jprichardson/node-fs-extra/issues/2
* https://github.com/flatiron/utile/issues/11
* https://github.com/ryanmcgrath/wrench-js/issues/29
* https://github.com/substack/node-mkdirp/issues/17

First, I believe that in as many cases as possible, the [Node.js naming schemes](http://nodejs.org/api/fs.html) should be chosen. However, there are problems with the Node.js own naming schemes.

For example, `fs.readFile()` and `fs.readdir()`: the **F** is capitalized in *File* and the **d** is not capitalized in *dir*. Perhaps a bit pedantic, but they should still be consistent. Also, Node.js has chosen a lot of POSIX naming schemes, which I believe is great. See: `fs.mkdir()`, `fs.rmdir()`, `fs.chown()`, etc.

We have a dilemma though. How do you consistently name methods that perform the following POSIX commands: `cp`, `cp -r`, `mkdir -p`, and `rm -rf`?

My perspective: when in doubt, err on the side of simplicity. Consider that for a moment. A directory is just a hierarchical grouping of directories and files. So when you want to copy it or remove it, in most cases you'll want to copy or remove all of its contents. When you want to create a directory, if the directory that it's suppose to be contained in does not exist, then in most cases you'll want to create that too. 

So, if you want to remove a file or a directory regardless of whether it has contents, just call `fs.remove(path)` or its alias `fs.delete(path)`. If you want to copy a file or a directory whether it has contents, just call `fs.copy(source, destination)`. If you want to create a directory regardless of whether its parent directories exist, just call `fs.mkdirs(path)` or `fs.mkdirp(path)`. 



Compromise
----------

If you feel that this module should add functionality, please let me know. If you don't like the naming scheme, let me know that as well. I'm willing to work with the community so that we can develop a logical grouping of file system functions that aren't found Node.js.



Installation
------------

    npm install fs-extra



Usage
-----

```javascript
var fs = require('fs-extra');
```



Methods
-------

**NOTE:** You can still use the native Node.js methods. They are copied over to `fs-extra`.


### copy(src, dest, callback)

Copy a file or directory. The directory can have contents. Like `cp -r`. There isn't a synchronous version implemented yet.

Sync: (none)


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

fs.copy('/tmp/mydir', '/tmp/mynewdir', function(err){
  if (err) {
    console.error(err);
  }
  else {
    console.log("success!")
  }
}); //copies directory, even if it has subdirectories or files
```



### remove(dir, callback) / delete(dir, callback)

Removes a file or directory. The directory can have contents. Like `rm -rf`.

Sync: `removeSync()` / `deleteSync()`


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



### mkdirs(dir, callback) / mkdirp(dir, callback)

Creates a directory. If the parent hierarchy doesn't exist, it's created. Like `mkdir -p`.

Sync: `mkdirsSync()` / `mkdirpSync()`


Examples:

```javascript
var fs = require('fs');
var fse = require('fs-extra');

fse.mkdirs('/tmp/some/long/path/that/prob/doesnt/exist', function(err){
  if (err) {
    console.error(err);
  }
  else {
    console.log("success!")
  }
});

fse.mkdirsSync('/tmp/another/path');

//now use Node.js native mkdir()

fs.mkdir('/tmp/node/cant/do/this', function(err){
  console.log('this wasnt successful');
});
```


### createFile(file, callback) 

Creates a file. If the file that is requested to be created is in directories that do not exist, these directories are created. If the file already exists, it is **NOT MODIFIED**.

Sync: `createFileSync()`


Example:

```javascript
var fs = require('fs-extra')
  , file = '/tmp/this/path/does/not/exist/file.txt'

fs.createFile(file, function(err) {
  console.log(err); //null

  //file has now been created, including the directory it is to be placed in
})
```


### outputFile(file, data, callback)

Almost the same as `writeFile`, except that if the directory does not exist, it's created.

Sync: `outputFileSync()`


Example:

```javascript
var fs = require('fs-extra')
  , file = '/tmp/this/path/does/not/exist/file.txt'

fs.outputFile(file, 'hello!' function(err) {
  console.log(err); //null

  fs.readFile(file, 'utf8', function(err, data) {
    console.log(data); //hello!
  })
})
```


### readTextFile(file, callback)

**NOTE:** This was a mistake. Don't use this method. It will be removed. The problem with this method
is that when a developer reads your code `readTextFile()` causes an additional cognitive load on trying to
figure out what it does. Where as most Node.js devs will know what `readFile(file, 'utf8', callback)` does.
Plus, `readTextFile()` is ambigious. DON'T USE IT. 

Exactly the same as `readFile(file, 'utf8', callback)`.

Sync: `readTextFileSync()`.


Example:

```javascript
var fs = require('fs-extra')
  , file = '/etc/passwd'

fs.readTextFile(file, function(err, data) { //instead of fs.readFile(file, 'utf8', callback)
  console.log(data); // (contents of your /etc/passwd) file
})
```



### Methods from [jsonfile][jsonfile]

### fs.readJSONFile() / fs.readJSONFileSync()

Reads a JSON file and then parses it into an object.

Example:

```javascript
var fs = require('fs-extra');

fs.readJSONFile('./package.json', function(err, packageObj) {
  console.log(packageObj.version); //0.1.3
});
```


### fs.writeJSONFile() / fs.writeJSONFileSync()

Writes an object to a JSON file.

Example:

```javascript
var fs = require('fs-extra');
fs.writeJSONFile('./package.json', {name: 'fs-extra'}, function(err){
  console.log(err);
});
```



### exists() / existsSync()

These methods are actually from `path` in v0.6. But in Node v0.8 they are moved from `path` to `fs`. So you can use this module to help make your modules v0.6 and v0.8 compatible.





Author
------

`node-fs-extra` was written by [JP Richardson][aboutjp]. You should follow him on Twitter [@jprichardson][twitter]. Also read his coding blog [Procbits][procbits]. If you write software with others, you should checkout [Gitpilot][gitpilot] to make collaboration with Git simple.




License
-------


Licensed under MIT

Copyright (c) 2011-2012 JP Richardson

[1]: http://nodejs.org/docs/latest/api/fs.html 


[jsonfile]: https://github.com/jprichardson/node-jsonfile


[aboutjp]: http://about.me/jprichardson
[twitter]: http://twitter.com/jprichardson
[procbits]: http://procbits.com
[gitpilot]: http://gitpilot.com



