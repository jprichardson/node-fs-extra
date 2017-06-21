const u = require('../promises').fromCallback
module.exports = {
  copy: u(require('./copy'))
}
