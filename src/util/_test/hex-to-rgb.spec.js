const hexToRgb = require('../hex-to-rgb');
const assert = require('assert');

describe('#hex-to-rgb', () => {
  it('test', () => {
    assert.deepEqual({r:171, g: 205, b: 239 } , hexToRgb('#abcdef'))
  });
});
