var mkdirp = require('mkdirp');
var fs = require('fs');
var path = require('path');
var R = path.resolve;

// mkdirs(dir, [limit], cb)
//  limit:  maximum number of parent directories to make
var mkdirs = function (dir, cb) {
	var limit = -1;
	if (arguments.length > 2) {
		limit = cb;
		cb = arguments[2];
	}
	if (limit < 0 || limit === null) { mkdirp(dir, cb); }
	else {
		var components = R(dir).split(path.sep);
		if (components.length && components[components.length - 1] === '')
		{ components.pop(); }
		var parent_must_exist = components.slice(0, components.length-limit-1).join(path.sep);
		if (parent_must_exist == '') { mkdirp(dir, cb); }
		else {
			fs.stat(parent_must_exist, function (err, st) {
				if (err) { cb(err); }
				else if (!st.isDirectory())
				{ cb(new Error('not a directory: ' + parent_must_exist)); }
				else { mkdirp(dir, cb); }
			});
		}
	}
}

// mkdirsSync(dir, [limit])
var mkdirsSync = function (dir) {
	var limit = -1;
	if (arguments.length > 1) { limit = arguments[1]; }
	if (limit < 0 || limit === null) { mkdirp.sync(dir); }
	else {
		var components = R(dir).split(path.sep);
		if (components.length && components[components.length - 1] === '')
		{ components.pop(); }
		var parent_must_exist = components.slice(0, components.length-limit-1).join(path.sep);
		if (parent_must_exist == '') { mkdirp.sync(dir); }
		else {
			var st = fs.statSync(parent_must_exist);
			if (!st.isDirectory())
			{ throw new Error('not a directory: ' + parent_must_exist); }
			mkdirp.sync(dir);
		}
	}
}

module.exports.mkdirs = mkdirs;
module.exports.mkdirsSync = mkdirsSync;


