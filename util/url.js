var string = require('./string');
var startWith = string.startWith;
var endWith = string.endWith;

function join() {
  var arguments$1 = arguments;

  var url = arguments[0];
  for (var i = 1; i < arguments.length; ++i) {
    var next = arguments$1[i];
    // both has / at each side
    if (endWith(url, '/') && startWith(next, '/')) {
      url = url + next.slice(1); 
      continue;
    }
    if (!endWith(url, '/') && !startWith(next, '/')) {
      url = url + '/' + next;
      continue;
    }
    url = url + next;
  }
  return url;
}

module.exports = {
  join: join, 
};
