var safeRun = require('../safe-run');
var assert = require('assert');

describe('#safe-run', function () {
  it('test', function () {
    assert.equal(
    safeRun(function () {
      return 100
    }), 100);
    assert.equal(
    safeRun(function () {
      throw '111'
    }), undefined);
  });
});
