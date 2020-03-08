var shallowCopy = require('../shallow-copy');
var assert = require('assert');

it('shallow-copy', function () {
  var input = { a: 'xxx', b: { c: 'vvv' } };
  var output = shallowCopy(input);
  assert.ok(input !== output);
  assert.deepEqual(input, output);
  assert.equal(input.b, output.b);
});
