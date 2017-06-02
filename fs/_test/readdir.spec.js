const readdirSync = require('../readdir');
const path = require('path');
const assert = require('assert');

it('should read file', () => {
  const files = readdirSync(path.join(__dirname, 'assets'));
  assert.deepEqual(files,
   [
     path.join(__dirname, 'assets/a/x'),
     path.join(__dirname, 'assets/b/y')
   ]
   );
});
