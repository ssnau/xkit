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

  it('should wrap generator function', () => {
    function* go() {
      return 1;
    }
    return async
      .wrap(go)()
      .then(v => assert.equal(v, 1));
  });

  it('should wrap array of generator functions', () => {
    const fns = [function* go() {
      return 1;
    }, function *go2() {
      return 2;
    }]
    return async
      .wrap(fns[1])()
      .then(v => assert.equal(v, 2));
  });

  it('should wrap object of generator functions values', () => {
    const u = {
      *go() {
        return this.name;
      },
      name: 'haha',
    };
    return async
      .wrap(u)
      .go()
      .then(v => assert.equal(v, 'haha'));
  });

});
