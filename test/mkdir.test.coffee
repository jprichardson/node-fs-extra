fs = require('../lib')
path = require('path-extra')
testutil = require('testutil')

describe 'fs-extra', ->
  describe '+ mkdir()', ->
    it 'should make the directory', (done) ->
      dir = path.join(path.tempdir(), 'tmp-' + Date.now() + Math.random())
      F fs.existsSync dir
      fs.mkdir dir, (err) ->
        T err is null
        T fs.existsSync dir
        done()

    it 'should make the entire directory path', (done) ->
      dir = path.join(path.tempdir(), 'tmp-' + Date.now() + Math.random())
      newDir = path.join(dir, 'dfdf', 'ffff', 'aaa')
      F fs.existsSync dir
      fs.mkdir newDir, (err) ->
        T err is null
        T fs.existsSync newDir
        done()

  describe '+ mkdirSync()', ->
    it 'should make the directory', (done) ->
      dir = path.join(path.tempdir(), 'tmp-' + Date.now() + Math.random())
      F fs.existsSync dir
      fs.mkdirSync dir
      T fs.existsSync dir
      done()

    it 'should make the entire directory path', (done) ->
      dir = path.join(path.tempdir(), 'tmp-' + Date.now() + Math.random())
      newDir = path.join(dir, 'dfdf', 'ffff', 'aaa')
      F fs.existsSync dir
      fs.mkdirSync dir 
      T fs.existsSync dir
      done()