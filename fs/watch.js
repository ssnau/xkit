var fs = require('fs');
var path = require('path');

/**
   * watch a folder with given configuration.
   *
   * path: directory to watch
   * pattern: RegExp or Function to filter the files you concern.
   * callback: callbacks when files changed.
   * watcherName: the name of your watcher.
   *
   */
function watch(config) {
  var dir = config.directory || config.dir || config.path;
  var pattern = config.pattern || config.patterns || /.*/;
  var callback = config.callback;
  var watcherName = config.name || 'anomynous';

  function check(pt) {
    return [].concat(pattern).every(function (p) {
      return typeof p === 'function' ? p(pt) : p.test(pt);
    });
  }
  if (!exists(dir)) {
    console.log('fail to watch. ' + dir + ' is not exists!');
    return;
  }
  fs.watch(dir, {recursive: true, persistent: true},  function (event, filename) {
    if (!check(filename)) return;
    console.log('watcher [' + watcherName + '] changed:', filename);
    try {
      callback.apply(this, [filename]);
    } catch (e) {
      console.log('watcher got error', e.stack);
    }
  });
}

function exists(f) {
  try {
    fs.statSync(f)
    return true;
  } catch (e) {
    return false;
  }
}

module.exports = watch;
