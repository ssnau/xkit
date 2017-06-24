var async = require('../async');
var assert = require('assert');

describe('#async', function () {

  it('should resolve promise', function () {
    return async(function *() {
      return yield Promise.resolve(1);
    }).then(function (v) {
      assert.equal(v, 1);
    });
  });

  it('should handle error', function () {
    return async(function *() {
      yield 6;
      yield 2;
      throw 1;
    }).catch(function (v) {
      assert.equal(v, 1); 
      return v;
    }).then(function (v) {
      assert.equal(v, 1); 
    });
  });

  it('should wrap generator function', function () {
    function* go() {
      return 1;
    }
    return async
      .wrap(go)()
      .then(function (v) { return assert.equal(v, 1); });
  });

  it('should wrap array of generator functions', function () {
    var fns = [function* go() {
      return 1;
    }, function *go2() {
      return 2;
    }]
    return async
      .wrap(fns[1])()
      .then(function (v) { return assert.equal(v, 2); });
  });

  it('should wrap object of generator functions values', function () {
    var u = {
      go: function* go() {
        return this.name;
      },
      name: 'haha',
    };
    return async
      .wrap(u)
      .go()
      .then(function (v) { return assert.equal(v, 'haha'); });
  });

});
