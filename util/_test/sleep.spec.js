var co = require('co');
var sleep = require('../sleep');
var assert = require('assert');

it('should sleep for 100ms', co.wrap(function*() {
  var start = Date.now();
  yield sleep(100);
  assert.ok(Date.now() - start >= 100);
}));
