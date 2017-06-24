module.exports = {
  startWith,
  endWith,
  getOverlap,
  isOverlapBy,
  splitBetween,
};

function startWith(a, b) {
  return a.indexOf(b) === 0;
}
function endWith(a, b) {
  const len = a.length;
  if (b.length > a.length) return false;
  if (b.length === a.length && a !== b) return false;
  return a.slice(a.length - b.length) === b;
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

/**
 * splitBetween('abc[eeb]ff', '[', ']');
 * get:
 *   {left: 'abc', middle: 'eeb', right: 'ff'}
 */
function splitBetween(s, start, end) {
  var sindex = s.indexOf(start);
  if (sindex === -1) return '';
  var eindex = s.indexOf(end, sindex + 1);
  if (eindex === -1) return '';
  return {
    left: s.slice(0, sindex),
    middle: s.slice(sindex + start.length, eindex),
    right: s.slice(eindex + end.length),
  }
}
