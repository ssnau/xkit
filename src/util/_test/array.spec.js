const array = require('../array');
const assert = require('assert');

describe('#array', () => {
  it('partition', () => {
    assert.deepEqual([
      [1,2,3],
      [4,5,6],
      [7,],
    ], array.partition([1,2,3,4,5,6,7], 3))
  });
});
