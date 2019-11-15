'use strict'
function moveSyncMethodFactory (fs) {
  return {
    moveSync: require('./move-sync')(fs)
  }
}
module.exports = moveSyncMethodFactory
