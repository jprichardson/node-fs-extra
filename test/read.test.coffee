fs = require('../lib')
testutil = require('testutil')
path = require('path')

DIR = ''

describe 'fs-extra', ->
  beforeEach (done) ->
    DIR = testutil.createTempDir()
    done()

  afterEach (done) ->
    fs.remove DIR, done

  describe '+ readJSONFile', ->

    it 'should read a file and parse the json', (done) ->
      obj1 = firstName: 'JP', lastName: 'Richardson'

      file = path.join(DIR, 'file.json')
      fs.writeFileSync(file, JSON.stringify(obj1))

      fs.readJSONFile file, (err, obj2) ->
        F err?
        T obj1.firstName is obj2.firstName
        T obj1.lastName is obj2.lastName
        done()

    it 'should error if it cant parse the json', (done) ->
      file = path.join(DIR, 'file2.json')
      fs.writeFileSync(file, '%asdfasdff444')

      fs.readJSONFile file, (err, obj) ->
        T err?
        F obj
        done()