var promiseCall = require('../promise-call');
var assert = require('assert');

it('should promise call', function () {
  function greet(name, callback) {
    callback(null, 'my name is ' + name);
  }

  return promiseCall(greet, 'jack')
    .then(function (text) {
      assert.equal(text, 'my name is jack');
    });
});

it('should promise call with context', function () {
  var person = {
    greet: function greet(callback) {
      callback(null, 'my name is ' + this.name);
    }
  }

  person.name = 'john' 
  return promiseCall([person.greet, person])
    .then(function (text) {
      assert.equal(text, 'my name is john');
    });
});

it('should promise deal with error', function () {
  var person = {
    greet: function greet(callback) {
      callback('no name');
    }
  }

  return promiseCall([person.greet, person])
    .catch(function (error) {
      assert.equal(error, 'no name');
    });
});
