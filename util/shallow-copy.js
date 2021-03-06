module.exports = function shallowCopy(obj) {
  if (typeof obj !== 'object') { return obj; }
  if (!obj) { return obj; } // for null / NaN / undefined
  var newObj = Array.isArray(obj) ? [] : {};
  return Object.assign(newObj, obj);
}
