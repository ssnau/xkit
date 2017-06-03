var assert = require('assert');
var replace = require('../replace');
var execSync = require('child_process').execSync;
var path = require('path');
var fs = require('fs');
var xpath = path.join(__dirname, 'assets/a/x');
var xCopyPath = path.join(__dirname, 'assets/a/x.copy');

describe('#replace', function () {
  beforeEach(function () {
    execSync(("cp " + xpath + " " + xCopyPath));
  });

  afterEach(function () {
    execSync(("rm " + xCopyPath));
  });

  it('should replace file', function () {
    replace({
      dir: path.resolve(xpath, '..'),
      pattern: /copy/,
      callback: function (content) {
        return content.replace('jack', 'tom');
      }
    });
    var content1 = fs.readFileSync(xpath, 'utf8');
    var content2 = fs.readFileSync(xCopyPath, 'utf8');
    assert.equal(
      content1.replace('jack', 'tom'),
      content2
    );
  });

  it('should not replace if return non-string', function () {
    replace({
      dir: path.resolve(xpath, '..'),
      pattern: /copy/,
      callback: function (content) { return; }
    });

    replace({
      dir: path.resolve(xpath, '..'),
      pattern: /copy/,
      callback: function (content) { return false; }
    });

    var content1 = fs.readFileSync(xpath, 'utf8');
    var content2 = fs.readFileSync(xCopyPath, 'utf8');
    assert.equal(content1, content2);
  });
});
