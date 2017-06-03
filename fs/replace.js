const fs = require('fs');
const readdir = require('./readdir');
module.exports = function ({ dir, callback, pattern }) {
  const files = readdir(dir);
  for (let i = 0; i < files.length; i++) {
    const p = normalizePattern(pattern);
    if (!p(files[i])) continue;
    const out = callback(fs.readFileSync(files[i], 'utf8'));
    // if not string, do nothing.
    if (typeof out !== 'string') return;
    fs.writeFileSync(files[i], out, 'utf8');
  }
};

function normalizePattern(fn) {
  if (!fn) return () => true;
  if (fn && fn.test) return (x) => fn.test(x);
  return fn;
}
