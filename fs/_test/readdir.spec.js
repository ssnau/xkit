var readdirSync = require('../readdir');
var path = require('path');
var assert = require('assert');

it('should read file', function () {
  var files = readdirSync(path.join(__dirname, 'assets'));
  assert.deepEqual(files,
   [
     path.join(__dirname, 'assets/a/x'),
     path.join(__dirname, 'assets/b/y')
   ]
   );
});
