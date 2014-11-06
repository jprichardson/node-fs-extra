var crypto = require('crypto')
var fs = require('../lib')
var path = require('path')
var testutil = require('testutil')
var mkdirp = require('mkdirp')
var userid = require('userid')
var ncp = require('ncp')

var testlib = require('./lib/util')

var terst = require('terst')

var SIZE = 16 * 64 * 1024 + 7
var DIR = ''

describe('fs-extra', function() {
  beforeEach(function() {
    DIR = testutil.createTestDir('fs-extra')
  })

  afterEach(function(done) {
    fs.remove(DIR, done)
  })

  describe('+ copy()', function() {
    describe('> when the source is a file', function() {
      it('should copy the file asynchronously', function(done) {
        var fileSrc = path.join(DIR, "TEST_fs-extra_src")
        var fileDest = path.join(DIR, "TEST_fs-extra_copy")
        var fileSrc = testlib.createFileWithData(fileSrc, SIZE)
        var srcMd5 = crypto.createHash('md5').update(fs.readFileSync(fileSrc)).digest("hex")
        var destMd5 = ''

        fs.copy(fileSrc, fileDest, function(err) {
          destMd5 = crypto.createHash('md5').update(fs.readFileSync(fileDest)).digest("hex")
          T (srcMd5 === destMd5)
          done()
        })
      })
      
      it('should return an error if the source file does not exist', function(done) {
        var fileSrc = "we-simply-assume-this-file-does-not-exist.bin"
        var fileDest = path.join(DIR, "TEST_fs-extra_copy")
        var destMd5 = ''

        fs.copy(fileSrc, fileDest, function(err) {
          T (err)
          done()
        })
      })

      it("should only copy files allowed by filter regex", function(done) {
        var srcFile1 = testlib.createFileWithData(path.join(DIR, "1.jade"), SIZE)
        var destFile1 = path.join(DIR, "dest1.jade")
        var filter = /.html$|.css$/i
        fs.copy(srcFile1, destFile1, filter, function() {
          T(!fs.existsSync(destFile1))
          done()
        })
      })

      it("should only copy files allowed by filter fn", function(done) {
        var srcFile1 = testlib.createFileWithData(path.join(DIR, "1.css"), SIZE)
        var destFile1 = path.join(DIR, "dest1.css")
        var filter = function(s) { return s.split(".").pop() !== "css";}
        fs.copy(srcFile1, destFile1, filter, function() {
          T(!fs.existsSync(destFile1))
          done()
        })
      })

      describe('> when the destination dir does not exist', function() {
        it('should create the destination directory and copy the file', function(done) {
          var src = path.join(DIR, 'file.txt')
          var dest = path.join(DIR, 'this/path/does/not/exist/copied.txt')
          var data = "did it copy?\n"

          fs.writeFileSync(src, data, 'utf8')

          fs.copy(src, dest, function(err) {
            var data2 = fs.readFileSync(dest, 'utf8')
            EQ (data, data2)
            done(err)
          })
        })
      })
    })

    describe('> when the source is a directory', function() {
      describe('> when the source directory does not exist', function() {
        it('should return an error', function(done) {
          var ts = path.join(DIR, 'this_dir_does_not_exist')
          var td = path.join(DIR, 'this_dir_really_does_not_matter')
          fs.copy(ts, td, function(err) {
            T (err)
            done()
          })
        })
      })

      it('should copy the directory asynchronously', function(done) {
        var FILES = 2
        var src = path.join(DIR, 'src')
        var dest = path.join(DIR, 'dest')

        mkdirp(src, function(err) {
          for (var i = 0; i < FILES; ++i)
            testlib.createFileWithData(path.join(src, i.toString()), SIZE)

          var subdir = path.join(src, 'subdir')
          mkdirp(subdir, function(err) {
            for (var i = 0; i < FILES; ++i)
              testlib.createFileWithData(path.join(subdir, i.toString()), SIZE)

            fs.copy(src, dest, function(err) {
              F (err)
              T (fs.existsSync(dest))

              for (var i = 0; i < FILES; ++i)
                T (fs.existsSync(path.join(dest, i.toString())))


              var destSub = path.join(dest, 'subdir')
              for (var j = 0; j < FILES; ++j)
                T (fs.existsSync(path.join(destSub, j.toString())))

              done()
            })
          })
        })
      })

      describe('> when the destination dir does not exist', function() {
        it('should create the destination directory and copy the file', function(done) {
          var src = path.join(DIR, 'data/')
          fs.mkdirsSync(src)
          var d1 = "file1"
          var d2 = "file2"

          var f1 = fs.writeFileSync(path.join(src, "f1.txt"), d1)
          var f2 = fs.writeFileSync(path.join(src, "f2.txt"), d2)

          var dest = path.join(DIR, 'this/path/does/not/exist/outputDir')

          fs.copy(src, dest, function(err) {
            var o1 = fs.readFileSync(path.join(dest, 'f1.txt'), 'utf8')
            var o2 = fs.readFileSync(path.join(dest, 'f2.txt'), 'utf8')

            EQ (d1, o1)
            EQ (d2, o2)

            done(err)
          })
        })
      })

      describe('> when src dir does not exist', function() {
        it('should return an error', function(done) {
          fs.copy('/does/not/exist', '/something/else', function(err) {
            T (err instanceof Error)
            done()
          })
        })
      })
    })

    describe.skip('> REGRESSIONS', function() {
      //pretty UNIX specific, may not pass on windows... only test on Mac OS X 10.9
      it('should maintain file permissions and ownership', function(done) {

        //http://man7.org/linux/man-pages/man2/stat.2.html
        var S_IFREG = 0100000 //regular file
        var S_IFDIR = 0040000 //directory

        var permDir = path.join(DIR, 'perms')
        fs.mkdirSync(permDir)

        var srcDir = path.join(permDir, 'src')
        fs.mkdirSync(srcDir)

        var f1 = path.join(srcDir, 'f1.txt')
        fs.writeFileSync(f1, '')
        fs.chmodSync(f1, 0666)
        fs.chownSync(f1, process.getuid(), userid.gid('wheel'))
        var f1stats = fs.lstatSync(f1)
        EQ (f1stats.mode - S_IFREG, 0666)

        var d1 = path.join(srcDir, 'somedir')
        fs.mkdirSync(d1)
        fs.chmodSync(d1, 0777)
        fs.chownSync(d1, process.getuid(), userid.gid('staff'))
        var d1stats = fs.lstatSync(d1)
        EQ (d1stats.mode - S_IFDIR, 0777)

        var f2 = path.join(d1, 'f2.bin')
        fs.writeFileSync(f2, '')
        fs.chmodSync(f2, 0777)
        fs.chownSync(f2, process.getuid(), userid.gid('staff'))
        var f2stats = fs.lstatSync(f2)
        EQ (f2stats.mode - S_IFREG, 0777)

        var d2 = path.join(srcDir, 'crazydir')
        fs.mkdirSync(d2)
        fs.chmodSync(d2, 0444)
        fs.chownSync(d2, process.getuid(), userid.gid('wheel'))
        var d2stats = fs.lstatSync(d2)
        EQ (d2stats.mode - S_IFDIR, 0444)

        var destDir = path.join(permDir, 'dest')
        ncp(srcDir, destDir, function(err) {
          F (err)

          var newf1stats = fs.lstatSync(path.join(permDir, 'dest/f1.txt'))
          var newd1stats = fs.lstatSync(path.join(permDir, 'dest/somedir'))
          var newf2stats = fs.lstatSync(path.join(permDir, 'dest/somedir/f2.bin'))
          var newd2stats = fs.lstatSync(path.join(permDir, 'dest/crazydir'))

          EQ (newf1stats.mode, f1stats.mode)
          EQ (newd1stats.mode, d1stats.mode)
          EQ (newf2stats.mode, f2stats.mode)
          EQ (newd2stats.mode, d2stats.mode)

          done();  
        })
      })
    })
  })
})


