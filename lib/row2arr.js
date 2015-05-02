var fs = require('graceful-fs')
var path = require('path')
var os = require('os')

function readRow2Arr (file, callback) {

  fs.readFile(file, {
    encoding: "utf-8"
  }, function (err, data) {
    if(err) {
      callback(err);
      return false;
    }

    var rowarr = data.split(os.EOL);

    callback(err, rowarr);
  });
}

function readRow2ArrSync (file) {
  var rowarr = [];

  var data = fs.readFileSync(file, {
    encoding: "utf-8"
  });

  var rowarr = data.split(os.EOL);

  return rowarr;
}

module.exports = {
  readRow2Arr: readRow2Arr,
  readRow2ArrSync: readRow2ArrSync
}
