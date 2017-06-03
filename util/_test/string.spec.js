const string = require('../string');
const assert = require('assert');

it('should splitBetween', function () {
  assert.deepEqual(
    string.splitBetween('abc[eb]ff', '[', ']'),
     {left: 'abc', middle: 'eb', right: 'ff'}
   );
});
