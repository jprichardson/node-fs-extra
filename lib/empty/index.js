'use strict'

const u = require('universalify').fromCallback
const path = require('path')

const _mkdir = require('../mkdirs')
const _remove = require('../remove')

const prep = fs => {
  const mkdir = _mkdir(fs)
  const remove = _remove(fs)

  const emptyDir = u(function emptyDir (dir, callback) {
    callback = callback || function () {}
    fs.readdir(dir, (err, items) => {
      if (err) return mkdir.mkdirs(dir, callback)

      items = items.map(item => path.join(dir, item))

      deleteItem()

      function deleteItem () {
        const item = items.pop()
        if (!item) return callback()
        remove.remove(item, err => {
          if (err) return callback(err)
          deleteItem()
        })
      }
    })
  })

  function emptyDirSync (dir) {
    let items
    try {
      items = fs.readdirSync(dir)
    } catch (err) {
      return mkdir.mkdirsSync(dir)
    }

    items.forEach(item => {
      item = path.join(dir, item)
      remove.removeSync(item)
    })
  }

  return {
    emptyDirSync,
    emptydirSync: emptyDirSync,
    emptyDir,
    emptydir: emptyDir
  }
}

module.exports = prep
