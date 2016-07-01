xkit - koa utilities
----

## router

`xkit/koa/router` is a very simple router generator. Example talks.

```javascript
var app = require('koa')();
var router = require('xkit/koa/router');

var routes = router([
  {
    url: '/',
    controller: function *() {
      this.body = 'this is homepage';
    }
  },
  {
    url: '/greet/:name',
    controller: function *() {
      this.body = 'hello, ' + this.params.name;
    }
  },
  {
    url: '/modify/:id',
    method: 'post',   // also can pass an array containing methods
    middlewares: [require('koa-body')], 
    controller: function *() {
      this.body = 'modifying, ' + this.params.id + ' with ' + this.request.body;;
    }
  }
]);

app.use(routes);
```

Now you must know how easy it is. Basically, there 4 fields for you to configuare with:

- url: the url to be matching
- method/methods: the http method to be matching
- middleware/middlewares: process with middlewares before hitting the match route
- controller: the handler function 
