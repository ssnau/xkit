module.exports = {
  startWith,
  endWith,
  getOverlap,
  isOverlapBy
};

function startWith(a, b) {
  return a.indexOf(b) === 0;
}
function endWith(a, b) {
  return a.indexOf(b) == (a.length - b.length);
}
/**
 * get the overlapped part of the provided two string.
 * input:
 *   a: abcdefg
 *   b: defgxyz
 * output: 
 *   defg
 */
function getOverlap(a, b) {
  var len = Math.min(a.length, b.length);

  for (var i = len; i > 0; i--) {
    var needle = b.slice(0, i);
    if (isOverlapBy(a, b, needle)) return needle;
  }
  return '';
}

function isOverlapBy(a, b, needle) {
  return !!needle && endWith(a, needle) && startWith(b, needle);
}
