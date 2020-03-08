var shallowCopy = require('./shallow-copy');
var setPathValue = require('./set-path-value');

module.exports = function shallowCopyOnPath(obj, path) {
  if (!path || !path.length) { return shallowCopy(obj); }
  var paths = Array.isArray(path) ? path : path.split('.');
  var newObj = shallowCopy(obj);
  var len = paths.length;
  var l = 1;
  while (l <= len) {
    var p = paths.slice(0, l);
    setPathValue(newObj, p, shallowCopy(safeGet(obj, p)));
    l++;
  }
  return newObj;
}

function safeGet(obj, path) {
   if (!obj || !path.length) { return obj; }
   var paths = typeof path === 'string' ? path.split('.') : path;
   return safeGet(obj[paths[0]], paths.slice(1));
}
