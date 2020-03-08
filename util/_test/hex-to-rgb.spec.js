var hexToRgb = require('../hex-to-rgb');
var assert = require('assert');

describe('#hex-to-rgb', function () {
  it('test', function () {
    assert.deepEqual({r:171, g: 205, b: 239 } , hexToRgb('#abcdef'))
  });
});
