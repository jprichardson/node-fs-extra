var mkdir = require('./mkdir')
  , path = require('path')
  , fs = require('fs')
  , exists = fs.exists || path.exists
  , existsSync = fs.existsSync || path.existsSync

function touch (file, callback) {
  exists(file, function(fileExists) {
    if (fileExists)
      return callback(null);
    else {
      var dir = path.dirname(file);

      function makeFile() {
        fs.writeFile(file, '', function(err) {
          if (err)
            callback(err)
          else
            callback(null);
        })
      }

      exists(dir, function(dirExists) {
        if (!dirExists) {
          mkdir.mkdirs(dir, function(err) {
            if (err)
              callback(err)
            else
              makeFile();
          })
        } else {
          makeFile();
        }
      })
    }
  })
}


function touchSync (file) {
  if (existsSync(file))
    return;

  var dir = path.dirname(file);
  if (!existsSync(dir))
    mkdir.mkdirsSync(dir);

  fs.writeFileSync(file, '');
}


module.exports.touch = touch;
module.exports.touchSync = touchSync;