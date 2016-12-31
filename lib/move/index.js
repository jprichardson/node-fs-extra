// most of this code was written by Andrew Kelley
// licensed under the BSD license: see
// https://github.com/andrewrk/node-mv/blob/master/package.json

// this needs a cleanup

var fs = require('graceful-fs')
var ncp = require('../copy/ncp')
var path = require('path')
var remove = require('../remove').remove
var mkdirp = require('../mkdirs').mkdirs

function mv (source, dest, options, callback) {
  if (typeof options === 'function') {
    callback = options
    options = {}
  }

  var shouldMkdirp = ('mkdirp' in options) ? options.mkdirp : true
  var overwrite = options.overwrite || options.clobber || false

  if (shouldMkdirp) {
    mkdirs()
  } else {
    doRename()
  }

  function mkdirs () {
    mkdirp(path.dirname(dest), function (err) {
      if (err) return callback(err)
      doRename()
    })
  }

  function doRename () {
    if (overwrite) {
      fs.rename(source, dest, function (err) {
        if (!err) return callback()

        if (err.code === 'ENOTEMPTY' || err.code === 'EEXIST') {
          remove(dest, function (err) {
            if (err) return callback(err)
            options.overwrite = false // just overwriteed it, no need to do it again
            mv(source, dest, options, callback)
          })
          return
        }

        // weird Windows shit
        if (err.code === 'EPERM') {
          setTimeout(function () {
            remove(dest, function (err) {
              if (err) return callback(err)
              options.overwrite = false
              mv(source, dest, options, callback)
            })
          }, 200)
          return
        }

        if (err.code !== 'EXDEV') return callback(err)
        moveAcrossDevice(source, dest, overwrite, callback)
      })
    } else {
      fs.link(source, dest, function (err) {
        if (err) {
          if (err.code === 'EXDEV' || err.code === 'EISDIR' || err.code === 'EPERM') {
            moveAcrossDevice(source, dest, overwrite, callback)
            return
          }
          callback(err)
          return
        }
        fs.unlink(source, callback)
      })
    }
  }
}

function moveAcrossDevice (source, dest, overwrite, callback) {
  fs.stat(source, function (err, stat) {
    if (err) {
      callback(err)
      return
    }

    if (stat.isDirectory()) {
      moveDirAcrossDevice(source, dest, overwrite, callback)
    } else {
      moveFileAcrossDevice(source, dest, overwrite, callback)
    }
  })
}

function moveFileAcrossDevice (source, dest, overwrite, callback) {
  var outFlags = overwrite ? 'w' : 'wx'
  var ins = fs.createReadStream(source)
  var outs = fs.createWriteStream(dest, {flags: outFlags})

  ins.on('error', function (err) {
    ins.destroy()
    outs.destroy()
    outs.removeListener('close', onClose)

    // may want to create a directory but `out` line above
    // creates an empty file for us: See #108
    // don't care about error here
    fs.unlink(dest, function () {
      // note: `err` here is from the input stream errror
      if (err.code === 'EISDIR' || err.code === 'EPERM') {
        moveDirAcrossDevice(source, dest, overwrite, callback)
      } else {
        callback(err)
      }
    })
  })

  outs.on('error', function (err) {
    ins.destroy()
    outs.destroy()
    outs.removeListener('close', onClose)
    callback(err)
  })

  outs.once('close', onClose)
  ins.pipe(outs)

  function onClose () {
    fs.unlink(source, callback)
  }
}

function moveDirAcrossDevice (source, dest, overwrite, callback) {
  var options = {
    overwrite: false
  }

  function startNcp () {
    ncp(source, dest, options, function (err) {
      if (err) return callback(err)
      remove(source, callback)
    })
  }

  if (overwrite) {
    remove(dest, function (err) {
      if (err) return callback(err)
      startNcp()
    })
  } else {
    startNcp()
  }
}

module.exports = {
  move: mv
}
