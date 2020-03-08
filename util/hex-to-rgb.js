module.exports = function hexToRgb(str) {
  var hex = str.indexOf('#') === 0 ? str.slice(1) : str;
  var r = hex.length === 6 ? hex.slice(0, 2) : hex.slice(0, 1);
  var g = hex.length === 6 ? hex.slice(2, 4) : hex.slice(1, 2);
  var b = hex.length === 6 ? hex.slice(4, 6) : hex.slice(2, 3);

  return {
    r: parseInt(r, 16),
    g: parseInt(g, 16),
    b: parseInt(b, 16),
  };
}
