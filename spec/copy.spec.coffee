crypto = require('crypto')
fs = require('fs-extra')
path = require('path-extra')

describe 'fs-extra', ->

  it 'should copy synchronously', ->
    buf = new Buffer(16*64*1024+7)
    bytesWritten = 0
    while bytesWritten < buf.length
      stringOrNum = (Math.random() <= 0.5)
      data = Math.random()
      if stringOrNum
        buf[bytesWritten] = Math.floor((Math.random()*256))
        bytesWritten += 1
      else
        d = data.toString().replace('0.','')
        bytesWritten += buf.write(d.substring(0,4), bytesWritten)

    ex = Date.now()
    fileToWrite = path.join(path.tempdir(), "TEST_fs-extra_write-#{ex}")
    fileToCopy = path.join(path.tempdir(), "TEST_fs-extra_copy-#{ex}")

    bufMd5 = crypto.createHash('md5').update(buf).digest("hex")
    fs.writeFileSync(fileToWrite, buf)
    writeMd5 = crypto.createHash('md5').update(fs.readFileSync(fileToWrite)).digest("hex")
    fs.copyFileSync(fileToWrite, fileToCopy)
    copyMd5 = crypto.createHash('md5').update(fs.readFileSync(fileToCopy)).digest("hex")

    expect(bufMd5).toEqual(copyMd5)

