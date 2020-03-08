A set of functions __without any dependencies__.

Notice: the primary goal I made this repo is to build small things without any shitty npm dependencies. If it has to depend on them, just copy.

fs
----

- `fs/watch` - a configurable watch function with native `fs.watch`
- `fs/readdir` - pass in `pattern`, returns all files (include sub folders) under the folder.
- `fs/replace` - pass in `dir`, `pattern` and `callback`, replace all the match files with the result processed via `callback`.

util
-----

- `util/async` - run generator function as async/await function.
- `util/is-generator-fn` - check if a function is generator.
- `util/is-promise` - detect if an object is a promise.
- `util/promise-call` - run callback-style function as promise. `promiseCall(fs.readFile, 'path/to/the/file')` or `promiseCall([fs.readFile, fs], 'path/to/the/file')`
- `util/noop`       - function without any operation.
- `util/sleep`      - sleep for x ms and return a promise.
- `util/routington` - a shameless copy code from `routington`.
- `util/string` - a powerful string lib.
    * startWith - `startWith('hello world', 'hello') = true` 
    * endWith - `endWith('hello world', 'rld') = true` 
    * isOverlapBy -  `isOverlapBy('abcdefg', 'defgxyz', 'fg') = true`
    * getOverlap - `getOverlap('abcdefg', 'defgxyz') = 'defg'`, get the longest overlap part of two string if one shares its end with others head.
    * splitBetween - `splitBetween('<div>hello</div>','>', '<')` returns `{left: '<div', middle: 'hello', right: '/div>'}`,
    * charToHex - `charToHex('a') = '0061'`,`charToHex('我') = '6211'`

koa
----
- `koa/router`     -  a extremly simple yet powerful router creator.

License
---
MIT
