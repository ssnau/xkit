var path = require('path');
var fs = require('fs');
// 返回该目录下所有文件的绝对路径(包括子目录)
function readdir(dir) {
  var files = fs.readdirSync(dir);
  var returnFiles = [];
  for (var i = 0; i < files.length; i++) {
    var absfile = path.join(dir, files[i]);
    var isdir = fs.lstatSync(absfile).isDirectory();
    returnFiles = returnFiles.concat(isdir ? readdir(absfile) : absfile);
  }
  return returnFiles;
};

module.exports = readdir;
