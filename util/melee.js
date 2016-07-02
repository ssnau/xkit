var scope = require('./scope');
var parser = require('./ng-parser');
var SCOPE_ATTR = "melee-scope";
var eachId = 0;
var mCache = {};
/**
 * 自动找出以$$开头的变量
 * @param expr
 * @returns {string[]}
 */
function getMagicVars(expr) {
    if (!expr) return [];
    if (mCache[expr]) return mCache[expr];

    var vars = [];
    (expr + '').replace(/\$\$(\w+)/g, function(match, p1) {
        vars.push(p1);
    });
    return vars;
}

var isArray = function (a) { return !!a && a.indexOf && a.slice && a.splice; }

function each(array, fn) {
  if (isArray(array)) {
    for (var i = 0; i < array.length; i++) fn(array[i], i);
  } else {
    if (typeof array === 'object) {
      Object.keys(array).forEach(function(key) {
        fn(array[key], key);
      });
    }
  }
}

/**
 * 取obj上的自有属性，防止查找原型链，向未来兼容。
 * 如obj.watch在其它浏览器下是undefined，但FF下会是一个函数。
 * @param obj
 * @param prop
 * @param defaultVal
 * @returns {*}
 */
function getOwn(obj, prop, defaultVal) {
    if (!obj) return defaultVal;
    if (!obj.hasOwnProperty(prop)) return defaultVal;
    return obj[prop];
}

/**
 * 查找表达式里是否有$${name}，如果有，则自动执行$${name} = node.get({name})
 * 例如：将有 scope.$$value = node.get('value')
 *
 * @param expr
 * @param scope
 * @param node
 */
function handleMagicVars(expr, scope, node) {
    getMagicVars(expr).forEach(function(attName){
        scope['$$' + attName] = node.get(attName);
    });
}

/**
 * Example:
 * 只有在scope.selected == 这个option的value时，才是selected.
 * <option value="1" melee-selected="$this.get('value') == selected" />
 * <option value="1" melee-selected="$$value == selected" />
 */
function wrapExpr(expr, node) {
    var ret = function () {
        this.$this = node;
        handleMagicVars(expr, this, node);
        var r = this.$eval(expr);
        this.$this = null;
        return r;
    };
    ret.toString = function() {return expr;}; // for debug reason
    return ret;
}

/**
 * 不适合在页面显示出来的变量。
 * undefined, NaN, null
 */
function isBadSymbol(val) {
    return (val === void 0 || val !== val || val === null);
}

