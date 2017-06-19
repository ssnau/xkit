const async = require('../async');

it('should resolve promise', () => {
  let count = 0;
  return  async(function *() {
    count++;
    yield Promise.resolve(1);
    count++;
    assert.equal(count, 2);
  });
});
