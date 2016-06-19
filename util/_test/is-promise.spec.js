var co = require('co');
var isPromise = require('../is-promise');
var assert = require('assert');

it('should detect promise', co.wrap(function*() {
  var p = Promise.resolve(1);
  assert.ok(isPromise(p));

  var p = Promise.reject(1);
  assert.ok(isPromise(p));

  assert.ok(!isPromise({}));
  assert.ok(!isPromise(1));
}));
