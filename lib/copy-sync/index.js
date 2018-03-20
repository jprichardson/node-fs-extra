module.exports = fs => ({
  copySync: require('./copy-sync')(fs)
})
