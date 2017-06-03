const string = require('../string');
const assert = require('assert');

it('startWith', () => {
  assert.ok(string.startWith('abc', 'a'));
  assert.ok(string.startWith('abc', 'ab'));
});

it('endWith', () => {
  assert.ok(string.endWith('abc', 'c'));
  assert.ok(string.endWith('abc', 'bc'));
  assert.ok(string.endWith('/abc/b/', '/'));
});

it('should splitBetween', function () {
  assert.deepEqual(
    string.splitBetween('abc[eb]ff', '[e', ']'),
     {left: 'abc', middle: 'b', right: 'ff'}
   );
});

it('should get overlap', function () {
  assert.equal( string.getOverlap('abcde', 'cdef'), 'cde');
  assert.equal( string.getOverlap('abcde/', '/cdef'), '/');
});

it('should check overlap', function () {
  assert.equal( string.isOverlapBy('abc/', '/cde', '/'), true);
  assert.equal( string.isOverlapBy('abc/d', '/def', '/d'), true);
});
