const safeRun = require('../safe-run');
const assert = require('assert');

describe('#safe-run', () => {
  it('test', () => {
    assert.equal(
    safeRun(() => {
      return 100
    }), 100);
    assert.equal(
    safeRun(() => {
      throw '111'
    }), undefined);
  });
});
