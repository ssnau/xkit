const path = require('path');
const fs = require('fs');
// 返回该目录下所有文件的绝对路径(包括子目录)
function readdir(dir, opts={}) {
  const files = fs.readdirSync(dir);
  const p = normalizePattern(opts.pattern);
  let returnFiles = [];
  for (let i = 0; i < files.length; i++) {
    const absfile = path.join(dir, files[i]);
    if (!p(absfile)) continue;
    const isdir = fs.lstatSync(absfile).isDirectory();
    returnFiles = returnFiles.concat(isdir ? readdir(absfile, opts) : absfile);
  }
  return returnFiles;
};

function normalizePattern(fn) {
  if (!fn) return () => true;
  if (fn && fn.test) return (x) => fn.test(x);
  return fn;
}

module.exports = readdir;
