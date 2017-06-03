var fs = require('fs');
var readdir = require('./readdir');
module.exports = function (ref) {
  var dir = ref.dir;
  var callback = ref.callback;
  var pattern = ref.pattern;

  var files = readdir(dir);
  for (var i = 0; i < files.length; i++) {
    var p = normalizePattern(pattern);
    if (!p(files[i])) { continue; }
    var out = callback(fs.readFileSync(files[i], 'utf8'));
    // if not string, do nothing.
    if (typeof out !== 'string') { continue; }
    fs.writeFileSync(files[i], out, 'utf8');
  }
};

function normalizePattern(fn) {
  if (!fn) { return function () { return true; }; }
  if (fn && fn.test) { return function (x) { return fn.test(x); }; }
  return fn;
}
