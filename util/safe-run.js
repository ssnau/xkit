module.exports = function (fn) {
  try {
    return fn();
  } catch (e) {
    return undefined;
  }
}
