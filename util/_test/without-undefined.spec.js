var withoutUndefined = require('../without-undefined');
var assert = require('assert');

describe('#without-undefined', function () {
  it('test', function () {
    var input = {a: 'hello', b: undefined};
    assert.ok(input.hasOwnProperty('a'))
    assert.ok(input.hasOwnProperty('b'))
    var output = withoutUndefined(input)
    assert.ok(output.hasOwnProperty('a'))
    assert.ok(!output.hasOwnProperty('b'))
  });
});
