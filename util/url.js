var string = require('./string');
var startWith = string.startWith;
var endWith = string.endWith;

module.export = {
  join, 
};

function join() {
  var url = arguments[0];
  for (var i = 1; i < arguments.length; ++i) {
    var next = arguments[i];
    // both has / at each side
    if (string.isOverlapBy(url, next, '/')) {
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
