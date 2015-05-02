var fs = require('graceful-fs')
var path = require('path')

function readRow2Arr (file, callback) {

  fs.readFile(file, {
    encoding: "utf-8"
  }, function (err, data) {
    if(err) {
      callback(err);
      return false;
    }

    var rowarr = data.split(/\r\n|\n/);

    callback(err, rowarr);
  });
}

function readRow2ArrSync (file, data) {
  console.log('aaa');
}

module.exports = {
  readRow2Arr: readRow2Arr,
  readRow2ArrSync: readRow2ArrSync
}
