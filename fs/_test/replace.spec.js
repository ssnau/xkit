const assert = require('assert');
const replace = require('../replace');
const execSync = require('child_process').execSync;
const path = require('path');
const fs = require('fs');
const xpath = path.join(__dirname, 'assets/a/x');
const xCopyPath = path.join(__dirname, 'assets/a/x.copy');

describe('#replace', () => {
  beforeEach(() => {
    execSync(`cp ${xpath} ${xCopyPath}`);
  });

  afterEach(() => {
    execSync(`rm ${xCopyPath}`);
  });

  it('should replace file', () => {
    replace({
      dir: path.resolve(xpath, '..'),
      callback: (content) => {
        return content.replace('jack', 'tom');
      }
    });
    const content1 = fs.readFileSync(xpath, 'utf8');
    const content2 = fs.readFileSync(xCopyPath, 'utf8');
    assert.equal(
      content1.replace('jack', 'tom'),
      content2
    );


  });
});
