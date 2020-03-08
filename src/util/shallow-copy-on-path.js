const shallowCopy = require('./shallow-copy');
const setPathValue = require('./set-path-value');

module.exports = function shallowCopyOnPath(obj, path) {
  if (!path || !path.length) return shallowCopy(obj);
  const paths = Array.isArray(path) ? path : path.split('.');
  const newObj = shallowCopy(obj);
  const len = paths.length;
  let l = 1;
  while (l <= len) {
    const p = paths.slice(0, l);
    setPathValue(newObj, p, shallowCopy(safeGet(obj, p)));
    l++;
  }
  return newObj;
}

function safeGet(obj, path) {
   if (!obj || !path.length) return obj;
   const paths = typeof path === 'string' ? path.split('.') : path;
   return safeGet(obj[paths[0]], paths.slice(1));
}
