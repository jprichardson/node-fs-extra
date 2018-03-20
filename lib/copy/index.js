const u = require('universalify').fromCallback
module.exports = fs => ({
  copy: u(require('./copy')(fs))
})
