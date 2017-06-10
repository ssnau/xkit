module.exports = function promiseCall(fn) {
  var rest = [], len = arguments.length - 1;
  while ( len-- > 0 ) rest[ len ] = arguments[ len + 1 ];

  var context;
  if (Array.isArray(fn)) {
    context = fn[1];
    fn = fn[0];
  }
  return new Promise(function (resolve, reject) {
    fn.apply(context, rest.concat(function(err, data) {
      if (err) { return reject(err); }
      resolve(data);
    }));
  });
}
