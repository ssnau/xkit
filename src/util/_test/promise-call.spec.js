var promiseCall = require('../promise-call');
var assert = require('assert');

it('should promise call', () => {
  function greet(name, callback) {
    callback(null, 'my name is ' + name);
  }

  return promiseCall(greet, 'jack')
    .then(text => {
      assert.equal(text, 'my name is jack');
    });
});

it('should promise call with context', () => {
  const person = {
    greet(callback) {
      callback(null, 'my name is ' + this.name);
    }
  }

  person.name = 'john' 
  return promiseCall([person.greet, person])
    .then(text => {
      assert.equal(text, 'my name is john');
    });
});

it('should promise deal with error', () => {
  const person = {
    greet(callback) {
      callback('no name');
    }
  }

  return promiseCall([person.greet, person])
    .catch(error => {
      assert.equal(error, 'no name');
    });
});
