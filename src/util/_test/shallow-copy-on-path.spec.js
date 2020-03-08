const shallowCopyOnPath = require('../shallow-copy-on-path');
const assert = require('assert');

it('shallow-copy-on-path', () => {
  const input = { a: 'xxx', b: { c: 'vvv' }, x: { y: { z: '100' } } };
  const output = shallowCopyOnPath(input, 'x.y');
  assert.ok(input !== output);
  assert.deepEqual(input, output);
  assert.equal(input.b, output.b);
  assert.equal(input.b.c, output.b.c);
  assert.ok(input.x !== output.x);
  assert.ok(input.x.y !== output.x.y);
});
