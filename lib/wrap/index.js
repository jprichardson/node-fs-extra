'use strict'

const u      = require('universalify').fromCallback
const fs     = require('fs')
const path   = require('path')
const move   = require('../move-sync')
const mkdirs = require('../mkdirs')


function wrap(src, dst, cb){
    if(!dst) return cb(new Error('No folder supplied'));
    fs.stat(src, (err, stat) => {
        if (err) return cb(err);
        if (!stat || !stat.isDirectory()) return cb(new Error('Source folder should be an existing folder'));

        fs.readdir(src, (err, items) => {
            if (err) return cb(err);
            if (!items.length) return cb(new Error('Empty folder'));

            let newFolder = path.join(src, dst);
            mkdirs.ensureDir(newFolder, (err) => {
                if (err) return cb(err);
                items.forEach(function(item) {
                    let oldItem = path.resolve(src, item);
                    let newItem = path.resolve(newFolder, item);
                    move.moveSync(oldItem, newItem);
                });
                return cb(null, true);
            });
        });
    });
}

module.exports = {
  wrap: u(wrap)
};