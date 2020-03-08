const withoutUndefined = require('../without-undefined');
const assert = require('assert');

describe('#without-undefined', () => {
  it('test', () => {
    const input = {a: 'hello', b: undefined};
    assert.ok(input.hasOwnProperty('a'))
    assert.ok(input.hasOwnProperty('b'))
    const output = withoutUndefined(input)
    assert.ok(output.hasOwnProperty('a'))
    assert.ok(!output.hasOwnProperty('b'))
  });
});
