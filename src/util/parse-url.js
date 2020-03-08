module.exports = function parseUrl(url) {
  const a = document.createElement('a');
  a.href = url;
  return a;
}
