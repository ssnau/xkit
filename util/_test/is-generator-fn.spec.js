var isGeneratorFn = require('../is-generator-fn');
var assert = require('assert');

describe('#is-generator-fn', function () {

  it('should detect', function () {
    assert.equal(isGeneratorFn(function *(){}), true);
    assert.equal(isGeneratorFn(function (){}), false);
    assert.equal(isGeneratorFn(function () { return ''; }), false);
  });

});
