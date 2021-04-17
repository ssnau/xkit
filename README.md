[![huntr](https://cdn.huntr.dev/huntr_security_badge_mono.svg)](https://huntr.dev)

A set of functions __without any dependencies__.

Notice: the primary goal I made this repo is to build small things without any shitty npm dependencies. If it has to depend on them, just copy.

fs
----

- `fs/watch` - a configurable watch function with native `fs.watch`
- `fs/readdir` - pass in `pattern`, returns all files (include sub folders) under the folder.
- `fs/replace` - pass in `dir`, `pattern` and `callback`, replace all the match files with the result processed via `callback`.

util
-----

- `util/array` - a powerful array lib.
    * partition - given an array and partition size, return a partitioned arrary.
- `util/async` - run generator function as async/await function.
- `util/hex-to-rgb` - convert hex color to rgb.
- `util/is-generator-fn` - check if a function is generator.
- `util/is-promise` - detect if an object is a promise.
- `util/noop`       - function without any operation.
- `util/normalize-base64-url` - given a string, return a correct format for img.src to render.
- `util/parse-url` - browser only. Given a url string, parse into an object.
- `util/promise-call` - run callback-style function as promise. `promiseCall(fs.readFile, 'path/to/the/file')` or `promiseCall([fs.readFile, fs], 'path/to/the/file')`
- `util/routington` - a shameless copy code from `routington`.
- `util/safe-run` - given a non-parameter function, safely execute it without throwing exception.
- `util/set-path-value` - given an object and a path with dot-notation, set value on the path.
- `util/shallow-copy` - shallow copy an object.
- `util/shallow-copy-on-path` - shallow copy an object with given path.
- `util/sleep`      - sleep for x ms and return a promise.
- `util/string` - a powerful string lib.
    * startWith - `startWith('hello world', 'hello') = true` 
    * endWith - `endWith('hello world', 'rld') = true` 
    * isOverlapBy -  `isOverlapBy('abcdefg', 'defgxyz', 'fg') = true`
    * getOverlap - `getOverlap('abcdefg', 'defgxyz') = 'defg'`, get the longest overlap part of two string if one shares its end with others head.
    * splitBetween - `splitBetween('<div>hello</div>','>', '<')` returns `{left: '<div', middle: 'hello', right: '/div>'}`,
    * charToHex - `charToHex('a') = '0061'`,`charToHex('我') = '6211'`
- `util/url` - nice utilities for url operating.
-   * join - similar to `path.join`, to safely join two portion to form an url.
- `util/without-undefined` - strip out `undefined` properties from an object.

koa
----
- `koa/router`     -  a extremly simple yet powerful router creator.

License
---
MIT
