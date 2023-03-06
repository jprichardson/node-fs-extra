const fs = require('graceful-fs')
const path = require('path')

// USER CONFIGURATION
let runCrossDeviceTests = false // change to true to enable
const differentDevice = '/mnt' // change this path to a mounted device

if (runCrossDeviceTests) {
  // make sure we have permission on device
  try {
    fs.writeFileSync(path.join(differentDevice, 'file'), 'hi')
  } catch {
    runCrossDeviceTests = false
    throw new Error(`Can't write to device ${differentDevice}`)
  }
} else console.log('Skipping cross-device move tests')

module.exports = {
  differentDevice,
  ifCrossDeviceEnabled: (fn) => runCrossDeviceTests ? fn : fn.skip
}
