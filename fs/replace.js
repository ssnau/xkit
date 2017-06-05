var fs = require('fs');
var readdir = require('./readdir');
module.exports = function (ref) {
  var dir = ref.dir;
  var callback = ref.callback;
  var pattern = ref.pattern;

  var files = readdir(dir, { pattern: pattern });
  for (var i = 0; i < files.length; i++) {
    var out = callback(fs.readFileSync(files[i], 'utf8'));
    // if not string, do nothing.
    if (typeof out !== 'string') { continue; }
    fs.writeFileSync(files[i], out, 'utf8');
  }
};
