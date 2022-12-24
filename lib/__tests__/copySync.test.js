'use strict'

/* eslint-env mocha */

const assert = require('assert');
const fse = require('..');
const pathUtils = require('path');

describe('copySync', () => {
  describe('copySync recursive', () => {
    it('ensure filter option function is called for every file', () => {
      const sourceFolderPath = pathUtils.resolve(
        'folder_to_be_recursiverly_copied'
      );
      const destinationFolderPath = pathUtils.resolve('destination_folder');

      const filePaths = [
        pathUtils.join(sourceFolderPath, 'first_file'),
        pathUtils.join(sourceFolderPath, 'second_file'),
      ];

      console.log({ filePaths });

      for (const filePath of filePaths) {
        fsExtra.createFileSync(filePath);
      }

      let filterCallsCount = 0;
      fsExtra.copySync(sourceFolderPath, destinationFolderPath, {
        recursive: true,
        filter: (src, dest) => {
          ++filterCallsCount;
          assert.ok(filePaths.includes(src));
          return false;
        },
      });

      assert.equal(filterCallsCount, filePaths.length);
    });
  });
});

