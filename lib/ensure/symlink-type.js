'use strict'

const prep = fs => {
  function symlinkType (srcpath, type, callback) {
    callback = (typeof type === 'function') ? type : callback
    type = (typeof type === 'function') ? false : type
    if (type) return callback(null, type)
    fs.lstat(srcpath, (err, stats) => {
      if (err) return callback(null, 'file')
      type = (stats && stats.isDirectory()) ? 'dir' : 'file'
      callback(null, type)
    })
  }

  function symlinkTypeSync (srcpath, type) {
    let stats

    if (type) return type
    try {
      stats = fs.lstatSync(srcpath)
    } catch (e) {
      return 'file'
    }
    return (stats && stats.isDirectory()) ? 'dir' : 'file'
  }

  return {
    symlinkType,
    symlinkTypeSync
  }
}

module.exports = prep
