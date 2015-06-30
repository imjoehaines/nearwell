(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],2:[function(require,module,exports){
(function (process){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
var splitPathRe =
    /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
var splitPath = function(filename) {
  return splitPathRe.exec(filename).slice(1);
};

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : process.cwd();

    // Skip empty and invalid entries
    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
  var isAbsolute = exports.isAbsolute(path),
      trailingSlash = substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
};

// posix version
exports.isAbsolute = function(path) {
  return path.charAt(0) === '/';
};

// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
};


// path.relative(from, to)
// posix version
exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

exports.sep = '/';
exports.delimiter = ':';

exports.dirname = function(path) {
  var result = splitPath(path),
      root = result[0],
      dir = result[1];

  if (!root && !dir) {
    // No dirname whatsoever
    return '.';
  }

  if (dir) {
    // It has a dirname, strip trailing slash
    dir = dir.substr(0, dir.length - 1);
  }

  return root + dir;
};


exports.basename = function(path, ext) {
  var f = splitPath(path)[2];
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPath(path)[3];
};

function filter (xs, f) {
    if (xs.filter) return xs.filter(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// String.prototype.substr - negative index don't work in IE8
var substr = 'ab'.substr(-1) === 'b'
    ? function (str, start, len) { return str.substr(start, len) }
    : function (str, start, len) {
        if (start < 0) start = str.length + start;
        return str.substr(start, len);
    }
;

}).call(this,require('_process'))

},{"_process":3}],3:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = setTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            currentQueue[queueIndex].run();
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    clearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        setTimeout(drainQueue, 0);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],4:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],5:[function(require,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = require('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = require('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./support/isBuffer":4,"_process":3,"inherits":1}],6:[function(require,module,exports){
arguments[4][1][0].apply(exports,arguments)
},{"dup":1}],7:[function(require,module,exports){
module.exports = require('./includes');

},{"./includes":9}],8:[function(require,module,exports){
var arrayEach = require('../internal/arrayEach'),
    baseEach = require('../internal/baseEach'),
    createForEach = require('../internal/createForEach');

/**
 * Iterates over elements of `collection` invoking `iteratee` for each element.
 * The `iteratee` is bound to `thisArg` and invoked with three arguments:
 * (value, index|key, collection). Iteratee functions may exit iteration early
 * by explicitly returning `false`.
 *
 * **Note:** As with other "Collections" methods, objects with a "length" property
 * are iterated like arrays. To avoid this behavior `_.forIn` or `_.forOwn`
 * may be used for object iteration.
 *
 * @static
 * @memberOf _
 * @alias each
 * @category Collection
 * @param {Array|Object|string} collection The collection to iterate over.
 * @param {Function} [iteratee=_.identity] The function invoked per iteration.
 * @param {*} [thisArg] The `this` binding of `iteratee`.
 * @returns {Array|Object|string} Returns `collection`.
 * @example
 *
 * _([1, 2]).forEach(function(n) {
 *   console.log(n);
 * }).value();
 * // => logs each value from left to right and returns the array
 *
 * _.forEach({ 'a': 1, 'b': 2 }, function(n, key) {
 *   console.log(n, key);
 * });
 * // => logs each value-key pair and returns the object (iteration order is not guaranteed)
 */
var forEach = createForEach(arrayEach, baseEach);

module.exports = forEach;

},{"../internal/arrayEach":12,"../internal/baseEach":14,"../internal/createForEach":28}],9:[function(require,module,exports){
var baseIndexOf = require('../internal/baseIndexOf'),
    getLength = require('../internal/getLength'),
    isArray = require('../lang/isArray'),
    isIterateeCall = require('../internal/isIterateeCall'),
    isLength = require('../internal/isLength'),
    isString = require('../lang/isString'),
    values = require('../object/values');

/* Native method references for those with the same name as other `lodash` methods. */
var nativeMax = Math.max;

/**
 * Checks if `value` is in `collection` using
 * [`SameValueZero`](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-samevaluezero)
 * for equality comparisons. If `fromIndex` is negative, it is used as the offset
 * from the end of `collection`.
 *
 * @static
 * @memberOf _
 * @alias contains, include
 * @category Collection
 * @param {Array|Object|string} collection The collection to search.
 * @param {*} target The value to search for.
 * @param {number} [fromIndex=0] The index to search from.
 * @param- {Object} [guard] Enables use as a callback for functions like `_.reduce`.
 * @returns {boolean} Returns `true` if a matching element is found, else `false`.
 * @example
 *
 * _.includes([1, 2, 3], 1);
 * // => true
 *
 * _.includes([1, 2, 3], 1, 2);
 * // => false
 *
 * _.includes({ 'user': 'fred', 'age': 40 }, 'fred');
 * // => true
 *
 * _.includes('pebbles', 'eb');
 * // => true
 */
function includes(collection, target, fromIndex, guard) {
  var length = collection ? getLength(collection) : 0;
  if (!isLength(length)) {
    collection = values(collection);
    length = collection.length;
  }
  if (!length) {
    return false;
  }
  if (typeof fromIndex != 'number' || (guard && isIterateeCall(target, fromIndex, guard))) {
    fromIndex = 0;
  } else {
    fromIndex = fromIndex < 0 ? nativeMax(length + fromIndex, 0) : (fromIndex || 0);
  }
  return (typeof collection == 'string' || !isArray(collection) && isString(collection))
    ? (fromIndex < length && collection.indexOf(target, fromIndex) > -1)
    : (baseIndexOf(collection, target, fromIndex) > -1);
}

module.exports = includes;

},{"../internal/baseIndexOf":18,"../internal/getLength":29,"../internal/isIterateeCall":34,"../internal/isLength":35,"../lang/isArray":41,"../lang/isString":45,"../object/values":51}],10:[function(require,module,exports){
/** Used as the `TypeError` message for "Functions" methods. */
var FUNC_ERROR_TEXT = 'Expected a function';

/* Native method references for those with the same name as other `lodash` methods. */
var nativeMax = Math.max;

/**
 * Creates a function that invokes `func` with the `this` binding of the
 * created function and arguments from `start` and beyond provided as an array.
 *
 * **Note:** This method is based on the [rest parameter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/rest_parameters).
 *
 * @static
 * @memberOf _
 * @category Function
 * @param {Function} func The function to apply a rest parameter to.
 * @param {number} [start=func.length-1] The start position of the rest parameter.
 * @returns {Function} Returns the new function.
 * @example
 *
 * var say = _.restParam(function(what, names) {
 *   return what + ' ' + _.initial(names).join(', ') +
 *     (_.size(names) > 1 ? ', & ' : '') + _.last(names);
 * });
 *
 * say('hello', 'fred', 'barney', 'pebbles');
 * // => 'hello fred, barney, & pebbles'
 */
function restParam(func, start) {
  if (typeof func != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  start = nativeMax(start === undefined ? (func.length - 1) : (+start || 0), 0);
  return function() {
    var args = arguments,
        index = -1,
        length = nativeMax(args.length - start, 0),
        rest = Array(length);

    while (++index < length) {
      rest[index] = args[start + index];
    }
    switch (start) {
      case 0: return func.call(this, rest);
      case 1: return func.call(this, args[0], rest);
      case 2: return func.call(this, args[0], args[1], rest);
    }
    var otherArgs = Array(start + 1);
    index = -1;
    while (++index < start) {
      otherArgs[index] = args[index];
    }
    otherArgs[start] = rest;
    return func.apply(this, otherArgs);
  };
}

module.exports = restParam;

},{}],11:[function(require,module,exports){
/**
 * Copies the values of `source` to `array`.
 *
 * @private
 * @param {Array} source The array to copy values from.
 * @param {Array} [array=[]] The array to copy values to.
 * @returns {Array} Returns `array`.
 */
function arrayCopy(source, array) {
  var index = -1,
      length = source.length;

  array || (array = Array(length));
  while (++index < length) {
    array[index] = source[index];
  }
  return array;
}

module.exports = arrayCopy;

},{}],12:[function(require,module,exports){
/**
 * A specialized version of `_.forEach` for arrays without support for callback
 * shorthands and `this` binding.
 *
 * @private
 * @param {Array} array The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns `array`.
 */
function arrayEach(array, iteratee) {
  var index = -1,
      length = array.length;

  while (++index < length) {
    if (iteratee(array[index], index, array) === false) {
      break;
    }
  }
  return array;
}

module.exports = arrayEach;

},{}],13:[function(require,module,exports){
/**
 * Copies properties of `source` to `object`.
 *
 * @private
 * @param {Object} source The object to copy properties from.
 * @param {Array} props The property names to copy.
 * @param {Object} [object={}] The object to copy properties to.
 * @returns {Object} Returns `object`.
 */
function baseCopy(source, props, object) {
  object || (object = {});

  var index = -1,
      length = props.length;

  while (++index < length) {
    var key = props[index];
    object[key] = source[key];
  }
  return object;
}

module.exports = baseCopy;

},{}],14:[function(require,module,exports){
var baseForOwn = require('./baseForOwn'),
    createBaseEach = require('./createBaseEach');

/**
 * The base implementation of `_.forEach` without support for callback
 * shorthands and `this` binding.
 *
 * @private
 * @param {Array|Object|string} collection The collection to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array|Object|string} Returns `collection`.
 */
var baseEach = createBaseEach(baseForOwn);

module.exports = baseEach;

},{"./baseForOwn":17,"./createBaseEach":26}],15:[function(require,module,exports){
var createBaseFor = require('./createBaseFor');

/**
 * The base implementation of `baseForIn` and `baseForOwn` which iterates
 * over `object` properties returned by `keysFunc` invoking `iteratee` for
 * each property. Iteratee functions may exit iteration early by explicitly
 * returning `false`.
 *
 * @private
 * @param {Object} object The object to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @param {Function} keysFunc The function to get the keys of `object`.
 * @returns {Object} Returns `object`.
 */
var baseFor = createBaseFor();

module.exports = baseFor;

},{"./createBaseFor":27}],16:[function(require,module,exports){
var baseFor = require('./baseFor'),
    keysIn = require('../object/keysIn');

/**
 * The base implementation of `_.forIn` without support for callback
 * shorthands and `this` binding.
 *
 * @private
 * @param {Object} object The object to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Object} Returns `object`.
 */
function baseForIn(object, iteratee) {
  return baseFor(object, iteratee, keysIn);
}

module.exports = baseForIn;

},{"../object/keysIn":49,"./baseFor":15}],17:[function(require,module,exports){
var baseFor = require('./baseFor'),
    keys = require('../object/keys');

/**
 * The base implementation of `_.forOwn` without support for callback
 * shorthands and `this` binding.
 *
 * @private
 * @param {Object} object The object to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Object} Returns `object`.
 */
function baseForOwn(object, iteratee) {
  return baseFor(object, iteratee, keys);
}

module.exports = baseForOwn;

},{"../object/keys":48,"./baseFor":15}],18:[function(require,module,exports){
var indexOfNaN = require('./indexOfNaN');

/**
 * The base implementation of `_.indexOf` without support for binary searches.
 *
 * @private
 * @param {Array} array The array to search.
 * @param {*} value The value to search for.
 * @param {number} fromIndex The index to search from.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function baseIndexOf(array, value, fromIndex) {
  if (value !== value) {
    return indexOfNaN(array, fromIndex);
  }
  var index = fromIndex - 1,
      length = array.length;

  while (++index < length) {
    if (array[index] === value) {
      return index;
    }
  }
  return -1;
}

module.exports = baseIndexOf;

},{"./indexOfNaN":31}],19:[function(require,module,exports){
var arrayEach = require('./arrayEach'),
    baseMergeDeep = require('./baseMergeDeep'),
    isArray = require('../lang/isArray'),
    isArrayLike = require('./isArrayLike'),
    isObject = require('../lang/isObject'),
    isObjectLike = require('./isObjectLike'),
    isTypedArray = require('../lang/isTypedArray'),
    keys = require('../object/keys');

/**
 * The base implementation of `_.merge` without support for argument juggling,
 * multiple sources, and `this` binding `customizer` functions.
 *
 * @private
 * @param {Object} object The destination object.
 * @param {Object} source The source object.
 * @param {Function} [customizer] The function to customize merging properties.
 * @param {Array} [stackA=[]] Tracks traversed source objects.
 * @param {Array} [stackB=[]] Associates values with source counterparts.
 * @returns {Object} Returns `object`.
 */
function baseMerge(object, source, customizer, stackA, stackB) {
  if (!isObject(object)) {
    return object;
  }
  var isSrcArr = isArrayLike(source) && (isArray(source) || isTypedArray(source)),
      props = isSrcArr ? null : keys(source);

  arrayEach(props || source, function(srcValue, key) {
    if (props) {
      key = srcValue;
      srcValue = source[key];
    }
    if (isObjectLike(srcValue)) {
      stackA || (stackA = []);
      stackB || (stackB = []);
      baseMergeDeep(object, source, key, baseMerge, customizer, stackA, stackB);
    }
    else {
      var value = object[key],
          result = customizer ? customizer(value, srcValue, key, object, source) : undefined,
          isCommon = result === undefined;

      if (isCommon) {
        result = srcValue;
      }
      if ((result !== undefined || (isSrcArr && !(key in object))) &&
          (isCommon || (result === result ? (result !== value) : (value === value)))) {
        object[key] = result;
      }
    }
  });
  return object;
}

module.exports = baseMerge;

},{"../lang/isArray":41,"../lang/isObject":43,"../lang/isTypedArray":46,"../object/keys":48,"./arrayEach":12,"./baseMergeDeep":20,"./isArrayLike":32,"./isObjectLike":36}],20:[function(require,module,exports){
var arrayCopy = require('./arrayCopy'),
    isArguments = require('../lang/isArguments'),
    isArray = require('../lang/isArray'),
    isArrayLike = require('./isArrayLike'),
    isPlainObject = require('../lang/isPlainObject'),
    isTypedArray = require('../lang/isTypedArray'),
    toPlainObject = require('../lang/toPlainObject');

/**
 * A specialized version of `baseMerge` for arrays and objects which performs
 * deep merges and tracks traversed objects enabling objects with circular
 * references to be merged.
 *
 * @private
 * @param {Object} object The destination object.
 * @param {Object} source The source object.
 * @param {string} key The key of the value to merge.
 * @param {Function} mergeFunc The function to merge values.
 * @param {Function} [customizer] The function to customize merging properties.
 * @param {Array} [stackA=[]] Tracks traversed source objects.
 * @param {Array} [stackB=[]] Associates values with source counterparts.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */
function baseMergeDeep(object, source, key, mergeFunc, customizer, stackA, stackB) {
  var length = stackA.length,
      srcValue = source[key];

  while (length--) {
    if (stackA[length] == srcValue) {
      object[key] = stackB[length];
      return;
    }
  }
  var value = object[key],
      result = customizer ? customizer(value, srcValue, key, object, source) : undefined,
      isCommon = result === undefined;

  if (isCommon) {
    result = srcValue;
    if (isArrayLike(srcValue) && (isArray(srcValue) || isTypedArray(srcValue))) {
      result = isArray(value)
        ? value
        : (isArrayLike(value) ? arrayCopy(value) : []);
    }
    else if (isPlainObject(srcValue) || isArguments(srcValue)) {
      result = isArguments(value)
        ? toPlainObject(value)
        : (isPlainObject(value) ? value : {});
    }
    else {
      isCommon = false;
    }
  }
  // Add the source value to the stack of traversed objects and associate
  // it with its merged value.
  stackA.push(srcValue);
  stackB.push(result);

  if (isCommon) {
    // Recursively merge objects and arrays (susceptible to call stack limits).
    object[key] = mergeFunc(result, srcValue, customizer, stackA, stackB);
  } else if (result === result ? (result !== value) : (value === value)) {
    object[key] = result;
  }
}

module.exports = baseMergeDeep;

},{"../lang/isArguments":40,"../lang/isArray":41,"../lang/isPlainObject":44,"../lang/isTypedArray":46,"../lang/toPlainObject":47,"./arrayCopy":11,"./isArrayLike":32}],21:[function(require,module,exports){
/**
 * The base implementation of `_.property` without support for deep paths.
 *
 * @private
 * @param {string} key The key of the property to get.
 * @returns {Function} Returns the new function.
 */
function baseProperty(key) {
  return function(object) {
    return object == null ? undefined : object[key];
  };
}

module.exports = baseProperty;

},{}],22:[function(require,module,exports){
/**
 * Converts `value` to a string if it's not one. An empty string is returned
 * for `null` or `undefined` values.
 *
 * @private
 * @param {*} value The value to process.
 * @returns {string} Returns the string.
 */
function baseToString(value) {
  if (typeof value == 'string') {
    return value;
  }
  return value == null ? '' : (value + '');
}

module.exports = baseToString;

},{}],23:[function(require,module,exports){
/**
 * The base implementation of `_.values` and `_.valuesIn` which creates an
 * array of `object` property values corresponding to the property names
 * of `props`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Array} props The property names to get values for.
 * @returns {Object} Returns the array of property values.
 */
function baseValues(object, props) {
  var index = -1,
      length = props.length,
      result = Array(length);

  while (++index < length) {
    result[index] = object[props[index]];
  }
  return result;
}

module.exports = baseValues;

},{}],24:[function(require,module,exports){
var identity = require('../utility/identity');

/**
 * A specialized version of `baseCallback` which only supports `this` binding
 * and specifying the number of arguments to provide to `func`.
 *
 * @private
 * @param {Function} func The function to bind.
 * @param {*} thisArg The `this` binding of `func`.
 * @param {number} [argCount] The number of arguments to provide to `func`.
 * @returns {Function} Returns the callback.
 */
function bindCallback(func, thisArg, argCount) {
  if (typeof func != 'function') {
    return identity;
  }
  if (thisArg === undefined) {
    return func;
  }
  switch (argCount) {
    case 1: return function(value) {
      return func.call(thisArg, value);
    };
    case 3: return function(value, index, collection) {
      return func.call(thisArg, value, index, collection);
    };
    case 4: return function(accumulator, value, index, collection) {
      return func.call(thisArg, accumulator, value, index, collection);
    };
    case 5: return function(value, other, key, object, source) {
      return func.call(thisArg, value, other, key, object, source);
    };
  }
  return function() {
    return func.apply(thisArg, arguments);
  };
}

module.exports = bindCallback;

},{"../utility/identity":53}],25:[function(require,module,exports){
var bindCallback = require('./bindCallback'),
    isIterateeCall = require('./isIterateeCall'),
    restParam = require('../function/restParam');

/**
 * Creates a function that assigns properties of source object(s) to a given
 * destination object.
 *
 * **Note:** This function is used to create `_.assign`, `_.defaults`, and `_.merge`.
 *
 * @private
 * @param {Function} assigner The function to assign values.
 * @returns {Function} Returns the new assigner function.
 */
function createAssigner(assigner) {
  return restParam(function(object, sources) {
    var index = -1,
        length = object == null ? 0 : sources.length,
        customizer = length > 2 ? sources[length - 2] : undefined,
        guard = length > 2 ? sources[2] : undefined,
        thisArg = length > 1 ? sources[length - 1] : undefined;

    if (typeof customizer == 'function') {
      customizer = bindCallback(customizer, thisArg, 5);
      length -= 2;
    } else {
      customizer = typeof thisArg == 'function' ? thisArg : undefined;
      length -= (customizer ? 1 : 0);
    }
    if (guard && isIterateeCall(sources[0], sources[1], guard)) {
      customizer = length < 3 ? undefined : customizer;
      length = 1;
    }
    while (++index < length) {
      var source = sources[index];
      if (source) {
        assigner(object, source, customizer);
      }
    }
    return object;
  });
}

module.exports = createAssigner;

},{"../function/restParam":10,"./bindCallback":24,"./isIterateeCall":34}],26:[function(require,module,exports){
var getLength = require('./getLength'),
    isLength = require('./isLength'),
    toObject = require('./toObject');

/**
 * Creates a `baseEach` or `baseEachRight` function.
 *
 * @private
 * @param {Function} eachFunc The function to iterate over a collection.
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {Function} Returns the new base function.
 */
function createBaseEach(eachFunc, fromRight) {
  return function(collection, iteratee) {
    var length = collection ? getLength(collection) : 0;
    if (!isLength(length)) {
      return eachFunc(collection, iteratee);
    }
    var index = fromRight ? length : -1,
        iterable = toObject(collection);

    while ((fromRight ? index-- : ++index < length)) {
      if (iteratee(iterable[index], index, iterable) === false) {
        break;
      }
    }
    return collection;
  };
}

module.exports = createBaseEach;

},{"./getLength":29,"./isLength":35,"./toObject":39}],27:[function(require,module,exports){
var toObject = require('./toObject');

/**
 * Creates a base function for `_.forIn` or `_.forInRight`.
 *
 * @private
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {Function} Returns the new base function.
 */
function createBaseFor(fromRight) {
  return function(object, iteratee, keysFunc) {
    var iterable = toObject(object),
        props = keysFunc(object),
        length = props.length,
        index = fromRight ? length : -1;

    while ((fromRight ? index-- : ++index < length)) {
      var key = props[index];
      if (iteratee(iterable[key], key, iterable) === false) {
        break;
      }
    }
    return object;
  };
}

module.exports = createBaseFor;

},{"./toObject":39}],28:[function(require,module,exports){
var bindCallback = require('./bindCallback'),
    isArray = require('../lang/isArray');

/**
 * Creates a function for `_.forEach` or `_.forEachRight`.
 *
 * @private
 * @param {Function} arrayFunc The function to iterate over an array.
 * @param {Function} eachFunc The function to iterate over a collection.
 * @returns {Function} Returns the new each function.
 */
function createForEach(arrayFunc, eachFunc) {
  return function(collection, iteratee, thisArg) {
    return (typeof iteratee == 'function' && thisArg === undefined && isArray(collection))
      ? arrayFunc(collection, iteratee)
      : eachFunc(collection, bindCallback(iteratee, thisArg, 3));
  };
}

module.exports = createForEach;

},{"../lang/isArray":41,"./bindCallback":24}],29:[function(require,module,exports){
var baseProperty = require('./baseProperty');

/**
 * Gets the "length" property value of `object`.
 *
 * **Note:** This function is used to avoid a [JIT bug](https://bugs.webkit.org/show_bug.cgi?id=142792)
 * that affects Safari on at least iOS 8.1-8.3 ARM64.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {*} Returns the "length" value.
 */
var getLength = baseProperty('length');

module.exports = getLength;

},{"./baseProperty":21}],30:[function(require,module,exports){
var isNative = require('../lang/isNative');

/**
 * Gets the native function at `key` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the method to get.
 * @returns {*} Returns the function if it's native, else `undefined`.
 */
function getNative(object, key) {
  var value = object == null ? undefined : object[key];
  return isNative(value) ? value : undefined;
}

module.exports = getNative;

},{"../lang/isNative":42}],31:[function(require,module,exports){
/**
 * Gets the index at which the first occurrence of `NaN` is found in `array`.
 *
 * @private
 * @param {Array} array The array to search.
 * @param {number} fromIndex The index to search from.
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {number} Returns the index of the matched `NaN`, else `-1`.
 */
function indexOfNaN(array, fromIndex, fromRight) {
  var length = array.length,
      index = fromIndex + (fromRight ? 0 : -1);

  while ((fromRight ? index-- : ++index < length)) {
    var other = array[index];
    if (other !== other) {
      return index;
    }
  }
  return -1;
}

module.exports = indexOfNaN;

},{}],32:[function(require,module,exports){
var getLength = require('./getLength'),
    isLength = require('./isLength');

/**
 * Checks if `value` is array-like.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
 */
function isArrayLike(value) {
  return value != null && isLength(getLength(value));
}

module.exports = isArrayLike;

},{"./getLength":29,"./isLength":35}],33:[function(require,module,exports){
/** Used to detect unsigned integer values. */
var reIsUint = /^\d+$/;

/**
 * Used as the [maximum length](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-number.max_safe_integer)
 * of an array-like value.
 */
var MAX_SAFE_INTEGER = 9007199254740991;

/**
 * Checks if `value` is a valid array-like index.
 *
 * @private
 * @param {*} value The value to check.
 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
 */
function isIndex(value, length) {
  value = (typeof value == 'number' || reIsUint.test(value)) ? +value : -1;
  length = length == null ? MAX_SAFE_INTEGER : length;
  return value > -1 && value % 1 == 0 && value < length;
}

module.exports = isIndex;

},{}],34:[function(require,module,exports){
var isArrayLike = require('./isArrayLike'),
    isIndex = require('./isIndex'),
    isObject = require('../lang/isObject');

/**
 * Checks if the provided arguments are from an iteratee call.
 *
 * @private
 * @param {*} value The potential iteratee value argument.
 * @param {*} index The potential iteratee index or key argument.
 * @param {*} object The potential iteratee object argument.
 * @returns {boolean} Returns `true` if the arguments are from an iteratee call, else `false`.
 */
function isIterateeCall(value, index, object) {
  if (!isObject(object)) {
    return false;
  }
  var type = typeof index;
  if (type == 'number'
      ? (isArrayLike(object) && isIndex(index, object.length))
      : (type == 'string' && index in object)) {
    var other = object[index];
    return value === value ? (value === other) : (other !== other);
  }
  return false;
}

module.exports = isIterateeCall;

},{"../lang/isObject":43,"./isArrayLike":32,"./isIndex":33}],35:[function(require,module,exports){
/**
 * Used as the [maximum length](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-number.max_safe_integer)
 * of an array-like value.
 */
var MAX_SAFE_INTEGER = 9007199254740991;

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This function is based on [`ToLength`](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength).
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 */
function isLength(value) {
  return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

module.exports = isLength;

},{}],36:[function(require,module,exports){
/**
 * Checks if `value` is object-like.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

module.exports = isObjectLike;

},{}],37:[function(require,module,exports){
var baseForIn = require('./baseForIn'),
    isObjectLike = require('./isObjectLike');

/** `Object#toString` result references. */
var objectTag = '[object Object]';

/** Used for native method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the [`toStringTag`](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-object.prototype.tostring)
 * of values.
 */
var objToString = objectProto.toString;

/**
 * A fallback implementation of `_.isPlainObject` which checks if `value`
 * is an object created by the `Object` constructor or has a `[[Prototype]]`
 * of `null`.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
 */
function shimIsPlainObject(value) {
  var Ctor;

  // Exit early for non `Object` objects.
  if (!(isObjectLike(value) && objToString.call(value) == objectTag) ||
      (!hasOwnProperty.call(value, 'constructor') &&
        (Ctor = value.constructor, typeof Ctor == 'function' && !(Ctor instanceof Ctor)))) {
    return false;
  }
  // IE < 9 iterates inherited properties before own properties. If the first
  // iterated property is an object's own property then there are no inherited
  // enumerable properties.
  var result;
  // In most environments an object's own properties are iterated before
  // its inherited properties. If the last iterated property is an object's
  // own property then there are no inherited enumerable properties.
  baseForIn(value, function(subValue, key) {
    result = key;
  });
  return result === undefined || hasOwnProperty.call(value, result);
}

module.exports = shimIsPlainObject;

},{"./baseForIn":16,"./isObjectLike":36}],38:[function(require,module,exports){
var isArguments = require('../lang/isArguments'),
    isArray = require('../lang/isArray'),
    isIndex = require('./isIndex'),
    isLength = require('./isLength'),
    keysIn = require('../object/keysIn');

/** Used for native method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * A fallback implementation of `Object.keys` which creates an array of the
 * own enumerable property names of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function shimKeys(object) {
  var props = keysIn(object),
      propsLength = props.length,
      length = propsLength && object.length;

  var allowIndexes = !!length && isLength(length) &&
    (isArray(object) || isArguments(object));

  var index = -1,
      result = [];

  while (++index < propsLength) {
    var key = props[index];
    if ((allowIndexes && isIndex(key, length)) || hasOwnProperty.call(object, key)) {
      result.push(key);
    }
  }
  return result;
}

module.exports = shimKeys;

},{"../lang/isArguments":40,"../lang/isArray":41,"../object/keysIn":49,"./isIndex":33,"./isLength":35}],39:[function(require,module,exports){
var isObject = require('../lang/isObject');

/**
 * Converts `value` to an object if it's not one.
 *
 * @private
 * @param {*} value The value to process.
 * @returns {Object} Returns the object.
 */
function toObject(value) {
  return isObject(value) ? value : Object(value);
}

module.exports = toObject;

},{"../lang/isObject":43}],40:[function(require,module,exports){
var isArrayLike = require('../internal/isArrayLike'),
    isObjectLike = require('../internal/isObjectLike');

/** `Object#toString` result references. */
var argsTag = '[object Arguments]';

/** Used for native method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the [`toStringTag`](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-object.prototype.tostring)
 * of values.
 */
var objToString = objectProto.toString;

/**
 * Checks if `value` is classified as an `arguments` object.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
 * @example
 *
 * _.isArguments(function() { return arguments; }());
 * // => true
 *
 * _.isArguments([1, 2, 3]);
 * // => false
 */
function isArguments(value) {
  return isObjectLike(value) && isArrayLike(value) && objToString.call(value) == argsTag;
}

module.exports = isArguments;

},{"../internal/isArrayLike":32,"../internal/isObjectLike":36}],41:[function(require,module,exports){
var getNative = require('../internal/getNative'),
    isLength = require('../internal/isLength'),
    isObjectLike = require('../internal/isObjectLike');

/** `Object#toString` result references. */
var arrayTag = '[object Array]';

/** Used for native method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the [`toStringTag`](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-object.prototype.tostring)
 * of values.
 */
var objToString = objectProto.toString;

/* Native method references for those with the same name as other `lodash` methods. */
var nativeIsArray = getNative(Array, 'isArray');

/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * _.isArray(function() { return arguments; }());
 * // => false
 */
var isArray = nativeIsArray || function(value) {
  return isObjectLike(value) && isLength(value.length) && objToString.call(value) == arrayTag;
};

module.exports = isArray;

},{"../internal/getNative":30,"../internal/isLength":35,"../internal/isObjectLike":36}],42:[function(require,module,exports){
var escapeRegExp = require('../string/escapeRegExp'),
    isObjectLike = require('../internal/isObjectLike');

/** `Object#toString` result references. */
var funcTag = '[object Function]';

/** Used to detect host constructors (Safari > 5). */
var reIsHostCtor = /^\[object .+?Constructor\]$/;

/** Used for native method references. */
var objectProto = Object.prototype;

/** Used to resolve the decompiled source of functions. */
var fnToString = Function.prototype.toString;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the [`toStringTag`](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-object.prototype.tostring)
 * of values.
 */
var objToString = objectProto.toString;

/** Used to detect if a method is native. */
var reIsNative = RegExp('^' +
  escapeRegExp(fnToString.call(hasOwnProperty))
  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
);

/**
 * Checks if `value` is a native function.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a native function, else `false`.
 * @example
 *
 * _.isNative(Array.prototype.push);
 * // => true
 *
 * _.isNative(_);
 * // => false
 */
function isNative(value) {
  if (value == null) {
    return false;
  }
  if (objToString.call(value) == funcTag) {
    return reIsNative.test(fnToString.call(value));
  }
  return isObjectLike(value) && reIsHostCtor.test(value);
}

module.exports = isNative;

},{"../internal/isObjectLike":36,"../string/escapeRegExp":52}],43:[function(require,module,exports){
/**
 * Checks if `value` is the [language type](https://es5.github.io/#x8) of `Object`.
 * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(1);
 * // => false
 */
function isObject(value) {
  // Avoid a V8 JIT bug in Chrome 19-20.
  // See https://code.google.com/p/v8/issues/detail?id=2291 for more details.
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

module.exports = isObject;

},{}],44:[function(require,module,exports){
var getNative = require('../internal/getNative'),
    shimIsPlainObject = require('../internal/shimIsPlainObject');

/** `Object#toString` result references. */
var objectTag = '[object Object]';

/** Used for native method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the [`toStringTag`](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-object.prototype.tostring)
 * of values.
 */
var objToString = objectProto.toString;

/** Native method references. */
var getPrototypeOf = getNative(Object, 'getPrototypeOf');

/**
 * Checks if `value` is a plain object, that is, an object created by the
 * `Object` constructor or one with a `[[Prototype]]` of `null`.
 *
 * **Note:** This method assumes objects created by the `Object` constructor
 * have no inherited enumerable properties.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 * }
 *
 * _.isPlainObject(new Foo);
 * // => false
 *
 * _.isPlainObject([1, 2, 3]);
 * // => false
 *
 * _.isPlainObject({ 'x': 0, 'y': 0 });
 * // => true
 *
 * _.isPlainObject(Object.create(null));
 * // => true
 */
var isPlainObject = !getPrototypeOf ? shimIsPlainObject : function(value) {
  if (!(value && objToString.call(value) == objectTag)) {
    return false;
  }
  var valueOf = getNative(value, 'valueOf'),
      objProto = valueOf && (objProto = getPrototypeOf(valueOf)) && getPrototypeOf(objProto);

  return objProto
    ? (value == objProto || getPrototypeOf(value) == objProto)
    : shimIsPlainObject(value);
};

module.exports = isPlainObject;

},{"../internal/getNative":30,"../internal/shimIsPlainObject":37}],45:[function(require,module,exports){
var isObjectLike = require('../internal/isObjectLike');

/** `Object#toString` result references. */
var stringTag = '[object String]';

/** Used for native method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the [`toStringTag`](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-object.prototype.tostring)
 * of values.
 */
var objToString = objectProto.toString;

/**
 * Checks if `value` is classified as a `String` primitive or object.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
 * @example
 *
 * _.isString('abc');
 * // => true
 *
 * _.isString(1);
 * // => false
 */
function isString(value) {
  return typeof value == 'string' || (isObjectLike(value) && objToString.call(value) == stringTag);
}

module.exports = isString;

},{"../internal/isObjectLike":36}],46:[function(require,module,exports){
var isLength = require('../internal/isLength'),
    isObjectLike = require('../internal/isObjectLike');

/** `Object#toString` result references. */
var argsTag = '[object Arguments]',
    arrayTag = '[object Array]',
    boolTag = '[object Boolean]',
    dateTag = '[object Date]',
    errorTag = '[object Error]',
    funcTag = '[object Function]',
    mapTag = '[object Map]',
    numberTag = '[object Number]',
    objectTag = '[object Object]',
    regexpTag = '[object RegExp]',
    setTag = '[object Set]',
    stringTag = '[object String]',
    weakMapTag = '[object WeakMap]';

var arrayBufferTag = '[object ArrayBuffer]',
    float32Tag = '[object Float32Array]',
    float64Tag = '[object Float64Array]',
    int8Tag = '[object Int8Array]',
    int16Tag = '[object Int16Array]',
    int32Tag = '[object Int32Array]',
    uint8Tag = '[object Uint8Array]',
    uint8ClampedTag = '[object Uint8ClampedArray]',
    uint16Tag = '[object Uint16Array]',
    uint32Tag = '[object Uint32Array]';

/** Used to identify `toStringTag` values of typed arrays. */
var typedArrayTags = {};
typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
typedArrayTags[uint32Tag] = true;
typedArrayTags[argsTag] = typedArrayTags[arrayTag] =
typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] =
typedArrayTags[dateTag] = typedArrayTags[errorTag] =
typedArrayTags[funcTag] = typedArrayTags[mapTag] =
typedArrayTags[numberTag] = typedArrayTags[objectTag] =
typedArrayTags[regexpTag] = typedArrayTags[setTag] =
typedArrayTags[stringTag] = typedArrayTags[weakMapTag] = false;

/** Used for native method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the [`toStringTag`](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-object.prototype.tostring)
 * of values.
 */
var objToString = objectProto.toString;

/**
 * Checks if `value` is classified as a typed array.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
 * @example
 *
 * _.isTypedArray(new Uint8Array);
 * // => true
 *
 * _.isTypedArray([]);
 * // => false
 */
function isTypedArray(value) {
  return isObjectLike(value) && isLength(value.length) && !!typedArrayTags[objToString.call(value)];
}

module.exports = isTypedArray;

},{"../internal/isLength":35,"../internal/isObjectLike":36}],47:[function(require,module,exports){
var baseCopy = require('../internal/baseCopy'),
    keysIn = require('../object/keysIn');

/**
 * Converts `value` to a plain object flattening inherited enumerable
 * properties of `value` to own properties of the plain object.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to convert.
 * @returns {Object} Returns the converted plain object.
 * @example
 *
 * function Foo() {
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.assign({ 'a': 1 }, new Foo);
 * // => { 'a': 1, 'b': 2 }
 *
 * _.assign({ 'a': 1 }, _.toPlainObject(new Foo));
 * // => { 'a': 1, 'b': 2, 'c': 3 }
 */
function toPlainObject(value) {
  return baseCopy(value, keysIn(value));
}

module.exports = toPlainObject;

},{"../internal/baseCopy":13,"../object/keysIn":49}],48:[function(require,module,exports){
var getNative = require('../internal/getNative'),
    isArrayLike = require('../internal/isArrayLike'),
    isObject = require('../lang/isObject'),
    shimKeys = require('../internal/shimKeys');

/* Native method references for those with the same name as other `lodash` methods. */
var nativeKeys = getNative(Object, 'keys');

/**
 * Creates an array of the own enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects. See the
 * [ES spec](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-object.keys)
 * for more details.
 *
 * @static
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keys(new Foo);
 * // => ['a', 'b'] (iteration order is not guaranteed)
 *
 * _.keys('hi');
 * // => ['0', '1']
 */
var keys = !nativeKeys ? shimKeys : function(object) {
  var Ctor = object == null ? null : object.constructor;
  if ((typeof Ctor == 'function' && Ctor.prototype === object) ||
      (typeof object != 'function' && isArrayLike(object))) {
    return shimKeys(object);
  }
  return isObject(object) ? nativeKeys(object) : [];
};

module.exports = keys;

},{"../internal/getNative":30,"../internal/isArrayLike":32,"../internal/shimKeys":38,"../lang/isObject":43}],49:[function(require,module,exports){
var isArguments = require('../lang/isArguments'),
    isArray = require('../lang/isArray'),
    isIndex = require('../internal/isIndex'),
    isLength = require('../internal/isLength'),
    isObject = require('../lang/isObject');

/** Used for native method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Creates an array of the own and inherited enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects.
 *
 * @static
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keysIn(new Foo);
 * // => ['a', 'b', 'c'] (iteration order is not guaranteed)
 */
function keysIn(object) {
  if (object == null) {
    return [];
  }
  if (!isObject(object)) {
    object = Object(object);
  }
  var length = object.length;
  length = (length && isLength(length) &&
    (isArray(object) || isArguments(object)) && length) || 0;

  var Ctor = object.constructor,
      index = -1,
      isProto = typeof Ctor == 'function' && Ctor.prototype === object,
      result = Array(length),
      skipIndexes = length > 0;

  while (++index < length) {
    result[index] = (index + '');
  }
  for (var key in object) {
    if (!(skipIndexes && isIndex(key, length)) &&
        !(key == 'constructor' && (isProto || !hasOwnProperty.call(object, key)))) {
      result.push(key);
    }
  }
  return result;
}

module.exports = keysIn;

},{"../internal/isIndex":33,"../internal/isLength":35,"../lang/isArguments":40,"../lang/isArray":41,"../lang/isObject":43}],50:[function(require,module,exports){
var baseMerge = require('../internal/baseMerge'),
    createAssigner = require('../internal/createAssigner');

/**
 * Recursively merges own enumerable properties of the source object(s), that
 * don't resolve to `undefined` into the destination object. Subsequent sources
 * overwrite property assignments of previous sources. If `customizer` is
 * provided it is invoked to produce the merged values of the destination and
 * source properties. If `customizer` returns `undefined` merging is handled
 * by the method instead. The `customizer` is bound to `thisArg` and invoked
 * with five arguments: (objectValue, sourceValue, key, object, source).
 *
 * @static
 * @memberOf _
 * @category Object
 * @param {Object} object The destination object.
 * @param {...Object} [sources] The source objects.
 * @param {Function} [customizer] The function to customize assigned values.
 * @param {*} [thisArg] The `this` binding of `customizer`.
 * @returns {Object} Returns `object`.
 * @example
 *
 * var users = {
 *   'data': [{ 'user': 'barney' }, { 'user': 'fred' }]
 * };
 *
 * var ages = {
 *   'data': [{ 'age': 36 }, { 'age': 40 }]
 * };
 *
 * _.merge(users, ages);
 * // => { 'data': [{ 'user': 'barney', 'age': 36 }, { 'user': 'fred', 'age': 40 }] }
 *
 * // using a customizer callback
 * var object = {
 *   'fruits': ['apple'],
 *   'vegetables': ['beet']
 * };
 *
 * var other = {
 *   'fruits': ['banana'],
 *   'vegetables': ['carrot']
 * };
 *
 * _.merge(object, other, function(a, b) {
 *   if (_.isArray(a)) {
 *     return a.concat(b);
 *   }
 * });
 * // => { 'fruits': ['apple', 'banana'], 'vegetables': ['beet', 'carrot'] }
 */
var merge = createAssigner(baseMerge);

module.exports = merge;

},{"../internal/baseMerge":19,"../internal/createAssigner":25}],51:[function(require,module,exports){
var baseValues = require('../internal/baseValues'),
    keys = require('./keys');

/**
 * Creates an array of the own enumerable property values of `object`.
 *
 * **Note:** Non-object values are coerced to objects.
 *
 * @static
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property values.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.values(new Foo);
 * // => [1, 2] (iteration order is not guaranteed)
 *
 * _.values('hi');
 * // => ['h', 'i']
 */
function values(object) {
  return baseValues(object, keys(object));
}

module.exports = values;

},{"../internal/baseValues":23,"./keys":48}],52:[function(require,module,exports){
var baseToString = require('../internal/baseToString');

/**
 * Used to match `RegExp` [special characters](http://www.regular-expressions.info/characters.html#special).
 * In addition to special characters the forward slash is escaped to allow for
 * easier `eval` use and `Function` compilation.
 */
var reRegExpChars = /[.*+?^${}()|[\]\/\\]/g,
    reHasRegExpChars = RegExp(reRegExpChars.source);

/**
 * Escapes the `RegExp` special characters "\", "/", "^", "$", ".", "|", "?",
 * "*", "+", "(", ")", "[", "]", "{" and "}" in `string`.
 *
 * @static
 * @memberOf _
 * @category String
 * @param {string} [string=''] The string to escape.
 * @returns {string} Returns the escaped string.
 * @example
 *
 * _.escapeRegExp('[lodash](https://lodash.com/)');
 * // => '\[lodash\]\(https:\/\/lodash\.com\/\)'
 */
function escapeRegExp(string) {
  string = baseToString(string);
  return (string && reHasRegExpChars.test(string))
    ? string.replace(reRegExpChars, '\\$&')
    : string;
}

module.exports = escapeRegExp;

},{"../internal/baseToString":22}],53:[function(require,module,exports){
/**
 * This method returns the first argument provided to it.
 *
 * @static
 * @memberOf _
 * @category Utility
 * @param {*} value Any value.
 * @returns {*} Returns `value`.
 * @example
 *
 * var object = { 'user': 'fred' };
 *
 * _.identity(object) === object;
 * // => true
 */
function identity(value) {
  return value;
}

module.exports = identity;

},{}],54:[function(require,module,exports){
var Engine = require('./src/engine');

module.exports = {
  init: function(canvas, methods) {
    var engine = new Engine(canvas, methods);
    return engine.controller;
  }
};

},{"./src/engine":64}],55:[function(require,module,exports){
module.exports = require('./src/audio-manager');

},{"./src/audio-manager":56}],56:[function(require,module,exports){
var util = require('util');
var LoadedAudio = require('./loaded-audio');

var AudioManager = function() {
  var AudioContext = window.AudioContext || window.webkitAudioContext;

  this._ctx = new AudioContext();
  this._masterGain = this._ctx.createGain();
  this._volume = 1;
  this.isMuted = false;

  var iOS = /(iPad|iPhone|iPod)/g.test(navigator.userAgent);
  if (iOS) {
    this._enableiOS();
  }
};

AudioManager.prototype._enableiOS = function() {
  var self = this;

  var touch = function() {
    var buffer = self._ctx.createBuffer(1, 1, 22050);
    var source = self._ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(self._ctx.destination);
    source.start(0);

    window.removeEventListener('touchstart', touch, false);
  };

  window.addEventListener('touchstart', touch, false);
};

AudioManager.prototype.mute = function() {
  this.isMuted = true;
  this._updateMute();
};

AudioManager.prototype.unmute = function() {
  this.isMuted = false;
  this._updateMute();
};

AudioManager.prototype.toggleMute = function() {
  this.isMuted = !this.isMuted;
  this._updateMute();
};

AudioManager.prototype._updateMute = function() {
  this._masterGain.gain.value = this.isMuted ? 0 : this._volume;
};

AudioManager.prototype.setVolume = function(volume) {
  this._volume = volume;
  this._masterGain.gain.value = volume;
};

AudioManager.prototype.load = function(url, callback) {
  var loader = {
    done: function() {},
    error: function() {},
    progress: function() {}
  };

  if (callback && util.isFunction(callback)) {
    loader.done = callback;
  } else {
    if (callback.done) {
      loader.done = callback.done;
    }

    if (callback.error) {
      loader.error = callback.error;
    }

    if (callback.progress) {
      loader.progress = callback.progress;
    }
  }

  var self = this;

  var request = new XMLHttpRequest();
  request.open('GET', url, true);
  request.responseType = 'arraybuffer';

  request.addEventListener('progress', function(e) {
    loader.progress(e);
  });

  request.onload = function() {
    self.decodeAudioData(request.response, function(source) {
      loader.done(source);
    });
  };
  request.send();
};

AudioManager.prototype.decodeAudioData = function(data, callback) {
  var self = this;

  this._ctx.decodeAudioData(data, function(result) {
    var audio = new LoadedAudio(self._ctx, result, self._masterGain);

    callback(audio);
  });
};

module.exports = AudioManager;

},{"./loaded-audio":57,"util":5}],57:[function(require,module,exports){
var PlayingAudio = require('./playing-audio');

var LoadedAudio = function(ctx, buffer, masterGain) {
  this._ctx = ctx;
  this._masterGain = masterGain;
  this._buffer = buffer;
  this._buffer.loop = false;
};

LoadedAudio.prototype._createSound = function(gain) {
  var source = this._ctx.createBufferSource();
  source.buffer = this._buffer;

  this._masterGain.connect(this._ctx.destination);

  gain.connect(this._masterGain);

  source.connect(gain);

  return source;
};

LoadedAudio.prototype.play = function() {
  var gain = this._ctx.createGain();

  var sound = this._createSound(gain);

  sound.start(0);

  return new PlayingAudio(sound, gain);
};

LoadedAudio.prototype.fadeIn = function(value, time) {
  var gain = this._ctx.createGain();

  var sound = this._createSound(gain);

  gain.gain.setValueAtTime(0, 0);
  gain.gain.linearRampToValueAtTime(0.01, 0);
  gain.gain.linearRampToValueAtTime(value, time);

  sound.start(0);

  return new PlayingAudio(sound, gain);
};

LoadedAudio.prototype.loop = function() {
  var gain = this._ctx.createGain();

  var sound = this._createSound(gain);

  sound.loop = true;
  sound.start(0);

  return new PlayingAudio(sound, gain);
};

module.exports = LoadedAudio;

},{"./playing-audio":58}],58:[function(require,module,exports){
var PlayingAudio = function(source, gain) {
  this._gain = gain;
  this._source = source;
};

PlayingAudio.prototype.setVolume = function(volume) {
  this._gain.gain.value = volume;
};

PlayingAudio.prototype.stop = function() {
  this._source.stop(0);
};

PlayingAudio.prototype.loop = function() {
  this._source.loop = true;
};

module.exports = PlayingAudio;

},{}],59:[function(require,module,exports){
module.exports = require('./src/debugger.js');

},{"./src/debugger.js":60}],60:[function(require,module,exports){
var util = require('util');
var DirtyManager = require('./dirty-manager');

var ObjectPool = [];

var GetObjectFromPool = function() {
  var result = ObjectPool.pop();

  if (result) {
    return result;
  }

  return {};
};

var indexToNumberAndLowerCaseKey = function(index) {
  if (index <= 9) {
    return 48 + index;
  } else if (index === 10) {
    return 48;
  } else if (index > 10 && index <= 36) {
    return 64 + (index-10);
  } else {
    return null;
  }
};

var defaults = [
  { name: 'Show FPS', entry: 'showFps', defaults: true },
  { name: 'Show Key Codes', entry: 'showKeyCodes', defaults: true },
  { name: 'Show Monitor Values', entry: 'showMonitorValues', defaults: true }
];

var Debugger = function(app) {
  this.video = app.video.createLayer({
    allowHiDPI: true,
    getCanvasContext: true
  });

  this.graph = app.video.createLayer({
    allowHiDPI: false,
    getCanvasContext: true
  });

  this._graphHeight = 100;
  this._60fpsMark = this._graphHeight * 0.8;
  this._msToPx = this._60fpsMark/16.66;

  this.app = app;

  this.options = defaults;
  this._maxLogsCounts = 10;

  for (var i=0; i<this.options.length; i++) {
    var option = this.options[i];
    this._initOption(option);
  }

  this.disabled = false;

  this.fps = 0;
  this.fpsCount = 0;
  this.fpsElapsedTime = 0;
  this.fpsUpdateInterval = 0.5;
  this._framePerf = [];

  this._fontSize = 0;
  this._dirtyManager = new DirtyManager(this.video.canvas, this.video.ctx);

  this.logs = [];

  this._perfValues = {};
  this._perfNames = [];

  this.showDebug = false;
  this.enableDebugKeys = true;
  this.enableShortcuts = false;

  this.enableShortcutsKey = 220;

  this.lastKey = '';

  this._monitor = {};

  this._load();

  this.keyShortcuts = [
    { key: 123, entry: 'showDebug', type: 'toggle' }
  ];

  var self = this;
  this.addConfig({ name: 'Show Performance Graph', entry: 'showGraph', defaults: false, call: function() { self.graph.clear(); } });

  this._diff = 0;
  this._frameStart = 0;
};

Debugger.prototype.begin = function() {
  if (this.showDebug) {
    this._frameStart = window.performance.now();
  }
};

Debugger.prototype.end = function() {
  if (this.showDebug) {
    this._diff = window.performance.now() - this._frameStart;
  }
};

Debugger.prototype._setFont = function(px, font) {
  this._fontSize = px;
  this.video.ctx.font = px + 'px ' + font;
};

Debugger.prototype.addConfig = function(option) {
  this.options.push(option);
  this._initOption(option);
};

Debugger.prototype._initOption = function(option) {
  option.type = option.type || 'toggle';
  option.defaults = option.defaults == null ? false : option.defaults;

  if (option.type === 'toggle') {
    this[option.entry] = option.defaults;
  }
};

Debugger.prototype.clear = function() {
  this.logs.length = 0;
};

Debugger.prototype.log = function(message, color) {
  color = color || 'white';
  message = typeof message === 'string' ? message : util.inspect(message);

  var messages = message.replace(/\\'/g, "'").split('\n');

  for (var i=0; i<messages.length; i++) {
    var msg = messages[i];
    if (this.logs.length >= this._maxLogsCounts) {
      ObjectPool.push(this.logs.shift());
    }

    var messageObject = GetObjectFromPool();
    messageObject.text = msg;
    messageObject.life = 10;
    messageObject.color = color;

    this.logs.push(messageObject);
  }
};

Debugger.prototype.update = function() {};

Debugger.prototype.exitUpdate = function(time) {
  if (this.disabled) { return; }

  if (this.showDebug) {
    this._maxLogsCounts = Math.ceil((this.app.height + 20)/20);
    this.fpsCount += 1;
    this.fpsElapsedTime += time;

    if (this.fpsElapsedTime > this.fpsUpdateInterval) {
      var fps = this.fpsCount/this.fpsElapsedTime;

      if (this.showFps) {
        this.fps = this.fps * (1-0.8) + 0.8 * fps;
      }

      this.fpsCount = 0;
      this.fpsElapsedTime = 0;
    }

    for (var i=0, len=this.logs.length; i<len; i++) {
      var log = this.logs[i];
      if (log) {
        log.life -= time;
        if (log.life <= 0) {
          var index = this.logs.indexOf(log);
          if (index > -1) { this.logs.splice(index, 1); }
        }
      }
    }

    for (var i=0; i<this._perfNames.length; i++) {
      var name = this._perfNames[i];
      var value = this._perfValues[name];
      this.monitor(name, value.value.toFixed(3) + ' sec');
    }
  }
};

Debugger.prototype.keydown = function(value) {
  if (this.disabled) { return; }

  this.lastKey = value.key;

  var i;

  if (this.enableDebugKeys) {
    if (value.key === this.enableShortcutsKey) {
      value.event.preventDefault();

      this.enableShortcuts = !this.enableShortcuts;
      return true;
    }

    if (this.enableShortcuts) {
      for (i=0; i<this.options.length; i++) {
        var option = this.options[i];
        var keyIndex = i + 1;

        if (this.app.input.isKeyDown('ctrl')) {
          keyIndex -= 36;
        }

        var charId = indexToNumberAndLowerCaseKey(keyIndex);

        if (charId && value.key === charId) {
          value.event.preventDefault();

          if (option.type === 'toggle') {

            this[option.entry] = !this[option.entry];
            if (option.call) {
              option.call();
            }

            this._save();
          } else if (option.type === 'call') {
            option.entry();
          }

          return true;
        }
      }
    }
  }

  for (i=0; i<this.keyShortcuts.length; i++) {
    var keyShortcut = this.keyShortcuts[i];
    if (keyShortcut.key === value.key) {
      value.event.preventDefault();

      if (keyShortcut.type === 'toggle') {
        this[keyShortcut.entry] = !this[keyShortcut.entry];
        this._save();
      } else if (keyShortcut.type === 'call') {
        this[keyShortcut.entry]();
      }

      return true;
    }
  }

  return false;
};

Debugger.prototype._save = function() {
  var data = {
    showDebug: this.showDebug,
    options: {}
  };

  for (var i=0; i<this.options.length; i++) {
    var option = this.options[i];
    var value = this[option.entry];
    data.options[option.entry] = value;
  }

  window.localStorage.__potionDebug = JSON.stringify(data);
};

Debugger.prototype._load = function() {
  if (window.localStorage && window.localStorage.__potionDebug) {
    var data = JSON.parse(window.localStorage.__potionDebug);
    this.showDebug = data.showDebug;

    for (var name in data.options) {
      this[name] = data.options[name];
    }
  }
};

Debugger.prototype.render = function() {
  if (this.disabled) { return; }

  this._dirtyManager.clear();

  if (this.showDebug) {
    this.video.ctx.save();
    this._setFont(15, 'sans-serif');

    this._renderLogs();
    this._renderData();
    this._renderShortcuts();

    this.video.ctx.restore();

    if (this.showMonitorValues) {
      var i = 0;
      for (var key in this._monitor) {
        var value = this._monitor[key];
        this._setFont(15, 'sans-serif');

        this.video.ctx.textAlign = 'right';
        this.video.ctx.textBaseline = 'bottom';

        this._renderText(key, this.app.width - 14, (this.app.height - 28 - 5) - 40 * i, '#e9dc7c');
        value = typeof value === 'string' ? value : util.inspect(value);
        this._renderText(value, this.app.width - 14, (this.app.height - 14) - 40 * i);

        i += 1;
      }
    }

    if (this.showGraph) {
      this.graph.ctx.drawImage(this.graph.canvas, 0, this.app.height - this._graphHeight, this.app.width, this._graphHeight, -2, this.app.height - this._graphHeight, this.app.width, this._graphHeight);

      this.graph.ctx.fillStyle = '#F2F0D8';
      this.graph.ctx.fillRect(this.app.width - 2, this.app.height - this._graphHeight, 2, this._graphHeight);

      this.graph.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      this.graph.ctx.fillRect(this.app.width - 2, this.app.height - this._60fpsMark, 2, 1);

      var last = 0;
      for (var i=0; i<this._framePerf.length; i++) {
        var item = this._framePerf[i];
        var name = this._perfNames[i];

        this._drawFrameLine(item, name, last);

        last += item;
      }

      this._drawFrameLine(this._diff - last, 'lag', last);
      this._framePerf.length = 0;
    }
  }
};

Debugger.prototype._drawFrameLine = function(value, name, last) {
  var background = 'black';
  if (name === 'update') {
    background = '#6BA5F2';
  } else if (name === 'render') {
    background = '#F27830';
  } else if (name === 'lag') {
    background = '#91f682';
  }
  this.graph.ctx.fillStyle = background;

  var height = (value + last) * this._msToPx;

  var x = this.app.width - 2;
  var y = this.app.height - height;

  this.graph.ctx.fillRect(x, y, 2, height - (last * this._msToPx));
};

Debugger.prototype._renderLogs = function() {
  this.video.ctx.textAlign = 'left';
  this.video.ctx.textBaseline = 'bottom';

  for (var i=0, len=this.logs.length; i<len; i++) {
    var log = this.logs[i];

    var y = -10 + this.app.height + (i - this.logs.length + 1) * 20;
    this._renderText(log.text, 10, y, log.color);
  }
};

Debugger.prototype.disable = function() {
  this.disabled = true;
  this.showDebug = false;
};

Debugger.prototype.monitor = function(name, value) {
  this._monitor[name] = value;
};

Debugger.prototype.perf = function(name) {
  if (!this.showDebug) { return; }

  var exists = this._perfValues[name];

  if (exists == null) {
    this._perfNames.push(name);

    this._perfValues[name] = {
      name: name,
      value: 0,
      records: []
    };
  }

  var time = window.performance.now();

  var record = this._perfValues[name];

  record.value = time;
};

Debugger.prototype.stopPerf = function(name) {
  if (!this.showDebug) { return; }

  var record = this._perfValues[name];

  var time = window.performance.now();
  var diff = time - record.value;

  record.records.push(diff);
  if (record.records.length > 10) {
    record.records.shift();
  }

  var sum = 0;
  for (var i=0; i<record.records.length; i++) {
    sum += record.records[i];
  }

  var avg = sum/record.records.length;

  record.value = avg;
  this._framePerf.push(diff);
};

Debugger.prototype._renderData = function() {
  this.video.ctx.textAlign = 'right';
  this.video.ctx.textBaseline = 'top';

  var x = this.app.width - 14;
  var y = 14;

  if (this.showFps) {
    this._renderText(Math.round(this.fps) + ' fps', x, y);
  }

  y += 24;

  this._setFont(15, 'sans-serif');

  if (this.showKeyCodes) {
    var buttonName = '';
    if (this.app.input.mouse.isLeftDown) {
      buttonName = 'left';
    } else if (this.app.input.mouse.isRightDown) {
      buttonName = 'right';
    } else if (this.app.input.mouse.isMiddleDown) {
      buttonName = 'middle';
    }

    this._renderText('key ' + this.lastKey, x, y, this.app.input.isKeyDown(this.lastKey) ? '#e9dc7c' : 'white');
    this._renderText('btn ' + buttonName, x - 60, y, this.app.input.mouse.isDown ? '#e9dc7c' : 'white');
  }
};


Debugger.prototype._renderShortcuts = function() {
  if (this.enableShortcuts) {
    var height = 28;

    this._setFont(20, 'Helvetica Neue, sans-serif');
    this.video.ctx.textAlign = 'left';
    this.video.ctx.textBaseline = 'top';
    var maxPerCollumn = Math.floor((this.app.height - 14)/height);

    for (var i=0; i<this.options.length; i++) {
      var option = this.options[i];
      var x = 14 + Math.floor(i/maxPerCollumn) * 320;
      var y = 14 + i%maxPerCollumn * height;

      var keyIndex = i + 1;
      var charId = indexToNumberAndLowerCaseKey(keyIndex);

      var isOn = this[option.entry];

      var shortcut = String.fromCharCode(charId);

      if (!charId) {
        shortcut = '^+' + String.fromCharCode(indexToNumberAndLowerCaseKey(keyIndex - 36));
      }

      var text = '[' + shortcut + '] ' + option.name;
      if (option.type === 'toggle') {
        text += ' (' + (isOn ? 'ON' : 'OFF') + ')';
      } else if (option.type === 'call') {
        text += ' (CALL)';
      }

      var color = 'rgba(255, 255, 255, 1)';
      var outline = 'rgba(0, 0, 0, 1)';

      if (!isOn) {
        color = 'rgba(255, 255, 255, .7)';
        outline = 'rgba(0, 0, 0, .7)';
      }

      this._renderText(text, x, y, color, outline);
    }
  }
};

Debugger.prototype._renderText = function(text, x, y, color, outline) {
  color = color || 'white';
  outline = outline || 'black';
  this.video.ctx.fillStyle = color;
  this.video.ctx.lineJoin = 'round';
  this.video.ctx.strokeStyle = outline;
  this.video.ctx.lineWidth = 3;
  this.video.ctx.strokeText(text, x, y);
  this.video.ctx.fillText(text, x, y);

  var width = this.video.ctx.measureText(text).width;

  var dx = x - 5;
  var dy = y;
  var dwidth = width + 10;
  var dheight = this._fontSize + 10;

  if (this.video.ctx.textAlign === 'right') {
    dx = x - 5 - width;
  }

  this._dirtyManager.addRect(dx, dy, dwidth, dheight);
};

module.exports = Debugger;

},{"./dirty-manager":61,"util":5}],61:[function(require,module,exports){
var DirtyManager = function(canvas, ctx) {
  this.ctx = ctx;
  this.canvas = canvas;

  this.top = canvas.height;
  this.left = canvas.width;
  this.bottom = 0;
  this.right = 0;

  this.isDirty = false;
};

DirtyManager.prototype.addRect = function(left, top, width, height) {
  var right  = left + width;
  var bottom = top + height;

  this.top    = top < this.top       ? top    : this.top;
  this.left   = left < this.left     ? left   : this.left;
  this.bottom = bottom > this.bottom ? bottom : this.bottom;
  this.right  = right > this.right   ? right  : this.right;

  this.isDirty = true;
};

DirtyManager.prototype.clear = function() {
  if (!this.isDirty) { return; }

  this.ctx.clearRect(this.left,
                     this.top,
                     this.right - this.left,
                     this.bottom - this.top);

  this.left = this.canvas.width;
  this.top = this.canvas.height;
  this.right = 0;
  this.bottom = 0;

  this.isDirty = false;
};

module.exports = DirtyManager;

},{}],62:[function(require,module,exports){
var Video = require('./video');
var Assets = require('./assets');

var Debugger = require('potion-debugger');

var PotionAudio = require('potion-audio');

var App = function(container) {
  this.container = container;

  container.style.position = 'relative';

  var canvas = document.createElement('canvas');
  canvas.style.display = 'block';
  container.appendChild(canvas);

  this.canvas = canvas;

  this.width = 300;

  this.height = 300;

  this.audio = new PotionAudio();

  this.assets = new Assets(this);

  this.states = null;

  this.input = null;

  this.config = {
    allowHiDPI: true,
    getCanvasContext: true,
    addInputEvents: true,
    showPreloader: true,
    fixedStep: false,
    stepTime: 1/60,
    maxStepTime: 1/60
  };

  this.video = new Video(this, canvas, this.config);
  this.video._isRoot = true;

  this.debug = new Debugger(this);
};

App.prototype.resize = function(width, height) {
  this.width = width;
  this.height = height;

  this.container.style.width = this.width + 'px';
  this.container.style.height = this.height + 'px';

  if (this.video) {
    this.video._resize(width, height);
  }

  if (this.states) {
    this.states.resize();
  }
};

module.exports = App;

},{"./assets":63,"./video":76,"potion-audio":55,"potion-debugger":59}],63:[function(require,module,exports){
var util = require('util');
var path = require('path');

var JsonLoader = require('./loader/json-loader');
var imageLoader = require('./loader/image-loader');
var textLoader = require('./loader/text-loader');

var Assets = function(app) {
  this.isLoading = false;

  this.itemsCount = 0;
  this.progress = 0;

  this._thingsToLoad = 0;
  this._data = {};
  this._preloading = true;

  this._callback = null;

  this._toLoad = [];

  this._loaders = {};

  this.addLoader('json', JsonLoader);

  var audioLoader = require('./loader/audio-loader')(app.audio);

  this.addLoader('mp3', audioLoader);
  this.addLoader('music', audioLoader);
  this.addLoader('sound', audioLoader);

  this.addLoader('image', imageLoader);
  this.addLoader('texture', imageLoader);
  this.addLoader('sprite', imageLoader);
};

Assets.prototype.addLoader = function(name, fn) {
  this._loaders[name] = fn;
};

Assets.prototype.start = function(callback) {
  this._callback = callback;

  this._toLoad.forEach(function(current) {
    this._loadAssetFile(current, function(name, data) {
      this.set(name, data);
      if (current.callback) { current.callback(data); }

      this._finishedQueuedFile();
    }.bind(this));
  }.bind(this));

  this._thingsToLoad = this.itemsCount;

  if (this._thingsToLoad === 0) {
    this._done();
  }
};

Assets.prototype.get = function(name) {
  return this._data[path.normalize(name)];
};

Assets.prototype.set = function(name, value) {
  this._data[path.normalize(name)] = value;
};

Assets.prototype.remove = function(name) {
  this.set(name, null);
};

Assets.prototype.load = function(type, url, callback) {
  var loadObject = {
    type: type,
    url: (url != null ? path.normalize(url) : null),
    callback: callback,
    progress: 0
  };

  if (this._preloading) {
    this._queueFile(loadObject);
  } else {
    this._loadAssetFile(loadObject, function(name, data) {
      this.set(name, data);
      if (callback) { callback(data); }
    }.bind(this));
  }
};

Assets.prototype._queueFile = function(loadObject) {
  this.isLoading = true;
  this.itemsCount += 1;

  this._toLoad.push(loadObject);
};

Assets.prototype._finishedQueuedFile = function() {
  this._thingsToLoad -= 1;

  if (this._thingsToLoad === 0) {
    this._done();
  }
};

Assets.prototype._updateProgress = function() {
  var sum = 0;

  for (var i=0; i<this._toLoad.length; i++) {
    sum += this._toLoad[i].progress;
  }

  this.progress = sum/this._toLoad.length;
};

Assets.prototype._error = function(url) {
  console.warn('Error loading "' + url + '" asset');
};

Assets.prototype._handleCustomLoading = function(loading, loader) {
  loading(function(name, value) {
    loader.done(value, name);
  });
};

Assets.prototype._loadAssetFile = function(file, callback) {
  var type = file.type;
  var url = file.url;

  var manager = {
    done: function(data, name) {
      name = name == null ? file.url : name;

      file.progress = 1;
      callback(name, data);
      this._updateProgress();
    }.bind(this),

    error: function() {
      this._error.bind(this);
    }.bind(this),

    progress: function(percent) {
      file.progress = percent;
      this._updateProgress();
    }.bind(this)
  };

  if (util.isFunction(type)) {
    this._handleCustomLoading(type, manager);
  } else {
    type = type.toLowerCase();
    var loader = this._loaders[type] || textLoader;
    loader(url, manager);
  }
};

Assets.prototype._done = function() {
  this.isLoading = false;
  this._preloading = false;
  setTimeout(this._callback, 0);
};


module.exports = Assets;

},{"./loader/audio-loader":67,"./loader/image-loader":68,"./loader/json-loader":69,"./loader/text-loader":70,"path":2,"util":5}],64:[function(require,module,exports){
require('./raf-polyfill')();

var App = require('./app');

var Time = require('./time');

var StateManager = require('./state-manager');

var Input = require('./input');
var Loading = require('./loading');

var Engine = function(container, methods) {
  this.container = container;

  this.controller = new App(container);

  this.app = methods;
  this.controller.main = this.app;
  this.app.app = this.controller;

  this.tickFunc = (function (self) { return function() { self.tick(); }; })(this);
  this.preloaderTickFunc = (function (self) { return function() { self._preloaderTick(); }; })(this);

  this.strayTime = 0;
  this._time = 0;

  setTimeout(function() {
    this.configureApp();
  }.bind(this), 0);
};

Engine.prototype.configureApp = function() {
  if (this.app.configure) {
    this.app.configure();
  }

  this.controller.video.init();

  if (this.controller.config.addInputEvents) {
    this.controller.input = new Input(this.controller);
  }

  this.controller.resize(this.controller.width, this.controller.height);

  this._setDefaultStates();

  this._time = Time.now();

  this._preloaderVideo = this.controller.video.createLayer({
    allowHiDPI: true,
    getCanvasContext: true
  });

  this._preloader = new Loading(this.controller);

  this.controller.assets.start(function() {
    window.cancelAnimationFrame(this.preloaderId);
    this._preloaderVideo.destroy();

    this.start();
  }.bind(this));

  if (this.controller.assets.isLoading && this.controller.config.showPreloader) {
    this.preloaderId = window.requestAnimationFrame(this.preloaderTickFunc);
  }
};

Engine.prototype.addEvents = function() {
  var self = this;

  window.addEventListener('blur', function() {
    self.controller.input.resetKeys();

    if (self.app.blur) {
      self.app.blur();
    }
  });

  window.addEventListener('focus', function() {
    self.controller.input.resetKeys();

    if (self.app.focus) {
      self.app.focus();
    }
  });
};

Engine.prototype.start = function() {
  if (this.controller.config.addInputEvents) {
    this.addEvents();
  }

  window.requestAnimationFrame(this.tickFunc);
};

Engine.prototype.tick = function() {
  window.requestAnimationFrame(this.tickFunc);

  this.controller.debug.begin();

  var now = Time.now();
  var time = (now - this._time) / 1000;
  this._time = now;

  this.controller.debug.perf('update');
  this.update(time);
  this.controller.debug.stopPerf('update');

  this.controller.states.exitUpdate(time);

  this.controller.debug.perf('render');
  this.render();
  this.controller.debug.stopPerf('render');

  this.controller.debug.render();

  this.controller.debug.end();
};

Engine.prototype.update = function(time) {
  if (time > this.controller.config.maxStepTime) { time = this.controller.config.maxStepTime; }

  if (this.controller.config.fixedStep) {
    this.strayTime = this.strayTime + time;
    while (this.strayTime >= this.controller.config.stepTime) {
      this.strayTime = this.strayTime - this.controller.config.stepTime;
      this.controller.states.update(this.controller.config.stepTime);
    }
  } else {
    this.controller.states.update(time);
  }
};

Engine.prototype.render = function() {
  this.controller.video.beginFrame();

  this.controller.video.clear();

  this.controller.states.render();

  this.controller.video.endFrame();
};

Engine.prototype._preloaderTick = function() {
  this.preloaderId = window.requestAnimationFrame(this.preloaderTickFunc);

  var now = Time.now();
  var time = (now - this._time) / 1000;
  this._time = now;

  if (this.app.preloading) {
    this.app.preloading(time, this._preloaderVideo);
  } else {
    this._preloader.render(time, this._preloaderVideo);
  }
};

Engine.prototype._setDefaultStates = function() {
  var states = new StateManager();
  states.add('main', this.app);
  states.add('debug', this.controller.debug);

  states.protect('main');
  states.protect('debug');
  states.hide('debug');

  this.controller.states = states;
};

module.exports = Engine;

},{"./app":62,"./input":65,"./loading":71,"./raf-polyfill":72,"./state-manager":74,"./time":75}],65:[function(require,module,exports){
var keys = require('./keys');

var invKeys = {};
for (var keyName in keys) {
  invKeys[keys[keyName]] = keyName;
}

var Input = function(app) {
  this._container = app.container;
  this._keys = {};

  this.canControlKeys = true;

  this.mouse = {
    isDown: false,
    isLeftDown: false,
    isMiddleDown: false,
    isRightDown: false,
    x: null,
    y: null,
    dx: 0,
    dy: 0
  };

  this._addEvents(app);
};

Input.prototype.resetKeys = function() {
  this._keys = {};
};

Input.prototype.isKeyDown = function(key) {
  if (key == null) { return false; }

  if (this.canControlKeys) {
    var code = typeof key === 'number' ? key : keys[key.toLowerCase()];
    return this._keys[code];
  }
};

Input.prototype._addEvents = function(app) {
  var self = this;

  var mouseEvent = {
    x: null,
    y: null,
    button: null,
    isTouch: false,
    event: null,
    stateStopEvent: function() {
      app.states._preventEvent = true;
    }
  };

  var keyboardEvent = {
    key: null,
    name: null,
    event: null,
    stateStopEvent: function() {
      app.states._preventEvent = true;
    }
  };

  self._container.addEventListener('mousemove', function(e) {
    var x = e.offsetX === undefined ? e.layerX - self._container.offsetLeft : e.offsetX;
    var y = e.offsetY === undefined ? e.layerY - self._container.offsetTop : e.offsetY;

    if (self.mouse.x != null && self.mouse.x != null) {
      self.mouse.dx = x - self.mouse.x;
      self.mouse.dy = y - self.mouse.y;
    }

    self.mouse.x = x;
    self.mouse.y = y;
    self.mouse.isActive = true;

    mouseEvent.x = x;
    mouseEvent.y = y;
    mouseEvent.button = null;
    mouseEvent.event = e;
    mouseEvent.isTouch = false;

    app.states.mousemove(mouseEvent);
  });

  self._container.addEventListener('mouseup', function(e) {
    e.preventDefault();

    var x = e.offsetX === undefined ? e.layerX - self._container.offsetLeft : e.offsetX;
    var y = e.offsetY === undefined ? e.layerY - self._container.offsetTop : e.offsetY;

    switch (e.button) {
      case 0:
        self.mouse.isLeftDown = false;
      break;
      case 1:
        self.mouse.isMiddleDown = false;
        break;
      case 2:
        self.mouse.isRightDown = false;
        break;
    }

    self.mouse.isDown = self.mouse.isLeftDown || self.mouse.isRightDown || self.mouse.isMiddleDown;

    mouseEvent.x = x;
    mouseEvent.y = y;
    mouseEvent.button = e.button;
    mouseEvent.event = e;
    mouseEvent.isTouch = false;

    app.states.mouseup(mouseEvent);
  }, false);

  self._container.addEventListener('mouseleave', function() {
    self.mouse.isActive = false;

    self.mouse.isDown = false;
    self.mouse.isLeftDown = false;
    self.mouse.isRightDown = false;
    self.mouse.isMiddleDown = false;
  });

  self._container.addEventListener('mouseenter', function() {
    self.mouse.isActive = true;
  });

  self._container.addEventListener('mousedown', function(e) {
    e.preventDefault();

    var x = e.offsetX === undefined ? e.layerX - self._container.offsetLeft : e.offsetX;
    var y = e.offsetY === undefined ? e.layerY - self._container.offsetTop : e.offsetY;

    self.mouse.x = x;
    self.mouse.y = y;
    self.mouse.isDown = true;
    self.mouse.isActive = true;

    switch (e.button) {
      case 0:
        self.mouse.isLeftDown = true;
      break;
      case 1:
        self.mouse.isMiddleDown = true;
        break;
      case 2:
        self.mouse.isRightDown = true;
        break;
    }

    mouseEvent.x = x;
    mouseEvent.y = y;
    mouseEvent.button = e.button;
    mouseEvent.event = e;
    mouseEvent.isTouch = false;

    app.states.mousedown(mouseEvent);
  }, false);

  self._container.addEventListener('touchstart', function(e) {
    e.preventDefault();

    for (var i=0; i<e.touches.length; i++) {
      var touch = e.touches[i];

      var x = touch.pageX - self._container.offsetLeft;
      var y = touch.pageY - self._container.offsetTop;

      self.mouse.x = x;
      self.mouse.y = y;
      self.mouse.isDown = true;
      self.mouse.isLeftDown = true;
      self.mouse.isActive = true;

      mouseEvent.x = x;
      mouseEvent.y = y;
      mouseEvent.button = 1;
      mouseEvent.event = e;
      mouseEvent.isTouch = true;

      app.states.mousedown(mouseEvent);
    }
  });

  self._container.addEventListener('touchmove', function(e) {
    e.preventDefault();

    for (var i=0; i<e.touches.length; i++) {
      var touch = e.touches[i];

      var x = touch.pageX - self._container.offsetLeft;
      var y = touch.pageY - self._container.offsetTop;

      if (self.mouse.x != null && self.mouse.x != null) {
        self.mouse.dx = x - self.mouse.x;
        self.mouse.dy = y - self.mouse.y;
      }

      self.mouse.x = x;
      self.mouse.y = y;
      self.mouse.isDown = true;
      self.mouse.isLeftDown = true;
      self.mouse.isActive = true;

      mouseEvent.x = x;
      mouseEvent.y = y;
      mouseEvent.event = e;
      mouseEvent.isTouch = true;

      app.states.mousemove(mouseEvent);
    }
  });

  self._container.addEventListener('touchend', function(e) {
    e.preventDefault();

    var touch = e.changedTouches[0];

    var x = touch.pageX - self._container.offsetLeft;
    var y = touch.pageY - self._container.offsetTop;

    self.mouse.x = x;
    self.mouse.y = y;
    self.mouse.isActive = false;
    self.mouse.isDown = false;
    self.mouse.isLeftDown = false;
    self.mouse.isRightDown = false;
    self.mouse.isMiddleDown = false;

    mouseEvent.x = x;
    mouseEvent.y = y;
    mouseEvent.event = e;
    mouseEvent.isTouch = true;

    app.states.mouseup(mouseEvent);
  });

  self._container.addEventListener('contextmenu', function(e) {
    e.preventDefault();
  });

  document.addEventListener('keydown', function(e) {
    self._keys[e.keyCode] = true;

    keyboardEvent.key = e.which;
    keyboardEvent.name = invKeys[e.which];
    keyboardEvent.event = e;

    app.states.keydown(keyboardEvent);
  });

  document.addEventListener('keyup', function(e) {
    self._keys[e.keyCode] = false;

    keyboardEvent.key = e.which;
    keyboardEvent.name = invKeys[e.which];
    keyboardEvent.event = e;

    app.states.keyup(keyboardEvent);
  });
};

module.exports = Input;

},{"./keys":66}],66:[function(require,module,exports){
module.exports = {
  'backspace': 8,
  'tab': 9,
  'enter': 13,
  'pause': 19,
  'caps': 20,
  'esc': 27,
  'space': 32,
  'page_up': 33,
  'page_down': 34,
  'end': 35,
  'home': 36,
  'left': 37,
  'up': 38,
  'right': 39,
  'down': 40,
  'insert': 45,
  'delete': 46,
  '0': 48,
  '1': 49,
  '2': 50,
  '3': 51,
  '4': 52,
  '5': 53,
  '6': 54,
  '7': 55,
  '8': 56,
  '9': 57,
  'a': 65,
  'b': 66,
  'c': 67,
  'd': 68,
  'e': 69,
  'f': 70,
  'g': 71,
  'h': 72,
  'i': 73,
  'j': 74,
  'k': 75,
  'l': 76,
  'm': 77,
  'n': 78,
  'o': 79,
  'p': 80,
  'q': 81,
  'r': 82,
  's': 83,
  't': 84,
  'u': 85,
  'v': 86,
  'w': 87,
  'x': 88,
  'y': 89,
  'z': 90,
  'numpad_0': 96,
  'numpad_1': 97,
  'numpad_2': 98,
  'numpad_3': 99,
  'numpad_4': 100,
  'numpad_5': 101,
  'numpad_6': 102,
  'numpad_7': 103,
  'numpad_8': 104,
  'numpad_9': 105,
  'multiply': 106,
  'add': 107,
  'substract': 109,
  'decimal': 110,
  'divide': 111,
  'f1': 112,
  'f2': 113,
  'f3': 114,
  'f4': 115,
  'f5': 116,
  'f6': 117,
  'f7': 118,
  'f8': 119,
  'f9': 120,
  'f10': 121,
  'f11': 122,
  'f12': 123,
  'shift': 16,
  'ctrl': 17,
  'alt': 18,
  'plus': 187,
  'comma': 188,
  'minus': 189,
  'period': 190
};

},{}],67:[function(require,module,exports){
module.exports = function(manager) {
  return function(url, loader) {
    manager.load(url, {
      done: function(data) {
        loader.done(data);
      },

      progress: function(e) {
        var percent = e.loaded / e.total;
        loader.progress(percent);
      }
    });
  };
};

},{}],68:[function(require,module,exports){
module.exports = function(url, loader) {
  var URL = window.URL || window.webkitURL;

  if (URL && "createObjectURL" in URL && "Uint8Array" in window && "Blob" in window) {
    var request = new XMLHttpRequest();

    request.open('GET', url, true);
    request.responseType = 'arraybuffer';

    request.addEventListener('progress', function(e) {
      var percent = e.loaded / e.total;
      loader.progress(percent);
    });

    request.onload = function() {
      if (request.status !== 200) {
        return loader.error(url);
      }

      var data = this.response;
      var blob = new Blob([new Uint8Array(data)], { type: 'image/png' });
      var image = new Image();
      image.src = URL.createObjectURL(blob);
      loader.done(image);
    };
    request.send();

    return;
  }

  var image = new Image();
  image.onload = function() {
    loader.done(image);
  };
  image.onerror = function() {
    loader.error(url);
  };
  image.src = url;
};

},{}],69:[function(require,module,exports){
module.exports = function(url, loader) {
  var request = new XMLHttpRequest();

  request.open('GET', url, true);
  request.responseType = 'text';

  request.addEventListener('progress', function(e) {
    var percent = e.loaded / e.total;
    loader.progress(percent);
  });

  request.onload = function() {
    if (request.status !== 200) {
      return loader.error(url);
    }

    var data = JSON.parse(this.response);
    loader.done(data);
  };
  request.send();
};

},{}],70:[function(require,module,exports){
module.exports = function(url, loader) {
  var request = new XMLHttpRequest();

  request.open('GET', url, true);
  request.responseType = 'text';

  request.addEventListener('progress', function(e) {
    var percent = e.loaded / e.total;
    loader.progress(percent);
  });

  request.onload = function() {
    if (request.status !== 200) {
      return loader.error(url);
    }

    var data = this.response;
    loader.done(data);
  };
  request.send();
};

},{}],71:[function(require,module,exports){
var Loading = function(app) {
  this.app = app;

  this.barWidth = 0;
};

Loading.prototype.render = function(time, video) {
  video.clear();

  var color1 = '#b9ff71';
  var color2 = '#8ac250';
  var color3 = '#648e38';

  var width = Math.min(video.width * 2/3, 300);
  var height = 20;

  var y = (video.height - height) / 2;
  var x = (video.width - width) / 2;

  var currentWidth = width * this.app.assets.progress;
  this.barWidth = this.barWidth + (currentWidth - this.barWidth) * time * 10;

  video.ctx.fillStyle = color2;
  video.ctx.fillRect(0, 0, video.width, video.height);

  video.ctx.font = '400 40px sans-serif';
  video.ctx.textAlign = 'center';
  video.ctx.textBaseline = 'bottom';

  video.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
  video.ctx.fillText("Potion.js", video.width/2, y + 2);

  video.ctx.fillStyle = '#d1ffa1';
  video.ctx.fillText("Potion.js", video.width/2, y);

  video.ctx.strokeStyle = video.ctx.fillStyle = color3;
  video.ctx.fillRect(x, y + 15, width, height);

  video.ctx.lineWidth = 2;
  video.ctx.beginPath();
  video.ctx.rect(x - 5, y + 10, width + 10, height + 10);
  video.ctx.closePath();
  video.ctx.stroke();

  video.ctx.strokeStyle = video.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
  video.ctx.fillRect(x, y + 15, this.barWidth, height + 2);

  video.ctx.lineWidth = 2;
  video.ctx.beginPath();

  video.ctx.moveTo(x + this.barWidth, y + 12);
  video.ctx.lineTo(x - 5, y + 12);
  video.ctx.lineTo(x - 5, y + 10 + height + 12);
  video.ctx.lineTo(x + this.barWidth, y + 10 + height + 12);

  video.ctx.stroke();
  video.ctx.closePath();

  video.ctx.strokeStyle = video.ctx.fillStyle = color1;
  video.ctx.fillRect(x, y + 15, this.barWidth, height);

  video.ctx.lineWidth = 2;
  video.ctx.beginPath();

  video.ctx.moveTo(x + this.barWidth, y + 10);
  video.ctx.lineTo(x - 5, y + 10);
  video.ctx.lineTo(x - 5, y + 10 + height + 10);
  video.ctx.lineTo(x + this.barWidth, y + 10 + height + 10);

  video.ctx.stroke();
  video.ctx.closePath();
};

module.exports = Loading;

},{}],72:[function(require,module,exports){
module.exports = function() {
  var lastTime = 0;
  var vendors = ['ms', 'moz', 'webkit', 'o'];

  for (var i=0; i<vendors.length && !window.requestAnimationFrame; ++i) {
    window.requestAnimationFrame = window[vendors[i]+'RequestAnimationFrame'];
    window.cancelAnimationFrame = window[vendors[i]+'CancelAnimationFrame'] || window[vendors[i]+'CancelRequestAnimationFrame'];
  }

  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function(callback) {
      var currTime = new Date().getTime();
      var timeToCall = Math.max(0, 16 - (currTime - lastTime));

      var id = window.setTimeout(function() {
        callback(currTime + timeToCall);
      }, timeToCall);

      lastTime = currTime + timeToCall;
      return id;
    };
  }

  if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = function(id) { clearTimeout(id); };
  }
};

},{}],73:[function(require,module,exports){
var isRetina = function() {
  var mediaQuery = "(-webkit-min-device-pixel-ratio: 1.5),\
  (min--moz-device-pixel-ratio: 1.5),\
  (-o-min-device-pixel-ratio: 3/2),\
  (min-resolution: 1.5dppx)";

  if (window.devicePixelRatio > 1)
    return true;

  if (window.matchMedia && window.matchMedia(mediaQuery).matches)
    return true;

  return false;
};

module.exports = isRetina;

},{}],74:[function(require,module,exports){
var renderOrderSort = function(a, b) {
  return a.renderOrder < b.renderOrder;
};

var updateOrderSort = function(a, b) {
  return a.updateOrder < b.updateOrder;
};

var StateManager = function() {
  this.states = {};
  this.renderOrder = [];
  this.updateOrder = [];

  this._preventEvent = false;
};

StateManager.prototype.add = function(name, state) {
  this.states[name] = this._newStateHolder(name, state);
  this.refreshOrder();
  return state;
};

StateManager.prototype.enable = function(name) {
  var holder = this.getHolder(name);
  if (holder) {
    if (!holder.enabled) {
      if (holder.state.enable) {
        holder.state.enable();
      }
      holder.enabled = true;
      holder.changed = true;

      if (holder.paused) {
        this.unpause(name);
      }
    }
  }
};

StateManager.prototype.disable = function(name) {
  var holder = this.getHolder(name);
  if (holder) {
    if (holder.enabled) {
      if (holder.state.disable) {
        holder.state.disable();
      }
      holder.changed = true;
      holder.enabled = false;
    }
  }
};

StateManager.prototype.hide = function(name) {
  var holder = this.getHolder(name);
  if (holder) {
    if (holder.enabled) {
      holder.changed = true;
      holder.render = false;
    }
  }
};

StateManager.prototype.show = function(name) {
  var holder = this.getHolder(name);
  if (holder) {
    if (holder.enabled) {
      holder.changed = true;
      holder.render = true;
    }
  }
};

StateManager.prototype.pause = function(name) {
  var holder = this.getHolder(name);
  if (holder) {
    if (holder.state.pause) {
      holder.state.pause();
    }

    holder.changed = true;
    holder.paused = true;
  }
};

StateManager.prototype.unpause = function(name) {
  var holder = this.getHolder(name);
  if (holder) {
    if (holder.state.unpause) {
      holder.state.unpause();
    }

    holder.changed = true;
    holder.paused = false;
  }
};

StateManager.prototype.protect = function(name) {
  var holder = this.getHolder(name);
  if (holder) {
    holder.protect = true;
  }
};

StateManager.prototype.unprotect = function(name) {
  var holder = this.getHolder(name);
  if (holder) {
    holder.protect = false;
  }
};

StateManager.prototype.refreshOrder = function() {
  this.renderOrder.length = 0;
  this.updateOrder.length = 0;

  for (var name in this.states) {
    var holder = this.states[name];
    if (holder) {
      this.renderOrder.push(holder);
      this.updateOrder.push(holder);
    }
  }

  this.renderOrder.sort(renderOrderSort);
  this.updateOrder.sort(updateOrderSort);
};

StateManager.prototype._newStateHolder = function(name, state) {
  var holder = {};
  holder.name = name;
  holder.state = state;

  holder.protect = false;

  holder.enabled = true;
  holder.paused = false;

  holder.render = true;

  holder.initialized = false;
  holder.updated = false;
  holder.changed = true;

  holder.updateOrder = 0;
  holder.renderOrder = 0;

  return holder;
};

StateManager.prototype.setUpdateOrder = function(name, order) {
  var holder = this.getHolder(name);
  if (holder) {
    holder.updateOrder = order;
    this.refreshOrder();
  }
};

StateManager.prototype.setRenderOrder = function(name, order) {
  var holder = this.getHolder(name);
  if (holder) {
    holder.renderOrder = order;
    this.refreshOrder();
  }
};

StateManager.prototype.destroy = function(name) {
  var state = this.getHolder(name);
  if (state && !state.protect) {
    if (state.state.close) {
      state.state.close();
    }
    delete this.states[name];
    this.refreshOrder();
  }
};

StateManager.prototype.destroyAll = function() {
  for (var i=0, len=this.updateOrder.length; i<len; i++) {
    var state = this.updateOrder[i];
    if (!state.protect) {
      if (state.state.close) {
        state.state.close();
      }
      delete this.states[state.name];
    }
  }

  this.refreshOrder();
};

StateManager.prototype.getHolder = function(name) {
  return this.states[name];
};

StateManager.prototype.get = function(name) {
  return this.states[name].state;
};

StateManager.prototype.update = function(time) {
  for (var i=0, len=this.updateOrder.length; i<len; i++) {
    var state = this.updateOrder[i];

    if (state) {
      state.changed = false;

      if (state.enabled) {
        if (!state.initialized && state.state.init) {
          state.initialized = true;
          state.state.init();
        }

        if (state.state.update && !state.paused) {
          state.state.update(time);
          state.updated = true;
        }
      }
    }
  }
};

StateManager.prototype.exitUpdate = function(time) {
  for (var i=0, len=this.updateOrder.length; i<len; i++) {
    var state = this.updateOrder[i];

    if (state && state.enabled && state.state.exitUpdate && !state.paused) {
      state.state.exitUpdate(time);
    }
  }
};

StateManager.prototype.render = function() {
  for (var i=0, len=this.renderOrder.length; i<len; i++) {
    var state = this.renderOrder[i];
    if (state && state.enabled && (state.updated || !state.state.update) && state.render && state.state.render) {
      state.state.render();
    }
  }
};
StateManager.prototype.mousemove = function(value) {
  this._preventEvent = false;

  for (var i=0, len=this.updateOrder.length; i<len; i++) {
    var state = this.updateOrder[i];
    if (state && state.enabled && !state.changed && state.state.mousemove && !state.paused) {
      state.state.mousemove(value);
    }

    if (this._preventEvent) { break; }
  }
};

StateManager.prototype.mouseup = function(value) {
  this._preventEvent = false;

  for (var i=0, len=this.updateOrder.length; i<len; i++) {
    var state = this.updateOrder[i];
    if (state && state.enabled && !state.changed && state.state.mouseup && !state.paused) {
      state.state.mouseup(value);
    }

    if (this._preventEvent) { break; }
  }
};

StateManager.prototype.mousedown = function(value) {
  this._preventEvent = false;

  for (var i=0, len=this.updateOrder.length; i<len; i++) {
    var state = this.updateOrder[i];
    if (state && state.enabled && !state.changed && state.state.mousedown && !state.paused) {
      state.state.mousedown(value);
    }

    if (this._preventEvent) { break; }
  }
};

StateManager.prototype.keyup = function(value) {
  this._preventEvent = false;

  for (var i=0, len=this.updateOrder.length; i<len; i++) {
    var state = this.updateOrder[i];
    if (state && state.enabled && !state.changed && state.state.keyup && !state.paused) {
      state.state.keyup(value);
    }

    if (this._preventEvent) { break; }
  }
};

StateManager.prototype.keydown = function(value) {
  this._preventEvent = false;

  for (var i=0, len=this.updateOrder.length; i<len; i++) {
    var state = this.updateOrder[i];
    if (state && state.enabled && !state.changed && state.state.keydown && !state.paused) {
      state.state.keydown(value);
    }

    if (this._preventEvent) { break; }
  }
};

StateManager.prototype.resize = function() {
  for (var i=0, len=this.updateOrder.length; i<len; i++) {
    var state = this.updateOrder[i];
    if (state && state.enabled && state.state.resize) {
      state.state.resize();
    }
  }
};

module.exports = StateManager;

},{}],75:[function(require,module,exports){
module.exports = (function() {
  return window.performance || Date;
})();

},{}],76:[function(require,module,exports){
var isRetina = require('./retina')();

var Video = function(app, canvas, config) {
  this.app = app;

  this.config = config;

  this.canvas = canvas;

  this.width = app.width;

  this.height = app.height;

  this._parent = null;
  this._isRoot = false;
  this._children = [];
};

Video.prototype.init = function() {
  if (this.config.getCanvasContext) {
    this.ctx = this.canvas.getContext('2d');
  }

  this._applySizeToCanvas();
};

Video.prototype.include = function(methods) {
  for (var method in methods) {
    this[method] = methods[method];
  }
};

Video.prototype.beginFrame = function() {};

Video.prototype.endFrame = function() {};

Video.prototype.destroy = function() {
  if (!this._isRoot) {
    var index = this._parent._children.indexOf(this);
    if (index !== -1) {
      this._parent._children.splice(index, 1);
    }
  }

  this.canvas.parentElement.removeChild(this.canvas);
};

Video.prototype.scaleCanvas = function(scale) {
  this.canvas.width *= scale;
  this.canvas.height *= scale;

  if (this.ctx) {
    this.ctx.scale(scale, scale);
  }
};

Video.prototype._resize = function(width, height) {
  this.width = width;
  this.height = height;

  this._applySizeToCanvas();

  for (var i=0, len=this._children.length; i<len; i++) {
    var item = this._children[i];
    item._resize(width, height);
  }
};

Video.prototype._applySizeToCanvas = function() {
  this.canvas.width = this.width;
  this.canvas.height = this.height;

  this.canvas.style.width = this.width + 'px';
  this.canvas.style.height = this.height + 'px';

  if (this.config.allowHiDPI && isRetina) {
    this.scaleCanvas(2);
  }
};

Video.prototype.clear = function() {
  if (this.ctx) { this.ctx.clearRect(0, 0, this.width, this.height); }
};

Video.prototype.createLayer = function(config) {
  config = config || {};

  var container = this.app.container;
  var canvas = document.createElement('canvas');
  canvas.width = this.width;
  canvas.height = this.height;
  canvas.style.position = 'absolute';
  canvas.style.top = '0px';
  canvas.style.left = '0px';
  container.appendChild(canvas);

  var video = new Video(this.app, canvas, config);

  video._parent = this;
  video._isRoot = false;

  video.init();

  this._children.push(video);

  return video;
};

module.exports = Video;

},{"./retina":73}],77:[function(require,module,exports){
"use strict";

var random = function (min, max) {
  if (min === undefined) min = 0;
  if (max === undefined) max = 100;
  return Math.floor(Math.random() * (max - min)) + min;
};

exports["default"] = random;

module.exports = exports.default
},{}],78:[function(require,module,exports){
'use strict'

var merge = require('lodash/object/merge')
var contains = require('lodash/collection/contains')
var Dungeon = require('./maps/Dungeon')

var roomOptions = {minRoomSize: 3, maxRoomSize: 10, maxRooms: 10}
var defaults = {mapType: 'dungeon', width: 100, height: 100, roomOptions: roomOptions}
var allowedMapTypes = ['dungeon', 'cave']

/**
 * Class responsible for generating random maps
 *
 * @param {Object} options see defaults
 * @throws {Error} if given an invalid map type
 */
var MapGenerator = function (options) {
  options = merge({}, defaults, options)

  if (contains(allowedMapTypes, options.mapType) === false) {
    throw new Error(options.mapType + ' is not a valid map type')
  }

  this.mapType = options.mapType
  this.width = options.width
  this.height = options.height

  if (options.mapType === 'dungeon') {
    this.roomOptions = options.roomOptions
  }
}

MapGenerator.prototype.getMapType = function () {
  return this.mapType
}

MapGenerator.prototype.getStartPosition = function () {
  return this.startPosition
}

/**
 * Main map generator function
 *
 * @return {Array} two dimentional array representing a map
 * @throws {Error} if no generator function exists for the map type
 */
MapGenerator.prototype.generate = function () {
  switch (this.mapType) {
    case 'dungeon':
      var options = merge({}, this.roomOptions, {width: this.width, height: this.height})
      var dungeon = new Dungeon(options)
      this.generatedMap = dungeon.generateMap()
      this.startPosition = dungeon.getStartPosition()

      return this.generatedMap
    default:
      throw new Error('Unable to generate a "' + this.mapType + '" map')
  }
}

module.exports = MapGenerator

},{"./maps/Dungeon":82,"lodash/collection/contains":7,"lodash/object/merge":50}],79:[function(require,module,exports){
'use strict'

var merge = require('lodash/object/merge')
var defaults = {x: 0, y: 0, width: 1, height: 1}

/**
 * Room class - represents a single room in a map
 *
 * @param {Object} options object of options - see defaults
 */
var Room = function (options) {
  // merge defaults with options, using a new object so options isn't required
  options = merge({}, defaults, options)

  this.x = options.x
  this.y = options.y
  this.width = options.width
  this.height = options.height

  // bottom right x & y coordinates
  this.brX = this.x + this.width
  this.brY = this.y + this.height
}

Room.prototype.getX = function () {
  return this.x
}

Room.prototype.getY = function () {
  return this.y
}

Room.prototype.getBrX = function () {
  return this.brX
}

Room.prototype.getBrY = function () {
  return this.brY
}

Room.prototype.getWidth = function () {
  return this.width
}

Room.prototype.getHeight = function () {
  return this.height
}

/**
 * Gets the center of the room for use with making corridors
 *
 * @return {Array} center coordinates of this room - [x, y]
 */
Room.prototype.getCenter = function () {
  // don't calculate the center unless we need to
  if (!this.center) {
    this.center = [
      Math.floor((this.x + this.brX) / 2),
      Math.floor((this.y + this.brY) / 2)
    ]
  }

  return this.center
}

/**
 * Calculates whether this room is intersecting another room
 *
 * @param {Room} otherRoom
 * @return {Boolean} true if rooms are intersecting
 * @throws {Error} if otherRoom is not a Room
 */
Room.prototype.isIntersecting = function (otherRoom) {
  if (!(otherRoom instanceof Room)) throw new Error('otherRoom is not a Room')

  return !(otherRoom.x >= this.brX || otherRoom.brX <= this.x ||
    otherRoom.y >= this.brY || otherRoom.brY <= this.y)
}

module.exports = Room

},{"lodash/object/merge":50}],80:[function(require,module,exports){
'use strict'

var contains = require('lodash/collection/contains')
var TileTypes = require('../helpers/TileTypes')

var defaultCharacter = TileTypes.empty

/**
 * Tile class - represents a single tile in a map
 *
 * @param {String} character
 */
var Tile = function (character) {
  if (typeof character === 'undefined') character = defaultCharacter

  if (contains(TileTypes.validTypes, character) === false) {
    throw new Error(character + ' is not a valid character')
  }

  this.character = character
}

Tile.prototype.getCharacter = function () {
  return this.character
}

/**
 * Determines if the tile blocks movement
 *
 * @return {Boolean} true if tile blocks movement
 */
Tile.prototype.isBlocking = function () {
  return contains(TileTypes.blockingTypes, this.getCharacter()) === true
}

module.exports = Tile

},{"../helpers/TileTypes":83,"lodash/collection/contains":7}],81:[function(require,module,exports){
'use strict'

var merge = require('lodash/object/merge')
var Tile = require('../Tile')
var TileTypes = require('../../helpers/TileTypes')

var defaults = {width: 100, height: 100}

/**
 * Class to be extended by an actual map class
 *
 * @param {Object} options see defaults
 */
var BaseMap = function (options) {
  options = merge({}, defaults, options)

  this.width = options.width
  this.height = options.height
}

/**
 * Generates the inital map for all map types
 *
 * @return {Array}
 */
BaseMap.prototype.generateInitialMap = function () {
  var map = []

  for (var y = 0; y < this.height; y++) {
    var row = []
    for (var x = 0; x < this.width; x++) {
      row.push(new Tile(TileTypes.empty))
    }

    map.push(row)
  }

  return map
}

BaseMap.prototype.getStartPosition = function () {
  return this.startPosition
}

module.exports = BaseMap

},{"../../helpers/TileTypes":83,"../Tile":80,"lodash/object/merge":50}],82:[function(require,module,exports){
'use strict'

var merge = require('lodash/object/merge')
var forEach = require('lodash/collection/forEach')
var random = require('random-number-in-range')
var inherits = require('inherits')

var BaseMap = require('./BaseMap')
var Room = require('../Room')
var Tile = require('../Tile')
var TileTypes = require('../../helpers/TileTypes')

var defaults = {minRoomSize: 2, maxRoomSize: 10, maxRooms: 10}

/**
 * Dungeon map type - rooms connected via corridors
 *
 * @param {Object} options room options - see defaults
 */
var Dungeon = function (options) {
  options = merge({}, defaults, options)

  // extend the BaseMap class
  BaseMap.apply(this, arguments)

  this.minRoomSize = options.minRoomSize
  this.maxRoomSize = options.maxRoomSize
  this.maxRooms = options.maxRooms
  this.rooms = []
}

inherits(Dungeon, BaseMap)

Dungeon.prototype.generateSingleRoom = function () {
  var options = {
    x: random(1, this.height - (this.maxRoomSize + 1)),
    y: random(1, this.width - (this.maxRoomSize + 1)),
    width: random(this.minRoomSize, this.maxRoomSize),
    height: random(this.minRoomSize, this.maxRoomSize)
  }

  var newRoom = new Room(options)

  // try to stop rooms from intersecting
  forEach(this.rooms, function (room) {
    // don't allow intersecting rooms but bail out after 50 attempts
    for (var i = 0; (newRoom.isIntersecting(room)) && i < 50; i++) {
      options = {
        x: random(1, this.height - (this.maxRoomSize + 1)),
        y: random(1, this.width - (this.maxRoomSize + 1)),
        width: random(this.minRoomSize, this.maxRoomSize),
        height: random(this.minRoomSize, this.maxRoomSize)
      }

      newRoom = new Room(options)
    }
  }, this)

  return newRoom
}

/**
 * Generates rooms and sets them to this.rooms array
 */
Dungeon.prototype.generateRooms = function () {
  var numberOfRooms = random(1, this.maxRooms)

  for (var i = 0; i < numberOfRooms; i++) {
    var newRoom = this.generateSingleRoom()
    this.rooms.push(newRoom)
  }

  this.startPosition = {
    x: this.rooms[0].getX(),
    y: this.rooms[0].getY()
  }
}

/**
 * Adds a single room to the map
 *
 * @param {Room} room
 */
Dungeon.prototype.addSingleRoomToMap = function (room, drawWalls) {
  drawWalls = drawWalls || false
  for (var y = room.getY(); y < room.getBrY(); y++) {
    // true for the first and last rows
    var isWallRow = room.getY() === y || room.getBrY() - 1 === y

    for (var x = room.getX(); x < room.getBrX(); x++) {
      // true for the first and last columns
      var isWallColumn = room.getX() === x || room.getBrX() - 1 === x

      // if this is the first & last column or row use a wall, otherwise use the floor
      if ((isWallRow || isWallColumn) && drawWalls) {
        this.generatedMap[x][y] = new Tile(TileTypes.wall)
      } else if (!(isWallRow || isWallColumn)) {
        this.generatedMap[x][y] = new Tile(TileTypes.floor)
      }
    }
  }
}

/**
 * Adds a tile to the map if it is empty
 *
 * @param {integer} x
 * @param {integer} y
 * @param {string} tileType
 */
Dungeon.prototype.drawIfEmpty = function (x, y, tileType) {
  if (this.generatedMap[y][x].character === TileTypes.empty) {
    this.generatedMap[y][x] = new Tile(tileType)
  }
}

/**
 * Generates a horizontal corridor
 *
 * @param {integer} x1
 * @param {integer} x2
 * @param {integer} y
 */
Dungeon.prototype.generateHorizontalCorridor = function (x1, x2, y) {
  for (var x = Math.min(x1, x2); x < Math.max(x1, x2) + 1; x++) {
    // generate walls around the corridor
    this.drawIfEmpty(x, y - 1, TileTypes.wall)
    this.drawIfEmpty(x, y + 1, TileTypes.wall)

    this.generatedMap[y][x] = new Tile(TileTypes.floor)
  }
}

/**
 * Generates a vertical corridor
 *
 * @param {integer} y1
 * @param {integer} y2
 * @param {integer} x
 */
Dungeon.prototype.generateVerticalCorridor = function (y1, y2, x) {
  for (var y = Math.min(y1, y2); y < Math.max(y1, y2) + 1; y++) {
    // generate walls around the corridor
    this.drawIfEmpty(x - 1, y, TileTypes.wall)
    this.drawIfEmpty(x + 1, y, TileTypes.wall)

    this.generatedMap[y][x] = new Tile(TileTypes.floor)
  }
}

/**
 * Generates corridors between two rooms
 *
 * @param {array} currentCenter
 * @param {array} previousCenter
 */
Dungeon.prototype.generateCorridors = function (currentCenter, previousCenter) {
  this.generateHorizontalCorridor(previousCenter[1], currentCenter[1], previousCenter[0])
  this.generateVerticalCorridor(previousCenter[0], currentCenter[0], currentCenter[1])
}

/**
 * Adds all generated rooms to the map
 */
Dungeon.prototype.addRoomsToMap = function () {
  var currentRoom

  for (var i = 0; i < this.rooms.length; i++) {
    var drawWalls = true
    currentRoom = this.rooms[i]
    this.addSingleRoomToMap(currentRoom, drawWalls)

    if (i > 0) {
      this.generateCorridors(currentRoom.getCenter(), this.rooms[i - 1].getCenter())
    }
  }

  // loop through rooms again only drawing floor characters; this will 'hollow' out
  // the rooms so if two are intersecting then the extra walls will become floors
  for (i = 0; i < this.rooms.length; i++) {
    currentRoom = this.rooms[i]
    this.addSingleRoomToMap(currentRoom)
  }
}

/**
 * Connects rooms that are next to each other (.##.)
 *
 * @param {integer} x
 * @param {integer} y
 */
Dungeon.prototype.connectTwoAway = function (x, y) {
  // replace .##. with ....
  if (this.generatedMap[y][x].character === TileTypes.floor &&
    this.generatedMap[y][x + 1].character === TileTypes.wall &&
    this.generatedMap[y][x + 2].character === TileTypes.wall &&
    this.generatedMap[y][x + 3].character === TileTypes.floor) {
    this.generatedMap[y][x + 1].character = TileTypes.floor
    this.generatedMap[y][x + 2].character = TileTypes.floor
  }

  // replace .##. vertically with ....
  if (this.generatedMap[y][x].character === TileTypes.floor &&
    this.generatedMap[y + 1][x].character === TileTypes.wall &&
    this.generatedMap[y + 2][x].character === TileTypes.wall &&
    this.generatedMap[y + 3][x].character === TileTypes.floor) {
    this.generatedMap[y + 1][x].character = TileTypes.floor
    this.generatedMap[y + 2][x].character = TileTypes.floor
  }
}

/**
 * Connects rooms that share a wall (.#.)
 *
 * @param {integer} x
 * @param {integer} y
 */
Dungeon.prototype.connectOneAway = function (x, y) {
  // replace .#. with ...
  if (this.generatedMap[y][x].character === TileTypes.floor &&
    this.generatedMap[y][x + 1].character === TileTypes.wall &&
    this.generatedMap[y][x + 2].character === TileTypes.floor) {
    this.generatedMap[y][x + 1].character = TileTypes.floor
  }

  // replace .#. vertically with ...
  if (this.generatedMap[y][x].character === TileTypes.floor &&
    this.generatedMap[y + 1][x].character === TileTypes.wall &&
    this.generatedMap[y + 2][x].character === TileTypes.floor) {
    this.generatedMap[y + 1][x].character = TileTypes.floor
  }
}

/**
 * Joins rooms together when their walls are touching
 */
Dungeon.prototype.connectAdjacentRooms = function () {
  for (var y = 0; y < this.height; y++) {
    for (var x = 0; x < this.width; x++) {
      this.connectTwoAway(x, y)
      this.connectOneAway(x, y)
    }
  }
}

/**
 * Main function called by a MapGenerator to generate a Dungeon
 */
Dungeon.prototype.generateMap = function () {
  this.generatedMap = this.generateInitialMap()
  this.generateRooms()
  this.addRoomsToMap()
  this.connectAdjacentRooms()

  return this.generatedMap
}

module.exports = Dungeon

},{"../../helpers/TileTypes":83,"../Room":79,"../Tile":80,"./BaseMap":81,"inherits":6,"lodash/collection/forEach":8,"lodash/object/merge":50,"random-number-in-range":77}],83:[function(require,module,exports){
var empty = ' '
var wall = '#'
var floor = '.'

module.exports = {
  empty: empty,
  floor: floor,
  wall: wall,
  validTypes: [empty, wall, floor],
  blockingTypes: [wall]
}

},{}],84:[function(require,module,exports){
var MapGenerator = require('./class/MapGenerator')

var mapGenerator = new MapGenerator({
  width: 50,
  height: 25,
  roomOptions: {
    maxRooms: 10,
    minRoomSize: 5
  }
})

var map = mapGenerator.generate()
var startPosition = mapGenerator.getStartPosition()
var Potion = require('potion')

var colours = {
  ' ': '#fff',
  '.': '#ccc',
  '#': '#555'
}

var app = Potion.init(document.getElementById('game'), {
  configure: function () {
    app.resize(1000, 500)
    this.y = startPosition.x * 20 + 20
    this.x = startPosition.y * 20 + 20
  },

  init: function () {
    this.size = 20
  },

  update: function (time) {
    if (app.input.isKeyDown('w')) { this.y -= this.size }
    if (app.input.isKeyDown('d')) { this.x += this.size }
    if (app.input.isKeyDown('s')) { this.y += this.size }
    if (app.input.isKeyDown('a')) { this.x -= this.size }

    app.input.resetKeys()
  },

  render: function () {
    for (var i = 0; i < map.length; i++) {
      var row = map[i]
      for (var j = 0; j < row.length; j++) {
        app.video.ctx.fillStyle = colours[row[j].character]
        app.video.ctx.fillRect(j * this.size, i * this.size, this.size, this.size)
      }
    }

    app.video.ctx.fillStyle = 'red'
    app.video.ctx.fillRect(this.x, this.y, this.size, this.size)
  }
})

},{"./class/MapGenerator":78,"potion":54}]},{},[78,79,80,81,82,83,84])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvZ3J1bnQtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvaW5oZXJpdHMvaW5oZXJpdHNfYnJvd3Nlci5qcyIsIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9wYXRoLWJyb3dzZXJpZnkvaW5kZXguanMiLCJub2RlX21vZHVsZXMvZ3J1bnQtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwibm9kZV9tb2R1bGVzL2dydW50LWJyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL3V0aWwvc3VwcG9ydC9pc0J1ZmZlckJyb3dzZXIuanMiLCJub2RlX21vZHVsZXMvZ3J1bnQtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvdXRpbC91dGlsLmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC9jb2xsZWN0aW9uL2NvbnRhaW5zLmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC9jb2xsZWN0aW9uL2ZvckVhY2guanMiLCJub2RlX21vZHVsZXMvbG9kYXNoL2NvbGxlY3Rpb24vaW5jbHVkZXMuanMiLCJub2RlX21vZHVsZXMvbG9kYXNoL2Z1bmN0aW9uL3Jlc3RQYXJhbS5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvaW50ZXJuYWwvYXJyYXlDb3B5LmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC9pbnRlcm5hbC9hcnJheUVhY2guanMiLCJub2RlX21vZHVsZXMvbG9kYXNoL2ludGVybmFsL2Jhc2VDb3B5LmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC9pbnRlcm5hbC9iYXNlRWFjaC5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvaW50ZXJuYWwvYmFzZUZvci5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvaW50ZXJuYWwvYmFzZUZvckluLmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC9pbnRlcm5hbC9iYXNlRm9yT3duLmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC9pbnRlcm5hbC9iYXNlSW5kZXhPZi5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvaW50ZXJuYWwvYmFzZU1lcmdlLmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC9pbnRlcm5hbC9iYXNlTWVyZ2VEZWVwLmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC9pbnRlcm5hbC9iYXNlUHJvcGVydHkuanMiLCJub2RlX21vZHVsZXMvbG9kYXNoL2ludGVybmFsL2Jhc2VUb1N0cmluZy5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvaW50ZXJuYWwvYmFzZVZhbHVlcy5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvaW50ZXJuYWwvYmluZENhbGxiYWNrLmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC9pbnRlcm5hbC9jcmVhdGVBc3NpZ25lci5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvaW50ZXJuYWwvY3JlYXRlQmFzZUVhY2guanMiLCJub2RlX21vZHVsZXMvbG9kYXNoL2ludGVybmFsL2NyZWF0ZUJhc2VGb3IuanMiLCJub2RlX21vZHVsZXMvbG9kYXNoL2ludGVybmFsL2NyZWF0ZUZvckVhY2guanMiLCJub2RlX21vZHVsZXMvbG9kYXNoL2ludGVybmFsL2dldExlbmd0aC5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvaW50ZXJuYWwvZ2V0TmF0aXZlLmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC9pbnRlcm5hbC9pbmRleE9mTmFOLmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC9pbnRlcm5hbC9pc0FycmF5TGlrZS5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvaW50ZXJuYWwvaXNJbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvaW50ZXJuYWwvaXNJdGVyYXRlZUNhbGwuanMiLCJub2RlX21vZHVsZXMvbG9kYXNoL2ludGVybmFsL2lzTGVuZ3RoLmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC9pbnRlcm5hbC9pc09iamVjdExpa2UuanMiLCJub2RlX21vZHVsZXMvbG9kYXNoL2ludGVybmFsL3NoaW1Jc1BsYWluT2JqZWN0LmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC9pbnRlcm5hbC9zaGltS2V5cy5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvaW50ZXJuYWwvdG9PYmplY3QuanMiLCJub2RlX21vZHVsZXMvbG9kYXNoL2xhbmcvaXNBcmd1bWVudHMuanMiLCJub2RlX21vZHVsZXMvbG9kYXNoL2xhbmcvaXNBcnJheS5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvbGFuZy9pc05hdGl2ZS5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvbGFuZy9pc09iamVjdC5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvbGFuZy9pc1BsYWluT2JqZWN0LmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC9sYW5nL2lzU3RyaW5nLmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC9sYW5nL2lzVHlwZWRBcnJheS5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvbGFuZy90b1BsYWluT2JqZWN0LmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC9vYmplY3Qva2V5cy5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvb2JqZWN0L2tleXNJbi5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvb2JqZWN0L21lcmdlLmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC9vYmplY3QvdmFsdWVzLmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC9zdHJpbmcvZXNjYXBlUmVnRXhwLmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC91dGlsaXR5L2lkZW50aXR5LmpzIiwibm9kZV9tb2R1bGVzL3BvdGlvbi9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9wb3Rpb24vbm9kZV9tb2R1bGVzL3BvdGlvbi1hdWRpby9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9wb3Rpb24vbm9kZV9tb2R1bGVzL3BvdGlvbi1hdWRpby9zcmMvYXVkaW8tbWFuYWdlci5qcyIsIm5vZGVfbW9kdWxlcy9wb3Rpb24vbm9kZV9tb2R1bGVzL3BvdGlvbi1hdWRpby9zcmMvbG9hZGVkLWF1ZGlvLmpzIiwibm9kZV9tb2R1bGVzL3BvdGlvbi9ub2RlX21vZHVsZXMvcG90aW9uLWF1ZGlvL3NyYy9wbGF5aW5nLWF1ZGlvLmpzIiwibm9kZV9tb2R1bGVzL3BvdGlvbi9ub2RlX21vZHVsZXMvcG90aW9uLWRlYnVnZ2VyL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3BvdGlvbi9ub2RlX21vZHVsZXMvcG90aW9uLWRlYnVnZ2VyL3NyYy9kZWJ1Z2dlci5qcyIsIm5vZGVfbW9kdWxlcy9wb3Rpb24vbm9kZV9tb2R1bGVzL3BvdGlvbi1kZWJ1Z2dlci9zcmMvZGlydHktbWFuYWdlci5qcyIsIm5vZGVfbW9kdWxlcy9wb3Rpb24vc3JjL2FwcC5qcyIsIm5vZGVfbW9kdWxlcy9wb3Rpb24vc3JjL2Fzc2V0cy5qcyIsIm5vZGVfbW9kdWxlcy9wb3Rpb24vc3JjL2VuZ2luZS5qcyIsIm5vZGVfbW9kdWxlcy9wb3Rpb24vc3JjL2lucHV0LmpzIiwibm9kZV9tb2R1bGVzL3BvdGlvbi9zcmMva2V5cy5qcyIsIm5vZGVfbW9kdWxlcy9wb3Rpb24vc3JjL2xvYWRlci9hdWRpby1sb2FkZXIuanMiLCJub2RlX21vZHVsZXMvcG90aW9uL3NyYy9sb2FkZXIvaW1hZ2UtbG9hZGVyLmpzIiwibm9kZV9tb2R1bGVzL3BvdGlvbi9zcmMvbG9hZGVyL2pzb24tbG9hZGVyLmpzIiwibm9kZV9tb2R1bGVzL3BvdGlvbi9zcmMvbG9hZGVyL3RleHQtbG9hZGVyLmpzIiwibm9kZV9tb2R1bGVzL3BvdGlvbi9zcmMvbG9hZGluZy5qcyIsIm5vZGVfbW9kdWxlcy9wb3Rpb24vc3JjL3JhZi1wb2x5ZmlsbC5qcyIsIm5vZGVfbW9kdWxlcy9wb3Rpb24vc3JjL3JldGluYS5qcyIsIm5vZGVfbW9kdWxlcy9wb3Rpb24vc3JjL3N0YXRlLW1hbmFnZXIuanMiLCJub2RlX21vZHVsZXMvcG90aW9uL3NyYy90aW1lLmpzIiwibm9kZV9tb2R1bGVzL3BvdGlvbi9zcmMvdmlkZW8uanMiLCJub2RlX21vZHVsZXMvcmFuZG9tLW51bWJlci1pbi1yYW5nZS9kaXN0L2luZGV4LmpzIiwic3JjL2pzL2NsYXNzL01hcEdlbmVyYXRvci5qcyIsInNyYy9qcy9jbGFzcy9Sb29tLmpzIiwic3JjL2pzL2NsYXNzL1RpbGUuanMiLCJzcmMvanMvY2xhc3MvbWFwcy9CYXNlTWFwLmpzIiwic3JjL2pzL2NsYXNzL21hcHMvRHVuZ2Vvbi5qcyIsInNyYy9qcy9oZWxwZXJzL1RpbGVUeXBlcy5qcyIsInNyYy9qcy9uZWFyd2VsbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ2hPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7QUMxa0JBO0FBQ0E7O0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25FQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2poQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2UUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeFRBO0FBQ0E7QUFDQTtBQUNBOztBQ0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xRQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiaWYgKHR5cGVvZiBPYmplY3QuY3JlYXRlID09PSAnZnVuY3Rpb24nKSB7XG4gIC8vIGltcGxlbWVudGF0aW9uIGZyb20gc3RhbmRhcmQgbm9kZS5qcyAndXRpbCcgbW9kdWxlXG4gIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaW5oZXJpdHMoY3Rvciwgc3VwZXJDdG9yKSB7XG4gICAgY3Rvci5zdXBlcl8gPSBzdXBlckN0b3JcbiAgICBjdG9yLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDdG9yLnByb3RvdHlwZSwge1xuICAgICAgY29uc3RydWN0b3I6IHtcbiAgICAgICAgdmFsdWU6IGN0b3IsXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICB9XG4gICAgfSk7XG4gIH07XG59IGVsc2Uge1xuICAvLyBvbGQgc2Nob29sIHNoaW0gZm9yIG9sZCBicm93c2Vyc1xuICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGluaGVyaXRzKGN0b3IsIHN1cGVyQ3Rvcikge1xuICAgIGN0b3Iuc3VwZXJfID0gc3VwZXJDdG9yXG4gICAgdmFyIFRlbXBDdG9yID0gZnVuY3Rpb24gKCkge31cbiAgICBUZW1wQ3Rvci5wcm90b3R5cGUgPSBzdXBlckN0b3IucHJvdG90eXBlXG4gICAgY3Rvci5wcm90b3R5cGUgPSBuZXcgVGVtcEN0b3IoKVxuICAgIGN0b3IucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gY3RvclxuICB9XG59XG4iLCIvLyBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxuLy8gcmVzb2x2ZXMgLiBhbmQgLi4gZWxlbWVudHMgaW4gYSBwYXRoIGFycmF5IHdpdGggZGlyZWN0b3J5IG5hbWVzIHRoZXJlXG4vLyBtdXN0IGJlIG5vIHNsYXNoZXMsIGVtcHR5IGVsZW1lbnRzLCBvciBkZXZpY2UgbmFtZXMgKGM6XFwpIGluIHRoZSBhcnJheVxuLy8gKHNvIGFsc28gbm8gbGVhZGluZyBhbmQgdHJhaWxpbmcgc2xhc2hlcyAtIGl0IGRvZXMgbm90IGRpc3Rpbmd1aXNoXG4vLyByZWxhdGl2ZSBhbmQgYWJzb2x1dGUgcGF0aHMpXG5mdW5jdGlvbiBub3JtYWxpemVBcnJheShwYXJ0cywgYWxsb3dBYm92ZVJvb3QpIHtcbiAgLy8gaWYgdGhlIHBhdGggdHJpZXMgdG8gZ28gYWJvdmUgdGhlIHJvb3QsIGB1cGAgZW5kcyB1cCA+IDBcbiAgdmFyIHVwID0gMDtcbiAgZm9yICh2YXIgaSA9IHBhcnRzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgdmFyIGxhc3QgPSBwYXJ0c1tpXTtcbiAgICBpZiAobGFzdCA9PT0gJy4nKSB7XG4gICAgICBwYXJ0cy5zcGxpY2UoaSwgMSk7XG4gICAgfSBlbHNlIGlmIChsYXN0ID09PSAnLi4nKSB7XG4gICAgICBwYXJ0cy5zcGxpY2UoaSwgMSk7XG4gICAgICB1cCsrO1xuICAgIH0gZWxzZSBpZiAodXApIHtcbiAgICAgIHBhcnRzLnNwbGljZShpLCAxKTtcbiAgICAgIHVwLS07XG4gICAgfVxuICB9XG5cbiAgLy8gaWYgdGhlIHBhdGggaXMgYWxsb3dlZCB0byBnbyBhYm92ZSB0aGUgcm9vdCwgcmVzdG9yZSBsZWFkaW5nIC4uc1xuICBpZiAoYWxsb3dBYm92ZVJvb3QpIHtcbiAgICBmb3IgKDsgdXAtLTsgdXApIHtcbiAgICAgIHBhcnRzLnVuc2hpZnQoJy4uJyk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHBhcnRzO1xufVxuXG4vLyBTcGxpdCBhIGZpbGVuYW1lIGludG8gW3Jvb3QsIGRpciwgYmFzZW5hbWUsIGV4dF0sIHVuaXggdmVyc2lvblxuLy8gJ3Jvb3QnIGlzIGp1c3QgYSBzbGFzaCwgb3Igbm90aGluZy5cbnZhciBzcGxpdFBhdGhSZSA9XG4gICAgL14oXFwvP3wpKFtcXHNcXFNdKj8pKCg/OlxcLnsxLDJ9fFteXFwvXSs/fCkoXFwuW14uXFwvXSp8KSkoPzpbXFwvXSopJC87XG52YXIgc3BsaXRQYXRoID0gZnVuY3Rpb24oZmlsZW5hbWUpIHtcbiAgcmV0dXJuIHNwbGl0UGF0aFJlLmV4ZWMoZmlsZW5hbWUpLnNsaWNlKDEpO1xufTtcblxuLy8gcGF0aC5yZXNvbHZlKFtmcm9tIC4uLl0sIHRvKVxuLy8gcG9zaXggdmVyc2lvblxuZXhwb3J0cy5yZXNvbHZlID0gZnVuY3Rpb24oKSB7XG4gIHZhciByZXNvbHZlZFBhdGggPSAnJyxcbiAgICAgIHJlc29sdmVkQWJzb2x1dGUgPSBmYWxzZTtcblxuICBmb3IgKHZhciBpID0gYXJndW1lbnRzLmxlbmd0aCAtIDE7IGkgPj0gLTEgJiYgIXJlc29sdmVkQWJzb2x1dGU7IGktLSkge1xuICAgIHZhciBwYXRoID0gKGkgPj0gMCkgPyBhcmd1bWVudHNbaV0gOiBwcm9jZXNzLmN3ZCgpO1xuXG4gICAgLy8gU2tpcCBlbXB0eSBhbmQgaW52YWxpZCBlbnRyaWVzXG4gICAgaWYgKHR5cGVvZiBwYXRoICE9PSAnc3RyaW5nJykge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQXJndW1lbnRzIHRvIHBhdGgucmVzb2x2ZSBtdXN0IGJlIHN0cmluZ3MnKTtcbiAgICB9IGVsc2UgaWYgKCFwYXRoKSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICByZXNvbHZlZFBhdGggPSBwYXRoICsgJy8nICsgcmVzb2x2ZWRQYXRoO1xuICAgIHJlc29sdmVkQWJzb2x1dGUgPSBwYXRoLmNoYXJBdCgwKSA9PT0gJy8nO1xuICB9XG5cbiAgLy8gQXQgdGhpcyBwb2ludCB0aGUgcGF0aCBzaG91bGQgYmUgcmVzb2x2ZWQgdG8gYSBmdWxsIGFic29sdXRlIHBhdGgsIGJ1dFxuICAvLyBoYW5kbGUgcmVsYXRpdmUgcGF0aHMgdG8gYmUgc2FmZSAobWlnaHQgaGFwcGVuIHdoZW4gcHJvY2Vzcy5jd2QoKSBmYWlscylcblxuICAvLyBOb3JtYWxpemUgdGhlIHBhdGhcbiAgcmVzb2x2ZWRQYXRoID0gbm9ybWFsaXplQXJyYXkoZmlsdGVyKHJlc29sdmVkUGF0aC5zcGxpdCgnLycpLCBmdW5jdGlvbihwKSB7XG4gICAgcmV0dXJuICEhcDtcbiAgfSksICFyZXNvbHZlZEFic29sdXRlKS5qb2luKCcvJyk7XG5cbiAgcmV0dXJuICgocmVzb2x2ZWRBYnNvbHV0ZSA/ICcvJyA6ICcnKSArIHJlc29sdmVkUGF0aCkgfHwgJy4nO1xufTtcblxuLy8gcGF0aC5ub3JtYWxpemUocGF0aClcbi8vIHBvc2l4IHZlcnNpb25cbmV4cG9ydHMubm9ybWFsaXplID0gZnVuY3Rpb24ocGF0aCkge1xuICB2YXIgaXNBYnNvbHV0ZSA9IGV4cG9ydHMuaXNBYnNvbHV0ZShwYXRoKSxcbiAgICAgIHRyYWlsaW5nU2xhc2ggPSBzdWJzdHIocGF0aCwgLTEpID09PSAnLyc7XG5cbiAgLy8gTm9ybWFsaXplIHRoZSBwYXRoXG4gIHBhdGggPSBub3JtYWxpemVBcnJheShmaWx0ZXIocGF0aC5zcGxpdCgnLycpLCBmdW5jdGlvbihwKSB7XG4gICAgcmV0dXJuICEhcDtcbiAgfSksICFpc0Fic29sdXRlKS5qb2luKCcvJyk7XG5cbiAgaWYgKCFwYXRoICYmICFpc0Fic29sdXRlKSB7XG4gICAgcGF0aCA9ICcuJztcbiAgfVxuICBpZiAocGF0aCAmJiB0cmFpbGluZ1NsYXNoKSB7XG4gICAgcGF0aCArPSAnLyc7XG4gIH1cblxuICByZXR1cm4gKGlzQWJzb2x1dGUgPyAnLycgOiAnJykgKyBwYXRoO1xufTtcblxuLy8gcG9zaXggdmVyc2lvblxuZXhwb3J0cy5pc0Fic29sdXRlID0gZnVuY3Rpb24ocGF0aCkge1xuICByZXR1cm4gcGF0aC5jaGFyQXQoMCkgPT09ICcvJztcbn07XG5cbi8vIHBvc2l4IHZlcnNpb25cbmV4cG9ydHMuam9pbiA9IGZ1bmN0aW9uKCkge1xuICB2YXIgcGF0aHMgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDApO1xuICByZXR1cm4gZXhwb3J0cy5ub3JtYWxpemUoZmlsdGVyKHBhdGhzLCBmdW5jdGlvbihwLCBpbmRleCkge1xuICAgIGlmICh0eXBlb2YgcCAhPT0gJ3N0cmluZycpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0FyZ3VtZW50cyB0byBwYXRoLmpvaW4gbXVzdCBiZSBzdHJpbmdzJyk7XG4gICAgfVxuICAgIHJldHVybiBwO1xuICB9KS5qb2luKCcvJykpO1xufTtcblxuXG4vLyBwYXRoLnJlbGF0aXZlKGZyb20sIHRvKVxuLy8gcG9zaXggdmVyc2lvblxuZXhwb3J0cy5yZWxhdGl2ZSA9IGZ1bmN0aW9uKGZyb20sIHRvKSB7XG4gIGZyb20gPSBleHBvcnRzLnJlc29sdmUoZnJvbSkuc3Vic3RyKDEpO1xuICB0byA9IGV4cG9ydHMucmVzb2x2ZSh0bykuc3Vic3RyKDEpO1xuXG4gIGZ1bmN0aW9uIHRyaW0oYXJyKSB7XG4gICAgdmFyIHN0YXJ0ID0gMDtcbiAgICBmb3IgKDsgc3RhcnQgPCBhcnIubGVuZ3RoOyBzdGFydCsrKSB7XG4gICAgICBpZiAoYXJyW3N0YXJ0XSAhPT0gJycpIGJyZWFrO1xuICAgIH1cblxuICAgIHZhciBlbmQgPSBhcnIubGVuZ3RoIC0gMTtcbiAgICBmb3IgKDsgZW5kID49IDA7IGVuZC0tKSB7XG4gICAgICBpZiAoYXJyW2VuZF0gIT09ICcnKSBicmVhaztcbiAgICB9XG5cbiAgICBpZiAoc3RhcnQgPiBlbmQpIHJldHVybiBbXTtcbiAgICByZXR1cm4gYXJyLnNsaWNlKHN0YXJ0LCBlbmQgLSBzdGFydCArIDEpO1xuICB9XG5cbiAgdmFyIGZyb21QYXJ0cyA9IHRyaW0oZnJvbS5zcGxpdCgnLycpKTtcbiAgdmFyIHRvUGFydHMgPSB0cmltKHRvLnNwbGl0KCcvJykpO1xuXG4gIHZhciBsZW5ndGggPSBNYXRoLm1pbihmcm9tUGFydHMubGVuZ3RoLCB0b1BhcnRzLmxlbmd0aCk7XG4gIHZhciBzYW1lUGFydHNMZW5ndGggPSBsZW5ndGg7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoZnJvbVBhcnRzW2ldICE9PSB0b1BhcnRzW2ldKSB7XG4gICAgICBzYW1lUGFydHNMZW5ndGggPSBpO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgdmFyIG91dHB1dFBhcnRzID0gW107XG4gIGZvciAodmFyIGkgPSBzYW1lUGFydHNMZW5ndGg7IGkgPCBmcm9tUGFydHMubGVuZ3RoOyBpKyspIHtcbiAgICBvdXRwdXRQYXJ0cy5wdXNoKCcuLicpO1xuICB9XG5cbiAgb3V0cHV0UGFydHMgPSBvdXRwdXRQYXJ0cy5jb25jYXQodG9QYXJ0cy5zbGljZShzYW1lUGFydHNMZW5ndGgpKTtcblxuICByZXR1cm4gb3V0cHV0UGFydHMuam9pbignLycpO1xufTtcblxuZXhwb3J0cy5zZXAgPSAnLyc7XG5leHBvcnRzLmRlbGltaXRlciA9ICc6JztcblxuZXhwb3J0cy5kaXJuYW1lID0gZnVuY3Rpb24ocGF0aCkge1xuICB2YXIgcmVzdWx0ID0gc3BsaXRQYXRoKHBhdGgpLFxuICAgICAgcm9vdCA9IHJlc3VsdFswXSxcbiAgICAgIGRpciA9IHJlc3VsdFsxXTtcblxuICBpZiAoIXJvb3QgJiYgIWRpcikge1xuICAgIC8vIE5vIGRpcm5hbWUgd2hhdHNvZXZlclxuICAgIHJldHVybiAnLic7XG4gIH1cblxuICBpZiAoZGlyKSB7XG4gICAgLy8gSXQgaGFzIGEgZGlybmFtZSwgc3RyaXAgdHJhaWxpbmcgc2xhc2hcbiAgICBkaXIgPSBkaXIuc3Vic3RyKDAsIGRpci5sZW5ndGggLSAxKTtcbiAgfVxuXG4gIHJldHVybiByb290ICsgZGlyO1xufTtcblxuXG5leHBvcnRzLmJhc2VuYW1lID0gZnVuY3Rpb24ocGF0aCwgZXh0KSB7XG4gIHZhciBmID0gc3BsaXRQYXRoKHBhdGgpWzJdO1xuICAvLyBUT0RPOiBtYWtlIHRoaXMgY29tcGFyaXNvbiBjYXNlLWluc2Vuc2l0aXZlIG9uIHdpbmRvd3M/XG4gIGlmIChleHQgJiYgZi5zdWJzdHIoLTEgKiBleHQubGVuZ3RoKSA9PT0gZXh0KSB7XG4gICAgZiA9IGYuc3Vic3RyKDAsIGYubGVuZ3RoIC0gZXh0Lmxlbmd0aCk7XG4gIH1cbiAgcmV0dXJuIGY7XG59O1xuXG5cbmV4cG9ydHMuZXh0bmFtZSA9IGZ1bmN0aW9uKHBhdGgpIHtcbiAgcmV0dXJuIHNwbGl0UGF0aChwYXRoKVszXTtcbn07XG5cbmZ1bmN0aW9uIGZpbHRlciAoeHMsIGYpIHtcbiAgICBpZiAoeHMuZmlsdGVyKSByZXR1cm4geHMuZmlsdGVyKGYpO1xuICAgIHZhciByZXMgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHhzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChmKHhzW2ldLCBpLCB4cykpIHJlcy5wdXNoKHhzW2ldKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlcztcbn1cblxuLy8gU3RyaW5nLnByb3RvdHlwZS5zdWJzdHIgLSBuZWdhdGl2ZSBpbmRleCBkb24ndCB3b3JrIGluIElFOFxudmFyIHN1YnN0ciA9ICdhYicuc3Vic3RyKC0xKSA9PT0gJ2InXG4gICAgPyBmdW5jdGlvbiAoc3RyLCBzdGFydCwgbGVuKSB7IHJldHVybiBzdHIuc3Vic3RyKHN0YXJ0LCBsZW4pIH1cbiAgICA6IGZ1bmN0aW9uIChzdHIsIHN0YXJ0LCBsZW4pIHtcbiAgICAgICAgaWYgKHN0YXJ0IDwgMCkgc3RhcnQgPSBzdHIubGVuZ3RoICsgc3RhcnQ7XG4gICAgICAgIHJldHVybiBzdHIuc3Vic3RyKHN0YXJ0LCBsZW4pO1xuICAgIH1cbjtcbiIsIi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxuXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG52YXIgcXVldWUgPSBbXTtcbnZhciBkcmFpbmluZyA9IGZhbHNlO1xudmFyIGN1cnJlbnRRdWV1ZTtcbnZhciBxdWV1ZUluZGV4ID0gLTE7XG5cbmZ1bmN0aW9uIGNsZWFuVXBOZXh0VGljaygpIHtcbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIGlmIChjdXJyZW50UXVldWUubGVuZ3RoKSB7XG4gICAgICAgIHF1ZXVlID0gY3VycmVudFF1ZXVlLmNvbmNhdChxdWV1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgIH1cbiAgICBpZiAocXVldWUubGVuZ3RoKSB7XG4gICAgICAgIGRyYWluUXVldWUoKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGRyYWluUXVldWUoKSB7XG4gICAgaWYgKGRyYWluaW5nKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIHRpbWVvdXQgPSBzZXRUaW1lb3V0KGNsZWFuVXBOZXh0VGljayk7XG4gICAgZHJhaW5pbmcgPSB0cnVlO1xuXG4gICAgdmFyIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB3aGlsZShsZW4pIHtcbiAgICAgICAgY3VycmVudFF1ZXVlID0gcXVldWU7XG4gICAgICAgIHF1ZXVlID0gW107XG4gICAgICAgIHdoaWxlICgrK3F1ZXVlSW5kZXggPCBsZW4pIHtcbiAgICAgICAgICAgIGN1cnJlbnRRdWV1ZVtxdWV1ZUluZGV4XS5ydW4oKTtcbiAgICAgICAgfVxuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgICAgIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB9XG4gICAgY3VycmVudFF1ZXVlID0gbnVsbDtcbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbn1cblxucHJvY2Vzcy5uZXh0VGljayA9IGZ1bmN0aW9uIChmdW4pIHtcbiAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoIC0gMSk7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBxdWV1ZS5wdXNoKG5ldyBJdGVtKGZ1biwgYXJncykpO1xuICAgIGlmIChxdWV1ZS5sZW5ndGggPT09IDEgJiYgIWRyYWluaW5nKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZHJhaW5RdWV1ZSwgMCk7XG4gICAgfVxufTtcblxuLy8gdjggbGlrZXMgcHJlZGljdGlibGUgb2JqZWN0c1xuZnVuY3Rpb24gSXRlbShmdW4sIGFycmF5KSB7XG4gICAgdGhpcy5mdW4gPSBmdW47XG4gICAgdGhpcy5hcnJheSA9IGFycmF5O1xufVxuSXRlbS5wcm90b3R5cGUucnVuID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZnVuLmFwcGx5KG51bGwsIHRoaXMuYXJyYXkpO1xufTtcbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xucHJvY2Vzcy52ZXJzaW9uID0gJyc7IC8vIGVtcHR5IHN0cmluZyB0byBhdm9pZCByZWdleHAgaXNzdWVzXG5wcm9jZXNzLnZlcnNpb25zID0ge307XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG5wcm9jZXNzLm9uID0gbm9vcDtcbnByb2Nlc3MuYWRkTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5vbmNlID0gbm9vcDtcbnByb2Nlc3Mub2ZmID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBub29wO1xucHJvY2Vzcy5lbWl0ID0gbm9vcDtcblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuXG4vLyBUT0RPKHNodHlsbWFuKVxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5wcm9jZXNzLnVtYXNrID0gZnVuY3Rpb24oKSB7IHJldHVybiAwOyB9O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpc0J1ZmZlcihhcmcpIHtcbiAgcmV0dXJuIGFyZyAmJiB0eXBlb2YgYXJnID09PSAnb2JqZWN0J1xuICAgICYmIHR5cGVvZiBhcmcuY29weSA9PT0gJ2Z1bmN0aW9uJ1xuICAgICYmIHR5cGVvZiBhcmcuZmlsbCA9PT0gJ2Z1bmN0aW9uJ1xuICAgICYmIHR5cGVvZiBhcmcucmVhZFVJbnQ4ID09PSAnZnVuY3Rpb24nO1xufSIsIi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG52YXIgZm9ybWF0UmVnRXhwID0gLyVbc2RqJV0vZztcbmV4cG9ydHMuZm9ybWF0ID0gZnVuY3Rpb24oZikge1xuICBpZiAoIWlzU3RyaW5nKGYpKSB7XG4gICAgdmFyIG9iamVjdHMgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgb2JqZWN0cy5wdXNoKGluc3BlY3QoYXJndW1lbnRzW2ldKSk7XG4gICAgfVxuICAgIHJldHVybiBvYmplY3RzLmpvaW4oJyAnKTtcbiAgfVxuXG4gIHZhciBpID0gMTtcbiAgdmFyIGFyZ3MgPSBhcmd1bWVudHM7XG4gIHZhciBsZW4gPSBhcmdzLmxlbmd0aDtcbiAgdmFyIHN0ciA9IFN0cmluZyhmKS5yZXBsYWNlKGZvcm1hdFJlZ0V4cCwgZnVuY3Rpb24oeCkge1xuICAgIGlmICh4ID09PSAnJSUnKSByZXR1cm4gJyUnO1xuICAgIGlmIChpID49IGxlbikgcmV0dXJuIHg7XG4gICAgc3dpdGNoICh4KSB7XG4gICAgICBjYXNlICclcyc6IHJldHVybiBTdHJpbmcoYXJnc1tpKytdKTtcbiAgICAgIGNhc2UgJyVkJzogcmV0dXJuIE51bWJlcihhcmdzW2krK10pO1xuICAgICAgY2FzZSAnJWonOlxuICAgICAgICB0cnkge1xuICAgICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShhcmdzW2krK10pO1xuICAgICAgICB9IGNhdGNoIChfKSB7XG4gICAgICAgICAgcmV0dXJuICdbQ2lyY3VsYXJdJztcbiAgICAgICAgfVxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIHg7XG4gICAgfVxuICB9KTtcbiAgZm9yICh2YXIgeCA9IGFyZ3NbaV07IGkgPCBsZW47IHggPSBhcmdzWysraV0pIHtcbiAgICBpZiAoaXNOdWxsKHgpIHx8ICFpc09iamVjdCh4KSkge1xuICAgICAgc3RyICs9ICcgJyArIHg7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0ciArPSAnICcgKyBpbnNwZWN0KHgpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gc3RyO1xufTtcblxuXG4vLyBNYXJrIHRoYXQgYSBtZXRob2Qgc2hvdWxkIG5vdCBiZSB1c2VkLlxuLy8gUmV0dXJucyBhIG1vZGlmaWVkIGZ1bmN0aW9uIHdoaWNoIHdhcm5zIG9uY2UgYnkgZGVmYXVsdC5cbi8vIElmIC0tbm8tZGVwcmVjYXRpb24gaXMgc2V0LCB0aGVuIGl0IGlzIGEgbm8tb3AuXG5leHBvcnRzLmRlcHJlY2F0ZSA9IGZ1bmN0aW9uKGZuLCBtc2cpIHtcbiAgLy8gQWxsb3cgZm9yIGRlcHJlY2F0aW5nIHRoaW5ncyBpbiB0aGUgcHJvY2VzcyBvZiBzdGFydGluZyB1cC5cbiAgaWYgKGlzVW5kZWZpbmVkKGdsb2JhbC5wcm9jZXNzKSkge1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBleHBvcnRzLmRlcHJlY2F0ZShmbiwgbXNnKS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH07XG4gIH1cblxuICBpZiAocHJvY2Vzcy5ub0RlcHJlY2F0aW9uID09PSB0cnVlKSB7XG4gICAgcmV0dXJuIGZuO1xuICB9XG5cbiAgdmFyIHdhcm5lZCA9IGZhbHNlO1xuICBmdW5jdGlvbiBkZXByZWNhdGVkKCkge1xuICAgIGlmICghd2FybmVkKSB7XG4gICAgICBpZiAocHJvY2Vzcy50aHJvd0RlcHJlY2F0aW9uKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihtc2cpO1xuICAgICAgfSBlbHNlIGlmIChwcm9jZXNzLnRyYWNlRGVwcmVjYXRpb24pIHtcbiAgICAgICAgY29uc29sZS50cmFjZShtc2cpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihtc2cpO1xuICAgICAgfVxuICAgICAgd2FybmVkID0gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH1cblxuICByZXR1cm4gZGVwcmVjYXRlZDtcbn07XG5cblxudmFyIGRlYnVncyA9IHt9O1xudmFyIGRlYnVnRW52aXJvbjtcbmV4cG9ydHMuZGVidWdsb2cgPSBmdW5jdGlvbihzZXQpIHtcbiAgaWYgKGlzVW5kZWZpbmVkKGRlYnVnRW52aXJvbikpXG4gICAgZGVidWdFbnZpcm9uID0gcHJvY2Vzcy5lbnYuTk9ERV9ERUJVRyB8fCAnJztcbiAgc2V0ID0gc2V0LnRvVXBwZXJDYXNlKCk7XG4gIGlmICghZGVidWdzW3NldF0pIHtcbiAgICBpZiAobmV3IFJlZ0V4cCgnXFxcXGInICsgc2V0ICsgJ1xcXFxiJywgJ2knKS50ZXN0KGRlYnVnRW52aXJvbikpIHtcbiAgICAgIHZhciBwaWQgPSBwcm9jZXNzLnBpZDtcbiAgICAgIGRlYnVnc1tzZXRdID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBtc2cgPSBleHBvcnRzLmZvcm1hdC5hcHBseShleHBvcnRzLCBhcmd1bWVudHMpO1xuICAgICAgICBjb25zb2xlLmVycm9yKCclcyAlZDogJXMnLCBzZXQsIHBpZCwgbXNnKTtcbiAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIGRlYnVnc1tzZXRdID0gZnVuY3Rpb24oKSB7fTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGRlYnVnc1tzZXRdO1xufTtcblxuXG4vKipcbiAqIEVjaG9zIHRoZSB2YWx1ZSBvZiBhIHZhbHVlLiBUcnlzIHRvIHByaW50IHRoZSB2YWx1ZSBvdXRcbiAqIGluIHRoZSBiZXN0IHdheSBwb3NzaWJsZSBnaXZlbiB0aGUgZGlmZmVyZW50IHR5cGVzLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmogVGhlIG9iamVjdCB0byBwcmludCBvdXQuXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0cyBPcHRpb25hbCBvcHRpb25zIG9iamVjdCB0aGF0IGFsdGVycyB0aGUgb3V0cHV0LlxuICovXG4vKiBsZWdhY3k6IG9iaiwgc2hvd0hpZGRlbiwgZGVwdGgsIGNvbG9ycyovXG5mdW5jdGlvbiBpbnNwZWN0KG9iaiwgb3B0cykge1xuICAvLyBkZWZhdWx0IG9wdGlvbnNcbiAgdmFyIGN0eCA9IHtcbiAgICBzZWVuOiBbXSxcbiAgICBzdHlsaXplOiBzdHlsaXplTm9Db2xvclxuICB9O1xuICAvLyBsZWdhY3kuLi5cbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPj0gMykgY3R4LmRlcHRoID0gYXJndW1lbnRzWzJdO1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+PSA0KSBjdHguY29sb3JzID0gYXJndW1lbnRzWzNdO1xuICBpZiAoaXNCb29sZWFuKG9wdHMpKSB7XG4gICAgLy8gbGVnYWN5Li4uXG4gICAgY3R4LnNob3dIaWRkZW4gPSBvcHRzO1xuICB9IGVsc2UgaWYgKG9wdHMpIHtcbiAgICAvLyBnb3QgYW4gXCJvcHRpb25zXCIgb2JqZWN0XG4gICAgZXhwb3J0cy5fZXh0ZW5kKGN0eCwgb3B0cyk7XG4gIH1cbiAgLy8gc2V0IGRlZmF1bHQgb3B0aW9uc1xuICBpZiAoaXNVbmRlZmluZWQoY3R4LnNob3dIaWRkZW4pKSBjdHguc2hvd0hpZGRlbiA9IGZhbHNlO1xuICBpZiAoaXNVbmRlZmluZWQoY3R4LmRlcHRoKSkgY3R4LmRlcHRoID0gMjtcbiAgaWYgKGlzVW5kZWZpbmVkKGN0eC5jb2xvcnMpKSBjdHguY29sb3JzID0gZmFsc2U7XG4gIGlmIChpc1VuZGVmaW5lZChjdHguY3VzdG9tSW5zcGVjdCkpIGN0eC5jdXN0b21JbnNwZWN0ID0gdHJ1ZTtcbiAgaWYgKGN0eC5jb2xvcnMpIGN0eC5zdHlsaXplID0gc3R5bGl6ZVdpdGhDb2xvcjtcbiAgcmV0dXJuIGZvcm1hdFZhbHVlKGN0eCwgb2JqLCBjdHguZGVwdGgpO1xufVxuZXhwb3J0cy5pbnNwZWN0ID0gaW5zcGVjdDtcblxuXG4vLyBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0FOU0lfZXNjYXBlX2NvZGUjZ3JhcGhpY3Ncbmluc3BlY3QuY29sb3JzID0ge1xuICAnYm9sZCcgOiBbMSwgMjJdLFxuICAnaXRhbGljJyA6IFszLCAyM10sXG4gICd1bmRlcmxpbmUnIDogWzQsIDI0XSxcbiAgJ2ludmVyc2UnIDogWzcsIDI3XSxcbiAgJ3doaXRlJyA6IFszNywgMzldLFxuICAnZ3JleScgOiBbOTAsIDM5XSxcbiAgJ2JsYWNrJyA6IFszMCwgMzldLFxuICAnYmx1ZScgOiBbMzQsIDM5XSxcbiAgJ2N5YW4nIDogWzM2LCAzOV0sXG4gICdncmVlbicgOiBbMzIsIDM5XSxcbiAgJ21hZ2VudGEnIDogWzM1LCAzOV0sXG4gICdyZWQnIDogWzMxLCAzOV0sXG4gICd5ZWxsb3cnIDogWzMzLCAzOV1cbn07XG5cbi8vIERvbid0IHVzZSAnYmx1ZScgbm90IHZpc2libGUgb24gY21kLmV4ZVxuaW5zcGVjdC5zdHlsZXMgPSB7XG4gICdzcGVjaWFsJzogJ2N5YW4nLFxuICAnbnVtYmVyJzogJ3llbGxvdycsXG4gICdib29sZWFuJzogJ3llbGxvdycsXG4gICd1bmRlZmluZWQnOiAnZ3JleScsXG4gICdudWxsJzogJ2JvbGQnLFxuICAnc3RyaW5nJzogJ2dyZWVuJyxcbiAgJ2RhdGUnOiAnbWFnZW50YScsXG4gIC8vIFwibmFtZVwiOiBpbnRlbnRpb25hbGx5IG5vdCBzdHlsaW5nXG4gICdyZWdleHAnOiAncmVkJ1xufTtcblxuXG5mdW5jdGlvbiBzdHlsaXplV2l0aENvbG9yKHN0ciwgc3R5bGVUeXBlKSB7XG4gIHZhciBzdHlsZSA9IGluc3BlY3Quc3R5bGVzW3N0eWxlVHlwZV07XG5cbiAgaWYgKHN0eWxlKSB7XG4gICAgcmV0dXJuICdcXHUwMDFiWycgKyBpbnNwZWN0LmNvbG9yc1tzdHlsZV1bMF0gKyAnbScgKyBzdHIgK1xuICAgICAgICAgICAnXFx1MDAxYlsnICsgaW5zcGVjdC5jb2xvcnNbc3R5bGVdWzFdICsgJ20nO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBzdHI7XG4gIH1cbn1cblxuXG5mdW5jdGlvbiBzdHlsaXplTm9Db2xvcihzdHIsIHN0eWxlVHlwZSkge1xuICByZXR1cm4gc3RyO1xufVxuXG5cbmZ1bmN0aW9uIGFycmF5VG9IYXNoKGFycmF5KSB7XG4gIHZhciBoYXNoID0ge307XG5cbiAgYXJyYXkuZm9yRWFjaChmdW5jdGlvbih2YWwsIGlkeCkge1xuICAgIGhhc2hbdmFsXSA9IHRydWU7XG4gIH0pO1xuXG4gIHJldHVybiBoYXNoO1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdFZhbHVlKGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcykge1xuICAvLyBQcm92aWRlIGEgaG9vayBmb3IgdXNlci1zcGVjaWZpZWQgaW5zcGVjdCBmdW5jdGlvbnMuXG4gIC8vIENoZWNrIHRoYXQgdmFsdWUgaXMgYW4gb2JqZWN0IHdpdGggYW4gaW5zcGVjdCBmdW5jdGlvbiBvbiBpdFxuICBpZiAoY3R4LmN1c3RvbUluc3BlY3QgJiZcbiAgICAgIHZhbHVlICYmXG4gICAgICBpc0Z1bmN0aW9uKHZhbHVlLmluc3BlY3QpICYmXG4gICAgICAvLyBGaWx0ZXIgb3V0IHRoZSB1dGlsIG1vZHVsZSwgaXQncyBpbnNwZWN0IGZ1bmN0aW9uIGlzIHNwZWNpYWxcbiAgICAgIHZhbHVlLmluc3BlY3QgIT09IGV4cG9ydHMuaW5zcGVjdCAmJlxuICAgICAgLy8gQWxzbyBmaWx0ZXIgb3V0IGFueSBwcm90b3R5cGUgb2JqZWN0cyB1c2luZyB0aGUgY2lyY3VsYXIgY2hlY2suXG4gICAgICAhKHZhbHVlLmNvbnN0cnVjdG9yICYmIHZhbHVlLmNvbnN0cnVjdG9yLnByb3RvdHlwZSA9PT0gdmFsdWUpKSB7XG4gICAgdmFyIHJldCA9IHZhbHVlLmluc3BlY3QocmVjdXJzZVRpbWVzLCBjdHgpO1xuICAgIGlmICghaXNTdHJpbmcocmV0KSkge1xuICAgICAgcmV0ID0gZm9ybWF0VmFsdWUoY3R4LCByZXQsIHJlY3Vyc2VUaW1lcyk7XG4gICAgfVxuICAgIHJldHVybiByZXQ7XG4gIH1cblxuICAvLyBQcmltaXRpdmUgdHlwZXMgY2Fubm90IGhhdmUgcHJvcGVydGllc1xuICB2YXIgcHJpbWl0aXZlID0gZm9ybWF0UHJpbWl0aXZlKGN0eCwgdmFsdWUpO1xuICBpZiAocHJpbWl0aXZlKSB7XG4gICAgcmV0dXJuIHByaW1pdGl2ZTtcbiAgfVxuXG4gIC8vIExvb2sgdXAgdGhlIGtleXMgb2YgdGhlIG9iamVjdC5cbiAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyh2YWx1ZSk7XG4gIHZhciB2aXNpYmxlS2V5cyA9IGFycmF5VG9IYXNoKGtleXMpO1xuXG4gIGlmIChjdHguc2hvd0hpZGRlbikge1xuICAgIGtleXMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyh2YWx1ZSk7XG4gIH1cblxuICAvLyBJRSBkb2Vzbid0IG1ha2UgZXJyb3IgZmllbGRzIG5vbi1lbnVtZXJhYmxlXG4gIC8vIGh0dHA6Ly9tc2RuLm1pY3Jvc29mdC5jb20vZW4tdXMvbGlicmFyeS9pZS9kd3c1MnNidCh2PXZzLjk0KS5hc3B4XG4gIGlmIChpc0Vycm9yKHZhbHVlKVxuICAgICAgJiYgKGtleXMuaW5kZXhPZignbWVzc2FnZScpID49IDAgfHwga2V5cy5pbmRleE9mKCdkZXNjcmlwdGlvbicpID49IDApKSB7XG4gICAgcmV0dXJuIGZvcm1hdEVycm9yKHZhbHVlKTtcbiAgfVxuXG4gIC8vIFNvbWUgdHlwZSBvZiBvYmplY3Qgd2l0aG91dCBwcm9wZXJ0aWVzIGNhbiBiZSBzaG9ydGN1dHRlZC5cbiAgaWYgKGtleXMubGVuZ3RoID09PSAwKSB7XG4gICAgaWYgKGlzRnVuY3Rpb24odmFsdWUpKSB7XG4gICAgICB2YXIgbmFtZSA9IHZhbHVlLm5hbWUgPyAnOiAnICsgdmFsdWUubmFtZSA6ICcnO1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKCdbRnVuY3Rpb24nICsgbmFtZSArICddJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gICAgaWYgKGlzUmVnRXhwKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKFJlZ0V4cC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSksICdyZWdleHAnKTtcbiAgICB9XG4gICAgaWYgKGlzRGF0ZSh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZShEYXRlLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKSwgJ2RhdGUnKTtcbiAgICB9XG4gICAgaWYgKGlzRXJyb3IodmFsdWUpKSB7XG4gICAgICByZXR1cm4gZm9ybWF0RXJyb3IodmFsdWUpO1xuICAgIH1cbiAgfVxuXG4gIHZhciBiYXNlID0gJycsIGFycmF5ID0gZmFsc2UsIGJyYWNlcyA9IFsneycsICd9J107XG5cbiAgLy8gTWFrZSBBcnJheSBzYXkgdGhhdCB0aGV5IGFyZSBBcnJheVxuICBpZiAoaXNBcnJheSh2YWx1ZSkpIHtcbiAgICBhcnJheSA9IHRydWU7XG4gICAgYnJhY2VzID0gWydbJywgJ10nXTtcbiAgfVxuXG4gIC8vIE1ha2UgZnVuY3Rpb25zIHNheSB0aGF0IHRoZXkgYXJlIGZ1bmN0aW9uc1xuICBpZiAoaXNGdW5jdGlvbih2YWx1ZSkpIHtcbiAgICB2YXIgbiA9IHZhbHVlLm5hbWUgPyAnOiAnICsgdmFsdWUubmFtZSA6ICcnO1xuICAgIGJhc2UgPSAnIFtGdW5jdGlvbicgKyBuICsgJ10nO1xuICB9XG5cbiAgLy8gTWFrZSBSZWdFeHBzIHNheSB0aGF0IHRoZXkgYXJlIFJlZ0V4cHNcbiAgaWYgKGlzUmVnRXhwKHZhbHVlKSkge1xuICAgIGJhc2UgPSAnICcgKyBSZWdFeHAucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpO1xuICB9XG5cbiAgLy8gTWFrZSBkYXRlcyB3aXRoIHByb3BlcnRpZXMgZmlyc3Qgc2F5IHRoZSBkYXRlXG4gIGlmIChpc0RhdGUodmFsdWUpKSB7XG4gICAgYmFzZSA9ICcgJyArIERhdGUucHJvdG90eXBlLnRvVVRDU3RyaW5nLmNhbGwodmFsdWUpO1xuICB9XG5cbiAgLy8gTWFrZSBlcnJvciB3aXRoIG1lc3NhZ2UgZmlyc3Qgc2F5IHRoZSBlcnJvclxuICBpZiAoaXNFcnJvcih2YWx1ZSkpIHtcbiAgICBiYXNlID0gJyAnICsgZm9ybWF0RXJyb3IodmFsdWUpO1xuICB9XG5cbiAgaWYgKGtleXMubGVuZ3RoID09PSAwICYmICghYXJyYXkgfHwgdmFsdWUubGVuZ3RoID09IDApKSB7XG4gICAgcmV0dXJuIGJyYWNlc1swXSArIGJhc2UgKyBicmFjZXNbMV07XG4gIH1cblxuICBpZiAocmVjdXJzZVRpbWVzIDwgMCkge1xuICAgIGlmIChpc1JlZ0V4cCh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZShSZWdFeHAucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpLCAncmVnZXhwJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZSgnW09iamVjdF0nLCAnc3BlY2lhbCcpO1xuICAgIH1cbiAgfVxuXG4gIGN0eC5zZWVuLnB1c2godmFsdWUpO1xuXG4gIHZhciBvdXRwdXQ7XG4gIGlmIChhcnJheSkge1xuICAgIG91dHB1dCA9IGZvcm1hdEFycmF5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsIGtleXMpO1xuICB9IGVsc2Uge1xuICAgIG91dHB1dCA9IGtleXMubWFwKGZ1bmN0aW9uKGtleSkge1xuICAgICAgcmV0dXJuIGZvcm1hdFByb3BlcnR5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsIGtleSwgYXJyYXkpO1xuICAgIH0pO1xuICB9XG5cbiAgY3R4LnNlZW4ucG9wKCk7XG5cbiAgcmV0dXJuIHJlZHVjZVRvU2luZ2xlU3RyaW5nKG91dHB1dCwgYmFzZSwgYnJhY2VzKTtcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRQcmltaXRpdmUoY3R4LCB2YWx1ZSkge1xuICBpZiAoaXNVbmRlZmluZWQodmFsdWUpKVxuICAgIHJldHVybiBjdHguc3R5bGl6ZSgndW5kZWZpbmVkJywgJ3VuZGVmaW5lZCcpO1xuICBpZiAoaXNTdHJpbmcodmFsdWUpKSB7XG4gICAgdmFyIHNpbXBsZSA9ICdcXCcnICsgSlNPTi5zdHJpbmdpZnkodmFsdWUpLnJlcGxhY2UoL15cInxcIiQvZywgJycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvJy9nLCBcIlxcXFwnXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFxcXFwiL2csICdcIicpICsgJ1xcJyc7XG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKHNpbXBsZSwgJ3N0cmluZycpO1xuICB9XG4gIGlmIChpc051bWJlcih2YWx1ZSkpXG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKCcnICsgdmFsdWUsICdudW1iZXInKTtcbiAgaWYgKGlzQm9vbGVhbih2YWx1ZSkpXG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKCcnICsgdmFsdWUsICdib29sZWFuJyk7XG4gIC8vIEZvciBzb21lIHJlYXNvbiB0eXBlb2YgbnVsbCBpcyBcIm9iamVjdFwiLCBzbyBzcGVjaWFsIGNhc2UgaGVyZS5cbiAgaWYgKGlzTnVsbCh2YWx1ZSkpXG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKCdudWxsJywgJ251bGwnKTtcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRFcnJvcih2YWx1ZSkge1xuICByZXR1cm4gJ1snICsgRXJyb3IucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpICsgJ10nO1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdEFycmF5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsIGtleXMpIHtcbiAgdmFyIG91dHB1dCA9IFtdO1xuICBmb3IgKHZhciBpID0gMCwgbCA9IHZhbHVlLmxlbmd0aDsgaSA8IGw7ICsraSkge1xuICAgIGlmIChoYXNPd25Qcm9wZXJ0eSh2YWx1ZSwgU3RyaW5nKGkpKSkge1xuICAgICAgb3V0cHV0LnB1c2goZm9ybWF0UHJvcGVydHkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cyxcbiAgICAgICAgICBTdHJpbmcoaSksIHRydWUpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0cHV0LnB1c2goJycpO1xuICAgIH1cbiAgfVxuICBrZXlzLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XG4gICAgaWYgKCFrZXkubWF0Y2goL15cXGQrJC8pKSB7XG4gICAgICBvdXRwdXQucHVzaChmb3JtYXRQcm9wZXJ0eShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLFxuICAgICAgICAgIGtleSwgdHJ1ZSkpO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiBvdXRwdXQ7XG59XG5cblxuZnVuY3Rpb24gZm9ybWF0UHJvcGVydHkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cywga2V5LCBhcnJheSkge1xuICB2YXIgbmFtZSwgc3RyLCBkZXNjO1xuICBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih2YWx1ZSwga2V5KSB8fCB7IHZhbHVlOiB2YWx1ZVtrZXldIH07XG4gIGlmIChkZXNjLmdldCkge1xuICAgIGlmIChkZXNjLnNldCkge1xuICAgICAgc3RyID0gY3R4LnN0eWxpemUoJ1tHZXR0ZXIvU2V0dGVyXScsICdzcGVjaWFsJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0ciA9IGN0eC5zdHlsaXplKCdbR2V0dGVyXScsICdzcGVjaWFsJyk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGlmIChkZXNjLnNldCkge1xuICAgICAgc3RyID0gY3R4LnN0eWxpemUoJ1tTZXR0ZXJdJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gIH1cbiAgaWYgKCFoYXNPd25Qcm9wZXJ0eSh2aXNpYmxlS2V5cywga2V5KSkge1xuICAgIG5hbWUgPSAnWycgKyBrZXkgKyAnXSc7XG4gIH1cbiAgaWYgKCFzdHIpIHtcbiAgICBpZiAoY3R4LnNlZW4uaW5kZXhPZihkZXNjLnZhbHVlKSA8IDApIHtcbiAgICAgIGlmIChpc051bGwocmVjdXJzZVRpbWVzKSkge1xuICAgICAgICBzdHIgPSBmb3JtYXRWYWx1ZShjdHgsIGRlc2MudmFsdWUsIG51bGwpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc3RyID0gZm9ybWF0VmFsdWUoY3R4LCBkZXNjLnZhbHVlLCByZWN1cnNlVGltZXMgLSAxKTtcbiAgICAgIH1cbiAgICAgIGlmIChzdHIuaW5kZXhPZignXFxuJykgPiAtMSkge1xuICAgICAgICBpZiAoYXJyYXkpIHtcbiAgICAgICAgICBzdHIgPSBzdHIuc3BsaXQoJ1xcbicpLm1hcChmdW5jdGlvbihsaW5lKSB7XG4gICAgICAgICAgICByZXR1cm4gJyAgJyArIGxpbmU7XG4gICAgICAgICAgfSkuam9pbignXFxuJykuc3Vic3RyKDIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHN0ciA9ICdcXG4nICsgc3RyLnNwbGl0KCdcXG4nKS5tYXAoZnVuY3Rpb24obGluZSkge1xuICAgICAgICAgICAgcmV0dXJuICcgICAnICsgbGluZTtcbiAgICAgICAgICB9KS5qb2luKCdcXG4nKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBzdHIgPSBjdHguc3R5bGl6ZSgnW0NpcmN1bGFyXScsICdzcGVjaWFsJyk7XG4gICAgfVxuICB9XG4gIGlmIChpc1VuZGVmaW5lZChuYW1lKSkge1xuICAgIGlmIChhcnJheSAmJiBrZXkubWF0Y2goL15cXGQrJC8pKSB7XG4gICAgICByZXR1cm4gc3RyO1xuICAgIH1cbiAgICBuYW1lID0gSlNPTi5zdHJpbmdpZnkoJycgKyBrZXkpO1xuICAgIGlmIChuYW1lLm1hdGNoKC9eXCIoW2EtekEtWl9dW2EtekEtWl8wLTldKilcIiQvKSkge1xuICAgICAgbmFtZSA9IG5hbWUuc3Vic3RyKDEsIG5hbWUubGVuZ3RoIC0gMik7XG4gICAgICBuYW1lID0gY3R4LnN0eWxpemUobmFtZSwgJ25hbWUnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbmFtZSA9IG5hbWUucmVwbGFjZSgvJy9nLCBcIlxcXFwnXCIpXG4gICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXFxcXCIvZywgJ1wiJylcbiAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLyheXCJ8XCIkKS9nLCBcIidcIik7XG4gICAgICBuYW1lID0gY3R4LnN0eWxpemUobmFtZSwgJ3N0cmluZycpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBuYW1lICsgJzogJyArIHN0cjtcbn1cblxuXG5mdW5jdGlvbiByZWR1Y2VUb1NpbmdsZVN0cmluZyhvdXRwdXQsIGJhc2UsIGJyYWNlcykge1xuICB2YXIgbnVtTGluZXNFc3QgPSAwO1xuICB2YXIgbGVuZ3RoID0gb3V0cHV0LnJlZHVjZShmdW5jdGlvbihwcmV2LCBjdXIpIHtcbiAgICBudW1MaW5lc0VzdCsrO1xuICAgIGlmIChjdXIuaW5kZXhPZignXFxuJykgPj0gMCkgbnVtTGluZXNFc3QrKztcbiAgICByZXR1cm4gcHJldiArIGN1ci5yZXBsYWNlKC9cXHUwMDFiXFxbXFxkXFxkP20vZywgJycpLmxlbmd0aCArIDE7XG4gIH0sIDApO1xuXG4gIGlmIChsZW5ndGggPiA2MCkge1xuICAgIHJldHVybiBicmFjZXNbMF0gK1xuICAgICAgICAgICAoYmFzZSA9PT0gJycgPyAnJyA6IGJhc2UgKyAnXFxuICcpICtcbiAgICAgICAgICAgJyAnICtcbiAgICAgICAgICAgb3V0cHV0LmpvaW4oJyxcXG4gICcpICtcbiAgICAgICAgICAgJyAnICtcbiAgICAgICAgICAgYnJhY2VzWzFdO1xuICB9XG5cbiAgcmV0dXJuIGJyYWNlc1swXSArIGJhc2UgKyAnICcgKyBvdXRwdXQuam9pbignLCAnKSArICcgJyArIGJyYWNlc1sxXTtcbn1cblxuXG4vLyBOT1RFOiBUaGVzZSB0eXBlIGNoZWNraW5nIGZ1bmN0aW9ucyBpbnRlbnRpb25hbGx5IGRvbid0IHVzZSBgaW5zdGFuY2VvZmBcbi8vIGJlY2F1c2UgaXQgaXMgZnJhZ2lsZSBhbmQgY2FuIGJlIGVhc2lseSBmYWtlZCB3aXRoIGBPYmplY3QuY3JlYXRlKClgLlxuZnVuY3Rpb24gaXNBcnJheShhcikge1xuICByZXR1cm4gQXJyYXkuaXNBcnJheShhcik7XG59XG5leHBvcnRzLmlzQXJyYXkgPSBpc0FycmF5O1xuXG5mdW5jdGlvbiBpc0Jvb2xlYW4oYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnYm9vbGVhbic7XG59XG5leHBvcnRzLmlzQm9vbGVhbiA9IGlzQm9vbGVhbjtcblxuZnVuY3Rpb24gaXNOdWxsKGFyZykge1xuICByZXR1cm4gYXJnID09PSBudWxsO1xufVxuZXhwb3J0cy5pc051bGwgPSBpc051bGw7XG5cbmZ1bmN0aW9uIGlzTnVsbE9yVW5kZWZpbmVkKGFyZykge1xuICByZXR1cm4gYXJnID09IG51bGw7XG59XG5leHBvcnRzLmlzTnVsbE9yVW5kZWZpbmVkID0gaXNOdWxsT3JVbmRlZmluZWQ7XG5cbmZ1bmN0aW9uIGlzTnVtYmVyKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ251bWJlcic7XG59XG5leHBvcnRzLmlzTnVtYmVyID0gaXNOdW1iZXI7XG5cbmZ1bmN0aW9uIGlzU3RyaW5nKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ3N0cmluZyc7XG59XG5leHBvcnRzLmlzU3RyaW5nID0gaXNTdHJpbmc7XG5cbmZ1bmN0aW9uIGlzU3ltYm9sKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ3N5bWJvbCc7XG59XG5leHBvcnRzLmlzU3ltYm9sID0gaXNTeW1ib2w7XG5cbmZ1bmN0aW9uIGlzVW5kZWZpbmVkKGFyZykge1xuICByZXR1cm4gYXJnID09PSB2b2lkIDA7XG59XG5leHBvcnRzLmlzVW5kZWZpbmVkID0gaXNVbmRlZmluZWQ7XG5cbmZ1bmN0aW9uIGlzUmVnRXhwKHJlKSB7XG4gIHJldHVybiBpc09iamVjdChyZSkgJiYgb2JqZWN0VG9TdHJpbmcocmUpID09PSAnW29iamVjdCBSZWdFeHBdJztcbn1cbmV4cG9ydHMuaXNSZWdFeHAgPSBpc1JlZ0V4cDtcblxuZnVuY3Rpb24gaXNPYmplY3QoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnb2JqZWN0JyAmJiBhcmcgIT09IG51bGw7XG59XG5leHBvcnRzLmlzT2JqZWN0ID0gaXNPYmplY3Q7XG5cbmZ1bmN0aW9uIGlzRGF0ZShkKSB7XG4gIHJldHVybiBpc09iamVjdChkKSAmJiBvYmplY3RUb1N0cmluZyhkKSA9PT0gJ1tvYmplY3QgRGF0ZV0nO1xufVxuZXhwb3J0cy5pc0RhdGUgPSBpc0RhdGU7XG5cbmZ1bmN0aW9uIGlzRXJyb3IoZSkge1xuICByZXR1cm4gaXNPYmplY3QoZSkgJiZcbiAgICAgIChvYmplY3RUb1N0cmluZyhlKSA9PT0gJ1tvYmplY3QgRXJyb3JdJyB8fCBlIGluc3RhbmNlb2YgRXJyb3IpO1xufVxuZXhwb3J0cy5pc0Vycm9yID0gaXNFcnJvcjtcblxuZnVuY3Rpb24gaXNGdW5jdGlvbihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdmdW5jdGlvbic7XG59XG5leHBvcnRzLmlzRnVuY3Rpb24gPSBpc0Z1bmN0aW9uO1xuXG5mdW5jdGlvbiBpc1ByaW1pdGl2ZShhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PT0gbnVsbCB8fFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ2Jvb2xlYW4nIHx8XG4gICAgICAgICB0eXBlb2YgYXJnID09PSAnbnVtYmVyJyB8fFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ3N0cmluZycgfHxcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICdzeW1ib2wnIHx8ICAvLyBFUzYgc3ltYm9sXG4gICAgICAgICB0eXBlb2YgYXJnID09PSAndW5kZWZpbmVkJztcbn1cbmV4cG9ydHMuaXNQcmltaXRpdmUgPSBpc1ByaW1pdGl2ZTtcblxuZXhwb3J0cy5pc0J1ZmZlciA9IHJlcXVpcmUoJy4vc3VwcG9ydC9pc0J1ZmZlcicpO1xuXG5mdW5jdGlvbiBvYmplY3RUb1N0cmluZyhvKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwobyk7XG59XG5cblxuZnVuY3Rpb24gcGFkKG4pIHtcbiAgcmV0dXJuIG4gPCAxMCA/ICcwJyArIG4udG9TdHJpbmcoMTApIDogbi50b1N0cmluZygxMCk7XG59XG5cblxudmFyIG1vbnRocyA9IFsnSmFuJywgJ0ZlYicsICdNYXInLCAnQXByJywgJ01heScsICdKdW4nLCAnSnVsJywgJ0F1ZycsICdTZXAnLFxuICAgICAgICAgICAgICAnT2N0JywgJ05vdicsICdEZWMnXTtcblxuLy8gMjYgRmViIDE2OjE5OjM0XG5mdW5jdGlvbiB0aW1lc3RhbXAoKSB7XG4gIHZhciBkID0gbmV3IERhdGUoKTtcbiAgdmFyIHRpbWUgPSBbcGFkKGQuZ2V0SG91cnMoKSksXG4gICAgICAgICAgICAgIHBhZChkLmdldE1pbnV0ZXMoKSksXG4gICAgICAgICAgICAgIHBhZChkLmdldFNlY29uZHMoKSldLmpvaW4oJzonKTtcbiAgcmV0dXJuIFtkLmdldERhdGUoKSwgbW9udGhzW2QuZ2V0TW9udGgoKV0sIHRpbWVdLmpvaW4oJyAnKTtcbn1cblxuXG4vLyBsb2cgaXMganVzdCBhIHRoaW4gd3JhcHBlciB0byBjb25zb2xlLmxvZyB0aGF0IHByZXBlbmRzIGEgdGltZXN0YW1wXG5leHBvcnRzLmxvZyA9IGZ1bmN0aW9uKCkge1xuICBjb25zb2xlLmxvZygnJXMgLSAlcycsIHRpbWVzdGFtcCgpLCBleHBvcnRzLmZvcm1hdC5hcHBseShleHBvcnRzLCBhcmd1bWVudHMpKTtcbn07XG5cblxuLyoqXG4gKiBJbmhlcml0IHRoZSBwcm90b3R5cGUgbWV0aG9kcyBmcm9tIG9uZSBjb25zdHJ1Y3RvciBpbnRvIGFub3RoZXIuXG4gKlxuICogVGhlIEZ1bmN0aW9uLnByb3RvdHlwZS5pbmhlcml0cyBmcm9tIGxhbmcuanMgcmV3cml0dGVuIGFzIGEgc3RhbmRhbG9uZVxuICogZnVuY3Rpb24gKG5vdCBvbiBGdW5jdGlvbi5wcm90b3R5cGUpLiBOT1RFOiBJZiB0aGlzIGZpbGUgaXMgdG8gYmUgbG9hZGVkXG4gKiBkdXJpbmcgYm9vdHN0cmFwcGluZyB0aGlzIGZ1bmN0aW9uIG5lZWRzIHRvIGJlIHJld3JpdHRlbiB1c2luZyBzb21lIG5hdGl2ZVxuICogZnVuY3Rpb25zIGFzIHByb3RvdHlwZSBzZXR1cCB1c2luZyBub3JtYWwgSmF2YVNjcmlwdCBkb2VzIG5vdCB3b3JrIGFzXG4gKiBleHBlY3RlZCBkdXJpbmcgYm9vdHN0cmFwcGluZyAoc2VlIG1pcnJvci5qcyBpbiByMTE0OTAzKS5cbiAqXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBjdG9yIENvbnN0cnVjdG9yIGZ1bmN0aW9uIHdoaWNoIG5lZWRzIHRvIGluaGVyaXQgdGhlXG4gKiAgICAgcHJvdG90eXBlLlxuICogQHBhcmFtIHtmdW5jdGlvbn0gc3VwZXJDdG9yIENvbnN0cnVjdG9yIGZ1bmN0aW9uIHRvIGluaGVyaXQgcHJvdG90eXBlIGZyb20uXG4gKi9cbmV4cG9ydHMuaW5oZXJpdHMgPSByZXF1aXJlKCdpbmhlcml0cycpO1xuXG5leHBvcnRzLl9leHRlbmQgPSBmdW5jdGlvbihvcmlnaW4sIGFkZCkge1xuICAvLyBEb24ndCBkbyBhbnl0aGluZyBpZiBhZGQgaXNuJ3QgYW4gb2JqZWN0XG4gIGlmICghYWRkIHx8ICFpc09iamVjdChhZGQpKSByZXR1cm4gb3JpZ2luO1xuXG4gIHZhciBrZXlzID0gT2JqZWN0LmtleXMoYWRkKTtcbiAgdmFyIGkgPSBrZXlzLmxlbmd0aDtcbiAgd2hpbGUgKGktLSkge1xuICAgIG9yaWdpbltrZXlzW2ldXSA9IGFkZFtrZXlzW2ldXTtcbiAgfVxuICByZXR1cm4gb3JpZ2luO1xufTtcblxuZnVuY3Rpb24gaGFzT3duUHJvcGVydHkob2JqLCBwcm9wKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKTtcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9pbmNsdWRlcycpO1xuIiwidmFyIGFycmF5RWFjaCA9IHJlcXVpcmUoJy4uL2ludGVybmFsL2FycmF5RWFjaCcpLFxuICAgIGJhc2VFYWNoID0gcmVxdWlyZSgnLi4vaW50ZXJuYWwvYmFzZUVhY2gnKSxcbiAgICBjcmVhdGVGb3JFYWNoID0gcmVxdWlyZSgnLi4vaW50ZXJuYWwvY3JlYXRlRm9yRWFjaCcpO1xuXG4vKipcbiAqIEl0ZXJhdGVzIG92ZXIgZWxlbWVudHMgb2YgYGNvbGxlY3Rpb25gIGludm9raW5nIGBpdGVyYXRlZWAgZm9yIGVhY2ggZWxlbWVudC5cbiAqIFRoZSBgaXRlcmF0ZWVgIGlzIGJvdW5kIHRvIGB0aGlzQXJnYCBhbmQgaW52b2tlZCB3aXRoIHRocmVlIGFyZ3VtZW50czpcbiAqICh2YWx1ZSwgaW5kZXh8a2V5LCBjb2xsZWN0aW9uKS4gSXRlcmF0ZWUgZnVuY3Rpb25zIG1heSBleGl0IGl0ZXJhdGlvbiBlYXJseVxuICogYnkgZXhwbGljaXRseSByZXR1cm5pbmcgYGZhbHNlYC5cbiAqXG4gKiAqKk5vdGU6KiogQXMgd2l0aCBvdGhlciBcIkNvbGxlY3Rpb25zXCIgbWV0aG9kcywgb2JqZWN0cyB3aXRoIGEgXCJsZW5ndGhcIiBwcm9wZXJ0eVxuICogYXJlIGl0ZXJhdGVkIGxpa2UgYXJyYXlzLiBUbyBhdm9pZCB0aGlzIGJlaGF2aW9yIGBfLmZvckluYCBvciBgXy5mb3JPd25gXG4gKiBtYXkgYmUgdXNlZCBmb3Igb2JqZWN0IGl0ZXJhdGlvbi5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQGFsaWFzIGVhY2hcbiAqIEBjYXRlZ29yeSBDb2xsZWN0aW9uXG4gKiBAcGFyYW0ge0FycmF5fE9iamVjdHxzdHJpbmd9IGNvbGxlY3Rpb24gVGhlIGNvbGxlY3Rpb24gdG8gaXRlcmF0ZSBvdmVyLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gW2l0ZXJhdGVlPV8uaWRlbnRpdHldIFRoZSBmdW5jdGlvbiBpbnZva2VkIHBlciBpdGVyYXRpb24uXG4gKiBAcGFyYW0geyp9IFt0aGlzQXJnXSBUaGUgYHRoaXNgIGJpbmRpbmcgb2YgYGl0ZXJhdGVlYC5cbiAqIEByZXR1cm5zIHtBcnJheXxPYmplY3R8c3RyaW5nfSBSZXR1cm5zIGBjb2xsZWN0aW9uYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXyhbMSwgMl0pLmZvckVhY2goZnVuY3Rpb24obikge1xuICogICBjb25zb2xlLmxvZyhuKTtcbiAqIH0pLnZhbHVlKCk7XG4gKiAvLyA9PiBsb2dzIGVhY2ggdmFsdWUgZnJvbSBsZWZ0IHRvIHJpZ2h0IGFuZCByZXR1cm5zIHRoZSBhcnJheVxuICpcbiAqIF8uZm9yRWFjaCh7ICdhJzogMSwgJ2InOiAyIH0sIGZ1bmN0aW9uKG4sIGtleSkge1xuICogICBjb25zb2xlLmxvZyhuLCBrZXkpO1xuICogfSk7XG4gKiAvLyA9PiBsb2dzIGVhY2ggdmFsdWUta2V5IHBhaXIgYW5kIHJldHVybnMgdGhlIG9iamVjdCAoaXRlcmF0aW9uIG9yZGVyIGlzIG5vdCBndWFyYW50ZWVkKVxuICovXG52YXIgZm9yRWFjaCA9IGNyZWF0ZUZvckVhY2goYXJyYXlFYWNoLCBiYXNlRWFjaCk7XG5cbm1vZHVsZS5leHBvcnRzID0gZm9yRWFjaDtcbiIsInZhciBiYXNlSW5kZXhPZiA9IHJlcXVpcmUoJy4uL2ludGVybmFsL2Jhc2VJbmRleE9mJyksXG4gICAgZ2V0TGVuZ3RoID0gcmVxdWlyZSgnLi4vaW50ZXJuYWwvZ2V0TGVuZ3RoJyksXG4gICAgaXNBcnJheSA9IHJlcXVpcmUoJy4uL2xhbmcvaXNBcnJheScpLFxuICAgIGlzSXRlcmF0ZWVDYWxsID0gcmVxdWlyZSgnLi4vaW50ZXJuYWwvaXNJdGVyYXRlZUNhbGwnKSxcbiAgICBpc0xlbmd0aCA9IHJlcXVpcmUoJy4uL2ludGVybmFsL2lzTGVuZ3RoJyksXG4gICAgaXNTdHJpbmcgPSByZXF1aXJlKCcuLi9sYW5nL2lzU3RyaW5nJyksXG4gICAgdmFsdWVzID0gcmVxdWlyZSgnLi4vb2JqZWN0L3ZhbHVlcycpO1xuXG4vKiBOYXRpdmUgbWV0aG9kIHJlZmVyZW5jZXMgZm9yIHRob3NlIHdpdGggdGhlIHNhbWUgbmFtZSBhcyBvdGhlciBgbG9kYXNoYCBtZXRob2RzLiAqL1xudmFyIG5hdGl2ZU1heCA9IE1hdGgubWF4O1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGluIGBjb2xsZWN0aW9uYCB1c2luZ1xuICogW2BTYW1lVmFsdWVaZXJvYF0oaHR0cHM6Ly9wZW9wbGUubW96aWxsYS5vcmcvfmpvcmVuZG9yZmYvZXM2LWRyYWZ0Lmh0bWwjc2VjLXNhbWV2YWx1ZXplcm8pXG4gKiBmb3IgZXF1YWxpdHkgY29tcGFyaXNvbnMuIElmIGBmcm9tSW5kZXhgIGlzIG5lZ2F0aXZlLCBpdCBpcyB1c2VkIGFzIHRoZSBvZmZzZXRcbiAqIGZyb20gdGhlIGVuZCBvZiBgY29sbGVjdGlvbmAuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBhbGlhcyBjb250YWlucywgaW5jbHVkZVxuICogQGNhdGVnb3J5IENvbGxlY3Rpb25cbiAqIEBwYXJhbSB7QXJyYXl8T2JqZWN0fHN0cmluZ30gY29sbGVjdGlvbiBUaGUgY29sbGVjdGlvbiB0byBzZWFyY2guXG4gKiBAcGFyYW0geyp9IHRhcmdldCBUaGUgdmFsdWUgdG8gc2VhcmNoIGZvci5cbiAqIEBwYXJhbSB7bnVtYmVyfSBbZnJvbUluZGV4PTBdIFRoZSBpbmRleCB0byBzZWFyY2ggZnJvbS5cbiAqIEBwYXJhbS0ge09iamVjdH0gW2d1YXJkXSBFbmFibGVzIHVzZSBhcyBhIGNhbGxiYWNrIGZvciBmdW5jdGlvbnMgbGlrZSBgXy5yZWR1Y2VgLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGEgbWF0Y2hpbmcgZWxlbWVudCBpcyBmb3VuZCwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmluY2x1ZGVzKFsxLCAyLCAzXSwgMSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pbmNsdWRlcyhbMSwgMiwgM10sIDEsIDIpO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmluY2x1ZGVzKHsgJ3VzZXInOiAnZnJlZCcsICdhZ2UnOiA0MCB9LCAnZnJlZCcpO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaW5jbHVkZXMoJ3BlYmJsZXMnLCAnZWInKTtcbiAqIC8vID0+IHRydWVcbiAqL1xuZnVuY3Rpb24gaW5jbHVkZXMoY29sbGVjdGlvbiwgdGFyZ2V0LCBmcm9tSW5kZXgsIGd1YXJkKSB7XG4gIHZhciBsZW5ndGggPSBjb2xsZWN0aW9uID8gZ2V0TGVuZ3RoKGNvbGxlY3Rpb24pIDogMDtcbiAgaWYgKCFpc0xlbmd0aChsZW5ndGgpKSB7XG4gICAgY29sbGVjdGlvbiA9IHZhbHVlcyhjb2xsZWN0aW9uKTtcbiAgICBsZW5ndGggPSBjb2xsZWN0aW9uLmxlbmd0aDtcbiAgfVxuICBpZiAoIWxlbmd0aCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBpZiAodHlwZW9mIGZyb21JbmRleCAhPSAnbnVtYmVyJyB8fCAoZ3VhcmQgJiYgaXNJdGVyYXRlZUNhbGwodGFyZ2V0LCBmcm9tSW5kZXgsIGd1YXJkKSkpIHtcbiAgICBmcm9tSW5kZXggPSAwO1xuICB9IGVsc2Uge1xuICAgIGZyb21JbmRleCA9IGZyb21JbmRleCA8IDAgPyBuYXRpdmVNYXgobGVuZ3RoICsgZnJvbUluZGV4LCAwKSA6IChmcm9tSW5kZXggfHwgMCk7XG4gIH1cbiAgcmV0dXJuICh0eXBlb2YgY29sbGVjdGlvbiA9PSAnc3RyaW5nJyB8fCAhaXNBcnJheShjb2xsZWN0aW9uKSAmJiBpc1N0cmluZyhjb2xsZWN0aW9uKSlcbiAgICA/IChmcm9tSW5kZXggPCBsZW5ndGggJiYgY29sbGVjdGlvbi5pbmRleE9mKHRhcmdldCwgZnJvbUluZGV4KSA+IC0xKVxuICAgIDogKGJhc2VJbmRleE9mKGNvbGxlY3Rpb24sIHRhcmdldCwgZnJvbUluZGV4KSA+IC0xKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpbmNsdWRlcztcbiIsIi8qKiBVc2VkIGFzIHRoZSBgVHlwZUVycm9yYCBtZXNzYWdlIGZvciBcIkZ1bmN0aW9uc1wiIG1ldGhvZHMuICovXG52YXIgRlVOQ19FUlJPUl9URVhUID0gJ0V4cGVjdGVkIGEgZnVuY3Rpb24nO1xuXG4vKiBOYXRpdmUgbWV0aG9kIHJlZmVyZW5jZXMgZm9yIHRob3NlIHdpdGggdGhlIHNhbWUgbmFtZSBhcyBvdGhlciBgbG9kYXNoYCBtZXRob2RzLiAqL1xudmFyIG5hdGl2ZU1heCA9IE1hdGgubWF4O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBmdW5jdGlvbiB0aGF0IGludm9rZXMgYGZ1bmNgIHdpdGggdGhlIGB0aGlzYCBiaW5kaW5nIG9mIHRoZVxuICogY3JlYXRlZCBmdW5jdGlvbiBhbmQgYXJndW1lbnRzIGZyb20gYHN0YXJ0YCBhbmQgYmV5b25kIHByb3ZpZGVkIGFzIGFuIGFycmF5LlxuICpcbiAqICoqTm90ZToqKiBUaGlzIG1ldGhvZCBpcyBiYXNlZCBvbiB0aGUgW3Jlc3QgcGFyYW1ldGVyXShodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9GdW5jdGlvbnMvcmVzdF9wYXJhbWV0ZXJzKS5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQGNhdGVnb3J5IEZ1bmN0aW9uXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byBhcHBseSBhIHJlc3QgcGFyYW1ldGVyIHRvLlxuICogQHBhcmFtIHtudW1iZXJ9IFtzdGFydD1mdW5jLmxlbmd0aC0xXSBUaGUgc3RhcnQgcG9zaXRpb24gb2YgdGhlIHJlc3QgcGFyYW1ldGVyLlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgZnVuY3Rpb24uXG4gKiBAZXhhbXBsZVxuICpcbiAqIHZhciBzYXkgPSBfLnJlc3RQYXJhbShmdW5jdGlvbih3aGF0LCBuYW1lcykge1xuICogICByZXR1cm4gd2hhdCArICcgJyArIF8uaW5pdGlhbChuYW1lcykuam9pbignLCAnKSArXG4gKiAgICAgKF8uc2l6ZShuYW1lcykgPiAxID8gJywgJiAnIDogJycpICsgXy5sYXN0KG5hbWVzKTtcbiAqIH0pO1xuICpcbiAqIHNheSgnaGVsbG8nLCAnZnJlZCcsICdiYXJuZXknLCAncGViYmxlcycpO1xuICogLy8gPT4gJ2hlbGxvIGZyZWQsIGJhcm5leSwgJiBwZWJibGVzJ1xuICovXG5mdW5jdGlvbiByZXN0UGFyYW0oZnVuYywgc3RhcnQpIHtcbiAgaWYgKHR5cGVvZiBmdW5jICE9ICdmdW5jdGlvbicpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKEZVTkNfRVJST1JfVEVYVCk7XG4gIH1cbiAgc3RhcnQgPSBuYXRpdmVNYXgoc3RhcnQgPT09IHVuZGVmaW5lZCA/IChmdW5jLmxlbmd0aCAtIDEpIDogKCtzdGFydCB8fCAwKSwgMCk7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB2YXIgYXJncyA9IGFyZ3VtZW50cyxcbiAgICAgICAgaW5kZXggPSAtMSxcbiAgICAgICAgbGVuZ3RoID0gbmF0aXZlTWF4KGFyZ3MubGVuZ3RoIC0gc3RhcnQsIDApLFxuICAgICAgICByZXN0ID0gQXJyYXkobGVuZ3RoKTtcblxuICAgIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgICByZXN0W2luZGV4XSA9IGFyZ3Nbc3RhcnQgKyBpbmRleF07XG4gICAgfVxuICAgIHN3aXRjaCAoc3RhcnQpIHtcbiAgICAgIGNhc2UgMDogcmV0dXJuIGZ1bmMuY2FsbCh0aGlzLCByZXN0KTtcbiAgICAgIGNhc2UgMTogcmV0dXJuIGZ1bmMuY2FsbCh0aGlzLCBhcmdzWzBdLCByZXN0KTtcbiAgICAgIGNhc2UgMjogcmV0dXJuIGZ1bmMuY2FsbCh0aGlzLCBhcmdzWzBdLCBhcmdzWzFdLCByZXN0KTtcbiAgICB9XG4gICAgdmFyIG90aGVyQXJncyA9IEFycmF5KHN0YXJ0ICsgMSk7XG4gICAgaW5kZXggPSAtMTtcbiAgICB3aGlsZSAoKytpbmRleCA8IHN0YXJ0KSB7XG4gICAgICBvdGhlckFyZ3NbaW5kZXhdID0gYXJnc1tpbmRleF07XG4gICAgfVxuICAgIG90aGVyQXJnc1tzdGFydF0gPSByZXN0O1xuICAgIHJldHVybiBmdW5jLmFwcGx5KHRoaXMsIG90aGVyQXJncyk7XG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gcmVzdFBhcmFtO1xuIiwiLyoqXG4gKiBDb3BpZXMgdGhlIHZhbHVlcyBvZiBgc291cmNlYCB0byBgYXJyYXlgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0FycmF5fSBzb3VyY2UgVGhlIGFycmF5IHRvIGNvcHkgdmFsdWVzIGZyb20uXG4gKiBAcGFyYW0ge0FycmF5fSBbYXJyYXk9W11dIFRoZSBhcnJheSB0byBjb3B5IHZhbHVlcyB0by5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyBgYXJyYXlgLlxuICovXG5mdW5jdGlvbiBhcnJheUNvcHkoc291cmNlLCBhcnJheSkge1xuICB2YXIgaW5kZXggPSAtMSxcbiAgICAgIGxlbmd0aCA9IHNvdXJjZS5sZW5ndGg7XG5cbiAgYXJyYXkgfHwgKGFycmF5ID0gQXJyYXkobGVuZ3RoKSk7XG4gIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgYXJyYXlbaW5kZXhdID0gc291cmNlW2luZGV4XTtcbiAgfVxuICByZXR1cm4gYXJyYXk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYXJyYXlDb3B5O1xuIiwiLyoqXG4gKiBBIHNwZWNpYWxpemVkIHZlcnNpb24gb2YgYF8uZm9yRWFjaGAgZm9yIGFycmF5cyB3aXRob3V0IHN1cHBvcnQgZm9yIGNhbGxiYWNrXG4gKiBzaG9ydGhhbmRzIGFuZCBgdGhpc2AgYmluZGluZy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtBcnJheX0gYXJyYXkgVGhlIGFycmF5IHRvIGl0ZXJhdGUgb3Zlci5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGl0ZXJhdGVlIFRoZSBmdW5jdGlvbiBpbnZva2VkIHBlciBpdGVyYXRpb24uXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgYGFycmF5YC5cbiAqL1xuZnVuY3Rpb24gYXJyYXlFYWNoKGFycmF5LCBpdGVyYXRlZSkge1xuICB2YXIgaW5kZXggPSAtMSxcbiAgICAgIGxlbmd0aCA9IGFycmF5Lmxlbmd0aDtcblxuICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgIGlmIChpdGVyYXRlZShhcnJheVtpbmRleF0sIGluZGV4LCBhcnJheSkgPT09IGZhbHNlKSB7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGFycmF5O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGFycmF5RWFjaDtcbiIsIi8qKlxuICogQ29waWVzIHByb3BlcnRpZXMgb2YgYHNvdXJjZWAgdG8gYG9iamVjdGAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBzb3VyY2UgVGhlIG9iamVjdCB0byBjb3B5IHByb3BlcnRpZXMgZnJvbS5cbiAqIEBwYXJhbSB7QXJyYXl9IHByb3BzIFRoZSBwcm9wZXJ0eSBuYW1lcyB0byBjb3B5LlxuICogQHBhcmFtIHtPYmplY3R9IFtvYmplY3Q9e31dIFRoZSBvYmplY3QgdG8gY29weSBwcm9wZXJ0aWVzIHRvLlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyBgb2JqZWN0YC5cbiAqL1xuZnVuY3Rpb24gYmFzZUNvcHkoc291cmNlLCBwcm9wcywgb2JqZWN0KSB7XG4gIG9iamVjdCB8fCAob2JqZWN0ID0ge30pO1xuXG4gIHZhciBpbmRleCA9IC0xLFxuICAgICAgbGVuZ3RoID0gcHJvcHMubGVuZ3RoO1xuXG4gIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgdmFyIGtleSA9IHByb3BzW2luZGV4XTtcbiAgICBvYmplY3Rba2V5XSA9IHNvdXJjZVtrZXldO1xuICB9XG4gIHJldHVybiBvYmplY3Q7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYmFzZUNvcHk7XG4iLCJ2YXIgYmFzZUZvck93biA9IHJlcXVpcmUoJy4vYmFzZUZvck93bicpLFxuICAgIGNyZWF0ZUJhc2VFYWNoID0gcmVxdWlyZSgnLi9jcmVhdGVCYXNlRWFjaCcpO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLmZvckVhY2hgIHdpdGhvdXQgc3VwcG9ydCBmb3IgY2FsbGJhY2tcbiAqIHNob3J0aGFuZHMgYW5kIGB0aGlzYCBiaW5kaW5nLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0FycmF5fE9iamVjdHxzdHJpbmd9IGNvbGxlY3Rpb24gVGhlIGNvbGxlY3Rpb24gdG8gaXRlcmF0ZSBvdmVyLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gaXRlcmF0ZWUgVGhlIGZ1bmN0aW9uIGludm9rZWQgcGVyIGl0ZXJhdGlvbi5cbiAqIEByZXR1cm5zIHtBcnJheXxPYmplY3R8c3RyaW5nfSBSZXR1cm5zIGBjb2xsZWN0aW9uYC5cbiAqL1xudmFyIGJhc2VFYWNoID0gY3JlYXRlQmFzZUVhY2goYmFzZUZvck93bik7XG5cbm1vZHVsZS5leHBvcnRzID0gYmFzZUVhY2g7XG4iLCJ2YXIgY3JlYXRlQmFzZUZvciA9IHJlcXVpcmUoJy4vY3JlYXRlQmFzZUZvcicpO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBiYXNlRm9ySW5gIGFuZCBgYmFzZUZvck93bmAgd2hpY2ggaXRlcmF0ZXNcbiAqIG92ZXIgYG9iamVjdGAgcHJvcGVydGllcyByZXR1cm5lZCBieSBga2V5c0Z1bmNgIGludm9raW5nIGBpdGVyYXRlZWAgZm9yXG4gKiBlYWNoIHByb3BlcnR5LiBJdGVyYXRlZSBmdW5jdGlvbnMgbWF5IGV4aXQgaXRlcmF0aW9uIGVhcmx5IGJ5IGV4cGxpY2l0bHlcbiAqIHJldHVybmluZyBgZmFsc2VgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gaXRlcmF0ZSBvdmVyLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gaXRlcmF0ZWUgVGhlIGZ1bmN0aW9uIGludm9rZWQgcGVyIGl0ZXJhdGlvbi5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGtleXNGdW5jIFRoZSBmdW5jdGlvbiB0byBnZXQgdGhlIGtleXMgb2YgYG9iamVjdGAuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIGBvYmplY3RgLlxuICovXG52YXIgYmFzZUZvciA9IGNyZWF0ZUJhc2VGb3IoKTtcblxubW9kdWxlLmV4cG9ydHMgPSBiYXNlRm9yO1xuIiwidmFyIGJhc2VGb3IgPSByZXF1aXJlKCcuL2Jhc2VGb3InKSxcbiAgICBrZXlzSW4gPSByZXF1aXJlKCcuLi9vYmplY3Qva2V5c0luJyk7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8uZm9ySW5gIHdpdGhvdXQgc3VwcG9ydCBmb3IgY2FsbGJhY2tcbiAqIHNob3J0aGFuZHMgYW5kIGB0aGlzYCBiaW5kaW5nLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gaXRlcmF0ZSBvdmVyLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gaXRlcmF0ZWUgVGhlIGZ1bmN0aW9uIGludm9rZWQgcGVyIGl0ZXJhdGlvbi5cbiAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgYG9iamVjdGAuXG4gKi9cbmZ1bmN0aW9uIGJhc2VGb3JJbihvYmplY3QsIGl0ZXJhdGVlKSB7XG4gIHJldHVybiBiYXNlRm9yKG9iamVjdCwgaXRlcmF0ZWUsIGtleXNJbik7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYmFzZUZvckluO1xuIiwidmFyIGJhc2VGb3IgPSByZXF1aXJlKCcuL2Jhc2VGb3InKSxcbiAgICBrZXlzID0gcmVxdWlyZSgnLi4vb2JqZWN0L2tleXMnKTtcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5mb3JPd25gIHdpdGhvdXQgc3VwcG9ydCBmb3IgY2FsbGJhY2tcbiAqIHNob3J0aGFuZHMgYW5kIGB0aGlzYCBiaW5kaW5nLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gaXRlcmF0ZSBvdmVyLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gaXRlcmF0ZWUgVGhlIGZ1bmN0aW9uIGludm9rZWQgcGVyIGl0ZXJhdGlvbi5cbiAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgYG9iamVjdGAuXG4gKi9cbmZ1bmN0aW9uIGJhc2VGb3JPd24ob2JqZWN0LCBpdGVyYXRlZSkge1xuICByZXR1cm4gYmFzZUZvcihvYmplY3QsIGl0ZXJhdGVlLCBrZXlzKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBiYXNlRm9yT3duO1xuIiwidmFyIGluZGV4T2ZOYU4gPSByZXF1aXJlKCcuL2luZGV4T2ZOYU4nKTtcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5pbmRleE9mYCB3aXRob3V0IHN1cHBvcnQgZm9yIGJpbmFyeSBzZWFyY2hlcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtBcnJheX0gYXJyYXkgVGhlIGFycmF5IHRvIHNlYXJjaC5cbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHNlYXJjaCBmb3IuXG4gKiBAcGFyYW0ge251bWJlcn0gZnJvbUluZGV4IFRoZSBpbmRleCB0byBzZWFyY2ggZnJvbS5cbiAqIEByZXR1cm5zIHtudW1iZXJ9IFJldHVybnMgdGhlIGluZGV4IG9mIHRoZSBtYXRjaGVkIHZhbHVlLCBlbHNlIGAtMWAuXG4gKi9cbmZ1bmN0aW9uIGJhc2VJbmRleE9mKGFycmF5LCB2YWx1ZSwgZnJvbUluZGV4KSB7XG4gIGlmICh2YWx1ZSAhPT0gdmFsdWUpIHtcbiAgICByZXR1cm4gaW5kZXhPZk5hTihhcnJheSwgZnJvbUluZGV4KTtcbiAgfVxuICB2YXIgaW5kZXggPSBmcm9tSW5kZXggLSAxLFxuICAgICAgbGVuZ3RoID0gYXJyYXkubGVuZ3RoO1xuXG4gIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgaWYgKGFycmF5W2luZGV4XSA9PT0gdmFsdWUpIHtcbiAgICAgIHJldHVybiBpbmRleDtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIC0xO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGJhc2VJbmRleE9mO1xuIiwidmFyIGFycmF5RWFjaCA9IHJlcXVpcmUoJy4vYXJyYXlFYWNoJyksXG4gICAgYmFzZU1lcmdlRGVlcCA9IHJlcXVpcmUoJy4vYmFzZU1lcmdlRGVlcCcpLFxuICAgIGlzQXJyYXkgPSByZXF1aXJlKCcuLi9sYW5nL2lzQXJyYXknKSxcbiAgICBpc0FycmF5TGlrZSA9IHJlcXVpcmUoJy4vaXNBcnJheUxpa2UnKSxcbiAgICBpc09iamVjdCA9IHJlcXVpcmUoJy4uL2xhbmcvaXNPYmplY3QnKSxcbiAgICBpc09iamVjdExpa2UgPSByZXF1aXJlKCcuL2lzT2JqZWN0TGlrZScpLFxuICAgIGlzVHlwZWRBcnJheSA9IHJlcXVpcmUoJy4uL2xhbmcvaXNUeXBlZEFycmF5JyksXG4gICAga2V5cyA9IHJlcXVpcmUoJy4uL29iamVjdC9rZXlzJyk7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8ubWVyZ2VgIHdpdGhvdXQgc3VwcG9ydCBmb3IgYXJndW1lbnQganVnZ2xpbmcsXG4gKiBtdWx0aXBsZSBzb3VyY2VzLCBhbmQgYHRoaXNgIGJpbmRpbmcgYGN1c3RvbWl6ZXJgIGZ1bmN0aW9ucy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgZGVzdGluYXRpb24gb2JqZWN0LlxuICogQHBhcmFtIHtPYmplY3R9IHNvdXJjZSBUaGUgc291cmNlIG9iamVjdC5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IFtjdXN0b21pemVyXSBUaGUgZnVuY3Rpb24gdG8gY3VzdG9taXplIG1lcmdpbmcgcHJvcGVydGllcy5cbiAqIEBwYXJhbSB7QXJyYXl9IFtzdGFja0E9W11dIFRyYWNrcyB0cmF2ZXJzZWQgc291cmNlIG9iamVjdHMuXG4gKiBAcGFyYW0ge0FycmF5fSBbc3RhY2tCPVtdXSBBc3NvY2lhdGVzIHZhbHVlcyB3aXRoIHNvdXJjZSBjb3VudGVycGFydHMuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIGBvYmplY3RgLlxuICovXG5mdW5jdGlvbiBiYXNlTWVyZ2Uob2JqZWN0LCBzb3VyY2UsIGN1c3RvbWl6ZXIsIHN0YWNrQSwgc3RhY2tCKSB7XG4gIGlmICghaXNPYmplY3Qob2JqZWN0KSkge1xuICAgIHJldHVybiBvYmplY3Q7XG4gIH1cbiAgdmFyIGlzU3JjQXJyID0gaXNBcnJheUxpa2Uoc291cmNlKSAmJiAoaXNBcnJheShzb3VyY2UpIHx8IGlzVHlwZWRBcnJheShzb3VyY2UpKSxcbiAgICAgIHByb3BzID0gaXNTcmNBcnIgPyBudWxsIDoga2V5cyhzb3VyY2UpO1xuXG4gIGFycmF5RWFjaChwcm9wcyB8fCBzb3VyY2UsIGZ1bmN0aW9uKHNyY1ZhbHVlLCBrZXkpIHtcbiAgICBpZiAocHJvcHMpIHtcbiAgICAgIGtleSA9IHNyY1ZhbHVlO1xuICAgICAgc3JjVmFsdWUgPSBzb3VyY2Vba2V5XTtcbiAgICB9XG4gICAgaWYgKGlzT2JqZWN0TGlrZShzcmNWYWx1ZSkpIHtcbiAgICAgIHN0YWNrQSB8fCAoc3RhY2tBID0gW10pO1xuICAgICAgc3RhY2tCIHx8IChzdGFja0IgPSBbXSk7XG4gICAgICBiYXNlTWVyZ2VEZWVwKG9iamVjdCwgc291cmNlLCBrZXksIGJhc2VNZXJnZSwgY3VzdG9taXplciwgc3RhY2tBLCBzdGFja0IpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHZhciB2YWx1ZSA9IG9iamVjdFtrZXldLFxuICAgICAgICAgIHJlc3VsdCA9IGN1c3RvbWl6ZXIgPyBjdXN0b21pemVyKHZhbHVlLCBzcmNWYWx1ZSwga2V5LCBvYmplY3QsIHNvdXJjZSkgOiB1bmRlZmluZWQsXG4gICAgICAgICAgaXNDb21tb24gPSByZXN1bHQgPT09IHVuZGVmaW5lZDtcblxuICAgICAgaWYgKGlzQ29tbW9uKSB7XG4gICAgICAgIHJlc3VsdCA9IHNyY1ZhbHVlO1xuICAgICAgfVxuICAgICAgaWYgKChyZXN1bHQgIT09IHVuZGVmaW5lZCB8fCAoaXNTcmNBcnIgJiYgIShrZXkgaW4gb2JqZWN0KSkpICYmXG4gICAgICAgICAgKGlzQ29tbW9uIHx8IChyZXN1bHQgPT09IHJlc3VsdCA/IChyZXN1bHQgIT09IHZhbHVlKSA6ICh2YWx1ZSA9PT0gdmFsdWUpKSkpIHtcbiAgICAgICAgb2JqZWN0W2tleV0gPSByZXN1bHQ7XG4gICAgICB9XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIG9iamVjdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBiYXNlTWVyZ2U7XG4iLCJ2YXIgYXJyYXlDb3B5ID0gcmVxdWlyZSgnLi9hcnJheUNvcHknKSxcbiAgICBpc0FyZ3VtZW50cyA9IHJlcXVpcmUoJy4uL2xhbmcvaXNBcmd1bWVudHMnKSxcbiAgICBpc0FycmF5ID0gcmVxdWlyZSgnLi4vbGFuZy9pc0FycmF5JyksXG4gICAgaXNBcnJheUxpa2UgPSByZXF1aXJlKCcuL2lzQXJyYXlMaWtlJyksXG4gICAgaXNQbGFpbk9iamVjdCA9IHJlcXVpcmUoJy4uL2xhbmcvaXNQbGFpbk9iamVjdCcpLFxuICAgIGlzVHlwZWRBcnJheSA9IHJlcXVpcmUoJy4uL2xhbmcvaXNUeXBlZEFycmF5JyksXG4gICAgdG9QbGFpbk9iamVjdCA9IHJlcXVpcmUoJy4uL2xhbmcvdG9QbGFpbk9iamVjdCcpO1xuXG4vKipcbiAqIEEgc3BlY2lhbGl6ZWQgdmVyc2lvbiBvZiBgYmFzZU1lcmdlYCBmb3IgYXJyYXlzIGFuZCBvYmplY3RzIHdoaWNoIHBlcmZvcm1zXG4gKiBkZWVwIG1lcmdlcyBhbmQgdHJhY2tzIHRyYXZlcnNlZCBvYmplY3RzIGVuYWJsaW5nIG9iamVjdHMgd2l0aCBjaXJjdWxhclxuICogcmVmZXJlbmNlcyB0byBiZSBtZXJnZWQuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIGRlc3RpbmF0aW9uIG9iamVjdC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBzb3VyY2UgVGhlIHNvdXJjZSBvYmplY3QuXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHZhbHVlIHRvIG1lcmdlLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gbWVyZ2VGdW5jIFRoZSBmdW5jdGlvbiB0byBtZXJnZSB2YWx1ZXMuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY3VzdG9taXplcl0gVGhlIGZ1bmN0aW9uIHRvIGN1c3RvbWl6ZSBtZXJnaW5nIHByb3BlcnRpZXMuXG4gKiBAcGFyYW0ge0FycmF5fSBbc3RhY2tBPVtdXSBUcmFja3MgdHJhdmVyc2VkIHNvdXJjZSBvYmplY3RzLlxuICogQHBhcmFtIHtBcnJheX0gW3N0YWNrQj1bXV0gQXNzb2NpYXRlcyB2YWx1ZXMgd2l0aCBzb3VyY2UgY291bnRlcnBhcnRzLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIHRoZSBvYmplY3RzIGFyZSBlcXVpdmFsZW50LCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGJhc2VNZXJnZURlZXAob2JqZWN0LCBzb3VyY2UsIGtleSwgbWVyZ2VGdW5jLCBjdXN0b21pemVyLCBzdGFja0EsIHN0YWNrQikge1xuICB2YXIgbGVuZ3RoID0gc3RhY2tBLmxlbmd0aCxcbiAgICAgIHNyY1ZhbHVlID0gc291cmNlW2tleV07XG5cbiAgd2hpbGUgKGxlbmd0aC0tKSB7XG4gICAgaWYgKHN0YWNrQVtsZW5ndGhdID09IHNyY1ZhbHVlKSB7XG4gICAgICBvYmplY3Rba2V5XSA9IHN0YWNrQltsZW5ndGhdO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgfVxuICB2YXIgdmFsdWUgPSBvYmplY3Rba2V5XSxcbiAgICAgIHJlc3VsdCA9IGN1c3RvbWl6ZXIgPyBjdXN0b21pemVyKHZhbHVlLCBzcmNWYWx1ZSwga2V5LCBvYmplY3QsIHNvdXJjZSkgOiB1bmRlZmluZWQsXG4gICAgICBpc0NvbW1vbiA9IHJlc3VsdCA9PT0gdW5kZWZpbmVkO1xuXG4gIGlmIChpc0NvbW1vbikge1xuICAgIHJlc3VsdCA9IHNyY1ZhbHVlO1xuICAgIGlmIChpc0FycmF5TGlrZShzcmNWYWx1ZSkgJiYgKGlzQXJyYXkoc3JjVmFsdWUpIHx8IGlzVHlwZWRBcnJheShzcmNWYWx1ZSkpKSB7XG4gICAgICByZXN1bHQgPSBpc0FycmF5KHZhbHVlKVxuICAgICAgICA/IHZhbHVlXG4gICAgICAgIDogKGlzQXJyYXlMaWtlKHZhbHVlKSA/IGFycmF5Q29weSh2YWx1ZSkgOiBbXSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKGlzUGxhaW5PYmplY3Qoc3JjVmFsdWUpIHx8IGlzQXJndW1lbnRzKHNyY1ZhbHVlKSkge1xuICAgICAgcmVzdWx0ID0gaXNBcmd1bWVudHModmFsdWUpXG4gICAgICAgID8gdG9QbGFpbk9iamVjdCh2YWx1ZSlcbiAgICAgICAgOiAoaXNQbGFpbk9iamVjdCh2YWx1ZSkgPyB2YWx1ZSA6IHt9KTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBpc0NvbW1vbiA9IGZhbHNlO1xuICAgIH1cbiAgfVxuICAvLyBBZGQgdGhlIHNvdXJjZSB2YWx1ZSB0byB0aGUgc3RhY2sgb2YgdHJhdmVyc2VkIG9iamVjdHMgYW5kIGFzc29jaWF0ZVxuICAvLyBpdCB3aXRoIGl0cyBtZXJnZWQgdmFsdWUuXG4gIHN0YWNrQS5wdXNoKHNyY1ZhbHVlKTtcbiAgc3RhY2tCLnB1c2gocmVzdWx0KTtcblxuICBpZiAoaXNDb21tb24pIHtcbiAgICAvLyBSZWN1cnNpdmVseSBtZXJnZSBvYmplY3RzIGFuZCBhcnJheXMgKHN1c2NlcHRpYmxlIHRvIGNhbGwgc3RhY2sgbGltaXRzKS5cbiAgICBvYmplY3Rba2V5XSA9IG1lcmdlRnVuYyhyZXN1bHQsIHNyY1ZhbHVlLCBjdXN0b21pemVyLCBzdGFja0EsIHN0YWNrQik7XG4gIH0gZWxzZSBpZiAocmVzdWx0ID09PSByZXN1bHQgPyAocmVzdWx0ICE9PSB2YWx1ZSkgOiAodmFsdWUgPT09IHZhbHVlKSkge1xuICAgIG9iamVjdFtrZXldID0gcmVzdWx0O1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYmFzZU1lcmdlRGVlcDtcbiIsIi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8ucHJvcGVydHlgIHdpdGhvdXQgc3VwcG9ydCBmb3IgZGVlcCBwYXRocy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSBwcm9wZXJ0eSB0byBnZXQuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gYmFzZVByb3BlcnR5KGtleSkge1xuICByZXR1cm4gZnVuY3Rpb24ob2JqZWN0KSB7XG4gICAgcmV0dXJuIG9iamVjdCA9PSBudWxsID8gdW5kZWZpbmVkIDogb2JqZWN0W2tleV07XG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYmFzZVByb3BlcnR5O1xuIiwiLyoqXG4gKiBDb252ZXJ0cyBgdmFsdWVgIHRvIGEgc3RyaW5nIGlmIGl0J3Mgbm90IG9uZS4gQW4gZW1wdHkgc3RyaW5nIGlzIHJldHVybmVkXG4gKiBmb3IgYG51bGxgIG9yIGB1bmRlZmluZWRgIHZhbHVlcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gcHJvY2Vzcy5cbiAqIEByZXR1cm5zIHtzdHJpbmd9IFJldHVybnMgdGhlIHN0cmluZy5cbiAqL1xuZnVuY3Rpb24gYmFzZVRvU3RyaW5nKHZhbHVlKSB7XG4gIGlmICh0eXBlb2YgdmFsdWUgPT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cbiAgcmV0dXJuIHZhbHVlID09IG51bGwgPyAnJyA6ICh2YWx1ZSArICcnKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBiYXNlVG9TdHJpbmc7XG4iLCIvKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLnZhbHVlc2AgYW5kIGBfLnZhbHVlc0luYCB3aGljaCBjcmVhdGVzIGFuXG4gKiBhcnJheSBvZiBgb2JqZWN0YCBwcm9wZXJ0eSB2YWx1ZXMgY29ycmVzcG9uZGluZyB0byB0aGUgcHJvcGVydHkgbmFtZXNcbiAqIG9mIGBwcm9wc2AuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBxdWVyeS5cbiAqIEBwYXJhbSB7QXJyYXl9IHByb3BzIFRoZSBwcm9wZXJ0eSBuYW1lcyB0byBnZXQgdmFsdWVzIGZvci5cbiAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgdGhlIGFycmF5IG9mIHByb3BlcnR5IHZhbHVlcy5cbiAqL1xuZnVuY3Rpb24gYmFzZVZhbHVlcyhvYmplY3QsIHByb3BzKSB7XG4gIHZhciBpbmRleCA9IC0xLFxuICAgICAgbGVuZ3RoID0gcHJvcHMubGVuZ3RoLFxuICAgICAgcmVzdWx0ID0gQXJyYXkobGVuZ3RoKTtcblxuICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgIHJlc3VsdFtpbmRleF0gPSBvYmplY3RbcHJvcHNbaW5kZXhdXTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGJhc2VWYWx1ZXM7XG4iLCJ2YXIgaWRlbnRpdHkgPSByZXF1aXJlKCcuLi91dGlsaXR5L2lkZW50aXR5Jyk7XG5cbi8qKlxuICogQSBzcGVjaWFsaXplZCB2ZXJzaW9uIG9mIGBiYXNlQ2FsbGJhY2tgIHdoaWNoIG9ubHkgc3VwcG9ydHMgYHRoaXNgIGJpbmRpbmdcbiAqIGFuZCBzcGVjaWZ5aW5nIHRoZSBudW1iZXIgb2YgYXJndW1lbnRzIHRvIHByb3ZpZGUgdG8gYGZ1bmNgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byBiaW5kLlxuICogQHBhcmFtIHsqfSB0aGlzQXJnIFRoZSBgdGhpc2AgYmluZGluZyBvZiBgZnVuY2AuXG4gKiBAcGFyYW0ge251bWJlcn0gW2FyZ0NvdW50XSBUaGUgbnVtYmVyIG9mIGFyZ3VtZW50cyB0byBwcm92aWRlIHRvIGBmdW5jYC5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgY2FsbGJhY2suXG4gKi9cbmZ1bmN0aW9uIGJpbmRDYWxsYmFjayhmdW5jLCB0aGlzQXJnLCBhcmdDb3VudCkge1xuICBpZiAodHlwZW9mIGZ1bmMgIT0gJ2Z1bmN0aW9uJykge1xuICAgIHJldHVybiBpZGVudGl0eTtcbiAgfVxuICBpZiAodGhpc0FyZyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuIGZ1bmM7XG4gIH1cbiAgc3dpdGNoIChhcmdDb3VudCkge1xuICAgIGNhc2UgMTogcmV0dXJuIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICByZXR1cm4gZnVuYy5jYWxsKHRoaXNBcmcsIHZhbHVlKTtcbiAgICB9O1xuICAgIGNhc2UgMzogcmV0dXJuIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCwgY29sbGVjdGlvbikge1xuICAgICAgcmV0dXJuIGZ1bmMuY2FsbCh0aGlzQXJnLCB2YWx1ZSwgaW5kZXgsIGNvbGxlY3Rpb24pO1xuICAgIH07XG4gICAgY2FzZSA0OiByZXR1cm4gZnVuY3Rpb24oYWNjdW11bGF0b3IsIHZhbHVlLCBpbmRleCwgY29sbGVjdGlvbikge1xuICAgICAgcmV0dXJuIGZ1bmMuY2FsbCh0aGlzQXJnLCBhY2N1bXVsYXRvciwgdmFsdWUsIGluZGV4LCBjb2xsZWN0aW9uKTtcbiAgICB9O1xuICAgIGNhc2UgNTogcmV0dXJuIGZ1bmN0aW9uKHZhbHVlLCBvdGhlciwga2V5LCBvYmplY3QsIHNvdXJjZSkge1xuICAgICAgcmV0dXJuIGZ1bmMuY2FsbCh0aGlzQXJnLCB2YWx1ZSwgb3RoZXIsIGtleSwgb2JqZWN0LCBzb3VyY2UpO1xuICAgIH07XG4gIH1cbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBmdW5jLmFwcGx5KHRoaXNBcmcsIGFyZ3VtZW50cyk7XG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYmluZENhbGxiYWNrO1xuIiwidmFyIGJpbmRDYWxsYmFjayA9IHJlcXVpcmUoJy4vYmluZENhbGxiYWNrJyksXG4gICAgaXNJdGVyYXRlZUNhbGwgPSByZXF1aXJlKCcuL2lzSXRlcmF0ZWVDYWxsJyksXG4gICAgcmVzdFBhcmFtID0gcmVxdWlyZSgnLi4vZnVuY3Rpb24vcmVzdFBhcmFtJyk7XG5cbi8qKlxuICogQ3JlYXRlcyBhIGZ1bmN0aW9uIHRoYXQgYXNzaWducyBwcm9wZXJ0aWVzIG9mIHNvdXJjZSBvYmplY3QocykgdG8gYSBnaXZlblxuICogZGVzdGluYXRpb24gb2JqZWN0LlxuICpcbiAqICoqTm90ZToqKiBUaGlzIGZ1bmN0aW9uIGlzIHVzZWQgdG8gY3JlYXRlIGBfLmFzc2lnbmAsIGBfLmRlZmF1bHRzYCwgYW5kIGBfLm1lcmdlYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gYXNzaWduZXIgVGhlIGZ1bmN0aW9uIHRvIGFzc2lnbiB2YWx1ZXMuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBhc3NpZ25lciBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gY3JlYXRlQXNzaWduZXIoYXNzaWduZXIpIHtcbiAgcmV0dXJuIHJlc3RQYXJhbShmdW5jdGlvbihvYmplY3QsIHNvdXJjZXMpIHtcbiAgICB2YXIgaW5kZXggPSAtMSxcbiAgICAgICAgbGVuZ3RoID0gb2JqZWN0ID09IG51bGwgPyAwIDogc291cmNlcy5sZW5ndGgsXG4gICAgICAgIGN1c3RvbWl6ZXIgPSBsZW5ndGggPiAyID8gc291cmNlc1tsZW5ndGggLSAyXSA6IHVuZGVmaW5lZCxcbiAgICAgICAgZ3VhcmQgPSBsZW5ndGggPiAyID8gc291cmNlc1syXSA6IHVuZGVmaW5lZCxcbiAgICAgICAgdGhpc0FyZyA9IGxlbmd0aCA+IDEgPyBzb3VyY2VzW2xlbmd0aCAtIDFdIDogdW5kZWZpbmVkO1xuXG4gICAgaWYgKHR5cGVvZiBjdXN0b21pemVyID09ICdmdW5jdGlvbicpIHtcbiAgICAgIGN1c3RvbWl6ZXIgPSBiaW5kQ2FsbGJhY2soY3VzdG9taXplciwgdGhpc0FyZywgNSk7XG4gICAgICBsZW5ndGggLT0gMjtcbiAgICB9IGVsc2Uge1xuICAgICAgY3VzdG9taXplciA9IHR5cGVvZiB0aGlzQXJnID09ICdmdW5jdGlvbicgPyB0aGlzQXJnIDogdW5kZWZpbmVkO1xuICAgICAgbGVuZ3RoIC09IChjdXN0b21pemVyID8gMSA6IDApO1xuICAgIH1cbiAgICBpZiAoZ3VhcmQgJiYgaXNJdGVyYXRlZUNhbGwoc291cmNlc1swXSwgc291cmNlc1sxXSwgZ3VhcmQpKSB7XG4gICAgICBjdXN0b21pemVyID0gbGVuZ3RoIDwgMyA/IHVuZGVmaW5lZCA6IGN1c3RvbWl6ZXI7XG4gICAgICBsZW5ndGggPSAxO1xuICAgIH1cbiAgICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgICAgdmFyIHNvdXJjZSA9IHNvdXJjZXNbaW5kZXhdO1xuICAgICAgaWYgKHNvdXJjZSkge1xuICAgICAgICBhc3NpZ25lcihvYmplY3QsIHNvdXJjZSwgY3VzdG9taXplcik7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBvYmplY3Q7XG4gIH0pO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNyZWF0ZUFzc2lnbmVyO1xuIiwidmFyIGdldExlbmd0aCA9IHJlcXVpcmUoJy4vZ2V0TGVuZ3RoJyksXG4gICAgaXNMZW5ndGggPSByZXF1aXJlKCcuL2lzTGVuZ3RoJyksXG4gICAgdG9PYmplY3QgPSByZXF1aXJlKCcuL3RvT2JqZWN0Jyk7XG5cbi8qKlxuICogQ3JlYXRlcyBhIGBiYXNlRWFjaGAgb3IgYGJhc2VFYWNoUmlnaHRgIGZ1bmN0aW9uLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBlYWNoRnVuYyBUaGUgZnVuY3Rpb24gdG8gaXRlcmF0ZSBvdmVyIGEgY29sbGVjdGlvbi5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW2Zyb21SaWdodF0gU3BlY2lmeSBpdGVyYXRpbmcgZnJvbSByaWdodCB0byBsZWZ0LlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgYmFzZSBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gY3JlYXRlQmFzZUVhY2goZWFjaEZ1bmMsIGZyb21SaWdodCkge1xuICByZXR1cm4gZnVuY3Rpb24oY29sbGVjdGlvbiwgaXRlcmF0ZWUpIHtcbiAgICB2YXIgbGVuZ3RoID0gY29sbGVjdGlvbiA/IGdldExlbmd0aChjb2xsZWN0aW9uKSA6IDA7XG4gICAgaWYgKCFpc0xlbmd0aChsZW5ndGgpKSB7XG4gICAgICByZXR1cm4gZWFjaEZ1bmMoY29sbGVjdGlvbiwgaXRlcmF0ZWUpO1xuICAgIH1cbiAgICB2YXIgaW5kZXggPSBmcm9tUmlnaHQgPyBsZW5ndGggOiAtMSxcbiAgICAgICAgaXRlcmFibGUgPSB0b09iamVjdChjb2xsZWN0aW9uKTtcblxuICAgIHdoaWxlICgoZnJvbVJpZ2h0ID8gaW5kZXgtLSA6ICsraW5kZXggPCBsZW5ndGgpKSB7XG4gICAgICBpZiAoaXRlcmF0ZWUoaXRlcmFibGVbaW5kZXhdLCBpbmRleCwgaXRlcmFibGUpID09PSBmYWxzZSkge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGNvbGxlY3Rpb247XG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gY3JlYXRlQmFzZUVhY2g7XG4iLCJ2YXIgdG9PYmplY3QgPSByZXF1aXJlKCcuL3RvT2JqZWN0Jyk7XG5cbi8qKlxuICogQ3JlYXRlcyBhIGJhc2UgZnVuY3Rpb24gZm9yIGBfLmZvckluYCBvciBgXy5mb3JJblJpZ2h0YC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtib29sZWFufSBbZnJvbVJpZ2h0XSBTcGVjaWZ5IGl0ZXJhdGluZyBmcm9tIHJpZ2h0IHRvIGxlZnQuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBiYXNlIGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBjcmVhdGVCYXNlRm9yKGZyb21SaWdodCkge1xuICByZXR1cm4gZnVuY3Rpb24ob2JqZWN0LCBpdGVyYXRlZSwga2V5c0Z1bmMpIHtcbiAgICB2YXIgaXRlcmFibGUgPSB0b09iamVjdChvYmplY3QpLFxuICAgICAgICBwcm9wcyA9IGtleXNGdW5jKG9iamVjdCksXG4gICAgICAgIGxlbmd0aCA9IHByb3BzLmxlbmd0aCxcbiAgICAgICAgaW5kZXggPSBmcm9tUmlnaHQgPyBsZW5ndGggOiAtMTtcblxuICAgIHdoaWxlICgoZnJvbVJpZ2h0ID8gaW5kZXgtLSA6ICsraW5kZXggPCBsZW5ndGgpKSB7XG4gICAgICB2YXIga2V5ID0gcHJvcHNbaW5kZXhdO1xuICAgICAgaWYgKGl0ZXJhdGVlKGl0ZXJhYmxlW2tleV0sIGtleSwgaXRlcmFibGUpID09PSBmYWxzZSkge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG9iamVjdDtcbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjcmVhdGVCYXNlRm9yO1xuIiwidmFyIGJpbmRDYWxsYmFjayA9IHJlcXVpcmUoJy4vYmluZENhbGxiYWNrJyksXG4gICAgaXNBcnJheSA9IHJlcXVpcmUoJy4uL2xhbmcvaXNBcnJheScpO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBmdW5jdGlvbiBmb3IgYF8uZm9yRWFjaGAgb3IgYF8uZm9yRWFjaFJpZ2h0YC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gYXJyYXlGdW5jIFRoZSBmdW5jdGlvbiB0byBpdGVyYXRlIG92ZXIgYW4gYXJyYXkuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBlYWNoRnVuYyBUaGUgZnVuY3Rpb24gdG8gaXRlcmF0ZSBvdmVyIGEgY29sbGVjdGlvbi5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IGVhY2ggZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZUZvckVhY2goYXJyYXlGdW5jLCBlYWNoRnVuYykge1xuICByZXR1cm4gZnVuY3Rpb24oY29sbGVjdGlvbiwgaXRlcmF0ZWUsIHRoaXNBcmcpIHtcbiAgICByZXR1cm4gKHR5cGVvZiBpdGVyYXRlZSA9PSAnZnVuY3Rpb24nICYmIHRoaXNBcmcgPT09IHVuZGVmaW5lZCAmJiBpc0FycmF5KGNvbGxlY3Rpb24pKVxuICAgICAgPyBhcnJheUZ1bmMoY29sbGVjdGlvbiwgaXRlcmF0ZWUpXG4gICAgICA6IGVhY2hGdW5jKGNvbGxlY3Rpb24sIGJpbmRDYWxsYmFjayhpdGVyYXRlZSwgdGhpc0FyZywgMykpO1xuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNyZWF0ZUZvckVhY2g7XG4iLCJ2YXIgYmFzZVByb3BlcnR5ID0gcmVxdWlyZSgnLi9iYXNlUHJvcGVydHknKTtcblxuLyoqXG4gKiBHZXRzIHRoZSBcImxlbmd0aFwiIHByb3BlcnR5IHZhbHVlIG9mIGBvYmplY3RgLlxuICpcbiAqICoqTm90ZToqKiBUaGlzIGZ1bmN0aW9uIGlzIHVzZWQgdG8gYXZvaWQgYSBbSklUIGJ1Z10oaHR0cHM6Ly9idWdzLndlYmtpdC5vcmcvc2hvd19idWcuY2dpP2lkPTE0Mjc5MilcbiAqIHRoYXQgYWZmZWN0cyBTYWZhcmkgb24gYXQgbGVhc3QgaU9TIDguMS04LjMgQVJNNjQuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBxdWVyeS5cbiAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIHRoZSBcImxlbmd0aFwiIHZhbHVlLlxuICovXG52YXIgZ2V0TGVuZ3RoID0gYmFzZVByb3BlcnR5KCdsZW5ndGgnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBnZXRMZW5ndGg7XG4iLCJ2YXIgaXNOYXRpdmUgPSByZXF1aXJlKCcuLi9sYW5nL2lzTmF0aXZlJyk7XG5cbi8qKlxuICogR2V0cyB0aGUgbmF0aXZlIGZ1bmN0aW9uIGF0IGBrZXlgIG9mIGBvYmplY3RgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gcXVlcnkuXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIG1ldGhvZCB0byBnZXQuXG4gKiBAcmV0dXJucyB7Kn0gUmV0dXJucyB0aGUgZnVuY3Rpb24gaWYgaXQncyBuYXRpdmUsIGVsc2UgYHVuZGVmaW5lZGAuXG4gKi9cbmZ1bmN0aW9uIGdldE5hdGl2ZShvYmplY3QsIGtleSkge1xuICB2YXIgdmFsdWUgPSBvYmplY3QgPT0gbnVsbCA/IHVuZGVmaW5lZCA6IG9iamVjdFtrZXldO1xuICByZXR1cm4gaXNOYXRpdmUodmFsdWUpID8gdmFsdWUgOiB1bmRlZmluZWQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZ2V0TmF0aXZlO1xuIiwiLyoqXG4gKiBHZXRzIHRoZSBpbmRleCBhdCB3aGljaCB0aGUgZmlyc3Qgb2NjdXJyZW5jZSBvZiBgTmFOYCBpcyBmb3VuZCBpbiBgYXJyYXlgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0FycmF5fSBhcnJheSBUaGUgYXJyYXkgdG8gc2VhcmNoLlxuICogQHBhcmFtIHtudW1iZXJ9IGZyb21JbmRleCBUaGUgaW5kZXggdG8gc2VhcmNoIGZyb20uXG4gKiBAcGFyYW0ge2Jvb2xlYW59IFtmcm9tUmlnaHRdIFNwZWNpZnkgaXRlcmF0aW5nIGZyb20gcmlnaHQgdG8gbGVmdC5cbiAqIEByZXR1cm5zIHtudW1iZXJ9IFJldHVybnMgdGhlIGluZGV4IG9mIHRoZSBtYXRjaGVkIGBOYU5gLCBlbHNlIGAtMWAuXG4gKi9cbmZ1bmN0aW9uIGluZGV4T2ZOYU4oYXJyYXksIGZyb21JbmRleCwgZnJvbVJpZ2h0KSB7XG4gIHZhciBsZW5ndGggPSBhcnJheS5sZW5ndGgsXG4gICAgICBpbmRleCA9IGZyb21JbmRleCArIChmcm9tUmlnaHQgPyAwIDogLTEpO1xuXG4gIHdoaWxlICgoZnJvbVJpZ2h0ID8gaW5kZXgtLSA6ICsraW5kZXggPCBsZW5ndGgpKSB7XG4gICAgdmFyIG90aGVyID0gYXJyYXlbaW5kZXhdO1xuICAgIGlmIChvdGhlciAhPT0gb3RoZXIpIHtcbiAgICAgIHJldHVybiBpbmRleDtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIC0xO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGluZGV4T2ZOYU47XG4iLCJ2YXIgZ2V0TGVuZ3RoID0gcmVxdWlyZSgnLi9nZXRMZW5ndGgnKSxcbiAgICBpc0xlbmd0aCA9IHJlcXVpcmUoJy4vaXNMZW5ndGgnKTtcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBhcnJheS1saWtlLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGFycmF5LWxpa2UsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gaXNBcnJheUxpa2UodmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlICE9IG51bGwgJiYgaXNMZW5ndGgoZ2V0TGVuZ3RoKHZhbHVlKSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaXNBcnJheUxpa2U7XG4iLCIvKiogVXNlZCB0byBkZXRlY3QgdW5zaWduZWQgaW50ZWdlciB2YWx1ZXMuICovXG52YXIgcmVJc1VpbnQgPSAvXlxcZCskLztcblxuLyoqXG4gKiBVc2VkIGFzIHRoZSBbbWF4aW11bSBsZW5ndGhdKGh0dHBzOi8vcGVvcGxlLm1vemlsbGEub3JnL35qb3JlbmRvcmZmL2VzNi1kcmFmdC5odG1sI3NlYy1udW1iZXIubWF4X3NhZmVfaW50ZWdlcilcbiAqIG9mIGFuIGFycmF5LWxpa2UgdmFsdWUuXG4gKi9cbnZhciBNQVhfU0FGRV9JTlRFR0VSID0gOTAwNzE5OTI1NDc0MDk5MTtcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBhIHZhbGlkIGFycmF5LWxpa2UgaW5kZXguXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHBhcmFtIHtudW1iZXJ9IFtsZW5ndGg9TUFYX1NBRkVfSU5URUdFUl0gVGhlIHVwcGVyIGJvdW5kcyBvZiBhIHZhbGlkIGluZGV4LlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSB2YWxpZCBpbmRleCwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBpc0luZGV4KHZhbHVlLCBsZW5ndGgpIHtcbiAgdmFsdWUgPSAodHlwZW9mIHZhbHVlID09ICdudW1iZXInIHx8IHJlSXNVaW50LnRlc3QodmFsdWUpKSA/ICt2YWx1ZSA6IC0xO1xuICBsZW5ndGggPSBsZW5ndGggPT0gbnVsbCA/IE1BWF9TQUZFX0lOVEVHRVIgOiBsZW5ndGg7XG4gIHJldHVybiB2YWx1ZSA+IC0xICYmIHZhbHVlICUgMSA9PSAwICYmIHZhbHVlIDwgbGVuZ3RoO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzSW5kZXg7XG4iLCJ2YXIgaXNBcnJheUxpa2UgPSByZXF1aXJlKCcuL2lzQXJyYXlMaWtlJyksXG4gICAgaXNJbmRleCA9IHJlcXVpcmUoJy4vaXNJbmRleCcpLFxuICAgIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi4vbGFuZy9pc09iamVjdCcpO1xuXG4vKipcbiAqIENoZWNrcyBpZiB0aGUgcHJvdmlkZWQgYXJndW1lbnRzIGFyZSBmcm9tIGFuIGl0ZXJhdGVlIGNhbGwuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHBvdGVudGlhbCBpdGVyYXRlZSB2YWx1ZSBhcmd1bWVudC5cbiAqIEBwYXJhbSB7Kn0gaW5kZXggVGhlIHBvdGVudGlhbCBpdGVyYXRlZSBpbmRleCBvciBrZXkgYXJndW1lbnQuXG4gKiBAcGFyYW0geyp9IG9iamVjdCBUaGUgcG90ZW50aWFsIGl0ZXJhdGVlIG9iamVjdCBhcmd1bWVudC5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgYXJndW1lbnRzIGFyZSBmcm9tIGFuIGl0ZXJhdGVlIGNhbGwsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gaXNJdGVyYXRlZUNhbGwodmFsdWUsIGluZGV4LCBvYmplY3QpIHtcbiAgaWYgKCFpc09iamVjdChvYmplY3QpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHZhciB0eXBlID0gdHlwZW9mIGluZGV4O1xuICBpZiAodHlwZSA9PSAnbnVtYmVyJ1xuICAgICAgPyAoaXNBcnJheUxpa2Uob2JqZWN0KSAmJiBpc0luZGV4KGluZGV4LCBvYmplY3QubGVuZ3RoKSlcbiAgICAgIDogKHR5cGUgPT0gJ3N0cmluZycgJiYgaW5kZXggaW4gb2JqZWN0KSkge1xuICAgIHZhciBvdGhlciA9IG9iamVjdFtpbmRleF07XG4gICAgcmV0dXJuIHZhbHVlID09PSB2YWx1ZSA/ICh2YWx1ZSA9PT0gb3RoZXIpIDogKG90aGVyICE9PSBvdGhlcik7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzSXRlcmF0ZWVDYWxsO1xuIiwiLyoqXG4gKiBVc2VkIGFzIHRoZSBbbWF4aW11bSBsZW5ndGhdKGh0dHBzOi8vcGVvcGxlLm1vemlsbGEub3JnL35qb3JlbmRvcmZmL2VzNi1kcmFmdC5odG1sI3NlYy1udW1iZXIubWF4X3NhZmVfaW50ZWdlcilcbiAqIG9mIGFuIGFycmF5LWxpa2UgdmFsdWUuXG4gKi9cbnZhciBNQVhfU0FGRV9JTlRFR0VSID0gOTAwNzE5OTI1NDc0MDk5MTtcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBhIHZhbGlkIGFycmF5LWxpa2UgbGVuZ3RoLlxuICpcbiAqICoqTm90ZToqKiBUaGlzIGZ1bmN0aW9uIGlzIGJhc2VkIG9uIFtgVG9MZW5ndGhgXShodHRwczovL3Blb3BsZS5tb3ppbGxhLm9yZy9+am9yZW5kb3JmZi9lczYtZHJhZnQuaHRtbCNzZWMtdG9sZW5ndGgpLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgdmFsaWQgbGVuZ3RoLCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGlzTGVuZ3RoKHZhbHVlKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsdWUgPT0gJ251bWJlcicgJiYgdmFsdWUgPiAtMSAmJiB2YWx1ZSAlIDEgPT0gMCAmJiB2YWx1ZSA8PSBNQVhfU0FGRV9JTlRFR0VSO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzTGVuZ3RoO1xuIiwiLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBvYmplY3QtbGlrZS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBvYmplY3QtbGlrZSwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBpc09iamVjdExpa2UodmFsdWUpIHtcbiAgcmV0dXJuICEhdmFsdWUgJiYgdHlwZW9mIHZhbHVlID09ICdvYmplY3QnO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzT2JqZWN0TGlrZTtcbiIsInZhciBiYXNlRm9ySW4gPSByZXF1aXJlKCcuL2Jhc2VGb3JJbicpLFxuICAgIGlzT2JqZWN0TGlrZSA9IHJlcXVpcmUoJy4vaXNPYmplY3RMaWtlJyk7XG5cbi8qKiBgT2JqZWN0I3RvU3RyaW5nYCByZXN1bHQgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RUYWcgPSAnW29iamVjdCBPYmplY3RdJztcblxuLyoqIFVzZWQgZm9yIG5hdGl2ZSBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIGNoZWNrIG9iamVjdHMgZm9yIG93biBwcm9wZXJ0aWVzLiAqL1xudmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0UHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbi8qKlxuICogVXNlZCB0byByZXNvbHZlIHRoZSBbYHRvU3RyaW5nVGFnYF0oaHR0cHM6Ly9wZW9wbGUubW96aWxsYS5vcmcvfmpvcmVuZG9yZmYvZXM2LWRyYWZ0Lmh0bWwjc2VjLW9iamVjdC5wcm90b3R5cGUudG9zdHJpbmcpXG4gKiBvZiB2YWx1ZXMuXG4gKi9cbnZhciBvYmpUb1N0cmluZyA9IG9iamVjdFByb3RvLnRvU3RyaW5nO1xuXG4vKipcbiAqIEEgZmFsbGJhY2sgaW1wbGVtZW50YXRpb24gb2YgYF8uaXNQbGFpbk9iamVjdGAgd2hpY2ggY2hlY2tzIGlmIGB2YWx1ZWBcbiAqIGlzIGFuIG9iamVjdCBjcmVhdGVkIGJ5IHRoZSBgT2JqZWN0YCBjb25zdHJ1Y3RvciBvciBoYXMgYSBgW1tQcm90b3R5cGVdXWBcbiAqIG9mIGBudWxsYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIHBsYWluIG9iamVjdCwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBzaGltSXNQbGFpbk9iamVjdCh2YWx1ZSkge1xuICB2YXIgQ3RvcjtcblxuICAvLyBFeGl0IGVhcmx5IGZvciBub24gYE9iamVjdGAgb2JqZWN0cy5cbiAgaWYgKCEoaXNPYmplY3RMaWtlKHZhbHVlKSAmJiBvYmpUb1N0cmluZy5jYWxsKHZhbHVlKSA9PSBvYmplY3RUYWcpIHx8XG4gICAgICAoIWhhc093blByb3BlcnR5LmNhbGwodmFsdWUsICdjb25zdHJ1Y3RvcicpICYmXG4gICAgICAgIChDdG9yID0gdmFsdWUuY29uc3RydWN0b3IsIHR5cGVvZiBDdG9yID09ICdmdW5jdGlvbicgJiYgIShDdG9yIGluc3RhbmNlb2YgQ3RvcikpKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICAvLyBJRSA8IDkgaXRlcmF0ZXMgaW5oZXJpdGVkIHByb3BlcnRpZXMgYmVmb3JlIG93biBwcm9wZXJ0aWVzLiBJZiB0aGUgZmlyc3RcbiAgLy8gaXRlcmF0ZWQgcHJvcGVydHkgaXMgYW4gb2JqZWN0J3Mgb3duIHByb3BlcnR5IHRoZW4gdGhlcmUgYXJlIG5vIGluaGVyaXRlZFxuICAvLyBlbnVtZXJhYmxlIHByb3BlcnRpZXMuXG4gIHZhciByZXN1bHQ7XG4gIC8vIEluIG1vc3QgZW52aXJvbm1lbnRzIGFuIG9iamVjdCdzIG93biBwcm9wZXJ0aWVzIGFyZSBpdGVyYXRlZCBiZWZvcmVcbiAgLy8gaXRzIGluaGVyaXRlZCBwcm9wZXJ0aWVzLiBJZiB0aGUgbGFzdCBpdGVyYXRlZCBwcm9wZXJ0eSBpcyBhbiBvYmplY3Qnc1xuICAvLyBvd24gcHJvcGVydHkgdGhlbiB0aGVyZSBhcmUgbm8gaW5oZXJpdGVkIGVudW1lcmFibGUgcHJvcGVydGllcy5cbiAgYmFzZUZvckluKHZhbHVlLCBmdW5jdGlvbihzdWJWYWx1ZSwga2V5KSB7XG4gICAgcmVzdWx0ID0ga2V5O1xuICB9KTtcbiAgcmV0dXJuIHJlc3VsdCA9PT0gdW5kZWZpbmVkIHx8IGhhc093blByb3BlcnR5LmNhbGwodmFsdWUsIHJlc3VsdCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gc2hpbUlzUGxhaW5PYmplY3Q7XG4iLCJ2YXIgaXNBcmd1bWVudHMgPSByZXF1aXJlKCcuLi9sYW5nL2lzQXJndW1lbnRzJyksXG4gICAgaXNBcnJheSA9IHJlcXVpcmUoJy4uL2xhbmcvaXNBcnJheScpLFxuICAgIGlzSW5kZXggPSByZXF1aXJlKCcuL2lzSW5kZXgnKSxcbiAgICBpc0xlbmd0aCA9IHJlcXVpcmUoJy4vaXNMZW5ndGgnKSxcbiAgICBrZXlzSW4gPSByZXF1aXJlKCcuLi9vYmplY3Qva2V5c0luJyk7XG5cbi8qKiBVc2VkIGZvciBuYXRpdmUgbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKiogVXNlZCB0byBjaGVjayBvYmplY3RzIGZvciBvd24gcHJvcGVydGllcy4gKi9cbnZhciBoYXNPd25Qcm9wZXJ0eSA9IG9iamVjdFByb3RvLmhhc093blByb3BlcnR5O1xuXG4vKipcbiAqIEEgZmFsbGJhY2sgaW1wbGVtZW50YXRpb24gb2YgYE9iamVjdC5rZXlzYCB3aGljaCBjcmVhdGVzIGFuIGFycmF5IG9mIHRoZVxuICogb3duIGVudW1lcmFibGUgcHJvcGVydHkgbmFtZXMgb2YgYG9iamVjdGAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBxdWVyeS5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgYXJyYXkgb2YgcHJvcGVydHkgbmFtZXMuXG4gKi9cbmZ1bmN0aW9uIHNoaW1LZXlzKG9iamVjdCkge1xuICB2YXIgcHJvcHMgPSBrZXlzSW4ob2JqZWN0KSxcbiAgICAgIHByb3BzTGVuZ3RoID0gcHJvcHMubGVuZ3RoLFxuICAgICAgbGVuZ3RoID0gcHJvcHNMZW5ndGggJiYgb2JqZWN0Lmxlbmd0aDtcblxuICB2YXIgYWxsb3dJbmRleGVzID0gISFsZW5ndGggJiYgaXNMZW5ndGgobGVuZ3RoKSAmJlxuICAgIChpc0FycmF5KG9iamVjdCkgfHwgaXNBcmd1bWVudHMob2JqZWN0KSk7XG5cbiAgdmFyIGluZGV4ID0gLTEsXG4gICAgICByZXN1bHQgPSBbXTtcblxuICB3aGlsZSAoKytpbmRleCA8IHByb3BzTGVuZ3RoKSB7XG4gICAgdmFyIGtleSA9IHByb3BzW2luZGV4XTtcbiAgICBpZiAoKGFsbG93SW5kZXhlcyAmJiBpc0luZGV4KGtleSwgbGVuZ3RoKSkgfHwgaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIGtleSkpIHtcbiAgICAgIHJlc3VsdC5wdXNoKGtleSk7XG4gICAgfVxuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gc2hpbUtleXM7XG4iLCJ2YXIgaXNPYmplY3QgPSByZXF1aXJlKCcuLi9sYW5nL2lzT2JqZWN0Jyk7XG5cbi8qKlxuICogQ29udmVydHMgYHZhbHVlYCB0byBhbiBvYmplY3QgaWYgaXQncyBub3Qgb25lLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBwcm9jZXNzLlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyB0aGUgb2JqZWN0LlxuICovXG5mdW5jdGlvbiB0b09iamVjdCh2YWx1ZSkge1xuICByZXR1cm4gaXNPYmplY3QodmFsdWUpID8gdmFsdWUgOiBPYmplY3QodmFsdWUpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHRvT2JqZWN0O1xuIiwidmFyIGlzQXJyYXlMaWtlID0gcmVxdWlyZSgnLi4vaW50ZXJuYWwvaXNBcnJheUxpa2UnKSxcbiAgICBpc09iamVjdExpa2UgPSByZXF1aXJlKCcuLi9pbnRlcm5hbC9pc09iamVjdExpa2UnKTtcblxuLyoqIGBPYmplY3QjdG9TdHJpbmdgIHJlc3VsdCByZWZlcmVuY2VzLiAqL1xudmFyIGFyZ3NUYWcgPSAnW29iamVjdCBBcmd1bWVudHNdJztcblxuLyoqIFVzZWQgZm9yIG5hdGl2ZSBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKlxuICogVXNlZCB0byByZXNvbHZlIHRoZSBbYHRvU3RyaW5nVGFnYF0oaHR0cHM6Ly9wZW9wbGUubW96aWxsYS5vcmcvfmpvcmVuZG9yZmYvZXM2LWRyYWZ0Lmh0bWwjc2VjLW9iamVjdC5wcm90b3R5cGUudG9zdHJpbmcpXG4gKiBvZiB2YWx1ZXMuXG4gKi9cbnZhciBvYmpUb1N0cmluZyA9IG9iamVjdFByb3RvLnRvU3RyaW5nO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGNsYXNzaWZpZWQgYXMgYW4gYGFyZ3VtZW50c2Agb2JqZWN0LlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBjb3JyZWN0bHkgY2xhc3NpZmllZCwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzQXJndW1lbnRzKGZ1bmN0aW9uKCkgeyByZXR1cm4gYXJndW1lbnRzOyB9KCkpO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNBcmd1bWVudHMoWzEsIDIsIDNdKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQXJndW1lbnRzKHZhbHVlKSB7XG4gIHJldHVybiBpc09iamVjdExpa2UodmFsdWUpICYmIGlzQXJyYXlMaWtlKHZhbHVlKSAmJiBvYmpUb1N0cmluZy5jYWxsKHZhbHVlKSA9PSBhcmdzVGFnO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzQXJndW1lbnRzO1xuIiwidmFyIGdldE5hdGl2ZSA9IHJlcXVpcmUoJy4uL2ludGVybmFsL2dldE5hdGl2ZScpLFxuICAgIGlzTGVuZ3RoID0gcmVxdWlyZSgnLi4vaW50ZXJuYWwvaXNMZW5ndGgnKSxcbiAgICBpc09iamVjdExpa2UgPSByZXF1aXJlKCcuLi9pbnRlcm5hbC9pc09iamVjdExpa2UnKTtcblxuLyoqIGBPYmplY3QjdG9TdHJpbmdgIHJlc3VsdCByZWZlcmVuY2VzLiAqL1xudmFyIGFycmF5VGFnID0gJ1tvYmplY3QgQXJyYXldJztcblxuLyoqIFVzZWQgZm9yIG5hdGl2ZSBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKlxuICogVXNlZCB0byByZXNvbHZlIHRoZSBbYHRvU3RyaW5nVGFnYF0oaHR0cHM6Ly9wZW9wbGUubW96aWxsYS5vcmcvfmpvcmVuZG9yZmYvZXM2LWRyYWZ0Lmh0bWwjc2VjLW9iamVjdC5wcm90b3R5cGUudG9zdHJpbmcpXG4gKiBvZiB2YWx1ZXMuXG4gKi9cbnZhciBvYmpUb1N0cmluZyA9IG9iamVjdFByb3RvLnRvU3RyaW5nO1xuXG4vKiBOYXRpdmUgbWV0aG9kIHJlZmVyZW5jZXMgZm9yIHRob3NlIHdpdGggdGhlIHNhbWUgbmFtZSBhcyBvdGhlciBgbG9kYXNoYCBtZXRob2RzLiAqL1xudmFyIG5hdGl2ZUlzQXJyYXkgPSBnZXROYXRpdmUoQXJyYXksICdpc0FycmF5Jyk7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgY2xhc3NpZmllZCBhcyBhbiBgQXJyYXlgIG9iamVjdC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgY29ycmVjdGx5IGNsYXNzaWZpZWQsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc0FycmF5KFsxLCAyLCAzXSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc0FycmF5KGZ1bmN0aW9uKCkgeyByZXR1cm4gYXJndW1lbnRzOyB9KCkpO1xuICogLy8gPT4gZmFsc2VcbiAqL1xudmFyIGlzQXJyYXkgPSBuYXRpdmVJc0FycmF5IHx8IGZ1bmN0aW9uKHZhbHVlKSB7XG4gIHJldHVybiBpc09iamVjdExpa2UodmFsdWUpICYmIGlzTGVuZ3RoKHZhbHVlLmxlbmd0aCkgJiYgb2JqVG9TdHJpbmcuY2FsbCh2YWx1ZSkgPT0gYXJyYXlUYWc7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGlzQXJyYXk7XG4iLCJ2YXIgZXNjYXBlUmVnRXhwID0gcmVxdWlyZSgnLi4vc3RyaW5nL2VzY2FwZVJlZ0V4cCcpLFxuICAgIGlzT2JqZWN0TGlrZSA9IHJlcXVpcmUoJy4uL2ludGVybmFsL2lzT2JqZWN0TGlrZScpO1xuXG4vKiogYE9iamVjdCN0b1N0cmluZ2AgcmVzdWx0IHJlZmVyZW5jZXMuICovXG52YXIgZnVuY1RhZyA9ICdbb2JqZWN0IEZ1bmN0aW9uXSc7XG5cbi8qKiBVc2VkIHRvIGRldGVjdCBob3N0IGNvbnN0cnVjdG9ycyAoU2FmYXJpID4gNSkuICovXG52YXIgcmVJc0hvc3RDdG9yID0gL15cXFtvYmplY3QgLis/Q29uc3RydWN0b3JcXF0kLztcblxuLyoqIFVzZWQgZm9yIG5hdGl2ZSBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIHJlc29sdmUgdGhlIGRlY29tcGlsZWQgc291cmNlIG9mIGZ1bmN0aW9ucy4gKi9cbnZhciBmblRvU3RyaW5nID0gRnVuY3Rpb24ucHJvdG90eXBlLnRvU3RyaW5nO1xuXG4vKiogVXNlZCB0byBjaGVjayBvYmplY3RzIGZvciBvd24gcHJvcGVydGllcy4gKi9cbnZhciBoYXNPd25Qcm9wZXJ0eSA9IG9iamVjdFByb3RvLmhhc093blByb3BlcnR5O1xuXG4vKipcbiAqIFVzZWQgdG8gcmVzb2x2ZSB0aGUgW2B0b1N0cmluZ1RhZ2BdKGh0dHBzOi8vcGVvcGxlLm1vemlsbGEub3JnL35qb3JlbmRvcmZmL2VzNi1kcmFmdC5odG1sI3NlYy1vYmplY3QucHJvdG90eXBlLnRvc3RyaW5nKVxuICogb2YgdmFsdWVzLlxuICovXG52YXIgb2JqVG9TdHJpbmcgPSBvYmplY3RQcm90by50b1N0cmluZztcblxuLyoqIFVzZWQgdG8gZGV0ZWN0IGlmIGEgbWV0aG9kIGlzIG5hdGl2ZS4gKi9cbnZhciByZUlzTmF0aXZlID0gUmVnRXhwKCdeJyArXG4gIGVzY2FwZVJlZ0V4cChmblRvU3RyaW5nLmNhbGwoaGFzT3duUHJvcGVydHkpKVxuICAucmVwbGFjZSgvaGFzT3duUHJvcGVydHl8KGZ1bmN0aW9uKS4qPyg/PVxcXFxcXCgpfCBmb3IgLis/KD89XFxcXFxcXSkvZywgJyQxLio/JykgKyAnJCdcbik7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgYSBuYXRpdmUgZnVuY3Rpb24uXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgbmF0aXZlIGZ1bmN0aW9uLCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNOYXRpdmUoQXJyYXkucHJvdG90eXBlLnB1c2gpO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNOYXRpdmUoXyk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc05hdGl2ZSh2YWx1ZSkge1xuICBpZiAodmFsdWUgPT0gbnVsbCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBpZiAob2JqVG9TdHJpbmcuY2FsbCh2YWx1ZSkgPT0gZnVuY1RhZykge1xuICAgIHJldHVybiByZUlzTmF0aXZlLnRlc3QoZm5Ub1N0cmluZy5jYWxsKHZhbHVlKSk7XG4gIH1cbiAgcmV0dXJuIGlzT2JqZWN0TGlrZSh2YWx1ZSkgJiYgcmVJc0hvc3RDdG9yLnRlc3QodmFsdWUpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzTmF0aXZlO1xuIiwiLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyB0aGUgW2xhbmd1YWdlIHR5cGVdKGh0dHBzOi8vZXM1LmdpdGh1Yi5pby8jeDgpIG9mIGBPYmplY3RgLlxuICogKGUuZy4gYXJyYXlzLCBmdW5jdGlvbnMsIG9iamVjdHMsIHJlZ2V4ZXMsIGBuZXcgTnVtYmVyKDApYCwgYW5kIGBuZXcgU3RyaW5nKCcnKWApXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGFuIG9iamVjdCwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzT2JqZWN0KHt9KTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0KFsxLCAyLCAzXSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdCgxKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzT2JqZWN0KHZhbHVlKSB7XG4gIC8vIEF2b2lkIGEgVjggSklUIGJ1ZyBpbiBDaHJvbWUgMTktMjAuXG4gIC8vIFNlZSBodHRwczovL2NvZGUuZ29vZ2xlLmNvbS9wL3Y4L2lzc3Vlcy9kZXRhaWw/aWQ9MjI5MSBmb3IgbW9yZSBkZXRhaWxzLlxuICB2YXIgdHlwZSA9IHR5cGVvZiB2YWx1ZTtcbiAgcmV0dXJuICEhdmFsdWUgJiYgKHR5cGUgPT0gJ29iamVjdCcgfHwgdHlwZSA9PSAnZnVuY3Rpb24nKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpc09iamVjdDtcbiIsInZhciBnZXROYXRpdmUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbC9nZXROYXRpdmUnKSxcbiAgICBzaGltSXNQbGFpbk9iamVjdCA9IHJlcXVpcmUoJy4uL2ludGVybmFsL3NoaW1Jc1BsYWluT2JqZWN0Jyk7XG5cbi8qKiBgT2JqZWN0I3RvU3RyaW5nYCByZXN1bHQgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RUYWcgPSAnW29iamVjdCBPYmplY3RdJztcblxuLyoqIFVzZWQgZm9yIG5hdGl2ZSBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKlxuICogVXNlZCB0byByZXNvbHZlIHRoZSBbYHRvU3RyaW5nVGFnYF0oaHR0cHM6Ly9wZW9wbGUubW96aWxsYS5vcmcvfmpvcmVuZG9yZmYvZXM2LWRyYWZ0Lmh0bWwjc2VjLW9iamVjdC5wcm90b3R5cGUudG9zdHJpbmcpXG4gKiBvZiB2YWx1ZXMuXG4gKi9cbnZhciBvYmpUb1N0cmluZyA9IG9iamVjdFByb3RvLnRvU3RyaW5nO1xuXG4vKiogTmF0aXZlIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIGdldFByb3RvdHlwZU9mID0gZ2V0TmF0aXZlKE9iamVjdCwgJ2dldFByb3RvdHlwZU9mJyk7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgYSBwbGFpbiBvYmplY3QsIHRoYXQgaXMsIGFuIG9iamVjdCBjcmVhdGVkIGJ5IHRoZVxuICogYE9iamVjdGAgY29uc3RydWN0b3Igb3Igb25lIHdpdGggYSBgW1tQcm90b3R5cGVdXWAgb2YgYG51bGxgLlxuICpcbiAqICoqTm90ZToqKiBUaGlzIG1ldGhvZCBhc3N1bWVzIG9iamVjdHMgY3JlYXRlZCBieSB0aGUgYE9iamVjdGAgY29uc3RydWN0b3JcbiAqIGhhdmUgbm8gaW5oZXJpdGVkIGVudW1lcmFibGUgcHJvcGVydGllcy5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSBwbGFpbiBvYmplY3QsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogZnVuY3Rpb24gRm9vKCkge1xuICogICB0aGlzLmEgPSAxO1xuICogfVxuICpcbiAqIF8uaXNQbGFpbk9iamVjdChuZXcgRm9vKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5pc1BsYWluT2JqZWN0KFsxLCAyLCAzXSk7XG4gKiAvLyA9PiBmYWxzZVxuICpcbiAqIF8uaXNQbGFpbk9iamVjdCh7ICd4JzogMCwgJ3knOiAwIH0pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNQbGFpbk9iamVjdChPYmplY3QuY3JlYXRlKG51bGwpKTtcbiAqIC8vID0+IHRydWVcbiAqL1xudmFyIGlzUGxhaW5PYmplY3QgPSAhZ2V0UHJvdG90eXBlT2YgPyBzaGltSXNQbGFpbk9iamVjdCA6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gIGlmICghKHZhbHVlICYmIG9ialRvU3RyaW5nLmNhbGwodmFsdWUpID09IG9iamVjdFRhZykpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgdmFyIHZhbHVlT2YgPSBnZXROYXRpdmUodmFsdWUsICd2YWx1ZU9mJyksXG4gICAgICBvYmpQcm90byA9IHZhbHVlT2YgJiYgKG9ialByb3RvID0gZ2V0UHJvdG90eXBlT2YodmFsdWVPZikpICYmIGdldFByb3RvdHlwZU9mKG9ialByb3RvKTtcblxuICByZXR1cm4gb2JqUHJvdG9cbiAgICA/ICh2YWx1ZSA9PSBvYmpQcm90byB8fCBnZXRQcm90b3R5cGVPZih2YWx1ZSkgPT0gb2JqUHJvdG8pXG4gICAgOiBzaGltSXNQbGFpbk9iamVjdCh2YWx1ZSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGlzUGxhaW5PYmplY3Q7XG4iLCJ2YXIgaXNPYmplY3RMaWtlID0gcmVxdWlyZSgnLi4vaW50ZXJuYWwvaXNPYmplY3RMaWtlJyk7XG5cbi8qKiBgT2JqZWN0I3RvU3RyaW5nYCByZXN1bHQgcmVmZXJlbmNlcy4gKi9cbnZhciBzdHJpbmdUYWcgPSAnW29iamVjdCBTdHJpbmddJztcblxuLyoqIFVzZWQgZm9yIG5hdGl2ZSBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKlxuICogVXNlZCB0byByZXNvbHZlIHRoZSBbYHRvU3RyaW5nVGFnYF0oaHR0cHM6Ly9wZW9wbGUubW96aWxsYS5vcmcvfmpvcmVuZG9yZmYvZXM2LWRyYWZ0Lmh0bWwjc2VjLW9iamVjdC5wcm90b3R5cGUudG9zdHJpbmcpXG4gKiBvZiB2YWx1ZXMuXG4gKi9cbnZhciBvYmpUb1N0cmluZyA9IG9iamVjdFByb3RvLnRvU3RyaW5nO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGNsYXNzaWZpZWQgYXMgYSBgU3RyaW5nYCBwcmltaXRpdmUgb3Igb2JqZWN0LlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBjb3JyZWN0bHkgY2xhc3NpZmllZCwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzU3RyaW5nKCdhYmMnKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzU3RyaW5nKDEpO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNTdHJpbmcodmFsdWUpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PSAnc3RyaW5nJyB8fCAoaXNPYmplY3RMaWtlKHZhbHVlKSAmJiBvYmpUb1N0cmluZy5jYWxsKHZhbHVlKSA9PSBzdHJpbmdUYWcpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzU3RyaW5nO1xuIiwidmFyIGlzTGVuZ3RoID0gcmVxdWlyZSgnLi4vaW50ZXJuYWwvaXNMZW5ndGgnKSxcbiAgICBpc09iamVjdExpa2UgPSByZXF1aXJlKCcuLi9pbnRlcm5hbC9pc09iamVjdExpa2UnKTtcblxuLyoqIGBPYmplY3QjdG9TdHJpbmdgIHJlc3VsdCByZWZlcmVuY2VzLiAqL1xudmFyIGFyZ3NUYWcgPSAnW29iamVjdCBBcmd1bWVudHNdJyxcbiAgICBhcnJheVRhZyA9ICdbb2JqZWN0IEFycmF5XScsXG4gICAgYm9vbFRhZyA9ICdbb2JqZWN0IEJvb2xlYW5dJyxcbiAgICBkYXRlVGFnID0gJ1tvYmplY3QgRGF0ZV0nLFxuICAgIGVycm9yVGFnID0gJ1tvYmplY3QgRXJyb3JdJyxcbiAgICBmdW5jVGFnID0gJ1tvYmplY3QgRnVuY3Rpb25dJyxcbiAgICBtYXBUYWcgPSAnW29iamVjdCBNYXBdJyxcbiAgICBudW1iZXJUYWcgPSAnW29iamVjdCBOdW1iZXJdJyxcbiAgICBvYmplY3RUYWcgPSAnW29iamVjdCBPYmplY3RdJyxcbiAgICByZWdleHBUYWcgPSAnW29iamVjdCBSZWdFeHBdJyxcbiAgICBzZXRUYWcgPSAnW29iamVjdCBTZXRdJyxcbiAgICBzdHJpbmdUYWcgPSAnW29iamVjdCBTdHJpbmddJyxcbiAgICB3ZWFrTWFwVGFnID0gJ1tvYmplY3QgV2Vha01hcF0nO1xuXG52YXIgYXJyYXlCdWZmZXJUYWcgPSAnW29iamVjdCBBcnJheUJ1ZmZlcl0nLFxuICAgIGZsb2F0MzJUYWcgPSAnW29iamVjdCBGbG9hdDMyQXJyYXldJyxcbiAgICBmbG9hdDY0VGFnID0gJ1tvYmplY3QgRmxvYXQ2NEFycmF5XScsXG4gICAgaW50OFRhZyA9ICdbb2JqZWN0IEludDhBcnJheV0nLFxuICAgIGludDE2VGFnID0gJ1tvYmplY3QgSW50MTZBcnJheV0nLFxuICAgIGludDMyVGFnID0gJ1tvYmplY3QgSW50MzJBcnJheV0nLFxuICAgIHVpbnQ4VGFnID0gJ1tvYmplY3QgVWludDhBcnJheV0nLFxuICAgIHVpbnQ4Q2xhbXBlZFRhZyA9ICdbb2JqZWN0IFVpbnQ4Q2xhbXBlZEFycmF5XScsXG4gICAgdWludDE2VGFnID0gJ1tvYmplY3QgVWludDE2QXJyYXldJyxcbiAgICB1aW50MzJUYWcgPSAnW29iamVjdCBVaW50MzJBcnJheV0nO1xuXG4vKiogVXNlZCB0byBpZGVudGlmeSBgdG9TdHJpbmdUYWdgIHZhbHVlcyBvZiB0eXBlZCBhcnJheXMuICovXG52YXIgdHlwZWRBcnJheVRhZ3MgPSB7fTtcbnR5cGVkQXJyYXlUYWdzW2Zsb2F0MzJUYWddID0gdHlwZWRBcnJheVRhZ3NbZmxvYXQ2NFRhZ10gPVxudHlwZWRBcnJheVRhZ3NbaW50OFRhZ10gPSB0eXBlZEFycmF5VGFnc1tpbnQxNlRhZ10gPVxudHlwZWRBcnJheVRhZ3NbaW50MzJUYWddID0gdHlwZWRBcnJheVRhZ3NbdWludDhUYWddID1cbnR5cGVkQXJyYXlUYWdzW3VpbnQ4Q2xhbXBlZFRhZ10gPSB0eXBlZEFycmF5VGFnc1t1aW50MTZUYWddID1cbnR5cGVkQXJyYXlUYWdzW3VpbnQzMlRhZ10gPSB0cnVlO1xudHlwZWRBcnJheVRhZ3NbYXJnc1RhZ10gPSB0eXBlZEFycmF5VGFnc1thcnJheVRhZ10gPVxudHlwZWRBcnJheVRhZ3NbYXJyYXlCdWZmZXJUYWddID0gdHlwZWRBcnJheVRhZ3NbYm9vbFRhZ10gPVxudHlwZWRBcnJheVRhZ3NbZGF0ZVRhZ10gPSB0eXBlZEFycmF5VGFnc1tlcnJvclRhZ10gPVxudHlwZWRBcnJheVRhZ3NbZnVuY1RhZ10gPSB0eXBlZEFycmF5VGFnc1ttYXBUYWddID1cbnR5cGVkQXJyYXlUYWdzW251bWJlclRhZ10gPSB0eXBlZEFycmF5VGFnc1tvYmplY3RUYWddID1cbnR5cGVkQXJyYXlUYWdzW3JlZ2V4cFRhZ10gPSB0eXBlZEFycmF5VGFnc1tzZXRUYWddID1cbnR5cGVkQXJyYXlUYWdzW3N0cmluZ1RhZ10gPSB0eXBlZEFycmF5VGFnc1t3ZWFrTWFwVGFnXSA9IGZhbHNlO1xuXG4vKiogVXNlZCBmb3IgbmF0aXZlIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqXG4gKiBVc2VkIHRvIHJlc29sdmUgdGhlIFtgdG9TdHJpbmdUYWdgXShodHRwczovL3Blb3BsZS5tb3ppbGxhLm9yZy9+am9yZW5kb3JmZi9lczYtZHJhZnQuaHRtbCNzZWMtb2JqZWN0LnByb3RvdHlwZS50b3N0cmluZylcbiAqIG9mIHZhbHVlcy5cbiAqL1xudmFyIG9ialRvU3RyaW5nID0gb2JqZWN0UHJvdG8udG9TdHJpbmc7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgY2xhc3NpZmllZCBhcyBhIHR5cGVkIGFycmF5LlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBjb3JyZWN0bHkgY2xhc3NpZmllZCwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzVHlwZWRBcnJheShuZXcgVWludDhBcnJheSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc1R5cGVkQXJyYXkoW10pO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNUeXBlZEFycmF5KHZhbHVlKSB7XG4gIHJldHVybiBpc09iamVjdExpa2UodmFsdWUpICYmIGlzTGVuZ3RoKHZhbHVlLmxlbmd0aCkgJiYgISF0eXBlZEFycmF5VGFnc1tvYmpUb1N0cmluZy5jYWxsKHZhbHVlKV07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaXNUeXBlZEFycmF5O1xuIiwidmFyIGJhc2VDb3B5ID0gcmVxdWlyZSgnLi4vaW50ZXJuYWwvYmFzZUNvcHknKSxcbiAgICBrZXlzSW4gPSByZXF1aXJlKCcuLi9vYmplY3Qva2V5c0luJyk7XG5cbi8qKlxuICogQ29udmVydHMgYHZhbHVlYCB0byBhIHBsYWluIG9iamVjdCBmbGF0dGVuaW5nIGluaGVyaXRlZCBlbnVtZXJhYmxlXG4gKiBwcm9wZXJ0aWVzIG9mIGB2YWx1ZWAgdG8gb3duIHByb3BlcnRpZXMgb2YgdGhlIHBsYWluIG9iamVjdC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNvbnZlcnQuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIHRoZSBjb252ZXJ0ZWQgcGxhaW4gb2JqZWN0LlxuICogQGV4YW1wbGVcbiAqXG4gKiBmdW5jdGlvbiBGb28oKSB7XG4gKiAgIHRoaXMuYiA9IDI7XG4gKiB9XG4gKlxuICogRm9vLnByb3RvdHlwZS5jID0gMztcbiAqXG4gKiBfLmFzc2lnbih7ICdhJzogMSB9LCBuZXcgRm9vKTtcbiAqIC8vID0+IHsgJ2EnOiAxLCAnYic6IDIgfVxuICpcbiAqIF8uYXNzaWduKHsgJ2EnOiAxIH0sIF8udG9QbGFpbk9iamVjdChuZXcgRm9vKSk7XG4gKiAvLyA9PiB7ICdhJzogMSwgJ2InOiAyLCAnYyc6IDMgfVxuICovXG5mdW5jdGlvbiB0b1BsYWluT2JqZWN0KHZhbHVlKSB7XG4gIHJldHVybiBiYXNlQ29weSh2YWx1ZSwga2V5c0luKHZhbHVlKSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gdG9QbGFpbk9iamVjdDtcbiIsInZhciBnZXROYXRpdmUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbC9nZXROYXRpdmUnKSxcbiAgICBpc0FycmF5TGlrZSA9IHJlcXVpcmUoJy4uL2ludGVybmFsL2lzQXJyYXlMaWtlJyksXG4gICAgaXNPYmplY3QgPSByZXF1aXJlKCcuLi9sYW5nL2lzT2JqZWN0JyksXG4gICAgc2hpbUtleXMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbC9zaGltS2V5cycpO1xuXG4vKiBOYXRpdmUgbWV0aG9kIHJlZmVyZW5jZXMgZm9yIHRob3NlIHdpdGggdGhlIHNhbWUgbmFtZSBhcyBvdGhlciBgbG9kYXNoYCBtZXRob2RzLiAqL1xudmFyIG5hdGl2ZUtleXMgPSBnZXROYXRpdmUoT2JqZWN0LCAna2V5cycpO1xuXG4vKipcbiAqIENyZWF0ZXMgYW4gYXJyYXkgb2YgdGhlIG93biBlbnVtZXJhYmxlIHByb3BlcnR5IG5hbWVzIG9mIGBvYmplY3RgLlxuICpcbiAqICoqTm90ZToqKiBOb24tb2JqZWN0IHZhbHVlcyBhcmUgY29lcmNlZCB0byBvYmplY3RzLiBTZWUgdGhlXG4gKiBbRVMgc3BlY10oaHR0cHM6Ly9wZW9wbGUubW96aWxsYS5vcmcvfmpvcmVuZG9yZmYvZXM2LWRyYWZ0Lmh0bWwjc2VjLW9iamVjdC5rZXlzKVxuICogZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQGNhdGVnb3J5IE9iamVjdFxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBhcnJheSBvZiBwcm9wZXJ0eSBuYW1lcy5cbiAqIEBleGFtcGxlXG4gKlxuICogZnVuY3Rpb24gRm9vKCkge1xuICogICB0aGlzLmEgPSAxO1xuICogICB0aGlzLmIgPSAyO1xuICogfVxuICpcbiAqIEZvby5wcm90b3R5cGUuYyA9IDM7XG4gKlxuICogXy5rZXlzKG5ldyBGb28pO1xuICogLy8gPT4gWydhJywgJ2InXSAoaXRlcmF0aW9uIG9yZGVyIGlzIG5vdCBndWFyYW50ZWVkKVxuICpcbiAqIF8ua2V5cygnaGknKTtcbiAqIC8vID0+IFsnMCcsICcxJ11cbiAqL1xudmFyIGtleXMgPSAhbmF0aXZlS2V5cyA/IHNoaW1LZXlzIDogZnVuY3Rpb24ob2JqZWN0KSB7XG4gIHZhciBDdG9yID0gb2JqZWN0ID09IG51bGwgPyBudWxsIDogb2JqZWN0LmNvbnN0cnVjdG9yO1xuICBpZiAoKHR5cGVvZiBDdG9yID09ICdmdW5jdGlvbicgJiYgQ3Rvci5wcm90b3R5cGUgPT09IG9iamVjdCkgfHxcbiAgICAgICh0eXBlb2Ygb2JqZWN0ICE9ICdmdW5jdGlvbicgJiYgaXNBcnJheUxpa2Uob2JqZWN0KSkpIHtcbiAgICByZXR1cm4gc2hpbUtleXMob2JqZWN0KTtcbiAgfVxuICByZXR1cm4gaXNPYmplY3Qob2JqZWN0KSA/IG5hdGl2ZUtleXMob2JqZWN0KSA6IFtdO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBrZXlzO1xuIiwidmFyIGlzQXJndW1lbnRzID0gcmVxdWlyZSgnLi4vbGFuZy9pc0FyZ3VtZW50cycpLFxuICAgIGlzQXJyYXkgPSByZXF1aXJlKCcuLi9sYW5nL2lzQXJyYXknKSxcbiAgICBpc0luZGV4ID0gcmVxdWlyZSgnLi4vaW50ZXJuYWwvaXNJbmRleCcpLFxuICAgIGlzTGVuZ3RoID0gcmVxdWlyZSgnLi4vaW50ZXJuYWwvaXNMZW5ndGgnKSxcbiAgICBpc09iamVjdCA9IHJlcXVpcmUoJy4uL2xhbmcvaXNPYmplY3QnKTtcblxuLyoqIFVzZWQgZm9yIG5hdGl2ZSBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIGNoZWNrIG9iamVjdHMgZm9yIG93biBwcm9wZXJ0aWVzLiAqL1xudmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0UHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBhcnJheSBvZiB0aGUgb3duIGFuZCBpbmhlcml0ZWQgZW51bWVyYWJsZSBwcm9wZXJ0eSBuYW1lcyBvZiBgb2JqZWN0YC5cbiAqXG4gKiAqKk5vdGU6KiogTm9uLW9iamVjdCB2YWx1ZXMgYXJlIGNvZXJjZWQgdG8gb2JqZWN0cy5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQGNhdGVnb3J5IE9iamVjdFxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBhcnJheSBvZiBwcm9wZXJ0eSBuYW1lcy5cbiAqIEBleGFtcGxlXG4gKlxuICogZnVuY3Rpb24gRm9vKCkge1xuICogICB0aGlzLmEgPSAxO1xuICogICB0aGlzLmIgPSAyO1xuICogfVxuICpcbiAqIEZvby5wcm90b3R5cGUuYyA9IDM7XG4gKlxuICogXy5rZXlzSW4obmV3IEZvbyk7XG4gKiAvLyA9PiBbJ2EnLCAnYicsICdjJ10gKGl0ZXJhdGlvbiBvcmRlciBpcyBub3QgZ3VhcmFudGVlZClcbiAqL1xuZnVuY3Rpb24ga2V5c0luKG9iamVjdCkge1xuICBpZiAob2JqZWN0ID09IG51bGwpIHtcbiAgICByZXR1cm4gW107XG4gIH1cbiAgaWYgKCFpc09iamVjdChvYmplY3QpKSB7XG4gICAgb2JqZWN0ID0gT2JqZWN0KG9iamVjdCk7XG4gIH1cbiAgdmFyIGxlbmd0aCA9IG9iamVjdC5sZW5ndGg7XG4gIGxlbmd0aCA9IChsZW5ndGggJiYgaXNMZW5ndGgobGVuZ3RoKSAmJlxuICAgIChpc0FycmF5KG9iamVjdCkgfHwgaXNBcmd1bWVudHMob2JqZWN0KSkgJiYgbGVuZ3RoKSB8fCAwO1xuXG4gIHZhciBDdG9yID0gb2JqZWN0LmNvbnN0cnVjdG9yLFxuICAgICAgaW5kZXggPSAtMSxcbiAgICAgIGlzUHJvdG8gPSB0eXBlb2YgQ3RvciA9PSAnZnVuY3Rpb24nICYmIEN0b3IucHJvdG90eXBlID09PSBvYmplY3QsXG4gICAgICByZXN1bHQgPSBBcnJheShsZW5ndGgpLFxuICAgICAgc2tpcEluZGV4ZXMgPSBsZW5ndGggPiAwO1xuXG4gIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgcmVzdWx0W2luZGV4XSA9IChpbmRleCArICcnKTtcbiAgfVxuICBmb3IgKHZhciBrZXkgaW4gb2JqZWN0KSB7XG4gICAgaWYgKCEoc2tpcEluZGV4ZXMgJiYgaXNJbmRleChrZXksIGxlbmd0aCkpICYmXG4gICAgICAgICEoa2V5ID09ICdjb25zdHJ1Y3RvcicgJiYgKGlzUHJvdG8gfHwgIWhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBrZXkpKSkpIHtcbiAgICAgIHJlc3VsdC5wdXNoKGtleSk7XG4gICAgfVxuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ga2V5c0luO1xuIiwidmFyIGJhc2VNZXJnZSA9IHJlcXVpcmUoJy4uL2ludGVybmFsL2Jhc2VNZXJnZScpLFxuICAgIGNyZWF0ZUFzc2lnbmVyID0gcmVxdWlyZSgnLi4vaW50ZXJuYWwvY3JlYXRlQXNzaWduZXInKTtcblxuLyoqXG4gKiBSZWN1cnNpdmVseSBtZXJnZXMgb3duIGVudW1lcmFibGUgcHJvcGVydGllcyBvZiB0aGUgc291cmNlIG9iamVjdChzKSwgdGhhdFxuICogZG9uJ3QgcmVzb2x2ZSB0byBgdW5kZWZpbmVkYCBpbnRvIHRoZSBkZXN0aW5hdGlvbiBvYmplY3QuIFN1YnNlcXVlbnQgc291cmNlc1xuICogb3ZlcndyaXRlIHByb3BlcnR5IGFzc2lnbm1lbnRzIG9mIHByZXZpb3VzIHNvdXJjZXMuIElmIGBjdXN0b21pemVyYCBpc1xuICogcHJvdmlkZWQgaXQgaXMgaW52b2tlZCB0byBwcm9kdWNlIHRoZSBtZXJnZWQgdmFsdWVzIG9mIHRoZSBkZXN0aW5hdGlvbiBhbmRcbiAqIHNvdXJjZSBwcm9wZXJ0aWVzLiBJZiBgY3VzdG9taXplcmAgcmV0dXJucyBgdW5kZWZpbmVkYCBtZXJnaW5nIGlzIGhhbmRsZWRcbiAqIGJ5IHRoZSBtZXRob2QgaW5zdGVhZC4gVGhlIGBjdXN0b21pemVyYCBpcyBib3VuZCB0byBgdGhpc0FyZ2AgYW5kIGludm9rZWRcbiAqIHdpdGggZml2ZSBhcmd1bWVudHM6IChvYmplY3RWYWx1ZSwgc291cmNlVmFsdWUsIGtleSwgb2JqZWN0LCBzb3VyY2UpLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAY2F0ZWdvcnkgT2JqZWN0XG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBkZXN0aW5hdGlvbiBvYmplY3QuXG4gKiBAcGFyYW0gey4uLk9iamVjdH0gW3NvdXJjZXNdIFRoZSBzb3VyY2Ugb2JqZWN0cy5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IFtjdXN0b21pemVyXSBUaGUgZnVuY3Rpb24gdG8gY3VzdG9taXplIGFzc2lnbmVkIHZhbHVlcy5cbiAqIEBwYXJhbSB7Kn0gW3RoaXNBcmddIFRoZSBgdGhpc2AgYmluZGluZyBvZiBgY3VzdG9taXplcmAuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIGBvYmplY3RgLlxuICogQGV4YW1wbGVcbiAqXG4gKiB2YXIgdXNlcnMgPSB7XG4gKiAgICdkYXRhJzogW3sgJ3VzZXInOiAnYmFybmV5JyB9LCB7ICd1c2VyJzogJ2ZyZWQnIH1dXG4gKiB9O1xuICpcbiAqIHZhciBhZ2VzID0ge1xuICogICAnZGF0YSc6IFt7ICdhZ2UnOiAzNiB9LCB7ICdhZ2UnOiA0MCB9XVxuICogfTtcbiAqXG4gKiBfLm1lcmdlKHVzZXJzLCBhZ2VzKTtcbiAqIC8vID0+IHsgJ2RhdGEnOiBbeyAndXNlcic6ICdiYXJuZXknLCAnYWdlJzogMzYgfSwgeyAndXNlcic6ICdmcmVkJywgJ2FnZSc6IDQwIH1dIH1cbiAqXG4gKiAvLyB1c2luZyBhIGN1c3RvbWl6ZXIgY2FsbGJhY2tcbiAqIHZhciBvYmplY3QgPSB7XG4gKiAgICdmcnVpdHMnOiBbJ2FwcGxlJ10sXG4gKiAgICd2ZWdldGFibGVzJzogWydiZWV0J11cbiAqIH07XG4gKlxuICogdmFyIG90aGVyID0ge1xuICogICAnZnJ1aXRzJzogWydiYW5hbmEnXSxcbiAqICAgJ3ZlZ2V0YWJsZXMnOiBbJ2NhcnJvdCddXG4gKiB9O1xuICpcbiAqIF8ubWVyZ2Uob2JqZWN0LCBvdGhlciwgZnVuY3Rpb24oYSwgYikge1xuICogICBpZiAoXy5pc0FycmF5KGEpKSB7XG4gKiAgICAgcmV0dXJuIGEuY29uY2F0KGIpO1xuICogICB9XG4gKiB9KTtcbiAqIC8vID0+IHsgJ2ZydWl0cyc6IFsnYXBwbGUnLCAnYmFuYW5hJ10sICd2ZWdldGFibGVzJzogWydiZWV0JywgJ2NhcnJvdCddIH1cbiAqL1xudmFyIG1lcmdlID0gY3JlYXRlQXNzaWduZXIoYmFzZU1lcmdlKTtcblxubW9kdWxlLmV4cG9ydHMgPSBtZXJnZTtcbiIsInZhciBiYXNlVmFsdWVzID0gcmVxdWlyZSgnLi4vaW50ZXJuYWwvYmFzZVZhbHVlcycpLFxuICAgIGtleXMgPSByZXF1aXJlKCcuL2tleXMnKTtcblxuLyoqXG4gKiBDcmVhdGVzIGFuIGFycmF5IG9mIHRoZSBvd24gZW51bWVyYWJsZSBwcm9wZXJ0eSB2YWx1ZXMgb2YgYG9iamVjdGAuXG4gKlxuICogKipOb3RlOioqIE5vbi1vYmplY3QgdmFsdWVzIGFyZSBjb2VyY2VkIHRvIG9iamVjdHMuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBjYXRlZ29yeSBPYmplY3RcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBxdWVyeS5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgYXJyYXkgb2YgcHJvcGVydHkgdmFsdWVzLlxuICogQGV4YW1wbGVcbiAqXG4gKiBmdW5jdGlvbiBGb28oKSB7XG4gKiAgIHRoaXMuYSA9IDE7XG4gKiAgIHRoaXMuYiA9IDI7XG4gKiB9XG4gKlxuICogRm9vLnByb3RvdHlwZS5jID0gMztcbiAqXG4gKiBfLnZhbHVlcyhuZXcgRm9vKTtcbiAqIC8vID0+IFsxLCAyXSAoaXRlcmF0aW9uIG9yZGVyIGlzIG5vdCBndWFyYW50ZWVkKVxuICpcbiAqIF8udmFsdWVzKCdoaScpO1xuICogLy8gPT4gWydoJywgJ2knXVxuICovXG5mdW5jdGlvbiB2YWx1ZXMob2JqZWN0KSB7XG4gIHJldHVybiBiYXNlVmFsdWVzKG9iamVjdCwga2V5cyhvYmplY3QpKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB2YWx1ZXM7XG4iLCJ2YXIgYmFzZVRvU3RyaW5nID0gcmVxdWlyZSgnLi4vaW50ZXJuYWwvYmFzZVRvU3RyaW5nJyk7XG5cbi8qKlxuICogVXNlZCB0byBtYXRjaCBgUmVnRXhwYCBbc3BlY2lhbCBjaGFyYWN0ZXJzXShodHRwOi8vd3d3LnJlZ3VsYXItZXhwcmVzc2lvbnMuaW5mby9jaGFyYWN0ZXJzLmh0bWwjc3BlY2lhbCkuXG4gKiBJbiBhZGRpdGlvbiB0byBzcGVjaWFsIGNoYXJhY3RlcnMgdGhlIGZvcndhcmQgc2xhc2ggaXMgZXNjYXBlZCB0byBhbGxvdyBmb3JcbiAqIGVhc2llciBgZXZhbGAgdXNlIGFuZCBgRnVuY3Rpb25gIGNvbXBpbGF0aW9uLlxuICovXG52YXIgcmVSZWdFeHBDaGFycyA9IC9bLiorP14ke30oKXxbXFxdXFwvXFxcXF0vZyxcbiAgICByZUhhc1JlZ0V4cENoYXJzID0gUmVnRXhwKHJlUmVnRXhwQ2hhcnMuc291cmNlKTtcblxuLyoqXG4gKiBFc2NhcGVzIHRoZSBgUmVnRXhwYCBzcGVjaWFsIGNoYXJhY3RlcnMgXCJcXFwiLCBcIi9cIiwgXCJeXCIsIFwiJFwiLCBcIi5cIiwgXCJ8XCIsIFwiP1wiLFxuICogXCIqXCIsIFwiK1wiLCBcIihcIiwgXCIpXCIsIFwiW1wiLCBcIl1cIiwgXCJ7XCIgYW5kIFwifVwiIGluIGBzdHJpbmdgLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAY2F0ZWdvcnkgU3RyaW5nXG4gKiBAcGFyYW0ge3N0cmluZ30gW3N0cmluZz0nJ10gVGhlIHN0cmluZyB0byBlc2NhcGUuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBSZXR1cm5zIHRoZSBlc2NhcGVkIHN0cmluZy5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5lc2NhcGVSZWdFeHAoJ1tsb2Rhc2hdKGh0dHBzOi8vbG9kYXNoLmNvbS8pJyk7XG4gKiAvLyA9PiAnXFxbbG9kYXNoXFxdXFwoaHR0cHM6XFwvXFwvbG9kYXNoXFwuY29tXFwvXFwpJ1xuICovXG5mdW5jdGlvbiBlc2NhcGVSZWdFeHAoc3RyaW5nKSB7XG4gIHN0cmluZyA9IGJhc2VUb1N0cmluZyhzdHJpbmcpO1xuICByZXR1cm4gKHN0cmluZyAmJiByZUhhc1JlZ0V4cENoYXJzLnRlc3Qoc3RyaW5nKSlcbiAgICA/IHN0cmluZy5yZXBsYWNlKHJlUmVnRXhwQ2hhcnMsICdcXFxcJCYnKVxuICAgIDogc3RyaW5nO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGVzY2FwZVJlZ0V4cDtcbiIsIi8qKlxuICogVGhpcyBtZXRob2QgcmV0dXJucyB0aGUgZmlyc3QgYXJndW1lbnQgcHJvdmlkZWQgdG8gaXQuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBjYXRlZ29yeSBVdGlsaXR5XG4gKiBAcGFyYW0geyp9IHZhbHVlIEFueSB2YWx1ZS5cbiAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIGB2YWx1ZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIHZhciBvYmplY3QgPSB7ICd1c2VyJzogJ2ZyZWQnIH07XG4gKlxuICogXy5pZGVudGl0eShvYmplY3QpID09PSBvYmplY3Q7XG4gKiAvLyA9PiB0cnVlXG4gKi9cbmZ1bmN0aW9uIGlkZW50aXR5KHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpZGVudGl0eTtcbiIsInZhciBFbmdpbmUgPSByZXF1aXJlKCcuL3NyYy9lbmdpbmUnKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGluaXQ6IGZ1bmN0aW9uKGNhbnZhcywgbWV0aG9kcykge1xuICAgIHZhciBlbmdpbmUgPSBuZXcgRW5naW5lKGNhbnZhcywgbWV0aG9kcyk7XG4gICAgcmV0dXJuIGVuZ2luZS5jb250cm9sbGVyO1xuICB9XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL3NyYy9hdWRpby1tYW5hZ2VyJyk7XG4iLCJ2YXIgdXRpbCA9IHJlcXVpcmUoJ3V0aWwnKTtcbnZhciBMb2FkZWRBdWRpbyA9IHJlcXVpcmUoJy4vbG9hZGVkLWF1ZGlvJyk7XG5cbnZhciBBdWRpb01hbmFnZXIgPSBmdW5jdGlvbigpIHtcbiAgdmFyIEF1ZGlvQ29udGV4dCA9IHdpbmRvdy5BdWRpb0NvbnRleHQgfHwgd2luZG93LndlYmtpdEF1ZGlvQ29udGV4dDtcblxuICB0aGlzLl9jdHggPSBuZXcgQXVkaW9Db250ZXh0KCk7XG4gIHRoaXMuX21hc3RlckdhaW4gPSB0aGlzLl9jdHguY3JlYXRlR2FpbigpO1xuICB0aGlzLl92b2x1bWUgPSAxO1xuICB0aGlzLmlzTXV0ZWQgPSBmYWxzZTtcblxuICB2YXIgaU9TID0gLyhpUGFkfGlQaG9uZXxpUG9kKS9nLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCk7XG4gIGlmIChpT1MpIHtcbiAgICB0aGlzLl9lbmFibGVpT1MoKTtcbiAgfVxufTtcblxuQXVkaW9NYW5hZ2VyLnByb3RvdHlwZS5fZW5hYmxlaU9TID0gZnVuY3Rpb24oKSB7XG4gIHZhciBzZWxmID0gdGhpcztcblxuICB2YXIgdG91Y2ggPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgYnVmZmVyID0gc2VsZi5fY3R4LmNyZWF0ZUJ1ZmZlcigxLCAxLCAyMjA1MCk7XG4gICAgdmFyIHNvdXJjZSA9IHNlbGYuX2N0eC5jcmVhdGVCdWZmZXJTb3VyY2UoKTtcbiAgICBzb3VyY2UuYnVmZmVyID0gYnVmZmVyO1xuICAgIHNvdXJjZS5jb25uZWN0KHNlbGYuX2N0eC5kZXN0aW5hdGlvbik7XG4gICAgc291cmNlLnN0YXJ0KDApO1xuXG4gICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCB0b3VjaCwgZmFsc2UpO1xuICB9O1xuXG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgdG91Y2gsIGZhbHNlKTtcbn07XG5cbkF1ZGlvTWFuYWdlci5wcm90b3R5cGUubXV0ZSA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLmlzTXV0ZWQgPSB0cnVlO1xuICB0aGlzLl91cGRhdGVNdXRlKCk7XG59O1xuXG5BdWRpb01hbmFnZXIucHJvdG90eXBlLnVubXV0ZSA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLmlzTXV0ZWQgPSBmYWxzZTtcbiAgdGhpcy5fdXBkYXRlTXV0ZSgpO1xufTtcblxuQXVkaW9NYW5hZ2VyLnByb3RvdHlwZS50b2dnbGVNdXRlID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuaXNNdXRlZCA9ICF0aGlzLmlzTXV0ZWQ7XG4gIHRoaXMuX3VwZGF0ZU11dGUoKTtcbn07XG5cbkF1ZGlvTWFuYWdlci5wcm90b3R5cGUuX3VwZGF0ZU11dGUgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5fbWFzdGVyR2Fpbi5nYWluLnZhbHVlID0gdGhpcy5pc011dGVkID8gMCA6IHRoaXMuX3ZvbHVtZTtcbn07XG5cbkF1ZGlvTWFuYWdlci5wcm90b3R5cGUuc2V0Vm9sdW1lID0gZnVuY3Rpb24odm9sdW1lKSB7XG4gIHRoaXMuX3ZvbHVtZSA9IHZvbHVtZTtcbiAgdGhpcy5fbWFzdGVyR2Fpbi5nYWluLnZhbHVlID0gdm9sdW1lO1xufTtcblxuQXVkaW9NYW5hZ2VyLnByb3RvdHlwZS5sb2FkID0gZnVuY3Rpb24odXJsLCBjYWxsYmFjaykge1xuICB2YXIgbG9hZGVyID0ge1xuICAgIGRvbmU6IGZ1bmN0aW9uKCkge30sXG4gICAgZXJyb3I6IGZ1bmN0aW9uKCkge30sXG4gICAgcHJvZ3Jlc3M6IGZ1bmN0aW9uKCkge31cbiAgfTtcblxuICBpZiAoY2FsbGJhY2sgJiYgdXRpbC5pc0Z1bmN0aW9uKGNhbGxiYWNrKSkge1xuICAgIGxvYWRlci5kb25lID0gY2FsbGJhY2s7XG4gIH0gZWxzZSB7XG4gICAgaWYgKGNhbGxiYWNrLmRvbmUpIHtcbiAgICAgIGxvYWRlci5kb25lID0gY2FsbGJhY2suZG9uZTtcbiAgICB9XG5cbiAgICBpZiAoY2FsbGJhY2suZXJyb3IpIHtcbiAgICAgIGxvYWRlci5lcnJvciA9IGNhbGxiYWNrLmVycm9yO1xuICAgIH1cblxuICAgIGlmIChjYWxsYmFjay5wcm9ncmVzcykge1xuICAgICAgbG9hZGVyLnByb2dyZXNzID0gY2FsbGJhY2sucHJvZ3Jlc3M7XG4gICAgfVxuICB9XG5cbiAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gIHZhciByZXF1ZXN0ID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gIHJlcXVlc3Qub3BlbignR0VUJywgdXJsLCB0cnVlKTtcbiAgcmVxdWVzdC5yZXNwb25zZVR5cGUgPSAnYXJyYXlidWZmZXInO1xuXG4gIHJlcXVlc3QuYWRkRXZlbnRMaXN0ZW5lcigncHJvZ3Jlc3MnLCBmdW5jdGlvbihlKSB7XG4gICAgbG9hZGVyLnByb2dyZXNzKGUpO1xuICB9KTtcblxuICByZXF1ZXN0Lm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgIHNlbGYuZGVjb2RlQXVkaW9EYXRhKHJlcXVlc3QucmVzcG9uc2UsIGZ1bmN0aW9uKHNvdXJjZSkge1xuICAgICAgbG9hZGVyLmRvbmUoc291cmNlKTtcbiAgICB9KTtcbiAgfTtcbiAgcmVxdWVzdC5zZW5kKCk7XG59O1xuXG5BdWRpb01hbmFnZXIucHJvdG90eXBlLmRlY29kZUF1ZGlvRGF0YSA9IGZ1bmN0aW9uKGRhdGEsIGNhbGxiYWNrKSB7XG4gIHZhciBzZWxmID0gdGhpcztcblxuICB0aGlzLl9jdHguZGVjb2RlQXVkaW9EYXRhKGRhdGEsIGZ1bmN0aW9uKHJlc3VsdCkge1xuICAgIHZhciBhdWRpbyA9IG5ldyBMb2FkZWRBdWRpbyhzZWxmLl9jdHgsIHJlc3VsdCwgc2VsZi5fbWFzdGVyR2Fpbik7XG5cbiAgICBjYWxsYmFjayhhdWRpbyk7XG4gIH0pO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBBdWRpb01hbmFnZXI7XG4iLCJ2YXIgUGxheWluZ0F1ZGlvID0gcmVxdWlyZSgnLi9wbGF5aW5nLWF1ZGlvJyk7XG5cbnZhciBMb2FkZWRBdWRpbyA9IGZ1bmN0aW9uKGN0eCwgYnVmZmVyLCBtYXN0ZXJHYWluKSB7XG4gIHRoaXMuX2N0eCA9IGN0eDtcbiAgdGhpcy5fbWFzdGVyR2FpbiA9IG1hc3RlckdhaW47XG4gIHRoaXMuX2J1ZmZlciA9IGJ1ZmZlcjtcbiAgdGhpcy5fYnVmZmVyLmxvb3AgPSBmYWxzZTtcbn07XG5cbkxvYWRlZEF1ZGlvLnByb3RvdHlwZS5fY3JlYXRlU291bmQgPSBmdW5jdGlvbihnYWluKSB7XG4gIHZhciBzb3VyY2UgPSB0aGlzLl9jdHguY3JlYXRlQnVmZmVyU291cmNlKCk7XG4gIHNvdXJjZS5idWZmZXIgPSB0aGlzLl9idWZmZXI7XG5cbiAgdGhpcy5fbWFzdGVyR2Fpbi5jb25uZWN0KHRoaXMuX2N0eC5kZXN0aW5hdGlvbik7XG5cbiAgZ2Fpbi5jb25uZWN0KHRoaXMuX21hc3RlckdhaW4pO1xuXG4gIHNvdXJjZS5jb25uZWN0KGdhaW4pO1xuXG4gIHJldHVybiBzb3VyY2U7XG59O1xuXG5Mb2FkZWRBdWRpby5wcm90b3R5cGUucGxheSA9IGZ1bmN0aW9uKCkge1xuICB2YXIgZ2FpbiA9IHRoaXMuX2N0eC5jcmVhdGVHYWluKCk7XG5cbiAgdmFyIHNvdW5kID0gdGhpcy5fY3JlYXRlU291bmQoZ2Fpbik7XG5cbiAgc291bmQuc3RhcnQoMCk7XG5cbiAgcmV0dXJuIG5ldyBQbGF5aW5nQXVkaW8oc291bmQsIGdhaW4pO1xufTtcblxuTG9hZGVkQXVkaW8ucHJvdG90eXBlLmZhZGVJbiA9IGZ1bmN0aW9uKHZhbHVlLCB0aW1lKSB7XG4gIHZhciBnYWluID0gdGhpcy5fY3R4LmNyZWF0ZUdhaW4oKTtcblxuICB2YXIgc291bmQgPSB0aGlzLl9jcmVhdGVTb3VuZChnYWluKTtcblxuICBnYWluLmdhaW4uc2V0VmFsdWVBdFRpbWUoMCwgMCk7XG4gIGdhaW4uZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSgwLjAxLCAwKTtcbiAgZ2Fpbi5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKHZhbHVlLCB0aW1lKTtcblxuICBzb3VuZC5zdGFydCgwKTtcblxuICByZXR1cm4gbmV3IFBsYXlpbmdBdWRpbyhzb3VuZCwgZ2Fpbik7XG59O1xuXG5Mb2FkZWRBdWRpby5wcm90b3R5cGUubG9vcCA9IGZ1bmN0aW9uKCkge1xuICB2YXIgZ2FpbiA9IHRoaXMuX2N0eC5jcmVhdGVHYWluKCk7XG5cbiAgdmFyIHNvdW5kID0gdGhpcy5fY3JlYXRlU291bmQoZ2Fpbik7XG5cbiAgc291bmQubG9vcCA9IHRydWU7XG4gIHNvdW5kLnN0YXJ0KDApO1xuXG4gIHJldHVybiBuZXcgUGxheWluZ0F1ZGlvKHNvdW5kLCBnYWluKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gTG9hZGVkQXVkaW87XG4iLCJ2YXIgUGxheWluZ0F1ZGlvID0gZnVuY3Rpb24oc291cmNlLCBnYWluKSB7XG4gIHRoaXMuX2dhaW4gPSBnYWluO1xuICB0aGlzLl9zb3VyY2UgPSBzb3VyY2U7XG59O1xuXG5QbGF5aW5nQXVkaW8ucHJvdG90eXBlLnNldFZvbHVtZSA9IGZ1bmN0aW9uKHZvbHVtZSkge1xuICB0aGlzLl9nYWluLmdhaW4udmFsdWUgPSB2b2x1bWU7XG59O1xuXG5QbGF5aW5nQXVkaW8ucHJvdG90eXBlLnN0b3AgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5fc291cmNlLnN0b3AoMCk7XG59O1xuXG5QbGF5aW5nQXVkaW8ucHJvdG90eXBlLmxvb3AgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5fc291cmNlLmxvb3AgPSB0cnVlO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBQbGF5aW5nQXVkaW87XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vc3JjL2RlYnVnZ2VyLmpzJyk7XG4iLCJ2YXIgdXRpbCA9IHJlcXVpcmUoJ3V0aWwnKTtcbnZhciBEaXJ0eU1hbmFnZXIgPSByZXF1aXJlKCcuL2RpcnR5LW1hbmFnZXInKTtcblxudmFyIE9iamVjdFBvb2wgPSBbXTtcblxudmFyIEdldE9iamVjdEZyb21Qb29sID0gZnVuY3Rpb24oKSB7XG4gIHZhciByZXN1bHQgPSBPYmplY3RQb29sLnBvcCgpO1xuXG4gIGlmIChyZXN1bHQpIHtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgcmV0dXJuIHt9O1xufTtcblxudmFyIGluZGV4VG9OdW1iZXJBbmRMb3dlckNhc2VLZXkgPSBmdW5jdGlvbihpbmRleCkge1xuICBpZiAoaW5kZXggPD0gOSkge1xuICAgIHJldHVybiA0OCArIGluZGV4O1xuICB9IGVsc2UgaWYgKGluZGV4ID09PSAxMCkge1xuICAgIHJldHVybiA0ODtcbiAgfSBlbHNlIGlmIChpbmRleCA+IDEwICYmIGluZGV4IDw9IDM2KSB7XG4gICAgcmV0dXJuIDY0ICsgKGluZGV4LTEwKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufTtcblxudmFyIGRlZmF1bHRzID0gW1xuICB7IG5hbWU6ICdTaG93IEZQUycsIGVudHJ5OiAnc2hvd0ZwcycsIGRlZmF1bHRzOiB0cnVlIH0sXG4gIHsgbmFtZTogJ1Nob3cgS2V5IENvZGVzJywgZW50cnk6ICdzaG93S2V5Q29kZXMnLCBkZWZhdWx0czogdHJ1ZSB9LFxuICB7IG5hbWU6ICdTaG93IE1vbml0b3IgVmFsdWVzJywgZW50cnk6ICdzaG93TW9uaXRvclZhbHVlcycsIGRlZmF1bHRzOiB0cnVlIH1cbl07XG5cbnZhciBEZWJ1Z2dlciA9IGZ1bmN0aW9uKGFwcCkge1xuICB0aGlzLnZpZGVvID0gYXBwLnZpZGVvLmNyZWF0ZUxheWVyKHtcbiAgICBhbGxvd0hpRFBJOiB0cnVlLFxuICAgIGdldENhbnZhc0NvbnRleHQ6IHRydWVcbiAgfSk7XG5cbiAgdGhpcy5ncmFwaCA9IGFwcC52aWRlby5jcmVhdGVMYXllcih7XG4gICAgYWxsb3dIaURQSTogZmFsc2UsXG4gICAgZ2V0Q2FudmFzQ29udGV4dDogdHJ1ZVxuICB9KTtcblxuICB0aGlzLl9ncmFwaEhlaWdodCA9IDEwMDtcbiAgdGhpcy5fNjBmcHNNYXJrID0gdGhpcy5fZ3JhcGhIZWlnaHQgKiAwLjg7XG4gIHRoaXMuX21zVG9QeCA9IHRoaXMuXzYwZnBzTWFyay8xNi42NjtcblxuICB0aGlzLmFwcCA9IGFwcDtcblxuICB0aGlzLm9wdGlvbnMgPSBkZWZhdWx0cztcbiAgdGhpcy5fbWF4TG9nc0NvdW50cyA9IDEwO1xuXG4gIGZvciAodmFyIGk9MDsgaTx0aGlzLm9wdGlvbnMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgb3B0aW9uID0gdGhpcy5vcHRpb25zW2ldO1xuICAgIHRoaXMuX2luaXRPcHRpb24ob3B0aW9uKTtcbiAgfVxuXG4gIHRoaXMuZGlzYWJsZWQgPSBmYWxzZTtcblxuICB0aGlzLmZwcyA9IDA7XG4gIHRoaXMuZnBzQ291bnQgPSAwO1xuICB0aGlzLmZwc0VsYXBzZWRUaW1lID0gMDtcbiAgdGhpcy5mcHNVcGRhdGVJbnRlcnZhbCA9IDAuNTtcbiAgdGhpcy5fZnJhbWVQZXJmID0gW107XG5cbiAgdGhpcy5fZm9udFNpemUgPSAwO1xuICB0aGlzLl9kaXJ0eU1hbmFnZXIgPSBuZXcgRGlydHlNYW5hZ2VyKHRoaXMudmlkZW8uY2FudmFzLCB0aGlzLnZpZGVvLmN0eCk7XG5cbiAgdGhpcy5sb2dzID0gW107XG5cbiAgdGhpcy5fcGVyZlZhbHVlcyA9IHt9O1xuICB0aGlzLl9wZXJmTmFtZXMgPSBbXTtcblxuICB0aGlzLnNob3dEZWJ1ZyA9IGZhbHNlO1xuICB0aGlzLmVuYWJsZURlYnVnS2V5cyA9IHRydWU7XG4gIHRoaXMuZW5hYmxlU2hvcnRjdXRzID0gZmFsc2U7XG5cbiAgdGhpcy5lbmFibGVTaG9ydGN1dHNLZXkgPSAyMjA7XG5cbiAgdGhpcy5sYXN0S2V5ID0gJyc7XG5cbiAgdGhpcy5fbW9uaXRvciA9IHt9O1xuXG4gIHRoaXMuX2xvYWQoKTtcblxuICB0aGlzLmtleVNob3J0Y3V0cyA9IFtcbiAgICB7IGtleTogMTIzLCBlbnRyeTogJ3Nob3dEZWJ1ZycsIHR5cGU6ICd0b2dnbGUnIH1cbiAgXTtcblxuICB2YXIgc2VsZiA9IHRoaXM7XG4gIHRoaXMuYWRkQ29uZmlnKHsgbmFtZTogJ1Nob3cgUGVyZm9ybWFuY2UgR3JhcGgnLCBlbnRyeTogJ3Nob3dHcmFwaCcsIGRlZmF1bHRzOiBmYWxzZSwgY2FsbDogZnVuY3Rpb24oKSB7IHNlbGYuZ3JhcGguY2xlYXIoKTsgfSB9KTtcblxuICB0aGlzLl9kaWZmID0gMDtcbiAgdGhpcy5fZnJhbWVTdGFydCA9IDA7XG59O1xuXG5EZWJ1Z2dlci5wcm90b3R5cGUuYmVnaW4gPSBmdW5jdGlvbigpIHtcbiAgaWYgKHRoaXMuc2hvd0RlYnVnKSB7XG4gICAgdGhpcy5fZnJhbWVTdGFydCA9IHdpbmRvdy5wZXJmb3JtYW5jZS5ub3coKTtcbiAgfVxufTtcblxuRGVidWdnZXIucHJvdG90eXBlLmVuZCA9IGZ1bmN0aW9uKCkge1xuICBpZiAodGhpcy5zaG93RGVidWcpIHtcbiAgICB0aGlzLl9kaWZmID0gd2luZG93LnBlcmZvcm1hbmNlLm5vdygpIC0gdGhpcy5fZnJhbWVTdGFydDtcbiAgfVxufTtcblxuRGVidWdnZXIucHJvdG90eXBlLl9zZXRGb250ID0gZnVuY3Rpb24ocHgsIGZvbnQpIHtcbiAgdGhpcy5fZm9udFNpemUgPSBweDtcbiAgdGhpcy52aWRlby5jdHguZm9udCA9IHB4ICsgJ3B4ICcgKyBmb250O1xufTtcblxuRGVidWdnZXIucHJvdG90eXBlLmFkZENvbmZpZyA9IGZ1bmN0aW9uKG9wdGlvbikge1xuICB0aGlzLm9wdGlvbnMucHVzaChvcHRpb24pO1xuICB0aGlzLl9pbml0T3B0aW9uKG9wdGlvbik7XG59O1xuXG5EZWJ1Z2dlci5wcm90b3R5cGUuX2luaXRPcHRpb24gPSBmdW5jdGlvbihvcHRpb24pIHtcbiAgb3B0aW9uLnR5cGUgPSBvcHRpb24udHlwZSB8fCAndG9nZ2xlJztcbiAgb3B0aW9uLmRlZmF1bHRzID0gb3B0aW9uLmRlZmF1bHRzID09IG51bGwgPyBmYWxzZSA6IG9wdGlvbi5kZWZhdWx0cztcblxuICBpZiAob3B0aW9uLnR5cGUgPT09ICd0b2dnbGUnKSB7XG4gICAgdGhpc1tvcHRpb24uZW50cnldID0gb3B0aW9uLmRlZmF1bHRzO1xuICB9XG59O1xuXG5EZWJ1Z2dlci5wcm90b3R5cGUuY2xlYXIgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5sb2dzLmxlbmd0aCA9IDA7XG59O1xuXG5EZWJ1Z2dlci5wcm90b3R5cGUubG9nID0gZnVuY3Rpb24obWVzc2FnZSwgY29sb3IpIHtcbiAgY29sb3IgPSBjb2xvciB8fCAnd2hpdGUnO1xuICBtZXNzYWdlID0gdHlwZW9mIG1lc3NhZ2UgPT09ICdzdHJpbmcnID8gbWVzc2FnZSA6IHV0aWwuaW5zcGVjdChtZXNzYWdlKTtcblxuICB2YXIgbWVzc2FnZXMgPSBtZXNzYWdlLnJlcGxhY2UoL1xcXFwnL2csIFwiJ1wiKS5zcGxpdCgnXFxuJyk7XG5cbiAgZm9yICh2YXIgaT0wOyBpPG1lc3NhZ2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIG1zZyA9IG1lc3NhZ2VzW2ldO1xuICAgIGlmICh0aGlzLmxvZ3MubGVuZ3RoID49IHRoaXMuX21heExvZ3NDb3VudHMpIHtcbiAgICAgIE9iamVjdFBvb2wucHVzaCh0aGlzLmxvZ3Muc2hpZnQoKSk7XG4gICAgfVxuXG4gICAgdmFyIG1lc3NhZ2VPYmplY3QgPSBHZXRPYmplY3RGcm9tUG9vbCgpO1xuICAgIG1lc3NhZ2VPYmplY3QudGV4dCA9IG1zZztcbiAgICBtZXNzYWdlT2JqZWN0LmxpZmUgPSAxMDtcbiAgICBtZXNzYWdlT2JqZWN0LmNvbG9yID0gY29sb3I7XG5cbiAgICB0aGlzLmxvZ3MucHVzaChtZXNzYWdlT2JqZWN0KTtcbiAgfVxufTtcblxuRGVidWdnZXIucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKCkge307XG5cbkRlYnVnZ2VyLnByb3RvdHlwZS5leGl0VXBkYXRlID0gZnVuY3Rpb24odGltZSkge1xuICBpZiAodGhpcy5kaXNhYmxlZCkgeyByZXR1cm47IH1cblxuICBpZiAodGhpcy5zaG93RGVidWcpIHtcbiAgICB0aGlzLl9tYXhMb2dzQ291bnRzID0gTWF0aC5jZWlsKCh0aGlzLmFwcC5oZWlnaHQgKyAyMCkvMjApO1xuICAgIHRoaXMuZnBzQ291bnQgKz0gMTtcbiAgICB0aGlzLmZwc0VsYXBzZWRUaW1lICs9IHRpbWU7XG5cbiAgICBpZiAodGhpcy5mcHNFbGFwc2VkVGltZSA+IHRoaXMuZnBzVXBkYXRlSW50ZXJ2YWwpIHtcbiAgICAgIHZhciBmcHMgPSB0aGlzLmZwc0NvdW50L3RoaXMuZnBzRWxhcHNlZFRpbWU7XG5cbiAgICAgIGlmICh0aGlzLnNob3dGcHMpIHtcbiAgICAgICAgdGhpcy5mcHMgPSB0aGlzLmZwcyAqICgxLTAuOCkgKyAwLjggKiBmcHM7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuZnBzQ291bnQgPSAwO1xuICAgICAgdGhpcy5mcHNFbGFwc2VkVGltZSA9IDA7XG4gICAgfVxuXG4gICAgZm9yICh2YXIgaT0wLCBsZW49dGhpcy5sb2dzLmxlbmd0aDsgaTxsZW47IGkrKykge1xuICAgICAgdmFyIGxvZyA9IHRoaXMubG9nc1tpXTtcbiAgICAgIGlmIChsb2cpIHtcbiAgICAgICAgbG9nLmxpZmUgLT0gdGltZTtcbiAgICAgICAgaWYgKGxvZy5saWZlIDw9IDApIHtcbiAgICAgICAgICB2YXIgaW5kZXggPSB0aGlzLmxvZ3MuaW5kZXhPZihsb2cpO1xuICAgICAgICAgIGlmIChpbmRleCA+IC0xKSB7IHRoaXMubG9ncy5zcGxpY2UoaW5kZXgsIDEpOyB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBmb3IgKHZhciBpPTA7IGk8dGhpcy5fcGVyZk5hbWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgbmFtZSA9IHRoaXMuX3BlcmZOYW1lc1tpXTtcbiAgICAgIHZhciB2YWx1ZSA9IHRoaXMuX3BlcmZWYWx1ZXNbbmFtZV07XG4gICAgICB0aGlzLm1vbml0b3IobmFtZSwgdmFsdWUudmFsdWUudG9GaXhlZCgzKSArICcgc2VjJyk7XG4gICAgfVxuICB9XG59O1xuXG5EZWJ1Z2dlci5wcm90b3R5cGUua2V5ZG93biA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gIGlmICh0aGlzLmRpc2FibGVkKSB7IHJldHVybjsgfVxuXG4gIHRoaXMubGFzdEtleSA9IHZhbHVlLmtleTtcblxuICB2YXIgaTtcblxuICBpZiAodGhpcy5lbmFibGVEZWJ1Z0tleXMpIHtcbiAgICBpZiAodmFsdWUua2V5ID09PSB0aGlzLmVuYWJsZVNob3J0Y3V0c0tleSkge1xuICAgICAgdmFsdWUuZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgdGhpcy5lbmFibGVTaG9ydGN1dHMgPSAhdGhpcy5lbmFibGVTaG9ydGN1dHM7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5lbmFibGVTaG9ydGN1dHMpIHtcbiAgICAgIGZvciAoaT0wOyBpPHRoaXMub3B0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgb3B0aW9uID0gdGhpcy5vcHRpb25zW2ldO1xuICAgICAgICB2YXIga2V5SW5kZXggPSBpICsgMTtcblxuICAgICAgICBpZiAodGhpcy5hcHAuaW5wdXQuaXNLZXlEb3duKCdjdHJsJykpIHtcbiAgICAgICAgICBrZXlJbmRleCAtPSAzNjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBjaGFySWQgPSBpbmRleFRvTnVtYmVyQW5kTG93ZXJDYXNlS2V5KGtleUluZGV4KTtcblxuICAgICAgICBpZiAoY2hhcklkICYmIHZhbHVlLmtleSA9PT0gY2hhcklkKSB7XG4gICAgICAgICAgdmFsdWUuZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICAgIGlmIChvcHRpb24udHlwZSA9PT0gJ3RvZ2dsZScpIHtcblxuICAgICAgICAgICAgdGhpc1tvcHRpb24uZW50cnldID0gIXRoaXNbb3B0aW9uLmVudHJ5XTtcbiAgICAgICAgICAgIGlmIChvcHRpb24uY2FsbCkge1xuICAgICAgICAgICAgICBvcHRpb24uY2FsbCgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLl9zYXZlKCk7XG4gICAgICAgICAgfSBlbHNlIGlmIChvcHRpb24udHlwZSA9PT0gJ2NhbGwnKSB7XG4gICAgICAgICAgICBvcHRpb24uZW50cnkoKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZvciAoaT0wOyBpPHRoaXMua2V5U2hvcnRjdXRzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGtleVNob3J0Y3V0ID0gdGhpcy5rZXlTaG9ydGN1dHNbaV07XG4gICAgaWYgKGtleVNob3J0Y3V0LmtleSA9PT0gdmFsdWUua2V5KSB7XG4gICAgICB2YWx1ZS5ldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICBpZiAoa2V5U2hvcnRjdXQudHlwZSA9PT0gJ3RvZ2dsZScpIHtcbiAgICAgICAgdGhpc1trZXlTaG9ydGN1dC5lbnRyeV0gPSAhdGhpc1trZXlTaG9ydGN1dC5lbnRyeV07XG4gICAgICAgIHRoaXMuX3NhdmUoKTtcbiAgICAgIH0gZWxzZSBpZiAoa2V5U2hvcnRjdXQudHlwZSA9PT0gJ2NhbGwnKSB7XG4gICAgICAgIHRoaXNba2V5U2hvcnRjdXQuZW50cnldKCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBmYWxzZTtcbn07XG5cbkRlYnVnZ2VyLnByb3RvdHlwZS5fc2F2ZSA9IGZ1bmN0aW9uKCkge1xuICB2YXIgZGF0YSA9IHtcbiAgICBzaG93RGVidWc6IHRoaXMuc2hvd0RlYnVnLFxuICAgIG9wdGlvbnM6IHt9XG4gIH07XG5cbiAgZm9yICh2YXIgaT0wOyBpPHRoaXMub3B0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBvcHRpb24gPSB0aGlzLm9wdGlvbnNbaV07XG4gICAgdmFyIHZhbHVlID0gdGhpc1tvcHRpb24uZW50cnldO1xuICAgIGRhdGEub3B0aW9uc1tvcHRpb24uZW50cnldID0gdmFsdWU7XG4gIH1cblxuICB3aW5kb3cubG9jYWxTdG9yYWdlLl9fcG90aW9uRGVidWcgPSBKU09OLnN0cmluZ2lmeShkYXRhKTtcbn07XG5cbkRlYnVnZ2VyLnByb3RvdHlwZS5fbG9hZCA9IGZ1bmN0aW9uKCkge1xuICBpZiAod2luZG93LmxvY2FsU3RvcmFnZSAmJiB3aW5kb3cubG9jYWxTdG9yYWdlLl9fcG90aW9uRGVidWcpIHtcbiAgICB2YXIgZGF0YSA9IEpTT04ucGFyc2Uod2luZG93LmxvY2FsU3RvcmFnZS5fX3BvdGlvbkRlYnVnKTtcbiAgICB0aGlzLnNob3dEZWJ1ZyA9IGRhdGEuc2hvd0RlYnVnO1xuXG4gICAgZm9yICh2YXIgbmFtZSBpbiBkYXRhLm9wdGlvbnMpIHtcbiAgICAgIHRoaXNbbmFtZV0gPSBkYXRhLm9wdGlvbnNbbmFtZV07XG4gICAgfVxuICB9XG59O1xuXG5EZWJ1Z2dlci5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24oKSB7XG4gIGlmICh0aGlzLmRpc2FibGVkKSB7IHJldHVybjsgfVxuXG4gIHRoaXMuX2RpcnR5TWFuYWdlci5jbGVhcigpO1xuXG4gIGlmICh0aGlzLnNob3dEZWJ1Zykge1xuICAgIHRoaXMudmlkZW8uY3R4LnNhdmUoKTtcbiAgICB0aGlzLl9zZXRGb250KDE1LCAnc2Fucy1zZXJpZicpO1xuXG4gICAgdGhpcy5fcmVuZGVyTG9ncygpO1xuICAgIHRoaXMuX3JlbmRlckRhdGEoKTtcbiAgICB0aGlzLl9yZW5kZXJTaG9ydGN1dHMoKTtcblxuICAgIHRoaXMudmlkZW8uY3R4LnJlc3RvcmUoKTtcblxuICAgIGlmICh0aGlzLnNob3dNb25pdG9yVmFsdWVzKSB7XG4gICAgICB2YXIgaSA9IDA7XG4gICAgICBmb3IgKHZhciBrZXkgaW4gdGhpcy5fbW9uaXRvcikge1xuICAgICAgICB2YXIgdmFsdWUgPSB0aGlzLl9tb25pdG9yW2tleV07XG4gICAgICAgIHRoaXMuX3NldEZvbnQoMTUsICdzYW5zLXNlcmlmJyk7XG5cbiAgICAgICAgdGhpcy52aWRlby5jdHgudGV4dEFsaWduID0gJ3JpZ2h0JztcbiAgICAgICAgdGhpcy52aWRlby5jdHgudGV4dEJhc2VsaW5lID0gJ2JvdHRvbSc7XG5cbiAgICAgICAgdGhpcy5fcmVuZGVyVGV4dChrZXksIHRoaXMuYXBwLndpZHRoIC0gMTQsICh0aGlzLmFwcC5oZWlnaHQgLSAyOCAtIDUpIC0gNDAgKiBpLCAnI2U5ZGM3YycpO1xuICAgICAgICB2YWx1ZSA9IHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgPyB2YWx1ZSA6IHV0aWwuaW5zcGVjdCh2YWx1ZSk7XG4gICAgICAgIHRoaXMuX3JlbmRlclRleHQodmFsdWUsIHRoaXMuYXBwLndpZHRoIC0gMTQsICh0aGlzLmFwcC5oZWlnaHQgLSAxNCkgLSA0MCAqIGkpO1xuXG4gICAgICAgIGkgKz0gMTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodGhpcy5zaG93R3JhcGgpIHtcbiAgICAgIHRoaXMuZ3JhcGguY3R4LmRyYXdJbWFnZSh0aGlzLmdyYXBoLmNhbnZhcywgMCwgdGhpcy5hcHAuaGVpZ2h0IC0gdGhpcy5fZ3JhcGhIZWlnaHQsIHRoaXMuYXBwLndpZHRoLCB0aGlzLl9ncmFwaEhlaWdodCwgLTIsIHRoaXMuYXBwLmhlaWdodCAtIHRoaXMuX2dyYXBoSGVpZ2h0LCB0aGlzLmFwcC53aWR0aCwgdGhpcy5fZ3JhcGhIZWlnaHQpO1xuXG4gICAgICB0aGlzLmdyYXBoLmN0eC5maWxsU3R5bGUgPSAnI0YyRjBEOCc7XG4gICAgICB0aGlzLmdyYXBoLmN0eC5maWxsUmVjdCh0aGlzLmFwcC53aWR0aCAtIDIsIHRoaXMuYXBwLmhlaWdodCAtIHRoaXMuX2dyYXBoSGVpZ2h0LCAyLCB0aGlzLl9ncmFwaEhlaWdodCk7XG5cbiAgICAgIHRoaXMuZ3JhcGguY3R4LmZpbGxTdHlsZSA9ICdyZ2JhKDAsIDAsIDAsIDAuNSknO1xuICAgICAgdGhpcy5ncmFwaC5jdHguZmlsbFJlY3QodGhpcy5hcHAud2lkdGggLSAyLCB0aGlzLmFwcC5oZWlnaHQgLSB0aGlzLl82MGZwc01hcmssIDIsIDEpO1xuXG4gICAgICB2YXIgbGFzdCA9IDA7XG4gICAgICBmb3IgKHZhciBpPTA7IGk8dGhpcy5fZnJhbWVQZXJmLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBpdGVtID0gdGhpcy5fZnJhbWVQZXJmW2ldO1xuICAgICAgICB2YXIgbmFtZSA9IHRoaXMuX3BlcmZOYW1lc1tpXTtcblxuICAgICAgICB0aGlzLl9kcmF3RnJhbWVMaW5lKGl0ZW0sIG5hbWUsIGxhc3QpO1xuXG4gICAgICAgIGxhc3QgKz0gaXRlbTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5fZHJhd0ZyYW1lTGluZSh0aGlzLl9kaWZmIC0gbGFzdCwgJ2xhZycsIGxhc3QpO1xuICAgICAgdGhpcy5fZnJhbWVQZXJmLmxlbmd0aCA9IDA7XG4gICAgfVxuICB9XG59O1xuXG5EZWJ1Z2dlci5wcm90b3R5cGUuX2RyYXdGcmFtZUxpbmUgPSBmdW5jdGlvbih2YWx1ZSwgbmFtZSwgbGFzdCkge1xuICB2YXIgYmFja2dyb3VuZCA9ICdibGFjayc7XG4gIGlmIChuYW1lID09PSAndXBkYXRlJykge1xuICAgIGJhY2tncm91bmQgPSAnIzZCQTVGMic7XG4gIH0gZWxzZSBpZiAobmFtZSA9PT0gJ3JlbmRlcicpIHtcbiAgICBiYWNrZ3JvdW5kID0gJyNGMjc4MzAnO1xuICB9IGVsc2UgaWYgKG5hbWUgPT09ICdsYWcnKSB7XG4gICAgYmFja2dyb3VuZCA9ICcjOTFmNjgyJztcbiAgfVxuICB0aGlzLmdyYXBoLmN0eC5maWxsU3R5bGUgPSBiYWNrZ3JvdW5kO1xuXG4gIHZhciBoZWlnaHQgPSAodmFsdWUgKyBsYXN0KSAqIHRoaXMuX21zVG9QeDtcblxuICB2YXIgeCA9IHRoaXMuYXBwLndpZHRoIC0gMjtcbiAgdmFyIHkgPSB0aGlzLmFwcC5oZWlnaHQgLSBoZWlnaHQ7XG5cbiAgdGhpcy5ncmFwaC5jdHguZmlsbFJlY3QoeCwgeSwgMiwgaGVpZ2h0IC0gKGxhc3QgKiB0aGlzLl9tc1RvUHgpKTtcbn07XG5cbkRlYnVnZ2VyLnByb3RvdHlwZS5fcmVuZGVyTG9ncyA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLnZpZGVvLmN0eC50ZXh0QWxpZ24gPSAnbGVmdCc7XG4gIHRoaXMudmlkZW8uY3R4LnRleHRCYXNlbGluZSA9ICdib3R0b20nO1xuXG4gIGZvciAodmFyIGk9MCwgbGVuPXRoaXMubG9ncy5sZW5ndGg7IGk8bGVuOyBpKyspIHtcbiAgICB2YXIgbG9nID0gdGhpcy5sb2dzW2ldO1xuXG4gICAgdmFyIHkgPSAtMTAgKyB0aGlzLmFwcC5oZWlnaHQgKyAoaSAtIHRoaXMubG9ncy5sZW5ndGggKyAxKSAqIDIwO1xuICAgIHRoaXMuX3JlbmRlclRleHQobG9nLnRleHQsIDEwLCB5LCBsb2cuY29sb3IpO1xuICB9XG59O1xuXG5EZWJ1Z2dlci5wcm90b3R5cGUuZGlzYWJsZSA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLmRpc2FibGVkID0gdHJ1ZTtcbiAgdGhpcy5zaG93RGVidWcgPSBmYWxzZTtcbn07XG5cbkRlYnVnZ2VyLnByb3RvdHlwZS5tb25pdG9yID0gZnVuY3Rpb24obmFtZSwgdmFsdWUpIHtcbiAgdGhpcy5fbW9uaXRvcltuYW1lXSA9IHZhbHVlO1xufTtcblxuRGVidWdnZXIucHJvdG90eXBlLnBlcmYgPSBmdW5jdGlvbihuYW1lKSB7XG4gIGlmICghdGhpcy5zaG93RGVidWcpIHsgcmV0dXJuOyB9XG5cbiAgdmFyIGV4aXN0cyA9IHRoaXMuX3BlcmZWYWx1ZXNbbmFtZV07XG5cbiAgaWYgKGV4aXN0cyA9PSBudWxsKSB7XG4gICAgdGhpcy5fcGVyZk5hbWVzLnB1c2gobmFtZSk7XG5cbiAgICB0aGlzLl9wZXJmVmFsdWVzW25hbWVdID0ge1xuICAgICAgbmFtZTogbmFtZSxcbiAgICAgIHZhbHVlOiAwLFxuICAgICAgcmVjb3JkczogW11cbiAgICB9O1xuICB9XG5cbiAgdmFyIHRpbWUgPSB3aW5kb3cucGVyZm9ybWFuY2Uubm93KCk7XG5cbiAgdmFyIHJlY29yZCA9IHRoaXMuX3BlcmZWYWx1ZXNbbmFtZV07XG5cbiAgcmVjb3JkLnZhbHVlID0gdGltZTtcbn07XG5cbkRlYnVnZ2VyLnByb3RvdHlwZS5zdG9wUGVyZiA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgaWYgKCF0aGlzLnNob3dEZWJ1ZykgeyByZXR1cm47IH1cblxuICB2YXIgcmVjb3JkID0gdGhpcy5fcGVyZlZhbHVlc1tuYW1lXTtcblxuICB2YXIgdGltZSA9IHdpbmRvdy5wZXJmb3JtYW5jZS5ub3coKTtcbiAgdmFyIGRpZmYgPSB0aW1lIC0gcmVjb3JkLnZhbHVlO1xuXG4gIHJlY29yZC5yZWNvcmRzLnB1c2goZGlmZik7XG4gIGlmIChyZWNvcmQucmVjb3Jkcy5sZW5ndGggPiAxMCkge1xuICAgIHJlY29yZC5yZWNvcmRzLnNoaWZ0KCk7XG4gIH1cblxuICB2YXIgc3VtID0gMDtcbiAgZm9yICh2YXIgaT0wOyBpPHJlY29yZC5yZWNvcmRzLmxlbmd0aDsgaSsrKSB7XG4gICAgc3VtICs9IHJlY29yZC5yZWNvcmRzW2ldO1xuICB9XG5cbiAgdmFyIGF2ZyA9IHN1bS9yZWNvcmQucmVjb3Jkcy5sZW5ndGg7XG5cbiAgcmVjb3JkLnZhbHVlID0gYXZnO1xuICB0aGlzLl9mcmFtZVBlcmYucHVzaChkaWZmKTtcbn07XG5cbkRlYnVnZ2VyLnByb3RvdHlwZS5fcmVuZGVyRGF0YSA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLnZpZGVvLmN0eC50ZXh0QWxpZ24gPSAncmlnaHQnO1xuICB0aGlzLnZpZGVvLmN0eC50ZXh0QmFzZWxpbmUgPSAndG9wJztcblxuICB2YXIgeCA9IHRoaXMuYXBwLndpZHRoIC0gMTQ7XG4gIHZhciB5ID0gMTQ7XG5cbiAgaWYgKHRoaXMuc2hvd0Zwcykge1xuICAgIHRoaXMuX3JlbmRlclRleHQoTWF0aC5yb3VuZCh0aGlzLmZwcykgKyAnIGZwcycsIHgsIHkpO1xuICB9XG5cbiAgeSArPSAyNDtcblxuICB0aGlzLl9zZXRGb250KDE1LCAnc2Fucy1zZXJpZicpO1xuXG4gIGlmICh0aGlzLnNob3dLZXlDb2Rlcykge1xuICAgIHZhciBidXR0b25OYW1lID0gJyc7XG4gICAgaWYgKHRoaXMuYXBwLmlucHV0Lm1vdXNlLmlzTGVmdERvd24pIHtcbiAgICAgIGJ1dHRvbk5hbWUgPSAnbGVmdCc7XG4gICAgfSBlbHNlIGlmICh0aGlzLmFwcC5pbnB1dC5tb3VzZS5pc1JpZ2h0RG93bikge1xuICAgICAgYnV0dG9uTmFtZSA9ICdyaWdodCc7XG4gICAgfSBlbHNlIGlmICh0aGlzLmFwcC5pbnB1dC5tb3VzZS5pc01pZGRsZURvd24pIHtcbiAgICAgIGJ1dHRvbk5hbWUgPSAnbWlkZGxlJztcbiAgICB9XG5cbiAgICB0aGlzLl9yZW5kZXJUZXh0KCdrZXkgJyArIHRoaXMubGFzdEtleSwgeCwgeSwgdGhpcy5hcHAuaW5wdXQuaXNLZXlEb3duKHRoaXMubGFzdEtleSkgPyAnI2U5ZGM3YycgOiAnd2hpdGUnKTtcbiAgICB0aGlzLl9yZW5kZXJUZXh0KCdidG4gJyArIGJ1dHRvbk5hbWUsIHggLSA2MCwgeSwgdGhpcy5hcHAuaW5wdXQubW91c2UuaXNEb3duID8gJyNlOWRjN2MnIDogJ3doaXRlJyk7XG4gIH1cbn07XG5cblxuRGVidWdnZXIucHJvdG90eXBlLl9yZW5kZXJTaG9ydGN1dHMgPSBmdW5jdGlvbigpIHtcbiAgaWYgKHRoaXMuZW5hYmxlU2hvcnRjdXRzKSB7XG4gICAgdmFyIGhlaWdodCA9IDI4O1xuXG4gICAgdGhpcy5fc2V0Rm9udCgyMCwgJ0hlbHZldGljYSBOZXVlLCBzYW5zLXNlcmlmJyk7XG4gICAgdGhpcy52aWRlby5jdHgudGV4dEFsaWduID0gJ2xlZnQnO1xuICAgIHRoaXMudmlkZW8uY3R4LnRleHRCYXNlbGluZSA9ICd0b3AnO1xuICAgIHZhciBtYXhQZXJDb2xsdW1uID0gTWF0aC5mbG9vcigodGhpcy5hcHAuaGVpZ2h0IC0gMTQpL2hlaWdodCk7XG5cbiAgICBmb3IgKHZhciBpPTA7IGk8dGhpcy5vcHRpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgb3B0aW9uID0gdGhpcy5vcHRpb25zW2ldO1xuICAgICAgdmFyIHggPSAxNCArIE1hdGguZmxvb3IoaS9tYXhQZXJDb2xsdW1uKSAqIDMyMDtcbiAgICAgIHZhciB5ID0gMTQgKyBpJW1heFBlckNvbGx1bW4gKiBoZWlnaHQ7XG5cbiAgICAgIHZhciBrZXlJbmRleCA9IGkgKyAxO1xuICAgICAgdmFyIGNoYXJJZCA9IGluZGV4VG9OdW1iZXJBbmRMb3dlckNhc2VLZXkoa2V5SW5kZXgpO1xuXG4gICAgICB2YXIgaXNPbiA9IHRoaXNbb3B0aW9uLmVudHJ5XTtcblxuICAgICAgdmFyIHNob3J0Y3V0ID0gU3RyaW5nLmZyb21DaGFyQ29kZShjaGFySWQpO1xuXG4gICAgICBpZiAoIWNoYXJJZCkge1xuICAgICAgICBzaG9ydGN1dCA9ICdeKycgKyBTdHJpbmcuZnJvbUNoYXJDb2RlKGluZGV4VG9OdW1iZXJBbmRMb3dlckNhc2VLZXkoa2V5SW5kZXggLSAzNikpO1xuICAgICAgfVxuXG4gICAgICB2YXIgdGV4dCA9ICdbJyArIHNob3J0Y3V0ICsgJ10gJyArIG9wdGlvbi5uYW1lO1xuICAgICAgaWYgKG9wdGlvbi50eXBlID09PSAndG9nZ2xlJykge1xuICAgICAgICB0ZXh0ICs9ICcgKCcgKyAoaXNPbiA/ICdPTicgOiAnT0ZGJykgKyAnKSc7XG4gICAgICB9IGVsc2UgaWYgKG9wdGlvbi50eXBlID09PSAnY2FsbCcpIHtcbiAgICAgICAgdGV4dCArPSAnIChDQUxMKSc7XG4gICAgICB9XG5cbiAgICAgIHZhciBjb2xvciA9ICdyZ2JhKDI1NSwgMjU1LCAyNTUsIDEpJztcbiAgICAgIHZhciBvdXRsaW5lID0gJ3JnYmEoMCwgMCwgMCwgMSknO1xuXG4gICAgICBpZiAoIWlzT24pIHtcbiAgICAgICAgY29sb3IgPSAncmdiYSgyNTUsIDI1NSwgMjU1LCAuNyknO1xuICAgICAgICBvdXRsaW5lID0gJ3JnYmEoMCwgMCwgMCwgLjcpJztcbiAgICAgIH1cblxuICAgICAgdGhpcy5fcmVuZGVyVGV4dCh0ZXh0LCB4LCB5LCBjb2xvciwgb3V0bGluZSk7XG4gICAgfVxuICB9XG59O1xuXG5EZWJ1Z2dlci5wcm90b3R5cGUuX3JlbmRlclRleHQgPSBmdW5jdGlvbih0ZXh0LCB4LCB5LCBjb2xvciwgb3V0bGluZSkge1xuICBjb2xvciA9IGNvbG9yIHx8ICd3aGl0ZSc7XG4gIG91dGxpbmUgPSBvdXRsaW5lIHx8ICdibGFjayc7XG4gIHRoaXMudmlkZW8uY3R4LmZpbGxTdHlsZSA9IGNvbG9yO1xuICB0aGlzLnZpZGVvLmN0eC5saW5lSm9pbiA9ICdyb3VuZCc7XG4gIHRoaXMudmlkZW8uY3R4LnN0cm9rZVN0eWxlID0gb3V0bGluZTtcbiAgdGhpcy52aWRlby5jdHgubGluZVdpZHRoID0gMztcbiAgdGhpcy52aWRlby5jdHguc3Ryb2tlVGV4dCh0ZXh0LCB4LCB5KTtcbiAgdGhpcy52aWRlby5jdHguZmlsbFRleHQodGV4dCwgeCwgeSk7XG5cbiAgdmFyIHdpZHRoID0gdGhpcy52aWRlby5jdHgubWVhc3VyZVRleHQodGV4dCkud2lkdGg7XG5cbiAgdmFyIGR4ID0geCAtIDU7XG4gIHZhciBkeSA9IHk7XG4gIHZhciBkd2lkdGggPSB3aWR0aCArIDEwO1xuICB2YXIgZGhlaWdodCA9IHRoaXMuX2ZvbnRTaXplICsgMTA7XG5cbiAgaWYgKHRoaXMudmlkZW8uY3R4LnRleHRBbGlnbiA9PT0gJ3JpZ2h0Jykge1xuICAgIGR4ID0geCAtIDUgLSB3aWR0aDtcbiAgfVxuXG4gIHRoaXMuX2RpcnR5TWFuYWdlci5hZGRSZWN0KGR4LCBkeSwgZHdpZHRoLCBkaGVpZ2h0KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gRGVidWdnZXI7XG4iLCJ2YXIgRGlydHlNYW5hZ2VyID0gZnVuY3Rpb24oY2FudmFzLCBjdHgpIHtcbiAgdGhpcy5jdHggPSBjdHg7XG4gIHRoaXMuY2FudmFzID0gY2FudmFzO1xuXG4gIHRoaXMudG9wID0gY2FudmFzLmhlaWdodDtcbiAgdGhpcy5sZWZ0ID0gY2FudmFzLndpZHRoO1xuICB0aGlzLmJvdHRvbSA9IDA7XG4gIHRoaXMucmlnaHQgPSAwO1xuXG4gIHRoaXMuaXNEaXJ0eSA9IGZhbHNlO1xufTtcblxuRGlydHlNYW5hZ2VyLnByb3RvdHlwZS5hZGRSZWN0ID0gZnVuY3Rpb24obGVmdCwgdG9wLCB3aWR0aCwgaGVpZ2h0KSB7XG4gIHZhciByaWdodCAgPSBsZWZ0ICsgd2lkdGg7XG4gIHZhciBib3R0b20gPSB0b3AgKyBoZWlnaHQ7XG5cbiAgdGhpcy50b3AgICAgPSB0b3AgPCB0aGlzLnRvcCAgICAgICA/IHRvcCAgICA6IHRoaXMudG9wO1xuICB0aGlzLmxlZnQgICA9IGxlZnQgPCB0aGlzLmxlZnQgICAgID8gbGVmdCAgIDogdGhpcy5sZWZ0O1xuICB0aGlzLmJvdHRvbSA9IGJvdHRvbSA+IHRoaXMuYm90dG9tID8gYm90dG9tIDogdGhpcy5ib3R0b207XG4gIHRoaXMucmlnaHQgID0gcmlnaHQgPiB0aGlzLnJpZ2h0ICAgPyByaWdodCAgOiB0aGlzLnJpZ2h0O1xuXG4gIHRoaXMuaXNEaXJ0eSA9IHRydWU7XG59O1xuXG5EaXJ0eU1hbmFnZXIucHJvdG90eXBlLmNsZWFyID0gZnVuY3Rpb24oKSB7XG4gIGlmICghdGhpcy5pc0RpcnR5KSB7IHJldHVybjsgfVxuXG4gIHRoaXMuY3R4LmNsZWFyUmVjdCh0aGlzLmxlZnQsXG4gICAgICAgICAgICAgICAgICAgICB0aGlzLnRvcCxcbiAgICAgICAgICAgICAgICAgICAgIHRoaXMucmlnaHQgLSB0aGlzLmxlZnQsXG4gICAgICAgICAgICAgICAgICAgICB0aGlzLmJvdHRvbSAtIHRoaXMudG9wKTtcblxuICB0aGlzLmxlZnQgPSB0aGlzLmNhbnZhcy53aWR0aDtcbiAgdGhpcy50b3AgPSB0aGlzLmNhbnZhcy5oZWlnaHQ7XG4gIHRoaXMucmlnaHQgPSAwO1xuICB0aGlzLmJvdHRvbSA9IDA7XG5cbiAgdGhpcy5pc0RpcnR5ID0gZmFsc2U7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IERpcnR5TWFuYWdlcjtcbiIsInZhciBWaWRlbyA9IHJlcXVpcmUoJy4vdmlkZW8nKTtcbnZhciBBc3NldHMgPSByZXF1aXJlKCcuL2Fzc2V0cycpO1xuXG52YXIgRGVidWdnZXIgPSByZXF1aXJlKCdwb3Rpb24tZGVidWdnZXInKTtcblxudmFyIFBvdGlvbkF1ZGlvID0gcmVxdWlyZSgncG90aW9uLWF1ZGlvJyk7XG5cbnZhciBBcHAgPSBmdW5jdGlvbihjb250YWluZXIpIHtcbiAgdGhpcy5jb250YWluZXIgPSBjb250YWluZXI7XG5cbiAgY29udGFpbmVyLnN0eWxlLnBvc2l0aW9uID0gJ3JlbGF0aXZlJztcblxuICB2YXIgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gIGNhbnZhcy5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcbiAgY29udGFpbmVyLmFwcGVuZENoaWxkKGNhbnZhcyk7XG5cbiAgdGhpcy5jYW52YXMgPSBjYW52YXM7XG5cbiAgdGhpcy53aWR0aCA9IDMwMDtcblxuICB0aGlzLmhlaWdodCA9IDMwMDtcblxuICB0aGlzLmF1ZGlvID0gbmV3IFBvdGlvbkF1ZGlvKCk7XG5cbiAgdGhpcy5hc3NldHMgPSBuZXcgQXNzZXRzKHRoaXMpO1xuXG4gIHRoaXMuc3RhdGVzID0gbnVsbDtcblxuICB0aGlzLmlucHV0ID0gbnVsbDtcblxuICB0aGlzLmNvbmZpZyA9IHtcbiAgICBhbGxvd0hpRFBJOiB0cnVlLFxuICAgIGdldENhbnZhc0NvbnRleHQ6IHRydWUsXG4gICAgYWRkSW5wdXRFdmVudHM6IHRydWUsXG4gICAgc2hvd1ByZWxvYWRlcjogdHJ1ZSxcbiAgICBmaXhlZFN0ZXA6IGZhbHNlLFxuICAgIHN0ZXBUaW1lOiAxLzYwLFxuICAgIG1heFN0ZXBUaW1lOiAxLzYwXG4gIH07XG5cbiAgdGhpcy52aWRlbyA9IG5ldyBWaWRlbyh0aGlzLCBjYW52YXMsIHRoaXMuY29uZmlnKTtcbiAgdGhpcy52aWRlby5faXNSb290ID0gdHJ1ZTtcblxuICB0aGlzLmRlYnVnID0gbmV3IERlYnVnZ2VyKHRoaXMpO1xufTtcblxuQXBwLnByb3RvdHlwZS5yZXNpemUgPSBmdW5jdGlvbih3aWR0aCwgaGVpZ2h0KSB7XG4gIHRoaXMud2lkdGggPSB3aWR0aDtcbiAgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7XG5cbiAgdGhpcy5jb250YWluZXIuc3R5bGUud2lkdGggPSB0aGlzLndpZHRoICsgJ3B4JztcbiAgdGhpcy5jb250YWluZXIuc3R5bGUuaGVpZ2h0ID0gdGhpcy5oZWlnaHQgKyAncHgnO1xuXG4gIGlmICh0aGlzLnZpZGVvKSB7XG4gICAgdGhpcy52aWRlby5fcmVzaXplKHdpZHRoLCBoZWlnaHQpO1xuICB9XG5cbiAgaWYgKHRoaXMuc3RhdGVzKSB7XG4gICAgdGhpcy5zdGF0ZXMucmVzaXplKCk7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gQXBwO1xuIiwidmFyIHV0aWwgPSByZXF1aXJlKCd1dGlsJyk7XG52YXIgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcblxudmFyIEpzb25Mb2FkZXIgPSByZXF1aXJlKCcuL2xvYWRlci9qc29uLWxvYWRlcicpO1xudmFyIGltYWdlTG9hZGVyID0gcmVxdWlyZSgnLi9sb2FkZXIvaW1hZ2UtbG9hZGVyJyk7XG52YXIgdGV4dExvYWRlciA9IHJlcXVpcmUoJy4vbG9hZGVyL3RleHQtbG9hZGVyJyk7XG5cbnZhciBBc3NldHMgPSBmdW5jdGlvbihhcHApIHtcbiAgdGhpcy5pc0xvYWRpbmcgPSBmYWxzZTtcblxuICB0aGlzLml0ZW1zQ291bnQgPSAwO1xuICB0aGlzLnByb2dyZXNzID0gMDtcblxuICB0aGlzLl90aGluZ3NUb0xvYWQgPSAwO1xuICB0aGlzLl9kYXRhID0ge307XG4gIHRoaXMuX3ByZWxvYWRpbmcgPSB0cnVlO1xuXG4gIHRoaXMuX2NhbGxiYWNrID0gbnVsbDtcblxuICB0aGlzLl90b0xvYWQgPSBbXTtcblxuICB0aGlzLl9sb2FkZXJzID0ge307XG5cbiAgdGhpcy5hZGRMb2FkZXIoJ2pzb24nLCBKc29uTG9hZGVyKTtcblxuICB2YXIgYXVkaW9Mb2FkZXIgPSByZXF1aXJlKCcuL2xvYWRlci9hdWRpby1sb2FkZXInKShhcHAuYXVkaW8pO1xuXG4gIHRoaXMuYWRkTG9hZGVyKCdtcDMnLCBhdWRpb0xvYWRlcik7XG4gIHRoaXMuYWRkTG9hZGVyKCdtdXNpYycsIGF1ZGlvTG9hZGVyKTtcbiAgdGhpcy5hZGRMb2FkZXIoJ3NvdW5kJywgYXVkaW9Mb2FkZXIpO1xuXG4gIHRoaXMuYWRkTG9hZGVyKCdpbWFnZScsIGltYWdlTG9hZGVyKTtcbiAgdGhpcy5hZGRMb2FkZXIoJ3RleHR1cmUnLCBpbWFnZUxvYWRlcik7XG4gIHRoaXMuYWRkTG9hZGVyKCdzcHJpdGUnLCBpbWFnZUxvYWRlcik7XG59O1xuXG5Bc3NldHMucHJvdG90eXBlLmFkZExvYWRlciA9IGZ1bmN0aW9uKG5hbWUsIGZuKSB7XG4gIHRoaXMuX2xvYWRlcnNbbmFtZV0gPSBmbjtcbn07XG5cbkFzc2V0cy5wcm90b3R5cGUuc3RhcnQgPSBmdW5jdGlvbihjYWxsYmFjaykge1xuICB0aGlzLl9jYWxsYmFjayA9IGNhbGxiYWNrO1xuXG4gIHRoaXMuX3RvTG9hZC5mb3JFYWNoKGZ1bmN0aW9uKGN1cnJlbnQpIHtcbiAgICB0aGlzLl9sb2FkQXNzZXRGaWxlKGN1cnJlbnQsIGZ1bmN0aW9uKG5hbWUsIGRhdGEpIHtcbiAgICAgIHRoaXMuc2V0KG5hbWUsIGRhdGEpO1xuICAgICAgaWYgKGN1cnJlbnQuY2FsbGJhY2spIHsgY3VycmVudC5jYWxsYmFjayhkYXRhKTsgfVxuXG4gICAgICB0aGlzLl9maW5pc2hlZFF1ZXVlZEZpbGUoKTtcbiAgICB9LmJpbmQodGhpcykpO1xuICB9LmJpbmQodGhpcykpO1xuXG4gIHRoaXMuX3RoaW5nc1RvTG9hZCA9IHRoaXMuaXRlbXNDb3VudDtcblxuICBpZiAodGhpcy5fdGhpbmdzVG9Mb2FkID09PSAwKSB7XG4gICAgdGhpcy5fZG9uZSgpO1xuICB9XG59O1xuXG5Bc3NldHMucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgcmV0dXJuIHRoaXMuX2RhdGFbcGF0aC5ub3JtYWxpemUobmFtZSldO1xufTtcblxuQXNzZXRzLnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbihuYW1lLCB2YWx1ZSkge1xuICB0aGlzLl9kYXRhW3BhdGgubm9ybWFsaXplKG5hbWUpXSA9IHZhbHVlO1xufTtcblxuQXNzZXRzLnByb3RvdHlwZS5yZW1vdmUgPSBmdW5jdGlvbihuYW1lKSB7XG4gIHRoaXMuc2V0KG5hbWUsIG51bGwpO1xufTtcblxuQXNzZXRzLnByb3RvdHlwZS5sb2FkID0gZnVuY3Rpb24odHlwZSwgdXJsLCBjYWxsYmFjaykge1xuICB2YXIgbG9hZE9iamVjdCA9IHtcbiAgICB0eXBlOiB0eXBlLFxuICAgIHVybDogKHVybCAhPSBudWxsID8gcGF0aC5ub3JtYWxpemUodXJsKSA6IG51bGwpLFxuICAgIGNhbGxiYWNrOiBjYWxsYmFjayxcbiAgICBwcm9ncmVzczogMFxuICB9O1xuXG4gIGlmICh0aGlzLl9wcmVsb2FkaW5nKSB7XG4gICAgdGhpcy5fcXVldWVGaWxlKGxvYWRPYmplY3QpO1xuICB9IGVsc2Uge1xuICAgIHRoaXMuX2xvYWRBc3NldEZpbGUobG9hZE9iamVjdCwgZnVuY3Rpb24obmFtZSwgZGF0YSkge1xuICAgICAgdGhpcy5zZXQobmFtZSwgZGF0YSk7XG4gICAgICBpZiAoY2FsbGJhY2spIHsgY2FsbGJhY2soZGF0YSk7IH1cbiAgICB9LmJpbmQodGhpcykpO1xuICB9XG59O1xuXG5Bc3NldHMucHJvdG90eXBlLl9xdWV1ZUZpbGUgPSBmdW5jdGlvbihsb2FkT2JqZWN0KSB7XG4gIHRoaXMuaXNMb2FkaW5nID0gdHJ1ZTtcbiAgdGhpcy5pdGVtc0NvdW50ICs9IDE7XG5cbiAgdGhpcy5fdG9Mb2FkLnB1c2gobG9hZE9iamVjdCk7XG59O1xuXG5Bc3NldHMucHJvdG90eXBlLl9maW5pc2hlZFF1ZXVlZEZpbGUgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5fdGhpbmdzVG9Mb2FkIC09IDE7XG5cbiAgaWYgKHRoaXMuX3RoaW5nc1RvTG9hZCA9PT0gMCkge1xuICAgIHRoaXMuX2RvbmUoKTtcbiAgfVxufTtcblxuQXNzZXRzLnByb3RvdHlwZS5fdXBkYXRlUHJvZ3Jlc3MgPSBmdW5jdGlvbigpIHtcbiAgdmFyIHN1bSA9IDA7XG5cbiAgZm9yICh2YXIgaT0wOyBpPHRoaXMuX3RvTG9hZC5sZW5ndGg7IGkrKykge1xuICAgIHN1bSArPSB0aGlzLl90b0xvYWRbaV0ucHJvZ3Jlc3M7XG4gIH1cblxuICB0aGlzLnByb2dyZXNzID0gc3VtL3RoaXMuX3RvTG9hZC5sZW5ndGg7XG59O1xuXG5Bc3NldHMucHJvdG90eXBlLl9lcnJvciA9IGZ1bmN0aW9uKHVybCkge1xuICBjb25zb2xlLndhcm4oJ0Vycm9yIGxvYWRpbmcgXCInICsgdXJsICsgJ1wiIGFzc2V0Jyk7XG59O1xuXG5Bc3NldHMucHJvdG90eXBlLl9oYW5kbGVDdXN0b21Mb2FkaW5nID0gZnVuY3Rpb24obG9hZGluZywgbG9hZGVyKSB7XG4gIGxvYWRpbmcoZnVuY3Rpb24obmFtZSwgdmFsdWUpIHtcbiAgICBsb2FkZXIuZG9uZSh2YWx1ZSwgbmFtZSk7XG4gIH0pO1xufTtcblxuQXNzZXRzLnByb3RvdHlwZS5fbG9hZEFzc2V0RmlsZSA9IGZ1bmN0aW9uKGZpbGUsIGNhbGxiYWNrKSB7XG4gIHZhciB0eXBlID0gZmlsZS50eXBlO1xuICB2YXIgdXJsID0gZmlsZS51cmw7XG5cbiAgdmFyIG1hbmFnZXIgPSB7XG4gICAgZG9uZTogZnVuY3Rpb24oZGF0YSwgbmFtZSkge1xuICAgICAgbmFtZSA9IG5hbWUgPT0gbnVsbCA/IGZpbGUudXJsIDogbmFtZTtcblxuICAgICAgZmlsZS5wcm9ncmVzcyA9IDE7XG4gICAgICBjYWxsYmFjayhuYW1lLCBkYXRhKTtcbiAgICAgIHRoaXMuX3VwZGF0ZVByb2dyZXNzKCk7XG4gICAgfS5iaW5kKHRoaXMpLFxuXG4gICAgZXJyb3I6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5fZXJyb3IuYmluZCh0aGlzKTtcbiAgICB9LmJpbmQodGhpcyksXG5cbiAgICBwcm9ncmVzczogZnVuY3Rpb24ocGVyY2VudCkge1xuICAgICAgZmlsZS5wcm9ncmVzcyA9IHBlcmNlbnQ7XG4gICAgICB0aGlzLl91cGRhdGVQcm9ncmVzcygpO1xuICAgIH0uYmluZCh0aGlzKVxuICB9O1xuXG4gIGlmICh1dGlsLmlzRnVuY3Rpb24odHlwZSkpIHtcbiAgICB0aGlzLl9oYW5kbGVDdXN0b21Mb2FkaW5nKHR5cGUsIG1hbmFnZXIpO1xuICB9IGVsc2Uge1xuICAgIHR5cGUgPSB0eXBlLnRvTG93ZXJDYXNlKCk7XG4gICAgdmFyIGxvYWRlciA9IHRoaXMuX2xvYWRlcnNbdHlwZV0gfHwgdGV4dExvYWRlcjtcbiAgICBsb2FkZXIodXJsLCBtYW5hZ2VyKTtcbiAgfVxufTtcblxuQXNzZXRzLnByb3RvdHlwZS5fZG9uZSA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLmlzTG9hZGluZyA9IGZhbHNlO1xuICB0aGlzLl9wcmVsb2FkaW5nID0gZmFsc2U7XG4gIHNldFRpbWVvdXQodGhpcy5fY2FsbGJhY2ssIDApO1xufTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IEFzc2V0cztcbiIsInJlcXVpcmUoJy4vcmFmLXBvbHlmaWxsJykoKTtcblxudmFyIEFwcCA9IHJlcXVpcmUoJy4vYXBwJyk7XG5cbnZhciBUaW1lID0gcmVxdWlyZSgnLi90aW1lJyk7XG5cbnZhciBTdGF0ZU1hbmFnZXIgPSByZXF1aXJlKCcuL3N0YXRlLW1hbmFnZXInKTtcblxudmFyIElucHV0ID0gcmVxdWlyZSgnLi9pbnB1dCcpO1xudmFyIExvYWRpbmcgPSByZXF1aXJlKCcuL2xvYWRpbmcnKTtcblxudmFyIEVuZ2luZSA9IGZ1bmN0aW9uKGNvbnRhaW5lciwgbWV0aG9kcykge1xuICB0aGlzLmNvbnRhaW5lciA9IGNvbnRhaW5lcjtcblxuICB0aGlzLmNvbnRyb2xsZXIgPSBuZXcgQXBwKGNvbnRhaW5lcik7XG5cbiAgdGhpcy5hcHAgPSBtZXRob2RzO1xuICB0aGlzLmNvbnRyb2xsZXIubWFpbiA9IHRoaXMuYXBwO1xuICB0aGlzLmFwcC5hcHAgPSB0aGlzLmNvbnRyb2xsZXI7XG5cbiAgdGhpcy50aWNrRnVuYyA9IChmdW5jdGlvbiAoc2VsZikgeyByZXR1cm4gZnVuY3Rpb24oKSB7IHNlbGYudGljaygpOyB9OyB9KSh0aGlzKTtcbiAgdGhpcy5wcmVsb2FkZXJUaWNrRnVuYyA9IChmdW5jdGlvbiAoc2VsZikgeyByZXR1cm4gZnVuY3Rpb24oKSB7IHNlbGYuX3ByZWxvYWRlclRpY2soKTsgfTsgfSkodGhpcyk7XG5cbiAgdGhpcy5zdHJheVRpbWUgPSAwO1xuICB0aGlzLl90aW1lID0gMDtcblxuICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuY29uZmlndXJlQXBwKCk7XG4gIH0uYmluZCh0aGlzKSwgMCk7XG59O1xuXG5FbmdpbmUucHJvdG90eXBlLmNvbmZpZ3VyZUFwcCA9IGZ1bmN0aW9uKCkge1xuICBpZiAodGhpcy5hcHAuY29uZmlndXJlKSB7XG4gICAgdGhpcy5hcHAuY29uZmlndXJlKCk7XG4gIH1cblxuICB0aGlzLmNvbnRyb2xsZXIudmlkZW8uaW5pdCgpO1xuXG4gIGlmICh0aGlzLmNvbnRyb2xsZXIuY29uZmlnLmFkZElucHV0RXZlbnRzKSB7XG4gICAgdGhpcy5jb250cm9sbGVyLmlucHV0ID0gbmV3IElucHV0KHRoaXMuY29udHJvbGxlcik7XG4gIH1cblxuICB0aGlzLmNvbnRyb2xsZXIucmVzaXplKHRoaXMuY29udHJvbGxlci53aWR0aCwgdGhpcy5jb250cm9sbGVyLmhlaWdodCk7XG5cbiAgdGhpcy5fc2V0RGVmYXVsdFN0YXRlcygpO1xuXG4gIHRoaXMuX3RpbWUgPSBUaW1lLm5vdygpO1xuXG4gIHRoaXMuX3ByZWxvYWRlclZpZGVvID0gdGhpcy5jb250cm9sbGVyLnZpZGVvLmNyZWF0ZUxheWVyKHtcbiAgICBhbGxvd0hpRFBJOiB0cnVlLFxuICAgIGdldENhbnZhc0NvbnRleHQ6IHRydWVcbiAgfSk7XG5cbiAgdGhpcy5fcHJlbG9hZGVyID0gbmV3IExvYWRpbmcodGhpcy5jb250cm9sbGVyKTtcblxuICB0aGlzLmNvbnRyb2xsZXIuYXNzZXRzLnN0YXJ0KGZ1bmN0aW9uKCkge1xuICAgIHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZSh0aGlzLnByZWxvYWRlcklkKTtcbiAgICB0aGlzLl9wcmVsb2FkZXJWaWRlby5kZXN0cm95KCk7XG5cbiAgICB0aGlzLnN0YXJ0KCk7XG4gIH0uYmluZCh0aGlzKSk7XG5cbiAgaWYgKHRoaXMuY29udHJvbGxlci5hc3NldHMuaXNMb2FkaW5nICYmIHRoaXMuY29udHJvbGxlci5jb25maWcuc2hvd1ByZWxvYWRlcikge1xuICAgIHRoaXMucHJlbG9hZGVySWQgPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRoaXMucHJlbG9hZGVyVGlja0Z1bmMpO1xuICB9XG59O1xuXG5FbmdpbmUucHJvdG90eXBlLmFkZEV2ZW50cyA9IGZ1bmN0aW9uKCkge1xuICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2JsdXInLCBmdW5jdGlvbigpIHtcbiAgICBzZWxmLmNvbnRyb2xsZXIuaW5wdXQucmVzZXRLZXlzKCk7XG5cbiAgICBpZiAoc2VsZi5hcHAuYmx1cikge1xuICAgICAgc2VsZi5hcHAuYmx1cigpO1xuICAgIH1cbiAgfSk7XG5cbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2ZvY3VzJywgZnVuY3Rpb24oKSB7XG4gICAgc2VsZi5jb250cm9sbGVyLmlucHV0LnJlc2V0S2V5cygpO1xuXG4gICAgaWYgKHNlbGYuYXBwLmZvY3VzKSB7XG4gICAgICBzZWxmLmFwcC5mb2N1cygpO1xuICAgIH1cbiAgfSk7XG59O1xuXG5FbmdpbmUucHJvdG90eXBlLnN0YXJ0ID0gZnVuY3Rpb24oKSB7XG4gIGlmICh0aGlzLmNvbnRyb2xsZXIuY29uZmlnLmFkZElucHV0RXZlbnRzKSB7XG4gICAgdGhpcy5hZGRFdmVudHMoKTtcbiAgfVxuXG4gIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy50aWNrRnVuYyk7XG59O1xuXG5FbmdpbmUucHJvdG90eXBlLnRpY2sgPSBmdW5jdGlvbigpIHtcbiAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLnRpY2tGdW5jKTtcblxuICB0aGlzLmNvbnRyb2xsZXIuZGVidWcuYmVnaW4oKTtcblxuICB2YXIgbm93ID0gVGltZS5ub3coKTtcbiAgdmFyIHRpbWUgPSAobm93IC0gdGhpcy5fdGltZSkgLyAxMDAwO1xuICB0aGlzLl90aW1lID0gbm93O1xuXG4gIHRoaXMuY29udHJvbGxlci5kZWJ1Zy5wZXJmKCd1cGRhdGUnKTtcbiAgdGhpcy51cGRhdGUodGltZSk7XG4gIHRoaXMuY29udHJvbGxlci5kZWJ1Zy5zdG9wUGVyZigndXBkYXRlJyk7XG5cbiAgdGhpcy5jb250cm9sbGVyLnN0YXRlcy5leGl0VXBkYXRlKHRpbWUpO1xuXG4gIHRoaXMuY29udHJvbGxlci5kZWJ1Zy5wZXJmKCdyZW5kZXInKTtcbiAgdGhpcy5yZW5kZXIoKTtcbiAgdGhpcy5jb250cm9sbGVyLmRlYnVnLnN0b3BQZXJmKCdyZW5kZXInKTtcblxuICB0aGlzLmNvbnRyb2xsZXIuZGVidWcucmVuZGVyKCk7XG5cbiAgdGhpcy5jb250cm9sbGVyLmRlYnVnLmVuZCgpO1xufTtcblxuRW5naW5lLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbih0aW1lKSB7XG4gIGlmICh0aW1lID4gdGhpcy5jb250cm9sbGVyLmNvbmZpZy5tYXhTdGVwVGltZSkgeyB0aW1lID0gdGhpcy5jb250cm9sbGVyLmNvbmZpZy5tYXhTdGVwVGltZTsgfVxuXG4gIGlmICh0aGlzLmNvbnRyb2xsZXIuY29uZmlnLmZpeGVkU3RlcCkge1xuICAgIHRoaXMuc3RyYXlUaW1lID0gdGhpcy5zdHJheVRpbWUgKyB0aW1lO1xuICAgIHdoaWxlICh0aGlzLnN0cmF5VGltZSA+PSB0aGlzLmNvbnRyb2xsZXIuY29uZmlnLnN0ZXBUaW1lKSB7XG4gICAgICB0aGlzLnN0cmF5VGltZSA9IHRoaXMuc3RyYXlUaW1lIC0gdGhpcy5jb250cm9sbGVyLmNvbmZpZy5zdGVwVGltZTtcbiAgICAgIHRoaXMuY29udHJvbGxlci5zdGF0ZXMudXBkYXRlKHRoaXMuY29udHJvbGxlci5jb25maWcuc3RlcFRpbWUpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICB0aGlzLmNvbnRyb2xsZXIuc3RhdGVzLnVwZGF0ZSh0aW1lKTtcbiAgfVxufTtcblxuRW5naW5lLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5jb250cm9sbGVyLnZpZGVvLmJlZ2luRnJhbWUoKTtcblxuICB0aGlzLmNvbnRyb2xsZXIudmlkZW8uY2xlYXIoKTtcblxuICB0aGlzLmNvbnRyb2xsZXIuc3RhdGVzLnJlbmRlcigpO1xuXG4gIHRoaXMuY29udHJvbGxlci52aWRlby5lbmRGcmFtZSgpO1xufTtcblxuRW5naW5lLnByb3RvdHlwZS5fcHJlbG9hZGVyVGljayA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLnByZWxvYWRlcklkID0gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLnByZWxvYWRlclRpY2tGdW5jKTtcblxuICB2YXIgbm93ID0gVGltZS5ub3coKTtcbiAgdmFyIHRpbWUgPSAobm93IC0gdGhpcy5fdGltZSkgLyAxMDAwO1xuICB0aGlzLl90aW1lID0gbm93O1xuXG4gIGlmICh0aGlzLmFwcC5wcmVsb2FkaW5nKSB7XG4gICAgdGhpcy5hcHAucHJlbG9hZGluZyh0aW1lLCB0aGlzLl9wcmVsb2FkZXJWaWRlbyk7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5fcHJlbG9hZGVyLnJlbmRlcih0aW1lLCB0aGlzLl9wcmVsb2FkZXJWaWRlbyk7XG4gIH1cbn07XG5cbkVuZ2luZS5wcm90b3R5cGUuX3NldERlZmF1bHRTdGF0ZXMgPSBmdW5jdGlvbigpIHtcbiAgdmFyIHN0YXRlcyA9IG5ldyBTdGF0ZU1hbmFnZXIoKTtcbiAgc3RhdGVzLmFkZCgnbWFpbicsIHRoaXMuYXBwKTtcbiAgc3RhdGVzLmFkZCgnZGVidWcnLCB0aGlzLmNvbnRyb2xsZXIuZGVidWcpO1xuXG4gIHN0YXRlcy5wcm90ZWN0KCdtYWluJyk7XG4gIHN0YXRlcy5wcm90ZWN0KCdkZWJ1ZycpO1xuICBzdGF0ZXMuaGlkZSgnZGVidWcnKTtcblxuICB0aGlzLmNvbnRyb2xsZXIuc3RhdGVzID0gc3RhdGVzO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBFbmdpbmU7XG4iLCJ2YXIga2V5cyA9IHJlcXVpcmUoJy4va2V5cycpO1xuXG52YXIgaW52S2V5cyA9IHt9O1xuZm9yICh2YXIga2V5TmFtZSBpbiBrZXlzKSB7XG4gIGludktleXNba2V5c1trZXlOYW1lXV0gPSBrZXlOYW1lO1xufVxuXG52YXIgSW5wdXQgPSBmdW5jdGlvbihhcHApIHtcbiAgdGhpcy5fY29udGFpbmVyID0gYXBwLmNvbnRhaW5lcjtcbiAgdGhpcy5fa2V5cyA9IHt9O1xuXG4gIHRoaXMuY2FuQ29udHJvbEtleXMgPSB0cnVlO1xuXG4gIHRoaXMubW91c2UgPSB7XG4gICAgaXNEb3duOiBmYWxzZSxcbiAgICBpc0xlZnREb3duOiBmYWxzZSxcbiAgICBpc01pZGRsZURvd246IGZhbHNlLFxuICAgIGlzUmlnaHREb3duOiBmYWxzZSxcbiAgICB4OiBudWxsLFxuICAgIHk6IG51bGwsXG4gICAgZHg6IDAsXG4gICAgZHk6IDBcbiAgfTtcblxuICB0aGlzLl9hZGRFdmVudHMoYXBwKTtcbn07XG5cbklucHV0LnByb3RvdHlwZS5yZXNldEtleXMgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5fa2V5cyA9IHt9O1xufTtcblxuSW5wdXQucHJvdG90eXBlLmlzS2V5RG93biA9IGZ1bmN0aW9uKGtleSkge1xuICBpZiAoa2V5ID09IG51bGwpIHsgcmV0dXJuIGZhbHNlOyB9XG5cbiAgaWYgKHRoaXMuY2FuQ29udHJvbEtleXMpIHtcbiAgICB2YXIgY29kZSA9IHR5cGVvZiBrZXkgPT09ICdudW1iZXInID8ga2V5IDoga2V5c1trZXkudG9Mb3dlckNhc2UoKV07XG4gICAgcmV0dXJuIHRoaXMuX2tleXNbY29kZV07XG4gIH1cbn07XG5cbklucHV0LnByb3RvdHlwZS5fYWRkRXZlbnRzID0gZnVuY3Rpb24oYXBwKSB7XG4gIHZhciBzZWxmID0gdGhpcztcblxuICB2YXIgbW91c2VFdmVudCA9IHtcbiAgICB4OiBudWxsLFxuICAgIHk6IG51bGwsXG4gICAgYnV0dG9uOiBudWxsLFxuICAgIGlzVG91Y2g6IGZhbHNlLFxuICAgIGV2ZW50OiBudWxsLFxuICAgIHN0YXRlU3RvcEV2ZW50OiBmdW5jdGlvbigpIHtcbiAgICAgIGFwcC5zdGF0ZXMuX3ByZXZlbnRFdmVudCA9IHRydWU7XG4gICAgfVxuICB9O1xuXG4gIHZhciBrZXlib2FyZEV2ZW50ID0ge1xuICAgIGtleTogbnVsbCxcbiAgICBuYW1lOiBudWxsLFxuICAgIGV2ZW50OiBudWxsLFxuICAgIHN0YXRlU3RvcEV2ZW50OiBmdW5jdGlvbigpIHtcbiAgICAgIGFwcC5zdGF0ZXMuX3ByZXZlbnRFdmVudCA9IHRydWU7XG4gICAgfVxuICB9O1xuXG4gIHNlbGYuX2NvbnRhaW5lci5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBmdW5jdGlvbihlKSB7XG4gICAgdmFyIHggPSBlLm9mZnNldFggPT09IHVuZGVmaW5lZCA/IGUubGF5ZXJYIC0gc2VsZi5fY29udGFpbmVyLm9mZnNldExlZnQgOiBlLm9mZnNldFg7XG4gICAgdmFyIHkgPSBlLm9mZnNldFkgPT09IHVuZGVmaW5lZCA/IGUubGF5ZXJZIC0gc2VsZi5fY29udGFpbmVyLm9mZnNldFRvcCA6IGUub2Zmc2V0WTtcblxuICAgIGlmIChzZWxmLm1vdXNlLnggIT0gbnVsbCAmJiBzZWxmLm1vdXNlLnggIT0gbnVsbCkge1xuICAgICAgc2VsZi5tb3VzZS5keCA9IHggLSBzZWxmLm1vdXNlLng7XG4gICAgICBzZWxmLm1vdXNlLmR5ID0geSAtIHNlbGYubW91c2UueTtcbiAgICB9XG5cbiAgICBzZWxmLm1vdXNlLnggPSB4O1xuICAgIHNlbGYubW91c2UueSA9IHk7XG4gICAgc2VsZi5tb3VzZS5pc0FjdGl2ZSA9IHRydWU7XG5cbiAgICBtb3VzZUV2ZW50LnggPSB4O1xuICAgIG1vdXNlRXZlbnQueSA9IHk7XG4gICAgbW91c2VFdmVudC5idXR0b24gPSBudWxsO1xuICAgIG1vdXNlRXZlbnQuZXZlbnQgPSBlO1xuICAgIG1vdXNlRXZlbnQuaXNUb3VjaCA9IGZhbHNlO1xuXG4gICAgYXBwLnN0YXRlcy5tb3VzZW1vdmUobW91c2VFdmVudCk7XG4gIH0pO1xuXG4gIHNlbGYuX2NvbnRhaW5lci5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgZnVuY3Rpb24oZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgIHZhciB4ID0gZS5vZmZzZXRYID09PSB1bmRlZmluZWQgPyBlLmxheWVyWCAtIHNlbGYuX2NvbnRhaW5lci5vZmZzZXRMZWZ0IDogZS5vZmZzZXRYO1xuICAgIHZhciB5ID0gZS5vZmZzZXRZID09PSB1bmRlZmluZWQgPyBlLmxheWVyWSAtIHNlbGYuX2NvbnRhaW5lci5vZmZzZXRUb3AgOiBlLm9mZnNldFk7XG5cbiAgICBzd2l0Y2ggKGUuYnV0dG9uKSB7XG4gICAgICBjYXNlIDA6XG4gICAgICAgIHNlbGYubW91c2UuaXNMZWZ0RG93biA9IGZhbHNlO1xuICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDE6XG4gICAgICAgIHNlbGYubW91c2UuaXNNaWRkbGVEb3duID0gZmFsc2U7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAyOlxuICAgICAgICBzZWxmLm1vdXNlLmlzUmlnaHREb3duID0gZmFsc2U7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIHNlbGYubW91c2UuaXNEb3duID0gc2VsZi5tb3VzZS5pc0xlZnREb3duIHx8IHNlbGYubW91c2UuaXNSaWdodERvd24gfHwgc2VsZi5tb3VzZS5pc01pZGRsZURvd247XG5cbiAgICBtb3VzZUV2ZW50LnggPSB4O1xuICAgIG1vdXNlRXZlbnQueSA9IHk7XG4gICAgbW91c2VFdmVudC5idXR0b24gPSBlLmJ1dHRvbjtcbiAgICBtb3VzZUV2ZW50LmV2ZW50ID0gZTtcbiAgICBtb3VzZUV2ZW50LmlzVG91Y2ggPSBmYWxzZTtcblxuICAgIGFwcC5zdGF0ZXMubW91c2V1cChtb3VzZUV2ZW50KTtcbiAgfSwgZmFsc2UpO1xuXG4gIHNlbGYuX2NvbnRhaW5lci5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWxlYXZlJywgZnVuY3Rpb24oKSB7XG4gICAgc2VsZi5tb3VzZS5pc0FjdGl2ZSA9IGZhbHNlO1xuXG4gICAgc2VsZi5tb3VzZS5pc0Rvd24gPSBmYWxzZTtcbiAgICBzZWxmLm1vdXNlLmlzTGVmdERvd24gPSBmYWxzZTtcbiAgICBzZWxmLm1vdXNlLmlzUmlnaHREb3duID0gZmFsc2U7XG4gICAgc2VsZi5tb3VzZS5pc01pZGRsZURvd24gPSBmYWxzZTtcbiAgfSk7XG5cbiAgc2VsZi5fY29udGFpbmVyLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZW50ZXInLCBmdW5jdGlvbigpIHtcbiAgICBzZWxmLm1vdXNlLmlzQWN0aXZlID0gdHJ1ZTtcbiAgfSk7XG5cbiAgc2VsZi5fY29udGFpbmVyLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIGZ1bmN0aW9uKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICB2YXIgeCA9IGUub2Zmc2V0WCA9PT0gdW5kZWZpbmVkID8gZS5sYXllclggLSBzZWxmLl9jb250YWluZXIub2Zmc2V0TGVmdCA6IGUub2Zmc2V0WDtcbiAgICB2YXIgeSA9IGUub2Zmc2V0WSA9PT0gdW5kZWZpbmVkID8gZS5sYXllclkgLSBzZWxmLl9jb250YWluZXIub2Zmc2V0VG9wIDogZS5vZmZzZXRZO1xuXG4gICAgc2VsZi5tb3VzZS54ID0geDtcbiAgICBzZWxmLm1vdXNlLnkgPSB5O1xuICAgIHNlbGYubW91c2UuaXNEb3duID0gdHJ1ZTtcbiAgICBzZWxmLm1vdXNlLmlzQWN0aXZlID0gdHJ1ZTtcblxuICAgIHN3aXRjaCAoZS5idXR0b24pIHtcbiAgICAgIGNhc2UgMDpcbiAgICAgICAgc2VsZi5tb3VzZS5pc0xlZnREb3duID0gdHJ1ZTtcbiAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAxOlxuICAgICAgICBzZWxmLm1vdXNlLmlzTWlkZGxlRG93biA9IHRydWU7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAyOlxuICAgICAgICBzZWxmLm1vdXNlLmlzUmlnaHREb3duID0gdHJ1ZTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgbW91c2VFdmVudC54ID0geDtcbiAgICBtb3VzZUV2ZW50LnkgPSB5O1xuICAgIG1vdXNlRXZlbnQuYnV0dG9uID0gZS5idXR0b247XG4gICAgbW91c2VFdmVudC5ldmVudCA9IGU7XG4gICAgbW91c2VFdmVudC5pc1RvdWNoID0gZmFsc2U7XG5cbiAgICBhcHAuc3RhdGVzLm1vdXNlZG93bihtb3VzZUV2ZW50KTtcbiAgfSwgZmFsc2UpO1xuXG4gIHNlbGYuX2NvbnRhaW5lci5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgZnVuY3Rpb24oZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgIGZvciAodmFyIGk9MDsgaTxlLnRvdWNoZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciB0b3VjaCA9IGUudG91Y2hlc1tpXTtcblxuICAgICAgdmFyIHggPSB0b3VjaC5wYWdlWCAtIHNlbGYuX2NvbnRhaW5lci5vZmZzZXRMZWZ0O1xuICAgICAgdmFyIHkgPSB0b3VjaC5wYWdlWSAtIHNlbGYuX2NvbnRhaW5lci5vZmZzZXRUb3A7XG5cbiAgICAgIHNlbGYubW91c2UueCA9IHg7XG4gICAgICBzZWxmLm1vdXNlLnkgPSB5O1xuICAgICAgc2VsZi5tb3VzZS5pc0Rvd24gPSB0cnVlO1xuICAgICAgc2VsZi5tb3VzZS5pc0xlZnREb3duID0gdHJ1ZTtcbiAgICAgIHNlbGYubW91c2UuaXNBY3RpdmUgPSB0cnVlO1xuXG4gICAgICBtb3VzZUV2ZW50LnggPSB4O1xuICAgICAgbW91c2VFdmVudC55ID0geTtcbiAgICAgIG1vdXNlRXZlbnQuYnV0dG9uID0gMTtcbiAgICAgIG1vdXNlRXZlbnQuZXZlbnQgPSBlO1xuICAgICAgbW91c2VFdmVudC5pc1RvdWNoID0gdHJ1ZTtcblxuICAgICAgYXBwLnN0YXRlcy5tb3VzZWRvd24obW91c2VFdmVudCk7XG4gICAgfVxuICB9KTtcblxuICBzZWxmLl9jb250YWluZXIuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgZnVuY3Rpb24oZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgIGZvciAodmFyIGk9MDsgaTxlLnRvdWNoZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciB0b3VjaCA9IGUudG91Y2hlc1tpXTtcblxuICAgICAgdmFyIHggPSB0b3VjaC5wYWdlWCAtIHNlbGYuX2NvbnRhaW5lci5vZmZzZXRMZWZ0O1xuICAgICAgdmFyIHkgPSB0b3VjaC5wYWdlWSAtIHNlbGYuX2NvbnRhaW5lci5vZmZzZXRUb3A7XG5cbiAgICAgIGlmIChzZWxmLm1vdXNlLnggIT0gbnVsbCAmJiBzZWxmLm1vdXNlLnggIT0gbnVsbCkge1xuICAgICAgICBzZWxmLm1vdXNlLmR4ID0geCAtIHNlbGYubW91c2UueDtcbiAgICAgICAgc2VsZi5tb3VzZS5keSA9IHkgLSBzZWxmLm1vdXNlLnk7XG4gICAgICB9XG5cbiAgICAgIHNlbGYubW91c2UueCA9IHg7XG4gICAgICBzZWxmLm1vdXNlLnkgPSB5O1xuICAgICAgc2VsZi5tb3VzZS5pc0Rvd24gPSB0cnVlO1xuICAgICAgc2VsZi5tb3VzZS5pc0xlZnREb3duID0gdHJ1ZTtcbiAgICAgIHNlbGYubW91c2UuaXNBY3RpdmUgPSB0cnVlO1xuXG4gICAgICBtb3VzZUV2ZW50LnggPSB4O1xuICAgICAgbW91c2VFdmVudC55ID0geTtcbiAgICAgIG1vdXNlRXZlbnQuZXZlbnQgPSBlO1xuICAgICAgbW91c2VFdmVudC5pc1RvdWNoID0gdHJ1ZTtcblxuICAgICAgYXBwLnN0YXRlcy5tb3VzZW1vdmUobW91c2VFdmVudCk7XG4gICAgfVxuICB9KTtcblxuICBzZWxmLl9jb250YWluZXIuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCBmdW5jdGlvbihlKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgdmFyIHRvdWNoID0gZS5jaGFuZ2VkVG91Y2hlc1swXTtcblxuICAgIHZhciB4ID0gdG91Y2gucGFnZVggLSBzZWxmLl9jb250YWluZXIub2Zmc2V0TGVmdDtcbiAgICB2YXIgeSA9IHRvdWNoLnBhZ2VZIC0gc2VsZi5fY29udGFpbmVyLm9mZnNldFRvcDtcblxuICAgIHNlbGYubW91c2UueCA9IHg7XG4gICAgc2VsZi5tb3VzZS55ID0geTtcbiAgICBzZWxmLm1vdXNlLmlzQWN0aXZlID0gZmFsc2U7XG4gICAgc2VsZi5tb3VzZS5pc0Rvd24gPSBmYWxzZTtcbiAgICBzZWxmLm1vdXNlLmlzTGVmdERvd24gPSBmYWxzZTtcbiAgICBzZWxmLm1vdXNlLmlzUmlnaHREb3duID0gZmFsc2U7XG4gICAgc2VsZi5tb3VzZS5pc01pZGRsZURvd24gPSBmYWxzZTtcblxuICAgIG1vdXNlRXZlbnQueCA9IHg7XG4gICAgbW91c2VFdmVudC55ID0geTtcbiAgICBtb3VzZUV2ZW50LmV2ZW50ID0gZTtcbiAgICBtb3VzZUV2ZW50LmlzVG91Y2ggPSB0cnVlO1xuXG4gICAgYXBwLnN0YXRlcy5tb3VzZXVwKG1vdXNlRXZlbnQpO1xuICB9KTtcblxuICBzZWxmLl9jb250YWluZXIuYWRkRXZlbnRMaXN0ZW5lcignY29udGV4dG1lbnUnLCBmdW5jdGlvbihlKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICB9KTtcblxuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgZnVuY3Rpb24oZSkge1xuICAgIHNlbGYuX2tleXNbZS5rZXlDb2RlXSA9IHRydWU7XG5cbiAgICBrZXlib2FyZEV2ZW50LmtleSA9IGUud2hpY2g7XG4gICAga2V5Ym9hcmRFdmVudC5uYW1lID0gaW52S2V5c1tlLndoaWNoXTtcbiAgICBrZXlib2FyZEV2ZW50LmV2ZW50ID0gZTtcblxuICAgIGFwcC5zdGF0ZXMua2V5ZG93bihrZXlib2FyZEV2ZW50KTtcbiAgfSk7XG5cbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCBmdW5jdGlvbihlKSB7XG4gICAgc2VsZi5fa2V5c1tlLmtleUNvZGVdID0gZmFsc2U7XG5cbiAgICBrZXlib2FyZEV2ZW50LmtleSA9IGUud2hpY2g7XG4gICAga2V5Ym9hcmRFdmVudC5uYW1lID0gaW52S2V5c1tlLndoaWNoXTtcbiAgICBrZXlib2FyZEV2ZW50LmV2ZW50ID0gZTtcblxuICAgIGFwcC5zdGF0ZXMua2V5dXAoa2V5Ym9hcmRFdmVudCk7XG4gIH0pO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBJbnB1dDtcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICAnYmFja3NwYWNlJzogOCxcbiAgJ3RhYic6IDksXG4gICdlbnRlcic6IDEzLFxuICAncGF1c2UnOiAxOSxcbiAgJ2NhcHMnOiAyMCxcbiAgJ2VzYyc6IDI3LFxuICAnc3BhY2UnOiAzMixcbiAgJ3BhZ2VfdXAnOiAzMyxcbiAgJ3BhZ2VfZG93bic6IDM0LFxuICAnZW5kJzogMzUsXG4gICdob21lJzogMzYsXG4gICdsZWZ0JzogMzcsXG4gICd1cCc6IDM4LFxuICAncmlnaHQnOiAzOSxcbiAgJ2Rvd24nOiA0MCxcbiAgJ2luc2VydCc6IDQ1LFxuICAnZGVsZXRlJzogNDYsXG4gICcwJzogNDgsXG4gICcxJzogNDksXG4gICcyJzogNTAsXG4gICczJzogNTEsXG4gICc0JzogNTIsXG4gICc1JzogNTMsXG4gICc2JzogNTQsXG4gICc3JzogNTUsXG4gICc4JzogNTYsXG4gICc5JzogNTcsXG4gICdhJzogNjUsXG4gICdiJzogNjYsXG4gICdjJzogNjcsXG4gICdkJzogNjgsXG4gICdlJzogNjksXG4gICdmJzogNzAsXG4gICdnJzogNzEsXG4gICdoJzogNzIsXG4gICdpJzogNzMsXG4gICdqJzogNzQsXG4gICdrJzogNzUsXG4gICdsJzogNzYsXG4gICdtJzogNzcsXG4gICduJzogNzgsXG4gICdvJzogNzksXG4gICdwJzogODAsXG4gICdxJzogODEsXG4gICdyJzogODIsXG4gICdzJzogODMsXG4gICd0JzogODQsXG4gICd1JzogODUsXG4gICd2JzogODYsXG4gICd3JzogODcsXG4gICd4JzogODgsXG4gICd5JzogODksXG4gICd6JzogOTAsXG4gICdudW1wYWRfMCc6IDk2LFxuICAnbnVtcGFkXzEnOiA5NyxcbiAgJ251bXBhZF8yJzogOTgsXG4gICdudW1wYWRfMyc6IDk5LFxuICAnbnVtcGFkXzQnOiAxMDAsXG4gICdudW1wYWRfNSc6IDEwMSxcbiAgJ251bXBhZF82JzogMTAyLFxuICAnbnVtcGFkXzcnOiAxMDMsXG4gICdudW1wYWRfOCc6IDEwNCxcbiAgJ251bXBhZF85JzogMTA1LFxuICAnbXVsdGlwbHknOiAxMDYsXG4gICdhZGQnOiAxMDcsXG4gICdzdWJzdHJhY3QnOiAxMDksXG4gICdkZWNpbWFsJzogMTEwLFxuICAnZGl2aWRlJzogMTExLFxuICAnZjEnOiAxMTIsXG4gICdmMic6IDExMyxcbiAgJ2YzJzogMTE0LFxuICAnZjQnOiAxMTUsXG4gICdmNSc6IDExNixcbiAgJ2Y2JzogMTE3LFxuICAnZjcnOiAxMTgsXG4gICdmOCc6IDExOSxcbiAgJ2Y5JzogMTIwLFxuICAnZjEwJzogMTIxLFxuICAnZjExJzogMTIyLFxuICAnZjEyJzogMTIzLFxuICAnc2hpZnQnOiAxNixcbiAgJ2N0cmwnOiAxNyxcbiAgJ2FsdCc6IDE4LFxuICAncGx1cyc6IDE4NyxcbiAgJ2NvbW1hJzogMTg4LFxuICAnbWludXMnOiAxODksXG4gICdwZXJpb2QnOiAxOTBcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG1hbmFnZXIpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKHVybCwgbG9hZGVyKSB7XG4gICAgbWFuYWdlci5sb2FkKHVybCwge1xuICAgICAgZG9uZTogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICBsb2FkZXIuZG9uZShkYXRhKTtcbiAgICAgIH0sXG5cbiAgICAgIHByb2dyZXNzOiBmdW5jdGlvbihlKSB7XG4gICAgICAgIHZhciBwZXJjZW50ID0gZS5sb2FkZWQgLyBlLnRvdGFsO1xuICAgICAgICBsb2FkZXIucHJvZ3Jlc3MocGVyY2VudCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH07XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbih1cmwsIGxvYWRlcikge1xuICB2YXIgVVJMID0gd2luZG93LlVSTCB8fCB3aW5kb3cud2Via2l0VVJMO1xuXG4gIGlmIChVUkwgJiYgXCJjcmVhdGVPYmplY3RVUkxcIiBpbiBVUkwgJiYgXCJVaW50OEFycmF5XCIgaW4gd2luZG93ICYmIFwiQmxvYlwiIGluIHdpbmRvdykge1xuICAgIHZhciByZXF1ZXN0ID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cbiAgICByZXF1ZXN0Lm9wZW4oJ0dFVCcsIHVybCwgdHJ1ZSk7XG4gICAgcmVxdWVzdC5yZXNwb25zZVR5cGUgPSAnYXJyYXlidWZmZXInO1xuXG4gICAgcmVxdWVzdC5hZGRFdmVudExpc3RlbmVyKCdwcm9ncmVzcycsIGZ1bmN0aW9uKGUpIHtcbiAgICAgIHZhciBwZXJjZW50ID0gZS5sb2FkZWQgLyBlLnRvdGFsO1xuICAgICAgbG9hZGVyLnByb2dyZXNzKHBlcmNlbnQpO1xuICAgIH0pO1xuXG4gICAgcmVxdWVzdC5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgIGlmIChyZXF1ZXN0LnN0YXR1cyAhPT0gMjAwKSB7XG4gICAgICAgIHJldHVybiBsb2FkZXIuZXJyb3IodXJsKTtcbiAgICAgIH1cblxuICAgICAgdmFyIGRhdGEgPSB0aGlzLnJlc3BvbnNlO1xuICAgICAgdmFyIGJsb2IgPSBuZXcgQmxvYihbbmV3IFVpbnQ4QXJyYXkoZGF0YSldLCB7IHR5cGU6ICdpbWFnZS9wbmcnIH0pO1xuICAgICAgdmFyIGltYWdlID0gbmV3IEltYWdlKCk7XG4gICAgICBpbWFnZS5zcmMgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKGJsb2IpO1xuICAgICAgbG9hZGVyLmRvbmUoaW1hZ2UpO1xuICAgIH07XG4gICAgcmVxdWVzdC5zZW5kKCk7XG5cbiAgICByZXR1cm47XG4gIH1cblxuICB2YXIgaW1hZ2UgPSBuZXcgSW1hZ2UoKTtcbiAgaW1hZ2Uub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgbG9hZGVyLmRvbmUoaW1hZ2UpO1xuICB9O1xuICBpbWFnZS5vbmVycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgbG9hZGVyLmVycm9yKHVybCk7XG4gIH07XG4gIGltYWdlLnNyYyA9IHVybDtcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHVybCwgbG9hZGVyKSB7XG4gIHZhciByZXF1ZXN0ID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cbiAgcmVxdWVzdC5vcGVuKCdHRVQnLCB1cmwsIHRydWUpO1xuICByZXF1ZXN0LnJlc3BvbnNlVHlwZSA9ICd0ZXh0JztcblxuICByZXF1ZXN0LmFkZEV2ZW50TGlzdGVuZXIoJ3Byb2dyZXNzJywgZnVuY3Rpb24oZSkge1xuICAgIHZhciBwZXJjZW50ID0gZS5sb2FkZWQgLyBlLnRvdGFsO1xuICAgIGxvYWRlci5wcm9ncmVzcyhwZXJjZW50KTtcbiAgfSk7XG5cbiAgcmVxdWVzdC5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAocmVxdWVzdC5zdGF0dXMgIT09IDIwMCkge1xuICAgICAgcmV0dXJuIGxvYWRlci5lcnJvcih1cmwpO1xuICAgIH1cblxuICAgIHZhciBkYXRhID0gSlNPTi5wYXJzZSh0aGlzLnJlc3BvbnNlKTtcbiAgICBsb2FkZXIuZG9uZShkYXRhKTtcbiAgfTtcbiAgcmVxdWVzdC5zZW5kKCk7XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbih1cmwsIGxvYWRlcikge1xuICB2YXIgcmVxdWVzdCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuXG4gIHJlcXVlc3Qub3BlbignR0VUJywgdXJsLCB0cnVlKTtcbiAgcmVxdWVzdC5yZXNwb25zZVR5cGUgPSAndGV4dCc7XG5cbiAgcmVxdWVzdC5hZGRFdmVudExpc3RlbmVyKCdwcm9ncmVzcycsIGZ1bmN0aW9uKGUpIHtcbiAgICB2YXIgcGVyY2VudCA9IGUubG9hZGVkIC8gZS50b3RhbDtcbiAgICBsb2FkZXIucHJvZ3Jlc3MocGVyY2VudCk7XG4gIH0pO1xuXG4gIHJlcXVlc3Qub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKHJlcXVlc3Quc3RhdHVzICE9PSAyMDApIHtcbiAgICAgIHJldHVybiBsb2FkZXIuZXJyb3IodXJsKTtcbiAgICB9XG5cbiAgICB2YXIgZGF0YSA9IHRoaXMucmVzcG9uc2U7XG4gICAgbG9hZGVyLmRvbmUoZGF0YSk7XG4gIH07XG4gIHJlcXVlc3Quc2VuZCgpO1xufTtcbiIsInZhciBMb2FkaW5nID0gZnVuY3Rpb24oYXBwKSB7XG4gIHRoaXMuYXBwID0gYXBwO1xuXG4gIHRoaXMuYmFyV2lkdGggPSAwO1xufTtcblxuTG9hZGluZy5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24odGltZSwgdmlkZW8pIHtcbiAgdmlkZW8uY2xlYXIoKTtcblxuICB2YXIgY29sb3IxID0gJyNiOWZmNzEnO1xuICB2YXIgY29sb3IyID0gJyM4YWMyNTAnO1xuICB2YXIgY29sb3IzID0gJyM2NDhlMzgnO1xuXG4gIHZhciB3aWR0aCA9IE1hdGgubWluKHZpZGVvLndpZHRoICogMi8zLCAzMDApO1xuICB2YXIgaGVpZ2h0ID0gMjA7XG5cbiAgdmFyIHkgPSAodmlkZW8uaGVpZ2h0IC0gaGVpZ2h0KSAvIDI7XG4gIHZhciB4ID0gKHZpZGVvLndpZHRoIC0gd2lkdGgpIC8gMjtcblxuICB2YXIgY3VycmVudFdpZHRoID0gd2lkdGggKiB0aGlzLmFwcC5hc3NldHMucHJvZ3Jlc3M7XG4gIHRoaXMuYmFyV2lkdGggPSB0aGlzLmJhcldpZHRoICsgKGN1cnJlbnRXaWR0aCAtIHRoaXMuYmFyV2lkdGgpICogdGltZSAqIDEwO1xuXG4gIHZpZGVvLmN0eC5maWxsU3R5bGUgPSBjb2xvcjI7XG4gIHZpZGVvLmN0eC5maWxsUmVjdCgwLCAwLCB2aWRlby53aWR0aCwgdmlkZW8uaGVpZ2h0KTtcblxuICB2aWRlby5jdHguZm9udCA9ICc0MDAgNDBweCBzYW5zLXNlcmlmJztcbiAgdmlkZW8uY3R4LnRleHRBbGlnbiA9ICdjZW50ZXInO1xuICB2aWRlby5jdHgudGV4dEJhc2VsaW5lID0gJ2JvdHRvbSc7XG5cbiAgdmlkZW8uY3R4LmZpbGxTdHlsZSA9ICdyZ2JhKDAsIDAsIDAsIDAuMSknO1xuICB2aWRlby5jdHguZmlsbFRleHQoXCJQb3Rpb24uanNcIiwgdmlkZW8ud2lkdGgvMiwgeSArIDIpO1xuXG4gIHZpZGVvLmN0eC5maWxsU3R5bGUgPSAnI2QxZmZhMSc7XG4gIHZpZGVvLmN0eC5maWxsVGV4dChcIlBvdGlvbi5qc1wiLCB2aWRlby53aWR0aC8yLCB5KTtcblxuICB2aWRlby5jdHguc3Ryb2tlU3R5bGUgPSB2aWRlby5jdHguZmlsbFN0eWxlID0gY29sb3IzO1xuICB2aWRlby5jdHguZmlsbFJlY3QoeCwgeSArIDE1LCB3aWR0aCwgaGVpZ2h0KTtcblxuICB2aWRlby5jdHgubGluZVdpZHRoID0gMjtcbiAgdmlkZW8uY3R4LmJlZ2luUGF0aCgpO1xuICB2aWRlby5jdHgucmVjdCh4IC0gNSwgeSArIDEwLCB3aWR0aCArIDEwLCBoZWlnaHQgKyAxMCk7XG4gIHZpZGVvLmN0eC5jbG9zZVBhdGgoKTtcbiAgdmlkZW8uY3R4LnN0cm9rZSgpO1xuXG4gIHZpZGVvLmN0eC5zdHJva2VTdHlsZSA9IHZpZGVvLmN0eC5maWxsU3R5bGUgPSAncmdiYSgwLCAwLCAwLCAwLjEpJztcbiAgdmlkZW8uY3R4LmZpbGxSZWN0KHgsIHkgKyAxNSwgdGhpcy5iYXJXaWR0aCwgaGVpZ2h0ICsgMik7XG5cbiAgdmlkZW8uY3R4LmxpbmVXaWR0aCA9IDI7XG4gIHZpZGVvLmN0eC5iZWdpblBhdGgoKTtcblxuICB2aWRlby5jdHgubW92ZVRvKHggKyB0aGlzLmJhcldpZHRoLCB5ICsgMTIpO1xuICB2aWRlby5jdHgubGluZVRvKHggLSA1LCB5ICsgMTIpO1xuICB2aWRlby5jdHgubGluZVRvKHggLSA1LCB5ICsgMTAgKyBoZWlnaHQgKyAxMik7XG4gIHZpZGVvLmN0eC5saW5lVG8oeCArIHRoaXMuYmFyV2lkdGgsIHkgKyAxMCArIGhlaWdodCArIDEyKTtcblxuICB2aWRlby5jdHguc3Ryb2tlKCk7XG4gIHZpZGVvLmN0eC5jbG9zZVBhdGgoKTtcblxuICB2aWRlby5jdHguc3Ryb2tlU3R5bGUgPSB2aWRlby5jdHguZmlsbFN0eWxlID0gY29sb3IxO1xuICB2aWRlby5jdHguZmlsbFJlY3QoeCwgeSArIDE1LCB0aGlzLmJhcldpZHRoLCBoZWlnaHQpO1xuXG4gIHZpZGVvLmN0eC5saW5lV2lkdGggPSAyO1xuICB2aWRlby5jdHguYmVnaW5QYXRoKCk7XG5cbiAgdmlkZW8uY3R4Lm1vdmVUbyh4ICsgdGhpcy5iYXJXaWR0aCwgeSArIDEwKTtcbiAgdmlkZW8uY3R4LmxpbmVUbyh4IC0gNSwgeSArIDEwKTtcbiAgdmlkZW8uY3R4LmxpbmVUbyh4IC0gNSwgeSArIDEwICsgaGVpZ2h0ICsgMTApO1xuICB2aWRlby5jdHgubGluZVRvKHggKyB0aGlzLmJhcldpZHRoLCB5ICsgMTAgKyBoZWlnaHQgKyAxMCk7XG5cbiAgdmlkZW8uY3R4LnN0cm9rZSgpO1xuICB2aWRlby5jdHguY2xvc2VQYXRoKCk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IExvYWRpbmc7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCkge1xuICB2YXIgbGFzdFRpbWUgPSAwO1xuICB2YXIgdmVuZG9ycyA9IFsnbXMnLCAnbW96JywgJ3dlYmtpdCcsICdvJ107XG5cbiAgZm9yICh2YXIgaT0wOyBpPHZlbmRvcnMubGVuZ3RoICYmICF3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lOyArK2kpIHtcbiAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gd2luZG93W3ZlbmRvcnNbaV0rJ1JlcXVlc3RBbmltYXRpb25GcmFtZSddO1xuICAgIHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZSA9IHdpbmRvd1t2ZW5kb3JzW2ldKydDYW5jZWxBbmltYXRpb25GcmFtZSddIHx8IHdpbmRvd1t2ZW5kb3JzW2ldKydDYW5jZWxSZXF1ZXN0QW5pbWF0aW9uRnJhbWUnXTtcbiAgfVxuXG4gIGlmICghd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSkge1xuICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgICAgdmFyIGN1cnJUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgICB2YXIgdGltZVRvQ2FsbCA9IE1hdGgubWF4KDAsIDE2IC0gKGN1cnJUaW1lIC0gbGFzdFRpbWUpKTtcblxuICAgICAgdmFyIGlkID0gd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgIGNhbGxiYWNrKGN1cnJUaW1lICsgdGltZVRvQ2FsbCk7XG4gICAgICB9LCB0aW1lVG9DYWxsKTtcblxuICAgICAgbGFzdFRpbWUgPSBjdXJyVGltZSArIHRpbWVUb0NhbGw7XG4gICAgICByZXR1cm4gaWQ7XG4gICAgfTtcbiAgfVxuXG4gIGlmICghd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lKSB7XG4gICAgd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lID0gZnVuY3Rpb24oaWQpIHsgY2xlYXJUaW1lb3V0KGlkKTsgfTtcbiAgfVxufTtcbiIsInZhciBpc1JldGluYSA9IGZ1bmN0aW9uKCkge1xuICB2YXIgbWVkaWFRdWVyeSA9IFwiKC13ZWJraXQtbWluLWRldmljZS1waXhlbC1yYXRpbzogMS41KSxcXFxuICAobWluLS1tb3otZGV2aWNlLXBpeGVsLXJhdGlvOiAxLjUpLFxcXG4gICgtby1taW4tZGV2aWNlLXBpeGVsLXJhdGlvOiAzLzIpLFxcXG4gIChtaW4tcmVzb2x1dGlvbjogMS41ZHBweClcIjtcblxuICBpZiAod2luZG93LmRldmljZVBpeGVsUmF0aW8gPiAxKVxuICAgIHJldHVybiB0cnVlO1xuXG4gIGlmICh3aW5kb3cubWF0Y2hNZWRpYSAmJiB3aW5kb3cubWF0Y2hNZWRpYShtZWRpYVF1ZXJ5KS5tYXRjaGVzKVxuICAgIHJldHVybiB0cnVlO1xuXG4gIHJldHVybiBmYWxzZTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gaXNSZXRpbmE7XG4iLCJ2YXIgcmVuZGVyT3JkZXJTb3J0ID0gZnVuY3Rpb24oYSwgYikge1xuICByZXR1cm4gYS5yZW5kZXJPcmRlciA8IGIucmVuZGVyT3JkZXI7XG59O1xuXG52YXIgdXBkYXRlT3JkZXJTb3J0ID0gZnVuY3Rpb24oYSwgYikge1xuICByZXR1cm4gYS51cGRhdGVPcmRlciA8IGIudXBkYXRlT3JkZXI7XG59O1xuXG52YXIgU3RhdGVNYW5hZ2VyID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuc3RhdGVzID0ge307XG4gIHRoaXMucmVuZGVyT3JkZXIgPSBbXTtcbiAgdGhpcy51cGRhdGVPcmRlciA9IFtdO1xuXG4gIHRoaXMuX3ByZXZlbnRFdmVudCA9IGZhbHNlO1xufTtcblxuU3RhdGVNYW5hZ2VyLnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbihuYW1lLCBzdGF0ZSkge1xuICB0aGlzLnN0YXRlc1tuYW1lXSA9IHRoaXMuX25ld1N0YXRlSG9sZGVyKG5hbWUsIHN0YXRlKTtcbiAgdGhpcy5yZWZyZXNoT3JkZXIoKTtcbiAgcmV0dXJuIHN0YXRlO1xufTtcblxuU3RhdGVNYW5hZ2VyLnByb3RvdHlwZS5lbmFibGUgPSBmdW5jdGlvbihuYW1lKSB7XG4gIHZhciBob2xkZXIgPSB0aGlzLmdldEhvbGRlcihuYW1lKTtcbiAgaWYgKGhvbGRlcikge1xuICAgIGlmICghaG9sZGVyLmVuYWJsZWQpIHtcbiAgICAgIGlmIChob2xkZXIuc3RhdGUuZW5hYmxlKSB7XG4gICAgICAgIGhvbGRlci5zdGF0ZS5lbmFibGUoKTtcbiAgICAgIH1cbiAgICAgIGhvbGRlci5lbmFibGVkID0gdHJ1ZTtcbiAgICAgIGhvbGRlci5jaGFuZ2VkID0gdHJ1ZTtcblxuICAgICAgaWYgKGhvbGRlci5wYXVzZWQpIHtcbiAgICAgICAgdGhpcy51bnBhdXNlKG5hbWUpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufTtcblxuU3RhdGVNYW5hZ2VyLnByb3RvdHlwZS5kaXNhYmxlID0gZnVuY3Rpb24obmFtZSkge1xuICB2YXIgaG9sZGVyID0gdGhpcy5nZXRIb2xkZXIobmFtZSk7XG4gIGlmIChob2xkZXIpIHtcbiAgICBpZiAoaG9sZGVyLmVuYWJsZWQpIHtcbiAgICAgIGlmIChob2xkZXIuc3RhdGUuZGlzYWJsZSkge1xuICAgICAgICBob2xkZXIuc3RhdGUuZGlzYWJsZSgpO1xuICAgICAgfVxuICAgICAgaG9sZGVyLmNoYW5nZWQgPSB0cnVlO1xuICAgICAgaG9sZGVyLmVuYWJsZWQgPSBmYWxzZTtcbiAgICB9XG4gIH1cbn07XG5cblN0YXRlTWFuYWdlci5wcm90b3R5cGUuaGlkZSA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgdmFyIGhvbGRlciA9IHRoaXMuZ2V0SG9sZGVyKG5hbWUpO1xuICBpZiAoaG9sZGVyKSB7XG4gICAgaWYgKGhvbGRlci5lbmFibGVkKSB7XG4gICAgICBob2xkZXIuY2hhbmdlZCA9IHRydWU7XG4gICAgICBob2xkZXIucmVuZGVyID0gZmFsc2U7XG4gICAgfVxuICB9XG59O1xuXG5TdGF0ZU1hbmFnZXIucHJvdG90eXBlLnNob3cgPSBmdW5jdGlvbihuYW1lKSB7XG4gIHZhciBob2xkZXIgPSB0aGlzLmdldEhvbGRlcihuYW1lKTtcbiAgaWYgKGhvbGRlcikge1xuICAgIGlmIChob2xkZXIuZW5hYmxlZCkge1xuICAgICAgaG9sZGVyLmNoYW5nZWQgPSB0cnVlO1xuICAgICAgaG9sZGVyLnJlbmRlciA9IHRydWU7XG4gICAgfVxuICB9XG59O1xuXG5TdGF0ZU1hbmFnZXIucHJvdG90eXBlLnBhdXNlID0gZnVuY3Rpb24obmFtZSkge1xuICB2YXIgaG9sZGVyID0gdGhpcy5nZXRIb2xkZXIobmFtZSk7XG4gIGlmIChob2xkZXIpIHtcbiAgICBpZiAoaG9sZGVyLnN0YXRlLnBhdXNlKSB7XG4gICAgICBob2xkZXIuc3RhdGUucGF1c2UoKTtcbiAgICB9XG5cbiAgICBob2xkZXIuY2hhbmdlZCA9IHRydWU7XG4gICAgaG9sZGVyLnBhdXNlZCA9IHRydWU7XG4gIH1cbn07XG5cblN0YXRlTWFuYWdlci5wcm90b3R5cGUudW5wYXVzZSA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgdmFyIGhvbGRlciA9IHRoaXMuZ2V0SG9sZGVyKG5hbWUpO1xuICBpZiAoaG9sZGVyKSB7XG4gICAgaWYgKGhvbGRlci5zdGF0ZS51bnBhdXNlKSB7XG4gICAgICBob2xkZXIuc3RhdGUudW5wYXVzZSgpO1xuICAgIH1cblxuICAgIGhvbGRlci5jaGFuZ2VkID0gdHJ1ZTtcbiAgICBob2xkZXIucGF1c2VkID0gZmFsc2U7XG4gIH1cbn07XG5cblN0YXRlTWFuYWdlci5wcm90b3R5cGUucHJvdGVjdCA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgdmFyIGhvbGRlciA9IHRoaXMuZ2V0SG9sZGVyKG5hbWUpO1xuICBpZiAoaG9sZGVyKSB7XG4gICAgaG9sZGVyLnByb3RlY3QgPSB0cnVlO1xuICB9XG59O1xuXG5TdGF0ZU1hbmFnZXIucHJvdG90eXBlLnVucHJvdGVjdCA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgdmFyIGhvbGRlciA9IHRoaXMuZ2V0SG9sZGVyKG5hbWUpO1xuICBpZiAoaG9sZGVyKSB7XG4gICAgaG9sZGVyLnByb3RlY3QgPSBmYWxzZTtcbiAgfVxufTtcblxuU3RhdGVNYW5hZ2VyLnByb3RvdHlwZS5yZWZyZXNoT3JkZXIgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5yZW5kZXJPcmRlci5sZW5ndGggPSAwO1xuICB0aGlzLnVwZGF0ZU9yZGVyLmxlbmd0aCA9IDA7XG5cbiAgZm9yICh2YXIgbmFtZSBpbiB0aGlzLnN0YXRlcykge1xuICAgIHZhciBob2xkZXIgPSB0aGlzLnN0YXRlc1tuYW1lXTtcbiAgICBpZiAoaG9sZGVyKSB7XG4gICAgICB0aGlzLnJlbmRlck9yZGVyLnB1c2goaG9sZGVyKTtcbiAgICAgIHRoaXMudXBkYXRlT3JkZXIucHVzaChob2xkZXIpO1xuICAgIH1cbiAgfVxuXG4gIHRoaXMucmVuZGVyT3JkZXIuc29ydChyZW5kZXJPcmRlclNvcnQpO1xuICB0aGlzLnVwZGF0ZU9yZGVyLnNvcnQodXBkYXRlT3JkZXJTb3J0KTtcbn07XG5cblN0YXRlTWFuYWdlci5wcm90b3R5cGUuX25ld1N0YXRlSG9sZGVyID0gZnVuY3Rpb24obmFtZSwgc3RhdGUpIHtcbiAgdmFyIGhvbGRlciA9IHt9O1xuICBob2xkZXIubmFtZSA9IG5hbWU7XG4gIGhvbGRlci5zdGF0ZSA9IHN0YXRlO1xuXG4gIGhvbGRlci5wcm90ZWN0ID0gZmFsc2U7XG5cbiAgaG9sZGVyLmVuYWJsZWQgPSB0cnVlO1xuICBob2xkZXIucGF1c2VkID0gZmFsc2U7XG5cbiAgaG9sZGVyLnJlbmRlciA9IHRydWU7XG5cbiAgaG9sZGVyLmluaXRpYWxpemVkID0gZmFsc2U7XG4gIGhvbGRlci51cGRhdGVkID0gZmFsc2U7XG4gIGhvbGRlci5jaGFuZ2VkID0gdHJ1ZTtcblxuICBob2xkZXIudXBkYXRlT3JkZXIgPSAwO1xuICBob2xkZXIucmVuZGVyT3JkZXIgPSAwO1xuXG4gIHJldHVybiBob2xkZXI7XG59O1xuXG5TdGF0ZU1hbmFnZXIucHJvdG90eXBlLnNldFVwZGF0ZU9yZGVyID0gZnVuY3Rpb24obmFtZSwgb3JkZXIpIHtcbiAgdmFyIGhvbGRlciA9IHRoaXMuZ2V0SG9sZGVyKG5hbWUpO1xuICBpZiAoaG9sZGVyKSB7XG4gICAgaG9sZGVyLnVwZGF0ZU9yZGVyID0gb3JkZXI7XG4gICAgdGhpcy5yZWZyZXNoT3JkZXIoKTtcbiAgfVxufTtcblxuU3RhdGVNYW5hZ2VyLnByb3RvdHlwZS5zZXRSZW5kZXJPcmRlciA9IGZ1bmN0aW9uKG5hbWUsIG9yZGVyKSB7XG4gIHZhciBob2xkZXIgPSB0aGlzLmdldEhvbGRlcihuYW1lKTtcbiAgaWYgKGhvbGRlcikge1xuICAgIGhvbGRlci5yZW5kZXJPcmRlciA9IG9yZGVyO1xuICAgIHRoaXMucmVmcmVzaE9yZGVyKCk7XG4gIH1cbn07XG5cblN0YXRlTWFuYWdlci5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgdmFyIHN0YXRlID0gdGhpcy5nZXRIb2xkZXIobmFtZSk7XG4gIGlmIChzdGF0ZSAmJiAhc3RhdGUucHJvdGVjdCkge1xuICAgIGlmIChzdGF0ZS5zdGF0ZS5jbG9zZSkge1xuICAgICAgc3RhdGUuc3RhdGUuY2xvc2UoKTtcbiAgICB9XG4gICAgZGVsZXRlIHRoaXMuc3RhdGVzW25hbWVdO1xuICAgIHRoaXMucmVmcmVzaE9yZGVyKCk7XG4gIH1cbn07XG5cblN0YXRlTWFuYWdlci5wcm90b3R5cGUuZGVzdHJveUFsbCA9IGZ1bmN0aW9uKCkge1xuICBmb3IgKHZhciBpPTAsIGxlbj10aGlzLnVwZGF0ZU9yZGVyLmxlbmd0aDsgaTxsZW47IGkrKykge1xuICAgIHZhciBzdGF0ZSA9IHRoaXMudXBkYXRlT3JkZXJbaV07XG4gICAgaWYgKCFzdGF0ZS5wcm90ZWN0KSB7XG4gICAgICBpZiAoc3RhdGUuc3RhdGUuY2xvc2UpIHtcbiAgICAgICAgc3RhdGUuc3RhdGUuY2xvc2UoKTtcbiAgICAgIH1cbiAgICAgIGRlbGV0ZSB0aGlzLnN0YXRlc1tzdGF0ZS5uYW1lXTtcbiAgICB9XG4gIH1cblxuICB0aGlzLnJlZnJlc2hPcmRlcigpO1xufTtcblxuU3RhdGVNYW5hZ2VyLnByb3RvdHlwZS5nZXRIb2xkZXIgPSBmdW5jdGlvbihuYW1lKSB7XG4gIHJldHVybiB0aGlzLnN0YXRlc1tuYW1lXTtcbn07XG5cblN0YXRlTWFuYWdlci5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24obmFtZSkge1xuICByZXR1cm4gdGhpcy5zdGF0ZXNbbmFtZV0uc3RhdGU7XG59O1xuXG5TdGF0ZU1hbmFnZXIucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKHRpbWUpIHtcbiAgZm9yICh2YXIgaT0wLCBsZW49dGhpcy51cGRhdGVPcmRlci5sZW5ndGg7IGk8bGVuOyBpKyspIHtcbiAgICB2YXIgc3RhdGUgPSB0aGlzLnVwZGF0ZU9yZGVyW2ldO1xuXG4gICAgaWYgKHN0YXRlKSB7XG4gICAgICBzdGF0ZS5jaGFuZ2VkID0gZmFsc2U7XG5cbiAgICAgIGlmIChzdGF0ZS5lbmFibGVkKSB7XG4gICAgICAgIGlmICghc3RhdGUuaW5pdGlhbGl6ZWQgJiYgc3RhdGUuc3RhdGUuaW5pdCkge1xuICAgICAgICAgIHN0YXRlLmluaXRpYWxpemVkID0gdHJ1ZTtcbiAgICAgICAgICBzdGF0ZS5zdGF0ZS5pbml0KCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoc3RhdGUuc3RhdGUudXBkYXRlICYmICFzdGF0ZS5wYXVzZWQpIHtcbiAgICAgICAgICBzdGF0ZS5zdGF0ZS51cGRhdGUodGltZSk7XG4gICAgICAgICAgc3RhdGUudXBkYXRlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbn07XG5cblN0YXRlTWFuYWdlci5wcm90b3R5cGUuZXhpdFVwZGF0ZSA9IGZ1bmN0aW9uKHRpbWUpIHtcbiAgZm9yICh2YXIgaT0wLCBsZW49dGhpcy51cGRhdGVPcmRlci5sZW5ndGg7IGk8bGVuOyBpKyspIHtcbiAgICB2YXIgc3RhdGUgPSB0aGlzLnVwZGF0ZU9yZGVyW2ldO1xuXG4gICAgaWYgKHN0YXRlICYmIHN0YXRlLmVuYWJsZWQgJiYgc3RhdGUuc3RhdGUuZXhpdFVwZGF0ZSAmJiAhc3RhdGUucGF1c2VkKSB7XG4gICAgICBzdGF0ZS5zdGF0ZS5leGl0VXBkYXRlKHRpbWUpO1xuICAgIH1cbiAgfVxufTtcblxuU3RhdGVNYW5hZ2VyLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbigpIHtcbiAgZm9yICh2YXIgaT0wLCBsZW49dGhpcy5yZW5kZXJPcmRlci5sZW5ndGg7IGk8bGVuOyBpKyspIHtcbiAgICB2YXIgc3RhdGUgPSB0aGlzLnJlbmRlck9yZGVyW2ldO1xuICAgIGlmIChzdGF0ZSAmJiBzdGF0ZS5lbmFibGVkICYmIChzdGF0ZS51cGRhdGVkIHx8ICFzdGF0ZS5zdGF0ZS51cGRhdGUpICYmIHN0YXRlLnJlbmRlciAmJiBzdGF0ZS5zdGF0ZS5yZW5kZXIpIHtcbiAgICAgIHN0YXRlLnN0YXRlLnJlbmRlcigpO1xuICAgIH1cbiAgfVxufTtcblN0YXRlTWFuYWdlci5wcm90b3R5cGUubW91c2Vtb3ZlID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgdGhpcy5fcHJldmVudEV2ZW50ID0gZmFsc2U7XG5cbiAgZm9yICh2YXIgaT0wLCBsZW49dGhpcy51cGRhdGVPcmRlci5sZW5ndGg7IGk8bGVuOyBpKyspIHtcbiAgICB2YXIgc3RhdGUgPSB0aGlzLnVwZGF0ZU9yZGVyW2ldO1xuICAgIGlmIChzdGF0ZSAmJiBzdGF0ZS5lbmFibGVkICYmICFzdGF0ZS5jaGFuZ2VkICYmIHN0YXRlLnN0YXRlLm1vdXNlbW92ZSAmJiAhc3RhdGUucGF1c2VkKSB7XG4gICAgICBzdGF0ZS5zdGF0ZS5tb3VzZW1vdmUodmFsdWUpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9wcmV2ZW50RXZlbnQpIHsgYnJlYWs7IH1cbiAgfVxufTtcblxuU3RhdGVNYW5hZ2VyLnByb3RvdHlwZS5tb3VzZXVwID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgdGhpcy5fcHJldmVudEV2ZW50ID0gZmFsc2U7XG5cbiAgZm9yICh2YXIgaT0wLCBsZW49dGhpcy51cGRhdGVPcmRlci5sZW5ndGg7IGk8bGVuOyBpKyspIHtcbiAgICB2YXIgc3RhdGUgPSB0aGlzLnVwZGF0ZU9yZGVyW2ldO1xuICAgIGlmIChzdGF0ZSAmJiBzdGF0ZS5lbmFibGVkICYmICFzdGF0ZS5jaGFuZ2VkICYmIHN0YXRlLnN0YXRlLm1vdXNldXAgJiYgIXN0YXRlLnBhdXNlZCkge1xuICAgICAgc3RhdGUuc3RhdGUubW91c2V1cCh2YWx1ZSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX3ByZXZlbnRFdmVudCkgeyBicmVhazsgfVxuICB9XG59O1xuXG5TdGF0ZU1hbmFnZXIucHJvdG90eXBlLm1vdXNlZG93biA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gIHRoaXMuX3ByZXZlbnRFdmVudCA9IGZhbHNlO1xuXG4gIGZvciAodmFyIGk9MCwgbGVuPXRoaXMudXBkYXRlT3JkZXIubGVuZ3RoOyBpPGxlbjsgaSsrKSB7XG4gICAgdmFyIHN0YXRlID0gdGhpcy51cGRhdGVPcmRlcltpXTtcbiAgICBpZiAoc3RhdGUgJiYgc3RhdGUuZW5hYmxlZCAmJiAhc3RhdGUuY2hhbmdlZCAmJiBzdGF0ZS5zdGF0ZS5tb3VzZWRvd24gJiYgIXN0YXRlLnBhdXNlZCkge1xuICAgICAgc3RhdGUuc3RhdGUubW91c2Vkb3duKHZhbHVlKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fcHJldmVudEV2ZW50KSB7IGJyZWFrOyB9XG4gIH1cbn07XG5cblN0YXRlTWFuYWdlci5wcm90b3R5cGUua2V5dXAgPSBmdW5jdGlvbih2YWx1ZSkge1xuICB0aGlzLl9wcmV2ZW50RXZlbnQgPSBmYWxzZTtcblxuICBmb3IgKHZhciBpPTAsIGxlbj10aGlzLnVwZGF0ZU9yZGVyLmxlbmd0aDsgaTxsZW47IGkrKykge1xuICAgIHZhciBzdGF0ZSA9IHRoaXMudXBkYXRlT3JkZXJbaV07XG4gICAgaWYgKHN0YXRlICYmIHN0YXRlLmVuYWJsZWQgJiYgIXN0YXRlLmNoYW5nZWQgJiYgc3RhdGUuc3RhdGUua2V5dXAgJiYgIXN0YXRlLnBhdXNlZCkge1xuICAgICAgc3RhdGUuc3RhdGUua2V5dXAodmFsdWUpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9wcmV2ZW50RXZlbnQpIHsgYnJlYWs7IH1cbiAgfVxufTtcblxuU3RhdGVNYW5hZ2VyLnByb3RvdHlwZS5rZXlkb3duID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgdGhpcy5fcHJldmVudEV2ZW50ID0gZmFsc2U7XG5cbiAgZm9yICh2YXIgaT0wLCBsZW49dGhpcy51cGRhdGVPcmRlci5sZW5ndGg7IGk8bGVuOyBpKyspIHtcbiAgICB2YXIgc3RhdGUgPSB0aGlzLnVwZGF0ZU9yZGVyW2ldO1xuICAgIGlmIChzdGF0ZSAmJiBzdGF0ZS5lbmFibGVkICYmICFzdGF0ZS5jaGFuZ2VkICYmIHN0YXRlLnN0YXRlLmtleWRvd24gJiYgIXN0YXRlLnBhdXNlZCkge1xuICAgICAgc3RhdGUuc3RhdGUua2V5ZG93bih2YWx1ZSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX3ByZXZlbnRFdmVudCkgeyBicmVhazsgfVxuICB9XG59O1xuXG5TdGF0ZU1hbmFnZXIucHJvdG90eXBlLnJlc2l6ZSA9IGZ1bmN0aW9uKCkge1xuICBmb3IgKHZhciBpPTAsIGxlbj10aGlzLnVwZGF0ZU9yZGVyLmxlbmd0aDsgaTxsZW47IGkrKykge1xuICAgIHZhciBzdGF0ZSA9IHRoaXMudXBkYXRlT3JkZXJbaV07XG4gICAgaWYgKHN0YXRlICYmIHN0YXRlLmVuYWJsZWQgJiYgc3RhdGUuc3RhdGUucmVzaXplKSB7XG4gICAgICBzdGF0ZS5zdGF0ZS5yZXNpemUoKTtcbiAgICB9XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gU3RhdGVNYW5hZ2VyO1xuIiwibW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24oKSB7XG4gIHJldHVybiB3aW5kb3cucGVyZm9ybWFuY2UgfHwgRGF0ZTtcbn0pKCk7XG4iLCJ2YXIgaXNSZXRpbmEgPSByZXF1aXJlKCcuL3JldGluYScpKCk7XG5cbnZhciBWaWRlbyA9IGZ1bmN0aW9uKGFwcCwgY2FudmFzLCBjb25maWcpIHtcbiAgdGhpcy5hcHAgPSBhcHA7XG5cbiAgdGhpcy5jb25maWcgPSBjb25maWc7XG5cbiAgdGhpcy5jYW52YXMgPSBjYW52YXM7XG5cbiAgdGhpcy53aWR0aCA9IGFwcC53aWR0aDtcblxuICB0aGlzLmhlaWdodCA9IGFwcC5oZWlnaHQ7XG5cbiAgdGhpcy5fcGFyZW50ID0gbnVsbDtcbiAgdGhpcy5faXNSb290ID0gZmFsc2U7XG4gIHRoaXMuX2NoaWxkcmVuID0gW107XG59O1xuXG5WaWRlby5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uKCkge1xuICBpZiAodGhpcy5jb25maWcuZ2V0Q2FudmFzQ29udGV4dCkge1xuICAgIHRoaXMuY3R4ID0gdGhpcy5jYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgfVxuXG4gIHRoaXMuX2FwcGx5U2l6ZVRvQ2FudmFzKCk7XG59O1xuXG5WaWRlby5wcm90b3R5cGUuaW5jbHVkZSA9IGZ1bmN0aW9uKG1ldGhvZHMpIHtcbiAgZm9yICh2YXIgbWV0aG9kIGluIG1ldGhvZHMpIHtcbiAgICB0aGlzW21ldGhvZF0gPSBtZXRob2RzW21ldGhvZF07XG4gIH1cbn07XG5cblZpZGVvLnByb3RvdHlwZS5iZWdpbkZyYW1lID0gZnVuY3Rpb24oKSB7fTtcblxuVmlkZW8ucHJvdG90eXBlLmVuZEZyYW1lID0gZnVuY3Rpb24oKSB7fTtcblxuVmlkZW8ucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbigpIHtcbiAgaWYgKCF0aGlzLl9pc1Jvb3QpIHtcbiAgICB2YXIgaW5kZXggPSB0aGlzLl9wYXJlbnQuX2NoaWxkcmVuLmluZGV4T2YodGhpcyk7XG4gICAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgICAgdGhpcy5fcGFyZW50Ll9jaGlsZHJlbi5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIH1cbiAgfVxuXG4gIHRoaXMuY2FudmFzLnBhcmVudEVsZW1lbnQucmVtb3ZlQ2hpbGQodGhpcy5jYW52YXMpO1xufTtcblxuVmlkZW8ucHJvdG90eXBlLnNjYWxlQ2FudmFzID0gZnVuY3Rpb24oc2NhbGUpIHtcbiAgdGhpcy5jYW52YXMud2lkdGggKj0gc2NhbGU7XG4gIHRoaXMuY2FudmFzLmhlaWdodCAqPSBzY2FsZTtcblxuICBpZiAodGhpcy5jdHgpIHtcbiAgICB0aGlzLmN0eC5zY2FsZShzY2FsZSwgc2NhbGUpO1xuICB9XG59O1xuXG5WaWRlby5wcm90b3R5cGUuX3Jlc2l6ZSA9IGZ1bmN0aW9uKHdpZHRoLCBoZWlnaHQpIHtcbiAgdGhpcy53aWR0aCA9IHdpZHRoO1xuICB0aGlzLmhlaWdodCA9IGhlaWdodDtcblxuICB0aGlzLl9hcHBseVNpemVUb0NhbnZhcygpO1xuXG4gIGZvciAodmFyIGk9MCwgbGVuPXRoaXMuX2NoaWxkcmVuLmxlbmd0aDsgaTxsZW47IGkrKykge1xuICAgIHZhciBpdGVtID0gdGhpcy5fY2hpbGRyZW5baV07XG4gICAgaXRlbS5fcmVzaXplKHdpZHRoLCBoZWlnaHQpO1xuICB9XG59O1xuXG5WaWRlby5wcm90b3R5cGUuX2FwcGx5U2l6ZVRvQ2FudmFzID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuY2FudmFzLndpZHRoID0gdGhpcy53aWR0aDtcbiAgdGhpcy5jYW52YXMuaGVpZ2h0ID0gdGhpcy5oZWlnaHQ7XG5cbiAgdGhpcy5jYW52YXMuc3R5bGUud2lkdGggPSB0aGlzLndpZHRoICsgJ3B4JztcbiAgdGhpcy5jYW52YXMuc3R5bGUuaGVpZ2h0ID0gdGhpcy5oZWlnaHQgKyAncHgnO1xuXG4gIGlmICh0aGlzLmNvbmZpZy5hbGxvd0hpRFBJICYmIGlzUmV0aW5hKSB7XG4gICAgdGhpcy5zY2FsZUNhbnZhcygyKTtcbiAgfVxufTtcblxuVmlkZW8ucHJvdG90eXBlLmNsZWFyID0gZnVuY3Rpb24oKSB7XG4gIGlmICh0aGlzLmN0eCkgeyB0aGlzLmN0eC5jbGVhclJlY3QoMCwgMCwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpOyB9XG59O1xuXG5WaWRlby5wcm90b3R5cGUuY3JlYXRlTGF5ZXIgPSBmdW5jdGlvbihjb25maWcpIHtcbiAgY29uZmlnID0gY29uZmlnIHx8IHt9O1xuXG4gIHZhciBjb250YWluZXIgPSB0aGlzLmFwcC5jb250YWluZXI7XG4gIHZhciBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgY2FudmFzLndpZHRoID0gdGhpcy53aWR0aDtcbiAgY2FudmFzLmhlaWdodCA9IHRoaXMuaGVpZ2h0O1xuICBjYW52YXMuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xuICBjYW52YXMuc3R5bGUudG9wID0gJzBweCc7XG4gIGNhbnZhcy5zdHlsZS5sZWZ0ID0gJzBweCc7XG4gIGNvbnRhaW5lci5hcHBlbmRDaGlsZChjYW52YXMpO1xuXG4gIHZhciB2aWRlbyA9IG5ldyBWaWRlbyh0aGlzLmFwcCwgY2FudmFzLCBjb25maWcpO1xuXG4gIHZpZGVvLl9wYXJlbnQgPSB0aGlzO1xuICB2aWRlby5faXNSb290ID0gZmFsc2U7XG5cbiAgdmlkZW8uaW5pdCgpO1xuXG4gIHRoaXMuX2NoaWxkcmVuLnB1c2godmlkZW8pO1xuXG4gIHJldHVybiB2aWRlbztcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gVmlkZW87XG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIHJhbmRvbSA9IGZ1bmN0aW9uIChtaW4sIG1heCkge1xuICBpZiAobWluID09PSB1bmRlZmluZWQpIG1pbiA9IDA7XG4gIGlmIChtYXggPT09IHVuZGVmaW5lZCkgbWF4ID0gMTAwO1xuICByZXR1cm4gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbikpICsgbWluO1xufTtcblxuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSByYW5kb207XG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cy5kZWZhdWx0IiwiJ3VzZSBzdHJpY3QnXG5cbnZhciBtZXJnZSA9IHJlcXVpcmUoJ2xvZGFzaC9vYmplY3QvbWVyZ2UnKVxudmFyIGNvbnRhaW5zID0gcmVxdWlyZSgnbG9kYXNoL2NvbGxlY3Rpb24vY29udGFpbnMnKVxudmFyIER1bmdlb24gPSByZXF1aXJlKCcuL21hcHMvRHVuZ2VvbicpXG5cbnZhciByb29tT3B0aW9ucyA9IHttaW5Sb29tU2l6ZTogMywgbWF4Um9vbVNpemU6IDEwLCBtYXhSb29tczogMTB9XG52YXIgZGVmYXVsdHMgPSB7bWFwVHlwZTogJ2R1bmdlb24nLCB3aWR0aDogMTAwLCBoZWlnaHQ6IDEwMCwgcm9vbU9wdGlvbnM6IHJvb21PcHRpb25zfVxudmFyIGFsbG93ZWRNYXBUeXBlcyA9IFsnZHVuZ2VvbicsICdjYXZlJ11cblxuLyoqXG4gKiBDbGFzcyByZXNwb25zaWJsZSBmb3IgZ2VuZXJhdGluZyByYW5kb20gbWFwc1xuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIHNlZSBkZWZhdWx0c1xuICogQHRocm93cyB7RXJyb3J9IGlmIGdpdmVuIGFuIGludmFsaWQgbWFwIHR5cGVcbiAqL1xudmFyIE1hcEdlbmVyYXRvciA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gIG9wdGlvbnMgPSBtZXJnZSh7fSwgZGVmYXVsdHMsIG9wdGlvbnMpXG5cbiAgaWYgKGNvbnRhaW5zKGFsbG93ZWRNYXBUeXBlcywgb3B0aW9ucy5tYXBUeXBlKSA9PT0gZmFsc2UpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3Iob3B0aW9ucy5tYXBUeXBlICsgJyBpcyBub3QgYSB2YWxpZCBtYXAgdHlwZScpXG4gIH1cblxuICB0aGlzLm1hcFR5cGUgPSBvcHRpb25zLm1hcFR5cGVcbiAgdGhpcy53aWR0aCA9IG9wdGlvbnMud2lkdGhcbiAgdGhpcy5oZWlnaHQgPSBvcHRpb25zLmhlaWdodFxuXG4gIGlmIChvcHRpb25zLm1hcFR5cGUgPT09ICdkdW5nZW9uJykge1xuICAgIHRoaXMucm9vbU9wdGlvbnMgPSBvcHRpb25zLnJvb21PcHRpb25zXG4gIH1cbn1cblxuTWFwR2VuZXJhdG9yLnByb3RvdHlwZS5nZXRNYXBUeXBlID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdGhpcy5tYXBUeXBlXG59XG5cbk1hcEdlbmVyYXRvci5wcm90b3R5cGUuZ2V0U3RhcnRQb3NpdGlvbiA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMuc3RhcnRQb3NpdGlvblxufVxuXG4vKipcbiAqIE1haW4gbWFwIGdlbmVyYXRvciBmdW5jdGlvblxuICpcbiAqIEByZXR1cm4ge0FycmF5fSB0d28gZGltZW50aW9uYWwgYXJyYXkgcmVwcmVzZW50aW5nIGEgbWFwXG4gKiBAdGhyb3dzIHtFcnJvcn0gaWYgbm8gZ2VuZXJhdG9yIGZ1bmN0aW9uIGV4aXN0cyBmb3IgdGhlIG1hcCB0eXBlXG4gKi9cbk1hcEdlbmVyYXRvci5wcm90b3R5cGUuZ2VuZXJhdGUgPSBmdW5jdGlvbiAoKSB7XG4gIHN3aXRjaCAodGhpcy5tYXBUeXBlKSB7XG4gICAgY2FzZSAnZHVuZ2Vvbic6XG4gICAgICB2YXIgb3B0aW9ucyA9IG1lcmdlKHt9LCB0aGlzLnJvb21PcHRpb25zLCB7d2lkdGg6IHRoaXMud2lkdGgsIGhlaWdodDogdGhpcy5oZWlnaHR9KVxuICAgICAgdmFyIGR1bmdlb24gPSBuZXcgRHVuZ2VvbihvcHRpb25zKVxuICAgICAgdGhpcy5nZW5lcmF0ZWRNYXAgPSBkdW5nZW9uLmdlbmVyYXRlTWFwKClcbiAgICAgIHRoaXMuc3RhcnRQb3NpdGlvbiA9IGR1bmdlb24uZ2V0U3RhcnRQb3NpdGlvbigpXG5cbiAgICAgIHJldHVybiB0aGlzLmdlbmVyYXRlZE1hcFxuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VuYWJsZSB0byBnZW5lcmF0ZSBhIFwiJyArIHRoaXMubWFwVHlwZSArICdcIiBtYXAnKVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gTWFwR2VuZXJhdG9yXG4iLCIndXNlIHN0cmljdCdcblxudmFyIG1lcmdlID0gcmVxdWlyZSgnbG9kYXNoL29iamVjdC9tZXJnZScpXG52YXIgZGVmYXVsdHMgPSB7eDogMCwgeTogMCwgd2lkdGg6IDEsIGhlaWdodDogMX1cblxuLyoqXG4gKiBSb29tIGNsYXNzIC0gcmVwcmVzZW50cyBhIHNpbmdsZSByb29tIGluIGEgbWFwXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgb2JqZWN0IG9mIG9wdGlvbnMgLSBzZWUgZGVmYXVsdHNcbiAqL1xudmFyIFJvb20gPSBmdW5jdGlvbiAob3B0aW9ucykge1xuICAvLyBtZXJnZSBkZWZhdWx0cyB3aXRoIG9wdGlvbnMsIHVzaW5nIGEgbmV3IG9iamVjdCBzbyBvcHRpb25zIGlzbid0IHJlcXVpcmVkXG4gIG9wdGlvbnMgPSBtZXJnZSh7fSwgZGVmYXVsdHMsIG9wdGlvbnMpXG5cbiAgdGhpcy54ID0gb3B0aW9ucy54XG4gIHRoaXMueSA9IG9wdGlvbnMueVxuICB0aGlzLndpZHRoID0gb3B0aW9ucy53aWR0aFxuICB0aGlzLmhlaWdodCA9IG9wdGlvbnMuaGVpZ2h0XG5cbiAgLy8gYm90dG9tIHJpZ2h0IHggJiB5IGNvb3JkaW5hdGVzXG4gIHRoaXMuYnJYID0gdGhpcy54ICsgdGhpcy53aWR0aFxuICB0aGlzLmJyWSA9IHRoaXMueSArIHRoaXMuaGVpZ2h0XG59XG5cblJvb20ucHJvdG90eXBlLmdldFggPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLnhcbn1cblxuUm9vbS5wcm90b3R5cGUuZ2V0WSA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMueVxufVxuXG5Sb29tLnByb3RvdHlwZS5nZXRCclggPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLmJyWFxufVxuXG5Sb29tLnByb3RvdHlwZS5nZXRCclkgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLmJyWVxufVxuXG5Sb29tLnByb3RvdHlwZS5nZXRXaWR0aCA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMud2lkdGhcbn1cblxuUm9vbS5wcm90b3R5cGUuZ2V0SGVpZ2h0ID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdGhpcy5oZWlnaHRcbn1cblxuLyoqXG4gKiBHZXRzIHRoZSBjZW50ZXIgb2YgdGhlIHJvb20gZm9yIHVzZSB3aXRoIG1ha2luZyBjb3JyaWRvcnNcbiAqXG4gKiBAcmV0dXJuIHtBcnJheX0gY2VudGVyIGNvb3JkaW5hdGVzIG9mIHRoaXMgcm9vbSAtIFt4LCB5XVxuICovXG5Sb29tLnByb3RvdHlwZS5nZXRDZW50ZXIgPSBmdW5jdGlvbiAoKSB7XG4gIC8vIGRvbid0IGNhbGN1bGF0ZSB0aGUgY2VudGVyIHVubGVzcyB3ZSBuZWVkIHRvXG4gIGlmICghdGhpcy5jZW50ZXIpIHtcbiAgICB0aGlzLmNlbnRlciA9IFtcbiAgICAgIE1hdGguZmxvb3IoKHRoaXMueCArIHRoaXMuYnJYKSAvIDIpLFxuICAgICAgTWF0aC5mbG9vcigodGhpcy55ICsgdGhpcy5iclkpIC8gMilcbiAgICBdXG4gIH1cblxuICByZXR1cm4gdGhpcy5jZW50ZXJcbn1cblxuLyoqXG4gKiBDYWxjdWxhdGVzIHdoZXRoZXIgdGhpcyByb29tIGlzIGludGVyc2VjdGluZyBhbm90aGVyIHJvb21cbiAqXG4gKiBAcGFyYW0ge1Jvb219IG90aGVyUm9vbVxuICogQHJldHVybiB7Qm9vbGVhbn0gdHJ1ZSBpZiByb29tcyBhcmUgaW50ZXJzZWN0aW5nXG4gKiBAdGhyb3dzIHtFcnJvcn0gaWYgb3RoZXJSb29tIGlzIG5vdCBhIFJvb21cbiAqL1xuUm9vbS5wcm90b3R5cGUuaXNJbnRlcnNlY3RpbmcgPSBmdW5jdGlvbiAob3RoZXJSb29tKSB7XG4gIGlmICghKG90aGVyUm9vbSBpbnN0YW5jZW9mIFJvb20pKSB0aHJvdyBuZXcgRXJyb3IoJ290aGVyUm9vbSBpcyBub3QgYSBSb29tJylcblxuICByZXR1cm4gIShvdGhlclJvb20ueCA+PSB0aGlzLmJyWCB8fCBvdGhlclJvb20uYnJYIDw9IHRoaXMueCB8fFxuICAgIG90aGVyUm9vbS55ID49IHRoaXMuYnJZIHx8IG90aGVyUm9vbS5iclkgPD0gdGhpcy55KVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFJvb21cbiIsIid1c2Ugc3RyaWN0J1xuXG52YXIgY29udGFpbnMgPSByZXF1aXJlKCdsb2Rhc2gvY29sbGVjdGlvbi9jb250YWlucycpXG52YXIgVGlsZVR5cGVzID0gcmVxdWlyZSgnLi4vaGVscGVycy9UaWxlVHlwZXMnKVxuXG52YXIgZGVmYXVsdENoYXJhY3RlciA9IFRpbGVUeXBlcy5lbXB0eVxuXG4vKipcbiAqIFRpbGUgY2xhc3MgLSByZXByZXNlbnRzIGEgc2luZ2xlIHRpbGUgaW4gYSBtYXBcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gY2hhcmFjdGVyXG4gKi9cbnZhciBUaWxlID0gZnVuY3Rpb24gKGNoYXJhY3Rlcikge1xuICBpZiAodHlwZW9mIGNoYXJhY3RlciA9PT0gJ3VuZGVmaW5lZCcpIGNoYXJhY3RlciA9IGRlZmF1bHRDaGFyYWN0ZXJcblxuICBpZiAoY29udGFpbnMoVGlsZVR5cGVzLnZhbGlkVHlwZXMsIGNoYXJhY3RlcikgPT09IGZhbHNlKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGNoYXJhY3RlciArICcgaXMgbm90IGEgdmFsaWQgY2hhcmFjdGVyJylcbiAgfVxuXG4gIHRoaXMuY2hhcmFjdGVyID0gY2hhcmFjdGVyXG59XG5cblRpbGUucHJvdG90eXBlLmdldENoYXJhY3RlciA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMuY2hhcmFjdGVyXG59XG5cbi8qKlxuICogRGV0ZXJtaW5lcyBpZiB0aGUgdGlsZSBibG9ja3MgbW92ZW1lbnRcbiAqXG4gKiBAcmV0dXJuIHtCb29sZWFufSB0cnVlIGlmIHRpbGUgYmxvY2tzIG1vdmVtZW50XG4gKi9cblRpbGUucHJvdG90eXBlLmlzQmxvY2tpbmcgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiBjb250YWlucyhUaWxlVHlwZXMuYmxvY2tpbmdUeXBlcywgdGhpcy5nZXRDaGFyYWN0ZXIoKSkgPT09IHRydWVcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBUaWxlXG4iLCIndXNlIHN0cmljdCdcblxudmFyIG1lcmdlID0gcmVxdWlyZSgnbG9kYXNoL29iamVjdC9tZXJnZScpXG52YXIgVGlsZSA9IHJlcXVpcmUoJy4uL1RpbGUnKVxudmFyIFRpbGVUeXBlcyA9IHJlcXVpcmUoJy4uLy4uL2hlbHBlcnMvVGlsZVR5cGVzJylcblxudmFyIGRlZmF1bHRzID0ge3dpZHRoOiAxMDAsIGhlaWdodDogMTAwfVxuXG4vKipcbiAqIENsYXNzIHRvIGJlIGV4dGVuZGVkIGJ5IGFuIGFjdHVhbCBtYXAgY2xhc3NcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyBzZWUgZGVmYXVsdHNcbiAqL1xudmFyIEJhc2VNYXAgPSBmdW5jdGlvbiAob3B0aW9ucykge1xuICBvcHRpb25zID0gbWVyZ2Uoe30sIGRlZmF1bHRzLCBvcHRpb25zKVxuXG4gIHRoaXMud2lkdGggPSBvcHRpb25zLndpZHRoXG4gIHRoaXMuaGVpZ2h0ID0gb3B0aW9ucy5oZWlnaHRcbn1cblxuLyoqXG4gKiBHZW5lcmF0ZXMgdGhlIGluaXRhbCBtYXAgZm9yIGFsbCBtYXAgdHlwZXNcbiAqXG4gKiBAcmV0dXJuIHtBcnJheX1cbiAqL1xuQmFzZU1hcC5wcm90b3R5cGUuZ2VuZXJhdGVJbml0aWFsTWFwID0gZnVuY3Rpb24gKCkge1xuICB2YXIgbWFwID0gW11cblxuICBmb3IgKHZhciB5ID0gMDsgeSA8IHRoaXMuaGVpZ2h0OyB5KyspIHtcbiAgICB2YXIgcm93ID0gW11cbiAgICBmb3IgKHZhciB4ID0gMDsgeCA8IHRoaXMud2lkdGg7IHgrKykge1xuICAgICAgcm93LnB1c2gobmV3IFRpbGUoVGlsZVR5cGVzLmVtcHR5KSlcbiAgICB9XG5cbiAgICBtYXAucHVzaChyb3cpXG4gIH1cblxuICByZXR1cm4gbWFwXG59XG5cbkJhc2VNYXAucHJvdG90eXBlLmdldFN0YXJ0UG9zaXRpb24gPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLnN0YXJ0UG9zaXRpb25cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBCYXNlTWFwXG4iLCIndXNlIHN0cmljdCdcblxudmFyIG1lcmdlID0gcmVxdWlyZSgnbG9kYXNoL29iamVjdC9tZXJnZScpXG52YXIgZm9yRWFjaCA9IHJlcXVpcmUoJ2xvZGFzaC9jb2xsZWN0aW9uL2ZvckVhY2gnKVxudmFyIHJhbmRvbSA9IHJlcXVpcmUoJ3JhbmRvbS1udW1iZXItaW4tcmFuZ2UnKVxudmFyIGluaGVyaXRzID0gcmVxdWlyZSgnaW5oZXJpdHMnKVxuXG52YXIgQmFzZU1hcCA9IHJlcXVpcmUoJy4vQmFzZU1hcCcpXG52YXIgUm9vbSA9IHJlcXVpcmUoJy4uL1Jvb20nKVxudmFyIFRpbGUgPSByZXF1aXJlKCcuLi9UaWxlJylcbnZhciBUaWxlVHlwZXMgPSByZXF1aXJlKCcuLi8uLi9oZWxwZXJzL1RpbGVUeXBlcycpXG5cbnZhciBkZWZhdWx0cyA9IHttaW5Sb29tU2l6ZTogMiwgbWF4Um9vbVNpemU6IDEwLCBtYXhSb29tczogMTB9XG5cbi8qKlxuICogRHVuZ2VvbiBtYXAgdHlwZSAtIHJvb21zIGNvbm5lY3RlZCB2aWEgY29ycmlkb3JzXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgcm9vbSBvcHRpb25zIC0gc2VlIGRlZmF1bHRzXG4gKi9cbnZhciBEdW5nZW9uID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgb3B0aW9ucyA9IG1lcmdlKHt9LCBkZWZhdWx0cywgb3B0aW9ucylcblxuICAvLyBleHRlbmQgdGhlIEJhc2VNYXAgY2xhc3NcbiAgQmFzZU1hcC5hcHBseSh0aGlzLCBhcmd1bWVudHMpXG5cbiAgdGhpcy5taW5Sb29tU2l6ZSA9IG9wdGlvbnMubWluUm9vbVNpemVcbiAgdGhpcy5tYXhSb29tU2l6ZSA9IG9wdGlvbnMubWF4Um9vbVNpemVcbiAgdGhpcy5tYXhSb29tcyA9IG9wdGlvbnMubWF4Um9vbXNcbiAgdGhpcy5yb29tcyA9IFtdXG59XG5cbmluaGVyaXRzKER1bmdlb24sIEJhc2VNYXApXG5cbkR1bmdlb24ucHJvdG90eXBlLmdlbmVyYXRlU2luZ2xlUm9vbSA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIG9wdGlvbnMgPSB7XG4gICAgeDogcmFuZG9tKDEsIHRoaXMuaGVpZ2h0IC0gKHRoaXMubWF4Um9vbVNpemUgKyAxKSksXG4gICAgeTogcmFuZG9tKDEsIHRoaXMud2lkdGggLSAodGhpcy5tYXhSb29tU2l6ZSArIDEpKSxcbiAgICB3aWR0aDogcmFuZG9tKHRoaXMubWluUm9vbVNpemUsIHRoaXMubWF4Um9vbVNpemUpLFxuICAgIGhlaWdodDogcmFuZG9tKHRoaXMubWluUm9vbVNpemUsIHRoaXMubWF4Um9vbVNpemUpXG4gIH1cblxuICB2YXIgbmV3Um9vbSA9IG5ldyBSb29tKG9wdGlvbnMpXG5cbiAgLy8gdHJ5IHRvIHN0b3Agcm9vbXMgZnJvbSBpbnRlcnNlY3RpbmdcbiAgZm9yRWFjaCh0aGlzLnJvb21zLCBmdW5jdGlvbiAocm9vbSkge1xuICAgIC8vIGRvbid0IGFsbG93IGludGVyc2VjdGluZyByb29tcyBidXQgYmFpbCBvdXQgYWZ0ZXIgNTAgYXR0ZW1wdHNcbiAgICBmb3IgKHZhciBpID0gMDsgKG5ld1Jvb20uaXNJbnRlcnNlY3Rpbmcocm9vbSkpICYmIGkgPCA1MDsgaSsrKSB7XG4gICAgICBvcHRpb25zID0ge1xuICAgICAgICB4OiByYW5kb20oMSwgdGhpcy5oZWlnaHQgLSAodGhpcy5tYXhSb29tU2l6ZSArIDEpKSxcbiAgICAgICAgeTogcmFuZG9tKDEsIHRoaXMud2lkdGggLSAodGhpcy5tYXhSb29tU2l6ZSArIDEpKSxcbiAgICAgICAgd2lkdGg6IHJhbmRvbSh0aGlzLm1pblJvb21TaXplLCB0aGlzLm1heFJvb21TaXplKSxcbiAgICAgICAgaGVpZ2h0OiByYW5kb20odGhpcy5taW5Sb29tU2l6ZSwgdGhpcy5tYXhSb29tU2l6ZSlcbiAgICAgIH1cblxuICAgICAgbmV3Um9vbSA9IG5ldyBSb29tKG9wdGlvbnMpXG4gICAgfVxuICB9LCB0aGlzKVxuXG4gIHJldHVybiBuZXdSb29tXG59XG5cbi8qKlxuICogR2VuZXJhdGVzIHJvb21zIGFuZCBzZXRzIHRoZW0gdG8gdGhpcy5yb29tcyBhcnJheVxuICovXG5EdW5nZW9uLnByb3RvdHlwZS5nZW5lcmF0ZVJvb21zID0gZnVuY3Rpb24gKCkge1xuICB2YXIgbnVtYmVyT2ZSb29tcyA9IHJhbmRvbSgxLCB0aGlzLm1heFJvb21zKVxuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbnVtYmVyT2ZSb29tczsgaSsrKSB7XG4gICAgdmFyIG5ld1Jvb20gPSB0aGlzLmdlbmVyYXRlU2luZ2xlUm9vbSgpXG4gICAgdGhpcy5yb29tcy5wdXNoKG5ld1Jvb20pXG4gIH1cblxuICB0aGlzLnN0YXJ0UG9zaXRpb24gPSB7XG4gICAgeDogdGhpcy5yb29tc1swXS5nZXRYKCksXG4gICAgeTogdGhpcy5yb29tc1swXS5nZXRZKClcbiAgfVxufVxuXG4vKipcbiAqIEFkZHMgYSBzaW5nbGUgcm9vbSB0byB0aGUgbWFwXG4gKlxuICogQHBhcmFtIHtSb29tfSByb29tXG4gKi9cbkR1bmdlb24ucHJvdG90eXBlLmFkZFNpbmdsZVJvb21Ub01hcCA9IGZ1bmN0aW9uIChyb29tLCBkcmF3V2FsbHMpIHtcbiAgZHJhd1dhbGxzID0gZHJhd1dhbGxzIHx8IGZhbHNlXG4gIGZvciAodmFyIHkgPSByb29tLmdldFkoKTsgeSA8IHJvb20uZ2V0QnJZKCk7IHkrKykge1xuICAgIC8vIHRydWUgZm9yIHRoZSBmaXJzdCBhbmQgbGFzdCByb3dzXG4gICAgdmFyIGlzV2FsbFJvdyA9IHJvb20uZ2V0WSgpID09PSB5IHx8IHJvb20uZ2V0QnJZKCkgLSAxID09PSB5XG5cbiAgICBmb3IgKHZhciB4ID0gcm9vbS5nZXRYKCk7IHggPCByb29tLmdldEJyWCgpOyB4KyspIHtcbiAgICAgIC8vIHRydWUgZm9yIHRoZSBmaXJzdCBhbmQgbGFzdCBjb2x1bW5zXG4gICAgICB2YXIgaXNXYWxsQ29sdW1uID0gcm9vbS5nZXRYKCkgPT09IHggfHwgcm9vbS5nZXRCclgoKSAtIDEgPT09IHhcblxuICAgICAgLy8gaWYgdGhpcyBpcyB0aGUgZmlyc3QgJiBsYXN0IGNvbHVtbiBvciByb3cgdXNlIGEgd2FsbCwgb3RoZXJ3aXNlIHVzZSB0aGUgZmxvb3JcbiAgICAgIGlmICgoaXNXYWxsUm93IHx8IGlzV2FsbENvbHVtbikgJiYgZHJhd1dhbGxzKSB7XG4gICAgICAgIHRoaXMuZ2VuZXJhdGVkTWFwW3hdW3ldID0gbmV3IFRpbGUoVGlsZVR5cGVzLndhbGwpXG4gICAgICB9IGVsc2UgaWYgKCEoaXNXYWxsUm93IHx8IGlzV2FsbENvbHVtbikpIHtcbiAgICAgICAgdGhpcy5nZW5lcmF0ZWRNYXBbeF1beV0gPSBuZXcgVGlsZShUaWxlVHlwZXMuZmxvb3IpXG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogQWRkcyBhIHRpbGUgdG8gdGhlIG1hcCBpZiBpdCBpcyBlbXB0eVxuICpcbiAqIEBwYXJhbSB7aW50ZWdlcn0geFxuICogQHBhcmFtIHtpbnRlZ2VyfSB5XG4gKiBAcGFyYW0ge3N0cmluZ30gdGlsZVR5cGVcbiAqL1xuRHVuZ2Vvbi5wcm90b3R5cGUuZHJhd0lmRW1wdHkgPSBmdW5jdGlvbiAoeCwgeSwgdGlsZVR5cGUpIHtcbiAgaWYgKHRoaXMuZ2VuZXJhdGVkTWFwW3ldW3hdLmNoYXJhY3RlciA9PT0gVGlsZVR5cGVzLmVtcHR5KSB7XG4gICAgdGhpcy5nZW5lcmF0ZWRNYXBbeV1beF0gPSBuZXcgVGlsZSh0aWxlVHlwZSlcbiAgfVxufVxuXG4vKipcbiAqIEdlbmVyYXRlcyBhIGhvcml6b250YWwgY29ycmlkb3JcbiAqXG4gKiBAcGFyYW0ge2ludGVnZXJ9IHgxXG4gKiBAcGFyYW0ge2ludGVnZXJ9IHgyXG4gKiBAcGFyYW0ge2ludGVnZXJ9IHlcbiAqL1xuRHVuZ2Vvbi5wcm90b3R5cGUuZ2VuZXJhdGVIb3Jpem9udGFsQ29ycmlkb3IgPSBmdW5jdGlvbiAoeDEsIHgyLCB5KSB7XG4gIGZvciAodmFyIHggPSBNYXRoLm1pbih4MSwgeDIpOyB4IDwgTWF0aC5tYXgoeDEsIHgyKSArIDE7IHgrKykge1xuICAgIC8vIGdlbmVyYXRlIHdhbGxzIGFyb3VuZCB0aGUgY29ycmlkb3JcbiAgICB0aGlzLmRyYXdJZkVtcHR5KHgsIHkgLSAxLCBUaWxlVHlwZXMud2FsbClcbiAgICB0aGlzLmRyYXdJZkVtcHR5KHgsIHkgKyAxLCBUaWxlVHlwZXMud2FsbClcblxuICAgIHRoaXMuZ2VuZXJhdGVkTWFwW3ldW3hdID0gbmV3IFRpbGUoVGlsZVR5cGVzLmZsb29yKVxuICB9XG59XG5cbi8qKlxuICogR2VuZXJhdGVzIGEgdmVydGljYWwgY29ycmlkb3JcbiAqXG4gKiBAcGFyYW0ge2ludGVnZXJ9IHkxXG4gKiBAcGFyYW0ge2ludGVnZXJ9IHkyXG4gKiBAcGFyYW0ge2ludGVnZXJ9IHhcbiAqL1xuRHVuZ2Vvbi5wcm90b3R5cGUuZ2VuZXJhdGVWZXJ0aWNhbENvcnJpZG9yID0gZnVuY3Rpb24gKHkxLCB5MiwgeCkge1xuICBmb3IgKHZhciB5ID0gTWF0aC5taW4oeTEsIHkyKTsgeSA8IE1hdGgubWF4KHkxLCB5MikgKyAxOyB5KyspIHtcbiAgICAvLyBnZW5lcmF0ZSB3YWxscyBhcm91bmQgdGhlIGNvcnJpZG9yXG4gICAgdGhpcy5kcmF3SWZFbXB0eSh4IC0gMSwgeSwgVGlsZVR5cGVzLndhbGwpXG4gICAgdGhpcy5kcmF3SWZFbXB0eSh4ICsgMSwgeSwgVGlsZVR5cGVzLndhbGwpXG5cbiAgICB0aGlzLmdlbmVyYXRlZE1hcFt5XVt4XSA9IG5ldyBUaWxlKFRpbGVUeXBlcy5mbG9vcilcbiAgfVxufVxuXG4vKipcbiAqIEdlbmVyYXRlcyBjb3JyaWRvcnMgYmV0d2VlbiB0d28gcm9vbXNcbiAqXG4gKiBAcGFyYW0ge2FycmF5fSBjdXJyZW50Q2VudGVyXG4gKiBAcGFyYW0ge2FycmF5fSBwcmV2aW91c0NlbnRlclxuICovXG5EdW5nZW9uLnByb3RvdHlwZS5nZW5lcmF0ZUNvcnJpZG9ycyA9IGZ1bmN0aW9uIChjdXJyZW50Q2VudGVyLCBwcmV2aW91c0NlbnRlcikge1xuICB0aGlzLmdlbmVyYXRlSG9yaXpvbnRhbENvcnJpZG9yKHByZXZpb3VzQ2VudGVyWzFdLCBjdXJyZW50Q2VudGVyWzFdLCBwcmV2aW91c0NlbnRlclswXSlcbiAgdGhpcy5nZW5lcmF0ZVZlcnRpY2FsQ29ycmlkb3IocHJldmlvdXNDZW50ZXJbMF0sIGN1cnJlbnRDZW50ZXJbMF0sIGN1cnJlbnRDZW50ZXJbMV0pXG59XG5cbi8qKlxuICogQWRkcyBhbGwgZ2VuZXJhdGVkIHJvb21zIHRvIHRoZSBtYXBcbiAqL1xuRHVuZ2Vvbi5wcm90b3R5cGUuYWRkUm9vbXNUb01hcCA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGN1cnJlbnRSb29tXG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnJvb21zLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGRyYXdXYWxscyA9IHRydWVcbiAgICBjdXJyZW50Um9vbSA9IHRoaXMucm9vbXNbaV1cbiAgICB0aGlzLmFkZFNpbmdsZVJvb21Ub01hcChjdXJyZW50Um9vbSwgZHJhd1dhbGxzKVxuXG4gICAgaWYgKGkgPiAwKSB7XG4gICAgICB0aGlzLmdlbmVyYXRlQ29ycmlkb3JzKGN1cnJlbnRSb29tLmdldENlbnRlcigpLCB0aGlzLnJvb21zW2kgLSAxXS5nZXRDZW50ZXIoKSlcbiAgICB9XG4gIH1cblxuICAvLyBsb29wIHRocm91Z2ggcm9vbXMgYWdhaW4gb25seSBkcmF3aW5nIGZsb29yIGNoYXJhY3RlcnM7IHRoaXMgd2lsbCAnaG9sbG93JyBvdXRcbiAgLy8gdGhlIHJvb21zIHNvIGlmIHR3byBhcmUgaW50ZXJzZWN0aW5nIHRoZW4gdGhlIGV4dHJhIHdhbGxzIHdpbGwgYmVjb21lIGZsb29yc1xuICBmb3IgKGkgPSAwOyBpIDwgdGhpcy5yb29tcy5sZW5ndGg7IGkrKykge1xuICAgIGN1cnJlbnRSb29tID0gdGhpcy5yb29tc1tpXVxuICAgIHRoaXMuYWRkU2luZ2xlUm9vbVRvTWFwKGN1cnJlbnRSb29tKVxuICB9XG59XG5cbi8qKlxuICogQ29ubmVjdHMgcm9vbXMgdGhhdCBhcmUgbmV4dCB0byBlYWNoIG90aGVyICguIyMuKVxuICpcbiAqIEBwYXJhbSB7aW50ZWdlcn0geFxuICogQHBhcmFtIHtpbnRlZ2VyfSB5XG4gKi9cbkR1bmdlb24ucHJvdG90eXBlLmNvbm5lY3RUd29Bd2F5ID0gZnVuY3Rpb24gKHgsIHkpIHtcbiAgLy8gcmVwbGFjZSAuIyMuIHdpdGggLi4uLlxuICBpZiAodGhpcy5nZW5lcmF0ZWRNYXBbeV1beF0uY2hhcmFjdGVyID09PSBUaWxlVHlwZXMuZmxvb3IgJiZcbiAgICB0aGlzLmdlbmVyYXRlZE1hcFt5XVt4ICsgMV0uY2hhcmFjdGVyID09PSBUaWxlVHlwZXMud2FsbCAmJlxuICAgIHRoaXMuZ2VuZXJhdGVkTWFwW3ldW3ggKyAyXS5jaGFyYWN0ZXIgPT09IFRpbGVUeXBlcy53YWxsICYmXG4gICAgdGhpcy5nZW5lcmF0ZWRNYXBbeV1beCArIDNdLmNoYXJhY3RlciA9PT0gVGlsZVR5cGVzLmZsb29yKSB7XG4gICAgdGhpcy5nZW5lcmF0ZWRNYXBbeV1beCArIDFdLmNoYXJhY3RlciA9IFRpbGVUeXBlcy5mbG9vclxuICAgIHRoaXMuZ2VuZXJhdGVkTWFwW3ldW3ggKyAyXS5jaGFyYWN0ZXIgPSBUaWxlVHlwZXMuZmxvb3JcbiAgfVxuXG4gIC8vIHJlcGxhY2UgLiMjLiB2ZXJ0aWNhbGx5IHdpdGggLi4uLlxuICBpZiAodGhpcy5nZW5lcmF0ZWRNYXBbeV1beF0uY2hhcmFjdGVyID09PSBUaWxlVHlwZXMuZmxvb3IgJiZcbiAgICB0aGlzLmdlbmVyYXRlZE1hcFt5ICsgMV1beF0uY2hhcmFjdGVyID09PSBUaWxlVHlwZXMud2FsbCAmJlxuICAgIHRoaXMuZ2VuZXJhdGVkTWFwW3kgKyAyXVt4XS5jaGFyYWN0ZXIgPT09IFRpbGVUeXBlcy53YWxsICYmXG4gICAgdGhpcy5nZW5lcmF0ZWRNYXBbeSArIDNdW3hdLmNoYXJhY3RlciA9PT0gVGlsZVR5cGVzLmZsb29yKSB7XG4gICAgdGhpcy5nZW5lcmF0ZWRNYXBbeSArIDFdW3hdLmNoYXJhY3RlciA9IFRpbGVUeXBlcy5mbG9vclxuICAgIHRoaXMuZ2VuZXJhdGVkTWFwW3kgKyAyXVt4XS5jaGFyYWN0ZXIgPSBUaWxlVHlwZXMuZmxvb3JcbiAgfVxufVxuXG4vKipcbiAqIENvbm5lY3RzIHJvb21zIHRoYXQgc2hhcmUgYSB3YWxsICguIy4pXG4gKlxuICogQHBhcmFtIHtpbnRlZ2VyfSB4XG4gKiBAcGFyYW0ge2ludGVnZXJ9IHlcbiAqL1xuRHVuZ2Vvbi5wcm90b3R5cGUuY29ubmVjdE9uZUF3YXkgPSBmdW5jdGlvbiAoeCwgeSkge1xuICAvLyByZXBsYWNlIC4jLiB3aXRoIC4uLlxuICBpZiAodGhpcy5nZW5lcmF0ZWRNYXBbeV1beF0uY2hhcmFjdGVyID09PSBUaWxlVHlwZXMuZmxvb3IgJiZcbiAgICB0aGlzLmdlbmVyYXRlZE1hcFt5XVt4ICsgMV0uY2hhcmFjdGVyID09PSBUaWxlVHlwZXMud2FsbCAmJlxuICAgIHRoaXMuZ2VuZXJhdGVkTWFwW3ldW3ggKyAyXS5jaGFyYWN0ZXIgPT09IFRpbGVUeXBlcy5mbG9vcikge1xuICAgIHRoaXMuZ2VuZXJhdGVkTWFwW3ldW3ggKyAxXS5jaGFyYWN0ZXIgPSBUaWxlVHlwZXMuZmxvb3JcbiAgfVxuXG4gIC8vIHJlcGxhY2UgLiMuIHZlcnRpY2FsbHkgd2l0aCAuLi5cbiAgaWYgKHRoaXMuZ2VuZXJhdGVkTWFwW3ldW3hdLmNoYXJhY3RlciA9PT0gVGlsZVR5cGVzLmZsb29yICYmXG4gICAgdGhpcy5nZW5lcmF0ZWRNYXBbeSArIDFdW3hdLmNoYXJhY3RlciA9PT0gVGlsZVR5cGVzLndhbGwgJiZcbiAgICB0aGlzLmdlbmVyYXRlZE1hcFt5ICsgMl1beF0uY2hhcmFjdGVyID09PSBUaWxlVHlwZXMuZmxvb3IpIHtcbiAgICB0aGlzLmdlbmVyYXRlZE1hcFt5ICsgMV1beF0uY2hhcmFjdGVyID0gVGlsZVR5cGVzLmZsb29yXG4gIH1cbn1cblxuLyoqXG4gKiBKb2lucyByb29tcyB0b2dldGhlciB3aGVuIHRoZWlyIHdhbGxzIGFyZSB0b3VjaGluZ1xuICovXG5EdW5nZW9uLnByb3RvdHlwZS5jb25uZWN0QWRqYWNlbnRSb29tcyA9IGZ1bmN0aW9uICgpIHtcbiAgZm9yICh2YXIgeSA9IDA7IHkgPCB0aGlzLmhlaWdodDsgeSsrKSB7XG4gICAgZm9yICh2YXIgeCA9IDA7IHggPCB0aGlzLndpZHRoOyB4KyspIHtcbiAgICAgIHRoaXMuY29ubmVjdFR3b0F3YXkoeCwgeSlcbiAgICAgIHRoaXMuY29ubmVjdE9uZUF3YXkoeCwgeSlcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBNYWluIGZ1bmN0aW9uIGNhbGxlZCBieSBhIE1hcEdlbmVyYXRvciB0byBnZW5lcmF0ZSBhIER1bmdlb25cbiAqL1xuRHVuZ2Vvbi5wcm90b3R5cGUuZ2VuZXJhdGVNYXAgPSBmdW5jdGlvbiAoKSB7XG4gIHRoaXMuZ2VuZXJhdGVkTWFwID0gdGhpcy5nZW5lcmF0ZUluaXRpYWxNYXAoKVxuICB0aGlzLmdlbmVyYXRlUm9vbXMoKVxuICB0aGlzLmFkZFJvb21zVG9NYXAoKVxuICB0aGlzLmNvbm5lY3RBZGphY2VudFJvb21zKClcblxuICByZXR1cm4gdGhpcy5nZW5lcmF0ZWRNYXBcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBEdW5nZW9uXG4iLCJ2YXIgZW1wdHkgPSAnICdcbnZhciB3YWxsID0gJyMnXG52YXIgZmxvb3IgPSAnLidcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGVtcHR5OiBlbXB0eSxcbiAgZmxvb3I6IGZsb29yLFxuICB3YWxsOiB3YWxsLFxuICB2YWxpZFR5cGVzOiBbZW1wdHksIHdhbGwsIGZsb29yXSxcbiAgYmxvY2tpbmdUeXBlczogW3dhbGxdXG59XG4iLCJ2YXIgTWFwR2VuZXJhdG9yID0gcmVxdWlyZSgnLi9jbGFzcy9NYXBHZW5lcmF0b3InKVxuXG52YXIgbWFwR2VuZXJhdG9yID0gbmV3IE1hcEdlbmVyYXRvcih7XG4gIHdpZHRoOiA1MCxcbiAgaGVpZ2h0OiAyNSxcbiAgcm9vbU9wdGlvbnM6IHtcbiAgICBtYXhSb29tczogMTAsXG4gICAgbWluUm9vbVNpemU6IDVcbiAgfVxufSlcblxudmFyIG1hcCA9IG1hcEdlbmVyYXRvci5nZW5lcmF0ZSgpXG52YXIgc3RhcnRQb3NpdGlvbiA9IG1hcEdlbmVyYXRvci5nZXRTdGFydFBvc2l0aW9uKClcbnZhciBQb3Rpb24gPSByZXF1aXJlKCdwb3Rpb24nKVxuXG52YXIgY29sb3VycyA9IHtcbiAgJyAnOiAnI2ZmZicsXG4gICcuJzogJyNjY2MnLFxuICAnIyc6ICcjNTU1J1xufVxuXG52YXIgYXBwID0gUG90aW9uLmluaXQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2dhbWUnKSwge1xuICBjb25maWd1cmU6IGZ1bmN0aW9uICgpIHtcbiAgICBhcHAucmVzaXplKDEwMDAsIDUwMClcbiAgICB0aGlzLnkgPSBzdGFydFBvc2l0aW9uLnggKiAyMCArIDIwXG4gICAgdGhpcy54ID0gc3RhcnRQb3NpdGlvbi55ICogMjAgKyAyMFxuICB9LFxuXG4gIGluaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnNpemUgPSAyMFxuICB9LFxuXG4gIHVwZGF0ZTogZnVuY3Rpb24gKHRpbWUpIHtcbiAgICBpZiAoYXBwLmlucHV0LmlzS2V5RG93bigndycpKSB7IHRoaXMueSAtPSB0aGlzLnNpemUgfVxuICAgIGlmIChhcHAuaW5wdXQuaXNLZXlEb3duKCdkJykpIHsgdGhpcy54ICs9IHRoaXMuc2l6ZSB9XG4gICAgaWYgKGFwcC5pbnB1dC5pc0tleURvd24oJ3MnKSkgeyB0aGlzLnkgKz0gdGhpcy5zaXplIH1cbiAgICBpZiAoYXBwLmlucHV0LmlzS2V5RG93bignYScpKSB7IHRoaXMueCAtPSB0aGlzLnNpemUgfVxuXG4gICAgYXBwLmlucHV0LnJlc2V0S2V5cygpXG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBtYXAubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciByb3cgPSBtYXBbaV1cbiAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgcm93Lmxlbmd0aDsgaisrKSB7XG4gICAgICAgIGFwcC52aWRlby5jdHguZmlsbFN0eWxlID0gY29sb3Vyc1tyb3dbal0uY2hhcmFjdGVyXVxuICAgICAgICBhcHAudmlkZW8uY3R4LmZpbGxSZWN0KGogKiB0aGlzLnNpemUsIGkgKiB0aGlzLnNpemUsIHRoaXMuc2l6ZSwgdGhpcy5zaXplKVxuICAgICAgfVxuICAgIH1cblxuICAgIGFwcC52aWRlby5jdHguZmlsbFN0eWxlID0gJ3JlZCdcbiAgICBhcHAudmlkZW8uY3R4LmZpbGxSZWN0KHRoaXMueCwgdGhpcy55LCB0aGlzLnNpemUsIHRoaXMuc2l6ZSlcbiAgfVxufSlcbiJdfQ==
