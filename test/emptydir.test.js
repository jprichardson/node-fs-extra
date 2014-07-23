var assert = require('assert'),
       fs = require('fs'),
       emptydir = require('emptydir');

var test_folder = './test';
var dirs = [
    test_folder,
    test_folder + '/dirA',
    test_folder + '/dirB',
    test_folder + '/dirB/dirC'
];
dirs.forEach(function (dir) {
    fs.mkdirSync(dir)
});

// Recreate the files
var original_file = './try_file';
file = fs.openSync(original_file, 'w');
fs.closeSync(file);
var files = [
    test_folder + '/file1',
    test_folder + '/dirA/file2',
    test_folder + '/dirB/dirC/file3'
];
beforeEach(function () {
    files.forEach(function (file) {
        fs.linkSync(original_file, file);
    });
});


/*Creates a super folder that wiill raise excepton if tried to be deleted from*/
var super_folder = './delete_me';
if (!fs.existsSync(super_folder)) fs.mkdirSync(super_folder, 000);

describe('emptyDir', function () {
    it('should call callback once with err as null', function (done) {
        var calls = 0;
        emptydir.emptyDir(test_folder, function (errs) {
            calls++;
            assert.equal(1, calls, 'called more than once');
            assert.equal(null, errs, 'some unexpected error occurred');
            done();
        });
    });
    it('should pass an array of errs', function (done) {
        emptydir.emptyDir(super_folder, function (errs) {
            assert.ok(errs.length, 'error failed to be passed');
            done();
        });
    });
});


describe('emptyDirs', function () {
    it('should be called per file and always pass path', function (done) {
        var calls = 0;
        emptydir.emptyDirs(test_folder, function(err, path) {
            calls++;
            assert(path, 'path not passed to callback');
            if (calls === 3) done();
        });
    });
    it('should get an err', function (done) {
        emptydir.emptyDirs(super_folder, function (err, path) {
            assert(err, 'Error did not get passed');
            done();
        });
    });
});


describe('emptyDirsSync', function () {
    it('should return an empty array here', function () {
        errs = emptydir.emptyDirsSync(test_folder);
        assert.equal(0, errs.length);
    });
    it('should return an array with one error', function () {
        errs = emptydir.emptyDirsSync(super_folder);
        assert.equal(1, errs.length);
    });
});


// Destroy all files
afterEach(function () {
    files.forEach(function (file) {
        if (fs.existsSync(file)) {
            fs.unlinkSync(file);
        }
    });
});

// Destroy all Direcotories
after(function () {
    dirs = dirs.reverse();
    dirs.forEach(function (dir) {
        fs.rmdirSync(dir);
    });
});
