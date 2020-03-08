
module.exports = function setPathValue(obj, path, value) {
  const paths = Array.isArray(path) ? path : path.split('.');
  let state = obj;
  const last = paths[paths.length - 1];
  for (let i = 0; i < paths.length - 1; i++) {
    state = state && state[paths[i]];
  }
  if (!state) return false;
  if (value !== state[last]) {
    state[last] = value;
    return true;
  }
  return false;
}
