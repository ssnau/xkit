const isGeneratorFn = require('../is-generator-fn');
const assert = require('assert');

describe('#is-generator-fn', () => {

  it('should detect', () => {
    assert.equal(isGeneratorFn(function *(){}), true);
    assert.equal(isGeneratorFn(function (){}), false);
    assert.equal(isGeneratorFn(() => ''), false);
  });

});
