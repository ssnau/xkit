/**
## example


```
var spawn = require('xspawn');

spawn('ls .')
  .then(function(res) {
    console.log(res.code); // the exit code
    console.log(res.out); // output string
  });
```

## API

you can pass spawn `opts` as the second parameter.

- `$through` means whether you want to log the output to your console
- `$silent` means the command execute in silent mode and never throw error
- `onData` a callback function which will be invoke whenever new output generated
*/
var noop = function(){};
function spawn(command, options) {
  options = options || {};
  return new Promise(function(resolve, reject) {
    var error = '';
    var $through = typeof options.$through === 'undefined' ? true : options.$through, // 是否将stdout, stderr打到控制台
        $silent  = options.$silent || true,
        onData   = options.onData || noop;
    var out = '';
    var cmd = {resolve, reject};
    var child = require('child_process').spawn('sh', ['-c', command]);
    child.stdout.on('data', function (buf) {
      var string = String(buf);
      if ($through) process.stdout.write(string);
      out += string;
      onData(string);
    });
    child.stderr.on('data', function (buf) {
      var string = String(buf);
      if ($through) process.stdout.write(string);
      out += string;
      onData(string);
    });
    child.on('close', function (code) {
      var hasError = String(code) !== '0' && $silent !== true;
      child.stdin.end();
      child.stdout.destroy();
      child.stderr.destroy();
      cmd[hasError ? 'reject' : 'resolve']({code, out});
    });
  });
}

module.exports = spawn;
