var fs = require('fs');

function touch(path, callback) {
    fs.writeFile(path, '', callback);
}

function touchSync(path) {

}

module.exports.touch = touch;