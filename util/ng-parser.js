var NODE_TYPE_ELEMENT = 1;
var NODE_TYPE_TEXT = 3;
var NODE_TYPE_COMMENT = 8;
var NODE_TYPE_DOCUMENT = 9;
var NODE_TYPE_DOCUMENT_FRAGMENT = 11;

function noop(){}
var lowercase = function(string) {return isString(string) ? string.toLowerCase() : string;};
var hasOwnProperty = Object.prototype.hasOwnProperty;
var toString = Object.prototype.toString;

/**
 * @ngdoc function
 * @name angular.uppercase
 * @module ng
 * @kind function
 *
 * @description Converts the specified string to uppercase.
 * @param {string} string String to be converted to uppercase.
 * @returns {string} Uppercased string.
 */
var uppercase = function(string) {return isString(string) ? string.toUpperCase() : string;};


var manualLowercase = function(s) {
    /* jshint bitwise: false */
    return isString(s)
        ? s.replace(/[A-Z]/g, function(ch) {return String.fromCharCode(ch.charCodeAt(0) | 32);})
        : s;
};
var manualUppercase = function(s) {
    /* jshint bitwise: false */
    return isString(s)
        ? s.replace(/[a-z]/g, function(ch) {return String.fromCharCode(ch.charCodeAt(0) & ~32);})
        : s;
};
function toJson(obj, pretty) {
    if (typeof obj === 'undefined') return undefined;
    return JSON.stringify(obj, toJsonReplacer, pretty ? '  ' : null);
}

function toJsonReplacer(key, value) {
    var val = value;

    if (typeof key === 'string' && key.charAt(0) === '$' && key.charAt(1) === '$') {
        val = undefined;
    } else if (isWindow(value)) {
        val = '$WINDOW';
    } else if (value &&  document === value) {
        val = '$DOCUMENT';
    } else if (isScope(value)) {
        val = '$SCOPE';
    }

    return val;
}


// String#toLowerCase and String#toUpperCase don't produce correct results in browsers with Turkish
// locale, for this reason we need to detect this case and redefine lowercase/uppercase methods
// with correct but slower alternatives.
if ('i' !== 'I'.toLowerCase()) {
    lowercase = manualLowercase;
    uppercase = manualUppercase;
}

