module.exports = function promiseCall(fn, ...rest) {
  let context;
  if (Array.isArray(fn)) {
    context = fn[1];
    fn = fn[0];
  }
  return new Promise((resolve, reject) => {
    fn.apply(context, rest.concat(function(err, data) {
      if (err) return reject(err);
      resolve(data);
    }));
  });
}
