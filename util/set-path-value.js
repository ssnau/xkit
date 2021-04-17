
module.exports = function setPathValue(obj, path, value) {
  var paths = Array.isArray(path) ? path : path.split('.');
  var state = obj;
  var last = paths[paths.length - 1];
  for (var i = 0; i < paths.length - 1; i++) {
    state = state && state[paths[i]] !== Object.prototype && state[paths[i]];
  }
  if (!state) { return false; }
  if (value !== state[last]) {
    state[last] = value;
    return true;
  }
  return false;
}
