////////////////////////////////////////////////////////////////////////////////
//
//      uno - The simplest unit testing framework possible.
//
//      (c) 2012 Evan Moran
//      uno.js is freely distributable under the MIT license.
//      http://github.com/evanmoran/uno
//
//      Function testing (automatic naming)
//
//          uno(fn, args, expected)
//
//          function sum(a,b){return a+b;}
//          uno(sum, [1,2], 3);
//              -> "Uno test passed: sum(1,2) == 3"
//
//      Function testing (custom name):
//
//          uno(name, fn, args, expected)
//
//          uno("square({args}) == {expected}", function(a){a*a}, [3], 9)
//              -> "Uno test passed: square(3) == 9"
//
//      Method testing (custom name):
//
//          uno(name, object, method, args, expected)
//
//          uno("Math.{method}({args}) == {expected}", Math, Math.round, [1.5], 2);
//              -> "Uno test passed: Math.round(1.5) == 2"
//
//      Value testing: (not yet implemented)
//
//          uno(name, value, expected)
//
//          uno("Math.pi == {expected}", Math.pi, 3.14);
//              -> "Uno test passed: Math.PI == 3.14"
//
//      Profiling (not yet implemented)
//
//          uno(fn, args, expected, count)
//
//          uno(Math.round, [1.5], 2, 1000)
//              -> "Uno test passed: round(1.5) == 2 [Averages 20 ms over 1000 trials]"
//
////////////////////////////////////////////////////////////////////////////////


