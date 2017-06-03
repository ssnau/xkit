const { join } = require('../url');
const assert = require('assert');

it('should join url', () => {
  assert.equal(join('/abc/b', 'c/d'), '/abc/b/c/d');
  assert.equal(join('/abc/b/', 'c/d'), '/abc/b/c/d');
  assert.equal(join('/abc/b/', '/c/d'), '/abc/b/c/d');
});
