const normalizeBase64Url = require('../normalize-base64-url');
const assert = require('assert');

describe('#normalize-base64-url', () => {
  it('test', () => {
    assert.deepEqual('data:image/png;base64,abc' , normalizeBase64Url('abc'))
  });
});
