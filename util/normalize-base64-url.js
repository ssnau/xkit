module.exports = function normalizeBase64URL(str) {
  if (!str) { return 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=='; }
  if (/^data/.test(str)) { return str; }
  if (/^image/.test(str)) { return ("data:" + str); }
  return ("data:image/png;base64," + str);
}