// TODO: remove 'melee-' prefix and use 'm-' instead.
var binders = {
    'melee-init': function (node, scope, expr) {
        scope.$eval(expr);
    },
    'melee-html': function (node, scope, expr) {
        scope.$watch(expr, function (val) {
            var v = isBadSymbol(val) ? "" : val;
            node.setHTML(Y.mt.lang.htmlEscape(v + ''));
        });
    },
    'melee-unsafe-html': function (node, scope, expr) {
        scope.$watch(expr, function (val) {
            node.setHTML(val);
        });
    },
    'melee-show': function (node, scope, expr) {
        scope.$watch(expr, function (val) {
            node[val ? 'show' : 'hide']();
        });
    },
    'melee-disabled': function (node, scope, expr) {
        scope.$watch(expr, function(val){
            node.set('disabled', !!val);
        });
    },
    'melee-class': function (node, scope, expr) {
        scope.$watch(expr, function (val) {
            node.set('className',
                Object
                    .keys(val || {})
                    .filter(function (key) {
                        return val[key];
                    })
                    .join(' ')
            );
        });
    },
    /**
     * melee-value和melee-checked需要特殊关照。
     * 因为用户的输入，点击会改变node.get('value')、
     * node.get('checked')，所以需要在每次$digest
     * 同步value/checked到节点上，保证数据与节点同步。
     */
    'melee-value': function (node, scope, expr) {
        scope.$watch(function() {
            var val = scope.$eval(expr);
            if (String(node.get('value')) !== String(val)) {
                node.set('value', isBadSymbol(val) ? '' : val);
            }
            // Special logic for select under IE6,7,8,9,10
            if (Y.UA.ie > 0 && node.get('tagName') === "SELECT") {
                var selectElem = node.getDOMNode();
                var options = selectElem.options;
                for (var i = 0; i < options.length; i++) {
                    if (String(options[i].value) === String(val)) {
                        selectElem.selectedIndex = i;
                    }
                }
            }
        });
    },
    'melee-checked': function (node, scope, expr) {
        scope.$watch(function(){
            var val = scope.$eval(expr);
            if (node.get('checked') !== val) {
                node.set('checked', val);
            }
        });
    },
    /**
     * melee-defaultvalue
     * 仅仅在初始时赋值。
     */
    'melee-defaultvalue': function(node, scope, expr) {
        var unwatch = scope.$watch(expr, function(val){
            if (!isBadSymbol(val)) {
                node.set('value', val);
                unwatch();
            }
        });
    },
    'melee-attr': function (node, scope, expr) {
        scope.$watch(expr, function(val) {
            each(val, function(val, key) {
               node.setAttribute(key, val);
            });
        });
    },
    'melee-repeat': function (node, scope) {
        function strip(str) {
            return str.trim().replace(/^\(|\)$/, '').trim();
        }
        // parse
        var expression, keyName, valName;
        var origExp = node.getAttribute('melee-repeat') || node.getAttribute('m-repeat');
        var match = origExp.match(/(.*) in (.*) (track by (.*))/) || origExp.match(/(.*) in (.*)/);
        var trackExp;
        if (match) {
            var pair = match[1].split(',');
            expression = match[2];
            keyName = strip(pair.length > 1 ? pair[0] : "__");
            valName = strip(pair.length > 1 ? pair[1] : pair[0]);
            trackExp = match[4] || '$index';
        } else {
            throw new Error(origExp + ' is not a valid melee-repeat statement. please follow [val in attr]/ [(key, val) in attr] convention.');
        }

        // prepare template
        var id = ++eachId;
        var tmplId = 'data-melee-template-' + id;

        node.removeAttribute('melee-repeat');
        node.removeAttribute('m-repeat');

        node.setAttribute('data-melee-id', id);
        var html = node.get('outerHTML');

        var templateNode = Y.Node.create(
                '<script type="text/x-melee-repeat-template" id="$id">/* expression: $expr */\n$html</script>'
                    .replace('$id', tmplId)
                    .replace('$html', html)
                    .replace('$expr', origExp)
        );
        node.insert(templateNode, "after");
        node.remove();

        var idMap = {
            // [trackId] : {scope: Scope, node: Y.Node}
        };
        // track id helper function
        function TempLocal() {}
        TempLocal.prototype = scope;
        var trackFn = parser.parse(trackExp);
        var getId = function(val, index) {
            var local = new TempLocal();
            local[valName] = val;
            local['$index'] = index;
            return trackFn(local);
        };

        // watch changes
        scope.$watch(expression, function(array) {
            // 1. 判断idMap中的元素是否在新的array中存在，如不存在，删除之.
            var toBeDeleteIds = [];
            var newMap = {};
            each(array, function(val, index) {
                newMap[getId(val, index)] = val;
            });
            each(idMap, function(val, key) {
                if (!newMap.hasOwnProperty(key)) {
                    toBeDeleteIds[key] = true;
                }
            });
            each(toBeDeleteIds, function(val, key){
                idMap[key].scope.$destory();
                idMap[key].node.remove(true);
                delete idMap[key];
            });

            // 2. 遍历新的array
            var count = 0;
            var len = Array.isArray(array) ? array.length : Object.keys(array || {}).length;
            var baseNode = templateNode;
            each(array, function(val, key) {
                var trackId = getId(val, key);
                var childScope, node;
                if (idMap[trackId]) {
                    childScope = idMap[trackId].scope;
                    node = idMap[trackId].node;
                } else {
                    childScope = Y.mt.scope.getInheritInstance(scope);
                    node = Y.Node.create(html);
                }
                idMap[trackId] = {scope: childScope, node: node};
                childScope[valName] = val;
                childScope[keyName] = key;
                // magic vars
                childScope.$set({
                    '$index': key,
                    '$first': count === 0,
                    '$last' : count === len - 1,
                    '$middle': (count > 0 && count < len - 1),
                    '$even' : count % 2 === 0,
                    '$odd'  : count % 2 !== 0
                });
                Y.mt.bind.init(node, childScope);
                if (baseNode.next() !== node) {
                    baseNode.insert(node, 'after');
                }
                M._autoinit.push(node); // auto boot the uix-widgets..
                baseNode = node;

                count++;
            });
        });

        return false; // 终止其它helper
    },
    /**
     * Example:
     *
     * <input
     *    melee-validate="{
     *               events: 'change|blur',
     *               validation: 'checkLength($this)'
     *               }" />
     *
     *  scope.checkLength = function (node, min, max) {
     *     var value = node.get('value');
     *
     *     var valid = value.length >= min && value.length <= max;
     *     // 设置可设置其它东西
     *     // do something here...
     *
     *     // 遵循mt-validator规范
     *     // 1. 返回true/false, true代表通过
     *     // 2. 返回 {value: boolean, msg: string}，value的值代表是否通过,msg为成功|错误信息
     *     return valid;
     *  }
     *
     *
     * @param node
     * @param scope
     * @param expr
     */
    'melee-validate': function (node, scope, expr) {
        var config = scope.$eval(expr);
        var validation = config.validation;
        if (!validation) {
            throw new Error("The melee-validate config should contain validation field");
        }
        var validate = function () {
            // 如果这个节点不在DOM里，则跳过对其验证
            if (!Y.one(document.body).contains(node)) return true;
            // 如果这个节点为disabled状态，则跳过对其验证
            if (node.get('disabled')) return true;

            scope.$this = node;
            var valid = node.scopeEval(validation);
            scope.$this = null;
            node.removeClass('mt-validate-valid');
            node.removeClass('mt-validate-invalid');
            node.addClass((valid === true || (valid && valid.value === true)) ? "mt-validate-valid" : "mt-validate-invalid");
            scope.$apply();
            return valid;
        };

        scope.$watch(getOwn(config, 'watch'), validate, true);

        // bind to validator
        var ndForm = node.ancestor('form');
        if (ndForm) {
            var validator = Y.mt.validator.getInstance(ndForm);
            validator.register(config.group, validate);
        }

        // bind to events
        (getOwn(config, 'event') || getOwn(config, 'events') || '').split('|').map(function(eventName) {
            return eventName.trim().replace(/^on/, '');
        }).forEach(function(eventName) {
            bindEvent(eventName, node, validate);
        });
    },
    'melee-model': function (node, scope, modelName) {
        function equal(a, b) {
            return String(a) === String(b);
        }

        function contains(arr, val) {
            return !!arr.filter(function (v) {
                return equal(v, val);
            }).length;
        }

        var strategies = {
            "input#radio": function (node, val) {
                node.set('checked', equal(node.get('value'), val));
            },
            "input#checkbox": function (node, val) {
                node.set(
                    'checked',
                    Array.isArray(val) ? contains(val, node.get('value')) : equal(val, node.get('value'))
                );
            },
            // https://developer.mozilla.org/en-US/docs/Web/API/HTMLSelectElement/type
            "select#select-one": function (node, val) {
                node.set('value', val);
            },
            "select#select-multiple": function (node, val) {
                var options = node.get('options');
                Y.all(options).each(function (ndOption) {
                    ndOption.set(
                        'selected',
                        contains(val, ndOption.get('value'), val)
                    );
                });
            },
            'default': function (node, val) {
                if (!equal(node.get('value'), val)) {
                    node.set('value', val);
                }
            }
        };

        scope.$watch(modelName, function (val) {
            var strategy = strategies[(node.get('tagName') + "#" + node.get('type')).toLowerCase()] || strategies['default'];
            strategy(node, val);
        });
    }
};

