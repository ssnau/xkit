var fs = require('fs');
var path = require('path');

/**
   * 给定配置, 监控一个文件的变化.
   *
   * path: 要watch的目录.
   * pattern: 一个RegExp或函数,或以它们组成的数组,过滤要监控的内容.
   * callback: 检测到变化时的回调.
   * watcherName: 这个watcher的名字,通常用于打log调试.
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
