var normalizeBase64Url = require('../normalize-base64-url');
var assert = require('assert');

describe('#normalize-base64-url', function () {
  it('test', function () {
    assert.deepEqual('data:image/png;base64,abc' , normalizeBase64Url('abc'))
  });
});
