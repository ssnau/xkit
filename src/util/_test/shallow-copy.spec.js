const shallowCopy = require('../shallow-copy');
const assert = require('assert');

it('shallow-copy', () => {
  const input = { a: 'xxx', b: { c: 'vvv' } };
  const output = shallowCopy(input);
  assert.ok(input !== output);
  assert.deepEqual(input, output);
  assert.equal(input.b, output.b);
});