// use m- as shortcut..
each(binders, function (val, key) {
    binders[key.replace('melee-', 'm-')] = val;
});

var priorites = {
    'melee-repeat': 999,
    'm-repeat': 999,
    '*': 100
};


var eventNormalizer = {
    'change': function (node, callback) {
        var eventname = "change";

        // http://blog.csdn.net/huli870715/article/details/7887818
        if (/checkbox|radio/.test(node.get('type')) && (Y.UA.ie > 0 && Y.UA.ie < 9)) {
            node.on('propertychange', function(e) {
                if (e._event.propertyName === 'checked') {
                    callback(e);
                }
            });
            return;
        }
        // http://yuilibrary.com/yui/docs/event/valuechange.html
        if (node.get('type') === 'text' || node.get('type') === 'password' || node.get('tagName') === 'TEXTAREA') {
            eventname = 'valuechange';
        }
        node.on(eventname, callback);
    }
};



/**
 * General event expression bind helper function
 * @param eventName
 * @param node
 * @param expr
 */
function bindEvent(eventName, node, expr) {
    var eventCallback = function (e) {
        var scope = node.getScope();
        scope.$event = e;
        scope.$eval(expr);
        scope.$event = null;
        scope.$apply();
    };

    if (eventNormalizer[eventName]) {
        eventNormalizer[eventName](node, eventCallback);
    } else {
        node.on(eventName, eventCallback);
    }
}

/**
 * attributes是不区分大小写的，还是在这里指明好了，统一强制转成小写。
 * @param name
 * @returns {*}
 */
function getBinder(name) {
    return binders[name.toLowerCase()];
}

