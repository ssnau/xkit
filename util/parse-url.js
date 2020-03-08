module.exports = function parseUrl(url) {
  var a = document.createElement('a');
  a.href = url;
  return a;
}
