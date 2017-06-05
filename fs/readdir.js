var path = require('path');
var fs = require('fs');
// 返回该目录下所有文件的绝对路径(包括子目录)
function readdir(dir, opts) {
  if ( opts === void 0 ) opts={};

  var files = fs.readdirSync(dir);
  var p = normalizePattern(opts.pattern);
  var returnFiles = [];
  for (var i = 0; i < files.length; i++) {
    var absfile = path.join(dir, files[i]);
    if (!p(absfile)) { continue; }
    var isdir = fs.lstatSync(absfile).isDirectory();
    returnFiles = returnFiles.concat(isdir ? readdir(absfile, opts) : absfile);
  }
  return returnFiles;
};

function normalizePattern(fn) {
  if (!fn) { return function () { return true; }; }
  if (fn && fn.test) { return function (x) { return fn.test(x); }; }
  return fn;
}

module.exports = readdir;
