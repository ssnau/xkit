const async = require('../async');
const assert = require('assert');

describe('#async', () => {

  it('should resolve promise', function () {
    return async(function *() {
      return yield Promise.resolve(1);
    }).then((v) => {
      assert.equal(v, 1);
    });
  });

  it('should handle error', () => {
    return async(function *() {
      yield 6;
      yield 2;
      throw 1;
    }).catch(v => {
      assert.equal(v, 1); 
      return v;
    }).then(v => {
      assert.equal(v, 1); 
    });
  });

});