function minErr(module, ErrorConstructor) {
    ErrorConstructor = ErrorConstructor || Error;
    return function() {
        var code = arguments[0],
            prefix = '[' + (module ? module + ':' : '') + code + '] ',
            template = arguments[1],
            templateArgs = arguments,
            message, i;

        message = prefix + template.replace(/\{\d+\}/g, function(match) {
            var index = +match.slice(1, -1), arg;

            if (index + 2 < templateArgs.length) {
                arg = templateArgs[index + 2];
                if (typeof arg === 'function') {
                    return arg.toString().replace(/ ?\{[\s\S]*$/, '');
                } else if (typeof arg === 'undefined') {
                    return 'undefined';
                } else if (typeof arg !== 'string') {
                    return toJson(arg);
                }
                return arg;
            }
            return match;
        });

        return new ErrorConstructor(message);
    };
}
var $parseMinErr = minErr('$parse');

function extend(dst) {
    //var h = dst.$$hashKey;

    for (var i = 1, ii = arguments.length; i < ii; i++) {
        var obj = arguments[i];
        if (obj) {
            var keys = Object.keys(obj);
            for (var j = 0, jj = keys.length; j < jj; j++) {
                var key = keys[j];
                dst[key] = obj[key];
            }
        }
    }

    //setHashKey(dst, h);
    return dst;
}

/**
 * @ngdoc function
 * @name angular.forEach
 * @module ng
 * @kind function
 *
 * @description
 * Invokes the `iterator` function once for each item in `obj` collection, which can be either an
 * object or an array. The `iterator` function is invoked with `iterator(value, key, obj)`, where `value`
 * is the value of an object property or an array element, `key` is the object property key or
 * array element index and obj is the `obj` itself. Specifying a `context` for the function is optional.
 *
 * It is worth noting that `.forEach` does not iterate over inherited properties because it filters
 * using the `hasOwnProperty` method.
 *
 * Unlike ES262's
 * [Array.prototype.forEach](http://www.ecma-international.org/ecma-262/5.1/#sec-15.4.4.18),
 * Providing 'undefined' or 'null' values for `obj` will not throw a TypeError, but rather just
 * return the value provided.
 *
 ```js
 var values = {name: 'misko', gender: 'male'};
 var log = [];
 angular.forEach(values, function(value, key) {
   this.push(key + ': ' + value);
 }, log);
 expect(log).toEqual(['name: misko', 'gender: male']);
 ```
 *
 * @param {Object|Array} obj Object to iterate over.
 * @param {Function} iterator Iterator function.
 * @param {Object=} context Object to become context (`this`) for the iterator function.
 * @returns {Object|Array} Reference to `obj`.
 */

function forEach(obj, iterator, context) {
    var key, length;
    if (obj) {
        if (isFunction(obj)) {
            for (key in obj) {
                // Need to check if hasOwnProperty exists,
                // as on IE8 the result of querySelectorAll is an object without a hasOwnProperty function
                if (key != 'prototype' && key != 'length' && key != 'name' && (!obj.hasOwnProperty || obj.hasOwnProperty(key))) {
                    iterator.call(context, obj[key], key, obj);
                }
            }
        } else if (isArray(obj) || isArrayLike(obj)) {
            var isPrimitive = typeof obj !== 'object';
            for (key = 0, length = obj.length; key < length; key++) {
                if (isPrimitive || key in obj) {
                    iterator.call(context, obj[key], key, obj);
                }
            }
        } else if (obj.forEach && obj.forEach !== forEach) {
            obj.forEach(iterator, context, obj);
        } else {
            for (key in obj) {
                if (obj.hasOwnProperty(key)) {
                    iterator.call(context, obj[key], key, obj);
                }
            }
        }
    }
    return obj;
}

/** Type utitlity **/
function valueFn(value) {return function() {return value;};}

/**
 * @ngdoc function
 * @name angular.isUndefined
 * @module ng
 * @kind function
 *
 * @description
 * Determines if a reference is undefined.
 *
 * @param {*} value Reference to check.
 * @returns {boolean} True if `value` is undefined.
 */
function isUndefined(value) {return typeof value === 'undefined';}


/**
 * @ngdoc function
 * @name angular.isDefined
 * @module ng
 * @kind function
 *
 * @description
 * Determines if a reference is defined.
 *
 * @param {*} value Reference to check.
 * @returns {boolean} True if `value` is defined.
 */
function isDefined(value) {return typeof value !== 'undefined';}


/**
 * @ngdoc function
 * @name angular.isObject
 * @module ng
 * @kind function
 *
 * @description
 * Determines if a reference is an `Object`. Unlike `typeof` in JavaScript, `null`s are not
 * considered to be objects. Note that JavaScript arrays are objects.
 *
 * @param {*} value Reference to check.
 * @returns {boolean} True if `value` is an `Object` but not `null`.
 */
function isObject(value) {
    // http://jsperf.com/isobject4
    return value !== null && typeof value === 'object';
}


/**
 * @ngdoc function
 * @name angular.isString
 * @module ng
 * @kind function
 *
 * @description
 * Determines if a reference is a `String`.
 *
 * @param {*} value Reference to check.
 * @returns {boolean} True if `value` is a `String`.
 */
function isString(value) {return typeof value === 'string';}


/**
 * @ngdoc function
 * @name angular.isNumber
 * @module ng
 * @kind function
 *
 * @description
 * Determines if a reference is a `Number`.
 *
 * @param {*} value Reference to check.
 * @returns {boolean} True if `value` is a `Number`.
 */
function isNumber(value) {return typeof value === 'number';}


/**
 * @ngdoc function
 * @name angular.isDate
 * @module ng
 * @kind function
 *
 * @description
 * Determines if a value is a date.
 *
 * @param {*} value Reference to check.
 * @returns {boolean} True if `value` is a `Date`.
 */
function isDate(value) {
    return toString.call(value) === '[object Date]';
}


/**
 * @ngdoc function
 * @name angular.isArray
 * @module ng
 * @kind function
 *
 * @description
 * Determines if a reference is an `Array`.
 *
 * @param {*} value Reference to check.
 * @returns {boolean} True if `value` is an `Array`.
 */
var isArray = Array.isArray;

/**
 * @ngdoc function
 * @name angular.isFunction
 * @module ng
 * @kind function
 *
 * @description
 * Determines if a reference is a `Function`.
 *
 * @param {*} value Reference to check.
 * @returns {boolean} True if `value` is a `Function`.
 */
function isFunction(value) {return typeof value === 'function';}


/**
 * Determines if a value is a regular expression object.
 *
 * @private
 * @param {*} value Reference to check.
 * @returns {boolean} True if `value` is a `RegExp`.
 */
function isRegExp(value) {
    return toString.call(value) === '[object RegExp]';
}


/**
 * Checks if `obj` is a window object.
 *
 * @private
 * @param {*} obj Object to check
 * @returns {boolean} True if `obj` is a window obj.
 */
function isWindow(obj) {
    return obj && obj.window === obj;
}


function isScope(obj) {
    return obj && obj.$evalAsync && obj.$watch;
}


function isFile(obj) {
    return toString.call(obj) === '[object File]';
}


function isBlob(obj) {
    return toString.call(obj) === '[object Blob]';
}


function isBoolean(value) {
    return typeof value === 'boolean';
}


function isPromiseLike(obj) {
    return obj && isFunction(obj.then);
}
/**
 * @private
 * @param {*} obj
 * @return {boolean} Returns true if `obj` is an array or array-like object (NodeList, Arguments,
 *                   String ...)
 */
function isArrayLike(obj) {
    if (obj == null || isWindow(obj)) {
        return false;
    }

    var length = obj.length;

    if (obj.nodeType === NODE_TYPE_ELEMENT && length) {
        return true;
    }

    return isString(obj) || isArray(obj) || length === 0 ||
        typeof length === 'number' && length > 0 && (length - 1) in obj;
}


/**
 * Creates a new object without a prototype. This object is useful for lookup without having to
 * guard against prototypically inherited properties via hasOwnProperty.
 *
 * Related micro-benchmarks:
 * - http://jsperf.com/object-create2
 * - http://jsperf.com/proto-map-lookup/2
 * - http://jsperf.com/for-in-vs-object-keys2
 *
 * @returns {Object}
 */
function createMap() {
    return {}; //Object.create(null);
}
// Sandboxing Angular Expressions
// ------------------------------
// Angular expressions are generally considered safe because these expressions only have direct
// access to $scope and locals. However, one can obtain the ability to execute arbitrary JS code by
// obtaining a reference to native JS functions such as the Function constructor.
//
// As an example, consider the following Angular expression:
//
//   {}.toString.constructor('alert("evil JS code")')
//
// This sandboxing technique is not perfect and doesn't aim to be. The goal is to prevent exploits
// against the expression language, but not to prevent exploits that were enabled by exposing
// sensitive JavaScript or browser apis on Scope. Exposing such objects on a Scope is never a good
// practice and therefore we are not even trying to protect against interaction with an object
// explicitly exposed in this way.
//
// In general, it is not possible to access a Window object from an angular expression unless a
// window or some DOM object that has a reference to window is published onto a Scope.
// Similarly we prevent invocations of function known to be dangerous, as well as assignments to
// native objects.


function ensureSafeMemberName(name, fullExpression) {
    if (name === "__defineGetter__" || name === "__defineSetter__"
        || name === "__lookupGetter__" || name === "__lookupSetter__"
        || name === "__proto__") {
        throw $parseMinErr('isecfld',
                'Attempting to access a disallowed field in Angular expressions! '
                +'Expression: {0}', fullExpression);
    }
    return name;
}

function ensureSafeObject(obj, fullExpression) {
    // nifty check if obj is Function that is fast and works across iframes and other contexts
    if (obj) {
        if (obj.constructor === obj) {
            throw $parseMinErr('isecfn',
                'Referencing Function in Angular expressions is disallowed! Expression: {0}',
                fullExpression);
        } else if (// isWindow(obj)
            obj.window === obj) {
            throw $parseMinErr('isecwindow',
                'Referencing the Window in Angular expressions is disallowed! Expression: {0}',
                fullExpression);
        } else if (// isElement(obj)
            obj.children && (obj.nodeName || (obj.prop && obj.attr && obj.find))) {
            throw $parseMinErr('isecdom',
                'Referencing DOM nodes in Angular expressions is disallowed! Expression: {0}',
                fullExpression);
        } else if (// block Object so that we can't get hold of dangerous Object.* methods
            obj === Object) {
            throw $parseMinErr('isecobj',
                'Referencing Object in Angular expressions is disallowed! Expression: {0}',
                fullExpression);
        }
    }
    return obj;
}

var CALL = Function.prototype.call;
var APPLY = Function.prototype.apply;
var BIND = Function.prototype.bind;

function ensureSafeFunction(obj, fullExpression) {
    if (obj) {
        if (obj.constructor === obj) {
            throw $parseMinErr('isecfn',
                'Referencing Function in Angular expressions is disallowed! Expression: {0}',
                fullExpression);
        } else if (obj === CALL || obj === APPLY || obj === BIND) {
            throw $parseMinErr('isecff',
                'Referencing call, apply or bind in Angular expressions is disallowed! Expression: {0}',
                fullExpression);
        }
    }
}

//Keyword constants
var CONSTANTS = createMap();
forEach({
    'null': function() { return null; },
    'true': function() { return true; },
    'false': function() { return false; },
    'undefined': function() {}
}, function(constantGetter, name) {
    constantGetter.constant = constantGetter.literal = constantGetter.sharedGetter = true;
    CONSTANTS[name] = constantGetter;
});

//Not quite a constant, but can be lex/parsed the same
CONSTANTS['this'] = function(self) { return self; };
CONSTANTS['this'].sharedGetter = true;


//Operators - will be wrapped by binaryFn/unaryFn/assignment/filter
var OPERATORS = extend(createMap(), {
    '+':function(self, locals, a, b) {
        a=a(self, locals); b=b(self, locals);
        if (isDefined(a)) {
            if (isDefined(b)) {
                return a + b;
            }
            return a;
        }
        return isDefined(b)?b:undefined;},
    '-':function(self, locals, a, b) {
        a=a(self, locals); b=b(self, locals);
        return (isDefined(a)?a:0)-(isDefined(b)?b:0);
    },
    '*':function(self, locals, a, b) {return a(self, locals)*b(self, locals);},
    '/':function(self, locals, a, b) {return a(self, locals)/b(self, locals);},
    '%':function(self, locals, a, b) {return a(self, locals)%b(self, locals);},
    '===':function(self, locals, a, b) {return a(self, locals)===b(self, locals);},
    '!==':function(self, locals, a, b) {return a(self, locals)!==b(self, locals);},
    '==':function(self, locals, a, b) {return a(self, locals)==b(self, locals);},
    '!=':function(self, locals, a, b) {return a(self, locals)!=b(self, locals);},
    '<':function(self, locals, a, b) {return a(self, locals)<b(self, locals);},
    '>':function(self, locals, a, b) {return a(self, locals)>b(self, locals);},
    '<=':function(self, locals, a, b) {return a(self, locals)<=b(self, locals);},
    '>=':function(self, locals, a, b) {return a(self, locals)>=b(self, locals);},
    '&&':function(self, locals, a, b) {return a(self, locals)&&b(self, locals);},
    '||':function(self, locals, a, b) {return a(self, locals)||b(self, locals);},
    '!':function(self, locals, a) {return !a(self, locals);},

    //Tokenized as operators but parsed as assignment/filters
    '=':true,
    '|':true
});
var ESCAPE = {"n":"\n", "f":"\f", "r":"\r", "t":"\t", "v":"\v", "'":"'", '"':'"'};


/////////////////////////////////////////

/**
 * @constructor
 */
var Lexer = function(options) {
    this.options = options;
};

Lexer.prototype = {
    constructor: Lexer,

    lex: function(text) {
        this.text = text;
        this.index = 0;
        this.ch = undefined;
        this.tokens = [];

        while (this.index < this.text.length) {
            this.ch = this.text.charAt(this.index);
            if (this.is('"\'')) {
                this.readString(this.ch);
            } else if (this.isNumber(this.ch) || this.is('.') && this.isNumber(this.peek())) {
                this.readNumber();
            } else if (this.isIdent(this.ch)) {
                this.readIdent();
            } else if (this.is('(){}[].,;:?')) {
                this.tokens.push({
                    index: this.index,
                    text: this.ch
                });
                this.index++;
            } else if (this.isWhitespace(this.ch)) {
                this.index++;
            } else {
                var ch2 = this.ch + this.peek();
                var ch3 = ch2 + this.peek(2);
                var fn = OPERATORS[this.ch];
                var fn2 = OPERATORS[ch2];
                var fn3 = OPERATORS[ch3];
                if (fn3) {
                    this.tokens.push({index: this.index, text: ch3, fn: fn3});
                    this.index += 3;
                } else if (fn2) {
                    this.tokens.push({index: this.index, text: ch2, fn: fn2});
                    this.index += 2;
                } else if (fn) {
                    this.tokens.push({
                        index: this.index,
                        text: this.ch,
                        fn: fn
                    });
                    this.index += 1;
                } else {
                    this.throwError('Unexpected next character ', this.index, this.index + 1);
                }
            }
        }
        return this.tokens;
    },

    is: function(chars) {
        return chars.indexOf(this.ch) !== -1;
    },

    peek: function(i) {
        var num = i || 1;
        return (this.index + num < this.text.length) ? this.text.charAt(this.index + num) : false;
    },

    isNumber: function(ch) {
        return ('0' <= ch && ch <= '9');
    },

    isWhitespace: function(ch) {
        // IE treats non-breaking space as \u00A0
        return (ch === ' ' || ch === '\r' || ch === '\t' ||
            ch === '\n' || ch === '\v' || ch === '\u00A0');
    },

    isIdent: function(ch) {
        return ('a' <= ch && ch <= 'z' ||
            'A' <= ch && ch <= 'Z' ||
            '_' === ch || ch === '$');
    },

    isExpOperator: function(ch) {
        return (ch === '-' || ch === '+' || this.isNumber(ch));
    },

    throwError: function(error, start, end) {
        end = end || this.index;
        var colStr = (isDefined(start)
            ? 's ' + start +  '-' + this.index + ' [' + this.text.substring(start, end) + ']'
            : ' ' + end);
        throw $parseMinErr('lexerr', 'Lexer Error: {0} at column{1} in expression [{2}].',
            error, colStr, this.text);
    },

    readNumber: function() {
        var number = '';
        var start = this.index;
        while (this.index < this.text.length) {
            var ch = lowercase(this.text.charAt(this.index));
            if (ch == '.' || this.isNumber(ch)) {
                number += ch;
            } else {
                var peekCh = this.peek();
                if (ch == 'e' && this.isExpOperator(peekCh)) {
                    number += ch;
                } else if (this.isExpOperator(ch) &&
                    peekCh && this.isNumber(peekCh) &&
                    number.charAt(number.length - 1) == 'e') {
                    number += ch;
                } else if (this.isExpOperator(ch) &&
                    (!peekCh || !this.isNumber(peekCh)) &&
                    number.charAt(number.length - 1) == 'e') {
                    this.throwError('Invalid exponent');
                } else {
                    break;
                }
            }
            this.index++;
        }
        number = 1 * number;
        this.tokens.push({
            index: start,
            text: number,
            constant: true,
            fn: function() { return number; }
        });
    },

    readIdent: function() {
        var expression = this.text;

        var ident = '';
        var start = this.index;

        var lastDot, peekIndex, methodName, ch;

        while (this.index < this.text.length) {
            ch = this.text.charAt(this.index);
            if (ch === '.' || this.isIdent(ch) || this.isNumber(ch)) {
                if (ch === '.') lastDot = this.index;
                ident += ch;
            } else {
                break;
            }
            this.index++;
        }

        //check if the identifier ends with . and if so move back one char
        if (lastDot && ident[ident.length - 1] === '.') {
            this.index--;
            ident = ident.slice(0, -1);
            lastDot = ident.lastIndexOf('.');
            if (lastDot === -1) {
                lastDot = undefined;
            }
        }

        //check if this is not a method invocation and if it is back out to last dot
        if (lastDot) {
            peekIndex = this.index;
            while (peekIndex < this.text.length) {
                ch = this.text.charAt(peekIndex);
                if (ch === '(') {
                    methodName = ident.substr(lastDot - start + 1);
                    ident = ident.substr(0, lastDot - start);
                    this.index = peekIndex;
                    break;
                }
                if (this.isWhitespace(ch)) {
                    peekIndex++;
                } else {
                    break;
                }
            }
        }

        this.tokens.push({
            index: start,
            text: ident,
            fn: CONSTANTS[ident] || getterFn(ident, this.options, expression)
        });

        if (methodName) {
            this.tokens.push({
                index: lastDot,
                text: '.'
            });
            this.tokens.push({
                index: lastDot + 1,
                text: methodName
            });
        }
    },

    readString: function(quote) {
        var start = this.index;
        this.index++;
        var string = '';
        var rawString = quote;
        var escape = false;
        while (this.index < this.text.length) {
            var ch = this.text.charAt(this.index);
            rawString += ch;
            if (escape) {
                if (ch === 'u') {
                    var hex = this.text.substring(this.index + 1, this.index + 5);
                    if (!hex.match(/[\da-f]{4}/i))
                        this.throwError('Invalid unicode escape [\\u' + hex + ']');
                    this.index += 4;
                    string += String.fromCharCode(parseInt(hex, 16));
                } else {
                    var rep = ESCAPE[ch];
                    string = string + (rep || ch);
                }
                escape = false;
            } else if (ch === '\\') {
                escape = true;
            } else if (ch === quote) {
                this.index++;
                this.tokens.push({
                    index: start,
                    text: rawString,
                    string: string,
                    constant: true,
                    fn: function() { return string; }
                });
                return;
            } else {
                string += ch;
            }
            this.index++;
        }
        this.throwError('Unterminated quote', start);
    }
};


function isConstant(exp) {
    return exp.constant;
}

/*----------------------------------*/
/**
 * @constructor
 */
var Parser = function(lexer, $filter, options) {
    this.lexer = lexer;
    this.$filter = $filter;
    this.options = options;
};

Parser.ZERO = extend(function() {
    return 0;
}, {
    sharedGetter: true,
    constant: true
});

Parser.prototype = {
    constructor: Parser,

    parse: function(text) {
        this.text = text;
        this.tokens = this.lexer.lex(text);

        var value = this.statements();

        if (this.tokens.length !== 0) {
            this.throwError('is an unexpected token', this.tokens[0]);
        }

        value.literal = !!value.literal;
        value.constant = !!value.constant;

        return value;
    },

    primary: function() {
        var primary;
        if (this.expect('(')) {
            primary = this.filterChain();
            this.consume(')');
        } else if (this.expect('[')) {
            primary = this.arrayDeclaration();
        } else if (this.expect('{')) {
            primary = this.object();
        } else {
            var token = this.expect();
            primary = token.fn;
            if (!primary) {
                this.throwError('not a primary expression', token);
            }
            if (token.constant) {
                primary.constant = true;
                primary.literal = true;
            }
        }

        var next, context;
        while ((next = this.expect('(', '[', '.'))) {
            if (next.text === '(') {
                primary = this.functionCall(primary, context);
                context = null;
            } else if (next.text === '[') {
                context = primary;
                primary = this.objectIndex(primary);
            } else if (next.text === '.') {
                context = primary;
                primary = this.fieldAccess(primary);
            } else {
                this.throwError('IMPOSSIBLE');
            }
        }
        return primary;
    },

    throwError: function(msg, token) {
        throw $parseMinErr('syntax',
            'Syntax Error: Token \'{0}\' {1} at column {2} of the expression [{3}] starting at [{4}].',
            token.text, msg, (token.index + 1), this.text, this.text.substring(token.index));
    },

    peekToken: function() {
        if (this.tokens.length === 0)
            throw $parseMinErr('ueoe', 'Unexpected end of expression: {0}', this.text);
        return this.tokens[0];
    },

    peek: function(e1, e2, e3, e4) {
        if (this.tokens.length > 0) {
            var token = this.tokens[0];
            var t = token.text;
            if (t === e1 || t === e2 || t === e3 || t === e4 ||
                (!e1 && !e2 && !e3 && !e4)) {
                return token;
            }
        }
        return false;
    },

    expect: function(e1, e2, e3, e4) {
        var token = this.peek(e1, e2, e3, e4);
        if (token) {
            this.tokens.shift();
            return token;
        }
        return false;
    },

    consume: function(e1) {
        if (!this.expect(e1)) {
            this.throwError('is unexpected, expecting [' + e1 + ']', this.peek());
        }
    },

    unaryFn: function(fn, right) {
        return extend(function $parseUnaryFn(self, locals) {
            return fn(self, locals, right);
        }, {
            constant:right.constant,
            inputs: [right]
        });
    },

    binaryFn: function(left, fn, right, isBranching) {
        return extend(function $parseBinaryFn(self, locals) {
            return fn(self, locals, left, right);
        }, {
            constant: left.constant && right.constant,
            inputs: !isBranching && [left, right]
        });
    },

    statements: function() {
        var statements = [];
        while (true) {
            if (this.tokens.length > 0 && !this.peek('}', ')', ';', ']'))
                statements.push(this.filterChain());
            if (!this.expect(';')) {
                // optimize for the common case where there is only one statement.
                // TODO(size): maybe we should not support multiple statements?
                return (statements.length === 1)
                    ? statements[0]
                    : function $parseStatements(self, locals) {
                    var value;
                    for (var i = 0, ii = statements.length; i < ii; i++) {
                        value = statements[i](self, locals);
                    }
                    return value;
                };
            }
        }
    },

    filterChain: function() {
        var left = this.expression();
        var token;
        while ((token = this.expect('|'))) {
            left = this.filter(left);
        }
        return left;
    },

    filter: function(inputFn) {
        var token = this.expect();
        var fn = this.$filter(token.text);
        var argsFn;
        var args;

        if (this.peek(':')) {
            argsFn = [];
            args = []; // we can safely reuse the array
            while (this.expect(':')) {
                argsFn.push(this.expression());
            }
        }

        var inputs = [inputFn].concat(argsFn || []);

        return extend(function $parseFilter(self, locals) {
            var input = inputFn(self, locals);
            if (args) {
                args[0] = input;

                var i = argsFn.length;
                while (i--) {
                    args[i + 1] = argsFn[i](self, locals);
                }

                return fn.apply(undefined, args);
            }

            return fn(input);
        }, {
            constant: !fn.$stateful && inputs.every(isConstant),
            inputs: !fn.$stateful && inputs
        });
    },

    expression: function() {
        return this.assignment();
    },

    assignment: function() {
        var left = this.ternary();
        var right;
        var token;
        if ((token = this.expect('='))) {
            if (!left.assign) {
                this.throwError('implies assignment but [' +
                    this.text.substring(0, token.index) + '] can not be assigned to', token);
            }
            right = this.ternary();
            return extend(function $parseAssignment(scope, locals) {
                return left.assign(scope, right(scope, locals), locals);
            }, {
                inputs: [left, right]
            });
        }
        return left;
    },

    ternary: function() {
        var left = this.logicalOR();
        var middle;
        var token;
        if ((token = this.expect('?'))) {
            middle = this.assignment();
            if ((token = this.expect(':'))) {
                var right = this.assignment();

                return extend(function $parseTernary(self, locals) {
                    return left(self, locals) ? middle(self, locals) : right(self, locals);
                }, {
                    constant: left.constant && middle.constant && right.constant
                });

            } else {
                this.throwError('expected :', token);
            }
        }

        return left;
    },

    logicalOR: function() {
        var left = this.logicalAND();
        var token;
        while ((token = this.expect('||'))) {
            left = this.binaryFn(left, token.fn, this.logicalAND(), true);
        }
        return left;
    },

    logicalAND: function() {
        var left = this.equality();
        var token;
        if ((token = this.expect('&&'))) {
            left = this.binaryFn(left, token.fn, this.logicalAND(), true);
        }
        return left;
    },

    equality: function() {
        var left = this.relational();
        var token;
        if ((token = this.expect('==','!=','===','!=='))) {
            left = this.binaryFn(left, token.fn, this.equality());
        }
        return left;
    },

    relational: function() {
        var left = this.additive();
        var token;
        if ((token = this.expect('<', '>', '<=', '>='))) {
            left = this.binaryFn(left, token.fn, this.relational());
        }
        return left;
    },

    additive: function() {
        var left = this.multiplicative();
        var token;
        while ((token = this.expect('+','-'))) {
            left = this.binaryFn(left, token.fn, this.multiplicative());
        }
        return left;
    },

    multiplicative: function() {
        var left = this.unary();
        var token;
        while ((token = this.expect('*','/','%'))) {
            left = this.binaryFn(left, token.fn, this.unary());
        }
        return left;
    },

    unary: function() {
        var token;
        if (this.expect('+')) {
            return this.primary();
        } else if ((token = this.expect('-'))) {
            return this.binaryFn(Parser.ZERO, token.fn, this.unary());
        } else if ((token = this.expect('!'))) {
            return this.unaryFn(token.fn, this.unary());
        } else {
            return this.primary();
        }
    },

    fieldAccess: function(object) {
        var expression = this.text;
        var field = this.expect().text;
        var getter = getterFn(field, this.options, expression);

        return extend(function $parseFieldAccess(scope, locals, self) {
            return getter(self || object(scope, locals));
        }, {
            assign: function(scope, value, locals) {
                var o = object(scope, locals);
                if (!o) object.assign(scope, o = {});
                return setter(o, field, value, expression);
            }
        });
    },

    objectIndex: function(obj) {
        var expression = this.text;

        var indexFn = this.expression();
        this.consume(']');

        return extend(function $parseObjectIndex(self, locals) {
            var o = obj(self, locals),
                i = indexFn(self, locals),
                v;

            ensureSafeMemberName(i, expression);
            if (!o) return undefined;
            v = ensureSafeObject(o[i], expression);
            return v;
        }, {
            assign: function(self, value, locals) {
                var key = ensureSafeMemberName(indexFn(self, locals), expression);
                // prevent overwriting of Function.constructor which would break ensureSafeObject check
                var o = ensureSafeObject(obj(self, locals), expression);
                if (!o) obj.assign(self, o = {});
                /* jshint ignore:start */
                return o[key] = value;
                /* jshint ignore:end */
            }
        });
    },

    functionCall: function(fnGetter, contextGetter) {
        var argsFn = [];
        if (this.peekToken().text !== ')') {
            do {
                argsFn.push(this.expression());
            } while (this.expect(','));
        }
        this.consume(')');

        var expressionText = this.text;
        // we can safely reuse the array across invocations
        // #b. IE的apply不能接受null
        var args = []; //argsFn.length ? [] : null;

        return function $parseFunctionCall(scope, locals) {
            var context = contextGetter ? contextGetter(scope, locals) : scope;
            var fn = fnGetter(scope, locals, context) || noop;

            if (args) {
                var i = argsFn.length;
                while (i--) {
                    args[i] = ensureSafeObject(argsFn[i](scope, locals), expressionText);
                }
            }

            ensureSafeObject(context, expressionText);
            ensureSafeFunction(fn, expressionText);

            // IE stupidity! (IE doesn't have apply for some native functions)
            var v = fn.apply
                ? fn.apply(context, args)
                : fn(args[0], args[1], args[2], args[3], args[4]);

            return ensureSafeObject(v, expressionText);
        };
    },

    // This is used with json array declaration
    arrayDeclaration: function() {
        var elementFns = [];
        if (this.peekToken().text !== ']') {
            do {
                if (this.peek(']')) {
                    // Support trailing commas per ES5.1.
                    break;
                }
                var elementFn = this.expression();
                elementFns.push(elementFn);
            } while (this.expect(','));
        }
        this.consume(']');

        return extend(function $parseArrayLiteral(self, locals) {
            var array = [];
            for (var i = 0, ii = elementFns.length; i < ii; i++) {
                array.push(elementFns[i](self, locals));
            }
            return array;
        }, {
            literal: true,
            constant: elementFns.every(isConstant),
            inputs: elementFns
        });
    },

    object: function() {
        var keys = [], valueFns = [];
        if (this.peekToken().text !== '}') {
            do {
                if (this.peek('}')) {
                    // Support trailing commas per ES5.1.
                    break;
                }
                var token = this.expect();
                keys.push(token.string || token.text);
                this.consume(':');
                var value = this.expression();
                valueFns.push(value);
            } while (this.expect(','));
        }
        this.consume('}');

        return extend(function $parseObjectLiteral(self, locals) {
            var object = {};
            for (var i = 0, ii = valueFns.length; i < ii; i++) {
                object[keys[i]] = valueFns[i](self, locals);
            }
            return object;
        }, {
            literal: true,
            constant: valueFns.every(isConstant),
            inputs: valueFns
        });
    }
};

//////////////////////////////////////////////////
// Parser helper functions
//////////////////////////////////////////////////

function setter(obj, path, setValue, fullExp) {
    ensureSafeObject(obj, fullExp);

    var element = path.split('.'), key;
    for (var i = 0; element.length > 1; i++) {
        key = ensureSafeMemberName(element.shift(), fullExp);
        var propertyObj = ensureSafeObject(obj[key], fullExp);
        if (!propertyObj) {
            propertyObj = {};
            obj[key] = propertyObj;
        }
        obj = propertyObj;
    }
    key = ensureSafeMemberName(element.shift(), fullExp);
    ensureSafeObject(obj[key], fullExp);
    obj[key] = setValue;
    return setValue;
}

var getterFnCacheDefault = createMap();
var getterFnCacheExpensive = createMap();

function isPossiblyDangerousMemberName(name) {
    return name == 'constructor';
}
function identity($) {return $;}

/**
 * Implementation of the "Black Hole" variant from:
 * - http://jsperf.com/angularjs-parse-getter/4
 * - http://jsperf.com/path-evaluation-simplified/7
 */
function cspSafeGetterFn(key0, key1, key2, key3, key4, fullExp, expensiveChecks) {
    ensureSafeMemberName(key0, fullExp);
    ensureSafeMemberName(key1, fullExp);
    ensureSafeMemberName(key2, fullExp);
    ensureSafeMemberName(key3, fullExp);
    ensureSafeMemberName(key4, fullExp);
    var eso = function(o) {
        return ensureSafeObject(o, fullExp);
    };
    var eso0 = (expensiveChecks || isPossiblyDangerousMemberName(key0)) ? eso : identity;
    var eso1 = (expensiveChecks || isPossiblyDangerousMemberName(key1)) ? eso : identity;
    var eso2 = (expensiveChecks || isPossiblyDangerousMemberName(key2)) ? eso : identity;
    var eso3 = (expensiveChecks || isPossiblyDangerousMemberName(key3)) ? eso : identity;
    var eso4 = (expensiveChecks || isPossiblyDangerousMemberName(key4)) ? eso : identity;

    return function cspSafeGetter(scope, locals) {
        var pathVal = (locals && locals.hasOwnProperty(key0)) ? locals : scope;

        if (pathVal == null) return pathVal;
        pathVal = eso0(pathVal[key0]);

        if (!key1) return pathVal;
        if (pathVal == null) return undefined;
        pathVal = eso1(pathVal[key1]);

        if (!key2) return pathVal;
        if (pathVal == null) return undefined;
        pathVal = eso2(pathVal[key2]);

        if (!key3) return pathVal;
        if (pathVal == null) return undefined;
        pathVal = eso3(pathVal[key3]);

        if (!key4) return pathVal;
        if (pathVal == null) return undefined;
        pathVal = eso4(pathVal[key4]);

        return pathVal;
    };
}

function getterFnWithEnsureSafeObject(fn, fullExpression) {
    return function(s, l) {
        return fn(s, l, ensureSafeObject, fullExpression);
    };
}

function getterFn(path, options, fullExp) {
    var expensiveChecks = options.expensiveChecks;
    var getterFnCache = (expensiveChecks ? getterFnCacheExpensive : getterFnCacheDefault);
    var fn = getterFnCache[path];
    if (fn) return fn;


    var pathKeys = path.split('.'),
        pathKeysLength = pathKeys.length;

    // http://jsperf.com/angularjs-parse-getter/6
    if (options.csp) {
        if (pathKeysLength < 6) {
            fn = cspSafeGetterFn(pathKeys[0], pathKeys[1], pathKeys[2], pathKeys[3], pathKeys[4], fullExp, expensiveChecks);
        } else {
            fn = function cspSafeGetter(scope, locals) {
                var i = 0, val;
                do {
                    val = cspSafeGetterFn(pathKeys[i++], pathKeys[i++], pathKeys[i++], pathKeys[i++],
                        pathKeys[i++], fullExp, expensiveChecks)(scope, locals);

                    locals = undefined; // clear after first iteration
                    scope = val;
                } while (i < pathKeysLength);
                return val;
            };
        }
    } else {
        var code = '';
        if (expensiveChecks) {
            code += 's = eso(s, fe);\nl = eso(l, fe);\n';
        }
        var needsEnsureSafeObject = expensiveChecks;
        forEach(pathKeys, function(key, index) {
            ensureSafeMemberName(key, fullExp);
            var lookupJs = (index
                // we simply dereference 's' on any .dot notation
                ? 's'
                // but if we are first then we check locals first, and if so read it first
                // #a. IE不接受”点号保留字“,故取一切为['$key']
                : '((l&&l.hasOwnProperty("' + key + '"))?l:s)') + ('["' + key +'"]');
            if (expensiveChecks || isPossiblyDangerousMemberName(key)) {
                lookupJs = 'eso(' + lookupJs + ', fe)';
                needsEnsureSafeObject = true;
            }
            code += 'if(s == null) return undefined;\n' +
                's=' + lookupJs + ';\n';
        });
        code += 'return s;';

        /* jshint -W054 */
        var evaledFnGetter = new Function('s', 'l', 'eso', 'fe', code); // s=scope, l=locals, eso=ensureSafeObject
        /* jshint +W054 */
        evaledFnGetter.toString = valueFn(code);
        if (needsEnsureSafeObject) {
            evaledFnGetter = getterFnWithEnsureSafeObject(evaledFnGetter, fullExp);
        }
        fn = evaledFnGetter;
    }

    fn.sharedGetter = true;
    fn.assign = function(self, value) {
        return setter(self, path, value, path);
    };
    getterFnCache[path] = fn;
    return fn;
}

var objectValueOf = Object.prototype.valueOf;

function getValueOf(value) {
    return isFunction(value.valueOf) ? value.valueOf() : objectValueOf.call(value);
}

///////////////////////////////////

module.exports = new Parser(new Lexer({}), {}, {});
