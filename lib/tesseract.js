'use strict';

/**
 * Module dependencies.
 */
const fs = require('fs');
const path = require('path');
const {exec} = require('child_process');
// let the os take care of removing zombie tmp files
const tmpdir = require('os').tmpdir();
const uuid = require('uuid');
const glob = require('glob');

const Tesseract = {
  tmpFiles: [],

  /**
   * Default options passed to Tesseract binary.
   * @type {PlainObject}
   */
  options: {
    l: 'eng',
    psm: 3,
    hocr: false,
    tsv: false,
    debug: false,
    oem: null,
    config: null,
    binary: 'tesseract',
    tessdataDir: null
  },

  /**
   * `outputEncoding`.
   * @type {string}
   */
  outputEncoding: 'UTF-8',

  /**
   * Runs Tesseract binary with options.
   *
   * @param {string} image
   * @param {PlainObject} options To pass to Tesseract binary
   * @returns {Promise<string>}
   */
  process (image, options) {
    const defaultOptions = {...Tesseract.options};
    options = {...defaultOptions, ...options};

    // Generate output file name
    const output = path.resolve(tmpdir, 'node-tesseract-' + uuid.v4());

    // Add the tmp file to the list
    Tesseract.tmpFiles.push(output);

    // Assemble tesseract command
    let command = [options.binary, '"' + image + '"', output];

    if (options.tessdataDir) {
      command.push('--tessdata-dir ' + options.tessdataDir);
    }

    if (options.l !== null) {
      command.push('-l ' + options.l);
    }

    if (options.psm !== null) {
      command.push('--psm ' + options.psm);
    }

    if (options.oem !== null) {
      command.push('--oem ' + options.oem);
    }

    if (options.config !== null) {
      command.push(options.config);
    }

    if (options.hocr) {
      command.push('hocr');
    }

    if (options.tsv) {
      command.push('tsv');
    }

    command = command.join(' ');

    const opts = options.env || {};

    if (options.debug) {
      /* eslint-disable no-console */
      console.log(`command: ${command}`);
      console.log(`opts: ${opts}`);
      console.log(`output: ${output}`);
      /* eslint-enable no-console */
    }

    // eslint-disable-next-line promise/avoid-new
    return new Promise((resolve, reject) => {
      // Run the tesseract command
      // eslint-disable-next-line promise/prefer-await-to-callbacks
      exec(command, opts, function (err) {
        if (err) {
          // Something went wrong executing the assembled command
          reject(err);
          return;
        }

        // Find one of the three possible extension
        glob(output + '.+(html|hocr|tsv|txt)', function (error, files) {
          if (error) {
            reject(error);
            return;
          }
          fs.readFile(files[0], Tesseract.outputEncoding, (readError, data) => {
            if (readError) {
              reject(readError);
              return;
            }

            const index = Tesseract.tmpFiles.indexOf(output);
            if (index > -1) Tesseract.tmpFiles.splice(index, 1);

            fs.unlink(files[0], (unlinkError) => {
              if (unlinkError) {
                // eslint-disable-next-line no-console
                console.log(unlinkError);
                return;
              }
              resolve(data);
            });
          });
        });
      });
    });
  }
};

/**
 * @returns {void}
 */
function gc () {
  for (let i = Tesseract.tmpFiles.length - 1; i >= 0; i--) {
    fs.unlink(Tesseract.tmpFiles[i] + '.txt', (unlinkError) => {
      if (unlinkError) {
        // eslint-disable-next-line no-console
        console.log(unlinkError);
      }
    });

    const index = Tesseract.tmpFiles.indexOf(Tesseract.tmpFiles[i]);
    if (index > -1) Tesseract.tmpFiles.splice(index, 1);
  }
}

const version = process.versions.node.split('.').map((value) => {
  return parseInt(value);
});

if (version[0] === 0 &&
  (version[1] < 9 || (version[1] === 9 && version[2] < 5))
) {
  process.addListener(
    'uncaughtException',
    // eslint-disable-next-line promise/prefer-await-to-callbacks
    function _uncaughtExceptionThrown (err) {
      gc();
      throw err;
    }
  );
}

// clean up the tmp files
process.addListener('exit', function _exit (code) {
  gc();
});

/**
 * Module exports.
 */
module.exports.process = Tesseract.process;
