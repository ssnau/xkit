var routington = require('../util/routington');
module.exports = function (pages) {
  pages = [].concat(pages);
  var router = getRouter(pages);
  console.log(router);
  return function *(next) {
    var match = router.match(this.path);
    console.log('path is', this.path);
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
  };
};

function getRouter(pages) {
  router = routington();
  pages.forEach(function (page) {
    if (!(page && page.controller)) return;

    var responseController = routeController(page);
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

function routeController(page) {
  var middlewares = page.middlewares || [];

  if (page.middlewares) {
    // in case middlewares is not array
    return compose([].concat(middlewares, responseController));
  }
  this.matchRoute = page;

  function* responseController(next) {
    if (this.$injector) return yield this.$injector.invoke(page.controller, this);
    yield page.controller.call(this);
  }

  return responseController;
}
