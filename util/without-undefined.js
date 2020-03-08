module.exports = function withoutUndefined(obj) {
  var ret = {};
  Object.keys(obj).forEach(function (k) {
    if (typeof obj[k] !== 'undefined') { ret[k] = obj[k]; }
  });
  return ret;
}
