const path = require('path');
const fs = require('fs');
// 返回该目录下所有文件的绝对路径(包括子目录)
function readdir(dir) {
  const files = fs.readdirSync(dir);
  let returnFiles = [];
  for (let i = 0; i < files.length; i++) {
    const absfile = path.join(dir, files[i]);
    const isdir = fs.lstatSync(absfile).isDirectory();
    returnFiles = returnFiles.concat(isdir ? readdir(absfile) : absfile);
  }
  return returnFiles;
};

module.exports = readdir;
