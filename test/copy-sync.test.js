var crypto = require('crypto')
var path = require('path')
var mkdirp = require('mkdirp')
var fs = require('../lib')
var testutil = require('testutil')
var userid = require('userid')
var ncp = require('ncp')

var testlib = require('./lib/util')

var terst = require('terst')

var SIZE = 16 * 64 * 1024 + 7
var DIR = ''

describe("+ copySync()", function () {
  beforeEach(function() {
    DIR = testutil.createTestDir('fs-extra')
  })

  afterEach(function(done) {
    fs.remove(DIR, done)
  })

  describe("> when the source is a file", function () {
    it("should copy the file synchronously", function () {
      var fileSrc = path.join(DIR, "TEST_fs-extra_src")
      var fileDest = path.join(DIR, "TEST_fs-extra_copy")
      var fileSrc = testlib.createFileWithData(fileSrc, SIZE)
      var srcMd5 = crypto.createHash('md5').update(fs.readFileSync(fileSrc)).digest("hex")
      var destMd5 = ''
      
      fs.copySync(fileSrc, fileDest)
      
      destMd5 = crypto.createHash('md5').update(fs.readFileSync(fileDest)).digest("hex")
      T(srcMd5 === destMd5)
    })

    it("should follow symlinks", function () {
      var fileSrc = path.join(DIR, "TEST_fs-extra_src")
      var fileDest = path.join(DIR, "TEST_fs-extra_copy")
      var linkSrc = path.join(DIR, "TEST_fs-extra_copy_link")
      var fileSrc = testlib.createFileWithData(fileSrc, SIZE)
      var srcMd5 = crypto.createHash('md5').update(fs.readFileSync(fileSrc)).digest("hex")
      var destMd5 = ''

      fs.symlinkSync(fileSrc, linkSrc)
      fs.copySync(linkSrc, fileDest)
      destMd5 = crypto.createHash('md5').update(fs.readFileSync(fileDest)).digest("hex")
      T(srcMd5 === destMd5)
    })

    it("should maintain file mode", function () {
      var fileSrc = path.join(DIR, "TEST_fs-extra_src")
      var fileDest = path.join(DIR, "TEST_fs-extra_copy")
      var fileSrc = testlib.createFileWithData(fileSrc, SIZE)
      
      fs.chmodSync(fileSrc, 0750)
      fs.copySync(fileSrc, fileDest)

      var statSrc = fs.statSync(fileSrc)
      var statDest = fs.statSync(fileDest)
      EQ (statSrc.mode, statDest.mode)
    })

    it("should only copy files allowed by filter regex", function() {
      var srcFile1 = testlib.createFileWithData(path.join(DIR, "1.html"), SIZE)
      var srcFile2 = testlib.createFileWithData(path.join(DIR, "2.css"), SIZE)
      var srcFile3 = testlib.createFileWithData(path.join(DIR, "3.jade"), SIZE)
      var destFile1 = path.join(DIR, "dest1.html")
      var destFile2 = path.join(DIR, "dest2.css")
      var destFile3 = path.join(DIR, "dest3.jade")
      var filter = /.html$|.css$/i
      
      fs.copySync(srcFile1, destFile1, filter)
      fs.copySync(srcFile2, destFile2, filter)
      fs.copySync(srcFile3, destFile3, filter)
      
      T(fs.existsSync(destFile1))
      T(fs.existsSync(destFile2))
      T(!fs.existsSync(destFile3))
    })

    it("should only copy files allowed by filter fn", function() {
      var srcFile1 = testlib.createFileWithData(path.join(DIR, "1.html"), SIZE)
      var srcFile2 = testlib.createFileWithData(path.join(DIR, "2.css"), SIZE)
      var srcFile3 = testlib.createFileWithData(path.join(DIR, "3.jade"), SIZE)
      var destFile1 = path.join(DIR, "dest1.html")
      var destFile2 = path.join(DIR, "dest2.css")
      var destFile3 = path.join(DIR, "dest3.jade")
      
      var filter = function(s) { return s.split(".").pop() !== "css";}
      
      fs.copySync(srcFile1, destFile1, filter)
      fs.copySync(srcFile2, destFile2, filter)
      fs.copySync(srcFile3, destFile3, filter)
      
      T(fs.existsSync(destFile1))
      T(!fs.existsSync(destFile2))
      T(fs.existsSync(destFile3))
    })

    describe("> when the destination dir does not exist", function () {
      it('should create the destination directory and copy the file', function () {
        var src = path.join(DIR, 'file.txt')
        var dest = path.join(DIR, 'this/path/does/not/exist/copied.txt')
        var data = "did it copy?\n"

        fs.writeFileSync(src, data, 'utf8')
        fs.copySync(src, dest)
        
        var data2 = fs.readFileSync(dest, 'utf8')
        
        EQ(data, data2)
      })
    })
  })

  describe("> when the source is a directory", function() {
    it("should copy the directory synchronously", function() {
      var FILES = 2
      var src = path.join(DIR, 'src')
      var dest = path.join(DIR, 'dest')
      
      var i, j
      
      mkdirp.sync(src)
      
      for (i = 0; i < FILES; ++i)
        testlib.createFileWithData(path.join(src, i.toString()), SIZE)
      
      var subdir = path.join(src, 'subdir')
      
      mkdirp.sync(subdir)
      
      for (i = 0; i < FILES; ++i)
        testlib.createFileWithData(path.join(subdir, i.toString()), SIZE)
      
      fs.copySync(src, dest)
      T (fs.existsSync(dest))

      for (i = 0; i < FILES; ++i) T (fs.existsSync(path.join(dest, i.toString())))

      var destSub = path.join(dest, 'subdir')
      for (j = 0; j < FILES; ++j) T (fs.existsSync(path.join(destSub, j.toString())))
    })

    it("should preserve symbolic links", function() {
      var FILES = 2
      var src = path.join(DIR, 'src')
      var dest = path.join(DIR, 'dest')
      var i, j

      mkdirp.sync(src)
      fs.symlinkSync('destination', path.join(src, 'symlink'))

      fs.copySync(src, dest)

      var link = fs.readlinkSync(path.join(dest, 'symlink'))
      EQ (link, 'destination')
    })

    it("should should apply filter recursively", function() {
      var FILES = 2
      var src = path.join(DIR, 'src')
      var dest = path.join(DIR, 'dest')
      var filter = /0$/i

      mkdirp.sync(src)
      
      for (var i = 0; i < FILES; ++i)
        testlib.createFileWithData(path.join(src, i.toString()), SIZE)
      
      var subdir = path.join(src, 'subdir')
      mkdirp.sync(subdir)
      
      for (i = 0; i < FILES; ++i)
        testlib.createFileWithData(path.join(subdir, i.toString()), SIZE)
      
      fs.copySync(src, dest, filter)
      
      T (fs.existsSync(dest))
      T (FILES>1)

      for (i = 0; i < FILES; ++i) {
        if (i==0) {
          T (fs.existsSync(path.join(dest, i.toString())))
        } else {
          T (!fs.existsSync(path.join(dest, i.toString())))
        }
      }

      var destSub = path.join(dest, 'subdir')
      
      for (var j = 0; j < FILES; ++j) {
        if (j==0) {
          T (fs.existsSync(path.join(destSub, j.toString())))
        } else {
          T (!fs.existsSync(path.join(destSub, j.toString())))
        }
      }
    })

    describe("> when the destination dir does not exist", function() {
      it("should create the destination directory and copy the file", function() {
        var src = path.join(DIR, 'data/')
        fs.mkdirSync(src)

        var d1 = "file1"
        var d2 = "file2"
        var f1 = fs.writeFileSync(path.join(src, "f1.txt"), d1)
        var f2 = fs.writeFileSync(path.join(src, "f2.txt"), d2)

        var dest = path.join(DIR, 'this/path/does/not/exist/outputDir')

        fs.copySync(src, dest)

        var o1 = fs.readFileSync(path.join(dest, 'f1.txt'), 'utf8')
        var o2 = fs.readFileSync(path.join(dest, 'f2.txt'), 'utf8')

        EQ (d1, o1)
        EQ (d2, o2)
      })
    })
  })
})

