'use strict';

const {join} = require('path');
const {expect} = require('chai');
const tesseract = require('../lib/tesseract');

describe('process', function () {
  it('should return the string "node-tesseract"', async function () {
    const testImage = join(__dirname, '/test.png');

    let text = '';
    try {
      text = await tesseract.process(testImage);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log(err);
    }
    expect(text.trim()).to.equal('node-tesseract');
  });
});
