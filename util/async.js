var isGeneratorFn = require('./is-generator-fn');

function wrap(makeGenerator){
  return function () {
    var generator = makeGenerator.apply(this, arguments);

    function handle(result){
      // result => { done: [Boolean], value: [Object] }
      if (result.done) { return Promise.resolve(result.value); }

      return Promise
        .resolve(result.value)
        .then(
          function (res) { return handle(generator.next(res)); },
          function (err) { return generator.throw(err); }
        );
    }

    try {
      return handle(generator.next());
    } catch (ex) {
      return Promise.reject(ex);
    }
  }
}

function co(fn) {
  return wrap(fn).apply(this, arguments);
}

co.wrap = function (obj) {
  if (isGeneratorFn(obj)) { return wrap(obj); }
  if (typeof obj === 'function') { return obj; }
  if (!obj) { return obj; }

  var ret = Array.isArray(obj) ? [] : {};
  Object.keys(obj).forEach(function (k) {
    ret[k] = isGeneratorFn(obj[k]) ? wrap(obj[k]) : obj[k];
  });
  return ret;
};

co.run = co;

module.exports = co;