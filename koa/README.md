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
]);

app.use(routes);
```

Now you must know how easy it is. Basically, there 4 fields for you to configuare with:

- url: the url to be matching
- method/methods: the http method to be matching
- controller: the handler function 
