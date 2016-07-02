var win = typeof window !== 'undefined' ? window : {};
var console = win.console || {};
var parser = require('./ng-parser');
var clone = require('./clone');
var noop = function () {};

var isArray = function (a) { return !!a && a.indexOf && a.slice && a.splice; }
var isDate = function (a) { return a && typeof a.getTime == 'function' && typeof a.getDate == 'function'; }
var isRegExp = function (a) { return a instanceof RegExp; }
var isFunction = function (a) { return typeof a === 'function'; }

function each(array, fn) {
  for (var i = 0; i < array.length; i++) fn(array[i]);
}

var ENABLE_LOG = false;
var instanceCount = 0;
var watchId = 1;

var parserCache = {};
function parse(string) {
    if (!parserCache[string]) {
        parserCache[string] = parser.parse(string);
    }
    return parserCache[string];
}

function checkLog() {
    if (ENABLE_LOG || win.ENABLE_SCOPE_LOG) {
        return true;
    }
    return false;
}

function log() {
    if (checkLog() && console.log) {
        console.log.apply(console, arguments);
    }
}

function dir() {
    if (checkLog() && console.dir) {
        console.dir.apply(console, arguments);
    }
}

function isWindow (obj) {
    return obj && obj.document && obj.location && obj.alert && obj.setInterval;
}

// deep equal, copied from: https://github.com/angular/angular.js/blob/8d4e3fdd31eabadd87db38aa0590253e14791956/src/Angular.js#L812
function equals(o1, o2) {
    /* jshint ignore:start */
    if (o1 === o2) return true;
    if (o1 === null || o2 === null) return false;
    if (o1 !== o1 && o2 !== o2) return true; // NaN === NaN
    var t1 = typeof o1, t2 = typeof o2, length, key, keySet;
    if (t1 == t2) {
        if (t1 == 'object') {
            if (isArray(o1)) {
                if (!isArray(o2)) return false;
                if ((length = o1.length) == o2.length) {
                    for(key=0; key<length; key++) {
                        if (!equals(o1[key], o2[key])) return false;
                    }
                    return true;
                }
            } else if (isDate(o1)) {
                return isDate(o2) && o1.getTime() == o2.getTime();
            } else if (isRegExp(o1) && isRegExp(o2)) {
                return o1.toString() == o2.toString();
            } else {
                if (/*isScope(o1) || isScope(o2) ||*/ isWindow(o1) || isWindow(o2) || isArray(o2)) return false;
                keySet = {};
                for(key in o1) {
                    if (key.charAt(0) === '$' || isFunction(o1[key])) continue;
                    if (!equals(o1[key], o2[key])) return false;
                    keySet[key] = true;
                }
                for(key in o2) {
                    if (!keySet.hasOwnProperty(key) &&
                        key.charAt(0) !== '$' &&
                        o2[key] !== undefined &&
                        !isFunction(o2[key])) return false;
                }
                return true;
            }
        }
    }
    /* jshint ignore:end */
    return false;
}

function Scope() {
    this._$$watched = [];
    this._$$children = [];
    this._$id = ++instanceCount;
    Scope._instances[this._$id] = this;
}

Scope.TTL = 10;
Scope.DELAY = 10;
Scope._instances = {};

var rootScope;
Scope.getRootInstance  = function() {
    if (rootScope && !rootScope._$destoried) {
        return rootScope;
    }
    rootScope = new Scope();
    return rootScope;
};

Scope.getIsolateInstance = function () {
    return new Scope();
};

Scope.getInheritInstance = function (parent) {
    function ChildScope() {}
    ChildScope.prototype = parent;
    var scope = new ChildScope();
    Scope.apply(scope);
    parent._$$children.push(scope);
    scope.$parent = parent;
    return scope;
};

Scope.getInstance = function () {
    return this.getRootInstance(); // 暂时兼容线上
    //return parent ? this.getInheritInstance(parent) : this.getIsolateInstance();
};

Scope.digest = function (force) {
    Scope.getRootInstance()[force ? '$digest' : '$digestIfPending']();
};

