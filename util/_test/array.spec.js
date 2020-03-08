var array = require('../array');
var assert = require('assert');

describe('#array', function () {
  it('partition', function () {
    assert.deepEqual([
      [1,2,3],
      [4,5,6],
      [7 ] ], array.partition([1,2,3,4,5,6,7], 3))
  });
});