(function () {

    ////////////////////////////////////////////////////////////////////////////
    // uno function
    ////////////////////////////////////////////////////////////////////////////

    // Current version.
    var VERSION = '0.0.2';

    // Establish the root object, `window` in the browser, or `global` on the server.
    var root = this;

    // Save the previous value of the `_` variable.
    var previous = root.uno;

    ////////////////////////////////////////////////////////////////////////////
    // uno helpers
    ////////////////////////////////////////////////////////////////////////////
    //
    // Portions of these helper methods were inspired or borrowed from underscore:
    // http://github.com/documentcloud/underscore
    var _isUndefined = function(obj) { return obj === void 0; };
    var _isNull = function(obj) { return obj === null; };
    var _isNaN = function (obj) { return obj !== obj; };
    var _isBoolean = function(obj) { return obj === true || obj === false || toString.call(obj) == '[object Boolean]' };
    var _isNumber = function(obj) { return !!(obj === 0 || (obj && obj.toExponential && obj.toFixed)); };
    var _isFinite = function(obj) { return _isNumber(obj) && isFinite(obj); };
    var _isInfinity = function(obj){ return _isNumber(obj) && !isFinite(obj) && !_isNaN(obj); };
    var _isString = function(obj) { return !!(obj === '' || (obj && obj.charCodeAt && obj.substr)); };
    var _isDate = function (obj) { return !!(obj && obj.getTimezoneOffset && obj.setUTCFullYear); };
    var _isRegExp = function (obj) { return !!(obj && obj.test && obj.exec && (obj.ignoreCase || obj.ignoreCase === false)); };
    var _isElement = function(obj){ return !!(obj && obj.nodeType == 1); };
    var _isFunction = function(obj) { return typeof obj === 'function'; };
    var _isArray = Array.isArray || function(obj) { return toString.call(obj) == '[object Array]'; };
    var _isArguments = function(obj){ return !!(obj && Object.prototype.hasOwnProperty.call(obj, 'callee')); };
    var _has = function(obj, key) { return Object.prototype.hasOwnProperty.call(obj, key); };

    // _each: Iterate over an object
    var _each = function(obj, iterator, context) {
        if (obj == null) return;
        if (Array.prototype.forEach && obj.forEach === Array.prototype.forEach) {
            obj.forEach(iterator, context);
        } else if (obj.length === +obj.length) {
            for (var i = 0, l = obj.length; i < l; i++) {
                if (i in obj && iterator.call(context, obj[i], i, obj) === breaker) return;
            }
        } else {
            for (var key in obj) {
                if (_has(obj, key)) {
                    if (iterator.call(context, obj[key], key, obj) === breaker) return;
                }
            }
        }
    };

    // _keys: Get the keys of an object
    var _keys = Object.keys || function (obj){
        if (obj !== Object(obj)) throw new TypeError('Invalid object');
        var keys = [];
        for (var key in obj) if (hasOwnProperty.call(obj, key)) keys[keys.length] = key;
        return keys;
    };

    // _extend: Extend a given object with an objects properties
    var _extend = function(obj) {
        _each(Array.prototype.slice.call(arguments, 1), function(source) {
          for (var prop in source) {
            obj[prop] = source[prop];
          }
        });
        return obj;
    };

    // _defaults: Fill in a given object with default properties.
    var _defaults = function(obj) {
        _each(Array.prototype.slice.call(arguments, 1), function(source) {
          for (var prop in source) {
            if (obj[prop] == null) obj[prop] = source[prop];
          }
        });
        return obj;
    };

    // _isSame: Determine if two values are equal
    //
    // Importantly NaN == NaN should return true for unit testing.
    var _isSame = function (a, b)
    {
        // Check object identity.
        if (a === b) return true;
        // Different types?
        var atype = typeof (a), btype = typeof (b);
        if (atype != btype) return false;
        // Basic equality test (watch out for coercions).
        if (a == b) return true;
        // One is falsy and the other truthy.
        if ((!a && b) || (a && !b)) return false;
        // One of them implements an isEqual()?
        if (_isFunction(a.isEqual)) return a.isEqual(b);
        // Check dates' integer values.
        if (_isDate(a) && _isDate(b)) return a.getTime() === b.getTime();
        // Both are NaN?
        if (_isNaN(a) && _isNaN(b)) return true;
        // Compare regular expressions.
        if (_isRegExp(a) && _isRegExp(b))
            return a.source === b.source &&
                a.global === b.global &&
                a.ignoreCase === b.ignoreCase &&
                a.multiline === b.multiline;
        // If a is not an object by this point, we can't handle it.
        if (atype !== 'object') return false;
        // Check for different array lengths before comparing contents.
        if (a.length && (a.length !== b.length)) return false;
        // Nothing else worked, deep compare the contents.
        var aKeys = _keys(a), bKeys = _keys(b);
        // Different object sizes?
        if (aKeys.length != bKeys.length) return false;
        // Recursive comparison of contents.
        for (var key in a) if (!(key in b) || !_isSame(a[key], b[key])) return false;
        return true;
    };

   // _typeOf: Mimic behavior of built-in typeof operator using improved underscore type detection
    var _typeOf = function(any)
    {
        if (_isNull(any))           return "null";
        else if (_isUndefined(any)) return "undefined";
        else if (_isInfinity(any))  return "infinity";
        else if (_isNaN(any))       return "nan";
        else if (_isBoolean(any))   return "boolean";
        else if (_isNumber(any))    return "number";
        else if (_isString(any))    return "string";
        else if (_isFunction(any))  return "function";
        else if (_isArray(any))     return "array";
        else if (_isRegExp(any))    return "regexp";
        else if (_isDate(any))      return "date";
        return "object";
    }

    // _toString: Convert any type to a string
    //
    // Uses native JSON.stringify for objects and arrays when possible
    // Note: The JSON spec indicates that NaN stringifies to "null".  The reasoning is pretty weak,
    // (NaN isn't a keyword). This method is consistent with that behavior (yay standards) but it will be less clear
    // when outputting NaN what is going on.
    var _toString = function(any)
    {
        var out = "";
        var type = _typeOf(any);
        var i;
        switch (type)
        {
            case "null":        return "null";
            case "undefined":   return "undefined";
            case "nan":         return "NaN";
            case "infinity":    return "infinity";
            case "boolean":     // fallthrough
            case "number":      return String(any);
            case "string":      return any;
            case "regexp":      // fallthrough
            case "date":        return any.toString();
            case "element":     return "<" + type.nodeName.toLowerCase() + ">";

            case "jquery":
                // Recurse through elements
                var domList = any.get();
                for (i = 0; i < domList.length; i++)
                    out += (i === 0 ? "" : ", ") + arguments.callee(domList[i]);
                return "[" + out + "]";

            case "object":
                // Use native JSON object
                if (JSON && _isFunction(JSON.stringify))
                    return JSON.stringify(any);
                // Use toString method
                return any.toString();

            case "array":
                // Use JSON if possible
                if (JSON && _isFunction(JSON.stringify))
                    return JSON.stringify(any);
                // Recurse through array
                for (i = 0; i < any.length; i++)
                    out += (i === 0 ? "" : ",") + arguments.callee(any[i]);
                return "[" + out + "]";
        }
    }

    // _format: Format complex strings with an object
    //
    // Example:  _format("Hi {name}, see you at {time}{ampm}!", {name:"Jeremy", time:6, ampm:"pm"})
    // Returns   "Hi Jermey, see you at 6pm!"
    //
    var _format = function(format, mapping)
    {
        // Return input without change if it is not a string
        if (format == null || typeof (format) != "string" || typeof (mapping) != "object")
          return format;

        for (var key in mapping)
        {
            var value = _toString(mapping[key]);
            if (typeof (value) != "string")
               continue;
            // Add braces if not specified
            if (key.charAt(0) != "{" && key.charAt(key.length - 1) != "}")
                key = "\\{" + key + "\\}";

            // Replace key for value
            var rx = new RegExp(key, "g");
            format = format.replace(rx, value);
        }
        return format;
    }

    // _functionName: What is the name of the function?
    var _functionName = function (fn) {
        var out = fn.toString().match(/function\s*([\w\$]*)\s*\(/);
        return out ? out[1] : "function";
    };

    ////////////////////////////////////////////////////////////////////////////
    // uno function
    ////////////////////////////////////////////////////////////////////////////

    var defaults = {
        group: "Uno",
        name: "{method}{args} == {expected}",
        object: null,
        method: null,
        args: null,
        expected: null,
        result: null
    }

    var _settings = {}
    _extend(_settings, defaults)

    uno = function ()
    {
        // Type signature                           Count   Example
        // ANY, ANY                                 2       uno(Math.pi, 3.14)                                                  (Not implemented)
        // string, ANY, ANY                         3       uno("Math.pi == {expected}", Math.pi, 3.14)                         (Not implemented)
        // function, array, ANY                     3       uno(sum, [1,2,3], 6)
        // string, function, array, ANY             4       uno("sum{args} == {expected}", sum, [1,2,3], 6)
        // object, function, array, ANY             4       uno(person, person.name, [], "Steve")
        // string, object, function, array, ANY     5       uno("person.name == {expected}", person, person.name, [], "Steve");
        // Interpret arguments
        var a = arguments;
        var len = a.length;
        var i = 0;

        // Argument `name` (optional)
        var name = _isString(a[i]) ? a[i++] : "{method}({args}) == {expected}";

        // Argument `object` (optional)
        var object = typeof a[i] === "object" ? a[i++] : null;

        // Argument `function` (not optional)
        var fn = a[i]
        if(!_isFunction(fn))
            throw "Uno argument error: `fn` is missing or not a function";

        // Argument `args` (not optional)
        var args = a[i+1]
        if(!_isArray(args))
            throw "Uno argument error: `args` is missing or not an [array]";

        // Argument `expected` (not optional)
        var expected = a[i+2]

        // Argument `count` (optional)
        var count = a[i+3]
        if(!(count === undefined || _isNumber(count)))
            throw "Uno argument error: `count` should be an integer or undefined"

        // Fail if arguments are invalid
        if (len < 3 || len > 5 || !name || !fn || !args)
            throw "Uno arguments are invalid";

        // Determine if type is simple
        var _isSimpleType = function(any){
        switch(_typeOf(any)){
            case "string": case "null": case "undefined": case "number": case "boolean":
                return true;
        }
        return false;
        }

        // Test
        var result = null;
        var isCaught = false;
        try { result = fn.apply(object, args); }
        catch (e) { result = e; isCaught = true; }

        // Name
        var map = {};
        map.input = map["in"] = map.args = map.arguments = _toString(args).slice(1, -1);
        map.output = map["out"] = map.result = _toString(result);
        map.method = map.fn = map.f = map["function"] = _functionName(fn);
        map.expected = _toString(expected);
        name = _format(name, map);

        // Message
        var pass = _isSame(result, expected);
        var message = pass ? "Uno test passed: " + name : "Test failed: " + name
        + "\n     input:\t" + map.args
        + "\n  " + (isCaught ? "threw:\t" : "returned:\t") + map.result
        + "\n  expected:\t" + map.expected + "\n";

        // Report to console
        var type = pass ? "log" : "error"
        if (typeof console[type] !== "undefined")
            console[type](message);

        // Report to fireunit
        if (typeof (fireunit) === "object")
        {
            //    if (pass !== true && _isSimpleType(result) && _isSimpleType(expected))
            //    fireunit.compare(result, expected, message);
            //    else
            fireunit.ok(pass, message);
        }

        // Report to QUnit
        if (typeof QUnit !== "undefined" && typeof test !== "undefined")
        {

        }

        // Report to JSUnit
        if (typeof assertEquals !== "undefined")
        {
            window["test" + name] = function () {
                assertEquals(name, expected, result);
            };
        }

        return pass;
    };

    ////////////////////////////////////////////////////////////////////////////
    // uno object
    ////////////////////////////////////////////////////////////////////////////

    // Save version
    uno.VERSION = VERSION;

    // No conflict
    uno.noConflict = function() {
        root.uno = previous;
        return this;
    };

    // Private store for user settings
    uno._settings = _settings

    // Private store to reset user settings
    uno._defaults = _defaults

    uno.set = function (options) {
        _extend(uno._settings, options)
        return uno;
    }

    uno.clearAll = function (options) {
        uno._settings = {}
        _extend(uno._settings, uno._defaults)
        return uno;
    }

    // Export uno for Node.js
    if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = uno;
        }
        exports.uno = uno;
    }
    // Export uno globally for browser
    else {
        root['uno'] = uno;
    }

})();


