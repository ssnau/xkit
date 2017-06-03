var routington = require('../util/routington');
function Router(pages, options) {
  pages = [].concat(pages);
  options = options || {};
  var makeController = (options.makeController) || defaultMakeController;
  var router = getRouter(pages);
  return function *(next) {
    var match = router.match(this.path);
    var controllers = match && match.node && match.node.controllers;
    if (!controllers) {
      this.body = 'no route found';
      return;
    }
    var controller;
    for (var i = 0; i < controllers.length; i++) {
      var methods = controllers[i].methods;
      if (methods.indexOf(this.method) > -1) {
        controller = controllers[i];
        break;
      }
    }
    if (!controller) {
      this.body = 'no supported controller found';
      return;
    }
    this.matchRoute = match.node;
    this.params = match.param;
    yield controller.fn.call(this, next);
  }

  function getRouter(pages) {
    router = routington();
    pages.forEach(function (page) {
      if (!(page && page.controller)) return;

      var responseController = makeController(page);
      var url = page.url.indexOf('/') !== '0' ? '/' + url: '';
      router.define(page.url).forEach(node => {
        var methods = [].concat(page.method || page.methods || "get").map(x => x.toUpperCase());
        node.controllers = [].concat(node.controllers).concat([{
          method: methods,
          methods: methods,
          fn: responseController
        }]).filter(Boolean);
        // check if define more than once
        var methods = node.controllers.map(c => c.methods).reduce((arr, item) => arr.concat(item));
        var hashtable = Object.create(null);
        for (var i = 0; i < methods.length; i++) {
          if (!hashtable[methods[i]]) {
            hashtable[methods[i]] = true;
          } else {
            throw new Error(`duplicate define router ${page.url} with method ${methods[i]}`);
          }
        }
      });
    });
    return router;
  }
};

function defaultMakeController(page){
  return page.controller;
}

module.exports = Router;
