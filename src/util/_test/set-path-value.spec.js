const setPathValue = require('../set-path-value');
const assert = require('assert');

it('shallow-copy-on-path', () => {
  const input = { a: 'xxx', b: { c: 'vvv' }, x: { y: { z: '100' } } };
  setPathValue(input, 'a', 1)
  assert.equal(input.a, 1);

  setPathValue(input, 'b.c', 1)
  assert.equal(input.b.c, 1);

  setPathValue(input, 'x.y.z', 99)
  assert.equal(input.x.y.z, 99);

  // non-exist path
  setPathValue(input, 'n.m.p', 99)
  assert.equal(input.n, undefined);
});
