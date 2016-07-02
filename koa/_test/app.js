var koa = require('koa');
var router = require('../router');

var app = koa();
app.use(router([
  {
    url: "/",
    controller: function* () {
      this.body = "hello, world";
    }
  },
  {
    url: "/hello/mama",
    controller: function* () {
      this.body = "hello";
    }
  },
  {
    url: "/hello/:id",
    controller: function* () {
      this.body = "hello, " + this.params.id;
    }
  },
]));

app.listen(9898);