Scope.prototype = {
    constructor: Scope,
    _$digestAsync: function () {
        var me = this;
        if (Scope._handler) return;
        Scope._handler = setTimeout(function () {
          me.$digest();
        }, Scope.DELAY);
    },
    _clearHanlder: function () {
        clearTimeout(Scope._handler);
        Scope._handler = null;
    },
    /**
     * 收集所有scope的watchers
     * @returns {Array}
     * @private
     */
    _$collectWatchers: function () {
        var watchers = [];
        each(Scope._instances, function(instance){
            watchers = watchers.concat(instance._$$watched);
        });
        return watchers;
    },
    /**
     * 为避免数据死循环，一次性消化所有的scope。
     */
    $digest: function () {
        log("-----[digesting]------");
        var count = 0;

        while (true) {
            // clear handler on every round
            this._clearHanlder();
            var watchers = this._$collectWatchers(); // 可能在watchers中会生成新的scope,故每次loop都要重新收集一遍

            count++;
            if (count > Scope.TTL) {
                log('[digesting] digest max loop [' + Scope.TTL + ']reached, give up');
                break;
            }

            var invokeList = [];
            var dirty = false;

            log("[digesting] round #" + count);
            each(watchers, function (watcher) {
                var oldValue = watcher.value;
                var newValue = watcher.func();
                if (!equals(oldValue, newValue)) {
                    watcher.value = clone(newValue, true);
                    dirty = true;
                    invokeList.push({
                        func: watcher.callback,
                        args: [watcher.value, oldValue]
                    });
                }
            });

            log('[digesting] ' + invokeList.length + " callbacks in queue.");
            if (invokeList.length) {
                log('they are:');
            }

            each(invokeList, function (invoker) {
                dir(invoker);
                try {
                    invoker.func.apply(null, invoker.args || []);
                } catch (e) {
                    log('error when invoke:');
                    dir(invoker);
                }
            });

            if (dirty) {
                log('[digesting] data is dirty, start next digest');
            } else {
                log('[digesting] data is stable, stop digesting');
                // clear handler before exit!
                this._clearHanlder();
                break;
            }
        }
    },
    /**
     * 测试专用函数。
     * 用于同步消化数据。
     */
    $digestIfPending: function() {
        if (Scope._handler) {
            this.$digest();
        }
    },
    $destory: function () {
        delete Scope._instances[this._$id];
        this._$$watched = [];
        this._$destoried = true;
    },
    $set: function (name, value) {
        var me = this;
        if (name instanceof Object) {
            return each(name, function (val, key) {
                me[key] = val;
            });
        }

        if (!name) {
            return;
        }

        me[name] = value;
        this._$digestAsync();
    },
    $apply: function () {
        this._$digestAsync();
    },
    $eval: function (expression) {
        if (isFunction(expression)) {
            return expression.call(this);
        }
        return parse(expression)(this);
    },
    $default: function (hash) {
        var scope = this;
        Object.keys(hash).forEach(function(key){
            scope[key] = scope.hasOwnProperty(key) ? scope[key] : hash[key];
        });
    },
    /**
     * 监控一个表达式，如果表达式得到的值有变化，则会响应回调函数。
     * sync为true，则同步表达式的初始值
     * 返回一个函数，用于解除监控。
     * @param expression
     * @param callback
     * @param sync
     * @returns {Function}
     */
    $watch: function (expression, callback, sync) {
        var func = expression;
        var me = this;

        // fast return
        if (!expression) {
            return;
        }

        if (Array.isArray(expression)) {
            return function(cb){
                expression.forEach(function(expr) {me.$watch(expr, cb);});
            }(callback);
        }

        if (typeof expression === 'string') {
            func = function () {
               return this.$eval(expression);
            };
        }

        var wid = ++watchId;
        this._$$watched.push({
            watchId: wid,
            scopeId: this._$id,
            value: sync ? this.$eval(expression) : null,
            expression: expression + '', // convert into string
            func: function () {
                return func.call(me);
            },
            callback: callback || noop
        });
        this._$digestAsync();

        return function() {
            me._$$watched = me._$$watched.filter(function(w) {
                return w.watchId !== wid;
            });
        };
    }
};

module.exports = Scope;