var melee = {
    init: function (ele, scope) {
        var root = Y.one(ele);
        if (!root) return;

        if (scope) {
            root._$scope = scope;
        }

        var PAT_BIND_EVENT_ATTR1 = /^melee-on\w+/;
        var PAT_BIND_EVENT_ATTR2 = /^m-on\w+/;

        traverse(root, function (node) {
            if (node.hasAttribute(SCOPE_ATTR)) {
                createScopeOnElement(node);
            }

            // 防止多次绑定
            if (node._$binded) return;
            node._$binded = true;

            var attributes = node.get('attributes');
            if (!attributes) return; // 一些情况下attributes为null.

            // 找到需要bind的属性
            var bindAttrs = [];
            attributes.each(function (attr) {
                var attrName = attr.get('name');
                if (getBinder(attrName)) {
                    bindAttrs.push({
                        name: attrName,
                        priority: priorites[attrName] || priorites['*']
                    });
                } else if (PAT_BIND_EVENT_ATTR1.test(attrName) || PAT_BIND_EVENT_ATTR2.test(attrName)) {
                    bindAttrs.push({
                        name: attrName,
                        priority: priorites['*']
                    });
                }
            });

            // 按优先级排序, 从大到小
            bindAttrs.sort(function(a, b) {
               return b.priority - a.priority;
            });

            // 绑定，如果其中有一个binder返回了false, 则终止所有剩下的binder
            var stop = false;
            bindAttrs.forEach(function(attr) {
                if (stop) return;

                var attrName = attr.name;
                var expr = wrapExpr(node.getAttribute(attrName), node);
                // 普通binder
                if (getBinder(attrName)) {
                    stop = (getBinder(attrName))(node, node.getScope(), expr) === false;
                    return;
                }

                // 事件binder
                var eventName = attrName.indexOf('melee-on') > -1 ? attrName.slice('melee-on'.length) : attrName.slice('m-on'.length);
                bindEvent(eventName, node, expr);
            });
        });
    },
    /**
     * register a custom binder.
     * @param name
     * @param callback
     * @param config
     */
    register: function (name, callback, config) {
        name = name.toLowerCase();
        binders[name] = callback;
        config = config || {};
        priorites[name] = config.priority || priorites['*'];
    }
};

// init root scope for document.body
Y.one(document.body)._$scope = scope.getRootInstance();

function getScope() {
    var node = this;
    while (node) {
        if (node.hasAttribute(SCOPE_ATTR) && !node._$scope) {
            createScopeOnElement(node);
        }
        if (node._$scope) return node._$scope;
        node = node.ancestor();
    }
    return scope.getRootInstance();
}

// augment YUI node
Y.Node.addMethod('getScope', getScope);
Y.Node.addMethod('scope', getScope);
// for debug reason
Y.Node.addMethod('scopeEval', function (element, expr) {
    var node = Y.one(element);
    var scope = node.getScope();
    return scope.$eval(wrapExpr(expr, node));
});

/**
 * <div melee-scope></div> ==> 建立一个与父级拥有继承关系的scope
 * <div melee-scope="{}"></div> ==> 建立一个与外界完全独立的scope
 * <div melee-scope="{name: 'nickname'}"></div> ==> 建立一个scope.name 恒等于 outerScope.name的scope
 *
 * @param ele
 */
function createScopeOnElement(ele) {
    var node = Y.one(ele);
    if (!node || node._$scope) return;
    var isIsolate = node.getAttribute(SCOPE_ATTR) || false;
    var outerScope = node.ancestor() && node.ancestor().getScope();
    node._$scope = isIsolate ?
        Y.mt.scope.getIsolateInstance() :
        Y.mt.scope.getInheritInstance(outerScope);
    if (isIsolate) {
        bindScopeAttributes(node, outerScope);
    }
}

/**
 * 内外部单向scope传递数据。
 * 如：
 * <div melee-scope='["name=profile.name","age=profile.age"]'> ... </div>
 * 只要outerScope.profile.name变成'abc'，那么scope.name则会立刻变成'abc'.
 *
 * @param ele
 */
function bindScopeAttributes(node, outerScope) {
    var scope = node.getScope();
    var scopeConfig = Y.mt.util.decodeJSON(node.getAttribute(SCOPE_ATTR));

    if (!outerScope || !Array.isArray(scopeConfig)) return;

    scopeConfig.forEach(function (val) {
        if (!('' + val).trim()) return;

        // "attr1=attr2" 表示父attr2的改变会同步到子的attr1上
        // "attr1" 表示父attr1的改变会同步到子attr1上
        var pair = [val, val];

        if (val.indexOf('=') > 0) {
            pair = val.split('=');
        }

        var attr1 = pair[0];
        var attr2 = pair[1];

        scope[attr1] = outerScope[attr2];
        outerScope.$watch(attr2, function (value) {
            scope.$set(attr1, value);
        });
    });
}

// 遍历节点
function traverse(root, callback) {
    function dfs(node) {
        if (callback(node) === false) return;

        node.get('children').each(function (ndChild) {
            dfs(ndChild);
        });
    }

    dfs(root);
}
module.exports = melee;
