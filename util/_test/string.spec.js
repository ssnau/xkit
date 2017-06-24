var string = require('../string');
var assert = require('assert');

it('startWith', function () {
  assert.ok(string.startWith('abc', 'a'));
  assert.ok(string.startWith('abc', 'ab'));
});

it('endWith', function () {
  assert.ok(string.endWith('abc', 'c'));
  assert.ok(string.endWith('abc', 'bc'));
  assert.ok(string.endWith('/abc/b/', '/'));
});

it('should splitBetween', function () {
  assert.deepEqual(
    string.splitBetween('abc[eb]ff', '[e', ']'),
     {left: 'abc', middle: 'b', right: 'ff'}
   );
   var out = "\n   Id: 1722\n   Title: Hello World\n   Url: http://www.qq.com/\n   Loading: Yes\n   ";
   function getProp(name) {
     var ret = string.splitBetween(out, name + ':', '\n');
     console.log('ccccc');
     console.log(ret);
     console.log('ccccc');
     return ret.middle.trim();
   }
   assert.equal(getProp('Id'), '1722')
   assert.equal(getProp('Title'), 'Hello World')
   assert.equal(getProp('Url'), 'http://www.qq.com/')
   assert.equal(getProp('Loading'), 'Yes')

});


it('should get overlap', function () {
  assert.equal( string.getOverlap('abcde', 'cdef'), 'cde');
  assert.equal( string.getOverlap('abcde/', '/cdef'), '/');
});

it('should check overlap', function () {
  assert.equal( string.isOverlapBy('abc/', '/cde', '/'), true);
  assert.equal( string.isOverlapBy('abc/d', '/def', '/d'), true);
});
