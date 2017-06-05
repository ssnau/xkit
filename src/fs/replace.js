const fs = require('fs');
const readdir = require('./readdir');
module.exports = function ({ dir, callback, pattern }) {
  const files = readdir(dir, { pattern });
  for (let i = 0; i < files.length; i++) {
    const out = callback(fs.readFileSync(files[i], 'utf8'));
    // if not string, do nothing.
    if (typeof out !== 'string') continue;
    fs.writeFileSync(files[i], out, 'utf8');
  }
};
