var fs = require('fs')
var path = require('path')
var Readable = require('stream').Readable
var util = require('util')
var assign = require('../util/assign')

// DO NOT USE OR DEPEND UPON FILTER. It will almost certainly be removed.
function Walker (dir, filter, streamOptions) {
  Readable.call(this, assign({ objectMode: true }, streamOptions))
  this.path = path.resolve(dir)
  this.filter = filter
  this.pending = 0
  this.start()
}
util.inherits(Walker, Readable)

Walker.prototype.start = function () {
  this.visit(this.path)
  return this
}

Walker.prototype.visit = function (item) {
  this.pending++
  var self = this

  fs.lstat(item, function (err, stats) {
    if (err) {
      self.emit('error', err, {path: item, stats: stats})
      return self.finishItem()
    }

    if (self.filter && !self.filter({path: item, stats: stats})) return self.finishItem()

    if (!stats.isDirectory()) {
      self.push({ path: item, stats: stats })
      return self.finishItem()
    }

    fs.readdir(item, function (err, items) {
      if (err) {
        self.emit('error', err, {path: item, stats: stats})
        return self.finishItem()
      }

      self.push({path: item, stats: stats})
      items.forEach(function (part) {
        self.visit(path.join(item, part))
      })
      self.finishItem()
    })
  })
  return this
}

Walker.prototype.finishItem = function () {
  this.pending -= 1
  if (this.pending === 0) this.push(null)
  return this
}

Walker.prototype._read = function () { }

module.exports = Walker
