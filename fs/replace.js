const fs = require('fs');
const readdir = require('./readdir');
module.exports = function ({ dir, callback }) {
  const files = readdir(dir);
  for (let i = 0; i < files.length; i++) {
    const out = callback(fs.readFileSync(files[i], 'utf8'));
    fs.writeFileSync(files[i], out, 'utf8');
  }
};
