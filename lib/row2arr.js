var fs = require('graceful-fs')
var os = require('os')

function withoutCommentLine (arr) {
  var arrLength = arr.length
  var filterArr = []

  for (var i = 0; i < arrLength; i++) {
    var checkText = arr[i]

    if (/^#.*/.test(checkText) === false) {
      filterArr.push(checkText)
    }
  }

  return filterArr
}

function readRow2Arr (file, callback) {
  fs.readFile(file, {
    encoding: 'utf-8'
  }, function (err, data) {
    if (err) {
      callback(err)
      return false
    }

    var rowarr = data.split(os.EOL)

    callback(err, withoutCommentLine(rowarr))
  })
}

function readRow2ArrSync (file) {
  var data = fs.readFileSync(file, {
    encoding: 'utf-8'
  })

  var rowarr = data.split(os.EOL)

  return withoutCommentLine(rowarr)
}

module.exports = {
  readRow2Arr: readRow2Arr,
  readRow2ArrSync: readRow2ArrSync
}
