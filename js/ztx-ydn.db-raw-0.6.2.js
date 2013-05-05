var COMPILED = false;
var goog = goog || {};
goog.global = this;
goog.global.CLOSURE_DEFINES;
goog.define = function(name, defaultValue) {
  var value = defaultValue;
  if(!COMPILED) {
    if(goog.global.CLOSURE_DEFINES && Object.prototype.hasOwnProperty.call(goog.global.CLOSURE_DEFINES, name)) {
      value = goog.global.CLOSURE_DEFINES[name]
    }
  }
  goog.exportPath_(name, value)
};
goog.DEBUG = true;
goog.LOCALE = "en";
goog.TRUSTED_SITE = true;
goog.provide = function(name) {
  if(!COMPILED) {
    if(goog.isProvided_(name)) {
      throw Error('Namespace "' + name + '" already declared.');
    }
    delete goog.implicitNamespaces_[name];
    var namespace = name;
    while(namespace = namespace.substring(0, namespace.lastIndexOf("."))) {
      if(goog.getObjectByName(namespace)) {
        break
      }
      goog.implicitNamespaces_[namespace] = true
    }
  }
  goog.exportPath_(name)
};
goog.setTestOnly = function(opt_message) {
  if(COMPILED && !goog.DEBUG) {
    opt_message = opt_message || "";
    throw Error("Importing test-only code into non-debug environment" + opt_message ? ": " + opt_message : ".");
  }
};
if(!COMPILED) {
  goog.isProvided_ = function(name) {
    return!goog.implicitNamespaces_[name] && !!goog.getObjectByName(name)
  };
  goog.implicitNamespaces_ = {}
}
goog.exportPath_ = function(name, opt_object, opt_objectToExportTo) {
  var parts = name.split(".");
  var cur = opt_objectToExportTo || goog.global;
  if(!(parts[0] in cur) && cur.execScript) {
    cur.execScript("var " + parts[0])
  }
  for(var part;parts.length && (part = parts.shift());) {
    if(!parts.length && goog.isDef(opt_object)) {
      cur[part] = opt_object
    }else {
      if(cur[part]) {
        cur = cur[part]
      }else {
        cur = cur[part] = {}
      }
    }
  }
};
goog.getObjectByName = function(name, opt_obj) {
  var parts = name.split(".");
  var cur = opt_obj || goog.global;
  for(var part;part = parts.shift();) {
    if(goog.isDefAndNotNull(cur[part])) {
      cur = cur[part]
    }else {
      return null
    }
  }
  return cur
};
goog.globalize = function(obj, opt_global) {
  var global = opt_global || goog.global;
  for(var x in obj) {
    global[x] = obj[x]
  }
};
goog.addDependency = function(relPath, provides, requires) {
  if(!COMPILED) {
    var provide, require;
    var path = relPath.replace(/\\/g, "/");
    var deps = goog.dependencies_;
    for(var i = 0;provide = provides[i];i++) {
      deps.nameToPath[provide] = path;
      if(!(path in deps.pathToNames)) {
        deps.pathToNames[path] = {}
      }
      deps.pathToNames[path][provide] = true
    }
    for(var j = 0;require = requires[j];j++) {
      if(!(path in deps.requires)) {
        deps.requires[path] = {}
      }
      deps.requires[path][require] = true
    }
  }
};
goog.ENABLE_DEBUG_LOADER = true;
goog.require = function(name) {
  if(!COMPILED) {
    if(goog.isProvided_(name)) {
      return
    }
    if(goog.ENABLE_DEBUG_LOADER) {
      var path = goog.getPathFromDeps_(name);
      if(path) {
        goog.included_[path] = true;
        goog.writeScripts_();
        return
      }
    }
    var errorMessage = "goog.require could not find: " + name;
    if(goog.global.console) {
      goog.global.console["error"](errorMessage)
    }
    throw Error(errorMessage);
  }
};
goog.basePath = "";
goog.global.CLOSURE_BASE_PATH;
goog.global.CLOSURE_NO_DEPS;
goog.global.CLOSURE_IMPORT_SCRIPT;
goog.nullFunction = function() {
};
goog.identityFunction = function(opt_returnValue, var_args) {
  return opt_returnValue
};
goog.abstractMethod = function() {
  throw Error("unimplemented abstract method");
};
goog.addSingletonGetter = function(ctor) {
  ctor.getInstance = function() {
    if(ctor.instance_) {
      return ctor.instance_
    }
    if(goog.DEBUG) {
      goog.instantiatedSingletons_[goog.instantiatedSingletons_.length] = ctor
    }
    return ctor.instance_ = new ctor
  }
};
goog.instantiatedSingletons_ = [];
if(!COMPILED && goog.ENABLE_DEBUG_LOADER) {
  goog.included_ = {};
  goog.dependencies_ = {pathToNames:{}, nameToPath:{}, requires:{}, visited:{}, written:{}};
  goog.inHtmlDocument_ = function() {
    var doc = goog.global.document;
    return typeof doc != "undefined" && "write" in doc
  };
  goog.findBasePath_ = function() {
    if(goog.global.CLOSURE_BASE_PATH) {
      goog.basePath = goog.global.CLOSURE_BASE_PATH;
      return
    }else {
      if(!goog.inHtmlDocument_()) {
        return
      }
    }
    var doc = goog.global.document;
    var scripts = doc.getElementsByTagName("script");
    for(var i = scripts.length - 1;i >= 0;--i) {
      var src = scripts[i].src;
      var qmark = src.lastIndexOf("?");
      var l = qmark == -1 ? src.length : qmark;
      if(src.substr(l - 7, 7) == "base.js") {
        goog.basePath = src.substr(0, l - 7);
        return
      }
    }
  };
  goog.importScript_ = function(src) {
    var importScript = goog.global.CLOSURE_IMPORT_SCRIPT || goog.writeScriptTag_;
    if(!goog.dependencies_.written[src] && importScript(src)) {
      goog.dependencies_.written[src] = true
    }
  };
  goog.writeScriptTag_ = function(src) {
    if(goog.inHtmlDocument_()) {
      var doc = goog.global.document;
      if(doc.readyState == "complete") {
        var isDeps = /\bdeps.js$/.test(src);
        if(isDeps) {
          return false
        }else {
          throw Error('Cannot write "' + src + '" after document load');
        }
      }
      doc.write('<script type="text/javascript" src="' + src + '"></' + "script>");
      return true
    }else {
      return false
    }
  };
  goog.writeScripts_ = function() {
    var scripts = [];
    var seenScript = {};
    var deps = goog.dependencies_;
    function visitNode(path) {
      if(path in deps.written) {
        return
      }
      if(path in deps.visited) {
        if(!(path in seenScript)) {
          seenScript[path] = true;
          scripts.push(path)
        }
        return
      }
      deps.visited[path] = true;
      if(path in deps.requires) {
        for(var requireName in deps.requires[path]) {
          if(!goog.isProvided_(requireName)) {
            if(requireName in deps.nameToPath) {
              visitNode(deps.nameToPath[requireName])
            }else {
              throw Error("Undefined nameToPath for " + requireName);
            }
          }
        }
      }
      if(!(path in seenScript)) {
        seenScript[path] = true;
        scripts.push(path)
      }
    }
    for(var path in goog.included_) {
      if(!deps.written[path]) {
        visitNode(path)
      }
    }
    for(var i = 0;i < scripts.length;i++) {
      if(scripts[i]) {
        goog.importScript_(goog.basePath + scripts[i])
      }else {
        throw Error("Undefined script input");
      }
    }
  };
  goog.getPathFromDeps_ = function(rule) {
    if(rule in goog.dependencies_.nameToPath) {
      return goog.dependencies_.nameToPath[rule]
    }else {
      return null
    }
  };
  goog.findBasePath_();
  if(!goog.global.CLOSURE_NO_DEPS) {
    goog.importScript_(goog.basePath + "deps.js")
  }
}
goog.typeOf = function(value) {
  var s = typeof value;
  if(s == "object") {
    if(value) {
      if(value instanceof Array) {
        return"array"
      }else {
        if(value instanceof Object) {
          return s
        }
      }
      var className = Object.prototype.toString.call((value));
      if(className == "[object Window]") {
        return"object"
      }
      if(className == "[object Array]" || typeof value.length == "number" && typeof value.splice != "undefined" && typeof value.propertyIsEnumerable != "undefined" && !value.propertyIsEnumerable("splice")) {
        return"array"
      }
      if(className == "[object Function]" || typeof value.call != "undefined" && typeof value.propertyIsEnumerable != "undefined" && !value.propertyIsEnumerable("call")) {
        return"function"
      }
    }else {
      return"null"
    }
  }else {
    if(s == "function" && typeof value.call == "undefined") {
      return"object"
    }
  }
  return s
};
goog.isDef = function(val) {
  return val !== undefined
};
goog.isNull = function(val) {
  return val === null
};
goog.isDefAndNotNull = function(val) {
  return val != null
};
goog.isArray = function(val) {
  return goog.typeOf(val) == "array"
};
goog.isArrayLike = function(val) {
  var type = goog.typeOf(val);
  return type == "array" || type == "object" && typeof val.length == "number"
};
goog.isDateLike = function(val) {
  return goog.isObject(val) && typeof val.getFullYear == "function"
};
goog.isString = function(val) {
  return typeof val == "string"
};
goog.isBoolean = function(val) {
  return typeof val == "boolean"
};
goog.isNumber = function(val) {
  return typeof val == "number"
};
goog.isFunction = function(val) {
  return goog.typeOf(val) == "function"
};
goog.isObject = function(val) {
  var type = typeof val;
  return type == "object" && val != null || type == "function"
};
goog.getUid = function(obj) {
  return obj[goog.UID_PROPERTY_] || (obj[goog.UID_PROPERTY_] = ++goog.uidCounter_)
};
goog.removeUid = function(obj) {
  if("removeAttribute" in obj) {
    obj.removeAttribute(goog.UID_PROPERTY_)
  }
  try {
    delete obj[goog.UID_PROPERTY_]
  }catch(ex) {
  }
};
goog.UID_PROPERTY_ = "closure_uid_" + (Math.random() * 1E9 >>> 0);
goog.uidCounter_ = 0;
goog.getHashCode = goog.getUid;
goog.removeHashCode = goog.removeUid;
goog.cloneObject = function(obj) {
  var type = goog.typeOf(obj);
  if(type == "object" || type == "array") {
    if(obj.clone) {
      return obj.clone()
    }
    var clone = type == "array" ? [] : {};
    for(var key in obj) {
      clone[key] = goog.cloneObject(obj[key])
    }
    return clone
  }
  return obj
};
goog.bindNative_ = function(fn, selfObj, var_args) {
  return(fn.call.apply(fn.bind, arguments))
};
goog.bindJs_ = function(fn, selfObj, var_args) {
  if(!fn) {
    throw new Error;
  }
  if(arguments.length > 2) {
    var boundArgs = Array.prototype.slice.call(arguments, 2);
    return function() {
      var newArgs = Array.prototype.slice.call(arguments);
      Array.prototype.unshift.apply(newArgs, boundArgs);
      return fn.apply(selfObj, newArgs)
    }
  }else {
    return function() {
      return fn.apply(selfObj, arguments)
    }
  }
};
goog.bind = function(fn, selfObj, var_args) {
  if(Function.prototype.bind && Function.prototype.bind.toString().indexOf("native code") != -1) {
    goog.bind = goog.bindNative_
  }else {
    goog.bind = goog.bindJs_
  }
  return goog.bind.apply(null, arguments)
};
goog.partial = function(fn, var_args) {
  var args = Array.prototype.slice.call(arguments, 1);
  return function() {
    var newArgs = Array.prototype.slice.call(arguments);
    newArgs.unshift.apply(newArgs, args);
    return fn.apply(this, newArgs)
  }
};
goog.mixin = function(target, source) {
  for(var x in source) {
    target[x] = source[x]
  }
};
goog.now = goog.TRUSTED_SITE && Date.now || function() {
  return+new Date
};
goog.globalEval = function(script) {
  if(goog.global.execScript) {
    goog.global.execScript(script, "JavaScript")
  }else {
    if(goog.global.eval) {
      if(goog.evalWorksForGlobals_ == null) {
        goog.global.eval("var _et_ = 1;");
        if(typeof goog.global["_et_"] != "undefined") {
          delete goog.global["_et_"];
          goog.evalWorksForGlobals_ = true
        }else {
          goog.evalWorksForGlobals_ = false
        }
      }
      if(goog.evalWorksForGlobals_) {
        goog.global.eval(script)
      }else {
        var doc = goog.global.document;
        var scriptElt = doc.createElement("script");
        scriptElt.type = "text/javascript";
        scriptElt.defer = false;
        scriptElt.appendChild(doc.createTextNode(script));
        doc.body.appendChild(scriptElt);
        doc.body.removeChild(scriptElt)
      }
    }else {
      throw Error("goog.globalEval not available");
    }
  }
};
goog.evalWorksForGlobals_ = null;
goog.cssNameMapping_;
goog.cssNameMappingStyle_;
goog.getCssName = function(className, opt_modifier) {
  var getMapping = function(cssName) {
    return goog.cssNameMapping_[cssName] || cssName
  };
  var renameByParts = function(cssName) {
    var parts = cssName.split("-");
    var mapped = [];
    for(var i = 0;i < parts.length;i++) {
      mapped.push(getMapping(parts[i]))
    }
    return mapped.join("-")
  };
  var rename;
  if(goog.cssNameMapping_) {
    rename = goog.cssNameMappingStyle_ == "BY_WHOLE" ? getMapping : renameByParts
  }else {
    rename = function(a) {
      return a
    }
  }
  if(opt_modifier) {
    return className + "-" + rename(opt_modifier)
  }else {
    return rename(className)
  }
};
goog.setCssNameMapping = function(mapping, opt_style) {
  goog.cssNameMapping_ = mapping;
  goog.cssNameMappingStyle_ = opt_style
};
goog.global.CLOSURE_CSS_NAME_MAPPING;
if(!COMPILED && goog.global.CLOSURE_CSS_NAME_MAPPING) {
  goog.cssNameMapping_ = goog.global.CLOSURE_CSS_NAME_MAPPING
}
goog.getMsg = function(str, opt_values) {
  var values = opt_values || {};
  for(var key in values) {
    var value = ("" + values[key]).replace(/\$/g, "$$$$");
    str = str.replace(new RegExp("\\{\\$" + key + "\\}", "gi"), value)
  }
  return str
};
goog.getMsgWithFallback = function(a, b) {
  return a
};
goog.exportSymbol = function(publicPath, object, opt_objectToExportTo) {
  goog.exportPath_(publicPath, object, opt_objectToExportTo)
};
goog.exportProperty = function(object, publicName, symbol) {
  object[publicName] = symbol
};
goog.inherits = function(childCtor, parentCtor) {
  function tempCtor() {
  }
  tempCtor.prototype = parentCtor.prototype;
  childCtor.superClass_ = parentCtor.prototype;
  childCtor.prototype = new tempCtor;
  childCtor.prototype.constructor = childCtor
};
goog.base = function(me, opt_methodName, var_args) {
  var caller = arguments.callee.caller;
  if(goog.DEBUG) {
    if(!caller) {
      throw Error("arguments.caller not defined.  goog.base() expects not " + "to be running in strict mode. See " + "http://www.ecma-international.org/ecma-262/5.1/#sec-C");
    }
  }
  if(caller.superClass_) {
    return caller.superClass_.constructor.apply(me, Array.prototype.slice.call(arguments, 1))
  }
  var args = Array.prototype.slice.call(arguments, 2);
  var foundCaller = false;
  for(var ctor = me.constructor;ctor;ctor = ctor.superClass_ && ctor.superClass_.constructor) {
    if(ctor.prototype[opt_methodName] === caller) {
      foundCaller = true
    }else {
      if(foundCaller) {
        return ctor.prototype[opt_methodName].apply(me, args)
      }
    }
  }
  if(me[opt_methodName] === caller) {
    return me.constructor.prototype[opt_methodName].apply(me, args)
  }else {
    throw Error("goog.base called from a method of one name " + "to a method of a different name");
  }
};
goog.scope = function(fn) {
  fn.call(goog.global)
};
goog.provide("goog.debug.Error");
goog.debug.Error = function(opt_msg) {
  if(Error.captureStackTrace) {
    Error.captureStackTrace(this, goog.debug.Error)
  }else {
    this.stack = (new Error).stack || ""
  }
  if(opt_msg) {
    this.message = String(opt_msg)
  }
};
goog.inherits(goog.debug.Error, Error);
goog.debug.Error.prototype.name = "CustomError";
goog.provide("goog.string");
goog.provide("goog.string.Unicode");
goog.string.Unicode = {NBSP:"\u00a0"};
goog.string.startsWith = function(str, prefix) {
  return str.lastIndexOf(prefix, 0) == 0
};
goog.string.endsWith = function(str, suffix) {
  var l = str.length - suffix.length;
  return l >= 0 && str.indexOf(suffix, l) == l
};
goog.string.caseInsensitiveStartsWith = function(str, prefix) {
  return goog.string.caseInsensitiveCompare(prefix, str.substr(0, prefix.length)) == 0
};
goog.string.caseInsensitiveEndsWith = function(str, suffix) {
  return goog.string.caseInsensitiveCompare(suffix, str.substr(str.length - suffix.length, suffix.length)) == 0
};
goog.string.caseInsensitiveEquals = function(str1, str2) {
  return str1.toLowerCase() == str2.toLowerCase()
};
goog.string.subs = function(str, var_args) {
  for(var i = 1;i < arguments.length;i++) {
    var replacement = String(arguments[i]).replace(/\$/g, "$$$$");
    str = str.replace(/\%s/, replacement)
  }
  return str
};
goog.string.collapseWhitespace = function(str) {
  return str.replace(/[\s\xa0]+/g, " ").replace(/^\s+|\s+$/g, "")
};
goog.string.isEmpty = function(str) {
  return/^[\s\xa0]*$/.test(str)
};
goog.string.isEmptySafe = function(str) {
  return goog.string.isEmpty(goog.string.makeSafe(str))
};
goog.string.isBreakingWhitespace = function(str) {
  return!/[^\t\n\r ]/.test(str)
};
goog.string.isAlpha = function(str) {
  return!/[^a-zA-Z]/.test(str)
};
goog.string.isNumeric = function(str) {
  return!/[^0-9]/.test(str)
};
goog.string.isAlphaNumeric = function(str) {
  return!/[^a-zA-Z0-9]/.test(str)
};
goog.string.isSpace = function(ch) {
  return ch == " "
};
goog.string.isUnicodeChar = function(ch) {
  return ch.length == 1 && ch >= " " && ch <= "~" || ch >= "\u0080" && ch <= "\ufffd"
};
goog.string.stripNewlines = function(str) {
  return str.replace(/(\r\n|\r|\n)+/g, " ")
};
goog.string.canonicalizeNewlines = function(str) {
  return str.replace(/(\r\n|\r|\n)/g, "\n")
};
goog.string.normalizeWhitespace = function(str) {
  return str.replace(/\xa0|\s/g, " ")
};
goog.string.normalizeSpaces = function(str) {
  return str.replace(/\xa0|[ \t]+/g, " ")
};
goog.string.collapseBreakingSpaces = function(str) {
  return str.replace(/[\t\r\n ]+/g, " ").replace(/^[\t\r\n ]+|[\t\r\n ]+$/g, "")
};
goog.string.trim = function(str) {
  return str.replace(/^[\s\xa0]+|[\s\xa0]+$/g, "")
};
goog.string.trimLeft = function(str) {
  return str.replace(/^[\s\xa0]+/, "")
};
goog.string.trimRight = function(str) {
  return str.replace(/[\s\xa0]+$/, "")
};
goog.string.caseInsensitiveCompare = function(str1, str2) {
  var test1 = String(str1).toLowerCase();
  var test2 = String(str2).toLowerCase();
  if(test1 < test2) {
    return-1
  }else {
    if(test1 == test2) {
      return 0
    }else {
      return 1
    }
  }
};
goog.string.numerateCompareRegExp_ = /(\.\d+)|(\d+)|(\D+)/g;
goog.string.numerateCompare = function(str1, str2) {
  if(str1 == str2) {
    return 0
  }
  if(!str1) {
    return-1
  }
  if(!str2) {
    return 1
  }
  var tokens1 = str1.toLowerCase().match(goog.string.numerateCompareRegExp_);
  var tokens2 = str2.toLowerCase().match(goog.string.numerateCompareRegExp_);
  var count = Math.min(tokens1.length, tokens2.length);
  for(var i = 0;i < count;i++) {
    var a = tokens1[i];
    var b = tokens2[i];
    if(a != b) {
      var num1 = parseInt(a, 10);
      if(!isNaN(num1)) {
        var num2 = parseInt(b, 10);
        if(!isNaN(num2) && num1 - num2) {
          return num1 - num2
        }
      }
      return a < b ? -1 : 1
    }
  }
  if(tokens1.length != tokens2.length) {
    return tokens1.length - tokens2.length
  }
  return str1 < str2 ? -1 : 1
};
goog.string.urlEncode = function(str) {
  return encodeURIComponent(String(str))
};
goog.string.urlDecode = function(str) {
  return decodeURIComponent(str.replace(/\+/g, " "))
};
goog.string.newLineToBr = function(str, opt_xml) {
  return str.replace(/(\r\n|\r|\n)/g, opt_xml ? "<br />" : "<br>")
};
goog.string.htmlEscape = function(str, opt_isLikelyToContainHtmlChars) {
  if(opt_isLikelyToContainHtmlChars) {
    return str.replace(goog.string.amperRe_, "&amp;").replace(goog.string.ltRe_, "&lt;").replace(goog.string.gtRe_, "&gt;").replace(goog.string.quotRe_, "&quot;")
  }else {
    if(!goog.string.allRe_.test(str)) {
      return str
    }
    if(str.indexOf("&") != -1) {
      str = str.replace(goog.string.amperRe_, "&amp;")
    }
    if(str.indexOf("<") != -1) {
      str = str.replace(goog.string.ltRe_, "&lt;")
    }
    if(str.indexOf(">") != -1) {
      str = str.replace(goog.string.gtRe_, "&gt;")
    }
    if(str.indexOf('"') != -1) {
      str = str.replace(goog.string.quotRe_, "&quot;")
    }
    return str
  }
};
goog.string.amperRe_ = /&/g;
goog.string.ltRe_ = /</g;
goog.string.gtRe_ = />/g;
goog.string.quotRe_ = /\"/g;
goog.string.allRe_ = /[&<>\"]/;
goog.string.unescapeEntities = function(str) {
  if(goog.string.contains(str, "&")) {
    if("document" in goog.global) {
      return goog.string.unescapeEntitiesUsingDom_(str)
    }else {
      return goog.string.unescapePureXmlEntities_(str)
    }
  }
  return str
};
goog.string.unescapeEntitiesUsingDom_ = function(str) {
  var seen = {"&amp;":"&", "&lt;":"<", "&gt;":">", "&quot;":'"'};
  var div = document.createElement("div");
  return str.replace(goog.string.HTML_ENTITY_PATTERN_, function(s, entity) {
    var value = seen[s];
    if(value) {
      return value
    }
    if(entity.charAt(0) == "#") {
      var n = Number("0" + entity.substr(1));
      if(!isNaN(n)) {
        value = String.fromCharCode(n)
      }
    }
    if(!value) {
      div.innerHTML = s + " ";
      value = div.firstChild.nodeValue.slice(0, -1)
    }
    return seen[s] = value
  })
};
goog.string.unescapePureXmlEntities_ = function(str) {
  return str.replace(/&([^;]+);/g, function(s, entity) {
    switch(entity) {
      case "amp":
        return"&";
      case "lt":
        return"<";
      case "gt":
        return">";
      case "quot":
        return'"';
      default:
        if(entity.charAt(0) == "#") {
          var n = Number("0" + entity.substr(1));
          if(!isNaN(n)) {
            return String.fromCharCode(n)
          }
        }
        return s
    }
  })
};
goog.string.HTML_ENTITY_PATTERN_ = /&([^;\s<&]+);?/g;
goog.string.whitespaceEscape = function(str, opt_xml) {
  return goog.string.newLineToBr(str.replace(/  /g, " &#160;"), opt_xml)
};
goog.string.stripQuotes = function(str, quoteChars) {
  var length = quoteChars.length;
  for(var i = 0;i < length;i++) {
    var quoteChar = length == 1 ? quoteChars : quoteChars.charAt(i);
    if(str.charAt(0) == quoteChar && str.charAt(str.length - 1) == quoteChar) {
      return str.substring(1, str.length - 1)
    }
  }
  return str
};
goog.string.truncate = function(str, chars, opt_protectEscapedCharacters) {
  if(opt_protectEscapedCharacters) {
    str = goog.string.unescapeEntities(str)
  }
  if(str.length > chars) {
    str = str.substring(0, chars - 3) + "..."
  }
  if(opt_protectEscapedCharacters) {
    str = goog.string.htmlEscape(str)
  }
  return str
};
goog.string.truncateMiddle = function(str, chars, opt_protectEscapedCharacters, opt_trailingChars) {
  if(opt_protectEscapedCharacters) {
    str = goog.string.unescapeEntities(str)
  }
  if(opt_trailingChars && str.length > chars) {
    if(opt_trailingChars > chars) {
      opt_trailingChars = chars
    }
    var endPoint = str.length - opt_trailingChars;
    var startPoint = chars - opt_trailingChars;
    str = str.substring(0, startPoint) + "..." + str.substring(endPoint)
  }else {
    if(str.length > chars) {
      var half = Math.floor(chars / 2);
      var endPos = str.length - half;
      half += chars % 2;
      str = str.substring(0, half) + "..." + str.substring(endPos)
    }
  }
  if(opt_protectEscapedCharacters) {
    str = goog.string.htmlEscape(str)
  }
  return str
};
goog.string.specialEscapeChars_ = {"\x00":"\\0", "\b":"\\b", "\f":"\\f", "\n":"\\n", "\r":"\\r", "\t":"\\t", "\x0B":"\\x0B", '"':'\\"', "\\":"\\\\"};
goog.string.jsEscapeCache_ = {"'":"\\'"};
goog.string.quote = function(s) {
  s = String(s);
  if(s.quote) {
    return s.quote()
  }else {
    var sb = ['"'];
    for(var i = 0;i < s.length;i++) {
      var ch = s.charAt(i);
      var cc = ch.charCodeAt(0);
      sb[i + 1] = goog.string.specialEscapeChars_[ch] || (cc > 31 && cc < 127 ? ch : goog.string.escapeChar(ch))
    }
    sb.push('"');
    return sb.join("")
  }
};
goog.string.escapeString = function(str) {
  var sb = [];
  for(var i = 0;i < str.length;i++) {
    sb[i] = goog.string.escapeChar(str.charAt(i))
  }
  return sb.join("")
};
goog.string.escapeChar = function(c) {
  if(c in goog.string.jsEscapeCache_) {
    return goog.string.jsEscapeCache_[c]
  }
  if(c in goog.string.specialEscapeChars_) {
    return goog.string.jsEscapeCache_[c] = goog.string.specialEscapeChars_[c]
  }
  var rv = c;
  var cc = c.charCodeAt(0);
  if(cc > 31 && cc < 127) {
    rv = c
  }else {
    if(cc < 256) {
      rv = "\\x";
      if(cc < 16 || cc > 256) {
        rv += "0"
      }
    }else {
      rv = "\\u";
      if(cc < 4096) {
        rv += "0"
      }
    }
    rv += cc.toString(16).toUpperCase()
  }
  return goog.string.jsEscapeCache_[c] = rv
};
goog.string.toMap = function(s) {
  var rv = {};
  for(var i = 0;i < s.length;i++) {
    rv[s.charAt(i)] = true
  }
  return rv
};
goog.string.contains = function(s, ss) {
  return s.indexOf(ss) != -1
};
goog.string.countOf = function(s, ss) {
  return s && ss ? s.split(ss).length - 1 : 0
};
goog.string.removeAt = function(s, index, stringLength) {
  var resultStr = s;
  if(index >= 0 && index < s.length && stringLength > 0) {
    resultStr = s.substr(0, index) + s.substr(index + stringLength, s.length - index - stringLength)
  }
  return resultStr
};
goog.string.remove = function(s, ss) {
  var re = new RegExp(goog.string.regExpEscape(ss), "");
  return s.replace(re, "")
};
goog.string.removeAll = function(s, ss) {
  var re = new RegExp(goog.string.regExpEscape(ss), "g");
  return s.replace(re, "")
};
goog.string.regExpEscape = function(s) {
  return String(s).replace(/([-()\[\]{}+?*.$\^|,:#<!\\])/g, "\\$1").replace(/\x08/g, "\\x08")
};
goog.string.repeat = function(string, length) {
  return(new Array(length + 1)).join(string)
};
goog.string.padNumber = function(num, length, opt_precision) {
  var s = goog.isDef(opt_precision) ? num.toFixed(opt_precision) : String(num);
  var index = s.indexOf(".");
  if(index == -1) {
    index = s.length
  }
  return goog.string.repeat("0", Math.max(0, length - index)) + s
};
goog.string.makeSafe = function(obj) {
  return obj == null ? "" : String(obj)
};
goog.string.buildString = function(var_args) {
  return Array.prototype.join.call(arguments, "")
};
goog.string.getRandomString = function() {
  var x = 2147483648;
  return Math.floor(Math.random() * x).toString(36) + Math.abs(Math.floor(Math.random() * x) ^ goog.now()).toString(36)
};
goog.string.compareVersions = function(version1, version2) {
  var order = 0;
  var v1Subs = goog.string.trim(String(version1)).split(".");
  var v2Subs = goog.string.trim(String(version2)).split(".");
  var subCount = Math.max(v1Subs.length, v2Subs.length);
  for(var subIdx = 0;order == 0 && subIdx < subCount;subIdx++) {
    var v1Sub = v1Subs[subIdx] || "";
    var v2Sub = v2Subs[subIdx] || "";
    var v1CompParser = new RegExp("(\\d*)(\\D*)", "g");
    var v2CompParser = new RegExp("(\\d*)(\\D*)", "g");
    do {
      var v1Comp = v1CompParser.exec(v1Sub) || ["", "", ""];
      var v2Comp = v2CompParser.exec(v2Sub) || ["", "", ""];
      if(v1Comp[0].length == 0 && v2Comp[0].length == 0) {
        break
      }
      var v1CompNum = v1Comp[1].length == 0 ? 0 : parseInt(v1Comp[1], 10);
      var v2CompNum = v2Comp[1].length == 0 ? 0 : parseInt(v2Comp[1], 10);
      order = goog.string.compareElements_(v1CompNum, v2CompNum) || goog.string.compareElements_(v1Comp[2].length == 0, v2Comp[2].length == 0) || goog.string.compareElements_(v1Comp[2], v2Comp[2])
    }while(order == 0)
  }
  return order
};
goog.string.compareElements_ = function(left, right) {
  if(left < right) {
    return-1
  }else {
    if(left > right) {
      return 1
    }
  }
  return 0
};
goog.string.HASHCODE_MAX_ = 4294967296;
goog.string.hashCode = function(str) {
  var result = 0;
  for(var i = 0;i < str.length;++i) {
    result = 31 * result + str.charCodeAt(i);
    result %= goog.string.HASHCODE_MAX_
  }
  return result
};
goog.string.uniqueStringCounter_ = Math.random() * 2147483648 | 0;
goog.string.createUniqueString = function() {
  return"goog_" + goog.string.uniqueStringCounter_++
};
goog.string.toNumber = function(str) {
  var num = Number(str);
  if(num == 0 && goog.string.isEmpty(str)) {
    return NaN
  }
  return num
};
goog.string.toCamelCase = function(str) {
  return String(str).replace(/\-([a-z])/g, function(all, match) {
    return match.toUpperCase()
  })
};
goog.string.toSelectorCase = function(str) {
  return String(str).replace(/([A-Z])/g, "-$1").toLowerCase()
};
goog.string.toTitleCase = function(str, opt_delimiters) {
  var delimiters = goog.isString(opt_delimiters) ? goog.string.regExpEscape(opt_delimiters) : "\\s";
  delimiters = delimiters ? "|[" + delimiters + "]+" : "";
  var regexp = new RegExp("(^" + delimiters + ")([a-z])", "g");
  return str.replace(regexp, function(all, p1, p2) {
    return p1 + p2.toUpperCase()
  })
};
goog.string.parseInt = function(value) {
  if(isFinite(value)) {
    value = String(value)
  }
  if(goog.isString(value)) {
    return/^\s*-?0x/i.test(value) ? parseInt(value, 16) : parseInt(value, 10)
  }
  return NaN
};
goog.provide("goog.asserts");
goog.provide("goog.asserts.AssertionError");
goog.require("goog.debug.Error");
goog.require("goog.string");
goog.asserts.ENABLE_ASSERTS = goog.DEBUG;
goog.asserts.AssertionError = function(messagePattern, messageArgs) {
  messageArgs.unshift(messagePattern);
  goog.debug.Error.call(this, goog.string.subs.apply(null, messageArgs));
  messageArgs.shift();
  this.messagePattern = messagePattern
};
goog.inherits(goog.asserts.AssertionError, goog.debug.Error);
goog.asserts.AssertionError.prototype.name = "AssertionError";
goog.asserts.doAssertFailure_ = function(defaultMessage, defaultArgs, givenMessage, givenArgs) {
  var message = "Assertion failed";
  if(givenMessage) {
    message += ": " + givenMessage;
    var args = givenArgs
  }else {
    if(defaultMessage) {
      message += ": " + defaultMessage;
      args = defaultArgs
    }
  }
  throw new goog.asserts.AssertionError("" + message, args || []);
};
goog.asserts.assert = function(condition, opt_message, var_args) {
  if(goog.asserts.ENABLE_ASSERTS && !condition) {
    goog.asserts.doAssertFailure_("", null, opt_message, Array.prototype.slice.call(arguments, 2))
  }
  return condition
};
goog.asserts.fail = function(opt_message, var_args) {
  if(goog.asserts.ENABLE_ASSERTS) {
    throw new goog.asserts.AssertionError("Failure" + (opt_message ? ": " + opt_message : ""), Array.prototype.slice.call(arguments, 1));
  }
};
goog.asserts.assertNumber = function(value, opt_message, var_args) {
  if(goog.asserts.ENABLE_ASSERTS && !goog.isNumber(value)) {
    goog.asserts.doAssertFailure_("Expected number but got %s: %s.", [goog.typeOf(value), value], opt_message, Array.prototype.slice.call(arguments, 2))
  }
  return(value)
};
goog.asserts.assertString = function(value, opt_message, var_args) {
  if(goog.asserts.ENABLE_ASSERTS && !goog.isString(value)) {
    goog.asserts.doAssertFailure_("Expected string but got %s: %s.", [goog.typeOf(value), value], opt_message, Array.prototype.slice.call(arguments, 2))
  }
  return(value)
};
goog.asserts.assertFunction = function(value, opt_message, var_args) {
  if(goog.asserts.ENABLE_ASSERTS && !goog.isFunction(value)) {
    goog.asserts.doAssertFailure_("Expected function but got %s: %s.", [goog.typeOf(value), value], opt_message, Array.prototype.slice.call(arguments, 2))
  }
  return(value)
};
goog.asserts.assertObject = function(value, opt_message, var_args) {
  if(goog.asserts.ENABLE_ASSERTS && !goog.isObject(value)) {
    goog.asserts.doAssertFailure_("Expected object but got %s: %s.", [goog.typeOf(value), value], opt_message, Array.prototype.slice.call(arguments, 2))
  }
  return(value)
};
goog.asserts.assertArray = function(value, opt_message, var_args) {
  if(goog.asserts.ENABLE_ASSERTS && !goog.isArray(value)) {
    goog.asserts.doAssertFailure_("Expected array but got %s: %s.", [goog.typeOf(value), value], opt_message, Array.prototype.slice.call(arguments, 2))
  }
  return(value)
};
goog.asserts.assertBoolean = function(value, opt_message, var_args) {
  if(goog.asserts.ENABLE_ASSERTS && !goog.isBoolean(value)) {
    goog.asserts.doAssertFailure_("Expected boolean but got %s: %s.", [goog.typeOf(value), value], opt_message, Array.prototype.slice.call(arguments, 2))
  }
  return(value)
};
goog.asserts.assertInstanceof = function(value, type, opt_message, var_args) {
  if(goog.asserts.ENABLE_ASSERTS && !(value instanceof type)) {
    goog.asserts.doAssertFailure_("instanceof check failed.", null, opt_message, Array.prototype.slice.call(arguments, 3))
  }
  return(value)
};
goog.provide("goog.array");
goog.provide("goog.array.ArrayLike");
goog.require("goog.asserts");
goog.NATIVE_ARRAY_PROTOTYPES = goog.TRUSTED_SITE;
goog.array.ArrayLike;
goog.array.peek = function(array) {
  return array[array.length - 1]
};
goog.array.ARRAY_PROTOTYPE_ = Array.prototype;
goog.array.indexOf = goog.NATIVE_ARRAY_PROTOTYPES && goog.array.ARRAY_PROTOTYPE_.indexOf ? function(arr, obj, opt_fromIndex) {
  goog.asserts.assert(arr.length != null);
  return goog.array.ARRAY_PROTOTYPE_.indexOf.call(arr, obj, opt_fromIndex)
} : function(arr, obj, opt_fromIndex) {
  var fromIndex = opt_fromIndex == null ? 0 : opt_fromIndex < 0 ? Math.max(0, arr.length + opt_fromIndex) : opt_fromIndex;
  if(goog.isString(arr)) {
    if(!goog.isString(obj) || obj.length != 1) {
      return-1
    }
    return arr.indexOf(obj, fromIndex)
  }
  for(var i = fromIndex;i < arr.length;i++) {
    if(i in arr && arr[i] === obj) {
      return i
    }
  }
  return-1
};
goog.array.lastIndexOf = goog.NATIVE_ARRAY_PROTOTYPES && goog.array.ARRAY_PROTOTYPE_.lastIndexOf ? function(arr, obj, opt_fromIndex) {
  goog.asserts.assert(arr.length != null);
  var fromIndex = opt_fromIndex == null ? arr.length - 1 : opt_fromIndex;
  return goog.array.ARRAY_PROTOTYPE_.lastIndexOf.call(arr, obj, fromIndex)
} : function(arr, obj, opt_fromIndex) {
  var fromIndex = opt_fromIndex == null ? arr.length - 1 : opt_fromIndex;
  if(fromIndex < 0) {
    fromIndex = Math.max(0, arr.length + fromIndex)
  }
  if(goog.isString(arr)) {
    if(!goog.isString(obj) || obj.length != 1) {
      return-1
    }
    return arr.lastIndexOf(obj, fromIndex)
  }
  for(var i = fromIndex;i >= 0;i--) {
    if(i in arr && arr[i] === obj) {
      return i
    }
  }
  return-1
};
goog.array.forEach = goog.NATIVE_ARRAY_PROTOTYPES && goog.array.ARRAY_PROTOTYPE_.forEach ? function(arr, f, opt_obj) {
  goog.asserts.assert(arr.length != null);
  goog.array.ARRAY_PROTOTYPE_.forEach.call(arr, f, opt_obj)
} : function(arr, f, opt_obj) {
  var l = arr.length;
  var arr2 = goog.isString(arr) ? arr.split("") : arr;
  for(var i = 0;i < l;i++) {
    if(i in arr2) {
      f.call(opt_obj, arr2[i], i, arr)
    }
  }
};
goog.array.forEachRight = function(arr, f, opt_obj) {
  var l = arr.length;
  var arr2 = goog.isString(arr) ? arr.split("") : arr;
  for(var i = l - 1;i >= 0;--i) {
    if(i in arr2) {
      f.call(opt_obj, arr2[i], i, arr)
    }
  }
};
goog.array.filter = goog.NATIVE_ARRAY_PROTOTYPES && goog.array.ARRAY_PROTOTYPE_.filter ? function(arr, f, opt_obj) {
  goog.asserts.assert(arr.length != null);
  return goog.array.ARRAY_PROTOTYPE_.filter.call(arr, f, opt_obj)
} : function(arr, f, opt_obj) {
  var l = arr.length;
  var res = [];
  var resLength = 0;
  var arr2 = goog.isString(arr) ? arr.split("") : arr;
  for(var i = 0;i < l;i++) {
    if(i in arr2) {
      var val = arr2[i];
      if(f.call(opt_obj, val, i, arr)) {
        res[resLength++] = val
      }
    }
  }
  return res
};
goog.array.map = goog.NATIVE_ARRAY_PROTOTYPES && goog.array.ARRAY_PROTOTYPE_.map ? function(arr, f, opt_obj) {
  goog.asserts.assert(arr.length != null);
  return goog.array.ARRAY_PROTOTYPE_.map.call(arr, f, opt_obj)
} : function(arr, f, opt_obj) {
  var l = arr.length;
  var res = new Array(l);
  var arr2 = goog.isString(arr) ? arr.split("") : arr;
  for(var i = 0;i < l;i++) {
    if(i in arr2) {
      res[i] = f.call(opt_obj, arr2[i], i, arr)
    }
  }
  return res
};
goog.array.reduce = function(arr, f, val, opt_obj) {
  if(arr.reduce) {
    if(opt_obj) {
      return arr.reduce(goog.bind(f, opt_obj), val)
    }else {
      return arr.reduce(f, val)
    }
  }
  var rval = val;
  goog.array.forEach(arr, function(val, index) {
    rval = f.call(opt_obj, rval, val, index, arr)
  });
  return rval
};
goog.array.reduceRight = function(arr, f, val, opt_obj) {
  if(arr.reduceRight) {
    if(opt_obj) {
      return arr.reduceRight(goog.bind(f, opt_obj), val)
    }else {
      return arr.reduceRight(f, val)
    }
  }
  var rval = val;
  goog.array.forEachRight(arr, function(val, index) {
    rval = f.call(opt_obj, rval, val, index, arr)
  });
  return rval
};
goog.array.some = goog.NATIVE_ARRAY_PROTOTYPES && goog.array.ARRAY_PROTOTYPE_.some ? function(arr, f, opt_obj) {
  goog.asserts.assert(arr.length != null);
  return goog.array.ARRAY_PROTOTYPE_.some.call(arr, f, opt_obj)
} : function(arr, f, opt_obj) {
  var l = arr.length;
  var arr2 = goog.isString(arr) ? arr.split("") : arr;
  for(var i = 0;i < l;i++) {
    if(i in arr2 && f.call(opt_obj, arr2[i], i, arr)) {
      return true
    }
  }
  return false
};
goog.array.every = goog.NATIVE_ARRAY_PROTOTYPES && goog.array.ARRAY_PROTOTYPE_.every ? function(arr, f, opt_obj) {
  goog.asserts.assert(arr.length != null);
  return goog.array.ARRAY_PROTOTYPE_.every.call(arr, f, opt_obj)
} : function(arr, f, opt_obj) {
  var l = arr.length;
  var arr2 = goog.isString(arr) ? arr.split("") : arr;
  for(var i = 0;i < l;i++) {
    if(i in arr2 && !f.call(opt_obj, arr2[i], i, arr)) {
      return false
    }
  }
  return true
};
goog.array.count = function(arr, f, opt_obj) {
  var count = 0;
  goog.array.forEach(arr, function(element, index, arr) {
    if(f.call(opt_obj, element, index, arr)) {
      ++count
    }
  }, opt_obj);
  return count
};
goog.array.find = function(arr, f, opt_obj) {
  var i = goog.array.findIndex(arr, f, opt_obj);
  return i < 0 ? null : goog.isString(arr) ? arr.charAt(i) : arr[i]
};
goog.array.findIndex = function(arr, f, opt_obj) {
  var l = arr.length;
  var arr2 = goog.isString(arr) ? arr.split("") : arr;
  for(var i = 0;i < l;i++) {
    if(i in arr2 && f.call(opt_obj, arr2[i], i, arr)) {
      return i
    }
  }
  return-1
};
goog.array.findRight = function(arr, f, opt_obj) {
  var i = goog.array.findIndexRight(arr, f, opt_obj);
  return i < 0 ? null : goog.isString(arr) ? arr.charAt(i) : arr[i]
};
goog.array.findIndexRight = function(arr, f, opt_obj) {
  var l = arr.length;
  var arr2 = goog.isString(arr) ? arr.split("") : arr;
  for(var i = l - 1;i >= 0;i--) {
    if(i in arr2 && f.call(opt_obj, arr2[i], i, arr)) {
      return i
    }
  }
  return-1
};
goog.array.contains = function(arr, obj) {
  return goog.array.indexOf(arr, obj) >= 0
};
goog.array.isEmpty = function(arr) {
  return arr.length == 0
};
goog.array.clear = function(arr) {
  if(!goog.isArray(arr)) {
    for(var i = arr.length - 1;i >= 0;i--) {
      delete arr[i]
    }
  }
  arr.length = 0
};
goog.array.insert = function(arr, obj) {
  if(!goog.array.contains(arr, obj)) {
    arr.push(obj)
  }
};
goog.array.insertAt = function(arr, obj, opt_i) {
  goog.array.splice(arr, opt_i, 0, obj)
};
goog.array.insertArrayAt = function(arr, elementsToAdd, opt_i) {
  goog.partial(goog.array.splice, arr, opt_i, 0).apply(null, elementsToAdd)
};
goog.array.insertBefore = function(arr, obj, opt_obj2) {
  var i;
  if(arguments.length == 2 || (i = goog.array.indexOf(arr, opt_obj2)) < 0) {
    arr.push(obj)
  }else {
    goog.array.insertAt(arr, obj, i)
  }
};
goog.array.remove = function(arr, obj) {
  var i = goog.array.indexOf(arr, obj);
  var rv;
  if(rv = i >= 0) {
    goog.array.removeAt(arr, i)
  }
  return rv
};
goog.array.removeAt = function(arr, i) {
  goog.asserts.assert(arr.length != null);
  return goog.array.ARRAY_PROTOTYPE_.splice.call(arr, i, 1).length == 1
};
goog.array.removeIf = function(arr, f, opt_obj) {
  var i = goog.array.findIndex(arr, f, opt_obj);
  if(i >= 0) {
    goog.array.removeAt(arr, i);
    return true
  }
  return false
};
goog.array.concat = function(var_args) {
  return goog.array.ARRAY_PROTOTYPE_.concat.apply(goog.array.ARRAY_PROTOTYPE_, arguments)
};
goog.array.toArray = function(object) {
  var length = object.length;
  if(length > 0) {
    var rv = new Array(length);
    for(var i = 0;i < length;i++) {
      rv[i] = object[i]
    }
    return rv
  }
  return[]
};
goog.array.clone = goog.array.toArray;
goog.array.extend = function(arr1, var_args) {
  for(var i = 1;i < arguments.length;i++) {
    var arr2 = arguments[i];
    var isArrayLike;
    if(goog.isArray(arr2) || (isArrayLike = goog.isArrayLike(arr2)) && Object.prototype.hasOwnProperty.call(arr2, "callee")) {
      arr1.push.apply(arr1, arr2)
    }else {
      if(isArrayLike) {
        var len1 = arr1.length;
        var len2 = arr2.length;
        for(var j = 0;j < len2;j++) {
          arr1[len1 + j] = arr2[j]
        }
      }else {
        arr1.push(arr2)
      }
    }
  }
};
goog.array.splice = function(arr, index, howMany, var_args) {
  goog.asserts.assert(arr.length != null);
  return goog.array.ARRAY_PROTOTYPE_.splice.apply(arr, goog.array.slice(arguments, 1))
};
goog.array.slice = function(arr, start, opt_end) {
  goog.asserts.assert(arr.length != null);
  if(arguments.length <= 2) {
    return goog.array.ARRAY_PROTOTYPE_.slice.call(arr, start)
  }else {
    return goog.array.ARRAY_PROTOTYPE_.slice.call(arr, start, opt_end)
  }
};
goog.array.removeDuplicates = function(arr, opt_rv) {
  var returnArray = opt_rv || arr;
  var seen = {}, cursorInsert = 0, cursorRead = 0;
  while(cursorRead < arr.length) {
    var current = arr[cursorRead++];
    var key = goog.isObject(current) ? "o" + goog.getUid(current) : (typeof current).charAt(0) + current;
    if(!Object.prototype.hasOwnProperty.call(seen, key)) {
      seen[key] = true;
      returnArray[cursorInsert++] = current
    }
  }
  returnArray.length = cursorInsert
};
goog.array.binarySearch = function(arr, target, opt_compareFn) {
  return goog.array.binarySearch_(arr, opt_compareFn || goog.array.defaultCompare, false, target)
};
goog.array.binarySelect = function(arr, evaluator, opt_obj) {
  return goog.array.binarySearch_(arr, evaluator, true, undefined, opt_obj)
};
goog.array.binarySearch_ = function(arr, compareFn, isEvaluator, opt_target, opt_selfObj) {
  var left = 0;
  var right = arr.length;
  var found;
  while(left < right) {
    var middle = left + right >> 1;
    var compareResult;
    if(isEvaluator) {
      compareResult = compareFn.call(opt_selfObj, arr[middle], middle, arr)
    }else {
      compareResult = compareFn(opt_target, arr[middle])
    }
    if(compareResult > 0) {
      left = middle + 1
    }else {
      right = middle;
      found = !compareResult
    }
  }
  return found ? left : ~left
};
goog.array.sort = function(arr, opt_compareFn) {
  goog.asserts.assert(arr.length != null);
  goog.array.ARRAY_PROTOTYPE_.sort.call(arr, opt_compareFn || goog.array.defaultCompare)
};
goog.array.stableSort = function(arr, opt_compareFn) {
  for(var i = 0;i < arr.length;i++) {
    arr[i] = {index:i, value:arr[i]}
  }
  var valueCompareFn = opt_compareFn || goog.array.defaultCompare;
  function stableCompareFn(obj1, obj2) {
    return valueCompareFn(obj1.value, obj2.value) || obj1.index - obj2.index
  }
  goog.array.sort(arr, stableCompareFn);
  for(var i = 0;i < arr.length;i++) {
    arr[i] = arr[i].value
  }
};
goog.array.sortObjectsByKey = function(arr, key, opt_compareFn) {
  var compare = opt_compareFn || goog.array.defaultCompare;
  goog.array.sort(arr, function(a, b) {
    return compare(a[key], b[key])
  })
};
goog.array.isSorted = function(arr, opt_compareFn, opt_strict) {
  var compare = opt_compareFn || goog.array.defaultCompare;
  for(var i = 1;i < arr.length;i++) {
    var compareResult = compare(arr[i - 1], arr[i]);
    if(compareResult > 0 || compareResult == 0 && opt_strict) {
      return false
    }
  }
  return true
};
goog.array.equals = function(arr1, arr2, opt_equalsFn) {
  if(!goog.isArrayLike(arr1) || !goog.isArrayLike(arr2) || arr1.length != arr2.length) {
    return false
  }
  var l = arr1.length;
  var equalsFn = opt_equalsFn || goog.array.defaultCompareEquality;
  for(var i = 0;i < l;i++) {
    if(!equalsFn(arr1[i], arr2[i])) {
      return false
    }
  }
  return true
};
goog.array.compare = function(arr1, arr2, opt_equalsFn) {
  return goog.array.equals(arr1, arr2, opt_equalsFn)
};
goog.array.compare3 = function(arr1, arr2, opt_compareFn) {
  var compare = opt_compareFn || goog.array.defaultCompare;
  var l = Math.min(arr1.length, arr2.length);
  for(var i = 0;i < l;i++) {
    var result = compare(arr1[i], arr2[i]);
    if(result != 0) {
      return result
    }
  }
  return goog.array.defaultCompare(arr1.length, arr2.length)
};
goog.array.defaultCompare = function(a, b) {
  return a > b ? 1 : a < b ? -1 : 0
};
goog.array.defaultCompareEquality = function(a, b) {
  return a === b
};
goog.array.binaryInsert = function(array, value, opt_compareFn) {
  var index = goog.array.binarySearch(array, value, opt_compareFn);
  if(index < 0) {
    goog.array.insertAt(array, value, -(index + 1));
    return true
  }
  return false
};
goog.array.binaryRemove = function(array, value, opt_compareFn) {
  var index = goog.array.binarySearch(array, value, opt_compareFn);
  return index >= 0 ? goog.array.removeAt(array, index) : false
};
goog.array.bucket = function(array, sorter) {
  var buckets = {};
  for(var i = 0;i < array.length;i++) {
    var value = array[i];
    var key = sorter(value, i, array);
    if(goog.isDef(key)) {
      var bucket = buckets[key] || (buckets[key] = []);
      bucket.push(value)
    }
  }
  return buckets
};
goog.array.toObject = function(arr, keyFunc, opt_obj) {
  var ret = {};
  goog.array.forEach(arr, function(element, index) {
    ret[keyFunc.call(opt_obj, element, index, arr)] = element
  });
  return ret
};
goog.array.range = function(startOrEnd, opt_end, opt_step) {
  var array = [];
  var start = 0;
  var end = startOrEnd;
  var step = opt_step || 1;
  if(opt_end !== undefined) {
    start = startOrEnd;
    end = opt_end
  }
  if(step * (end - start) < 0) {
    return[]
  }
  if(step > 0) {
    for(var i = start;i < end;i += step) {
      array.push(i)
    }
  }else {
    for(var i = start;i > end;i += step) {
      array.push(i)
    }
  }
  return array
};
goog.array.repeat = function(value, n) {
  var array = [];
  for(var i = 0;i < n;i++) {
    array[i] = value
  }
  return array
};
goog.array.flatten = function(var_args) {
  var result = [];
  for(var i = 0;i < arguments.length;i++) {
    var element = arguments[i];
    if(goog.isArray(element)) {
      result.push.apply(result, goog.array.flatten.apply(null, element))
    }else {
      result.push(element)
    }
  }
  return result
};
goog.array.rotate = function(array, n) {
  goog.asserts.assert(array.length != null);
  if(array.length) {
    n %= array.length;
    if(n > 0) {
      goog.array.ARRAY_PROTOTYPE_.unshift.apply(array, array.splice(-n, n))
    }else {
      if(n < 0) {
        goog.array.ARRAY_PROTOTYPE_.push.apply(array, array.splice(0, -n))
      }
    }
  }
  return array
};
goog.array.zip = function(var_args) {
  if(!arguments.length) {
    return[]
  }
  var result = [];
  for(var i = 0;true;i++) {
    var value = [];
    for(var j = 0;j < arguments.length;j++) {
      var arr = arguments[j];
      if(i >= arr.length) {
        return result
      }
      value.push(arr[i])
    }
    result.push(value)
  }
};
goog.array.shuffle = function(arr, opt_randFn) {
  var randFn = opt_randFn || Math.random;
  for(var i = arr.length - 1;i > 0;i--) {
    var j = Math.floor(randFn() * (i + 1));
    var tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp
  }
};
goog.provide("goog.object");
goog.object.forEach = function(obj, f, opt_obj) {
  for(var key in obj) {
    f.call(opt_obj, obj[key], key, obj)
  }
};
goog.object.filter = function(obj, f, opt_obj) {
  var res = {};
  for(var key in obj) {
    if(f.call(opt_obj, obj[key], key, obj)) {
      res[key] = obj[key]
    }
  }
  return res
};
goog.object.map = function(obj, f, opt_obj) {
  var res = {};
  for(var key in obj) {
    res[key] = f.call(opt_obj, obj[key], key, obj)
  }
  return res
};
goog.object.some = function(obj, f, opt_obj) {
  for(var key in obj) {
    if(f.call(opt_obj, obj[key], key, obj)) {
      return true
    }
  }
  return false
};
goog.object.every = function(obj, f, opt_obj) {
  for(var key in obj) {
    if(!f.call(opt_obj, obj[key], key, obj)) {
      return false
    }
  }
  return true
};
goog.object.getCount = function(obj) {
  var rv = 0;
  for(var key in obj) {
    rv++
  }
  return rv
};
goog.object.getAnyKey = function(obj) {
  for(var key in obj) {
    return key
  }
};
goog.object.getAnyValue = function(obj) {
  for(var key in obj) {
    return obj[key]
  }
};
goog.object.contains = function(obj, val) {
  return goog.object.containsValue(obj, val)
};
goog.object.getValues = function(obj) {
  var res = [];
  var i = 0;
  for(var key in obj) {
    res[i++] = obj[key]
  }
  return res
};
goog.object.getKeys = function(obj) {
  var res = [];
  var i = 0;
  for(var key in obj) {
    res[i++] = key
  }
  return res
};
goog.object.getValueByKeys = function(obj, var_args) {
  var isArrayLike = goog.isArrayLike(var_args);
  var keys = isArrayLike ? var_args : arguments;
  for(var i = isArrayLike ? 0 : 1;i < keys.length;i++) {
    obj = obj[keys[i]];
    if(!goog.isDef(obj)) {
      break
    }
  }
  return obj
};
goog.object.containsKey = function(obj, key) {
  return key in obj
};
goog.object.containsValue = function(obj, val) {
  for(var key in obj) {
    if(obj[key] == val) {
      return true
    }
  }
  return false
};
goog.object.findKey = function(obj, f, opt_this) {
  for(var key in obj) {
    if(f.call(opt_this, obj[key], key, obj)) {
      return key
    }
  }
  return undefined
};
goog.object.findValue = function(obj, f, opt_this) {
  var key = goog.object.findKey(obj, f, opt_this);
  return key && obj[key]
};
goog.object.isEmpty = function(obj) {
  for(var key in obj) {
    return false
  }
  return true
};
goog.object.clear = function(obj) {
  for(var i in obj) {
    delete obj[i]
  }
};
goog.object.remove = function(obj, key) {
  var rv;
  if(rv = key in obj) {
    delete obj[key]
  }
  return rv
};
goog.object.add = function(obj, key, val) {
  if(key in obj) {
    throw Error('The object already contains the key "' + key + '"');
  }
  goog.object.set(obj, key, val)
};
goog.object.get = function(obj, key, opt_val) {
  if(key in obj) {
    return obj[key]
  }
  return opt_val
};
goog.object.set = function(obj, key, value) {
  obj[key] = value
};
goog.object.setIfUndefined = function(obj, key, value) {
  return key in obj ? obj[key] : obj[key] = value
};
goog.object.clone = function(obj) {
  var res = {};
  for(var key in obj) {
    res[key] = obj[key]
  }
  return res
};
goog.object.unsafeClone = function(obj) {
  var type = goog.typeOf(obj);
  if(type == "object" || type == "array") {
    if(obj.clone) {
      return obj.clone()
    }
    var clone = type == "array" ? [] : {};
    for(var key in obj) {
      clone[key] = goog.object.unsafeClone(obj[key])
    }
    return clone
  }
  return obj
};
goog.object.transpose = function(obj) {
  var transposed = {};
  for(var key in obj) {
    transposed[obj[key]] = key
  }
  return transposed
};
goog.object.PROTOTYPE_FIELDS_ = ["constructor", "hasOwnProperty", "isPrototypeOf", "propertyIsEnumerable", "toLocaleString", "toString", "valueOf"];
goog.object.extend = function(target, var_args) {
  var key, source;
  for(var i = 1;i < arguments.length;i++) {
    source = arguments[i];
    for(key in source) {
      target[key] = source[key]
    }
    for(var j = 0;j < goog.object.PROTOTYPE_FIELDS_.length;j++) {
      key = goog.object.PROTOTYPE_FIELDS_[j];
      if(Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key]
      }
    }
  }
};
goog.object.create = function(var_args) {
  var argLength = arguments.length;
  if(argLength == 1 && goog.isArray(arguments[0])) {
    return goog.object.create.apply(null, arguments[0])
  }
  if(argLength % 2) {
    throw Error("Uneven number of arguments");
  }
  var rv = {};
  for(var i = 0;i < argLength;i += 2) {
    rv[arguments[i]] = arguments[i + 1]
  }
  return rv
};
goog.object.createSet = function(var_args) {
  var argLength = arguments.length;
  if(argLength == 1 && goog.isArray(arguments[0])) {
    return goog.object.createSet.apply(null, arguments[0])
  }
  var rv = {};
  for(var i = 0;i < argLength;i++) {
    rv[arguments[i]] = true
  }
  return rv
};
goog.object.createImmutableView = function(obj) {
  var result = obj;
  if(Object.isFrozen && !Object.isFrozen(obj)) {
    result = Object.create(obj);
    Object.freeze(result)
  }
  return result
};
goog.object.isImmutableView = function(obj) {
  return!!Object.isFrozen && Object.isFrozen(obj)
};
goog.provide("goog.structs");
goog.require("goog.array");
goog.require("goog.object");
goog.structs.getCount = function(col) {
  if(typeof col.getCount == "function") {
    return col.getCount()
  }
  if(goog.isArrayLike(col) || goog.isString(col)) {
    return col.length
  }
  return goog.object.getCount(col)
};
goog.structs.getValues = function(col) {
  if(typeof col.getValues == "function") {
    return col.getValues()
  }
  if(goog.isString(col)) {
    return col.split("")
  }
  if(goog.isArrayLike(col)) {
    var rv = [];
    var l = col.length;
    for(var i = 0;i < l;i++) {
      rv.push(col[i])
    }
    return rv
  }
  return goog.object.getValues(col)
};
goog.structs.getKeys = function(col) {
  if(typeof col.getKeys == "function") {
    return col.getKeys()
  }
  if(typeof col.getValues == "function") {
    return undefined
  }
  if(goog.isArrayLike(col) || goog.isString(col)) {
    var rv = [];
    var l = col.length;
    for(var i = 0;i < l;i++) {
      rv.push(i)
    }
    return rv
  }
  return goog.object.getKeys(col)
};
goog.structs.contains = function(col, val) {
  if(typeof col.contains == "function") {
    return col.contains(val)
  }
  if(typeof col.containsValue == "function") {
    return col.containsValue(val)
  }
  if(goog.isArrayLike(col) || goog.isString(col)) {
    return goog.array.contains((col), val)
  }
  return goog.object.containsValue(col, val)
};
goog.structs.isEmpty = function(col) {
  if(typeof col.isEmpty == "function") {
    return col.isEmpty()
  }
  if(goog.isArrayLike(col) || goog.isString(col)) {
    return goog.array.isEmpty((col))
  }
  return goog.object.isEmpty(col)
};
goog.structs.clear = function(col) {
  if(typeof col.clear == "function") {
    col.clear()
  }else {
    if(goog.isArrayLike(col)) {
      goog.array.clear((col))
    }else {
      goog.object.clear(col)
    }
  }
};
goog.structs.forEach = function(col, f, opt_obj) {
  if(typeof col.forEach == "function") {
    col.forEach(f, opt_obj)
  }else {
    if(goog.isArrayLike(col) || goog.isString(col)) {
      goog.array.forEach((col), f, opt_obj)
    }else {
      var keys = goog.structs.getKeys(col);
      var values = goog.structs.getValues(col);
      var l = values.length;
      for(var i = 0;i < l;i++) {
        f.call(opt_obj, values[i], keys && keys[i], col)
      }
    }
  }
};
goog.structs.filter = function(col, f, opt_obj) {
  if(typeof col.filter == "function") {
    return col.filter(f, opt_obj)
  }
  if(goog.isArrayLike(col) || goog.isString(col)) {
    return goog.array.filter((col), f, opt_obj)
  }
  var rv;
  var keys = goog.structs.getKeys(col);
  var values = goog.structs.getValues(col);
  var l = values.length;
  if(keys) {
    rv = {};
    for(var i = 0;i < l;i++) {
      if(f.call(opt_obj, values[i], keys[i], col)) {
        rv[keys[i]] = values[i]
      }
    }
  }else {
    rv = [];
    for(var i = 0;i < l;i++) {
      if(f.call(opt_obj, values[i], undefined, col)) {
        rv.push(values[i])
      }
    }
  }
  return rv
};
goog.structs.map = function(col, f, opt_obj) {
  if(typeof col.map == "function") {
    return col.map(f, opt_obj)
  }
  if(goog.isArrayLike(col) || goog.isString(col)) {
    return goog.array.map((col), f, opt_obj)
  }
  var rv;
  var keys = goog.structs.getKeys(col);
  var values = goog.structs.getValues(col);
  var l = values.length;
  if(keys) {
    rv = {};
    for(var i = 0;i < l;i++) {
      rv[keys[i]] = f.call(opt_obj, values[i], keys[i], col)
    }
  }else {
    rv = [];
    for(var i = 0;i < l;i++) {
      rv[i] = f.call(opt_obj, values[i], undefined, col)
    }
  }
  return rv
};
goog.structs.some = function(col, f, opt_obj) {
  if(typeof col.some == "function") {
    return col.some(f, opt_obj)
  }
  if(goog.isArrayLike(col) || goog.isString(col)) {
    return goog.array.some((col), f, opt_obj)
  }
  var keys = goog.structs.getKeys(col);
  var values = goog.structs.getValues(col);
  var l = values.length;
  for(var i = 0;i < l;i++) {
    if(f.call(opt_obj, values[i], keys && keys[i], col)) {
      return true
    }
  }
  return false
};
goog.structs.every = function(col, f, opt_obj) {
  if(typeof col.every == "function") {
    return col.every(f, opt_obj)
  }
  if(goog.isArrayLike(col) || goog.isString(col)) {
    return goog.array.every((col), f, opt_obj)
  }
  var keys = goog.structs.getKeys(col);
  var values = goog.structs.getValues(col);
  var l = values.length;
  for(var i = 0;i < l;i++) {
    if(!f.call(opt_obj, values[i], keys && keys[i], col)) {
      return false
    }
  }
  return true
};
goog.provide("goog.structs.Collection");
goog.structs.Collection = function() {
};
goog.structs.Collection.prototype.add;
goog.structs.Collection.prototype.remove;
goog.structs.Collection.prototype.contains;
goog.structs.Collection.prototype.getCount;
goog.provide("goog.iter");
goog.provide("goog.iter.Iterator");
goog.provide("goog.iter.StopIteration");
goog.require("goog.array");
goog.require("goog.asserts");
goog.iter.Iterable;
if("StopIteration" in goog.global) {
  goog.iter.StopIteration = goog.global["StopIteration"]
}else {
  goog.iter.StopIteration = Error("StopIteration")
}
goog.iter.Iterator = function() {
};
goog.iter.Iterator.prototype.next = function() {
  throw goog.iter.StopIteration;
};
goog.iter.Iterator.prototype.__iterator__ = function(opt_keys) {
  return this
};
goog.iter.toIterator = function(iterable) {
  if(iterable instanceof goog.iter.Iterator) {
    return iterable
  }
  if(typeof iterable.__iterator__ == "function") {
    return iterable.__iterator__(false)
  }
  if(goog.isArrayLike(iterable)) {
    var i = 0;
    var newIter = new goog.iter.Iterator;
    newIter.next = function() {
      while(true) {
        if(i >= iterable.length) {
          throw goog.iter.StopIteration;
        }
        if(!(i in iterable)) {
          i++;
          continue
        }
        return iterable[i++]
      }
    };
    return newIter
  }
  throw Error("Not implemented");
};
goog.iter.forEach = function(iterable, f, opt_obj) {
  if(goog.isArrayLike(iterable)) {
    try {
      goog.array.forEach((iterable), f, opt_obj)
    }catch(ex) {
      if(ex !== goog.iter.StopIteration) {
        throw ex;
      }
    }
  }else {
    iterable = goog.iter.toIterator(iterable);
    try {
      while(true) {
        f.call(opt_obj, iterable.next(), undefined, iterable)
      }
    }catch(ex) {
      if(ex !== goog.iter.StopIteration) {
        throw ex;
      }
    }
  }
};
goog.iter.filter = function(iterable, f, opt_obj) {
  var iterator = goog.iter.toIterator(iterable);
  var newIter = new goog.iter.Iterator;
  newIter.next = function() {
    while(true) {
      var val = iterator.next();
      if(f.call(opt_obj, val, undefined, iterator)) {
        return val
      }
    }
  };
  return newIter
};
goog.iter.range = function(startOrStop, opt_stop, opt_step) {
  var start = 0;
  var stop = startOrStop;
  var step = opt_step || 1;
  if(arguments.length > 1) {
    start = startOrStop;
    stop = opt_stop
  }
  if(step == 0) {
    throw Error("Range step argument must not be zero");
  }
  var newIter = new goog.iter.Iterator;
  newIter.next = function() {
    if(step > 0 && start >= stop || step < 0 && start <= stop) {
      throw goog.iter.StopIteration;
    }
    var rv = start;
    start += step;
    return rv
  };
  return newIter
};
goog.iter.join = function(iterable, deliminator) {
  return goog.iter.toArray(iterable).join(deliminator)
};
goog.iter.map = function(iterable, f, opt_obj) {
  var iterator = goog.iter.toIterator(iterable);
  var newIter = new goog.iter.Iterator;
  newIter.next = function() {
    while(true) {
      var val = iterator.next();
      return f.call(opt_obj, val, undefined, iterator)
    }
  };
  return newIter
};
goog.iter.reduce = function(iterable, f, val, opt_obj) {
  var rval = val;
  goog.iter.forEach(iterable, function(val) {
    rval = f.call(opt_obj, rval, val)
  });
  return rval
};
goog.iter.some = function(iterable, f, opt_obj) {
  iterable = goog.iter.toIterator(iterable);
  try {
    while(true) {
      if(f.call(opt_obj, iterable.next(), undefined, iterable)) {
        return true
      }
    }
  }catch(ex) {
    if(ex !== goog.iter.StopIteration) {
      throw ex;
    }
  }
  return false
};
goog.iter.every = function(iterable, f, opt_obj) {
  iterable = goog.iter.toIterator(iterable);
  try {
    while(true) {
      if(!f.call(opt_obj, iterable.next(), undefined, iterable)) {
        return false
      }
    }
  }catch(ex) {
    if(ex !== goog.iter.StopIteration) {
      throw ex;
    }
  }
  return true
};
goog.iter.chain = function(var_args) {
  var args = arguments;
  var length = args.length;
  var i = 0;
  var newIter = new goog.iter.Iterator;
  newIter.next = function() {
    try {
      if(i >= length) {
        throw goog.iter.StopIteration;
      }
      var current = goog.iter.toIterator(args[i]);
      return current.next()
    }catch(ex) {
      if(ex !== goog.iter.StopIteration || i >= length) {
        throw ex;
      }else {
        i++;
        return this.next()
      }
    }
  };
  return newIter
};
goog.iter.dropWhile = function(iterable, f, opt_obj) {
  var iterator = goog.iter.toIterator(iterable);
  var newIter = new goog.iter.Iterator;
  var dropping = true;
  newIter.next = function() {
    while(true) {
      var val = iterator.next();
      if(dropping && f.call(opt_obj, val, undefined, iterator)) {
        continue
      }else {
        dropping = false
      }
      return val
    }
  };
  return newIter
};
goog.iter.takeWhile = function(iterable, f, opt_obj) {
  var iterator = goog.iter.toIterator(iterable);
  var newIter = new goog.iter.Iterator;
  var taking = true;
  newIter.next = function() {
    while(true) {
      if(taking) {
        var val = iterator.next();
        if(f.call(opt_obj, val, undefined, iterator)) {
          return val
        }else {
          taking = false
        }
      }else {
        throw goog.iter.StopIteration;
      }
    }
  };
  return newIter
};
goog.iter.toArray = function(iterable) {
  if(goog.isArrayLike(iterable)) {
    return goog.array.toArray((iterable))
  }
  iterable = goog.iter.toIterator(iterable);
  var array = [];
  goog.iter.forEach(iterable, function(val) {
    array.push(val)
  });
  return array
};
goog.iter.equals = function(iterable1, iterable2) {
  iterable1 = goog.iter.toIterator(iterable1);
  iterable2 = goog.iter.toIterator(iterable2);
  var b1, b2;
  try {
    while(true) {
      b1 = b2 = false;
      var val1 = iterable1.next();
      b1 = true;
      var val2 = iterable2.next();
      b2 = true;
      if(val1 != val2) {
        return false
      }
    }
  }catch(ex) {
    if(ex !== goog.iter.StopIteration) {
      throw ex;
    }else {
      if(b1 && !b2) {
        return false
      }
      if(!b2) {
        try {
          val2 = iterable2.next();
          return false
        }catch(ex1) {
          if(ex1 !== goog.iter.StopIteration) {
            throw ex1;
          }
          return true
        }
      }
    }
  }
  return false
};
goog.iter.nextOrValue = function(iterable, defaultValue) {
  try {
    return goog.iter.toIterator(iterable).next()
  }catch(e) {
    if(e != goog.iter.StopIteration) {
      throw e;
    }
    return defaultValue
  }
};
goog.iter.product = function(var_args) {
  var someArrayEmpty = goog.array.some(arguments, function(arr) {
    return!arr.length
  });
  if(someArrayEmpty || !arguments.length) {
    return new goog.iter.Iterator
  }
  var iter = new goog.iter.Iterator;
  var arrays = arguments;
  var indicies = goog.array.repeat(0, arrays.length);
  iter.next = function() {
    if(indicies) {
      var retVal = goog.array.map(indicies, function(valueIndex, arrayIndex) {
        return arrays[arrayIndex][valueIndex]
      });
      for(var i = indicies.length - 1;i >= 0;i--) {
        goog.asserts.assert(indicies);
        if(indicies[i] < arrays[i].length - 1) {
          indicies[i]++;
          break
        }
        if(i == 0) {
          indicies = null;
          break
        }
        indicies[i] = 0
      }
      return retVal
    }
    throw goog.iter.StopIteration;
  };
  return iter
};
goog.iter.cycle = function(iterable) {
  var baseIterator = goog.iter.toIterator(iterable);
  var cache = [];
  var cacheIndex = 0;
  var iter = new goog.iter.Iterator;
  var useCache = false;
  iter.next = function() {
    var returnElement = null;
    if(!useCache) {
      try {
        returnElement = baseIterator.next();
        cache.push(returnElement);
        return returnElement
      }catch(e) {
        if(e != goog.iter.StopIteration || goog.array.isEmpty(cache)) {
          throw e;
        }
        useCache = true
      }
    }
    returnElement = cache[cacheIndex];
    cacheIndex = (cacheIndex + 1) % cache.length;
    return returnElement
  };
  return iter
};
goog.provide("goog.structs.Map");
goog.require("goog.iter.Iterator");
goog.require("goog.iter.StopIteration");
goog.require("goog.object");
goog.require("goog.structs");
goog.structs.Map = function(opt_map, var_args) {
  this.map_ = {};
  this.keys_ = [];
  var argLength = arguments.length;
  if(argLength > 1) {
    if(argLength % 2) {
      throw Error("Uneven number of arguments");
    }
    for(var i = 0;i < argLength;i += 2) {
      this.set(arguments[i], arguments[i + 1])
    }
  }else {
    if(opt_map) {
      this.addAll((opt_map))
    }
  }
};
goog.structs.Map.prototype.count_ = 0;
goog.structs.Map.prototype.version_ = 0;
goog.structs.Map.prototype.getCount = function() {
  return this.count_
};
goog.structs.Map.prototype.getValues = function() {
  this.cleanupKeysArray_();
  var rv = [];
  for(var i = 0;i < this.keys_.length;i++) {
    var key = this.keys_[i];
    rv.push(this.map_[key])
  }
  return rv
};
goog.structs.Map.prototype.getKeys = function() {
  this.cleanupKeysArray_();
  return(this.keys_.concat())
};
goog.structs.Map.prototype.containsKey = function(key) {
  return goog.structs.Map.hasKey_(this.map_, key)
};
goog.structs.Map.prototype.containsValue = function(val) {
  for(var i = 0;i < this.keys_.length;i++) {
    var key = this.keys_[i];
    if(goog.structs.Map.hasKey_(this.map_, key) && this.map_[key] == val) {
      return true
    }
  }
  return false
};
goog.structs.Map.prototype.equals = function(otherMap, opt_equalityFn) {
  if(this === otherMap) {
    return true
  }
  if(this.count_ != otherMap.getCount()) {
    return false
  }
  var equalityFn = opt_equalityFn || goog.structs.Map.defaultEquals;
  this.cleanupKeysArray_();
  for(var key, i = 0;key = this.keys_[i];i++) {
    if(!equalityFn(this.get(key), otherMap.get(key))) {
      return false
    }
  }
  return true
};
goog.structs.Map.defaultEquals = function(a, b) {
  return a === b
};
goog.structs.Map.prototype.isEmpty = function() {
  return this.count_ == 0
};
goog.structs.Map.prototype.clear = function() {
  this.map_ = {};
  this.keys_.length = 0;
  this.count_ = 0;
  this.version_ = 0
};
goog.structs.Map.prototype.remove = function(key) {
  if(goog.structs.Map.hasKey_(this.map_, key)) {
    delete this.map_[key];
    this.count_--;
    this.version_++;
    if(this.keys_.length > 2 * this.count_) {
      this.cleanupKeysArray_()
    }
    return true
  }
  return false
};
goog.structs.Map.prototype.cleanupKeysArray_ = function() {
  if(this.count_ != this.keys_.length) {
    var srcIndex = 0;
    var destIndex = 0;
    while(srcIndex < this.keys_.length) {
      var key = this.keys_[srcIndex];
      if(goog.structs.Map.hasKey_(this.map_, key)) {
        this.keys_[destIndex++] = key
      }
      srcIndex++
    }
    this.keys_.length = destIndex
  }
  if(this.count_ != this.keys_.length) {
    var seen = {};
    var srcIndex = 0;
    var destIndex = 0;
    while(srcIndex < this.keys_.length) {
      var key = this.keys_[srcIndex];
      if(!goog.structs.Map.hasKey_(seen, key)) {
        this.keys_[destIndex++] = key;
        seen[key] = 1
      }
      srcIndex++
    }
    this.keys_.length = destIndex
  }
};
goog.structs.Map.prototype.get = function(key, opt_val) {
  if(goog.structs.Map.hasKey_(this.map_, key)) {
    return this.map_[key]
  }
  return opt_val
};
goog.structs.Map.prototype.set = function(key, value) {
  if(!goog.structs.Map.hasKey_(this.map_, key)) {
    this.count_++;
    this.keys_.push(key);
    this.version_++
  }
  this.map_[key] = value
};
goog.structs.Map.prototype.addAll = function(map) {
  var keys, values;
  if(map instanceof goog.structs.Map) {
    keys = map.getKeys();
    values = map.getValues()
  }else {
    keys = goog.object.getKeys(map);
    values = goog.object.getValues(map)
  }
  for(var i = 0;i < keys.length;i++) {
    this.set(keys[i], values[i])
  }
};
goog.structs.Map.prototype.clone = function() {
  return new goog.structs.Map(this)
};
goog.structs.Map.prototype.transpose = function() {
  var transposed = new goog.structs.Map;
  for(var i = 0;i < this.keys_.length;i++) {
    var key = this.keys_[i];
    var value = this.map_[key];
    transposed.set(value, key)
  }
  return transposed
};
goog.structs.Map.prototype.toObject = function() {
  this.cleanupKeysArray_();
  var obj = {};
  for(var i = 0;i < this.keys_.length;i++) {
    var key = this.keys_[i];
    obj[key] = this.map_[key]
  }
  return obj
};
goog.structs.Map.prototype.getKeyIterator = function() {
  return this.__iterator__(true)
};
goog.structs.Map.prototype.getValueIterator = function() {
  return this.__iterator__(false)
};
goog.structs.Map.prototype.__iterator__ = function(opt_keys) {
  this.cleanupKeysArray_();
  var i = 0;
  var keys = this.keys_;
  var map = this.map_;
  var version = this.version_;
  var selfObj = this;
  var newIter = new goog.iter.Iterator;
  newIter.next = function() {
    while(true) {
      if(version != selfObj.version_) {
        throw Error("The map has changed since the iterator was created");
      }
      if(i >= keys.length) {
        throw goog.iter.StopIteration;
      }
      var key = keys[i++];
      return opt_keys ? key : map[key]
    }
  };
  return newIter
};
goog.structs.Map.hasKey_ = function(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key)
};
goog.provide("goog.structs.Set");
goog.require("goog.structs");
goog.require("goog.structs.Collection");
goog.require("goog.structs.Map");
goog.structs.Set = function(opt_values) {
  this.map_ = new goog.structs.Map;
  if(opt_values) {
    this.addAll(opt_values)
  }
};
goog.structs.Set.getKey_ = function(val) {
  var type = typeof val;
  if(type == "object" && val || type == "function") {
    return"o" + goog.getUid((val))
  }else {
    return type.substr(0, 1) + val
  }
};
goog.structs.Set.prototype.getCount = function() {
  return this.map_.getCount()
};
goog.structs.Set.prototype.add = function(element) {
  this.map_.set(goog.structs.Set.getKey_(element), element)
};
goog.structs.Set.prototype.addAll = function(col) {
  var values = goog.structs.getValues(col);
  var l = values.length;
  for(var i = 0;i < l;i++) {
    this.add(values[i])
  }
};
goog.structs.Set.prototype.removeAll = function(col) {
  var values = goog.structs.getValues(col);
  var l = values.length;
  for(var i = 0;i < l;i++) {
    this.remove(values[i])
  }
};
goog.structs.Set.prototype.remove = function(element) {
  return this.map_.remove(goog.structs.Set.getKey_(element))
};
goog.structs.Set.prototype.clear = function() {
  this.map_.clear()
};
goog.structs.Set.prototype.isEmpty = function() {
  return this.map_.isEmpty()
};
goog.structs.Set.prototype.contains = function(element) {
  return this.map_.containsKey(goog.structs.Set.getKey_(element))
};
goog.structs.Set.prototype.containsAll = function(col) {
  return goog.structs.every(col, this.contains, this)
};
goog.structs.Set.prototype.intersection = function(col) {
  var result = new goog.structs.Set;
  var values = goog.structs.getValues(col);
  for(var i = 0;i < values.length;i++) {
    var value = values[i];
    if(this.contains(value)) {
      result.add(value)
    }
  }
  return result
};
goog.structs.Set.prototype.difference = function(col) {
  var result = this.clone();
  result.removeAll(col);
  return result
};
goog.structs.Set.prototype.getValues = function() {
  return this.map_.getValues()
};
goog.structs.Set.prototype.clone = function() {
  return new goog.structs.Set(this)
};
goog.structs.Set.prototype.equals = function(col) {
  return this.getCount() == goog.structs.getCount(col) && this.isSubsetOf(col)
};
goog.structs.Set.prototype.isSubsetOf = function(col) {
  var colCount = goog.structs.getCount(col);
  if(this.getCount() > colCount) {
    return false
  }
  if(!(col instanceof goog.structs.Set) && colCount > 5) {
    col = new goog.structs.Set(col)
  }
  return goog.structs.every(this, function(value) {
    return goog.structs.contains(col, value)
  })
};
goog.structs.Set.prototype.__iterator__ = function(opt_keys) {
  return this.map_.__iterator__(false)
};
goog.provide("goog.userAgent");
goog.require("goog.string");
goog.userAgent.ASSUME_IE = false;
goog.userAgent.ASSUME_GECKO = false;
goog.userAgent.ASSUME_WEBKIT = false;
goog.userAgent.ASSUME_MOBILE_WEBKIT = false;
goog.userAgent.ASSUME_OPERA = false;
goog.userAgent.ASSUME_ANY_VERSION = false;
goog.userAgent.BROWSER_KNOWN_ = goog.userAgent.ASSUME_IE || goog.userAgent.ASSUME_GECKO || goog.userAgent.ASSUME_MOBILE_WEBKIT || goog.userAgent.ASSUME_WEBKIT || goog.userAgent.ASSUME_OPERA;
goog.userAgent.getUserAgentString = function() {
  return goog.global["navigator"] ? goog.global["navigator"].userAgent : null
};
goog.userAgent.getNavigator = function() {
  return goog.global["navigator"]
};
goog.userAgent.init_ = function() {
  goog.userAgent.detectedOpera_ = false;
  goog.userAgent.detectedIe_ = false;
  goog.userAgent.detectedWebkit_ = false;
  goog.userAgent.detectedMobile_ = false;
  goog.userAgent.detectedGecko_ = false;
  var ua;
  if(!goog.userAgent.BROWSER_KNOWN_ && (ua = goog.userAgent.getUserAgentString())) {
    var navigator = goog.userAgent.getNavigator();
    goog.userAgent.detectedOpera_ = ua.indexOf("Opera") == 0;
    goog.userAgent.detectedIe_ = !goog.userAgent.detectedOpera_ && ua.indexOf("MSIE") != -1;
    goog.userAgent.detectedWebkit_ = !goog.userAgent.detectedOpera_ && ua.indexOf("WebKit") != -1;
    goog.userAgent.detectedMobile_ = goog.userAgent.detectedWebkit_ && ua.indexOf("Mobile") != -1;
    goog.userAgent.detectedGecko_ = !goog.userAgent.detectedOpera_ && !goog.userAgent.detectedWebkit_ && navigator.product == "Gecko"
  }
};
if(!goog.userAgent.BROWSER_KNOWN_) {
  goog.userAgent.init_()
}
goog.userAgent.OPERA = goog.userAgent.BROWSER_KNOWN_ ? goog.userAgent.ASSUME_OPERA : goog.userAgent.detectedOpera_;
goog.userAgent.IE = goog.userAgent.BROWSER_KNOWN_ ? goog.userAgent.ASSUME_IE : goog.userAgent.detectedIe_;
goog.userAgent.GECKO = goog.userAgent.BROWSER_KNOWN_ ? goog.userAgent.ASSUME_GECKO : goog.userAgent.detectedGecko_;
goog.userAgent.WEBKIT = goog.userAgent.BROWSER_KNOWN_ ? goog.userAgent.ASSUME_WEBKIT || goog.userAgent.ASSUME_MOBILE_WEBKIT : goog.userAgent.detectedWebkit_;
goog.userAgent.MOBILE = goog.userAgent.ASSUME_MOBILE_WEBKIT || goog.userAgent.detectedMobile_;
goog.userAgent.SAFARI = goog.userAgent.WEBKIT;
goog.userAgent.determinePlatform_ = function() {
  var navigator = goog.userAgent.getNavigator();
  return navigator && navigator.platform || ""
};
goog.userAgent.PLATFORM = goog.userAgent.determinePlatform_();
goog.userAgent.ASSUME_MAC = false;
goog.userAgent.ASSUME_WINDOWS = false;
goog.userAgent.ASSUME_LINUX = false;
goog.userAgent.ASSUME_X11 = false;
goog.userAgent.ASSUME_ANDROID = false;
goog.userAgent.ASSUME_IPHONE = false;
goog.userAgent.ASSUME_IPAD = false;
goog.userAgent.PLATFORM_KNOWN_ = goog.userAgent.ASSUME_MAC || goog.userAgent.ASSUME_WINDOWS || goog.userAgent.ASSUME_LINUX || goog.userAgent.ASSUME_X11 || goog.userAgent.ASSUME_ANDROID || goog.userAgent.ASSUME_IPHONE || goog.userAgent.ASSUME_IPAD;
goog.userAgent.initPlatform_ = function() {
  goog.userAgent.detectedMac_ = goog.string.contains(goog.userAgent.PLATFORM, "Mac");
  goog.userAgent.detectedWindows_ = goog.string.contains(goog.userAgent.PLATFORM, "Win");
  goog.userAgent.detectedLinux_ = goog.string.contains(goog.userAgent.PLATFORM, "Linux");
  goog.userAgent.detectedX11_ = !!goog.userAgent.getNavigator() && goog.string.contains(goog.userAgent.getNavigator()["appVersion"] || "", "X11");
  var ua = goog.userAgent.getUserAgentString();
  goog.userAgent.detectedAndroid_ = !!ua && ua.indexOf("Android") >= 0;
  goog.userAgent.detectedIPhone_ = !!ua && ua.indexOf("iPhone") >= 0;
  goog.userAgent.detectedIPad_ = !!ua && ua.indexOf("iPad") >= 0
};
if(!goog.userAgent.PLATFORM_KNOWN_) {
  goog.userAgent.initPlatform_()
}
goog.userAgent.MAC = goog.userAgent.PLATFORM_KNOWN_ ? goog.userAgent.ASSUME_MAC : goog.userAgent.detectedMac_;
goog.userAgent.WINDOWS = goog.userAgent.PLATFORM_KNOWN_ ? goog.userAgent.ASSUME_WINDOWS : goog.userAgent.detectedWindows_;
goog.userAgent.LINUX = goog.userAgent.PLATFORM_KNOWN_ ? goog.userAgent.ASSUME_LINUX : goog.userAgent.detectedLinux_;
goog.userAgent.X11 = goog.userAgent.PLATFORM_KNOWN_ ? goog.userAgent.ASSUME_X11 : goog.userAgent.detectedX11_;
goog.userAgent.ANDROID = goog.userAgent.PLATFORM_KNOWN_ ? goog.userAgent.ASSUME_ANDROID : goog.userAgent.detectedAndroid_;
goog.userAgent.IPHONE = goog.userAgent.PLATFORM_KNOWN_ ? goog.userAgent.ASSUME_IPHONE : goog.userAgent.detectedIPhone_;
goog.userAgent.IPAD = goog.userAgent.PLATFORM_KNOWN_ ? goog.userAgent.ASSUME_IPAD : goog.userAgent.detectedIPad_;
goog.userAgent.determineVersion_ = function() {
  var version = "", re;
  if(goog.userAgent.OPERA && goog.global["opera"]) {
    var operaVersion = goog.global["opera"].version;
    version = typeof operaVersion == "function" ? operaVersion() : operaVersion
  }else {
    if(goog.userAgent.GECKO) {
      re = /rv\:([^\);]+)(\)|;)/
    }else {
      if(goog.userAgent.IE) {
        re = /MSIE\s+([^\);]+)(\)|;)/
      }else {
        if(goog.userAgent.WEBKIT) {
          re = /WebKit\/(\S+)/
        }
      }
    }
    if(re) {
      var arr = re.exec(goog.userAgent.getUserAgentString());
      version = arr ? arr[1] : ""
    }
  }
  if(goog.userAgent.IE) {
    var docMode = goog.userAgent.getDocumentMode_();
    if(docMode > parseFloat(version)) {
      return String(docMode)
    }
  }
  return version
};
goog.userAgent.getDocumentMode_ = function() {
  var doc = goog.global["document"];
  return doc ? doc["documentMode"] : undefined
};
goog.userAgent.VERSION = goog.userAgent.determineVersion_();
goog.userAgent.compare = function(v1, v2) {
  return goog.string.compareVersions(v1, v2)
};
goog.userAgent.isVersionOrHigherCache_ = {};
goog.userAgent.isVersionOrHigher = function(version) {
  return goog.userAgent.ASSUME_ANY_VERSION || goog.userAgent.isVersionOrHigherCache_[version] || (goog.userAgent.isVersionOrHigherCache_[version] = goog.string.compareVersions(goog.userAgent.VERSION, version) >= 0)
};
goog.userAgent.isVersion = goog.userAgent.isVersionOrHigher;
goog.userAgent.isDocumentModeOrHigher = function(documentMode) {
  return goog.userAgent.IE && goog.userAgent.DOCUMENT_MODE >= documentMode
};
goog.userAgent.isDocumentMode = goog.userAgent.isDocumentModeOrHigher;
goog.userAgent.DOCUMENT_MODE = function() {
  var doc = goog.global["document"];
  if(!doc || !goog.userAgent.IE) {
    return undefined
  }
  var mode = goog.userAgent.getDocumentMode_();
  return mode || (doc["compatMode"] == "CSS1Compat" ? parseInt(goog.userAgent.VERSION, 10) : 5)
}();
goog.provide("goog.debug");
goog.require("goog.array");
goog.require("goog.string");
goog.require("goog.structs.Set");
goog.require("goog.userAgent");
goog.debug.LOGGING_ENABLED = goog.DEBUG;
goog.debug.catchErrors = function(logFunc, opt_cancel, opt_target) {
  var target = opt_target || goog.global;
  var oldErrorHandler = target.onerror;
  var retVal = !!opt_cancel;
  if(goog.userAgent.WEBKIT && !goog.userAgent.isVersionOrHigher("535.3")) {
    retVal = !retVal
  }
  target.onerror = function(message, url, line) {
    if(oldErrorHandler) {
      oldErrorHandler(message, url, line)
    }
    logFunc({message:message, fileName:url, line:line});
    return retVal
  }
};
goog.debug.expose = function(obj, opt_showFn) {
  if(typeof obj == "undefined") {
    return"undefined"
  }
  if(obj == null) {
    return"NULL"
  }
  var str = [];
  for(var x in obj) {
    if(!opt_showFn && goog.isFunction(obj[x])) {
      continue
    }
    var s = x + " = ";
    try {
      s += obj[x]
    }catch(e) {
      s += "*** " + e + " ***"
    }
    str.push(s)
  }
  return str.join("\n")
};
goog.debug.deepExpose = function(obj, opt_showFn) {
  var previous = new goog.structs.Set;
  var str = [];
  var helper = function(obj, space) {
    var nestspace = space + "  ";
    var indentMultiline = function(str) {
      return str.replace(/\n/g, "\n" + space)
    };
    try {
      if(!goog.isDef(obj)) {
        str.push("undefined")
      }else {
        if(goog.isNull(obj)) {
          str.push("NULL")
        }else {
          if(goog.isString(obj)) {
            str.push('"' + indentMultiline(obj) + '"')
          }else {
            if(goog.isFunction(obj)) {
              str.push(indentMultiline(String(obj)))
            }else {
              if(goog.isObject(obj)) {
                if(previous.contains(obj)) {
                  str.push("*** reference loop detected ***")
                }else {
                  previous.add(obj);
                  str.push("{");
                  for(var x in obj) {
                    if(!opt_showFn && goog.isFunction(obj[x])) {
                      continue
                    }
                    str.push("\n");
                    str.push(nestspace);
                    str.push(x + " = ");
                    helper(obj[x], nestspace)
                  }
                  str.push("\n" + space + "}")
                }
              }else {
                str.push(obj)
              }
            }
          }
        }
      }
    }catch(e) {
      str.push("*** " + e + " ***")
    }
  };
  helper(obj, "");
  return str.join("")
};
goog.debug.exposeArray = function(arr) {
  var str = [];
  for(var i = 0;i < arr.length;i++) {
    if(goog.isArray(arr[i])) {
      str.push(goog.debug.exposeArray(arr[i]))
    }else {
      str.push(arr[i])
    }
  }
  return"[ " + str.join(", ") + " ]"
};
goog.debug.exposeException = function(err, opt_fn) {
  try {
    var e = goog.debug.normalizeErrorObject(err);
    var error = "Message: " + goog.string.htmlEscape(e.message) + '\nUrl: <a href="view-source:' + e.fileName + '" target="_new">' + e.fileName + "</a>\nLine: " + e.lineNumber + "\n\nBrowser stack:\n" + goog.string.htmlEscape(e.stack + "-> ") + "[end]\n\nJS stack traversal:\n" + goog.string.htmlEscape(goog.debug.getStacktrace(opt_fn) + "-> ");
    return error
  }catch(e2) {
    return"Exception trying to expose exception! You win, we lose. " + e2
  }
};
goog.debug.normalizeErrorObject = function(err) {
  var href = goog.getObjectByName("window.location.href");
  if(goog.isString(err)) {
    return{"message":err, "name":"Unknown error", "lineNumber":"Not available", "fileName":href, "stack":"Not available"}
  }
  var lineNumber, fileName;
  var threwError = false;
  try {
    lineNumber = err.lineNumber || err.line || "Not available"
  }catch(e) {
    lineNumber = "Not available";
    threwError = true
  }
  try {
    fileName = err.fileName || err.filename || err.sourceURL || goog.global["$googDebugFname"] || href
  }catch(e) {
    fileName = "Not available";
    threwError = true
  }
  if(threwError || !err.lineNumber || !err.fileName || !err.stack) {
    return{"message":err.message, "name":err.name, "lineNumber":lineNumber, "fileName":fileName, "stack":err.stack || "Not available"}
  }
  return err
};
goog.debug.enhanceError = function(err, opt_message) {
  var error = typeof err == "string" ? Error(err) : err;
  if(!error.stack) {
    error.stack = goog.debug.getStacktrace(arguments.callee.caller)
  }
  if(opt_message) {
    var x = 0;
    while(error["message" + x]) {
      ++x
    }
    error["message" + x] = String(opt_message)
  }
  return error
};
goog.debug.getStacktraceSimple = function(opt_depth) {
  var sb = [];
  var fn = arguments.callee.caller;
  var depth = 0;
  while(fn && (!opt_depth || depth < opt_depth)) {
    sb.push(goog.debug.getFunctionName(fn));
    sb.push("()\n");
    try {
      fn = fn.caller
    }catch(e) {
      sb.push("[exception trying to get caller]\n");
      break
    }
    depth++;
    if(depth >= goog.debug.MAX_STACK_DEPTH) {
      sb.push("[...long stack...]");
      break
    }
  }
  if(opt_depth && depth >= opt_depth) {
    sb.push("[...reached max depth limit...]")
  }else {
    sb.push("[end]")
  }
  return sb.join("")
};
goog.debug.MAX_STACK_DEPTH = 50;
goog.debug.getStacktrace = function(opt_fn) {
  return goog.debug.getStacktraceHelper_(opt_fn || arguments.callee.caller, [])
};
goog.debug.getStacktraceHelper_ = function(fn, visited) {
  var sb = [];
  if(goog.array.contains(visited, fn)) {
    sb.push("[...circular reference...]")
  }else {
    if(fn && visited.length < goog.debug.MAX_STACK_DEPTH) {
      sb.push(goog.debug.getFunctionName(fn) + "(");
      var args = fn.arguments;
      for(var i = 0;i < args.length;i++) {
        if(i > 0) {
          sb.push(", ")
        }
        var argDesc;
        var arg = args[i];
        switch(typeof arg) {
          case "object":
            argDesc = arg ? "object" : "null";
            break;
          case "string":
            argDesc = arg;
            break;
          case "number":
            argDesc = String(arg);
            break;
          case "boolean":
            argDesc = arg ? "true" : "false";
            break;
          case "function":
            argDesc = goog.debug.getFunctionName(arg);
            argDesc = argDesc ? argDesc : "[fn]";
            break;
          case "undefined":
          ;
          default:
            argDesc = typeof arg;
            break
        }
        if(argDesc.length > 40) {
          argDesc = argDesc.substr(0, 40) + "..."
        }
        sb.push(argDesc)
      }
      visited.push(fn);
      sb.push(")\n");
      try {
        sb.push(goog.debug.getStacktraceHelper_(fn.caller, visited))
      }catch(e) {
        sb.push("[exception trying to get caller]\n")
      }
    }else {
      if(fn) {
        sb.push("[...long stack...]")
      }else {
        sb.push("[end]")
      }
    }
  }
  return sb.join("")
};
goog.debug.setFunctionResolver = function(resolver) {
  goog.debug.fnNameResolver_ = resolver
};
goog.debug.getFunctionName = function(fn) {
  if(goog.debug.fnNameCache_[fn]) {
    return goog.debug.fnNameCache_[fn]
  }
  if(goog.debug.fnNameResolver_) {
    var name = goog.debug.fnNameResolver_(fn);
    if(name) {
      goog.debug.fnNameCache_[fn] = name;
      return name
    }
  }
  var functionSource = String(fn);
  if(!goog.debug.fnNameCache_[functionSource]) {
    var matches = /function ([^\(]+)/.exec(functionSource);
    if(matches) {
      var method = matches[1];
      goog.debug.fnNameCache_[functionSource] = method
    }else {
      goog.debug.fnNameCache_[functionSource] = "[Anonymous]"
    }
  }
  return goog.debug.fnNameCache_[functionSource]
};
goog.debug.makeWhitespaceVisible = function(string) {
  return string.replace(/ /g, "[_]").replace(/\f/g, "[f]").replace(/\n/g, "[n]\n").replace(/\r/g, "[r]").replace(/\t/g, "[t]")
};
goog.debug.fnNameCache_ = {};
goog.debug.fnNameResolver_;
goog.provide("goog.debug.LogRecord");
goog.debug.LogRecord = function(level, msg, loggerName, opt_time, opt_sequenceNumber) {
  this.reset(level, msg, loggerName, opt_time, opt_sequenceNumber)
};
goog.debug.LogRecord.prototype.time_;
goog.debug.LogRecord.prototype.level_;
goog.debug.LogRecord.prototype.msg_;
goog.debug.LogRecord.prototype.loggerName_;
goog.debug.LogRecord.prototype.sequenceNumber_ = 0;
goog.debug.LogRecord.prototype.exception_ = null;
goog.debug.LogRecord.prototype.exceptionText_ = null;
goog.debug.LogRecord.ENABLE_SEQUENCE_NUMBERS = true;
goog.debug.LogRecord.nextSequenceNumber_ = 0;
goog.debug.LogRecord.prototype.reset = function(level, msg, loggerName, opt_time, opt_sequenceNumber) {
  if(goog.debug.LogRecord.ENABLE_SEQUENCE_NUMBERS) {
    this.sequenceNumber_ = typeof opt_sequenceNumber == "number" ? opt_sequenceNumber : goog.debug.LogRecord.nextSequenceNumber_++
  }
  this.time_ = opt_time || goog.now();
  this.level_ = level;
  this.msg_ = msg;
  this.loggerName_ = loggerName;
  delete this.exception_;
  delete this.exceptionText_
};
goog.debug.LogRecord.prototype.getLoggerName = function() {
  return this.loggerName_
};
goog.debug.LogRecord.prototype.getException = function() {
  return this.exception_
};
goog.debug.LogRecord.prototype.setException = function(exception) {
  this.exception_ = exception
};
goog.debug.LogRecord.prototype.getExceptionText = function() {
  return this.exceptionText_
};
goog.debug.LogRecord.prototype.setExceptionText = function(text) {
  this.exceptionText_ = text
};
goog.debug.LogRecord.prototype.setLoggerName = function(loggerName) {
  this.loggerName_ = loggerName
};
goog.debug.LogRecord.prototype.getLevel = function() {
  return this.level_
};
goog.debug.LogRecord.prototype.setLevel = function(level) {
  this.level_ = level
};
goog.debug.LogRecord.prototype.getMessage = function() {
  return this.msg_
};
goog.debug.LogRecord.prototype.setMessage = function(msg) {
  this.msg_ = msg
};
goog.debug.LogRecord.prototype.getMillis = function() {
  return this.time_
};
goog.debug.LogRecord.prototype.setMillis = function(time) {
  this.time_ = time
};
goog.debug.LogRecord.prototype.getSequenceNumber = function() {
  return this.sequenceNumber_
};
goog.provide("goog.debug.LogBuffer");
goog.require("goog.asserts");
goog.require("goog.debug.LogRecord");
goog.debug.LogBuffer = function() {
  goog.asserts.assert(goog.debug.LogBuffer.isBufferingEnabled(), "Cannot use goog.debug.LogBuffer without defining " + "goog.debug.LogBuffer.CAPACITY.");
  this.clear()
};
goog.debug.LogBuffer.getInstance = function() {
  if(!goog.debug.LogBuffer.instance_) {
    goog.debug.LogBuffer.instance_ = new goog.debug.LogBuffer
  }
  return goog.debug.LogBuffer.instance_
};
goog.debug.LogBuffer.CAPACITY = 0;
goog.debug.LogBuffer.prototype.buffer_;
goog.debug.LogBuffer.prototype.curIndex_;
goog.debug.LogBuffer.prototype.isFull_;
goog.debug.LogBuffer.prototype.addRecord = function(level, msg, loggerName) {
  var curIndex = (this.curIndex_ + 1) % goog.debug.LogBuffer.CAPACITY;
  this.curIndex_ = curIndex;
  if(this.isFull_) {
    var ret = this.buffer_[curIndex];
    ret.reset(level, msg, loggerName);
    return ret
  }
  this.isFull_ = curIndex == goog.debug.LogBuffer.CAPACITY - 1;
  return this.buffer_[curIndex] = new goog.debug.LogRecord(level, msg, loggerName)
};
goog.debug.LogBuffer.isBufferingEnabled = function() {
  return goog.debug.LogBuffer.CAPACITY > 0
};
goog.debug.LogBuffer.prototype.clear = function() {
  this.buffer_ = new Array(goog.debug.LogBuffer.CAPACITY);
  this.curIndex_ = -1;
  this.isFull_ = false
};
goog.debug.LogBuffer.prototype.forEachRecord = function(func) {
  var buffer = this.buffer_;
  if(!buffer[0]) {
    return
  }
  var curIndex = this.curIndex_;
  var i = this.isFull_ ? curIndex : -1;
  do {
    i = (i + 1) % goog.debug.LogBuffer.CAPACITY;
    func((buffer[i]))
  }while(i != curIndex)
};
goog.provide("goog.debug.LogManager");
goog.provide("goog.debug.Logger");
goog.provide("goog.debug.Logger.Level");
goog.require("goog.array");
goog.require("goog.asserts");
goog.require("goog.debug");
goog.require("goog.debug.LogBuffer");
goog.require("goog.debug.LogRecord");
goog.debug.Logger = function(name) {
  this.name_ = name
};
goog.debug.Logger.prototype.parent_ = null;
goog.debug.Logger.prototype.level_ = null;
goog.debug.Logger.prototype.children_ = null;
goog.debug.Logger.prototype.handlers_ = null;
goog.debug.Logger.ENABLE_HIERARCHY = true;
if(!goog.debug.Logger.ENABLE_HIERARCHY) {
  goog.debug.Logger.rootHandlers_ = [];
  goog.debug.Logger.rootLevel_
}
goog.debug.Logger.Level = function(name, value) {
  this.name = name;
  this.value = value
};
goog.debug.Logger.Level.prototype.toString = function() {
  return this.name
};
goog.debug.Logger.Level.OFF = new goog.debug.Logger.Level("OFF", Infinity);
goog.debug.Logger.Level.SHOUT = new goog.debug.Logger.Level("SHOUT", 1200);
goog.debug.Logger.Level.SEVERE = new goog.debug.Logger.Level("SEVERE", 1E3);
goog.debug.Logger.Level.WARNING = new goog.debug.Logger.Level("WARNING", 900);
goog.debug.Logger.Level.INFO = new goog.debug.Logger.Level("INFO", 800);
goog.debug.Logger.Level.CONFIG = new goog.debug.Logger.Level("CONFIG", 700);
goog.debug.Logger.Level.FINE = new goog.debug.Logger.Level("FINE", 500);
goog.debug.Logger.Level.FINER = new goog.debug.Logger.Level("FINER", 400);
goog.debug.Logger.Level.FINEST = new goog.debug.Logger.Level("FINEST", 300);
goog.debug.Logger.Level.ALL = new goog.debug.Logger.Level("ALL", 0);
goog.debug.Logger.Level.PREDEFINED_LEVELS = [goog.debug.Logger.Level.OFF, goog.debug.Logger.Level.SHOUT, goog.debug.Logger.Level.SEVERE, goog.debug.Logger.Level.WARNING, goog.debug.Logger.Level.INFO, goog.debug.Logger.Level.CONFIG, goog.debug.Logger.Level.FINE, goog.debug.Logger.Level.FINER, goog.debug.Logger.Level.FINEST, goog.debug.Logger.Level.ALL];
goog.debug.Logger.Level.predefinedLevelsCache_ = null;
goog.debug.Logger.Level.createPredefinedLevelsCache_ = function() {
  goog.debug.Logger.Level.predefinedLevelsCache_ = {};
  for(var i = 0, level;level = goog.debug.Logger.Level.PREDEFINED_LEVELS[i];i++) {
    goog.debug.Logger.Level.predefinedLevelsCache_[level.value] = level;
    goog.debug.Logger.Level.predefinedLevelsCache_[level.name] = level
  }
};
goog.debug.Logger.Level.getPredefinedLevel = function(name) {
  if(!goog.debug.Logger.Level.predefinedLevelsCache_) {
    goog.debug.Logger.Level.createPredefinedLevelsCache_()
  }
  return goog.debug.Logger.Level.predefinedLevelsCache_[name] || null
};
goog.debug.Logger.Level.getPredefinedLevelByValue = function(value) {
  if(!goog.debug.Logger.Level.predefinedLevelsCache_) {
    goog.debug.Logger.Level.createPredefinedLevelsCache_()
  }
  if(value in goog.debug.Logger.Level.predefinedLevelsCache_) {
    return goog.debug.Logger.Level.predefinedLevelsCache_[value]
  }
  for(var i = 0;i < goog.debug.Logger.Level.PREDEFINED_LEVELS.length;++i) {
    var level = goog.debug.Logger.Level.PREDEFINED_LEVELS[i];
    if(level.value <= value) {
      return level
    }
  }
  return null
};
goog.debug.Logger.getLogger = function(name) {
  return goog.debug.LogManager.getLogger(name)
};
goog.debug.Logger.logToProfilers = function(msg) {
  if(goog.global["console"]) {
    if(goog.global["console"]["timeStamp"]) {
      goog.global["console"]["timeStamp"](msg)
    }else {
      if(goog.global["console"]["markTimeline"]) {
        goog.global["console"]["markTimeline"](msg)
      }
    }
  }
  if(goog.global["msWriteProfilerMark"]) {
    goog.global["msWriteProfilerMark"](msg)
  }
};
goog.debug.Logger.prototype.getName = function() {
  return this.name_
};
goog.debug.Logger.prototype.addHandler = function(handler) {
  if(goog.debug.LOGGING_ENABLED) {
    if(goog.debug.Logger.ENABLE_HIERARCHY) {
      if(!this.handlers_) {
        this.handlers_ = []
      }
      this.handlers_.push(handler)
    }else {
      goog.asserts.assert(!this.name_, "Cannot call addHandler on a non-root logger when " + "goog.debug.Logger.ENABLE_HIERARCHY is false.");
      goog.debug.Logger.rootHandlers_.push(handler)
    }
  }
};
goog.debug.Logger.prototype.removeHandler = function(handler) {
  if(goog.debug.LOGGING_ENABLED) {
    var handlers = goog.debug.Logger.ENABLE_HIERARCHY ? this.handlers_ : goog.debug.Logger.rootHandlers_;
    return!!handlers && goog.array.remove(handlers, handler)
  }else {
    return false
  }
};
goog.debug.Logger.prototype.getParent = function() {
  return this.parent_
};
goog.debug.Logger.prototype.getChildren = function() {
  if(!this.children_) {
    this.children_ = {}
  }
  return this.children_
};
goog.debug.Logger.prototype.setLevel = function(level) {
  if(goog.debug.LOGGING_ENABLED) {
    if(goog.debug.Logger.ENABLE_HIERARCHY) {
      this.level_ = level
    }else {
      goog.asserts.assert(!this.name_, "Cannot call setLevel() on a non-root logger when " + "goog.debug.Logger.ENABLE_HIERARCHY is false.");
      goog.debug.Logger.rootLevel_ = level
    }
  }
};
goog.debug.Logger.prototype.getLevel = function() {
  return goog.debug.LOGGING_ENABLED ? this.level_ : goog.debug.Logger.Level.OFF
};
goog.debug.Logger.prototype.getEffectiveLevel = function() {
  if(!goog.debug.LOGGING_ENABLED) {
    return goog.debug.Logger.Level.OFF
  }
  if(!goog.debug.Logger.ENABLE_HIERARCHY) {
    return goog.debug.Logger.rootLevel_
  }
  if(this.level_) {
    return this.level_
  }
  if(this.parent_) {
    return this.parent_.getEffectiveLevel()
  }
  goog.asserts.fail("Root logger has no level set.");
  return null
};
goog.debug.Logger.prototype.isLoggable = function(level) {
  return goog.debug.LOGGING_ENABLED && level.value >= this.getEffectiveLevel().value
};
goog.debug.Logger.prototype.log = function(level, msg, opt_exception) {
  if(goog.debug.LOGGING_ENABLED && this.isLoggable(level)) {
    this.doLogRecord_(this.getLogRecord(level, msg, opt_exception))
  }
};
goog.debug.Logger.prototype.getLogRecord = function(level, msg, opt_exception) {
  if(goog.debug.LogBuffer.isBufferingEnabled()) {
    var logRecord = goog.debug.LogBuffer.getInstance().addRecord(level, msg, this.name_)
  }else {
    logRecord = new goog.debug.LogRecord(level, String(msg), this.name_)
  }
  if(opt_exception) {
    logRecord.setException(opt_exception);
    logRecord.setExceptionText(goog.debug.exposeException(opt_exception, arguments.callee.caller))
  }
  return logRecord
};
goog.debug.Logger.prototype.shout = function(msg, opt_exception) {
  if(goog.debug.LOGGING_ENABLED) {
    this.log(goog.debug.Logger.Level.SHOUT, msg, opt_exception)
  }
};
goog.debug.Logger.prototype.severe = function(msg, opt_exception) {
  if(goog.debug.LOGGING_ENABLED) {
    this.log(goog.debug.Logger.Level.SEVERE, msg, opt_exception)
  }
};
goog.debug.Logger.prototype.warning = function(msg, opt_exception) {
  if(goog.debug.LOGGING_ENABLED) {
    this.log(goog.debug.Logger.Level.WARNING, msg, opt_exception)
  }
};
goog.debug.Logger.prototype.info = function(msg, opt_exception) {
  if(goog.debug.LOGGING_ENABLED) {
    this.log(goog.debug.Logger.Level.INFO, msg, opt_exception)
  }
};
goog.debug.Logger.prototype.config = function(msg, opt_exception) {
  if(goog.debug.LOGGING_ENABLED) {
    this.log(goog.debug.Logger.Level.CONFIG, msg, opt_exception)
  }
};
goog.debug.Logger.prototype.fine = function(msg, opt_exception) {
  if(goog.debug.LOGGING_ENABLED) {
    this.log(goog.debug.Logger.Level.FINE, msg, opt_exception)
  }
};
goog.debug.Logger.prototype.finer = function(msg, opt_exception) {
  if(goog.debug.LOGGING_ENABLED) {
    this.log(goog.debug.Logger.Level.FINER, msg, opt_exception)
  }
};
goog.debug.Logger.prototype.finest = function(msg, opt_exception) {
  if(goog.debug.LOGGING_ENABLED) {
    this.log(goog.debug.Logger.Level.FINEST, msg, opt_exception)
  }
};
goog.debug.Logger.prototype.logRecord = function(logRecord) {
  if(goog.debug.LOGGING_ENABLED && this.isLoggable(logRecord.getLevel())) {
    this.doLogRecord_(logRecord)
  }
};
goog.debug.Logger.prototype.doLogRecord_ = function(logRecord) {
  goog.debug.Logger.logToProfilers("log:" + logRecord.getMessage());
  if(goog.debug.Logger.ENABLE_HIERARCHY) {
    var target = this;
    while(target) {
      target.callPublish_(logRecord);
      target = target.getParent()
    }
  }else {
    for(var i = 0, handler;handler = goog.debug.Logger.rootHandlers_[i++];) {
      handler(logRecord)
    }
  }
};
goog.debug.Logger.prototype.callPublish_ = function(logRecord) {
  if(this.handlers_) {
    for(var i = 0, handler;handler = this.handlers_[i];i++) {
      handler(logRecord)
    }
  }
};
goog.debug.Logger.prototype.setParent_ = function(parent) {
  this.parent_ = parent
};
goog.debug.Logger.prototype.addChild_ = function(name, logger) {
  this.getChildren()[name] = logger
};
goog.debug.LogManager = {};
goog.debug.LogManager.loggers_ = {};
goog.debug.LogManager.rootLogger_ = null;
goog.debug.LogManager.initialize = function() {
  if(!goog.debug.LogManager.rootLogger_) {
    goog.debug.LogManager.rootLogger_ = new goog.debug.Logger("");
    goog.debug.LogManager.loggers_[""] = goog.debug.LogManager.rootLogger_;
    goog.debug.LogManager.rootLogger_.setLevel(goog.debug.Logger.Level.CONFIG)
  }
};
goog.debug.LogManager.getLoggers = function() {
  return goog.debug.LogManager.loggers_
};
goog.debug.LogManager.getRoot = function() {
  goog.debug.LogManager.initialize();
  return(goog.debug.LogManager.rootLogger_)
};
goog.debug.LogManager.getLogger = function(name) {
  goog.debug.LogManager.initialize();
  var ret = goog.debug.LogManager.loggers_[name];
  return ret || goog.debug.LogManager.createLogger_(name)
};
goog.debug.LogManager.createFunctionForCatchErrors = function(opt_logger) {
  return function(info) {
    var logger = opt_logger || goog.debug.LogManager.getRoot();
    logger.severe("Error: " + info.message + " (" + info.fileName + " @ Line: " + info.line + ")")
  }
};
goog.debug.LogManager.createLogger_ = function(name) {
  var logger = new goog.debug.Logger(name);
  if(goog.debug.Logger.ENABLE_HIERARCHY) {
    var lastDotIndex = name.lastIndexOf(".");
    var parentName = name.substr(0, lastDotIndex);
    var leafName = name.substr(lastDotIndex + 1);
    var parentLogger = goog.debug.LogManager.getLogger(parentName);
    parentLogger.addChild_(leafName, logger);
    logger.setParent_(parentLogger)
  }
  goog.debug.LogManager.loggers_[name] = logger;
  return logger
};
goog.provide("goog.functions");
goog.functions.constant = function(retValue) {
  return function() {
    return retValue
  }
};
goog.functions.FALSE = goog.functions.constant(false);
goog.functions.TRUE = goog.functions.constant(true);
goog.functions.NULL = goog.functions.constant(null);
goog.functions.identity = function(opt_returnValue, var_args) {
  return opt_returnValue
};
goog.functions.error = function(message) {
  return function() {
    throw Error(message);
  }
};
goog.functions.fail = function(err) {
  return function() {
    throw err;
  }
};
goog.functions.lock = function(f, opt_numArgs) {
  opt_numArgs = opt_numArgs || 0;
  return function() {
    return f.apply(this, Array.prototype.slice.call(arguments, 0, opt_numArgs))
  }
};
goog.functions.withReturnValue = function(f, retValue) {
  return goog.functions.sequence(f, goog.functions.constant(retValue))
};
goog.functions.compose = function(fn, var_args) {
  var functions = arguments;
  var length = functions.length;
  return function() {
    var result;
    if(length) {
      result = functions[length - 1].apply(this, arguments)
    }
    for(var i = length - 2;i >= 0;i--) {
      result = functions[i].call(this, result)
    }
    return result
  }
};
goog.functions.sequence = function(var_args) {
  var functions = arguments;
  var length = functions.length;
  return function() {
    var result;
    for(var i = 0;i < length;i++) {
      result = functions[i].apply(this, arguments)
    }
    return result
  }
};
goog.functions.and = function(var_args) {
  var functions = arguments;
  var length = functions.length;
  return function() {
    for(var i = 0;i < length;i++) {
      if(!functions[i].apply(this, arguments)) {
        return false
      }
    }
    return true
  }
};
goog.functions.or = function(var_args) {
  var functions = arguments;
  var length = functions.length;
  return function() {
    for(var i = 0;i < length;i++) {
      if(functions[i].apply(this, arguments)) {
        return true
      }
    }
    return false
  }
};
goog.functions.not = function(f) {
  return function() {
    return!f.apply(this, arguments)
  }
};
goog.functions.create = function(constructor, var_args) {
  var temp = function() {
  };
  temp.prototype = constructor.prototype;
  var obj = new temp;
  constructor.apply(obj, Array.prototype.slice.call(arguments, 1));
  return obj
};
/*
 Portions of this code are from MochiKit, received by
 The Closure Authors under the MIT license. All other code is Copyright
 2005-2009 The Closure Authors. All Rights Reserved.
*/
goog.provide("goog.async.Deferred");
goog.provide("goog.async.Deferred.AlreadyCalledError");
goog.provide("goog.async.Deferred.CanceledError");
goog.provide("goog.async.Deferred.CancelledError");
goog.require("goog.array");
goog.require("goog.asserts");
goog.require("goog.debug.Error");
goog.require("goog.functions");
goog.async.Deferred = function(opt_onCancelFunction, opt_defaultScope) {
  this.sequence_ = [];
  this.onCancelFunction_ = opt_onCancelFunction;
  this.defaultScope_ = opt_defaultScope || null
};
goog.async.Deferred.prototype.fired_ = false;
goog.async.Deferred.prototype.hadError_ = false;
goog.async.Deferred.prototype.result_;
goog.async.Deferred.prototype.blocked_ = false;
goog.async.Deferred.prototype.blocking_ = false;
goog.async.Deferred.prototype.silentlyCanceled_ = false;
goog.async.Deferred.prototype.unhandledExceptionTimeoutId_;
goog.async.Deferred.prototype.parent_;
goog.async.Deferred.prototype.branches_ = 0;
goog.async.Deferred.STRICT_ERRORS = false;
goog.async.Deferred.prototype.cancel = function(opt_deepCancel) {
  if(!this.hasFired()) {
    if(this.parent_) {
      var parent = this.parent_;
      delete this.parent_;
      if(opt_deepCancel) {
        parent.cancel(opt_deepCancel)
      }else {
        parent.branchCancel_()
      }
    }
    if(this.onCancelFunction_) {
      this.onCancelFunction_.call(this.defaultScope_, this)
    }else {
      this.silentlyCanceled_ = true
    }
    if(!this.hasFired()) {
      this.errback(new goog.async.Deferred.CanceledError(this))
    }
  }else {
    if(this.result_ instanceof goog.async.Deferred) {
      this.result_.cancel()
    }
  }
};
goog.async.Deferred.prototype.branchCancel_ = function() {
  this.branches_--;
  if(this.branches_ <= 0) {
    this.cancel()
  }
};
goog.async.Deferred.prototype.continue_ = function(isSuccess, res) {
  this.blocked_ = false;
  this.updateResult_(isSuccess, res)
};
goog.async.Deferred.prototype.updateResult_ = function(isSuccess, res) {
  this.fired_ = true;
  this.result_ = res;
  this.hadError_ = !isSuccess;
  this.fire_()
};
goog.async.Deferred.prototype.check_ = function() {
  if(this.hasFired()) {
    if(!this.silentlyCanceled_) {
      throw new goog.async.Deferred.AlreadyCalledError(this);
    }
    this.silentlyCanceled_ = false
  }
};
goog.async.Deferred.prototype.callback = function(opt_result) {
  this.check_();
  this.assertNotDeferred_(opt_result);
  this.updateResult_(true, opt_result)
};
goog.async.Deferred.prototype.errback = function(opt_result) {
  this.check_();
  this.assertNotDeferred_(opt_result);
  this.updateResult_(false, opt_result)
};
goog.async.Deferred.prototype.assertNotDeferred_ = function(obj) {
  goog.asserts.assert(!(obj instanceof goog.async.Deferred), "An execution sequence may not be initiated with a blocking Deferred.")
};
goog.async.Deferred.prototype.addCallback = function(cb, opt_scope) {
  return this.addCallbacks(cb, null, opt_scope)
};
goog.async.Deferred.prototype.addErrback = function(eb, opt_scope) {
  return this.addCallbacks(null, eb, opt_scope)
};
goog.async.Deferred.prototype.addBoth = function(f, opt_scope) {
  return this.addCallbacks(f, f, opt_scope)
};
goog.async.Deferred.prototype.addCallbacks = function(cb, eb, opt_scope) {
  goog.asserts.assert(!this.blocking_, "Blocking Deferreds can not be re-used");
  this.sequence_.push([cb, eb, opt_scope]);
  if(this.hasFired()) {
    this.fire_()
  }
  return this
};
goog.async.Deferred.prototype.chainDeferred = function(otherDeferred) {
  this.addCallbacks(otherDeferred.callback, otherDeferred.errback, otherDeferred);
  return this
};
goog.async.Deferred.prototype.awaitDeferred = function(otherDeferred) {
  return this.addCallback(goog.bind(otherDeferred.branch, otherDeferred))
};
goog.async.Deferred.prototype.branch = function(opt_propagateCancel) {
  var d = new goog.async.Deferred;
  this.chainDeferred(d);
  if(opt_propagateCancel) {
    d.parent_ = this;
    this.branches_++
  }
  return d
};
goog.async.Deferred.prototype.hasFired = function() {
  return this.fired_
};
goog.async.Deferred.prototype.isError = function(res) {
  return res instanceof Error
};
goog.async.Deferred.prototype.hasErrback_ = function() {
  return goog.array.some(this.sequence_, function(sequenceRow) {
    return goog.isFunction(sequenceRow[1])
  })
};
goog.async.Deferred.prototype.fire_ = function() {
  if(this.unhandledExceptionTimeoutId_ && this.hasFired() && this.hasErrback_()) {
    goog.global.clearTimeout(this.unhandledExceptionTimeoutId_);
    delete this.unhandledExceptionTimeoutId_
  }
  if(this.parent_) {
    this.parent_.branches_--;
    delete this.parent_
  }
  var res = this.result_;
  var unhandledException = false;
  var isNewlyBlocked = false;
  while(this.sequence_.length && !this.blocked_) {
    var sequenceEntry = this.sequence_.shift();
    var callback = sequenceEntry[0];
    var errback = sequenceEntry[1];
    var scope = sequenceEntry[2];
    var f = this.hadError_ ? errback : callback;
    if(f) {
      try {
        var ret = f.call(scope || this.defaultScope_, res);
        if(goog.isDef(ret)) {
          this.hadError_ = this.hadError_ && (ret == res || this.isError(ret));
          this.result_ = res = ret
        }
        if(res instanceof goog.async.Deferred) {
          isNewlyBlocked = true;
          this.blocked_ = true
        }
      }catch(ex) {
        res = ex;
        this.hadError_ = true;
        if(!this.hasErrback_()) {
          unhandledException = true
        }
      }
    }
  }
  this.result_ = res;
  if(isNewlyBlocked) {
    res.addCallbacks(goog.bind(this.continue_, this, true), goog.bind(this.continue_, this, false));
    res.blocking_ = true
  }else {
    if(goog.async.Deferred.STRICT_ERRORS && this.isError(res) && !(res instanceof goog.async.Deferred.CanceledError)) {
      this.hadError_ = true;
      unhandledException = true
    }
  }
  if(unhandledException) {
    this.unhandledExceptionTimeoutId_ = goog.global.setTimeout(goog.functions.fail(res), 0)
  }
};
goog.async.Deferred.succeed = function(opt_result) {
  var d = new goog.async.Deferred;
  d.callback(opt_result);
  return d
};
goog.async.Deferred.fail = function(res) {
  var d = new goog.async.Deferred;
  d.errback(res);
  return d
};
goog.async.Deferred.canceled = function() {
  var d = new goog.async.Deferred;
  d.cancel();
  return d
};
goog.async.Deferred.cancelled = goog.async.Deferred.canceled;
goog.async.Deferred.when = function(value, callback, opt_scope) {
  if(value instanceof goog.async.Deferred) {
    return value.branch(true).addCallback(callback, opt_scope)
  }else {
    return goog.async.Deferred.succeed(value).addCallback(callback, opt_scope)
  }
};
goog.async.Error = function(opt_msg) {
  if(Error.captureStackTrace) {
    Error.captureStackTrace(this, goog.async.Error)
  }else {
    this.stack = (new Error).stack || ""
  }
  if(opt_msg) {
    this.message = String(opt_msg)
  }
};
goog.inherits(goog.async.Error, Error);
goog.async.Deferred.AlreadyCalledError = function(deferred) {
  goog.async.Error.call(this);
  this.deferred = deferred
};
goog.inherits(goog.async.Deferred.AlreadyCalledError, goog.async.Error);
goog.async.Deferred.AlreadyCalledError.prototype.message = "Deferred has already fired";
goog.async.Deferred.AlreadyCalledError.prototype.name = "AlreadyCalledError";
goog.async.Deferred.CanceledError = function(deferred) {
  goog.async.Error.call(this);
  this.deferred = deferred
};
goog.inherits(goog.async.Deferred.CanceledError, goog.async.Error);
goog.async.Deferred.CanceledError.prototype.message = "Deferred was canceled";
goog.async.Deferred.CanceledError.prototype.name = "CanceledError";
goog.async.Deferred.CancelledError = goog.async.Deferred.CanceledError;
goog.provide("ydn.db.base");
goog.require("goog.async.Deferred");
ydn.db.base.SQLITE_SPECIAL_COLUNM_NAME = "_ROWID_";
ydn.db.base.DEFAULT_BLOB_COLUMN = "_default_";
ydn.db.base.JQUERY = false;
ydn.db.base.USE_HOOK = false;
ydn.db.base.NO_IDB = false;
ydn.db.base.NO_SIMPLE = false;
ydn.db.base.NO_WEBSQL = false;
ydn.db.base.DEFAULT_RESULT_LIMIT = 100;
ydn.db.base.DEFAULT_CONNECTION_TIMEOUT = 30 * 60 * 1E3;
ydn.db.base.Mechanisms = {IDB:"indexeddb", USER_DATA:"userdata", LOCAL_STORAGE:"localstorage", MEMORY_STORAGE:"memory", SESSION_STORAGE:"sessionstorage", WEBSQL:"websql"};
ydn.db.base.createDeferred = function() {
  if(ydn.db.base.JQUERY) {
    return new goog.async.Deferred
  }else {
    return new goog.async.Deferred
  }
};
ydn.db.base.TxEventTypes = {COMPLETE:"complete", ABORT:"abort", ERROR:"error"};
ydn.db.base.StandardTransactionMode = {"READ_ONLY":"readonly", "READ_WRITE":"readwrite", "VERSION_CHANGE":"versionchange"};
ydn.db.base.IDBTransaction = goog.global.IDBRequest && "LOADING" in goog.global.IDBRequest ? goog.global.IDBTransaction : goog.global.webkitIDBRequest && "LOADING" in goog.global.webkitIDBRequest && goog.global.webkitIDBTransaction.READ_WRITE === 1 ? goog.global.webkitIDBTransaction : ydn.db.base.StandardTransactionMode;
ydn.db.base.TransactionMode = {READ_ONLY:ydn.db.base.IDBTransaction.READ_ONLY, READ_WRITE:ydn.db.base.IDBTransaction.READ_WRITE, VERSION_CHANGE:ydn.db.base.IDBTransaction.VERSION_CHANGE};
ydn.db.base.ENABLE_DEFAULT_TEXT_STORE = false;
ydn.db.base.ENABLE_ENCRYPTION = false;
ydn.db.base.Direction = {NEXT:"next", NEXT_UNIQUE:"nextunique", PREV:"prev", PREV_UNIQUE:"prevunique"};
ydn.db.base.DIRECTIONS = [ydn.db.base.Direction.NEXT, ydn.db.base.Direction.NEXT_UNIQUE, ydn.db.base.Direction.PREV, ydn.db.base.Direction.PREV_UNIQUE];
ydn.db.base.getDirection = function(opt_reverse, opt_unique) {
  if(opt_reverse) {
    return opt_unique ? ydn.db.base.Direction.PREV_UNIQUE : ydn.db.base.Direction.PREV
  }else {
    return opt_unique ? ydn.db.base.Direction.NEXT_UNIQUE : ydn.db.base.Direction.NEXT
  }
};
goog.provide("ydn.db.utils");
goog.require("ydn.db.base");
ydn.db.utils.getValueByKeys = function(obj, var_args) {
  var isArrayLike, keys;
  if(arguments.length == 2 && goog.isString(arguments[1])) {
    isArrayLike = true;
    keys = arguments[1].split(".")
  }else {
    isArrayLike = goog.isArrayLike(var_args);
    keys = isArrayLike ? var_args : arguments
  }
  for(var i = isArrayLike ? 0 : 1;i < keys.length;i++) {
    obj = obj[keys[i]];
    if(!goog.isDef(obj)) {
      break
    }
  }
  return(obj)
};
ydn.db.utils.ARRAY_TERMINATOR = {};
ydn.db.utils.BYTE_TERMINATOR = 0;
ydn.db.utils.TYPE_NUMBER = 1;
ydn.db.utils.TYPE_DATE = 2;
ydn.db.utils.TYPE_STRING = 3;
ydn.db.utils.TYPE_ARRAY = 4;
ydn.db.utils.MAX_TYPE_BYTE_SIZE = 12;
ydn.db.utils.encodeKey = function(key) {
  var stack = [key], writer = new ydn.db.utils.HexStringWriter, type = 0, dataType, obj;
  while((obj = stack.pop()) !== undefined) {
    if(type % 4 === 0 && type + ydn.db.utils.TYPE_ARRAY > ydn.db.utils.MAX_TYPE_BYTE_SIZE) {
      writer.write(type);
      type = 0
    }
    dataType = typeof obj;
    if(obj instanceof Array) {
      type += ydn.db.utils.TYPE_ARRAY;
      if(obj.length > 0) {
        stack.push(ydn.db.utils.ARRAY_TERMINATOR);
        var i = obj.length;
        while(i--) {
          stack.push(obj[i])
        }
        continue
      }else {
        writer.write(type)
      }
    }else {
      if(dataType === "number") {
        type += ydn.db.utils.TYPE_NUMBER;
        writer.write(type);
        ydn.db.utils.encodeNumber(writer, obj)
      }else {
        if(obj instanceof Date) {
          type += ydn.db.utils.TYPE_DATE;
          writer.write(type);
          ydn.db.utils.encodeNumber(writer, obj.valueOf())
        }else {
          if(dataType === "string") {
            type += ydn.db.utils.TYPE_STRING;
            writer.write(type);
            ydn.db.utils.encodeString(writer, obj)
          }else {
            if(obj === ydn.db.utils.ARRAY_TERMINATOR) {
              writer.write(ydn.db.utils.BYTE_TERMINATOR)
            }else {
              return""
            }
          }
        }
      }
    }
    type = 0
  }
  return writer.trim().toString()
};
ydn.db.utils.decodeKey = function(encodedKey) {
  var rootArray = [];
  var parentArray = rootArray;
  var type, arrayStack = [], depth, tmp;
  var reader = new ydn.db.utils.HexStringReader(encodedKey);
  while(reader.read() != null) {
    if(reader.current === 0) {
      parentArray = arrayStack.pop();
      continue
    }
    if(reader.current === null) {
      return rootArray[0]
    }
    do {
      depth = reader.current / 4 | 0;
      type = reader.current % 4;
      for(var i = 0;i < depth;i++) {
        tmp = [];
        parentArray.push(tmp);
        arrayStack.push(parentArray);
        parentArray = tmp
      }
      if(type === 0 && reader.current + ydn.db.utils.TYPE_ARRAY > ydn.db.utils.MAX_TYPE_BYTE_SIZE) {
        reader.read()
      }else {
        break
      }
    }while(true);
    if(type === ydn.db.utils.TYPE_NUMBER) {
      parentArray.push(ydn.db.utils.decodeNumber(reader))
    }else {
      if(type === ydn.db.utils.TYPE_DATE) {
        parentArray.push(new Date(ydn.db.utils.decodeNumber(reader)))
      }else {
        if(type === ydn.db.utils.TYPE_STRING) {
          parentArray.push(ydn.db.utils.decodeString(reader))
        }else {
          if(type === 0) {
            parentArray = arrayStack.pop()
          }
        }
      }
    }
  }
  return rootArray[0]
};
ydn.db.utils.p16 = 65536;
ydn.db.utils.p32 = 4294967296;
ydn.db.utils.p48 = 281474976710656;
ydn.db.utils.p52 = 4503599627370496;
ydn.db.utils.pNeg1074 = 4.9E-324;
ydn.db.utils.pNeg1022 = 2.2250738585072014E-308;
ydn.db.utils.ieee754 = function(number) {
  var s = 0, e = 0, m = 0;
  if(number !== 0) {
    if(isFinite(number)) {
      if(number < 0) {
        s = 1;
        number = -number
      }
      var p = 0;
      if(number >= ydn.db.utils.pNeg1022) {
        var n = number;
        while(n < 1) {
          p--;
          n *= 2
        }
        while(n >= 2) {
          p++;
          n /= 2
        }
        e = p + 1023
      }
      m = e ? Math.floor((number / Math.pow(2, p) - 1) * ydn.db.utils.p52) : Math.floor(number / ydn.db.utils.pNeg1074)
    }else {
      e = 2047;
      if(isNaN(number)) {
        m = 0x8000000000000
      }else {
        if(number === -Infinity) {
          s = 1
        }
      }
    }
  }
  return{sign:s, exponent:e, mantissa:m}
};
ydn.db.utils.encodeNumber = function(writer, number) {
  var iee_number = ydn.db.utils.ieee754(number);
  if(iee_number.sign) {
    iee_number.mantissa = ydn.db.utils.p52 - 1 - iee_number.mantissa;
    iee_number.exponent = 2047 - iee_number.exponent
  }
  var word, m = iee_number.mantissa;
  writer.write((iee_number.sign ? 0 : 128) | iee_number.exponent >> 4);
  writer.write((iee_number.exponent & 15) << 4 | 0 | m / ydn.db.utils.p48);
  m %= ydn.db.utils.p48;
  word = 0 | m / ydn.db.utils.p32;
  writer.write(word >> 8, word & 255);
  m %= ydn.db.utils.p32;
  word = 0 | m / ydn.db.utils.p16;
  writer.write(word >> 8, word & 255);
  word = m % ydn.db.utils.p16;
  writer.write(word >> 8, word & 255)
};
ydn.db.utils.decodeNumber = function(reader) {
  var b = reader.read() | 0;
  var sign = b >> 7 ? false : true;
  var s = sign ? -1 : 1;
  var e = (b & 127) << 4;
  b = reader.read() | 0;
  e += b >> 4;
  if(sign) {
    e = 2047 - e
  }
  var tmp = [sign ? 15 - (b & 15) : b & 15];
  var i = 6;
  while(i--) {
    tmp.push(sign ? 255 - (reader.read() | 0) : reader.read() | 0)
  }
  var m = 0;
  i = 7;
  while(i--) {
    m = m / 256 + tmp[i]
  }
  m /= 16;
  if(m === 0 && e === 0) {
    return 0
  }
  return(m + 1) * Math.pow(2, e - 1023) * s
};
ydn.db.utils.secondLayer = 16383 + 127;
ydn.db.utils.encodeString = function(writer, string) {
  for(var i = 0;i < string.length;i++) {
    var code = string.charCodeAt(i);
    if(code <= 126) {
      writer.write(code + 1)
    }else {
      if(code <= ydn.db.utils.secondLayer) {
        code -= 127;
        writer.write(128 | code >> 8, code & 255)
      }else {
        writer.write(192 | code >> 10, code >> 2 | 255, (code | 3) << 6)
      }
    }
  }
  writer.write(ydn.db.utils.BYTE_TERMINATOR)
};
ydn.db.utils.decodeString = function(reader) {
  var buffer = [], layer = 0, unicode = 0, count = 0, $byte, tmp;
  while(true) {
    $byte = reader.read();
    if($byte === 0 || $byte == null) {
      break
    }
    if(layer === 0) {
      tmp = $byte >> 6;
      if(tmp < 2 && !isNaN($byte)) {
        buffer.push(String.fromCharCode($byte - 1))
      }else {
        layer = tmp;
        unicode = $byte << 10;
        count++
      }
    }else {
      if(layer === 2) {
        buffer.push(String.fromCharCode(unicode + $byte + 127));
        layer = unicode = count = 0
      }else {
        if(count === 2) {
          unicode += $byte << 2;
          count++
        }else {
          buffer.push(String.fromCharCode(unicode | $byte >> 6));
          layer = unicode = count = 0
        }
      }
    }
  }
  return buffer.join("")
};
ydn.db.utils.HexStringReader = function(string) {
  this.current = null;
  this.string = string;
  this.lastIndex = this.string.length - 1;
  this.index = -1
};
ydn.db.utils.HexStringReader.prototype.current;
ydn.db.utils.HexStringReader.prototype.index;
ydn.db.utils.HexStringReader.prototype.lastIndex;
ydn.db.utils.HexStringReader.prototype.string;
ydn.db.utils.HexStringReader.prototype.read = function() {
  return this.current = this.index < this.lastIndex ? parseInt(this.string[++this.index] + this.string[++this.index], 16) : null
};
ydn.db.utils.HexStringWriter = function() {
  this.buffer = [];
  this.c = undefined
};
ydn.db.utils.HexStringWriter.prototype.c;
ydn.db.utils.HexStringWriter.prototype.buffer;
ydn.db.utils.HexStringWriter.prototype.write = function($byte) {
  for(var i = 0;i < arguments.length;i++) {
    this.c = arguments[i].toString(16);
    this.buffer.push(this.c.length === 2 ? this.c : this.c = "0" + this.c)
  }
};
ydn.db.utils.HexStringWriter.prototype.trim = function() {
  var length = this.buffer.length;
  while(this.buffer[--length] === "00") {
  }
  this.buffer.length = ++length;
  return this
};
ydn.db.utils.HexStringWriter.prototype.toString = function() {
  return this.buffer.length ? this.buffer.join("") : ""
};
ydn.db.utils.cmp = function(first, second) {
  var key1 = ydn.db.utils.encodeKey(first);
  var key2 = ydn.db.utils.encodeKey(second);
  return key1 > key2 ? 1 : key1 == key2 ? 0 : -1
};
goog.provide("goog.disposable.IDisposable");
goog.disposable.IDisposable = function() {
};
goog.disposable.IDisposable.prototype.dispose;
goog.disposable.IDisposable.prototype.isDisposed;
goog.provide("goog.Disposable");
goog.provide("goog.dispose");
goog.require("goog.disposable.IDisposable");
goog.Disposable = function() {
  if(goog.Disposable.MONITORING_MODE != goog.Disposable.MonitoringMode.OFF) {
    this.creationStack = (new Error).stack;
    goog.Disposable.instances_[goog.getUid(this)] = this
  }
};
goog.Disposable.MonitoringMode = {OFF:0, PERMANENT:1, INTERACTIVE:2};
goog.Disposable.MONITORING_MODE = 0;
goog.Disposable.instances_ = {};
goog.Disposable.getUndisposedObjects = function() {
  var ret = [];
  for(var id in goog.Disposable.instances_) {
    if(goog.Disposable.instances_.hasOwnProperty(id)) {
      ret.push(goog.Disposable.instances_[Number(id)])
    }
  }
  return ret
};
goog.Disposable.clearUndisposedObjects = function() {
  goog.Disposable.instances_ = {}
};
goog.Disposable.prototype.disposed_ = false;
goog.Disposable.prototype.onDisposeCallbacks_;
goog.Disposable.prototype.creationStack;
goog.Disposable.prototype.isDisposed = function() {
  return this.disposed_
};
goog.Disposable.prototype.getDisposed = goog.Disposable.prototype.isDisposed;
goog.Disposable.prototype.dispose = function() {
  if(!this.disposed_) {
    this.disposed_ = true;
    this.disposeInternal();
    if(goog.Disposable.MONITORING_MODE != goog.Disposable.MonitoringMode.OFF) {
      var uid = goog.getUid(this);
      if(goog.Disposable.MONITORING_MODE == goog.Disposable.MonitoringMode.PERMANENT && !goog.Disposable.instances_.hasOwnProperty(uid)) {
        throw Error(this + " did not call the goog.Disposable base " + "constructor or was disposed of after a clearUndisposedObjects " + "call");
      }
      delete goog.Disposable.instances_[uid]
    }
  }
};
goog.Disposable.prototype.registerDisposable = function(disposable) {
  this.addOnDisposeCallback(goog.partial(goog.dispose, disposable))
};
goog.Disposable.prototype.addOnDisposeCallback = function(callback, opt_scope) {
  if(!this.onDisposeCallbacks_) {
    this.onDisposeCallbacks_ = []
  }
  this.onDisposeCallbacks_.push(goog.bind(callback, opt_scope))
};
goog.Disposable.prototype.disposeInternal = function() {
  if(this.onDisposeCallbacks_) {
    while(this.onDisposeCallbacks_.length) {
      this.onDisposeCallbacks_.shift()()
    }
  }
};
goog.Disposable.isDisposed = function(obj) {
  if(obj && typeof obj.isDisposed == "function") {
    return obj.isDisposed()
  }
  return false
};
goog.dispose = function(obj) {
  if(obj && typeof obj.dispose == "function") {
    obj.dispose()
  }
};
goog.disposeAll = function(var_args) {
  for(var i = 0, len = arguments.length;i < len;++i) {
    var disposable = arguments[i];
    if(goog.isArrayLike(disposable)) {
      goog.disposeAll.apply(null, disposable)
    }else {
      goog.dispose(disposable)
    }
  }
};
goog.provide("goog.debug.EntryPointMonitor");
goog.provide("goog.debug.entryPointRegistry");
goog.require("goog.asserts");
goog.debug.EntryPointMonitor = function() {
};
goog.debug.EntryPointMonitor.prototype.wrap;
goog.debug.EntryPointMonitor.prototype.unwrap;
goog.debug.entryPointRegistry.refList_ = [];
goog.debug.entryPointRegistry.monitors_ = [];
goog.debug.entryPointRegistry.monitorsMayExist_ = false;
goog.debug.entryPointRegistry.register = function(callback) {
  goog.debug.entryPointRegistry.refList_[goog.debug.entryPointRegistry.refList_.length] = callback;
  if(goog.debug.entryPointRegistry.monitorsMayExist_) {
    var monitors = goog.debug.entryPointRegistry.monitors_;
    for(var i = 0;i < monitors.length;i++) {
      callback(goog.bind(monitors[i].wrap, monitors[i]))
    }
  }
};
goog.debug.entryPointRegistry.monitorAll = function(monitor) {
  goog.debug.entryPointRegistry.monitorsMayExist_ = true;
  var transformer = goog.bind(monitor.wrap, monitor);
  for(var i = 0;i < goog.debug.entryPointRegistry.refList_.length;i++) {
    goog.debug.entryPointRegistry.refList_[i](transformer)
  }
  goog.debug.entryPointRegistry.monitors_.push(monitor)
};
goog.debug.entryPointRegistry.unmonitorAllIfPossible = function(monitor) {
  var monitors = goog.debug.entryPointRegistry.monitors_;
  goog.asserts.assert(monitor == monitors[monitors.length - 1], "Only the most recent monitor can be unwrapped.");
  var transformer = goog.bind(monitor.unwrap, monitor);
  for(var i = 0;i < goog.debug.entryPointRegistry.refList_.length;i++) {
    goog.debug.entryPointRegistry.refList_[i](transformer)
  }
  monitors.length--
};
goog.provide("goog.events.BrowserFeature");
goog.require("goog.userAgent");
goog.events.BrowserFeature = {HAS_W3C_BUTTON:!goog.userAgent.IE || goog.userAgent.isDocumentModeOrHigher(9), HAS_W3C_EVENT_SUPPORT:!goog.userAgent.IE || goog.userAgent.isDocumentModeOrHigher(9), SET_KEY_CODE_TO_PREVENT_DEFAULT:goog.userAgent.IE && !goog.userAgent.isVersionOrHigher("9"), HAS_NAVIGATOR_ONLINE_PROPERTY:!goog.userAgent.WEBKIT || goog.userAgent.isVersionOrHigher("528"), HAS_HTML5_NETWORK_EVENT_SUPPORT:goog.userAgent.GECKO && goog.userAgent.isVersionOrHigher("1.9b") || goog.userAgent.IE && 
goog.userAgent.isVersionOrHigher("8") || goog.userAgent.OPERA && goog.userAgent.isVersionOrHigher("9.5") || goog.userAgent.WEBKIT && goog.userAgent.isVersionOrHigher("528"), HTML5_NETWORK_EVENTS_FIRE_ON_BODY:goog.userAgent.GECKO && !goog.userAgent.isVersionOrHigher("8") || goog.userAgent.IE && !goog.userAgent.isVersionOrHigher("9"), TOUCH_ENABLED:"ontouchstart" in goog.global || !!(goog.global["document"] && document.documentElement && "ontouchstart" in document.documentElement) || !!(goog.global["navigator"] && 
goog.global["navigator"]["msMaxTouchPoints"])};
goog.provide("goog.events.Event");
goog.provide("goog.events.EventLike");
goog.require("goog.Disposable");
goog.events.EventLike;
goog.events.Event = function(type, opt_target) {
  this.type = type;
  this.target = opt_target;
  this.currentTarget = this.target
};
goog.events.Event.prototype.disposeInternal = function() {
};
goog.events.Event.prototype.dispose = function() {
};
goog.events.Event.prototype.propagationStopped_ = false;
goog.events.Event.prototype.defaultPrevented = false;
goog.events.Event.prototype.returnValue_ = true;
goog.events.Event.prototype.stopPropagation = function() {
  this.propagationStopped_ = true
};
goog.events.Event.prototype.preventDefault = function() {
  this.defaultPrevented = true;
  this.returnValue_ = false
};
goog.events.Event.stopPropagation = function(e) {
  e.stopPropagation()
};
goog.events.Event.preventDefault = function(e) {
  e.preventDefault()
};
goog.provide("goog.events.EventType");
goog.require("goog.userAgent");
goog.events.EventType = {CLICK:"click", DBLCLICK:"dblclick", MOUSEDOWN:"mousedown", MOUSEUP:"mouseup", MOUSEOVER:"mouseover", MOUSEOUT:"mouseout", MOUSEMOVE:"mousemove", SELECTSTART:"selectstart", KEYPRESS:"keypress", KEYDOWN:"keydown", KEYUP:"keyup", BLUR:"blur", FOCUS:"focus", DEACTIVATE:"deactivate", FOCUSIN:goog.userAgent.IE ? "focusin" : "DOMFocusIn", FOCUSOUT:goog.userAgent.IE ? "focusout" : "DOMFocusOut", CHANGE:"change", SELECT:"select", SUBMIT:"submit", INPUT:"input", PROPERTYCHANGE:"propertychange", 
DRAGSTART:"dragstart", DRAG:"drag", DRAGENTER:"dragenter", DRAGOVER:"dragover", DRAGLEAVE:"dragleave", DROP:"drop", DRAGEND:"dragend", TOUCHSTART:"touchstart", TOUCHMOVE:"touchmove", TOUCHEND:"touchend", TOUCHCANCEL:"touchcancel", BEFOREUNLOAD:"beforeunload", CONTEXTMENU:"contextmenu", ERROR:"error", HELP:"help", LOAD:"load", LOSECAPTURE:"losecapture", READYSTATECHANGE:"readystatechange", RESIZE:"resize", SCROLL:"scroll", UNLOAD:"unload", HASHCHANGE:"hashchange", PAGEHIDE:"pagehide", PAGESHOW:"pageshow", 
POPSTATE:"popstate", COPY:"copy", PASTE:"paste", CUT:"cut", BEFORECOPY:"beforecopy", BEFORECUT:"beforecut", BEFOREPASTE:"beforepaste", ONLINE:"online", OFFLINE:"offline", MESSAGE:"message", CONNECT:"connect", TRANSITIONEND:goog.userAgent.WEBKIT ? "webkitTransitionEnd" : goog.userAgent.OPERA ? "oTransitionEnd" : "transitionend", MSGESTURECHANGE:"MSGestureChange", MSGESTUREEND:"MSGestureEnd", MSGESTUREHOLD:"MSGestureHold", MSGESTURESTART:"MSGestureStart", MSGESTURETAP:"MSGestureTap", MSGOTPOINTERCAPTURE:"MSGotPointerCapture", 
MSINERTIASTART:"MSInertiaStart", MSLOSTPOINTERCAPTURE:"MSLostPointerCapture", MSPOINTERCANCEL:"MSPointerCancel", MSPOINTERDOWN:"MSPointerDown", MSPOINTERMOVE:"MSPointerMove", MSPOINTEROVER:"MSPointerOver", MSPOINTEROUT:"MSPointerOut", MSPOINTERUP:"MSPointerUp", TEXTINPUT:"textinput", COMPOSITIONSTART:"compositionstart", COMPOSITIONUPDATE:"compositionupdate", COMPOSITIONEND:"compositionend"};
goog.provide("goog.reflect");
goog.reflect.object = function(type, object) {
  return object
};
goog.reflect.sinkValue = function(x) {
  goog.reflect.sinkValue[" "](x);
  return x
};
goog.reflect.sinkValue[" "] = goog.nullFunction;
goog.reflect.canAccessProperty = function(obj, prop) {
  try {
    goog.reflect.sinkValue(obj[prop]);
    return true
  }catch(e) {
  }
  return false
};
goog.provide("goog.events.BrowserEvent");
goog.provide("goog.events.BrowserEvent.MouseButton");
goog.require("goog.events.BrowserFeature");
goog.require("goog.events.Event");
goog.require("goog.events.EventType");
goog.require("goog.reflect");
goog.require("goog.userAgent");
goog.events.BrowserEvent = function(opt_e, opt_currentTarget) {
  if(opt_e) {
    this.init(opt_e, opt_currentTarget)
  }
};
goog.inherits(goog.events.BrowserEvent, goog.events.Event);
goog.events.BrowserEvent.MouseButton = {LEFT:0, MIDDLE:1, RIGHT:2};
goog.events.BrowserEvent.IEButtonMap = [1, 4, 2];
goog.events.BrowserEvent.prototype.target = null;
goog.events.BrowserEvent.prototype.currentTarget;
goog.events.BrowserEvent.prototype.relatedTarget = null;
goog.events.BrowserEvent.prototype.offsetX = 0;
goog.events.BrowserEvent.prototype.offsetY = 0;
goog.events.BrowserEvent.prototype.clientX = 0;
goog.events.BrowserEvent.prototype.clientY = 0;
goog.events.BrowserEvent.prototype.screenX = 0;
goog.events.BrowserEvent.prototype.screenY = 0;
goog.events.BrowserEvent.prototype.button = 0;
goog.events.BrowserEvent.prototype.keyCode = 0;
goog.events.BrowserEvent.prototype.charCode = 0;
goog.events.BrowserEvent.prototype.ctrlKey = false;
goog.events.BrowserEvent.prototype.altKey = false;
goog.events.BrowserEvent.prototype.shiftKey = false;
goog.events.BrowserEvent.prototype.metaKey = false;
goog.events.BrowserEvent.prototype.state;
goog.events.BrowserEvent.prototype.platformModifierKey = false;
goog.events.BrowserEvent.prototype.event_ = null;
goog.events.BrowserEvent.prototype.init = function(e, opt_currentTarget) {
  var type = this.type = e.type;
  goog.events.Event.call(this, type);
  this.target = (e.target) || e.srcElement;
  this.currentTarget = (opt_currentTarget);
  var relatedTarget = (e.relatedTarget);
  if(relatedTarget) {
    if(goog.userAgent.GECKO) {
      if(!goog.reflect.canAccessProperty(relatedTarget, "nodeName")) {
        relatedTarget = null
      }
    }
  }else {
    if(type == goog.events.EventType.MOUSEOVER) {
      relatedTarget = e.fromElement
    }else {
      if(type == goog.events.EventType.MOUSEOUT) {
        relatedTarget = e.toElement
      }
    }
  }
  this.relatedTarget = relatedTarget;
  this.offsetX = goog.userAgent.WEBKIT || e.offsetX !== undefined ? e.offsetX : e.layerX;
  this.offsetY = goog.userAgent.WEBKIT || e.offsetY !== undefined ? e.offsetY : e.layerY;
  this.clientX = e.clientX !== undefined ? e.clientX : e.pageX;
  this.clientY = e.clientY !== undefined ? e.clientY : e.pageY;
  this.screenX = e.screenX || 0;
  this.screenY = e.screenY || 0;
  this.button = e.button;
  this.keyCode = e.keyCode || 0;
  this.charCode = e.charCode || (type == "keypress" ? e.keyCode : 0);
  this.ctrlKey = e.ctrlKey;
  this.altKey = e.altKey;
  this.shiftKey = e.shiftKey;
  this.metaKey = e.metaKey;
  this.platformModifierKey = goog.userAgent.MAC ? e.metaKey : e.ctrlKey;
  this.state = e.state;
  this.event_ = e;
  if(e.defaultPrevented) {
    this.preventDefault()
  }
  delete this.propagationStopped_
};
goog.events.BrowserEvent.prototype.isButton = function(button) {
  if(!goog.events.BrowserFeature.HAS_W3C_BUTTON) {
    if(this.type == "click") {
      return button == goog.events.BrowserEvent.MouseButton.LEFT
    }else {
      return!!(this.event_.button & goog.events.BrowserEvent.IEButtonMap[button])
    }
  }else {
    return this.event_.button == button
  }
};
goog.events.BrowserEvent.prototype.isMouseActionButton = function() {
  return this.isButton(goog.events.BrowserEvent.MouseButton.LEFT) && !(goog.userAgent.WEBKIT && goog.userAgent.MAC && this.ctrlKey)
};
goog.events.BrowserEvent.prototype.stopPropagation = function() {
  goog.events.BrowserEvent.superClass_.stopPropagation.call(this);
  if(this.event_.stopPropagation) {
    this.event_.stopPropagation()
  }else {
    this.event_.cancelBubble = true
  }
};
goog.events.BrowserEvent.prototype.preventDefault = function() {
  goog.events.BrowserEvent.superClass_.preventDefault.call(this);
  var be = this.event_;
  if(!be.preventDefault) {
    be.returnValue = false;
    if(goog.events.BrowserFeature.SET_KEY_CODE_TO_PREVENT_DEFAULT) {
      try {
        var VK_F1 = 112;
        var VK_F12 = 123;
        if(be.ctrlKey || be.keyCode >= VK_F1 && be.keyCode <= VK_F12) {
          be.keyCode = -1
        }
      }catch(ex) {
      }
    }
  }else {
    be.preventDefault()
  }
};
goog.events.BrowserEvent.prototype.getBrowserEvent = function() {
  return this.event_
};
goog.events.BrowserEvent.prototype.disposeInternal = function() {
};
goog.provide("goog.events.Listenable");
goog.provide("goog.events.ListenableKey");
goog.events.Listenable = function() {
};
goog.events.Listenable.IMPLEMENTED_BY_PROP = "closure_listenable_" + (Math.random() * 1E6 | 0);
goog.events.Listenable.addImplementation = function(cls) {
  cls.prototype[goog.events.Listenable.IMPLEMENTED_BY_PROP] = true
};
goog.events.Listenable.isImplementedBy = function(obj) {
  return!!(obj && obj[goog.events.Listenable.IMPLEMENTED_BY_PROP])
};
goog.events.Listenable.prototype.listen;
goog.events.Listenable.prototype.listenOnce;
goog.events.Listenable.prototype.unlisten;
goog.events.Listenable.prototype.unlistenByKey;
goog.events.Listenable.prototype.dispatchEvent;
goog.events.Listenable.prototype.removeAllListeners;
goog.events.Listenable.prototype.fireListeners;
goog.events.Listenable.prototype.getListeners;
goog.events.Listenable.prototype.getListener;
goog.events.Listenable.prototype.hasListener;
goog.events.ListenableKey = function() {
};
goog.events.ListenableKey.counter_ = 0;
goog.events.ListenableKey.reserveKey = function() {
  return++goog.events.ListenableKey.counter_
};
goog.events.ListenableKey.prototype.src;
goog.events.ListenableKey.prototype.type;
goog.events.ListenableKey.prototype.listener;
goog.events.ListenableKey.prototype.capture;
goog.events.ListenableKey.prototype.handler;
goog.events.ListenableKey.prototype.key;
goog.provide("goog.events.Listener");
goog.require("goog.events.ListenableKey");
goog.events.Listener = function(listener, proxy, src, type, capture, opt_handler) {
  if(goog.events.Listener.ENABLE_MONITORING) {
    this.creationStack = (new Error).stack
  }
  this.listener = listener;
  this.proxy = proxy;
  this.src = src;
  this.type = type;
  this.capture = !!capture;
  this.handler = opt_handler;
  this.key = goog.events.ListenableKey.reserveKey();
  this.callOnce = false;
  this.removed = false
};
goog.events.Listener.ENABLE_MONITORING = false;
goog.events.Listener.prototype.creationStack;
goog.events.Listener.prototype.handleEvent = function(eventObject) {
  return this.listener.call(this.handler || this.src, eventObject)
};
goog.provide("goog.events");
goog.provide("goog.events.Key");
goog.provide("goog.events.ListenableType");
goog.require("goog.array");
goog.require("goog.asserts");
goog.require("goog.debug.entryPointRegistry");
goog.require("goog.events.BrowserEvent");
goog.require("goog.events.BrowserFeature");
goog.require("goog.events.Listenable");
goog.require("goog.events.Listener");
goog.require("goog.object");
goog.events.Key;
goog.events.ListenableType;
goog.events.listeners_ = {};
goog.events.listenerTree_ = {};
goog.events.sources_ = {};
goog.events.onString_ = "on";
goog.events.onStringMap_ = {};
goog.events.keySeparator_ = "_";
goog.events.listen = function(src, type, listener, opt_capt, opt_handler) {
  if(goog.isArray(type)) {
    for(var i = 0;i < type.length;i++) {
      goog.events.listen(src, type[i], listener, opt_capt, opt_handler)
    }
    return null
  }
  var listenableKey;
  listener = goog.events.wrapListener_(listener);
  if(goog.events.Listenable.isImplementedBy(src)) {
    listenableKey = src.listen((type), listener, opt_capt, opt_handler)
  }else {
    listenableKey = goog.events.listen_((src), type, listener, false, opt_capt, opt_handler)
  }
  return listenableKey
};
goog.events.listen_ = function(src, type, listener, callOnce, opt_capt, opt_handler) {
  if(!type) {
    throw Error("Invalid event type");
  }
  var capture = !!opt_capt;
  var map = goog.events.listenerTree_;
  if(!(type in map)) {
    map[type] = {count_:0, remaining_:0}
  }
  map = map[type];
  if(!(capture in map)) {
    map[capture] = {count_:0, remaining_:0};
    map.count_++
  }
  map = map[capture];
  var srcUid = goog.getUid(src);
  var listenerArray, listenerObj;
  map.remaining_++;
  if(!map[srcUid]) {
    listenerArray = map[srcUid] = [];
    map.count_++
  }else {
    listenerArray = map[srcUid];
    for(var i = 0;i < listenerArray.length;i++) {
      listenerObj = listenerArray[i];
      if(listenerObj.listener == listener && listenerObj.handler == opt_handler) {
        if(listenerObj.removed) {
          break
        }
        if(!callOnce) {
          listenerArray[i].callOnce = false
        }
        return listenerArray[i]
      }
    }
  }
  var proxy = goog.events.getProxy();
  listenerObj = new goog.events.Listener(listener, proxy, src, type, capture, opt_handler);
  listenerObj.callOnce = callOnce;
  proxy.src = src;
  proxy.listener = listenerObj;
  listenerArray.push(listenerObj);
  if(!goog.events.sources_[srcUid]) {
    goog.events.sources_[srcUid] = []
  }
  goog.events.sources_[srcUid].push(listenerObj);
  if(src.addEventListener) {
    src.addEventListener(type, proxy, capture)
  }else {
    src.attachEvent(goog.events.getOnString_(type), proxy)
  }
  var key = listenerObj.key;
  goog.events.listeners_[key] = listenerObj;
  return listenerObj
};
goog.events.getProxy = function() {
  var proxyCallbackFunction = goog.events.handleBrowserEvent_;
  var f = goog.events.BrowserFeature.HAS_W3C_EVENT_SUPPORT ? function(eventObject) {
    return proxyCallbackFunction.call(f.src, f.listener, eventObject)
  } : function(eventObject) {
    var v = proxyCallbackFunction.call(f.src, f.listener, eventObject);
    if(!v) {
      return v
    }
  };
  return f
};
goog.events.listenOnce = function(src, type, listener, opt_capt, opt_handler) {
  if(goog.isArray(type)) {
    for(var i = 0;i < type.length;i++) {
      goog.events.listenOnce(src, type[i], listener, opt_capt, opt_handler)
    }
    return null
  }
  var listenableKey;
  listener = goog.events.wrapListener_(listener);
  if(goog.events.Listenable.isImplementedBy(src)) {
    listenableKey = src.listenOnce((type), listener, opt_capt, opt_handler)
  }else {
    listenableKey = goog.events.listen_((src), type, listener, true, opt_capt, opt_handler)
  }
  return listenableKey
};
goog.events.listenWithWrapper = function(src, wrapper, listener, opt_capt, opt_handler) {
  wrapper.listen(src, listener, opt_capt, opt_handler)
};
goog.events.unlisten = function(src, type, listener, opt_capt, opt_handler) {
  if(goog.isArray(type)) {
    for(var i = 0;i < type.length;i++) {
      goog.events.unlisten(src, type[i], listener, opt_capt, opt_handler)
    }
    return null
  }
  listener = goog.events.wrapListener_(listener);
  if(goog.events.Listenable.isImplementedBy(src)) {
    return src.unlisten((type), listener, opt_capt, opt_handler)
  }
  var capture = !!opt_capt;
  var listenerArray = goog.events.getListeners_(src, type, capture);
  if(!listenerArray) {
    return false
  }
  for(var i = 0;i < listenerArray.length;i++) {
    if(listenerArray[i].listener == listener && listenerArray[i].capture == capture && listenerArray[i].handler == opt_handler) {
      return goog.events.unlistenByKey(listenerArray[i])
    }
  }
  return false
};
goog.events.unlistenByKey = function(key) {
  if(goog.isNumber(key)) {
    return false
  }
  var listener = (key);
  if(!listener) {
    return false
  }
  if(listener.removed) {
    return false
  }
  var src = listener.src;
  if(goog.events.Listenable.isImplementedBy(src)) {
    return src.unlistenByKey(listener)
  }
  var type = listener.type;
  var proxy = listener.proxy;
  var capture = listener.capture;
  if(src.removeEventListener) {
    src.removeEventListener(type, proxy, capture)
  }else {
    if(src.detachEvent) {
      src.detachEvent(goog.events.getOnString_(type), proxy)
    }
  }
  var srcUid = goog.getUid(src);
  if(goog.events.sources_[srcUid]) {
    var sourcesArray = goog.events.sources_[srcUid];
    goog.array.remove(sourcesArray, listener);
    if(sourcesArray.length == 0) {
      delete goog.events.sources_[srcUid]
    }
  }
  listener.removed = true;
  var listenerArray = goog.events.listenerTree_[type][capture][srcUid];
  if(listenerArray) {
    listenerArray.needsCleanup_ = true;
    goog.events.cleanUp_(type, capture, srcUid, listenerArray)
  }
  delete goog.events.listeners_[listener.key];
  return true
};
goog.events.unlistenWithWrapper = function(src, wrapper, listener, opt_capt, opt_handler) {
  wrapper.unlisten(src, listener, opt_capt, opt_handler)
};
goog.events.cleanUp = function(listenableKey) {
  delete goog.events.listeners_[listenableKey.key]
};
goog.events.cleanUp_ = function(type, capture, srcUid, listenerArray) {
  if(!listenerArray.locked_) {
    if(listenerArray.needsCleanup_) {
      for(var oldIndex = 0, newIndex = 0;oldIndex < listenerArray.length;oldIndex++) {
        if(listenerArray[oldIndex].removed) {
          var proxy = listenerArray[oldIndex].proxy;
          proxy.src = null;
          continue
        }
        if(oldIndex != newIndex) {
          listenerArray[newIndex] = listenerArray[oldIndex]
        }
        newIndex++
      }
      listenerArray.length = newIndex;
      listenerArray.needsCleanup_ = false;
      if(newIndex == 0) {
        delete goog.events.listenerTree_[type][capture][srcUid];
        goog.events.listenerTree_[type][capture].count_--;
        if(goog.events.listenerTree_[type][capture].count_ == 0) {
          delete goog.events.listenerTree_[type][capture];
          goog.events.listenerTree_[type].count_--
        }
        if(goog.events.listenerTree_[type].count_ == 0) {
          delete goog.events.listenerTree_[type]
        }
      }
    }
  }
};
goog.events.removeAll = function(opt_obj, opt_type) {
  var count = 0;
  var noObj = opt_obj == null;
  var noType = opt_type == null;
  if(!noObj) {
    if(opt_obj && goog.events.Listenable.isImplementedBy(opt_obj)) {
      return opt_obj.removeAllListeners(opt_type)
    }
    var srcUid = goog.getUid((opt_obj));
    if(goog.events.sources_[srcUid]) {
      var sourcesArray = goog.events.sources_[srcUid];
      for(var i = sourcesArray.length - 1;i >= 0;i--) {
        var listener = sourcesArray[i];
        if(noType || opt_type == listener.type) {
          goog.events.unlistenByKey(listener);
          count++
        }
      }
    }
  }else {
    goog.object.forEach(goog.events.listeners_, function(listener) {
      goog.events.unlistenByKey(listener);
      count++
    })
  }
  return count
};
goog.events.removeAllNativeListeners = function() {
  var count = 0;
  goog.object.forEach(goog.events.listeners_, function(listener) {
    var src = listener.src;
    if(!goog.events.Listenable.isImplementedBy(src)) {
      goog.events.unlistenByKey(listener);
      count++
    }
  });
  return count
};
goog.events.getListeners = function(obj, type, capture) {
  if(goog.events.Listenable.isImplementedBy(obj)) {
    return obj.getListeners(type, capture)
  }else {
    return goog.events.getListeners_(obj, type, capture) || []
  }
};
goog.events.getListeners_ = function(obj, type, capture) {
  var map = goog.events.listenerTree_;
  if(type in map) {
    map = map[type];
    if(capture in map) {
      map = map[capture];
      var objUid = goog.getUid(obj);
      if(map[objUid]) {
        return map[objUid]
      }
    }
  }
  return null
};
goog.events.getListener = function(src, type, listener, opt_capt, opt_handler) {
  var capture = !!opt_capt;
  listener = goog.events.wrapListener_(listener);
  if(goog.events.Listenable.isImplementedBy(src)) {
    return src.getListener((type), listener, capture, opt_handler)
  }
  var listenerArray = goog.events.getListeners_(src, type, capture);
  if(listenerArray) {
    for(var i = 0;i < listenerArray.length;i++) {
      if(!listenerArray[i].removed && listenerArray[i].listener == listener && listenerArray[i].capture == capture && listenerArray[i].handler == opt_handler) {
        return listenerArray[i]
      }
    }
  }
  return null
};
goog.events.hasListener = function(obj, opt_type, opt_capture) {
  if(goog.events.Listenable.isImplementedBy(obj)) {
    return obj.hasListener(opt_type, opt_capture)
  }
  var objUid = goog.getUid(obj);
  var listeners = goog.events.sources_[objUid];
  if(listeners) {
    var hasType = goog.isDef(opt_type);
    var hasCapture = goog.isDef(opt_capture);
    if(hasType && hasCapture) {
      var map = goog.events.listenerTree_[opt_type];
      return!!map && !!map[opt_capture] && objUid in map[opt_capture]
    }else {
      if(!(hasType || hasCapture)) {
        return true
      }else {
        return goog.array.some(listeners, function(listener) {
          return hasType && listener.type == opt_type || hasCapture && listener.capture == opt_capture
        })
      }
    }
  }
  return false
};
goog.events.expose = function(e) {
  var str = [];
  for(var key in e) {
    if(e[key] && e[key].id) {
      str.push(key + " = " + e[key] + " (" + e[key].id + ")")
    }else {
      str.push(key + " = " + e[key])
    }
  }
  return str.join("\n")
};
goog.events.getOnString_ = function(type) {
  if(type in goog.events.onStringMap_) {
    return goog.events.onStringMap_[type]
  }
  return goog.events.onStringMap_[type] = goog.events.onString_ + type
};
goog.events.fireListeners = function(obj, type, capture, eventObject) {
  if(goog.events.Listenable.isImplementedBy(obj)) {
    return obj.fireListeners(type, capture, eventObject)
  }
  var map = goog.events.listenerTree_;
  if(type in map) {
    map = map[type];
    if(capture in map) {
      return goog.events.fireListeners_(map[capture], obj, type, capture, eventObject)
    }
  }
  return true
};
goog.events.fireListeners_ = function(map, obj, type, capture, eventObject) {
  var retval = 1;
  var objUid = goog.getUid(obj);
  if(map[objUid]) {
    var remaining = --map.remaining_;
    var listenerArray = map[objUid];
    if(!listenerArray.locked_) {
      listenerArray.locked_ = 1
    }else {
      listenerArray.locked_++
    }
    try {
      var length = listenerArray.length;
      for(var i = 0;i < length;i++) {
        var listener = listenerArray[i];
        if(listener && !listener.removed) {
          retval &= goog.events.fireListener(listener, eventObject) !== false
        }
      }
    }finally {
      map.remaining_ = Math.max(remaining, map.remaining_);
      listenerArray.locked_--;
      goog.events.cleanUp_(type, capture, objUid, listenerArray)
    }
  }
  return Boolean(retval)
};
goog.events.fireListener = function(listener, eventObject) {
  if(listener.callOnce) {
    goog.events.unlistenByKey(listener)
  }
  return listener.handleEvent(eventObject)
};
goog.events.getTotalListenerCount = function() {
  return goog.object.getCount(goog.events.listeners_)
};
goog.events.dispatchEvent = function(src, e) {
  goog.asserts.assert(goog.events.Listenable.isImplementedBy(src), "Can not use goog.events.dispatchEvent with " + "non-goog.events.Listenable instance.");
  return src.dispatchEvent(e)
};
goog.events.protectBrowserEventEntryPoint = function(errorHandler) {
  goog.events.handleBrowserEvent_ = errorHandler.protectEntryPoint(goog.events.handleBrowserEvent_)
};
goog.events.handleBrowserEvent_ = function(listener, opt_evt) {
  if(listener.removed) {
    return true
  }
  var type = listener.type;
  var map = goog.events.listenerTree_;
  if(!(type in map)) {
    return true
  }
  map = map[type];
  var retval, targetsMap;
  if(!goog.events.BrowserFeature.HAS_W3C_EVENT_SUPPORT) {
    var ieEvent = opt_evt || (goog.getObjectByName("window.event"));
    var hasCapture = true in map;
    var hasBubble = false in map;
    if(hasCapture) {
      if(goog.events.isMarkedIeEvent_(ieEvent)) {
        return true
      }
      goog.events.markIeEvent_(ieEvent)
    }
    var evt = new goog.events.BrowserEvent;
    evt.init(ieEvent, (this));
    retval = true;
    try {
      if(hasCapture) {
        var ancestors = [];
        for(var parent = evt.currentTarget;parent;parent = parent.parentNode) {
          ancestors.push(parent)
        }
        targetsMap = map[true];
        targetsMap.remaining_ = targetsMap.count_;
        for(var i = ancestors.length - 1;!evt.propagationStopped_ && i >= 0 && targetsMap.remaining_;i--) {
          evt.currentTarget = ancestors[i];
          retval &= goog.events.fireListeners_(targetsMap, ancestors[i], type, true, evt)
        }
        if(hasBubble) {
          targetsMap = map[false];
          targetsMap.remaining_ = targetsMap.count_;
          for(var i = 0;!evt.propagationStopped_ && i < ancestors.length && targetsMap.remaining_;i++) {
            evt.currentTarget = ancestors[i];
            retval &= goog.events.fireListeners_(targetsMap, ancestors[i], type, false, evt)
          }
        }
      }else {
        retval = goog.events.fireListener(listener, evt)
      }
    }finally {
      if(ancestors) {
        ancestors.length = 0
      }
    }
    return retval
  }
  var be = new goog.events.BrowserEvent(opt_evt, (this));
  retval = goog.events.fireListener(listener, be);
  return retval
};
goog.events.markIeEvent_ = function(e) {
  var useReturnValue = false;
  if(e.keyCode == 0) {
    try {
      e.keyCode = -1;
      return
    }catch(ex) {
      useReturnValue = true
    }
  }
  if(useReturnValue || (e.returnValue) == undefined) {
    e.returnValue = true
  }
};
goog.events.isMarkedIeEvent_ = function(e) {
  return e.keyCode < 0 || e.returnValue != undefined
};
goog.events.uniqueIdCounter_ = 0;
goog.events.getUniqueId = function(identifier) {
  return identifier + "_" + goog.events.uniqueIdCounter_++
};
goog.events.LISTENER_WRAPPER_PROP_ = "__closure_events_fn_" + (Math.random() * 1E9 >>> 0);
goog.events.wrapListener_ = function(listener) {
  goog.asserts.assert(listener, "Listener can not be null.");
  if(goog.isFunction(listener)) {
    return listener
  }
  goog.asserts.assert(listener.handleEvent, "An object listener must have handleEvent method.");
  return listener[goog.events.LISTENER_WRAPPER_PROP_] || (listener[goog.events.LISTENER_WRAPPER_PROP_] = function(e) {
    return listener.handleEvent(e)
  })
};
goog.debug.entryPointRegistry.register(function(transformer) {
  goog.events.handleBrowserEvent_ = transformer(goog.events.handleBrowserEvent_)
});
goog.provide("goog.events.EventTarget");
goog.require("goog.Disposable");
goog.require("goog.array");
goog.require("goog.asserts");
goog.require("goog.events");
goog.require("goog.events.Event");
goog.require("goog.events.Listenable");
goog.require("goog.events.Listener");
goog.require("goog.object");
goog.events.EventTarget = function() {
  goog.Disposable.call(this);
  this.eventTargetListeners_ = {};
  this.actualEventTarget_ = this
};
goog.inherits(goog.events.EventTarget, goog.Disposable);
goog.events.Listenable.addImplementation(goog.events.EventTarget);
goog.events.EventTarget.MAX_ANCESTORS_ = 1E3;
goog.events.EventTarget.prototype.parentEventTarget_ = null;
goog.events.EventTarget.prototype.getParentEventTarget = function() {
  return this.parentEventTarget_
};
goog.events.EventTarget.prototype.setParentEventTarget = function(parent) {
  this.parentEventTarget_ = parent
};
goog.events.EventTarget.prototype.addEventListener = function(type, handler, opt_capture, opt_handlerScope) {
  goog.events.listen(this, type, handler, opt_capture, opt_handlerScope)
};
goog.events.EventTarget.prototype.removeEventListener = function(type, handler, opt_capture, opt_handlerScope) {
  goog.events.unlisten(this, type, handler, opt_capture, opt_handlerScope)
};
goog.events.EventTarget.prototype.dispatchEvent = function(e) {
  this.assertInitialized_();
  var ancestorsTree, ancestor = this.getParentEventTarget();
  if(ancestor) {
    ancestorsTree = [];
    var ancestorCount = 1;
    for(;ancestor;ancestor = ancestor.getParentEventTarget()) {
      ancestorsTree.push(ancestor);
      goog.asserts.assert(++ancestorCount < goog.events.EventTarget.MAX_ANCESTORS_, "infinite loop")
    }
  }
  return goog.events.EventTarget.dispatchEventInternal_(this.actualEventTarget_, e, ancestorsTree)
};
goog.events.EventTarget.prototype.disposeInternal = function() {
  goog.events.EventTarget.superClass_.disposeInternal.call(this);
  this.removeAllListeners();
  this.parentEventTarget_ = null
};
goog.events.EventTarget.prototype.assertInitialized_ = function() {
  goog.asserts.assert(this.eventTargetListeners_, "Event target is not initialized. Did you call superclass " + "(goog.events.EventTarget) constructor?")
};
goog.events.EventTarget.prototype.listen = function(type, listener, opt_useCapture, opt_listenerScope) {
  return this.listenInternal_(type, listener, false, opt_useCapture, opt_listenerScope)
};
goog.events.EventTarget.prototype.listenOnce = function(type, listener, opt_useCapture, opt_listenerScope) {
  return this.listenInternal_(type, listener, true, opt_useCapture, opt_listenerScope)
};
goog.events.EventTarget.prototype.listenInternal_ = function(type, listener, callOnce, opt_useCapture, opt_listenerScope) {
  this.assertInitialized_();
  var listenerArray = this.eventTargetListeners_[type] || (this.eventTargetListeners_[type] = []);
  var listenerObj;
  var index = goog.events.EventTarget.findListenerIndex_(listenerArray, listener, opt_useCapture, opt_listenerScope);
  if(index > -1) {
    listenerObj = listenerArray[index];
    if(!callOnce) {
      listenerObj.callOnce = false
    }
    return listenerObj
  }
  listenerObj = new goog.events.Listener(listener, null, this, type, !!opt_useCapture, opt_listenerScope);
  listenerObj.callOnce = callOnce;
  listenerArray.push(listenerObj);
  return listenerObj
};
goog.events.EventTarget.prototype.unlisten = function(type, listener, opt_useCapture, opt_listenerScope) {
  if(!(type in this.eventTargetListeners_)) {
    return false
  }
  var listenerArray = this.eventTargetListeners_[type];
  var index = goog.events.EventTarget.findListenerIndex_(listenerArray, listener, opt_useCapture, opt_listenerScope);
  if(index > -1) {
    var listenerObj = listenerArray[index];
    goog.events.cleanUp(listenerObj);
    listenerObj.removed = true;
    return goog.array.removeAt(listenerArray, index)
  }
  return false
};
goog.events.EventTarget.prototype.unlistenByKey = function(key) {
  var type = key.type;
  if(!(type in this.eventTargetListeners_)) {
    return false
  }
  var removed = goog.array.remove(this.eventTargetListeners_[type], key);
  if(removed) {
    goog.events.cleanUp(key);
    key.removed = true
  }
  return removed
};
goog.events.EventTarget.prototype.removeAllListeners = function(opt_type, opt_capture) {
  var count = 0;
  for(var type in this.eventTargetListeners_) {
    if(!opt_type || type == opt_type) {
      var listenerArray = this.eventTargetListeners_[type];
      for(var i = 0;i < listenerArray.length;i++) {
        ++count;
        goog.events.cleanUp(listenerArray[i]);
        listenerArray[i].removed = true
      }
      listenerArray.length = 0
    }
  }
  return count
};
goog.events.EventTarget.prototype.fireListeners = function(type, capture, eventObject) {
  if(!(type in this.eventTargetListeners_)) {
    return true
  }
  var rv = true;
  var listenerArray = goog.array.clone(this.eventTargetListeners_[type]);
  for(var i = 0;i < listenerArray.length;++i) {
    var listener = listenerArray[i];
    if(listener && !listener.removed && listener.capture == capture) {
      if(listener.callOnce) {
        this.unlistenByKey(listener)
      }
      rv = listener.handleEvent(eventObject) !== false && rv
    }
  }
  return rv && eventObject.returnValue_ != false
};
goog.events.EventTarget.prototype.getListeners = function(type, capture) {
  var listenerArray = this.eventTargetListeners_[type];
  var rv = [];
  if(listenerArray) {
    for(var i = 0;i < listenerArray.length;++i) {
      var listenerObj = listenerArray[i];
      if(listenerObj.capture == capture) {
        rv.push(listenerObj)
      }
    }
  }
  return rv
};
goog.events.EventTarget.prototype.getListener = function(type, listener, capture, opt_listenerScope) {
  var listenerArray = this.eventTargetListeners_[type];
  var i = -1;
  if(listenerArray) {
    i = goog.events.EventTarget.findListenerIndex_(listenerArray, listener, capture, opt_listenerScope)
  }
  return i > -1 ? listenerArray[i] : null
};
goog.events.EventTarget.prototype.hasListener = function(opt_type, opt_capture) {
  var hasType = goog.isDef(opt_type);
  var hasCapture = goog.isDef(opt_capture);
  return goog.object.some(this.eventTargetListeners_, function(listenersArray, type) {
    for(var i = 0;i < listenersArray.length;++i) {
      if((!hasType || listenersArray[i].type == opt_type) && (!hasCapture || listenersArray[i].capture == opt_capture)) {
        return true
      }
    }
    return false
  })
};
goog.events.EventTarget.prototype.setTargetForTesting = function(target) {
  this.actualEventTarget_ = target
};
goog.events.EventTarget.dispatchEventInternal_ = function(target, e, opt_ancestorsTree) {
  var type = e.type || (e);
  if(goog.isString(e)) {
    e = new goog.events.Event(e, target)
  }else {
    if(!(e instanceof goog.events.Event)) {
      var oldEvent = e;
      e = new goog.events.Event(type, target);
      goog.object.extend(e, oldEvent)
    }else {
      e.target = e.target || target
    }
  }
  var rv = true, currentTarget;
  if(opt_ancestorsTree) {
    for(var i = opt_ancestorsTree.length - 1;!e.propagationStopped_ && i >= 0;i--) {
      currentTarget = e.currentTarget = opt_ancestorsTree[i];
      rv = currentTarget.fireListeners(type, true, e) && rv
    }
  }
  if(!e.propagationStopped_) {
    currentTarget = e.currentTarget = target;
    rv = currentTarget.fireListeners(type, true, e) && rv;
    if(!e.propagationStopped_) {
      rv = currentTarget.fireListeners(type, false, e) && rv
    }
  }
  if(opt_ancestorsTree) {
    for(i = 0;!e.propagationStopped_ && i < opt_ancestorsTree.length;i++) {
      currentTarget = e.currentTarget = opt_ancestorsTree[i];
      rv = currentTarget.fireListeners(type, false, e) && rv
    }
  }
  return rv
};
goog.events.EventTarget.findListenerIndex_ = function(listenerArray, listener, opt_useCapture, opt_listenerScope) {
  for(var i = 0;i < listenerArray.length;++i) {
    var listenerObj = listenerArray[i];
    if(listenerObj.listener == listener && listenerObj.capture == !!opt_useCapture && listenerObj.handler == opt_listenerScope) {
      return i
    }
  }
  return-1
};
goog.provide("goog.Timer");
goog.require("goog.events.EventTarget");
goog.Timer = function(opt_interval, opt_timerObject) {
  goog.events.EventTarget.call(this);
  this.interval_ = opt_interval || 1;
  this.timerObject_ = opt_timerObject || goog.Timer.defaultTimerObject;
  this.boundTick_ = goog.bind(this.tick_, this);
  this.last_ = goog.now()
};
goog.inherits(goog.Timer, goog.events.EventTarget);
goog.Timer.MAX_TIMEOUT_ = 2147483647;
goog.Timer.prototype.enabled = false;
goog.Timer.defaultTimerObject = goog.global;
goog.Timer.intervalScale = 0.8;
goog.Timer.prototype.timer_ = null;
goog.Timer.prototype.getInterval = function() {
  return this.interval_
};
goog.Timer.prototype.setInterval = function(interval) {
  this.interval_ = interval;
  if(this.timer_ && this.enabled) {
    this.stop();
    this.start()
  }else {
    if(this.timer_) {
      this.stop()
    }
  }
};
goog.Timer.prototype.tick_ = function() {
  if(this.enabled) {
    var elapsed = goog.now() - this.last_;
    if(elapsed > 0 && elapsed < this.interval_ * goog.Timer.intervalScale) {
      this.timer_ = this.timerObject_.setTimeout(this.boundTick_, this.interval_ - elapsed);
      return
    }
    if(this.timer_) {
      this.timerObject_.clearTimeout(this.timer_);
      this.timer_ = null
    }
    this.dispatchTick();
    if(this.enabled) {
      this.timer_ = this.timerObject_.setTimeout(this.boundTick_, this.interval_);
      this.last_ = goog.now()
    }
  }
};
goog.Timer.prototype.dispatchTick = function() {
  this.dispatchEvent(goog.Timer.TICK)
};
goog.Timer.prototype.start = function() {
  this.enabled = true;
  if(!this.timer_) {
    this.timer_ = this.timerObject_.setTimeout(this.boundTick_, this.interval_);
    this.last_ = goog.now()
  }
};
goog.Timer.prototype.stop = function() {
  this.enabled = false;
  if(this.timer_) {
    this.timerObject_.clearTimeout(this.timer_);
    this.timer_ = null
  }
};
goog.Timer.prototype.disposeInternal = function() {
  goog.Timer.superClass_.disposeInternal.call(this);
  this.stop();
  delete this.timerObject_
};
goog.Timer.TICK = "tick";
goog.Timer.callOnce = function(listener, opt_delay, opt_handler) {
  if(goog.isFunction(listener)) {
    if(opt_handler) {
      listener = goog.bind(listener, opt_handler)
    }
  }else {
    if(listener && typeof listener.handleEvent == "function") {
      listener = goog.bind(listener.handleEvent, listener)
    }else {
      throw Error("Invalid listener argument");
    }
  }
  if(opt_delay > goog.Timer.MAX_TIMEOUT_) {
    return-1
  }else {
    return goog.Timer.defaultTimerObject.setTimeout(listener, opt_delay || 0)
  }
};
goog.Timer.clear = function(timerId) {
  goog.Timer.defaultTimerObject.clearTimeout(timerId)
};
goog.provide("goog.async.DeferredList");
goog.require("goog.async.Deferred");
goog.async.DeferredList = function(list, opt_fireOnOneCallback, opt_fireOnOneErrback, opt_consumeErrors, opt_canceler, opt_defaultScope) {
  goog.base(this, opt_canceler, opt_defaultScope);
  this.list_ = list;
  this.deferredResults_ = [];
  this.fireOnOneCallback_ = !!opt_fireOnOneCallback;
  this.fireOnOneErrback_ = !!opt_fireOnOneErrback;
  this.consumeErrors_ = !!opt_consumeErrors;
  this.numFinished_ = 0;
  for(var i = 0;i < list.length;i++) {
    var d = list[i];
    d.addCallbacks(goog.bind(this.handleCallback_, this, i, true), goog.bind(this.handleCallback_, this, i, false))
  }
  if(list.length == 0 && !this.fireOnOneCallback_) {
    this.callback(this.deferredResults_)
  }
};
goog.inherits(goog.async.DeferredList, goog.async.Deferred);
goog.async.DeferredList.prototype.handleCallback_ = function(index, success, result) {
  this.numFinished_++;
  this.deferredResults_[index] = [success, result];
  if(!this.hasFired()) {
    if(this.fireOnOneCallback_ && success) {
      this.callback([index, result])
    }else {
      if(this.fireOnOneErrback_ && !success) {
        this.errback(result)
      }else {
        if(this.numFinished_ == this.list_.length) {
          this.callback(this.deferredResults_)
        }
      }
    }
  }
  if(this.consumeErrors_ && !success) {
    result = null
  }
  return result
};
goog.async.DeferredList.prototype.errback = function(res) {
  goog.base(this, "errback", res);
  for(var i = 0;i < this.list_.length;i++) {
    this.list_[i].cancel()
  }
};
goog.async.DeferredList.gatherResults = function(list) {
  return(new goog.async.DeferredList(list, false, true)).addCallback(function(results) {
    var output = [];
    for(var i = 0;i < results.length;i++) {
      output[i] = results[i][1]
    }
    return output
  })
};
goog.provide("ydn.async");
goog.require("goog.async.Deferred");
goog.require("goog.async.DeferredList");
ydn.async.reduceAllTrue = function(dfl) {
  var df = new goog.async.Deferred;
  dfl.addCallback(function(list) {
    var all_ok = list.every(function(x) {
      return!!x
    });
    if(all_ok) {
      df.callback(true)
    }else {
      df.errback(undefined)
    }
  });
  dfl.addErrback(function(x) {
    df.errback(x)
  });
  return df
};
ydn.async.all = function(df_arr) {
  var df_list = [];
  for(var idf, i = 0;idf = df_arr[i];i++) {
    var df = new goog.async.Deferred;
    idf["success"](goog.partial(function(df, x) {
      df.callback(x)
    }, df));
    idf["error"](goog.partial(function(df, x) {
      df.errback(x)
    }, df));
    df_list[i] = df
  }
  return new goog.async.DeferredList(df_list)
};
goog.provide("ydn.db.con.IDatabase");
goog.require("goog.async.Deferred");
ydn.db.con.IDatabase = function() {
};
ydn.db.con.IDatabase.prototype.close = function() {
};
ydn.db.con.IDatabase.prototype.getType = function() {
};
ydn.db.con.IDatabase.prototype.isReady = function() {
};
ydn.db.con.IDatabase.prototype.connect = function(name, schema) {
};
ydn.db.con.IDatabase.prototype.getVersion = goog.abstractMethod;
ydn.db.con.IDatabase.prototype.getDbInstance = function() {
};
ydn.db.con.IDatabase.Transaction;
ydn.db.con.IDatabase.prototype.doTransaction = goog.abstractMethod;
ydn.db.con.IDatabase.prototype.getSchema = goog.abstractMethod;
goog.provide("ydn.db.Key");
ydn.db.Key = function(store_or_json_or_value, opt_id, opt_parent) {
  var store_name;
  if(goog.isObject(store_or_json_or_value)) {
    store_name = store_or_json_or_value["store"];
    opt_id = store_or_json_or_value["id"];
    if(goog.isDefAndNotNull(store_or_json_or_value["parent"])) {
      opt_parent = new ydn.db.Key(store_or_json_or_value["parent"])
    }
  }else {
    goog.asserts.assertString(store_or_json_or_value);
    if(!goog.isDef(opt_id)) {
      var idx = store_or_json_or_value.lastIndexOf(ydn.db.Key.SEP_PARENT);
      var store_and_id = store_or_json_or_value;
      if(idx > 0) {
        store_and_id = store_or_json_or_value.substr(idx);
        opt_parent = new ydn.db.Key(store_or_json_or_value.substring(0, idx))
      }
      var parts = store_and_id.split(ydn.db.Key.SEP_STORE);
      store_name = parts[0];
      opt_id = parts[1];
      if(!goog.isDef(opt_id)) {
        throw Error("Invalid key value: " + store_or_json_or_value);
      }
    }else {
      store_name = store_or_json_or_value
    }
  }
  this.store_name = store_name;
  this.id = opt_id;
  this.parent = opt_parent || null
};
var IDBKey;
ydn.db.Key.Json;
ydn.db.Key.prototype.id;
ydn.db.Key.prototype.store_name;
ydn.db.Key.prototype.parent;
ydn.db.Key.prototype.toJSON = function() {
  var obj = {"store":this.store_name, "id":this.id};
  if(this.parent) {
    obj["parent"] = this.parent.toJSON()
  }
  return obj
};
ydn.db.Key.SEP_PARENT = "^|";
ydn.db.Key.SEP_STORE = "^:";
ydn.db.Key.prototype.valueOf = function() {
  var parent_value = this.parent ? this.parent.valueOf() + ydn.db.Key.SEP_PARENT : "";
  return parent_value + this.store_name + ydn.db.Key.SEP_STORE + this.id
};
ydn.db.Key.prototype.toString = function() {
  return this.valueOf().replace("^|", "|").replace("^:", ":")
};
ydn.db.Key.prototype.getStoreName = function() {
  return this.store_name
};
ydn.db.Key.prototype.getId = function() {
  return this.id
};
ydn.db.Key.prototype.getNormalizedId = function() {
  if(goog.isArray(this.id)) {
    return this.id.join(ydn.db.Key.SEP_PARENT)
  }else {
    if(this.id instanceof Date) {
      return+this.id
    }else {
      return(this.id)
    }
  }
};
ydn.db.Key.prototype.getParent = function() {
  return this.parent
};
ydn.db.Key.isValidKey = function(key) {
  return goog.isNumber(key) || goog.isString(key) || goog.isArray(key) && goog.array.every((key), ydn.db.Key.isValidKey) || key instanceof Date
};
ydn.db.Key.clone = function(key) {
  if(goog.isArrayLike(key)) {
    var clone = [];
    for(var i = 0, n = key.length;i < n;i++) {
      clone[i] = key[i]
    }
    return(clone)
  }else {
    return key
  }
};
goog.provide("ydn.db.IDBKeyRange");
goog.provide("ydn.db.KeyRange");
ydn.db.KeyRange = function(lower, upper, lowerOpen, upperOpen) {
  this["lower"] = lower;
  this["upper"] = upper;
  this["lowerOpen"] = !!lowerOpen;
  this["upperOpen"] = !!upperOpen;
  if(goog.DEBUG && goog.isFunction(Object.freeze)) {
    Object.freeze((this))
  }
};
ydn.db.KeyRange.prototype.lower = undefined;
ydn.db.KeyRange.prototype.upper = undefined;
ydn.db.KeyRange.prototype.lowerOpen;
ydn.db.KeyRange.prototype.upperOpen;
ydn.db.KeyRange.prototype.toJSON = function() {
  return ydn.db.KeyRange.toJSON(this)
};
ydn.db.KeyRange.prototype.toIDBKeyRange = function() {
  return ydn.db.KeyRange.parseIDBKeyRange(this)
};
ydn.db.KeyRange.clone = function(kr) {
  if(goog.isDefAndNotNull(kr)) {
    return new ydn.db.KeyRange((kr.lower), (kr.upper), !!kr.lowerOpen, !!kr.upperOpen)
  }else {
    return undefined
  }
};
ydn.db.KeyRange.only = function(value) {
  return new ydn.db.KeyRange(value, value, false, false)
};
ydn.db.KeyRange.bound = function(lower, upper, opt_lowerOpen, opt_upperOpen) {
  return new ydn.db.KeyRange(lower, upper, opt_lowerOpen, opt_upperOpen)
};
ydn.db.KeyRange.upperBound = function(upper, opt_upperOpen) {
  return new ydn.db.KeyRange(undefined, upper, undefined, !!opt_upperOpen)
};
ydn.db.KeyRange.lowerBound = function(lower, opt_lowerOpen) {
  return new ydn.db.KeyRange(lower, undefined, !!opt_lowerOpen, undefined)
};
ydn.db.KeyRange.starts = function(value) {
  var value_upper;
  if(goog.isArray(value)) {
    value_upper = goog.array.clone(value);
    value_upper.push("\uffff")
  }else {
    if(goog.isString(value)) {
      value_upper = value + "\uffff"
    }else {
      throw new ydn.debug.error.ArgumentException;
    }
  }
  return ydn.db.KeyRange.bound(value, value_upper, false, true)
};
ydn.db.KeyRange.toJSON = function(keyRange) {
  keyRange = keyRange || ({});
  var out = {"lower":keyRange["lower"], "upper":keyRange["upper"], "lowerOpen":keyRange["lowerOpen"], "upperOpen":keyRange["upperOpen"]};
  return out
};
ydn.db.KeyRange.parseKeyRange = function(key_range) {
  if(!goog.isDefAndNotNull(key_range)) {
    return null
  }
  if(key_range instanceof ydn.db.KeyRange) {
    return key_range
  }
  if(goog.isObject(key_range)) {
    return new ydn.db.KeyRange(key_range["lower"], key_range["upper"], key_range["lowerOpen"], key_range["upperOpen"])
  }else {
    throw new ydn.debug.error.ArgumentException("Invalid key range: " + key_range + " of type " + typeof key_range);
  }
};
ydn.db.KeyRange.parseIDBKeyRange = function(opt_key_range) {
  if(goog.isDefAndNotNull(opt_key_range)) {
    var key_range = opt_key_range;
    if(goog.isDefAndNotNull(key_range["upper"]) && goog.isDefAndNotNull(key_range["lower"])) {
      return ydn.db.IDBKeyRange.bound(key_range.lower, key_range.upper, !!key_range["lowerOpen"], !!key_range["upperOpen"])
    }else {
      if(goog.isDefAndNotNull(key_range.upper)) {
        return ydn.db.IDBKeyRange.upperBound(key_range.upper, key_range.upperOpen)
      }else {
        if(goog.isDefAndNotNull(key_range.lower)) {
          return ydn.db.IDBKeyRange.lowerBound(key_range.lower, key_range.lowerOpen)
        }else {
          return null
        }
      }
    }
  }else {
    return null
  }
};
ydn.db.KeyRange.validate = function(keyRange) {
  if(keyRange instanceof ydn.db.KeyRange) {
    return""
  }else {
    if(goog.isDefAndNotNull(keyRange)) {
      if(goog.isObject(keyRange)) {
        for(var key in keyRange) {
          if(keyRange.hasOwnProperty(key)) {
            if(!goog.array.contains(["lower", "upper", "lowerOpen", "upperOpen"], key)) {
              return'invalid attribute "' + key + '" in key range object'
            }
          }
        }
        return""
      }else {
        return"key range must be an object"
      }
    }else {
      return""
    }
  }
};
ydn.db.KeyRange.prototype.and = function(that) {
  var lower = this.lower;
  var upper = this.upper;
  var lowerOpen = this.lowerOpen;
  var upperOpen = this.upperOpen;
  if(goog.isDefAndNotNull(that.lower) && (!goog.isDefAndNotNull(this.lower) || that.lower >= this.lower)) {
    lower = that.lower;
    lowerOpen = that.lowerOpen || this.lowerOpen
  }
  if(goog.isDefAndNotNull(that.upper) && (!goog.isDefAndNotNull(this.upper) || that.upper <= this.upper)) {
    upper = that.upper;
    upperOpen = that.upperOpen || this.upperOpen
  }
  return ydn.db.KeyRange.bound(lower, upper, lowerOpen, upperOpen)
};
ydn.db.KeyRange.toString = function(kr) {
  if(!kr) {
    return""
  }
  var str = kr.lowerOpen ? " (" : " [";
  if(goog.isDefAndNotNull(kr.lower)) {
    str += kr.lower + ", "
  }
  if(goog.isDefAndNotNull(kr.upper)) {
    str += kr.upper
  }
  str += kr.upperOpen ? ")" : "]";
  return str
};
ydn.db.KeyRange.toSql = function(quoted_column_name, type, key_range, wheres, params) {
  if(!key_range) {
    return
  }
  if(!key_range.lowerOpen && !key_range.upperOpen && goog.isDefAndNotNull(key_range.lower) && goog.isDefAndNotNull(key_range.upper) && ydn.db.cmp(key_range.lower, key_range.upper) === 0) {
    wheres.push(quoted_column_name + " = ?");
    params.push(ydn.db.schema.Index.js2sql(key_range.lower, type))
  }else {
    if(goog.isDefAndNotNull(key_range.lower)) {
      var op = key_range.lowerOpen ? " > " : " >= ";
      wheres.push(quoted_column_name + op + "?");
      params.push(ydn.db.schema.Index.js2sql(key_range.lower, type))
    }
    if(goog.isDefAndNotNull(key_range.upper)) {
      var op = key_range.upperOpen ? " < " : " <= ";
      wheres.push(quoted_column_name + op + "?");
      params.push(ydn.db.schema.Index.js2sql(key_range.upper, type))
    }
  }
};
ydn.db.KeyRange.where = function(op, value, opt_op2, opt_value2) {
  var upper, lower, upperOpen, lowerOpen;
  if(op == "^") {
    goog.asserts.assert(goog.isString(value) || goog.isArray(value), "value");
    goog.asserts.assert(!goog.isDef(opt_op2), "op2");
    goog.asserts.assert(!goog.isDef(opt_value2), "value2");
    return ydn.db.KeyRange.starts((value))
  }else {
    if(op == "<" || op == "<=") {
      upper = value;
      upperOpen = op == "<"
    }else {
      if(op == ">" || op == ">=") {
        lower = value;
        lowerOpen = op == ">"
      }else {
        if(op == "=" || op == "==") {
          lower = value;
          upper = value
        }else {
          throw new ydn.debug.error.ArgumentException("invalid op: " + op);
        }
      }
    }
  }
  if(opt_op2 == "<" || opt_op2 == "<=") {
    upper = opt_value2;
    upperOpen = opt_op2 == "<"
  }else {
    if(opt_op2 == ">" || opt_op2 == ">=") {
      lower = opt_value2;
      lowerOpen = opt_op2 == ">"
    }else {
      if(goog.isDef(opt_op2)) {
        throw new ydn.debug.error.ArgumentException("invalid op2: " + opt_op2);
      }
    }
  }
  return ydn.db.KeyRange.bound(lower, upper, lowerOpen, upperOpen)
};
ydn.db.IDBKeyRange = goog.global.IDBKeyRange || goog.global.webkitIDBKeyRange || ydn.db.KeyRange;
goog.provide("ydn.debug.error.ArgumentException");
goog.provide("ydn.debug.error.NotSupportedException");
goog.provide("ydn.debug.error.NotImplementedException");
goog.provide("ydn.debug.error.InvalidOperationException");
goog.provide("ydn.debug.error.InternalError");
goog.require("goog.debug.Error");
ydn.debug.error.ArgumentException = function(opt_msg) {
  goog.base(this, opt_msg);
  this.name = "ydn.error.ArgumentException"
};
goog.inherits(ydn.debug.error.ArgumentException, goog.debug.Error);
ydn.debug.error.NotSupportedException = function(opt_msg) {
  goog.base(this, opt_msg);
  this.name = "ydn.error.NotSupportedException"
};
goog.inherits(ydn.debug.error.NotSupportedException, goog.debug.Error);
ydn.debug.error.NotImplementedException = function(opt_msg) {
  goog.base(this, opt_msg);
  this.name = "ydn.error.NotImplementedException"
};
goog.inherits(ydn.debug.error.NotImplementedException, goog.debug.Error);
ydn.debug.error.InvalidOperationException = function(opt_msg) {
  goog.base(this, opt_msg);
  this.name = "ydn.error.InvalidOperationException"
};
goog.inherits(ydn.debug.error.InvalidOperationException, goog.debug.Error);
ydn.debug.error.InternalError = function(opt_msg) {
  if(Error.captureStackTrace) {
    Error.captureStackTrace(this, ydn.debug.error.InternalError)
  }else {
    this.stack = (new Error).stack || ""
  }
  if(opt_msg) {
    this.message = String(opt_msg)
  }
  this.name = "ydn.error.InternalError"
};
goog.inherits(ydn.debug.error.InternalError, Error);
ydn.debug.error.InternalError.prototype.name = "ydn.error.InternalError";
goog.provide("ydn.db.schema.DataType");
goog.provide("ydn.db.schema.Index");
goog.require("ydn.db.base");
goog.require("ydn.db.utils");
goog.require("ydn.debug.error.ArgumentException");
ydn.db.schema.Index = function(keyPath, opt_type, opt_unique, opt_multi_entry, opt_index_name) {
  if(!goog.isDef(opt_index_name)) {
    if(goog.isArray(keyPath)) {
      opt_index_name = keyPath.join(", ")
    }else {
      opt_index_name = keyPath
    }
  }
  if(goog.isDefAndNotNull(keyPath) && !goog.isString(keyPath) && !goog.isArrayLike(keyPath)) {
    throw new ydn.debug.error.ArgumentException("index keyPath for " + opt_index_name + " must be a string or array, but " + keyPath + " is " + typeof keyPath);
  }
  if(goog.DEBUG && goog.isArray(keyPath) && Object.freeze) {
    Object.freeze((keyPath))
  }
  if(!goog.isDef(keyPath) && goog.isDef(opt_index_name)) {
    keyPath = opt_index_name
  }
  this.keyPath = keyPath;
  this.is_composite_ = goog.isArrayLike(this.keyPath);
  this.name = opt_index_name;
  this.type = ydn.db.schema.Index.toType(opt_type);
  if(goog.isDef(opt_type)) {
    if(!goog.isDef(this.type)) {
      throw new ydn.debug.error.ArgumentException("type invalid in index: " + this.name);
    }
    if(goog.isArray(this.keyPath)) {
      throw new ydn.debug.error.ArgumentException('composite key for store "' + this.name + '" must not specified type');
    }
  }
  this.unique = !!opt_unique;
  this.multiEntry = !!opt_multi_entry;
  this.keyColumnType_ = goog.isString(this.type) ? this.type : ydn.db.schema.DataType.TEXT;
  this.index_column_name_ = goog.isString(opt_index_name) ? opt_index_name : goog.isArray(keyPath) ? this.keyPath.join(",") : keyPath;
  this.index_column_name_quoted_ = goog.string.quote(this.index_column_name_);
  this.key_paths_ = !this.is_composite_ && !this.multiEntry ? this.keyPath.split(".") : null
};
ydn.db.schema.Index.prototype.extractKey = function(obj) {
  if(goog.isDefAndNotNull(obj)) {
    if(goog.isArrayLike(this.keyPath)) {
      var key = [];
      for(var i = 0, n = this.keyPath.length;i < n;i++) {
        var i_key = ydn.db.utils.getValueByKeys(obj, this.keyPath[i]);
        goog.asserts.assert(goog.isDefAndNotNull(i_key), ydn.json.toShortString(obj) + " does not issue require composite key value " + i + " of " + n + ' on index "' + this.name + '"');
        key[i] = i_key
      }
      return key
    }else {
      return(ydn.db.utils.getValueByKeys(obj, this.keyPath))
    }
  }
};
ydn.db.schema.Index.prototype.applyValue = function(obj, value) {
  for(var i = 0;i < this.key_paths_.length;i++) {
    if(i == this.key_paths_.length - 1) {
      obj[this.key_paths_[i]] = value
    }else {
      if(!goog.isObject(obj[this.key_paths_[i]])) {
        obj[this.key_paths_[i]] = {}
      }
    }
  }
};
ydn.db.schema.Index.prototype.name;
ydn.db.schema.Index.prototype.keyColumnType_;
ydn.db.schema.Index.prototype.keyPath;
ydn.db.schema.Index.prototype.key_paths_;
ydn.db.schema.Index.prototype.multiEntry;
ydn.db.schema.Index.prototype.is_composite_;
ydn.db.schema.Index.prototype.unique;
ydn.db.schema.DataType = {BLOB:"BLOB", DATE:"DATE", INTEGER:"INTEGER", NUMERIC:"NUMERIC", TEXT:"TEXT"};
ydn.db.DataTypeAbbr = {DATE:"d", NUMERIC:"n", TEXT:"t", BLOB:"b"};
ydn.db.schema.Index.ARRAY_SEP = String.fromCharCode(31);
ydn.db.schema.Index.js2sql = function(key, type) {
  if(type == ydn.db.schema.DataType.DATE) {
    if(key instanceof Date) {
      return+key
    }
  }else {
    if(goog.isDef(type)) {
      return key
    }else {
      return ydn.db.utils.encodeKey(key)
    }
  }
};
ydn.db.schema.Index.sql2js = function(key, type) {
  if(type == ydn.db.schema.DataType.DATE) {
    return new Date(key)
  }else {
    if(goog.isDef(type)) {
      return(key)
    }else {
      return ydn.db.utils.decodeKey((key))
    }
  }
};
ydn.db.schema.Index.TYPES = [ydn.db.schema.DataType.BLOB, ydn.db.schema.DataType.DATE, ydn.db.schema.DataType.INTEGER, ydn.db.schema.DataType.NUMERIC, ydn.db.schema.DataType.TEXT];
ydn.db.schema.Index.toType = function(opt_type) {
  if(goog.isString(opt_type)) {
    var idx = goog.array.indexOf(ydn.db.schema.Index.TYPES, opt_type);
    return ydn.db.schema.Index.TYPES[idx]
  }else {
    return undefined
  }
};
ydn.db.schema.Index.toAbbrType = function(x) {
  if(x instanceof Date) {
    return ydn.db.DataTypeAbbr.DATE
  }else {
    if(goog.isNumber(x)) {
      return ydn.db.DataTypeAbbr.NUMERIC
    }else {
      if(goog.isString(x)) {
        return ydn.db.DataTypeAbbr.TEXT
      }else {
        return ydn.db.DataTypeAbbr.BLOB
      }
    }
  }
};
ydn.db.schema.Index.type2AbbrType = function(x) {
  if(x === ydn.db.schema.DataType.DATE) {
    return ydn.db.DataTypeAbbr.DATE
  }else {
    if(x === ydn.db.schema.DataType.NUMERIC) {
      return ydn.db.DataTypeAbbr.NUMERIC
    }else {
      if(x === ydn.db.schema.DataType.TEXT) {
        return ydn.db.DataTypeAbbr.TEXT
      }else {
        return ydn.db.DataTypeAbbr.BLOB
      }
    }
  }
};
ydn.db.schema.Index.prototype.getType = function() {
  return this.type
};
ydn.db.schema.Index.prototype.getSqlType = function() {
  return this.keyColumnType_
};
ydn.db.schema.Index.prototype.getName = function() {
  return this.name
};
ydn.db.schema.Index.prototype.isMultiEntry = function() {
  return this.multiEntry
};
ydn.db.schema.Index.prototype.isComposite = function() {
  return this.is_composite_
};
ydn.db.schema.Index.prototype.isUnique = function() {
  return this.unique
};
ydn.db.schema.Index.prototype.toJSON = function() {
  return{"name":this.name, "keyPath":this.keyPath, "type":this.type, "unique":this.unique, "multiEntry":this.multiEntry}
};
ydn.db.schema.Index.prototype.clone = function() {
  var keyPath = goog.isArray(this.keyPath) ? goog.array.clone((this.keyPath)) : this.keyPath;
  return new ydn.db.schema.Index(keyPath, this.type, this.unique, this.multiEntry, this.name)
};
ydn.db.schema.Index.compareKeyPath = function(keyPath1, keyPath2) {
  if(!goog.isDefAndNotNull(keyPath1) && !goog.isDefAndNotNull(keyPath2)) {
    return null
  }else {
    if(!goog.isDefAndNotNull(keyPath1)) {
      return"newly define " + keyPath2
    }else {
      if(!goog.isDefAndNotNull(keyPath2)) {
        return"keyPath: " + keyPath1 + " no longer defined"
      }else {
        if(goog.isArrayLike(keyPath1) && goog.isArrayLike(keyPath2)) {
          return goog.array.equals((keyPath1), (keyPath2)) ? null : "expect: " + keyPath1 + ", but: " + keyPath2
        }else {
          if(!ydn.object.equals(keyPath1, keyPath2)) {
            return"expect: " + keyPath1 + ", but: " + keyPath2
          }else {
            return null
          }
        }
      }
    }
  }
};
ydn.db.schema.Index.prototype.isKeyPath = function(key_path) {
  return!ydn.db.schema.Index.compareKeyPath(this.keyPath, key_path)
};
ydn.db.schema.Index.prototype.difference = function(index) {
  if(!index) {
    return"no index for " + this.name
  }
  if(this.name != index.name) {
    return"name, expect: " + this.name + ", but: " + index.name
  }
  var msg = ydn.db.schema.Index.compareKeyPath(this.keyPath, index.keyPath);
  if(msg) {
    return"keyPath, " + msg
  }
  if(goog.isDefAndNotNull(this.unique) && goog.isDefAndNotNull(index.unique) && this.unique != index.unique) {
    return"unique, expect: " + this.unique + ", but: " + index.unique
  }
  if(goog.isDefAndNotNull(this.multiEntry) && goog.isDefAndNotNull(index.multiEntry) && this.multiEntry != index.multiEntry) {
    return"multiEntry, expect: " + this.multiEntry + ", but: " + index.multiEntry
  }
  if(goog.isDef(this.type) && goog.isDef(index.type) && (goog.isArrayLike(this.type) ? !goog.array.equals((this.type), (index.type)) : this.type != index.type)) {
    return"data type, expect: " + this.type + ", but: " + index.type
  }
  return""
};
ydn.db.schema.Index.prototype.hint = function(that) {
  if(!that) {
    return this
  }
  goog.asserts.assert(this.name == that.name);
  var keyPath = goog.isArray(this.keyPath) ? goog.array.clone((this.keyPath)) : this.keyPath;
  var type = this.type;
  if(!goog.isDef(that.type) && type == "TEXT") {
    type = undefined
  }
  return new ydn.db.schema.Index(keyPath, type, this.unique, this.multiEntry, that.name)
};
ydn.db.schema.Index.toDir = function(str) {
  var idx = goog.array.indexOf(ydn.db.base.DIRECTIONS, str);
  return ydn.db.base.DIRECTIONS[idx]
};
ydn.db.schema.Index.prototype.getKeyPath = function() {
  return this.keyPath
};
ydn.db.schema.Index.prototype.getSQLIndexColumnName = function() {
  return this.index_column_name_
};
ydn.db.schema.Index.prototype.getSQLIndexColumnNameQuoted = function() {
  return this.index_column_name_quoted_
};
ydn.db.schema.Index.prototype.index_column_name_;
ydn.db.schema.Index.prototype.index_column_name_quoted_;
ydn.db.schema.Index.fromJSON = function(json) {
  if(goog.DEBUG) {
    var fields = ["name", "unique", "type", "keyPath", "multiEntry"];
    for(var key in json) {
      if(json.hasOwnProperty(key) && goog.array.indexOf(fields, key) == -1) {
        throw new ydn.debug.error.ArgumentException("Unknown field: " + key + " in " + ydn.json.stringify(json));
      }
    }
  }
  return new ydn.db.schema.Index(json.keyPath, json.type, json.unique, json.multiEntry, json.name)
};
goog.provide("ydn.db.schema.Store");
goog.require("ydn.db.KeyRange");
goog.require("ydn.db.schema.Index");
ydn.db.schema.Store = function(name, opt_key_path, opt_autoIncrement, opt_type, opt_indexes, opt_dispatch_events, opt_is_fixed, opt_sync) {
  this.name = name;
  if(!goog.isString(this.name)) {
    throw new ydn.debug.error.ArgumentException("store name must be a string");
  }
  this.keyPath = goog.isDef(opt_key_path) ? opt_key_path : null;
  this.isComposite = goog.isArrayLike(this.keyPath);
  if(!goog.isNull(this.keyPath) && !goog.isString(this.keyPath) && !this.isComposite) {
    throw new ydn.debug.error.ArgumentException("keyPath must be a string or array");
  }
  this.autoIncrement = opt_autoIncrement;
  var type;
  if(goog.isDefAndNotNull(opt_type)) {
    type = ydn.db.schema.Index.toType(opt_type);
    if(!goog.isDef(type)) {
      throw new ydn.debug.error.ArgumentException('type "' + opt_type + '" for primary key in store "' + this.name + '" is invalid.');
    }
    if(this.isComposite) {
      throw new ydn.debug.error.ArgumentException('composite key for store "' + this.name + '" must not specified type');
    }
  }
  this.type = goog.isDefAndNotNull(type) ? type : this.autoIncrement ? ydn.db.schema.DataType.INTEGER : undefined;
  this.keyPaths = goog.isString(this.keyPath) ? this.keyPath.split(".") : [];
  this.indexes = opt_indexes || [];
  this.dispatch_events = !!opt_dispatch_events;
  this.fixed = !!opt_is_fixed;
  this.keyColumnType_ = goog.isString(this.type) ? this.type : ydn.db.schema.DataType.TEXT;
  this.primary_column_name_ = goog.isArray(this.keyPath) ? this.keyPath.join(",") : goog.isString(this.keyPath) ? this.keyPath : ydn.db.base.SQLITE_SPECIAL_COLUNM_NAME;
  this.primary_column_name_quoted_ = goog.string.quote(this.primary_column_name_)
};
ydn.db.schema.Store.FetchStrategy = {LAST_UPDATED:"last-updated", ASCENDING_KEY:"ascending-key", DESCENDING_KEY:"descending-key"};
ydn.db.schema.Store.FetchStrategies = [ydn.db.schema.Store.FetchStrategy.LAST_UPDATED, ydn.db.schema.Store.FetchStrategy.ASCENDING_KEY, ydn.db.schema.Store.FetchStrategy.DESCENDING_KEY];
ydn.db.schema.Store.prototype.name;
ydn.db.schema.Store.prototype.isComposite;
ydn.db.schema.Store.prototype.keyPath;
ydn.db.schema.Store.prototype.autoIncrement;
ydn.db.schema.Store.prototype.type;
ydn.db.schema.Store.prototype.keyColumnType_;
ydn.db.schema.Store.prototype.keyPaths;
ydn.db.schema.Store.prototype.indexes;
ydn.db.schema.Store.prototype.dispatch_events = false;
ydn.db.schema.Store.prototype.fixed = false;
ydn.db.schema.Store.prototype.toJSON = function() {
  var indexes = [];
  for(var i = 0;i < this.indexes.length;i++) {
    indexes.push(this.indexes[i].toJSON())
  }
  return{"name":this.name, "keyPath":this.keyPath, "autoIncrement":this.autoIncrement, "type":this.type, "indexes":indexes}
};
ydn.db.schema.Store.fromJSON = function(json) {
  if(goog.DEBUG) {
    var fields = ["name", "keyPath", "autoIncrement", "type", "indexes", "dispatchEvents", "fixed", "Sync"];
    for(var key in json) {
      if(json.hasOwnProperty(key) && goog.array.indexOf(fields, key) == -1) {
        throw new ydn.debug.error.ArgumentException('Unknown attribute "' + key + '"');
      }
    }
  }
  var indexes = [];
  var indexes_json = json.indexes || [];
  if(goog.isArray(indexes_json)) {
    for(var i = 0;i < indexes_json.length;i++) {
      var index = ydn.db.schema.Index.fromJSON(indexes_json[i]);
      if(goog.isDef(index.keyPath) && index.keyPath === json.keyPath) {
        continue
      }
      indexes.push(index)
    }
  }
  var type = json.type === "undefined" || json.type === "null" ? undefined : json.type;
  return new ydn.db.schema.Store(json.name, json.keyPath, json.autoIncrement, type, indexes, json.dispatchEvents, json.fixed, json.Sync)
};
ydn.db.schema.Store.QueryMethod = {NONE:0, KEYS:1, VALUES:2, COUNT:3};
ydn.db.schema.Store.prototype.toSql = function(params, method, index_column, key_range, reverse, unique) {
  var out = this.inSql(params, method, index_column, key_range, reverse, unique);
  var sql = "";
  if(method != ydn.db.schema.Store.QueryMethod.NONE) {
    sql += "SELECT " + out.select
  }
  sql += " FROM " + out.from;
  if(out.where) {
    sql += " WHERE " + out.where
  }
  if(out.group) {
    sql += " GROUP BY " + out.group
  }
  if(out.order) {
    sql += " ORDER BY " + out.order
  }
  return sql
};
ydn.db.schema.Store.SqlParts;
ydn.db.schema.Store.prototype.inSql = function(params, method, index_column, key_range, reverse, unique) {
  var out = {select:"", from:"", where:"", group:"", order:""};
  var key_column = this.primary_column_name_;
  var q_key_column = this.primary_column_name_quoted_;
  var index = null;
  if(index_column !== key_column && goog.isString(index_column)) {
    index = this.getIndex(index_column)
  }
  var is_index = !!index;
  var effective_column = index_column || key_column;
  var q_effective_column = goog.string.quote(effective_column);
  var key_path = is_index ? index.getKeyPath() : this.getKeyPath();
  var type = is_index ? index.getType() : this.getType();
  var is_multi_entry = is_index && index.isMultiEntry();
  out.from = this.getQuotedName();
  if(method === ydn.db.schema.Store.QueryMethod.COUNT) {
    out.select = "COUNT(" + q_key_column + ")"
  }else {
    if(method === ydn.db.schema.Store.QueryMethod.KEYS) {
      out.select = q_key_column;
      if(goog.isDefAndNotNull(index_column) && index_column != key_column) {
        out.select += ", " + q_effective_column
      }
    }else {
      out.select = "*"
    }
  }
  var dist = unique ? "DISTINCT " : "";
  var wheres = [];
  if(is_multi_entry) {
    var idx_store_name = goog.string.quote(ydn.db.con.WebSql.PREFIX_MULTIENTRY + this.getName() + ":" + index.getName());
    if(method === ydn.db.schema.Store.QueryMethod.COUNT) {
      out.select = "COUNT(" + dist + idx_store_name + "." + q_effective_column + ")"
    }else {
      if(method === ydn.db.schema.Store.QueryMethod.KEYS) {
        out.select = this.getQuotedName() + "." + q_key_column + ", " + idx_store_name + "." + q_effective_column
      }else {
        out.select = this.getQuotedName() + ".*" + ", " + idx_store_name + "." + q_effective_column + " AS " + effective_column
      }
    }
    out.from = idx_store_name + " INNER JOIN " + this.getQuotedName() + " USING (" + q_key_column + ")";
    var col = idx_store_name + "." + q_effective_column;
    if(goog.isDefAndNotNull(key_range)) {
      ydn.db.KeyRange.toSql(col, type, key_range, wheres, params);
      if(wheres.length > 0) {
        if(out.where) {
          out.where += " AND " + wheres.join(" AND ")
        }else {
          out.where = wheres.join(" AND ")
        }
      }
    }
  }else {
    if(goog.isDefAndNotNull(key_range)) {
      ydn.db.KeyRange.toSql(q_effective_column, type, key_range, wheres, params);
      if(wheres.length > 0) {
        if(out.where) {
          out.where += " AND " + wheres.join(" AND ")
        }else {
          out.where = wheres.join(" AND ")
        }
      }
    }
  }
  if(is_index && !index.isUnique() && unique) {
    out.group = q_effective_column
  }
  var dir = reverse ? "DESC" : "ASC";
  out.order = q_effective_column + " " + dir;
  if(is_index) {
    out.order += ", " + q_key_column + " " + dir
  }
  return out
};
ydn.db.schema.Store.prototype.clone = function() {
  return ydn.db.schema.Store.fromJSON((this.toJSON()))
};
ydn.db.schema.Store.prototype.countIndex = function() {
  return this.indexes.length
};
ydn.db.schema.Store.prototype.index = function(idx) {
  return this.indexes[idx] || null
};
ydn.db.schema.Store.prototype.getIndex = function(name) {
  return(goog.array.find(this.indexes, function(x) {
    return x.name == name
  }))
};
ydn.db.schema.Store.prototype.getIndexByKeyPath = function(key_path) {
  for(var i = 0;i < this.indexes.length;i++) {
    if(this.indexes[i].isKeyPath(key_path)) {
      return this.indexes[i]
    }
  }
  return null
};
ydn.db.schema.Store.prototype.hasIndex = function(name) {
  if(name == this.keyPath) {
    return true
  }
  return goog.array.some(this.indexes, function(x) {
    return x.name == name
  })
};
ydn.db.schema.Store.prototype.hasIndexByKeyPath = function(key_path) {
  if(this.keyPath && goog.isNull(ydn.db.schema.Index.compareKeyPath(this.keyPath, key_path))) {
    return true
  }
  return goog.array.some(this.indexes, function(x) {
    return goog.isDefAndNotNull(x.keyPath) && goog.isNull(ydn.db.schema.Index.compareKeyPath(x.keyPath, key_path))
  })
};
ydn.db.schema.Store.prototype.getSQLKeyColumnNameQuoted = function() {
  return this.primary_column_name_quoted_
};
ydn.db.schema.Store.prototype.getSQLKeyColumnName = function() {
  return this.primary_column_name_
};
ydn.db.schema.Store.prototype.primary_column_name_;
ydn.db.schema.Store.prototype.primary_column_name_quoted_;
ydn.db.schema.Store.prototype.getQuotedName = function() {
  return goog.string.quote(this.name)
};
ydn.db.schema.Store.prototype.getColumns = function() {
  if(this.columns_ && this.columns_.length != this.indexes.length) {
    this.columns_ = [];
    for(var i = 0;i < this.indexes.length;i++) {
      this.columns_.push(this.indexes[i].name)
    }
  }
  return this.columns_
};
ydn.db.schema.Store.prototype.hint = function(that) {
  if(!that) {
    return this
  }
  goog.asserts.assert(this.name == that.name);
  var autoIncrement = this.autoIncrement;
  var keyPath = goog.isArray(this.keyPath) ? goog.array.clone((this.keyPath)) : this.keyPath;
  var type = this.type;
  var indexes = goog.array.map(this.indexes, function(index) {
    return index.clone()
  });
  if(!goog.isDef(that.type) && type == "TEXT") {
    type = undefined
  }
  if(goog.isArray(that.keyPath) && goog.isString(keyPath) && keyPath == that.keyPath.join(",")) {
    keyPath = goog.array.clone((that.keyPath))
  }
  for(var i = 0, n = that.indexes.length;i < n;i++) {
    if(that.indexes[i].isComposite()) {
      var name = that.indexes[i].getName();
      for(var j = indexes.length - 1;j >= 0;j--) {
        if(name.indexOf(indexes[j].getName()) >= 0) {
          indexes[j] = that.indexes[i].clone();
          break
        }
      }
    }
  }
  for(var i = 0;i < indexes.length;i++) {
    var that_index = that.getIndex(indexes[i].getName());
    if(that_index) {
      indexes[i] = indexes[i].hint(that_index)
    }
  }
  return new ydn.db.schema.Store(that.name, keyPath, autoIncrement, type, indexes)
};
ydn.db.schema.Store.prototype.getName = function() {
  return this.name
};
ydn.db.schema.Store.prototype.getAutoIncrement = function() {
  return this.autoIncrement
};
ydn.db.schema.Store.prototype.getKeyPath = function() {
  return this.keyPath
};
ydn.db.schema.Store.prototype.usedInlineKey = function() {
  return!!this.keyPath
};
ydn.db.schema.Store.prototype.getIndexNames = function() {
  return this.indexes.map(function(x) {
    return x.name
  })
};
ydn.db.schema.Store.prototype.getType = function() {
  return this.type
};
ydn.db.schema.Store.prototype.getSqlType = function() {
  return this.keyColumnType_
};
ydn.db.schema.Store.prototype.getIndexKeyPaths = function() {
  return this.indexes.map(function(x) {
    return x.keyPath
  })
};
ydn.db.schema.Store.prototype.addIndex = function(name, opt_unique, opt_type, opt_multiEntry) {
  this.indexes.push(new ydn.db.schema.Index(name, opt_type, opt_unique, opt_multiEntry))
};
ydn.db.schema.Store.prototype.extractKey = function(record) {
  if(this.isComposite) {
    var arr = [];
    for(var i = 0;i < this.keyPath.length;i++) {
      arr.push(ydn.db.utils.getValueByKeys(record, this.keyPath[i]))
    }
    return arr
  }else {
    if(this.keyPath) {
      return(goog.object.getValueByKeys(record, this.keyPaths))
    }else {
      return undefined
    }
  }
};
ydn.db.schema.Store.prototype.getRowValue = function(obj) {
  if(goog.isDefAndNotNull(this.keyPath)) {
    var value = obj[this.keyPath];
    if(this.type == ydn.db.schema.DataType.DATE) {
      value = Date.parse(value)
    }else {
      if(this.type == ydn.db.schema.DataType.NUMERIC) {
        value = parseFloat(value)
      }else {
        if(this.type == ydn.db.schema.DataType.INTEGER) {
          value = parseInt(value, 10)
        }
      }
    }
    return value
  }else {
    return undefined
  }
};
ydn.db.schema.Store.prototype.generateKey = function() {
  if(!goog.isDef(this.current_key_)) {
    this.current_key_ = 0
  }
  return this.current_key_++
};
ydn.db.schema.Store.prototype.setKeyValue = function(obj, value) {
  for(var i = 0;i < this.keyPaths.length;i++) {
    var key = this.keyPaths[i];
    if(i == this.keyPaths.length - 1) {
      obj[key] = value;
      return
    }
    if(!goog.isDef(obj[key])) {
      obj[key] = {}
    }
    obj = obj[key]
  }
};
ydn.db.schema.Store.DEFAULT_TEXT_STORE = "default_text_store";
ydn.db.schema.Store.prototype.getIndexedValues = function(obj, opt_key) {
  var values = [];
  var columns = [];
  var key = goog.isDef(opt_key) ? opt_key : this.extractKey(obj);
  if(goog.isDef(key)) {
    columns.push(this.getSQLKeyColumnNameQuoted());
    values.push(ydn.db.schema.Index.js2sql(key, this.getType()))
  }
  for(var i = 0;i < this.indexes.length;i++) {
    var index = this.indexes[i];
    if(index.isMultiEntry() || index.name === this.keyPath || index.name == ydn.db.base.DEFAULT_BLOB_COLUMN) {
      continue
    }
    var idx_key = index.extractKey(obj);
    if(goog.isDefAndNotNull(idx_key)) {
      values.push(ydn.db.schema.Index.js2sql(idx_key, index.getType()));
      columns.push(index.getSQLIndexColumnNameQuoted())
    }
  }
  if(!this.fixed) {
    values.push(ydn.json.stringify(obj));
    columns.push(ydn.db.base.DEFAULT_BLOB_COLUMN)
  }
  var slots = [];
  for(var i = values.length - 1;i >= 0;i--) {
    slots[i] = "?"
  }
  return{columns:columns, slots:slots, values:values, key:key}
};
ydn.db.schema.Store.prototype.equals = function(store) {
  return this.name === store.name && ydn.object.equals(this.toJSON(), store.toJSON())
};
ydn.db.schema.Store.prototype.difference = function(store) {
  if(!store) {
    return"missing store: " + this.name
  }
  if(this.name != store.name) {
    return"store name, expect: " + this.name + ", but: " + store.name
  }
  var msg = ydn.db.schema.Index.compareKeyPath(this.keyPath, store.keyPath);
  if(msg) {
    return"keyPath, " + msg
  }
  if(goog.isDef(this.autoIncrement) && goog.isDef(store.autoIncrement) && this.autoIncrement != store.autoIncrement) {
    return"autoIncrement, expect:  " + this.autoIncrement + ", but: " + store.autoIncrement
  }
  if(this.indexes.length != store.indexes.length) {
    return"indexes length, expect:  " + this.indexes.length + ", but: " + store.indexes.length
  }
  if(goog.isDef(this.type) && goog.isDef(store.type) && (goog.isArrayLike(this.type) ? !goog.array.equals((this.type), (store.type)) : this.type != store.type)) {
    return"data type, expect:  " + this.type + ", but: " + store.type
  }
  for(var i = 0;i < this.indexes.length;i++) {
    var index = store.getIndex(this.indexes[i].name);
    var index_msg = this.indexes[i].difference(index);
    if(index_msg.length > 0) {
      return'index "' + this.indexes[i].name + '" ' + index_msg
    }
  }
  return""
};
ydn.db.schema.Store.prototype.similar = function(store) {
  return this.difference(store).length == 0
};
ydn.db.schema.Store.SyncMethod = {ADD:"add", GET:"get", PUT:"put", REMOVE:"rm", LIST:"li"};
ydn.db.schema.Store.prototype.preHook = function(method, opt, callback, varargin) {
  callback(varargin)
};
ydn.db.schema.Store.prototype.postHook = function(method, opt, callback, varargin) {
  callback(varargin)
};
goog.provide("ydn.db.schema.Database");
goog.require("ydn.db.Key");
goog.require("ydn.db.schema.Store");
ydn.db.schema.Database = function(opt_version, opt_stores) {
  var ver;
  var stores = opt_stores;
  if(goog.isObject(opt_version)) {
    var json = opt_version;
    if(goog.DEBUG) {
      var fields = ["version", "stores"];
      for(var key in json) {
        if(json.hasOwnProperty(key) && goog.array.indexOf(fields, key) == -1) {
          throw new ydn.debug.error.ArgumentException("Unknown field: " + key + " in schema.");
        }
      }
    }
    ver = json["version"];
    stores = [];
    var stores_json = json.stores || [];
    if(goog.DEBUG && !goog.isArray(stores_json)) {
      throw new ydn.debug.error.ArgumentException("stores must be array");
    }
    for(var i = 0;i < stores_json.length;i++) {
      var store = ydn.db.schema.Store.fromJSON(stores_json[i]);
      if(goog.DEBUG) {
        var idx = goog.array.findIndex(stores, function(x) {
          return x.name == store.name
        });
        if(idx != -1) {
          throw new ydn.debug.error.ArgumentException('duplicate store name "' + store.name + '".');
        }
      }
      stores.push(store)
    }
  }else {
    if(goog.isString(opt_version)) {
      ver = opt_version.length == 0 ? undefined : parseFloat(opt_version)
    }else {
      if(goog.isNumber(opt_version)) {
        ver = opt_version
      }
    }
  }
  if(goog.isDef(ver)) {
    if(!goog.isNumber(ver) || ver < 0) {
      throw new ydn.debug.error.ArgumentException("Invalid version: " + ver + " (" + opt_version + ")");
    }
    if(isNaN(ver)) {
      ver = undefined
    }
  }
  if(goog.isDef(opt_stores) && (!goog.isArray(opt_stores) || opt_stores.length > 0 && !(opt_stores[0] instanceof ydn.db.schema.Store))) {
    throw new ydn.debug.error.ArgumentException("stores");
  }
  this.version = ver;
  this.is_auto_version_ = !goog.isDef(this.version);
  this.stores = stores || []
};
ydn.db.schema.Database.prototype.toJSON = function() {
  var stores = goog.array.map(this.stores, function(x) {
    return x.toJSON()
  });
  var sch = ({});
  sch.stores = stores;
  if(goog.isDef(this.version)) {
    sch.version = this.version
  }
  return sch
};
ydn.db.schema.Database.prototype.is_auto_version_ = false;
ydn.db.schema.Database.prototype.version;
ydn.db.schema.Database.prototype.getVersion = function() {
  return this.version
};
ydn.db.schema.Database.prototype.setVersion = function(version) {
  goog.asserts.assert(this.is_auto_version_);
  goog.asserts.assertNumber(version);
  this.version = version
};
ydn.db.schema.Database.prototype.isAutoVersion = function() {
  return this.is_auto_version_
};
ydn.db.schema.Database.prototype.isAutoSchema = function() {
  return false
};
ydn.db.schema.Database.prototype.getStoreNames = function() {
  return goog.array.map(this.stores, function(x) {
    return x.name
  })
};
ydn.db.schema.Database.prototype.store = function(idx) {
  return this.stores[idx] || null
};
ydn.db.schema.Database.prototype.count = function() {
  return this.stores.length
};
ydn.db.schema.Database.prototype.getStore = function(name) {
  return(goog.array.find(this.stores, function(x) {
    return x.name == name
  }))
};
ydn.db.schema.Database.prototype.getIndexOf = function(name) {
  return goog.array.indexOf(this.stores, function(x) {
    return x.name == name
  })
};
ydn.db.schema.Database.prototype.hasStore = function(name) {
  return goog.array.some(this.stores, function(x) {
    return x.name == name
  })
};
ydn.db.schema.Database.prototype.difference = function(schema, opt_hint) {
  if(!schema || this.stores.length != schema.stores.length) {
    return"Number of store: " + this.stores.length + " vs " + schema.stores.length
  }
  for(var i = 0;i < this.stores.length;i++) {
    var store = schema.getStore(this.stores[i].name);
    var hinted_store = !!store && !!opt_hint ? store.hint(this.stores[i]) : store;
    var msg = this.stores[i].difference(hinted_store);
    if(msg.length > 0) {
      return'store: "' + this.stores[i].name + '" ' + msg
    }
  }
  return""
};
ydn.db.schema.Database.prototype.similar = function(schema) {
  return this.difference(schema).length == 0
};
ydn.db.schema.Database.prototype.listStores = function() {
  if(!this.store_names) {
    this.store_names = goog.array.map(this.stores, function(x) {
      return x.name
    })
  }
  return this.store_names
};
goog.provide("ydn.error");
goog.provide("ydn.error.ArgumentException");
goog.provide("ydn.error.NotImplementedException");
goog.provide("ydn.error.ConstraintError");
goog.provide("ydn.error.NotSupportedException");
goog.provide("ydn.error.InternalError");
goog.provide("ydn.error.InvalidOperationException");
goog.provide("ydn.error.InvalidOperationError");
ydn.error.ArgumentException = function(opt_msg) {
  if(Error.captureStackTrace) {
    Error.captureStackTrace(this, ydn.error.ArgumentException)
  }else {
    this.stack = (new Error).stack || ""
  }
  if(opt_msg) {
    this.message = String(opt_msg)
  }
  this.name = "ydn.error.ArgumentException"
};
goog.inherits(ydn.error.ArgumentException, Error);
ydn.error.NotSupportedException = function(opt_msg) {
  if(Error.captureStackTrace) {
    Error.captureStackTrace(this, ydn.error.NotSupportedException)
  }else {
    this.stack = (new Error).stack || ""
  }
  if(opt_msg) {
    this.message = String(opt_msg)
  }
  this.name = "ydn.error.NotSupportedException"
};
goog.inherits(ydn.error.ArgumentException, Error);
ydn.error.NotSupportedException.prototype.name = "ydn.error.NotSupportedException";
ydn.error.NotImplementedException = function(opt_msg) {
  if(Error.captureStackTrace) {
    Error.captureStackTrace(this, ydn.error.NotImplementedException)
  }else {
    this.stack = (new Error).stack || ""
  }
  if(opt_msg) {
    this.message = String(opt_msg)
  }
  this.name = "ydn.error.NotImplementedException"
};
goog.inherits(ydn.error.NotImplementedException, Error);
ydn.error.InternalError = function(opt_msg) {
  if(Error.captureStackTrace) {
    Error.captureStackTrace(this, ydn.error.InternalError)
  }else {
    this.stack = (new Error).stack || ""
  }
  if(opt_msg) {
    this.message = String(opt_msg)
  }
  this.name = "ydn.error.InternalError"
};
goog.inherits(ydn.error.InternalError, Error);
ydn.error.InternalError.prototype.name = "ydn.InternalError";
ydn.error.ConstraintError = function(opt_msg) {
  if(Error.captureStackTrace) {
    Error.captureStackTrace(this, ydn.error.ConstraintError)
  }else {
    this.stack = (new Error).stack || ""
  }
  if(opt_msg) {
    this.message = String(opt_msg)
  }
  this.name = "ydn.error.ConstraintError"
};
goog.inherits(ydn.error.ConstraintError, Error);
ydn.error.ConstraintError.prototype.name = "ydn.error.ConstraintError";
ydn.error.InvalidOperationException = function(opt_msg) {
  if(Error.captureStackTrace) {
    Error.captureStackTrace(this, ydn.error.InvalidOperationException)
  }else {
    this.stack = (new Error).stack || ""
  }
  if(opt_msg) {
    this.message = String(opt_msg)
  }
  this.name = "ydn.error.InvalidOperationException"
};
goog.inherits(ydn.error.ArgumentException, Error);
ydn.error.InvalidOperationError = function(opt_msg) {
  if(Error.captureStackTrace) {
    Error.captureStackTrace(this, ydn.error.InvalidOperationError)
  }else {
    this.stack = (new Error).stack || ""
  }
  if(opt_msg) {
    this.message = String(opt_msg)
  }
  this.name = "ydn.error.InvalidOperationError"
};
goog.inherits(ydn.error.InvalidOperationError, Error);
goog.provide("goog.json");
goog.provide("goog.json.Serializer");
goog.json.isValid_ = function(s) {
  if(/^\s*$/.test(s)) {
    return false
  }
  var backslashesRe = /\\["\\\/bfnrtu]/g;
  var simpleValuesRe = /"[^"\\\n\r\u2028\u2029\x00-\x08\x0a-\x1f]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g;
  var openBracketsRe = /(?:^|:|,)(?:[\s\u2028\u2029]*\[)+/g;
  var remainderRe = /^[\],:{}\s\u2028\u2029]*$/;
  return remainderRe.test(s.replace(backslashesRe, "@").replace(simpleValuesRe, "]").replace(openBracketsRe, ""))
};
goog.json.parse = function(s) {
  var o = String(s);
  if(goog.json.isValid_(o)) {
    try {
      return(eval("(" + o + ")"))
    }catch(ex) {
    }
  }
  throw Error("Invalid JSON string: " + o);
};
goog.json.unsafeParse = function(s) {
  return(eval("(" + s + ")"))
};
goog.json.Replacer;
goog.json.Reviver;
goog.json.serialize = function(object, opt_replacer) {
  return(new goog.json.Serializer(opt_replacer)).serialize(object)
};
goog.json.Serializer = function(opt_replacer) {
  this.replacer_ = opt_replacer
};
goog.json.Serializer.prototype.serialize = function(object) {
  var sb = [];
  this.serialize_(object, sb);
  return sb.join("")
};
goog.json.Serializer.prototype.serialize_ = function(object, sb) {
  switch(typeof object) {
    case "string":
      this.serializeString_((object), sb);
      break;
    case "number":
      this.serializeNumber_((object), sb);
      break;
    case "boolean":
      sb.push(object);
      break;
    case "undefined":
      sb.push("null");
      break;
    case "object":
      if(object == null) {
        sb.push("null");
        break
      }
      if(goog.isArray(object)) {
        this.serializeArray((object), sb);
        break
      }
      this.serializeObject_((object), sb);
      break;
    case "function":
      break;
    default:
      throw Error("Unknown type: " + typeof object);
  }
};
goog.json.Serializer.charToJsonCharCache_ = {'"':'\\"', "\\":"\\\\", "/":"\\/", "\b":"\\b", "\f":"\\f", "\n":"\\n", "\r":"\\r", "\t":"\\t", "\x0B":"\\u000b"};
goog.json.Serializer.charsToReplace_ = /\uffff/.test("\uffff") ? /[\\\"\x00-\x1f\x7f-\uffff]/g : /[\\\"\x00-\x1f\x7f-\xff]/g;
goog.json.Serializer.prototype.serializeString_ = function(s, sb) {
  sb.push('"', s.replace(goog.json.Serializer.charsToReplace_, function(c) {
    if(c in goog.json.Serializer.charToJsonCharCache_) {
      return goog.json.Serializer.charToJsonCharCache_[c]
    }
    var cc = c.charCodeAt(0);
    var rv = "\\u";
    if(cc < 16) {
      rv += "000"
    }else {
      if(cc < 256) {
        rv += "00"
      }else {
        if(cc < 4096) {
          rv += "0"
        }
      }
    }
    return goog.json.Serializer.charToJsonCharCache_[c] = rv + cc.toString(16)
  }), '"')
};
goog.json.Serializer.prototype.serializeNumber_ = function(n, sb) {
  sb.push(isFinite(n) && !isNaN(n) ? n : "null")
};
goog.json.Serializer.prototype.serializeArray = function(arr, sb) {
  var l = arr.length;
  sb.push("[");
  var sep = "";
  for(var i = 0;i < l;i++) {
    sb.push(sep);
    var value = arr[i];
    this.serialize_(this.replacer_ ? this.replacer_.call(arr, String(i), value) : value, sb);
    sep = ","
  }
  sb.push("]")
};
goog.json.Serializer.prototype.serializeObject_ = function(obj, sb) {
  sb.push("{");
  var sep = "";
  for(var key in obj) {
    if(Object.prototype.hasOwnProperty.call(obj, key)) {
      var value = obj[key];
      if(typeof value != "function") {
        sb.push(sep);
        this.serializeString_(key, sb);
        sb.push(":");
        this.serialize_(this.replacer_ ? this.replacer_.call(obj, key, value) : value, sb);
        sep = ","
      }
    }
  }
  sb.push("}")
};
goog.provide("ydn.json");
goog.require("goog.debug.Logger");
goog.require("goog.json");
ydn.json.DEBUG = false;
ydn.json.POLY_FILL = false;
ydn.json.logger = goog.debug.Logger.getLogger("ydn");
ydn.json.native = !ydn.json.POLY_FILL ? true : !(typeof goog.global["JSON"] == "undefined");
ydn.json.parse = function(json_str) {
  if(!goog.isString(json_str) || goog.string.isEmpty(json_str)) {
    return{}
  }
  if(ydn.json.native) {
    return(JSON.parse(json_str))
  }else {
    return(goog.json.parse(json_str))
  }
};
ydn.json.toShortString = function(obj) {
  var json;
  try {
    json = ydn.json.stringify(obj)
  }catch(e) {
    json = ""
  }
  if(json) {
    return json.substr(0, 70) + (json.length > 70 ? "..." : "")
  }else {
    return""
  }
};
ydn.json.stringify = function(json) {
  if(ydn.json.native) {
    return JSON.stringify(json)
  }else {
    return goog.json.serialize(json)
  }
};
goog.provide("ydn.db.con.IndexedDb");
goog.require("goog.Timer");
goog.require("goog.async.DeferredList");
goog.require("goog.events");
goog.require("ydn.async");
goog.require("ydn.db.base");
goog.require("ydn.db.con.IDatabase");
goog.require("ydn.db.schema.Database");
goog.require("ydn.error.ConstraintError");
goog.require("ydn.json");
ydn.db.con.IndexedDb = function(opt_size, opt_time_out) {
  if(goog.isDef(opt_size)) {
    if(opt_size > 5 * 1024 * 1024) {
      this.logger.warning("storage size request ignored, " + "use Quota Management API instead")
    }
  }
  this.idx_db_ = null;
  this.time_out_ = opt_time_out || NaN
};
ydn.db.con.IndexedDb.prototype.connect = function(dbname, schema) {
  var me = this;
  var df = new goog.async.Deferred;
  var old_version = undefined;
  var setDb = function(db, opt_err) {
    if(df.hasFired()) {
      me.logger.warning("database already set.")
    }else {
      if(goog.isDef(opt_err)) {
        me.logger.warning(opt_err ? opt_err.message : "Error received.");
        me.idx_db_ = null;
        df.errback(opt_err)
      }else {
        goog.asserts.assertObject(db);
        me.idx_db_ = db;
        me.idx_db_.onabort = function(e) {
          me.logger.finest(me + ": onabort - " + e.message)
        };
        me.idx_db_.onerror = function(e) {
          if(ydn.db.con.IndexedDb.DEBUG) {
            window.console.log([this, e])
          }
          me.logger.finest(me + ": onerror - " + e.message)
        };
        me.idx_db_.onversionchange = function(event) {
          if(ydn.db.con.IndexedDb.DEBUG) {
            window.console.log([this, event])
          }
          me.logger.finest(me + ": onversionchange to: " + event.version);
          if(me.idx_db_) {
            me.idx_db_.onabort = null;
            me.idx_db_.onerror = null;
            me.idx_db_.onversionchange = null;
            me.idx_db_.close();
            me.idx_db_ = null;
            if(goog.isFunction(me.onDisconnected)) {
              me.onDisconnected(event)
            }
          }
        };
        df.callback(parseFloat(old_version))
      }
    }
  };
  var updateSchema = function(db, trans, is_caller_setversion) {
    var action = is_caller_setversion ? "changing" : "upgrading";
    me.logger.finer(action + " version to " + db.version + " from " + old_version);
    for(var i = 0;i < schema.stores.length;i++) {
      me.update_store_(db, trans, schema.stores[i])
    }
    var storeNames = (db.objectStoreNames);
    for(var n = storeNames.length, i = 0;i < n;i++) {
      if(!schema.hasStore(storeNames[i])) {
        db.deleteObjectStore(storeNames[i]);
        me.logger.finer("store: " + storeNames[i] + " deleted.")
      }
    }
  };
  var version = schema.getVersion();
  me.logger.finer("Opening database: " + dbname + " ver: " + (schema.isAutoVersion() ? "auto" : version));
  var openRequest;
  if(!goog.isDef(version)) {
    openRequest = ydn.db.con.IndexedDb.indexedDb.open(dbname)
  }else {
    openRequest = ydn.db.con.IndexedDb.indexedDb.open(dbname, version)
  }
  openRequest.onsuccess = function(ev) {
    var db = ev.target.result;
    if(!goog.isDef(old_version)) {
      old_version = db.version
    }
    var msg = "Database: " + db.name + ", ver: " + db.version + " opened.";
    me.logger.finer(msg);
    if(schema.isAutoVersion()) {
      var schema_updater = function(db_schema) {
        if(schema.isAutoSchema()) {
          for(var i = 0;i < db_schema.stores.length;i++) {
            if(!schema.hasStore(db_schema.stores[i].getName())) {
              schema.addStore(db_schema.stores[i].clone())
            }
          }
        }
        var diff_msg = schema.difference(db_schema);
        if(diff_msg.length > 0) {
          me.logger.finer("Schema change require for difference in " + diff_msg);
          var on_completed = function(t, e) {
            if(t == ydn.db.base.TxEventTypes.COMPLETE) {
              setDb(db)
            }else {
              me.logger.severe("Fail to update version on " + db.name + ":" + db.version);
              setDb(null, e)
            }
          };
          var next_version = goog.isNumber(db.version) ? db.version + 1 : 1;
          if("IDBOpenDBRequest" in goog.global) {
            db.close();
            var req = ydn.db.con.IndexedDb.indexedDb.open(dbname, (next_version));
            req.onupgradeneeded = function(ev) {
              var db = ev.target.result;
              me.logger.finer("re-open for version " + db.version);
              updateSchema(db, req["transaction"], false)
            };
            req.onsuccess = function(ev) {
              setDb(ev.target.result)
            };
            req.onerror = function(e) {
              me.logger.finer(me + ": fail.");
              setDb(null)
            }
          }else {
            var ver_request = db.setVersion(next_version + "");
            ver_request.onfailure = function(e) {
              me.logger.warning("migrating from " + db.version + " to " + next_version + " failed.");
              setDb(null, e)
            };
            var trans = ver_request["transaction"];
            ver_request.onsuccess = function(e) {
              ver_request["transaction"].oncomplete = tr_on_complete;
              updateSchema(db, ver_request["transaction"], true)
            };
            var tr_on_complete = function(e) {
              var reOpenRequest = ydn.db.con.IndexedDb.indexedDb.open(dbname);
              reOpenRequest.onsuccess = function(rev) {
                var db = rev.target.result;
                me.logger.finer(me + ": OK.");
                setDb(db)
              };
              reOpenRequest.onerror = function(e) {
                me.logger.finer(me + ": fail.");
                setDb(null)
              }
            };
            if(goog.isDefAndNotNull(ver_request["transaction"])) {
              ver_request["transaction"].oncomplete = tr_on_complete
            }
          }
        }else {
          setDb(db)
        }
      };
      me.getSchema(schema_updater, undefined, db)
    }else {
      if(schema.getVersion() > db.version) {
        goog.asserts.assertFunction(db["setVersion"], "Expecting IDBDatabase in old format");
        var version = (schema.getVersion());
        var ver_request = db.setVersion((version));
        ver_request.onfailure = function(e) {
          me.logger.warning("migrating from " + db.version + " to " + schema.getVersion() + " failed.");
          setDb(null, e)
        };
        ver_request.onsuccess = function(e) {
          updateSchema(db, ver_request["transaction"], true)
        }
      }else {
        if(schema.getVersion() == db.version) {
          me.logger.finer("database version " + db.version + " ready to go")
        }else {
          me.logger.warning("connected database version " + db.version + " is higher than requested version.")
        }
        var validator = function(db_schema) {
          var diff_msg = schema.difference(db_schema);
          if(diff_msg.length > 0) {
            me.logger.finer(diff_msg);
            setDb(null, new ydn.error.ConstraintError("different schema: " + diff_msg))
          }else {
            setDb(db)
          }
        };
        me.getSchema(validator, undefined, db)
      }
    }
  };
  openRequest.onupgradeneeded = function(ev) {
    var db = ev.target.result;
    old_version = NaN;
    me.logger.finer("upgrade needed for version " + db.version);
    updateSchema(db, openRequest["transaction"], false)
  };
  openRequest.onerror = function(ev) {
    var msg = "opening database " + dbname + ":" + schema.version + " failed.";
    if(ydn.db.con.IndexedDb.DEBUG) {
      window.console.log([ev, openRequest])
    }
    me.logger.severe(msg);
    setDb(null, ev)
  };
  openRequest.onblocked = function(ev) {
    if(ydn.db.con.IndexedDb.DEBUG) {
      window.console.log([ev, openRequest])
    }
    me.logger.severe("database " + dbname + " " + schema.version + " block, close other connections.");
    setDb(null, ev)
  };
  if(goog.isNumber(this.time_out_) && !isNaN(this.time_out_)) {
    goog.Timer.callOnce(function() {
      if(openRequest.readyState != "done") {
        var msg = me + ": database state is still " + openRequest.readyState;
        me.logger.severe(msg);
        setDb(null, new ydn.db.TimeoutError("connection timeout after " + me.time_out_))
      }
    }, this.time_out_)
  }
  return df
};
ydn.db.con.IndexedDb.DEBUG = false;
ydn.db.con.IndexedDb.indexedDb = goog.global.indexedDB || goog.global.mozIndexedDB || goog.global.webkitIndexedDB || goog.global.moz_indexedDB || goog.global["msIndexedDB"];
ydn.db.con.IndexedDb.prototype.time_out_ = 3 * 60 * 1E3;
ydn.db.con.IndexedDb.prototype.getType = function() {
  return ydn.db.base.Mechanisms.IDB
};
ydn.db.con.IndexedDb.prototype.getDbInstance = function() {
  return this.idx_db_ || null
};
ydn.db.con.IndexedDb.prototype.isReady = function() {
  return!!this.idx_db_
};
ydn.db.con.IndexedDb.isSupported = function() {
  return!!ydn.db.con.IndexedDb.indexedDb
};
ydn.db.con.IndexedDb.prototype.logger = goog.debug.Logger.getLogger("ydn.db.con.IndexedDb");
ydn.db.con.IndexedDb.prototype.idx_db_ = null;
ydn.db.con.IndexedDb.prototype.getVersion = function() {
  return this.idx_db_ ? parseFloat(this.idx_db_.version) : undefined
};
ydn.db.con.IndexedDb.prototype.getSchema = function(callback, trans, db) {
  var idb = (db) || this.idx_db_;
  var mode = ydn.db.base.TransactionMode.READ_ONLY;
  if(!goog.isDef(trans)) {
    var names = [];
    for(var i = idb.objectStoreNames.length - 1;i >= 0;i--) {
      names[i] = idb.objectStoreNames[i]
    }
    if(names.length == 0) {
      callback(new ydn.db.schema.Database(idb.version));
      return
    }
    trans = idb.transaction(names, (mode))
  }else {
    if(goog.isNull(trans)) {
      if(idb.objectStoreNames.length == 0) {
        callback(new ydn.db.schema.Database(idb.version));
        return
      }else {
        throw new ydn.error.InternalError;
      }
    }else {
      idb = trans["db"]
    }
  }
  var objectStoreNames = (idb.objectStoreNames);
  var stores = [];
  var n = objectStoreNames.length;
  for(var i = 0;i < n;i++) {
    var objStore = trans.objectStore(objectStoreNames[i]);
    var indexes = [];
    for(var j = 0, ni = objStore.indexNames.length;j < ni;j++) {
      var index = objStore.index(objStore.indexNames[j]);
      indexes[j] = new ydn.db.schema.Index(index.keyPath, undefined, index.unique, index.multiEntry, index.name)
    }
    stores[i] = new ydn.db.schema.Store(objStore.name, objStore.keyPath, objStore.autoIncrement, undefined, indexes)
  }
  var schema = new ydn.db.schema.Database((idb.version), stores);
  callback(schema)
};
ydn.db.con.IndexedDb.prototype.update_store_ = function(db, trans, store_schema) {
  this.logger.finest("Creating Object Store for " + store_schema.getName() + " keyPath: " + store_schema.getKeyPath());
  var objectStoreNames = (db.objectStoreNames);
  var createObjectStore = function() {
    var options = {"autoIncrement":!!store_schema.getAutoIncrement()};
    if(goog.isDefAndNotNull(store_schema.getKeyPath())) {
      options["keyPath"] = store_schema.getKeyPath()
    }
    try {
      return db.createObjectStore(store_schema.getName(), options)
    }catch(e) {
      if(goog.DEBUG && e.name == "InvalidAccessError") {
        throw new ydn.db.InvalidAccessError("creating store for " + store_schema.getName() + " of keyPath: " + store_schema.getKeyPath() + " and autoIncrement: " + store_schema.getAutoIncrement());
      }else {
        if(goog.DEBUG && e.name == "ConstraintError") {
          throw new ydn.error.ConstraintError("creating store for " + store_schema.getName());
        }else {
          throw e;
        }
      }
    }
  };
  var store;
  if(objectStoreNames.contains(store_schema.getName())) {
    store = trans.objectStore(store_schema.getName());
    var keyPath = store_schema.getKeyPath() || "";
    var store_keyPath = store.keyPath || "";
    if(keyPath != store_keyPath) {
      db.deleteObjectStore(store_schema.getName());
      this.logger.warning("store: " + store_schema.getName() + " deleted due to keyPath change.");
      store = createObjectStore()
    }else {
      if(goog.isBoolean(store.autoIncrement) && goog.isBoolean(store_schema.getAutoIncrement()) && store.autoIncrement != store_schema.getAutoIncrement()) {
        db.deleteObjectStore(store_schema.getName());
        this.logger.warning("store: " + store_schema.getName() + " deleted due to autoIncrement change.");
        store = createObjectStore()
      }else {
        var indexNames = (store.indexNames);
        var created = 0;
        var deleted = 0;
        for(var j = 0;j < store_schema.indexes.length;j++) {
          var index = store_schema.indexes[j];
          if(!indexNames.contains(index.name)) {
            if(index.unique || index.multiEntry) {
              var idx_options = {unique:index.unique, multiEntry:index.multiEntry};
              store.createIndex(index.name, (index.keyPath), idx_options)
            }else {
              store.createIndex(index.name, (index.keyPath))
            }
            created++
          }
        }
        for(var j = 0;j < indexNames.length;j++) {
          if(!store_schema.hasIndex(indexNames[j])) {
            store.deleteIndex(indexNames[j]);
            deleted++
          }
        }
        this.logger.finest("Updated store: " + store.name + ", " + created + " index created, " + deleted + " index deleted.")
      }
    }
  }else {
    store = createObjectStore();
    for(var j = 0;j < store_schema.indexes.length;j++) {
      var index = store_schema.indexes[j];
      this.logger.finest("Creating index: " + index.name + " multiEntry: " + index.multiEntry);
      if(index.unique || index.multiEntry) {
        var idx_options = {unique:index.unique, multiEntry:index.multiEntry};
        store.createIndex(index.name, index.keyPath, idx_options)
      }else {
        store.createIndex(index.name, index.keyPath)
      }
    }
    this.logger.finest("Created store: " + store.name + " keyPath: " + store.keyPath)
  }
};
ydn.db.con.IndexedDb.prototype.doTransaction = function(fnc, scopes, mode, on_completed) {
  var db = this.idx_db_;
  if(!scopes) {
    scopes = [];
    for(var i = db.objectStoreNames.length - 1;i >= 0;i--) {
      scopes[i] = db.objectStoreNames[i]
    }
  }
  if(scopes.length == 0) {
    fnc(null);
    return
  }
  var tx = db.transaction(scopes, (mode));
  tx.oncomplete = function(event) {
    on_completed(ydn.db.base.TxEventTypes.COMPLETE, event)
  };
  tx.onerror = function(event) {
    on_completed(ydn.db.base.TxEventTypes.ERROR, event)
  };
  tx.onabort = function(event) {
    on_completed(ydn.db.base.TxEventTypes.ABORT, event)
  };
  fnc(tx);
  fnc = null
};
ydn.db.con.IndexedDb.prototype.close = function() {
  this.idx_db_.close()
};
if(goog.DEBUG) {
  ydn.db.con.IndexedDb.prototype.toString = function() {
    var s = this.idx_db_ ? this.idx_db_.name + ":" + this.idx_db_.version : "";
    return"IndexedDB:" + s
  }
}
;goog.provide("ydn.db.ConstraintError");
goog.provide("ydn.db.InternalError");
goog.provide("ydn.db.InvalidKeyException");
goog.provide("ydn.db.InvalidStateError");
goog.provide("ydn.db.NotFoundError");
goog.provide("ydn.db.ScopeError");
goog.provide("ydn.db.SecurityError");
goog.provide("ydn.db.TimeoutError");
goog.provide("ydn.db.VersionError");
ydn.db.ConstraintError = function(opt_msg) {
  if(Error.captureStackTrace) {
    Error.captureStackTrace(this, ydn.db.ConstraintError)
  }else {
    this.stack = (new Error).stack || ""
  }
  if(opt_msg) {
    this.message = String(opt_msg)
  }
  this.name = "ConstraintError"
};
goog.inherits(ydn.db.ConstraintError, Error);
ydn.db.ConstraintError.prototype.name = "ConstraintError";
ydn.db.InvalidKeyException = function(opt_msg) {
  if(Error.captureStackTrace) {
    Error.captureStackTrace(this, ydn.db.InvalidKeyException)
  }else {
    this.stack = (new Error).stack || ""
  }
  if(opt_msg) {
    this.message = String(opt_msg)
  }
  this.name = "ydn.db.InvalidKeyException"
};
goog.inherits(ydn.db.InvalidKeyException, Error);
ydn.db.VersionError = function(opt_msg) {
  if(Error.captureStackTrace) {
    Error.captureStackTrace(this, ydn.db.VersionError)
  }else {
    this.stack = (new Error).stack || ""
  }
  if(opt_msg) {
    this.message = String(opt_msg)
  }
  this.name = "ydn.db.VersionError"
};
goog.inherits(ydn.db.VersionError, Error);
ydn.db.VersionError.prototype.name = "ydn.db.VersionError";
ydn.db.InternalError = function(opt_msg) {
  if(Error.captureStackTrace) {
    Error.captureStackTrace(this, ydn.db.InternalError)
  }else {
    this.stack = (new Error).stack || ""
  }
  if(opt_msg) {
    this.message = String(opt_msg)
  }
};
goog.inherits(ydn.db.InternalError, Error);
ydn.db.InternalError.prototype.name = "ydn.db.InternalError";
ydn.db.ScopeError = function(opt_msg) {
  if(Error.captureStackTrace) {
    Error.captureStackTrace(this, ydn.db.ScopeError)
  }else {
    this.stack = (new Error).stack || ""
  }
  if(opt_msg) {
    this.message = String(opt_msg)
  }
  this.name = "ydn.db.ScopeError"
};
goog.inherits(ydn.db.ScopeError, Error);
ydn.db.InvalidStateError = function(opt_msg) {
  if(Error.captureStackTrace) {
    Error.captureStackTrace(this, ydn.db.InvalidStateError)
  }else {
    this.stack = (new Error).stack || ""
  }
  if(opt_msg) {
    this.message = String(opt_msg)
  }
  this.name = "InvalidStateError"
};
goog.inherits(ydn.db.InvalidStateError, Error);
ydn.db.InvalidAccessError = function(opt_msg) {
  if(Error.captureStackTrace) {
    Error.captureStackTrace(this, ydn.db.InvalidAccessError)
  }else {
    this.stack = (new Error).stack || ""
  }
  if(opt_msg) {
    this.message = String(opt_msg)
  }
  this.name = "InvalidAccessError"
};
goog.inherits(ydn.db.InvalidAccessError, Error);
ydn.db.NotFoundError = function(opt_msg) {
  if(Error.captureStackTrace) {
    Error.captureStackTrace(this, ydn.db.NotFoundError)
  }else {
    this.stack = (new Error).stack || ""
  }
  if(opt_msg) {
    this.message = String(opt_msg)
  }
  this.name = "NotFoundError"
};
goog.inherits(ydn.db.NotFoundError, Error);
ydn.db.NotFoundError.prototype.name = "NotFoundError";
ydn.db.DataCloneError = function(opt_msg) {
  if(Error.captureStackTrace) {
    Error.captureStackTrace(this, ydn.db.DataCloneError)
  }else {
    this.stack = (new Error).stack || ""
  }
  if(opt_msg) {
    this.message = String(opt_msg)
  }
  this.name = "DataCloneError"
};
goog.inherits(ydn.db.DataCloneError, Error);
ydn.db.SQLError = function(e, opt_msg) {
  if(Error.captureStackTrace) {
    Error.captureStackTrace(this, ydn.db.SQLError)
  }else {
    this.stack = (new Error).stack || ""
  }
  if(opt_msg) {
    this.message = String(opt_msg)
  }
  this.message += " :" + e.message + " [" + e.code + "]";
  this.name = "SQLError"
};
goog.inherits(ydn.db.SQLError, Error);
ydn.db.SecurityError = function(e, opt_msg) {
  if(Error.captureStackTrace) {
    Error.captureStackTrace(this, ydn.db.SecurityError)
  }else {
    this.stack = (new Error).stack || ""
  }
  if(opt_msg) {
    this.message = String(opt_msg)
  }
  this.message += " :" + e.message;
  this.name = "SecurityError"
};
goog.inherits(ydn.db.SecurityError, Error);
ydn.db.SqlParseError = function(opt_msg) {
  if(Error.captureStackTrace) {
    Error.captureStackTrace(this, ydn.db.SqlParseError)
  }else {
    this.stack = (new Error).stack || ""
  }
  if(opt_msg) {
    this.message = String(opt_msg)
  }
  this.name = "ydn.db.SqlParseError"
};
goog.inherits(ydn.db.SqlParseError, Error);
ydn.db.TimeoutError = function(opt_msg) {
  if(Error.captureStackTrace) {
    Error.captureStackTrace(this, ydn.db.TimeoutError)
  }else {
    this.stack = (new Error).stack || ""
  }
  if(opt_msg) {
    this.message = String(opt_msg)
  }
  this.name = "ydn.db.TimeoutError"
};
goog.inherits(ydn.db.TimeoutError, Error);
ydn.db.TxError = function(result, opt_msg) {
  if(Error.captureStackTrace) {
    Error.captureStackTrace(this, ydn.db.TxError)
  }else {
    this.stack = (new Error).stack || ""
  }
  if(opt_msg) {
    this.message = String(opt_msg)
  }
  this.name = "TxError";
  this.result = result
};
goog.inherits(ydn.db.TxError, Error);
ydn.db.TxError.prototype.result;
ydn.db.TxError.prototype.getResult = function() {
  return this.result
};
ydn.db.TxAbortedError = function(result, opt_msg) {
  goog.base(this, result, opt_msg);
  this.name = "TxAbortedError"
};
goog.inherits(ydn.db.TxAbortedError, ydn.db.TxError);
goog.provide("ydn.string");
ydn.string.split_comma_seperated = function(str) {
  return str.match(/(?:"[^"]*"|[^,])+/g)
};
ydn.string.split_space_seperated = function(str) {
  return str.match(/\w+|"[^"]+"/g)
};
ydn.string.split_space = function(str) {
  return str.match(/[^\s"']+|"[^"]*"|'[^']*'/g)
};
goog.provide("ydn.db.con.WebSql");
goog.require("goog.async.Deferred");
goog.require("goog.debug.Logger");
goog.require("goog.events");
goog.require("goog.functions");
goog.require("ydn.async");
goog.require("ydn.db.SecurityError");
goog.require("ydn.db.base");
goog.require("ydn.db.con.IDatabase");
goog.require("ydn.debug.error.NotImplementedException");
goog.require("ydn.json");
goog.require("ydn.string");
ydn.db.con.WebSql = function(opt_size) {
  this.size_ = goog.isDef(opt_size) ? opt_size : 4 * 1024 * 1024
};
ydn.db.con.WebSql.prototype.connect = function(dbname, schema) {
  var description = dbname;
  var me = this;
  var old_version = NaN;
  var init_migrated = false;
  var df = new goog.async.Deferred;
  var setDb = function(db, e) {
    if(goog.isDef(e)) {
      me.sql_db_ = null;
      df.errback(e)
    }else {
      me.sql_db_ = db;
      df.callback(parseFloat(old_version))
    }
  };
  var doVersionChange_ = function(db, schema, is_version_change) {
    var action = is_version_change ? "changing version" : "setting version";
    var current_version = db.version ? parseInt(db.version, 10) : 0;
    var new_version = schema.isAutoVersion() ? is_version_change ? isNaN(current_version) ? 1 : current_version + 1 : current_version : schema.version;
    me.logger.finest(dbname + ": " + action + " from " + db.version + " to " + new_version);
    var executed = false;
    var updated_count = 0;
    var transaction_callback = function(tx) {
      me.getSchema(function(existing_schema) {
        executed = true;
        for(var i = 0;i < schema.count();i++) {
          var counter = function(ok) {
            if(ok) {
              updated_count++
            }
          };
          var table_info = existing_schema.getStore(schema.store(i).getName());
          var hinted_store_schema = table_info ? table_info.hint(schema.store(i)) : null;
          me.update_store_with_info_(tx, schema.store(i), counter, hinted_store_schema)
        }
        if(schema instanceof ydn.db.schema.EditableDatabase) {
          var edited_schema = schema;
          for(var j = 0;j < existing_schema.count();j++) {
            var info_store = existing_schema.store(j);
            if(!edited_schema.hasStore(info_store.getName())) {
              edited_schema.addStore(info_store)
            }
          }
        }else {
        }
      }, tx, db)
    };
    var success_callback = function() {
      var has_created = updated_count == schema.stores.length;
      if(!executed) {
        me.logger.warning(dbname + ": " + action + " voided.")
      }else {
        var msg = ".";
        if(updated_count != schema.stores.length) {
          msg = " but unexpected stores exists."
        }
        me.logger.finest(dbname + ":" + db.version + " ready" + msg);
        setDb(db)
      }
    };
    var error_callback = function(e) {
      throw e;
    };
    db.changeVersion(db.version, new_version + "", transaction_callback, error_callback, success_callback)
  };
  var db = null;
  var creationCallback = function(e) {
    var msg = init_migrated ? " and already migrated, but migrating again." : ", migrating.";
    me.logger.finest("receiving creation callback " + msg);
    var use_version_change_request = true;
    doVersionChange_(db, schema, use_version_change_request)
  };
  try {
    var version = schema.isAutoVersion() ? "" : schema.version + "";
    if(ydn.db.con.WebSql.GENTLE_OPENING) {
      db = goog.global.openDatabase(dbname, "", description, this.size_)
    }else {
      try {
        db = goog.global.openDatabase(dbname, version, description, this.size_, creationCallback)
      }catch(e) {
        if(e.name == "INVALID_STATE_ERR") {
          db = goog.global.openDatabase(dbname, "", description, this.size_)
        }else {
          throw e;
        }
      }
    }
  }catch(e) {
    if(e.name == "SECURITY_ERR") {
      this.logger.warning("SECURITY_ERR for opening " + dbname);
      db = null;
      this.last_error_ = new ydn.db.SecurityError(e)
    }else {
      throw e;
    }
  }
  if(!db) {
    setDb(null, this.last_error_)
  }else {
    old_version = db.version;
    var db_info = "database " + dbname + (db.version.length == 0 ? "" : " version " + db.version);
    if(goog.isDefAndNotNull(schema.version) && schema.version == db.version) {
      me.logger.fine("Existing " + db_info + " opened as requested.");
      setDb(db)
    }else {
      this.getSchema(function(existing_schema) {
        var msg = schema.difference(existing_schema, true);
        if(msg) {
          if(db.version.length == 0) {
            me.logger.fine("New " + db_info + " created.");
            doVersionChange_(db, schema, true)
          }else {
            if(!schema.isAutoVersion()) {
              me.logger.fine("Existing " + db_info + " opened and " + " schema change to version " + schema.version + " for " + msg);
              doVersionChange_(db, schema, true)
            }else {
              me.logger.fine("Existing " + db_info + " opened and " + "schema change for " + msg);
              doVersionChange_(db, schema, true)
            }
          }
        }else {
          me.logger.fine("Existing " + db_info + " with same schema opened.");
          setDb(db)
        }
      }, null, db)
    }
  }
  return df
};
ydn.db.con.WebSql.GENTLE_OPENING = true;
ydn.db.con.WebSql.prototype.getType = function() {
  return ydn.db.base.Mechanisms.WEBSQL
};
ydn.db.con.WebSql.prototype.last_error_ = null;
ydn.db.con.WebSql.prototype.sql_db_ = null;
ydn.db.con.WebSql.prototype.getDbInstance = function() {
  return this.sql_db_ || null
};
ydn.db.con.WebSql.isSupported = function() {
  return goog.isFunction(goog.global.openDatabase)
};
ydn.db.con.WebSql.DEBUG = false;
ydn.db.con.WebSql.prototype.logger = goog.debug.Logger.getLogger("ydn.db.con.WebSql");
ydn.db.con.WebSql.PREFIX_MULTIENTRY = "ydn.db.me:";
ydn.db.con.WebSql.prototype.prepareCreateTable_ = function(table) {
  var primary_type = table.getSqlType();
  var insert_statement = "CREATE TABLE IF NOT EXISTS ";
  var sql = insert_statement + table.getQuotedName() + " (";
  var q_primary_column = table.getSQLKeyColumnNameQuoted();
  sql += q_primary_column + " " + primary_type + " PRIMARY KEY ";
  if(table.autoIncrement) {
    sql += " AUTOINCREMENT "
  }
  sql += " ," + ydn.db.base.DEFAULT_BLOB_COLUMN + " " + ydn.db.schema.DataType.BLOB;
  var sqls = [];
  var sep = ", ";
  var column_names = [q_primary_column];
  for(var i = 0, n = table.countIndex();i < n;i++) {
    var index = table.index(i);
    var unique = "";
    if(index.isMultiEntry()) {
      var idx_name = ydn.db.con.WebSql.PREFIX_MULTIENTRY + table.getName() + ":" + index.getName();
      var idx_unique = index.isUnique() ? " UNIQUE " : "";
      var multi_entry_sql = insert_statement + goog.string.quote(idx_name) + " (" + q_primary_column + " " + primary_type + ", " + index.getSQLIndexColumnNameQuoted() + " " + index.getSqlType() + idx_unique + ")";
      sqls.push(multi_entry_sql);
      continue
    }else {
      if(index.isUnique()) {
        unique = " UNIQUE "
      }
    }
    var index_key_path = index.getSQLIndexColumnNameQuoted();
    if(column_names.indexOf(index_key_path) == -1) {
      sql += sep + index_key_path + " " + index.getSqlType() + unique;
      column_names.push(index_key_path)
    }
  }
  sql += ");";
  sqls.push(sql);
  return sqls
};
ydn.db.con.WebSql.prototype.getVersion = function() {
  return this.sql_db_ ? parseFloat(this.sql_db_.version) : undefined
};
ydn.db.con.WebSql.prototype.getSchema = function(callback, trans, db) {
  var me = this;
  db = db || this.sql_db_;
  var version = db && db.version ? parseFloat(db.version) : undefined;
  version = isNaN(version) ? undefined : version;
  var stores = [];
  var success_callback = function(transaction, results) {
    if(!results || !results.rows) {
      return
    }
    for(var i = 0;i < results.rows.length;i++) {
      var info = (results.rows.item(i));
      if(info.name == "__WebKitDatabaseInfoTable__") {
        continue
      }
      if(info.name == "sqlite_sequence") {
        continue
      }
      if(info.type == "table") {
        var sql = goog.object.get(info, "sql");
        me.logger.finest("Parsing table schema from SQL: " + sql);
        var str = sql.substr(sql.indexOf("("), sql.lastIndexOf(")"));
        var column_infos = ydn.string.split_comma_seperated(str);
        var key_name = undefined;
        var key_type;
        var indexes = [];
        var autoIncrement = false;
        var has_default_blob_column = false;
        for(var j = 0;j < column_infos.length;j++) {
          var fields = ydn.string.split_space_seperated(column_infos[j]);
          var upper_fields = goog.array.map(fields, function(x) {
            return x.toUpperCase()
          });
          var name = goog.string.stripQuotes(fields[0], '"');
          var type = ydn.db.schema.Index.toType(upper_fields[1]);
          if(upper_fields.indexOf("PRIMARY") != -1 && upper_fields.indexOf("KEY") != -1) {
            if(goog.isString(name) && !goog.string.isEmpty(name) && name != ydn.db.base.SQLITE_SPECIAL_COLUNM_NAME) {
              key_name = name
            }
            key_type = type;
            if(upper_fields.indexOf("AUTOINCREMENT") != -1) {
              autoIncrement = true
            }
          }else {
            if(name == ydn.db.base.DEFAULT_BLOB_COLUMN) {
              has_default_blob_column = true
            }else {
              var unique = upper_fields[2] == "UNIQUE";
              var index = new ydn.db.schema.Index(name, type, unique);
              indexes.push(index)
            }
          }
        }
        if(goog.string.startsWith(info.name, ydn.db.con.WebSql.PREFIX_MULTIENTRY)) {
          var names = info.name.split(":");
          if(!!names && names.length >= 3) {
            var st_name = names[1];
            var store_index = goog.array.findIndex(stores, function(x) {
              return x.getName() === st_name
            });
            var multi_index = new ydn.db.schema.Index(names[2], type, unique, true);
            if(store_index >= 0) {
              var ex_store = stores[store_index];
              indexes.push(multi_index);
              stores[store_index] = new ydn.db.schema.Store(ex_store.getName(), ex_store.getKeyPath(), autoIncrement, key_type, indexes, undefined, !has_default_blob_column)
            }else {
              stores.push(new ydn.db.schema.Store(st_name, undefined, false, undefined, [multi_index]))
            }
          }else {
            me.logger.warning('Invalid multiEntry store name "' + info.name + '"')
          }
        }else {
          var i_store = goog.array.findIndex(stores, function(x) {
            return x.getName() === info.name
          });
          if(i_store >= 0) {
            var ex_index = stores[i_store].index(0);
            goog.asserts.assertInstanceof(ex_index, ydn.db.schema.Index);
            indexes.push(ex_index);
            stores[i_store] = new ydn.db.schema.Store(info.name, key_name, autoIncrement, key_type, indexes, undefined, !has_default_blob_column)
          }else {
            var store = new ydn.db.schema.Store(info.name, key_name, autoIncrement, key_type, indexes, undefined, !has_default_blob_column);
            stores.push(store)
          }
        }
      }
    }
    var out = new ydn.db.schema.Database(version, stores);
    callback(out)
  };
  var error_callback = function(tr, error) {
    if(ydn.db.con.WebSql.DEBUG) {
      window.console.log([tr, error])
    }
    throw error;
  };
  if(!trans) {
    var tx_error_callback = function(e) {
      me.logger.severe("opening tx: " + e.message);
      throw e;
    };
    db.readTransaction(function(tx) {
      me.getSchema(callback, tx, db)
    }, tx_error_callback, success_callback);
    return
  }
  var sql = "SELECT * FROM sqlite_master";
  trans.executeSql(sql, [], success_callback, error_callback)
};
ydn.db.con.WebSql.prototype.update_store_ = function(trans, store_schema, callback) {
  var me = this;
  this.getSchema(function(table_infos) {
    var table_info = table_infos.getStore(store_schema.name);
    me.update_store_with_info_(trans, store_schema, callback, table_info)
  }, trans)
};
ydn.db.con.WebSql.prototype.update_store_with_info_ = function(trans, table_schema, callback, existing_table_schema) {
  var me = this;
  var count = 0;
  var exe_sql = function(sql) {
    var success_callback = function(transaction, results) {
      count++;
      if(count == sqls.length) {
        callback(true);
        callback = null
      }
    };
    var error_callback = function(tr, error) {
      if(ydn.db.con.WebSql.DEBUG) {
        window.console.log([tr, error])
      }
      count++;
      if(count == sqls.length) {
        callback(false);
        callback = null
      }
      var msg = goog.DEBUG ? "SQLError creating table: " + table_schema.name + " " + error.message + ' for executing "' + sql : '"';
      throw new ydn.db.SQLError(error, msg);
    };
    trans.executeSql(sql, [], success_callback, error_callback)
  };
  var sqls = this.prepareCreateTable_(table_schema);
  var action = "Create";
  if(existing_table_schema) {
    var msg = table_schema.difference(existing_table_schema);
    if(msg.length == 0) {
      me.logger.finest("same table " + table_schema.name + " exists.");
      callback(true);
      callback = null;
      return
    }else {
      action = "Modify";
      this.logger.warning("table: " + table_schema.name + " has changed by " + msg + " additionallly TABLE ALTERATION is not implemented, " + "dropping old table.");
      sqls.unshift("DROP TABLE IF EXISTS " + goog.string.quote(table_schema.name))
    }
  }
  if(ydn.db.con.WebSql.DEBUG) {
    window.console.log([sqls, existing_table_schema])
  }
  me.logger.finest(action + " table: " + table_schema.name + ": " + sqls.join(";"));
  for(var i = 0;i < sqls.length;i++) {
    exe_sql(sqls[i])
  }
};
ydn.db.con.WebSql.prototype.isReady = function() {
  return!!this.sql_db_
};
ydn.db.con.WebSql.prototype.close = function() {
};
ydn.db.con.WebSql.prototype.doTransaction = function(trFn, scopes, mode, completed_event_handler) {
  var me = this;
  var transaction_callback = function(tx) {
    trFn(tx)
  };
  var success_callback = function() {
    completed_event_handler(ydn.db.base.TxEventTypes.COMPLETE, {"type":ydn.db.base.TxEventTypes.COMPLETE})
  };
  var error_callback = function(e) {
    me.logger.finest(me + ": Tx " + mode + " request cause error.");
    completed_event_handler(ydn.db.base.TxEventTypes.ERROR, e)
  };
  if(goog.isNull(this.sql_db_)) {
    trFn(null);
    completed_event_handler(ydn.db.base.TxEventTypes.ERROR, this.last_error_)
  }
  if(mode == ydn.db.base.TransactionMode.READ_ONLY) {
    this.sql_db_.readTransaction(transaction_callback, error_callback, success_callback)
  }else {
    if(mode == ydn.db.base.TransactionMode.VERSION_CHANGE) {
      var next_version = this.sql_db_.version + 1;
      this.sql_db_.changeVersion(this.sql_db_.version, next_version + "", transaction_callback, error_callback, success_callback)
    }else {
      this.sql_db_.transaction(transaction_callback, error_callback, success_callback)
    }
  }
};
ydn.db.con.WebSql.deleteDatabase = function(db_name) {
  var db = new ydn.db.con.WebSql;
  var schema = new ydn.db.schema.EditableDatabase;
  db.logger.finer("deleting websql database: " + db_name);
  var df = db.connect(db_name, schema);
  var on_completed = function(t, e) {
    db.logger.info("all tables in " + db_name + " deleted.")
  };
  df.addCallback(function() {
    db.doTransaction(function delete_tables(tx) {
      var success_callback = function(transaction, results) {
        if(!results || !results.rows) {
          return
        }
        var n = results.rows.length;
        var del = 0;
        for(var i = 0;i < n;i++) {
          var info = (results.rows.item(i));
          if(info.name == "__WebKitDatabaseInfoTable__" || info.name == "sqlite_sequence") {
            continue
          }
          del++;
          db.logger.finest("deleting table: " + info.name);
          tx.executeSql("DROP TABLE " + info.name)
        }
        db.logger.finer(del + ' tables deleted from "' + db_name + '"')
      };
      var error_callback = function(tr, error) {
        if(ydn.db.con.WebSql.DEBUG) {
          window.console.log([tr, error])
        }
        throw error;
      };
      var sql = 'SELECT * FROM sqlite_master WHERE type = "table"';
      tx.executeSql(sql, [], success_callback, error_callback)
    }, [], ydn.db.base.TransactionMode.READ_WRITE, on_completed)
  });
  df.addErrback(function() {
    db.logger.warning("Connecting " + db_name + " failed.")
  })
};
if(goog.DEBUG) {
  ydn.db.con.WebSql.prototype.toString = function() {
    var s = this.sql_db_ ? ":" + this.sql_db_.version : "";
    return"WebSql:" + s
  }
}
;goog.provide("ydn.db.con.simple");
ydn.db.con.simple.NAMESPACE = "ydn.db";
ydn.db.con.simple.SEP = "^|";
ydn.db.con.simple.makeKey = function(db_name, opt_store_name, opt_index_name, opt_id) {
  var parts = [ydn.db.con.simple.NAMESPACE, db_name];
  if(goog.isDef(opt_store_name)) {
    parts.push(opt_store_name);
    if(goog.isDef(opt_index_name)) {
      parts.push(opt_index_name);
      if(goog.isDef(opt_id)) {
        parts.push(ydn.db.utils.encodeKey(opt_id))
      }
    }
  }
  return parts.join(ydn.db.con.simple.SEP)
};
goog.provide("goog.structs.AvlTree");
goog.provide("goog.structs.AvlTree.Node");
goog.require("goog.structs");
goog.require("goog.structs.Collection");
goog.structs.AvlTree = function(opt_comparator) {
  this.comparator_ = opt_comparator || goog.structs.AvlTree.DEFAULT_COMPARATOR_
};
goog.structs.AvlTree.DEFAULT_COMPARATOR_ = function(a, b) {
  if(String(a) < String(b)) {
    return-1
  }else {
    if(String(a) > String(b)) {
      return 1
    }
  }
  return 0
};
goog.structs.AvlTree.prototype.root_ = null;
goog.structs.AvlTree.prototype.comparator_ = null;
goog.structs.AvlTree.prototype.minNode_ = null;
goog.structs.AvlTree.prototype.maxNode_ = null;
goog.structs.AvlTree.prototype.add = function(value) {
  if(this.root_ == null) {
    this.root_ = new goog.structs.AvlTree.Node(value);
    this.minNode_ = this.root_;
    this.maxNode_ = this.root_;
    return true
  }
  var newNode = null;
  this.traverse_(function(node) {
    var retNode = null;
    if(this.comparator_(node.value, value) > 0) {
      retNode = node.left;
      if(node.left == null) {
        newNode = new goog.structs.AvlTree.Node(value, node);
        node.left = newNode;
        if(node == this.minNode_) {
          this.minNode_ = newNode
        }
      }
    }else {
      if(this.comparator_(node.value, value) < 0) {
        retNode = node.right;
        if(node.right == null) {
          newNode = new goog.structs.AvlTree.Node(value, node);
          node.right = newNode;
          if(node == this.maxNode_) {
            this.maxNode_ = newNode
          }
        }
      }
    }
    return retNode
  });
  if(newNode) {
    this.traverse_(function(node) {
      node.count++;
      return node.parent
    }, newNode.parent);
    this.balance_(newNode.parent)
  }
  return!!newNode
};
goog.structs.AvlTree.prototype.remove = function(value) {
  var retValue = null;
  this.traverse_(function(node) {
    var retNode = null;
    if(this.comparator_(node.value, value) > 0) {
      retNode = node.left
    }else {
      if(this.comparator_(node.value, value) < 0) {
        retNode = node.right
      }else {
        retValue = node.value;
        this.removeNode_(node)
      }
    }
    return retNode
  });
  return retValue
};
goog.structs.AvlTree.prototype.clear = function() {
  this.root_ = null;
  this.minNode_ = null;
  this.maxNode_ = null
};
goog.structs.AvlTree.prototype.contains = function(value) {
  var isContained = false;
  this.traverse_(function(node) {
    var retNode = null;
    if(this.comparator_(node.value, value) > 0) {
      retNode = node.left
    }else {
      if(this.comparator_(node.value, value) < 0) {
        retNode = node.right
      }else {
        isContained = true
      }
    }
    return retNode
  });
  return isContained
};
goog.structs.AvlTree.prototype.getCount = function() {
  return this.root_ ? this.root_.count : 0
};
goog.structs.AvlTree.prototype.getKthValue = function(k) {
  if(k < 0 || k >= this.getCount()) {
    return null
  }
  return this.getKthNode_(k).value
};
goog.structs.AvlTree.prototype.getMinimum = function() {
  return this.getMinNode_().value
};
goog.structs.AvlTree.prototype.getMaximum = function() {
  return this.getMaxNode_().value
};
goog.structs.AvlTree.prototype.getHeight = function() {
  return this.root_ ? this.root_.height : 0
};
goog.structs.AvlTree.prototype.getValues = function() {
  var ret = [];
  this.inOrderTraverse(function(value) {
    ret.push(value)
  });
  return ret
};
goog.structs.AvlTree.prototype.inOrderTraverse = function(func, opt_startValue) {
  if(!this.root_) {
    return
  }
  var startNode;
  if(opt_startValue) {
    this.traverse_(function(node) {
      var retNode = null;
      if(this.comparator_(node.value, opt_startValue) > 0) {
        retNode = node.left;
        startNode = node
      }else {
        if(this.comparator_(node.value, opt_startValue) < 0) {
          retNode = node.right
        }else {
          startNode = node
        }
      }
      return retNode
    })
  }else {
    startNode = this.getMinNode_()
  }
  var node = startNode, prev = startNode.left ? startNode.left : startNode;
  while(node != null) {
    if(node.left != null && node.left != prev && node.right != prev) {
      node = node.left
    }else {
      if(node.right != prev) {
        if(func(node.value)) {
          return
        }
      }
      var temp = node;
      node = node.right != null && node.right != prev ? node.right : node.parent;
      prev = temp
    }
  }
};
goog.structs.AvlTree.prototype.reverseOrderTraverse = function(func, opt_startValue) {
  if(!this.root_) {
    return
  }
  var startNode;
  if(opt_startValue) {
    this.traverse_(goog.bind(function(node) {
      var retNode = null;
      if(this.comparator_(node.value, opt_startValue) > 0) {
        retNode = node.left
      }else {
        if(this.comparator_(node.value, opt_startValue) < 0) {
          retNode = node.right;
          startNode = node
        }else {
          startNode = node
        }
      }
      return retNode
    }, this))
  }else {
    startNode = this.getMaxNode_()
  }
  var node = startNode, prev = startNode.right ? startNode.right : startNode;
  while(node != null) {
    if(node.right != null && node.right != prev && node.left != prev) {
      node = node.right
    }else {
      if(node.left != prev) {
        if(func(node.value)) {
          return
        }
      }
      var temp = node;
      node = node.left != null && node.left != prev ? node.left : node.parent;
      prev = temp
    }
  }
};
goog.structs.AvlTree.prototype.traverse_ = function(traversalFunc, opt_startNode, opt_endNode) {
  var node = opt_startNode ? opt_startNode : this.root_;
  var endNode = opt_endNode ? opt_endNode : null;
  while(node && node != endNode) {
    node = traversalFunc.call(this, node)
  }
};
goog.structs.AvlTree.prototype.balance_ = function(node) {
  this.traverse_(function(node) {
    var lh = node.left ? node.left.height : 0;
    var rh = node.right ? node.right.height : 0;
    if(lh - rh > 1) {
      if(node.left.right && (!node.left.left || node.left.left.height < node.left.right.height)) {
        this.leftRotate_(node.left)
      }
      this.rightRotate_(node)
    }else {
      if(rh - lh > 1) {
        if(node.right.left && (!node.right.right || node.right.right.height < node.right.left.height)) {
          this.rightRotate_(node.right)
        }
        this.leftRotate_(node)
      }
    }
    lh = node.left ? node.left.height : 0;
    rh = node.right ? node.right.height : 0;
    node.height = Math.max(lh, rh) + 1;
    return node.parent
  }, node)
};
goog.structs.AvlTree.prototype.leftRotate_ = function(node) {
  if(node.isLeftChild()) {
    node.parent.left = node.right;
    node.right.parent = node.parent
  }else {
    if(node.isRightChild()) {
      node.parent.right = node.right;
      node.right.parent = node.parent
    }else {
      this.root_ = node.right;
      this.root_.parent = null
    }
  }
  var temp = node.right;
  node.right = node.right.left;
  if(node.right != null) {
    node.right.parent = node
  }
  temp.left = node;
  node.parent = temp;
  temp.count = node.count;
  node.count -= (temp.right ? temp.right.count : 0) + 1
};
goog.structs.AvlTree.prototype.rightRotate_ = function(node) {
  if(node.isLeftChild()) {
    node.parent.left = node.left;
    node.left.parent = node.parent
  }else {
    if(node.isRightChild()) {
      node.parent.right = node.left;
      node.left.parent = node.parent
    }else {
      this.root_ = node.left;
      this.root_.parent = null
    }
  }
  var temp = node.left;
  node.left = node.left.right;
  if(node.left != null) {
    node.left.parent = node
  }
  temp.right = node;
  node.parent = temp;
  temp.count = node.count;
  node.count -= (temp.left ? temp.left.count : 0) + 1
};
goog.structs.AvlTree.prototype.removeNode_ = function(node) {
  if(node.left != null || node.right != null) {
    var b = null;
    var r;
    if(node.left != null) {
      r = this.getMaxNode_(node.left);
      this.traverse_(function(node) {
        node.count--;
        return node.parent
      }, r);
      if(r != node.left) {
        r.parent.right = r.left;
        if(r.left) {
          r.left.parent = r.parent
        }
        r.left = node.left;
        r.left.parent = r;
        b = r.parent
      }
      r.parent = node.parent;
      r.right = node.right;
      if(r.right) {
        r.right.parent = r
      }
      if(node == this.maxNode_) {
        this.maxNode_ = r
      }
      r.count = node.count
    }else {
      r = this.getMinNode_(node.right);
      this.traverse_(function(node) {
        node.count--;
        return node.parent
      }, r);
      if(r != node.right) {
        r.parent.left = r.right;
        if(r.right) {
          r.right.parent = r.parent
        }
        r.right = node.right;
        r.right.parent = r;
        b = r.parent
      }
      r.parent = node.parent;
      r.left = node.left;
      if(r.left) {
        r.left.parent = r
      }
      if(node == this.minNode_) {
        this.minNode_ = r
      }
      r.count = node.count
    }
    if(node.isLeftChild()) {
      node.parent.left = r
    }else {
      if(node.isRightChild()) {
        node.parent.right = r
      }else {
        this.root_ = r
      }
    }
    this.balance_(b ? b : r)
  }else {
    this.traverse_(function(node) {
      node.count--;
      return node.parent
    }, node.parent);
    if(node.isLeftChild()) {
      this.special = 1;
      node.parent.left = null;
      if(node == this.minNode_) {
        this.minNode_ = node.parent
      }
      this.balance_(node.parent)
    }else {
      if(node.isRightChild()) {
        node.parent.right = null;
        if(node == this.maxNode_) {
          this.maxNode_ = node.parent
        }
        this.balance_(node.parent)
      }else {
        this.clear()
      }
    }
  }
};
goog.structs.AvlTree.prototype.getKthNode_ = function(k, opt_rootNode) {
  var root = opt_rootNode || this.root_;
  var numNodesInLeftSubtree = root.left ? root.left.count : 0;
  if(k < numNodesInLeftSubtree) {
    return this.getKthNode_(k, root.left)
  }else {
    if(k == numNodesInLeftSubtree) {
      return root
    }else {
      return this.getKthNode_(k - numNodesInLeftSubtree - 1, root.right)
    }
  }
};
goog.structs.AvlTree.prototype.getMinNode_ = function(opt_rootNode) {
  if(!opt_rootNode) {
    return this.minNode_
  }
  var minNode = opt_rootNode;
  this.traverse_(function(node) {
    var retNode = null;
    if(node.left) {
      minNode = node.left;
      retNode = node.left
    }
    return retNode
  }, opt_rootNode);
  return minNode
};
goog.structs.AvlTree.prototype.getMaxNode_ = function(opt_rootNode) {
  if(!opt_rootNode) {
    return this.maxNode_
  }
  var maxNode = opt_rootNode;
  this.traverse_(function(node) {
    var retNode = null;
    if(node.right) {
      maxNode = node.right;
      retNode = node.right
    }
    return retNode
  }, opt_rootNode);
  return maxNode
};
goog.structs.AvlTree.Node = function(value, opt_parent) {
  this.value = value;
  this.parent = opt_parent ? opt_parent : null;
  this.count = 1
};
goog.structs.AvlTree.Node.prototype.left = null;
goog.structs.AvlTree.Node.prototype.right = null;
goog.structs.AvlTree.Node.prototype.height = 1;
goog.structs.AvlTree.Node.prototype.isRightChild = function() {
  return!!this.parent && this.parent.right == this
};
goog.structs.AvlTree.Node.prototype.isLeftChild = function() {
  return!!this.parent && this.parent.left == this
};
goog.provide("ydn.db.Buffer");
goog.provide("ydn.db.Buffer.Iterator");
goog.require("goog.structs.AvlTree");
goog.require("ydn.db.KeyRange");
ydn.db.Buffer = function(opt_comparator) {
  goog.base(this, opt_comparator)
};
goog.inherits(ydn.db.Buffer, goog.structs.AvlTree);
ydn.db.Buffer.prototype.traverse = function(func, opt_startValue) {
  if(!this.root_) {
    return
  }
  var startNode;
  if(opt_startValue instanceof goog.structs.AvlTree.Node) {
    startNode = opt_startValue
  }else {
    if(opt_startValue) {
      this.traverse_(function(node) {
        var retNode = null;
        if(this.comparator_(node.value, opt_startValue) > 0) {
          retNode = node.left;
          startNode = node
        }else {
          if(this.comparator_(node.value, opt_startValue) < 0) {
            retNode = node.right
          }else {
            startNode = node
          }
        }
        return retNode
      });
      if(!startNode) {
        return
      }
    }else {
      startNode = this.getMinNode_()
    }
  }
  var node = startNode, prev = startNode.left ? startNode.left : startNode;
  while(node != null) {
    if(node.left != null && node.left != prev && node.right != prev) {
      node = node.left
    }else {
      if(node.right != prev) {
        if(func(node)) {
          return
        }
      }
      var temp = node;
      node = node.right != null && node.right != prev ? node.right : node.parent;
      prev = temp
    }
  }
  func(null)
};
ydn.db.Buffer.prototype.reverseTraverse = function(func, opt_startValue) {
  if(!this.root_) {
    return
  }
  var startNode;
  if(opt_startValue instanceof goog.structs.AvlTree.Node) {
    startNode = opt_startValue
  }else {
    if(opt_startValue) {
      this.traverse_(goog.bind(function(node) {
        var retNode = null;
        if(this.comparator_(node.value, opt_startValue) > 0) {
          retNode = node.left
        }else {
          if(this.comparator_(node.value, opt_startValue) < 0) {
            retNode = node.right;
            startNode = node
          }else {
            startNode = node
          }
        }
        return retNode
      }, this));
      if(!startNode) {
        return
      }
    }else {
      startNode = this.getMaxNode_()
    }
  }
  var node = startNode, prev = startNode.right ? startNode.right : startNode;
  while(node != null) {
    if(node.right != null && node.right != prev && node.left != prev) {
      node = node.right
    }else {
      if(node.left != prev) {
        if(func(node)) {
          return
        }
      }
      var temp = node;
      node = node.left != null && node.left != prev ? node.left : node.parent;
      prev = temp
    }
  }
  func(null)
};
ydn.db.Buffer.prototype.iter = function(opt_key_range, opt_reverse, opt_unique) {
  return new ydn.db.Buffer.Iterator(opt_key_range, opt_reverse, opt_unique)
};
ydn.db.Buffer.prototype.scan = function(func, iter) {
  var it = iter instanceof ydn.db.Buffer.Iterator ? iter : this.iter(iter);
  if(!this.root_) {
    func();
    return
  }
  var startNode;
  var skip_first_node = false;
  if(it.current_) {
    startNode = it.current_
  }else {
    if(it.key_range_) {
      var start_value;
      if(it.reverse_ && goog.isDefAndNotNull(it.key_range_.upper)) {
        start_value = it.key_range_.upper;
        skip_first_node = !!it.key_range_.upperOpen
      }else {
        if(goog.isDefAndNotNull(it.key_range_.lower)) {
          start_value = it.key_range_.lower;
          skip_first_node = !!it.key_range_.lowerOpen
        }
      }
      this.traverse_(goog.bind(function(node) {
        var retNode = null;
        if(this.comparator_(node.value, start_value) > 0) {
          retNode = node.left
        }else {
          if(this.comparator_(node.value, start_value) < 0) {
            retNode = node.right;
            startNode = node
          }else {
            startNode = node
          }
        }
        return retNode
      }, this))
    }else {
      if(!startNode) {
        startNode = this.getMaxNode_()
      }
    }
  }
  if(!startNode) {
    it.current_ = null;
    func();
    return
  }
  var node = startNode;
  var prev;
  if(it.reverse_) {
    prev = startNode.right ? startNode.right : startNode;
    while(node != null) {
      if(node.right != null && node.right != prev && node.left != prev) {
        node = node.right
      }else {
        if(node.left != prev) {
          it.current_ = node;
          if(skip_first_node) {
            skip_first_node = false;
            continue
          }
          if(func(node.value)) {
            return
          }
        }
        var temp = node;
        node = node.left != null && node.left != prev ? node.left : node.parent;
        prev = temp
      }
    }
    it.current_ = null;
    func()
  }else {
    prev = startNode.left ? startNode.left : startNode;
    while(node != null) {
      if(node.left != null && node.left != prev && node.right != prev) {
        node = node.left
      }else {
        if(node.right != prev) {
          it.current_ = node;
          if(skip_first_node) {
            skip_first_node = false;
            continue
          }
          if(func(node.value)) {
            return
          }
        }
        var temp = node;
        node = node.right != null && node.right != prev ? node.right : node.parent;
        prev = temp
      }
    }
  }
};
ydn.db.Buffer.Iterator = function(opt_key_range, opt_reverse, opt_unique) {
  this.key_range_ = opt_key_range || null;
  this.reverse_ = !!opt_reverse;
  this.unique_ = !!opt_unique;
  this.current_ = null
};
ydn.db.Buffer.Iterator.prototype.key_range_ = null;
ydn.db.Buffer.Iterator.prototype.reverse_ = false;
ydn.db.Buffer.Iterator.prototype.unique_ = false;
ydn.db.Buffer.Iterator.prototype.current_ = null;
goog.provide("ydn.db.con.simple.Node");
ydn.db.con.simple.Node = function(key, opt_primary_key) {
  this.key = (key);
  this.primary_key = opt_primary_key
};
ydn.db.con.simple.Node.prototype.key;
ydn.db.con.simple.Node.prototype.primary_key;
ydn.db.con.simple.Node.prototype.getKey = function() {
  return this.key
};
ydn.db.con.simple.Node.prototype.getPrimaryKey = function() {
  return this.primary_key
};
if(goog.DEBUG) {
  ydn.db.con.simple.Node.prototype.toString = function() {
    return"ydn.db.con.simple.Node:" + this.key + (goog.isDefAndNotNull(this.primary_key) ? ":" + this.primary_key : "")
  }
}
ydn.db.con.simple.Node.cmp = function(a, b) {
  var cmp = ydn.db.cmp(a.key, b.key);
  if(cmp === 0) {
    if(goog.isDefAndNotNull(a.primary_key)) {
      if(goog.isDefAndNotNull(b.primary_key)) {
        return ydn.db.cmp(a.primary_key, b.primary_key)
      }else {
        return 1
      }
    }else {
      if(goog.isDefAndNotNull(b.primary_key)) {
        return-1
      }else {
        return 0
      }
    }
  }else {
    return cmp
  }
};
goog.provide("ydn.db.con.simple.Store");
goog.require("ydn.db.Buffer");
goog.require("ydn.db.base");
goog.require("ydn.db.con.simple");
goog.require("ydn.db.con.simple.Node");
ydn.db.con.simple.Store = function(db_name, storage, store_schema) {
  this.db_name = db_name;
  this.storage = storage;
  this.schema = store_schema;
  this.key_indexes = {};
  var kp = this.schema.getKeyPath();
  this.primary_index = goog.isArray(kp) ? kp.join(",") : kp || ydn.db.base.SQLITE_SPECIAL_COLUNM_NAME;
  this.key_indexes[this.primary_index] = null;
  this.key_prefix = ydn.db.con.simple.makeKey(this.db_name, this.schema.getName(), this.primary_index) + ydn.db.con.simple.SEP
};
ydn.db.con.simple.Store.DEBUG = false;
ydn.db.con.simple.Store.prototype.storage;
ydn.db.con.simple.Store.prototype.db_name;
ydn.db.con.simple.Store.prototype.schema;
ydn.db.con.simple.Store.prototype.primary_index;
ydn.db.con.simple.Store.prototype.key_indexes;
ydn.db.con.simple.Store.prototype.makeKey = function(opt_id) {
  return this.key_prefix + ydn.db.utils.encodeKey(opt_id)
};
ydn.db.con.simple.Store.prototype.key_prefix;
ydn.db.con.simple.Store.prototype.extractKey = function(eKey) {
  var key = ydn.db.utils.decodeKey(eKey.substr(this.key_prefix.length));
  return(key)
};
ydn.db.con.simple.Store.prototype.generateKey = function() {
  var store_key = this.makeKey();
  var sch = ydn.json.parse(this.storage.getItem(store_key));
  if(!sch["key_count"]) {
    sch["key_count"] = 0
  }
  sch["key_count"]++;
  this.storage.setItem(store_key, ydn.json.stringify(sch));
  return sch["key_count"]
};
ydn.db.con.simple.Store.prototype.getIndexCache = function(opt_index_name) {
  var index_name = opt_index_name || this.primary_index;
  if(!this.key_indexes[index_name]) {
    this.key_indexes[index_name] = new ydn.db.Buffer(ydn.db.con.simple.Node.cmp);
    var n = this.storage.length;
    for(var i = 0;i < n;i++) {
      var key_str = this.storage.key(i);
      if(!goog.isNull(key_str)) {
        if(goog.string.startsWith(key_str, this.key_prefix)) {
          var key = this.extractKey(key_str);
          if(index_name == this.primary_index) {
            var node = new ydn.db.con.simple.Node(key);
            this.key_indexes[index_name].add(node)
          }else {
            var obj_str = this.storage.getItem(key_str);
            if(!goog.isNull(obj_str)) {
              var index = this.schema.getIndex(index_name);
              var obj = ydn.json.parse(obj_str);
              var index_key = (index.extractKey(obj));
              if(index.isMultiEntry()) {
                if(goog.isArray(index_key)) {
                  for(var k = 0;k < index_key.length;k++) {
                    var i_node = new ydn.db.con.simple.Node(index_key[k], key);
                    this.key_indexes[index_name].add(i_node)
                  }
                }
              }else {
                var index_node = new ydn.db.con.simple.Node(index_key, key);
                this.key_indexes[index_name].add(index_node)
              }
            }
          }
        }
      }
    }
    if(ydn.db.con.simple.Store.DEBUG) {
      window.console.log("index " + index_name + " of " + this.schema.getName() + " for " + this.key_indexes[index_name].getCount() + " records.")
    }
  }
  return this.key_indexes[index_name]
};
ydn.db.con.simple.Store.prototype.updateIndex = function(key, value) {
  for(var idx in this.key_indexes) {
    var cache = this.key_indexes[idx];
    if(cache) {
      if(ydn.db.con.simple.Store.DEBUG) {
        window.console.log("updating " + key + " in index " + idx + " of " + this.schema.getName())
      }
      if(idx == this.primary_index) {
        cache.add(new ydn.db.con.simple.Node(key))
      }else {
        var index = this.schema.getIndex(idx);
        var index_key = ydn.db.utils.getValueByKeys(value, index.getKeyPath());
        if(goog.isDefAndNotNull(index_key)) {
          var node = new ydn.db.con.simple.Node(key, index_key);
          cache.add(node)
        }
      }
    }
  }
};
ydn.db.con.simple.Store.prototype.removeIndex = function(key, value) {
  for(var idx in this.key_indexes) {
    var cache = this.key_indexes[idx];
    if(cache) {
      if(ydn.db.con.simple.Store.DEBUG) {
        window.console.log("removing " + key + " in index " + idx + " of " + this.schema.getName())
      }
      if(idx == this.primary_index) {
        cache.remove(new ydn.db.con.simple.Node(key))
      }else {
        var index = this.schema.getIndex(idx);
        var index_key = ydn.db.utils.getValueByKeys(value, index.getKeyPath());
        var node = new ydn.db.con.simple.Node(key, index_key);
        cache.remove(node)
      }
    }
  }
};
ydn.db.con.simple.Store.prototype.clearIndexCache = function() {
  for(var idx in this.key_indexes) {
    var cache = this.key_indexes[idx];
    if(cache) {
      cache.clear();
      if(ydn.db.con.simple.Store.DEBUG) {
        window.console.log("index " + idx + " of " + this.schema.getName() + " cleared.")
      }
    }
  }
  this.key_indexes = {}
};
ydn.db.con.simple.Store.prototype.addRecord = function(key, value, opt_is_add) {
  if(!goog.isDefAndNotNull(key)) {
    if(this.schema.usedInlineKey()) {
      key = this.schema.extractKey(value)
    }
    if(this.schema.getAutoIncrement() && !goog.isDefAndNotNull(key)) {
      key = this.generateKey()
    }
  }
  goog.asserts.assert(goog.isDefAndNotNull(key), this + "primary key not provided in " + ydn.json.toShortString(value));
  if(ydn.db.con.simple.Store.DEBUG) {
    window.console.log("add " + key)
  }
  if(opt_is_add) {
    if(this.key_indexes[this.primary_index]) {
      var cache = this.key_indexes[this.primary_index];
      if(cache.contains(ydn.db.utils.encodeKey(key))) {
        return null
      }
    }else {
      if(!goog.isNull(this.storage.getItem(this.makeKey(key)))) {
        return null
      }
    }
  }
  this.storage.setItem(this.makeKey(key), ydn.json.stringify(value));
  this.updateIndex(key, value);
  return key
};
ydn.db.con.simple.Store.prototype.removeRecord = function(key) {
  var eKey = this.makeKey(key);
  var obj = this.storage.getItem(eKey);
  if(goog.isNull(obj)) {
    return 0
  }else {
    this.storage.removeItem(eKey);
    var value = ydn.json.parse(obj);
    this.removeIndex(key, value);
    return 1
  }
};
ydn.db.con.simple.Store.prototype.clear = function() {
  this.clearIndexCache();
  this.removeRecords()
};
ydn.db.con.simple.Store.prototype.getRecord = function(index_name, key) {
  if(!index_name || index_name == this.primary_index) {
    var v_str = this.storage.getItem(this.makeKey(key));
    var v = undefined;
    if(!goog.isNull(v_str)) {
      v = (ydn.json.parse(v_str));
      for(var i = 0, n = this.schema.countIndex();i < n;i++) {
        var index = this.schema.index(i);
        if(index.getType() == ydn.db.schema.DataType.DATE) {
          var d_str = index.extractKey(v);
          if(d_str) {
            var d = new Date(d_str);
            index.applyValue(v, d)
          }
        }
      }
    }
    return v
  }else {
    goog.asserts.assert(this.schema.hasIndex(index_name), 'index "' + index_name + '" not found in ' + this);
    throw"impl";
  }
};
ydn.db.con.simple.Store.prototype.getName = function() {
  return this.schema.getName()
};
ydn.db.con.simple.Store.prototype.countRecords = function(opt_index_name, opt_key_range) {
  opt_index_name = opt_index_name || this.primary_index;
  var me = this;
  var cache = this.getIndexCache(opt_index_name);
  var start = null;
  var end = null;
  var count = 0;
  var lowerOpen = false;
  var upperOpen = false;
  if(goog.isDefAndNotNull(opt_key_range)) {
    if(goog.isDefAndNotNull(opt_key_range.lower)) {
      start = new ydn.db.con.simple.Node((opt_key_range.lower))
    }
    if(goog.isDefAndNotNull(opt_key_range.upper)) {
      end = new ydn.db.con.simple.Node((opt_key_range.upper))
    }
    lowerOpen = opt_key_range.lowerOpen;
    upperOpen = opt_key_range.upperOpen
  }
  var tr_fn = function(node) {
    if(!goog.isDefAndNotNull(node)) {
      return
    }
    var x = (node.value);
    if(lowerOpen && goog.isDefAndNotNull(start) && ydn.db.cmp(x.getKey(), start.getKey()) == 0) {
      return
    }
    if(goog.isDefAndNotNull(end)) {
      var cmp = ydn.db.cmp(x.getKey(), end.getKey());
      if(cmp === 1) {
        return true
      }
      if(cmp === 0 && upperOpen) {
        return true
      }
    }
    count++
  };
  cache.traverse(tr_fn, start);
  return count
};
ydn.db.con.simple.Store.prototype.removeRecords = function(opt_key_range) {
  var me = this;
  var cache = this.getIndexCache(this.primary_index);
  var start = null;
  var end = null;
  var count = 0;
  var removed_ids = [];
  var removed_objs = [];
  var lowerOpen = false;
  var upperOpen = false;
  if(goog.isDefAndNotNull(opt_key_range)) {
    if(goog.isDefAndNotNull(opt_key_range.lower)) {
      start = new ydn.db.con.simple.Node((opt_key_range.lower))
    }
    if(goog.isDefAndNotNull(opt_key_range.upper)) {
      end = new ydn.db.con.simple.Node((opt_key_range.upper))
    }
    lowerOpen = opt_key_range.lowerOpen;
    upperOpen = opt_key_range.upperOpen
  }
  var tr_fn = function(node) {
    if(!goog.isDefAndNotNull(node)) {
      return
    }
    var x = (node.value);
    if(lowerOpen && goog.isDefAndNotNull(start) && ydn.db.con.simple.Node.cmp(x, start) == 0) {
      return
    }
    if(goog.isDefAndNotNull(end)) {
      var cmp = ydn.db.con.simple.Node.cmp(x, end);
      if(cmp === 1) {
        return true
      }
      if(cmp === 0 && upperOpen) {
        return true
      }
    }
    var key = me.makeKey(x.getKey());
    var obj = me.storage.getItem(key);
    if(!goog.isNull(obj)) {
      me.storage.removeItem(key);
      count++;
      if(ydn.db.con.simple.Store.DEBUG) {
        window.console.log(count + ". remove " + x.getKey() + " " + key)
      }
      if(removed_ids.length < 10) {
        removed_ids.push(x.getKey());
        removed_objs.push(ydn.json.parse(obj))
      }
    }
  };
  cache.traverse(tr_fn, start);
  if(removed_ids.length < 10) {
    for(var i = 0;i < removed_ids.length;i++) {
      this.removeIndex(removed_ids[i], removed_objs[i])
    }
  }else {
    this.clearIndexCache()
  }
  return count
};
ydn.db.con.simple.Store.prototype.getItems = function(is_key_cursor, is_value_query, opt_index_name, opt_key_range, opt_reverse, opt_limit, opt_offset, opt_unique) {
  var results = [];
  var prev_key;
  opt_index_name = opt_index_name || this.primary_index;
  var is_index = opt_index_name != this.primary_index;
  var cache = this.getIndexCache(opt_index_name);
  var start = null;
  var end = null;
  if(!goog.isDef(opt_offset)) {
    opt_offset = 0
  }
  var offsetted = -1;
  var lowerOpen = false;
  var upperOpen = false;
  if(goog.isDefAndNotNull(opt_key_range)) {
    if(goog.isDefAndNotNull(opt_key_range.lower)) {
      if(is_index && opt_reverse) {
        start = new ydn.db.con.simple.Node((opt_key_range.lower), "\uffff")
      }else {
        start = new ydn.db.con.simple.Node((opt_key_range.lower))
      }
    }
    if(goog.isDefAndNotNull(opt_key_range.upper)) {
      if(is_index && !opt_reverse) {
        end = new ydn.db.con.simple.Node((opt_key_range.upper), "\uffff")
      }else {
        end = new ydn.db.con.simple.Node((opt_key_range.upper))
      }
    }
    lowerOpen = opt_key_range.lowerOpen;
    upperOpen = opt_key_range.upperOpen
  }
  var me = this;
  var tr_fn = function(node) {
    if(!node) {
      return
    }
    offsetted++;
    if(offsetted < opt_offset) {
      return
    }
    var x = (node.value);
    if(opt_reverse) {
      if(upperOpen && goog.isDefAndNotNull(end) && ydn.db.cmp(x.getKey(), end.getKey()) == 0) {
        return
      }
      if(goog.isDefAndNotNull(start)) {
        var cmp = ydn.db.cmp(x.getKey(), start.getKey());
        if(cmp === -1) {
          return true
        }
        if(cmp === 0 && lowerOpen) {
          return true
        }
      }
    }else {
      if(lowerOpen && goog.isDefAndNotNull(start) && ydn.db.cmp(x.getKey(), start.getKey()) == 0) {
        return
      }
      if(goog.isDefAndNotNull(end)) {
        var cmp = ydn.db.cmp(x.getKey(), end.getKey());
        if(cmp === 1) {
          return true
        }
        if(cmp === 0 && upperOpen) {
          return true
        }
      }
    }
    var key = x.getKey();
    if(!opt_unique || goog.isDefAndNotNull(prev_key) && ydn.db.cmp(prev_key, key)) {
      var primary_key = (is_index ? x.getPrimaryKey() : key);
      var push_value = function() {
        var v = me.getRecord(null, primary_key);
        results.push(v)
      };
      if(is_value_query) {
        if(is_index) {
          if(is_key_cursor) {
            results.push(primary_key)
          }else {
            push_value()
          }
        }else {
          if(is_key_cursor) {
            results.push(primary_key)
          }else {
            push_value()
          }
        }
      }else {
        results.push(key)
      }
    }
    prev_key = key;
    if(goog.isDef(opt_limit) && results.length >= opt_limit) {
      return true
    }
  };
  if(opt_reverse) {
    cache.reverseTraverse(tr_fn, end)
  }else {
    cache.traverse(tr_fn, start)
  }
  return results
};
ydn.db.con.simple.Store.prototype.getRecords = function(opt_index_name, opt_key_range, opt_reverse, opt_limit, opt_offset) {
  return this.getItems(false, true, opt_index_name, opt_key_range, opt_reverse, opt_limit, opt_offset)
};
ydn.db.con.simple.Store.prototype.getKeys = function(opt_index_name, opt_key_range, opt_reverse, opt_limit, opt_offset) {
  return this.getItems(true, true, opt_index_name, opt_key_range, opt_reverse, opt_limit, opt_offset)
};
if(goog.DEBUG) {
  ydn.db.con.simple.Store.prototype.toString = function() {
    return"ydn.db.con.simple.Store:" + this.db_name + ":" + this.schema.getName()
  }
}
;goog.provide("ydn.db.con.simple.TxStorage");
goog.require("goog.Timer");
ydn.db.con.simple.TxStorage = function(storage, oncompleted) {
  this.storage_ = storage;
  this.on_completed_ = oncompleted
};
ydn.db.con.simple.TxStorage.prototype.storage_;
ydn.db.con.simple.TxStorage.prototype.on_completed_;
ydn.db.con.simple.TxStorage.prototype.getStorage = function(fnc, fnc_obj) {
  goog.Timer.callOnce(function() {
    fnc.call(fnc_obj, this.storage_)
  }, 0, this);
  var me = this;
  var on_complete = function() {
    me.on_completed_(ydn.db.base.TxEventTypes.COMPLETE, null);
    me.on_completed_ = null;
    me.storage_ = null
  };
  return on_complete
};
goog.provide("ydn.db.con.simple.IStorageProvider");
ydn.db.con.simple.IStorageProvider = function() {
};
ydn.db.con.simple.IStorageProvider.prototype.connectDb = function(db_name) {
};
goog.provide("ydn.db.req.InMemoryStorage");
goog.require("ydn.db.con.simple.IStorageProvider");
ydn.db.req.InMemoryStorage = function() {
  this.clear()
};
ydn.db.req.InMemoryStorage.prototype.connectDb = function(name) {
  return this
};
ydn.db.req.InMemoryStorage.prototype.setItem = function(key, value) {
  if(!goog.isDef(this.memoryStorage[key])) {
    this.keys.push(key.toString());
    this.length = this.keys.length
  }
  this.memoryStorage[key] = value
};
ydn.db.req.InMemoryStorage.prototype.getItem = function(key) {
  if(!goog.isDef(this.memoryStorage[key])) {
    return null
  }else {
    return this.memoryStorage[key]
  }
};
ydn.db.req.InMemoryStorage.prototype.removeItem = function(key) {
  delete this.memoryStorage[key];
  goog.array.remove(this.keys, key.toString());
  this.length = this.keys.length
};
ydn.db.req.InMemoryStorage.prototype.length = 0;
ydn.db.req.InMemoryStorage.prototype.key = function(i) {
  var key = this.keys[i];
  return goog.isDef(key) ? this.memoryStorage[key] : null
};
ydn.db.req.InMemoryStorage.prototype.clear = function() {
  this.memoryStorage = {};
  this.keys = [];
  this.length = 0
};
goog.provide("ydn.db.con.SimpleStorage");
goog.require("goog.Timer");
goog.require("goog.asserts");
goog.require("goog.async.Deferred");
goog.require("ydn.db.Key");
goog.require("ydn.db.VersionError");
goog.require("ydn.db.con.IDatabase");
goog.require("ydn.db.con.simple");
goog.require("ydn.db.con.simple.Store");
goog.require("ydn.db.con.simple.TxStorage");
goog.require("ydn.db.req.InMemoryStorage");
goog.require("ydn.debug.error.InternalError");
goog.require("ydn.db.con.simple.IStorageProvider");
ydn.db.con.SimpleStorage = function(opt_provider) {
  this.provider_ = opt_provider || new ydn.db.req.InMemoryStorage;
  this.version_ = NaN
};
ydn.db.con.SimpleStorage.prototype.logger = goog.debug.Logger.getLogger("ydn.db.con.SimpleStorage");
ydn.db.con.SimpleStorage.prototype.provider_;
ydn.db.con.SimpleStorage.prototype.storage_;
ydn.db.con.SimpleStorage.prototype.schema;
ydn.db.con.SimpleStorage.prototype.dbname;
ydn.db.con.SimpleStorage.prototype.version_;
ydn.db.con.SimpleStorage.isSupported = function() {
  return true
};
ydn.db.con.SimpleStorage.DEBUG = false;
ydn.db.con.SimpleStorage.prototype.version_;
ydn.db.con.SimpleStorage.prototype.getVersion = function() {
  return this.version_
};
ydn.db.con.SimpleStorage.prototype.connect = function(dbname, schema) {
  var me = this;
  var df = new goog.async.Deferred;
  var callDf = function(x, opt_err) {
    goog.Timer.callOnce(function() {
      if(opt_err) {
        me.logger.finer(me + " opening fail");
        df.errback(opt_err)
      }else {
        me.logger.finer(me + " version " + me.getVersion() + " open");
        df.callback(x)
      }
    })
  };
  this.storage_ = this.provider_.connectDb(dbname);
  this.dbname = dbname;
  this.schema = schema;
  this.simple_stores_ = {};
  var db_key = ydn.db.con.simple.makeKey(this.dbname);
  this.version_ = NaN;
  var ex_schema_json = (ydn.json.parse(this.storage_.getItem(db_key)));
  if(goog.isDef(ex_schema_json.version) && !goog.isNumber(ex_schema_json.version)) {
    ex_schema_json.version = NaN
  }
  if(ex_schema_json) {
    var ex_schema = new ydn.db.schema.Database(ex_schema_json);
    var diff_msg = this.schema.difference(ex_schema);
    if(diff_msg) {
      if(!this.schema.isAutoVersion() && !isNaN(ex_schema.getVersion()) && this.schema.getVersion() > ex_schema.getVersion()) {
        var msg = goog.DEBUG ? "existing version " + ex_schema.getVersion() + " is larger than " + this.schema.getVersion() : "";
        callDf(NaN, new ydn.db.VersionError(msg))
      }else {
        var v = this.schema.getVersion();
        this.version_ = goog.isDef(v) ? v : ex_schema.getVersion() + 1;
        for(var i = 0;i < this.schema.count();i++) {
          var store = this.schema.store(i)
        }
        if(this.schema instanceof ydn.db.schema.EditableDatabase) {
          for(var i = 0;i < ex_schema.count();i++) {
            var store = ex_schema.store(i);
            goog.asserts.assert(!goog.isNull(store));
            this.schema.addStore(store)
          }
        }
        var schema_json = this.schema.toJSON();
        schema_json.version = this.version_ || NaN;
        this.storage_.setItem(db_key, ydn.json.stringify(schema_json));
        callDf(ex_schema.getVersion() || NaN)
      }
    }else {
      for(var i = 0;i < this.schema.count();i++) {
        var store = this.schema.store(i)
      }
      this.version_ = ex_schema.getVersion() || NaN;
      callDf(this.version_)
    }
  }else {
    var json = schema.toJSON();
    this.version_ = 1;
    var old_version = NaN;
    json.version = this.version_;
    this.storage_.setItem(db_key, ydn.json.stringify(json));
    callDf(old_version)
  }
  return df
};
ydn.db.con.SimpleStorage.prototype.simple_stores_;
ydn.db.con.SimpleStorage.prototype.isReady = function() {
  return!!this.dbname
};
ydn.db.con.SimpleStorage.prototype.getDbInstance = function() {
  return this.storage_ || null
};
ydn.db.con.SimpleStorage.DEFAULT_KEY_PATH = "_id_";
ydn.db.con.SimpleStorage.prototype.getType = function() {
  return"memory"
};
ydn.db.con.SimpleStorage.prototype.close = function() {
};
ydn.db.con.SimpleStorage.prototype.getTxStorage = function(tx_fn) {
  tx_fn(this.storage_);
  var on_complete = function() {
  };
  return on_complete
};
ydn.db.con.SimpleStorage.prototype.doTransaction = function(trFn, scopes, mode, oncompleted) {
  var tx = new ydn.db.con.simple.TxStorage(this, function(t, e) {
    oncompleted(t, e)
  });
  trFn(tx)
};
ydn.db.con.SimpleStorage.prototype.getSchema = function(callback) {
  goog.Timer.callOnce(function() {
    var db_key = ydn.db.con.simple.makeKey(this.dbname);
    var db_value = this.storage_.getItem(db_key);
    var schema = new ydn.db.schema.Database(db_value);
    callback(schema)
  }, 0, this)
};
ydn.db.con.SimpleStorage.prototype.getSimpleStore = function(store_name) {
  var store = this.schema.getStore(store_name);
  if(store) {
    if(!this.simple_stores_[store_name]) {
      this.simple_stores_[store_name] = new ydn.db.con.simple.Store(this.dbname, this.storage_, store)
    }
  }else {
    throw new ydn.debug.error.InternalError('store name "' + store_name + '" not found.');
  }
  return this.simple_stores_[store_name]
};
if(goog.DEBUG) {
  ydn.db.con.SimpleStorage.prototype.toString = function() {
    var s = this.dbname + ":" + this.version_;
    return"SimpleStorage:" + this.getType() + ":" + s
  }
}
;goog.provide("ydn.db.con.LocalStorage");
goog.provide("ydn.db.con.SessionStorage");
goog.require("ydn.db.con.SimpleStorage");
ydn.db.con.LocalStorage = function() {
  goog.base(this, this)
};
goog.inherits(ydn.db.con.LocalStorage, ydn.db.con.SimpleStorage);
ydn.db.con.LocalStorage.prototype.connectDb = function(name) {
  goog.asserts.assertObject(window.localStorage);
  return window.localStorage
};
ydn.db.con.LocalStorage.isSupported = function() {
  return!!window.localStorage
};
ydn.db.con.LocalStorage.prototype.getType = function() {
  return ydn.db.base.Mechanisms.LOCAL_STORAGE
};
ydn.db.con.LocalStorage.deleteDatabase = function(db_name) {
  var db = new ydn.db.con.LocalStorage;
  var schema = new ydn.db.schema.EditableDatabase;
  db.connect(db_name, schema);
  db.getSchema(function(sch) {
    for(var i = 0;i < sch.stores.length;i++) {
      var store = db.getSimpleStore(sch.stores[i].name);
      store.clear()
    }
  })
};
ydn.db.con.SessionStorage = function() {
  goog.base(this, this)
};
goog.inherits(ydn.db.con.SessionStorage, ydn.db.con.SimpleStorage);
ydn.db.con.SessionStorage.prototype.connectDb = function(name) {
  goog.asserts.assertObject(window.sessionStorage);
  return window.sessionStorage
};
ydn.db.con.SessionStorage.isSupported = function() {
  return!!window.sessionStorage
};
ydn.db.con.SessionStorage.prototype.getType = function() {
  return ydn.db.base.Mechanisms.SESSION_STORAGE
};
ydn.db.con.SessionStorage.deleteDatabase = function(db_name) {
  var db = new ydn.db.con.SessionStorage;
  var schema = new ydn.db.schema.EditableDatabase;
  db.connect(db_name, schema);
  db.getSchema(function(sch) {
    for(var i = 0;i < sch.stores.length;i++) {
      var store = db.getSimpleStore(sch.stores[i].name);
      store.clear()
    }
  })
};
goog.provide("ydn.db");
goog.require("ydn.db.utils");
if(!ydn.db.base.NO_IDB) {
  goog.require("ydn.db.con.IndexedDb")
}
if(!ydn.db.base.NO_WEBSQL) {
  goog.require("ydn.db.con.WebSql")
}
if(!ydn.db.base.NO_SIMPLE) {
  goog.require("ydn.db.con.LocalStorage");
  goog.require("ydn.db.con.SessionStorage")
}
ydn.db.version = "0";
ydn.db.deleteDatabase = function(db_name, opt_type) {
  if(!ydn.db.base.NO_IDB && ydn.db.con.IndexedDb.isSupported() && (!opt_type || opt_type == ydn.db.base.Mechanisms.IDB) && ydn.db.con.IndexedDb.indexedDb && "deleteDatabase" in ydn.db.con.IndexedDb.indexedDb) {
    ydn.db.con.IndexedDb.indexedDb.deleteDatabase(db_name)
  }
  if(!ydn.db.base.NO_WEBSQL && ydn.db.con.WebSql.isSupported() && (!opt_type || opt_type == ydn.db.base.Mechanisms.WEBSQL)) {
    ydn.db.con.WebSql.deleteDatabase(db_name)
  }
  if(!ydn.db.base.NO_SIMPLE && (!opt_type || opt_type == ydn.db.base.Mechanisms.LOCAL_STORAGE)) {
    ydn.db.con.LocalStorage.deleteDatabase(db_name)
  }
  if(!ydn.db.base.NO_SIMPLE && (!opt_type || opt_type == ydn.db.base.Mechanisms.SESSION_STORAGE)) {
    ydn.db.con.SessionStorage.deleteDatabase(db_name)
  }
};
ydn.db.cmp = !ydn.db.base.NO_IDB && ydn.db.con.IndexedDb.indexedDb && ydn.db.con.IndexedDb.indexedDb.cmp ? goog.bind(ydn.db.con.IndexedDb.indexedDb.cmp, ydn.db.con.IndexedDb.indexedDb) : ydn.db.utils.cmp;
goog.provide("ydn.db.core.req.ICursor");
goog.require("goog.disposable.IDisposable");
ydn.db.core.req.ICursor = function() {
};
ydn.db.core.req.ICursor.prototype.onError = goog.abstractMethod;
ydn.db.core.req.ICursor.prototype.onSuccess = goog.abstractMethod;
ydn.db.core.req.ICursor.prototype.openCursor = function(opt_ini_key, opt_ini_primary_key) {
};
ydn.db.core.req.ICursor.prototype.continuePrimaryKey = function(primary_key) {
};
ydn.db.core.req.ICursor.prototype.continueEffectiveKey = function(opt_effective_key) {
};
ydn.db.core.req.ICursor.prototype.advance = function(number_of_step) {
};
ydn.db.core.req.ICursor.prototype.restart = function(effective_key, primary_key) {
};
ydn.db.core.req.ICursor.prototype.hasCursor = function() {
};
ydn.db.core.req.ICursor.prototype.update = function(obj) {
};
ydn.db.core.req.ICursor.prototype.clear = function() {
};
ydn.db.core.req.ICursor.prototype.isIndexCursor = function() {
};
ydn.db.core.req.ICursor.prototype.isPrimaryCursor = function() {
};
ydn.db.core.req.ICursor.prototype.isValueCursor = function() {
};
goog.provide("ydn.db.Cursor");
goog.require("goog.debug.Logger");
goog.require("ydn.db");
goog.require("ydn.db.core.req.ICursor");
goog.require("ydn.debug.error.InternalError");
ydn.db.Cursor = function(cursors, opt_pre_cursor, opt_key, opt_primary_key) {
  this.cursors_ = cursors;
  this.keys_ = [];
  this.primary_keys_ = [];
  this.values_ = [];
  this.count_ = 0;
  this.done_ = false;
  this.exited_ = false;
  if(opt_pre_cursor) {
    this.keys_ = goog.array.clone(opt_pre_cursor.keys_);
    this.primary_keys_ = goog.array.clone(opt_pre_cursor.primary_keys_)
  }
  if(goog.isDefAndNotNull(opt_key)) {
    this.keys_[0] = opt_key
  }
  if(goog.isDefAndNotNull(opt_primary_key)) {
    this.primary_keys_[0] = opt_primary_key
  }
  this.onNext = function(opt_key) {
    throw new ydn.debug.error.InternalError;
  };
  this.onFail = function(e) {
    throw new ydn.debug.error.InternalError;
  };
  if(this.cursors_.length > 0) {
    this.init_()
  }
};
ydn.db.Cursor.DEBUG = false;
ydn.db.Cursor.prototype.cursors_;
ydn.db.Cursor.prototype.keys_;
ydn.db.Cursor.prototype.primary_keys_;
ydn.db.Cursor.prototype.values_;
ydn.db.Cursor.prototype.count_ = 0;
ydn.db.Cursor.prototype.done_ = false;
ydn.db.Cursor.prototype.exited_ = false;
ydn.db.Cursor.prototype.logger = goog.debug.Logger.getLogger("ydn.db.Cursor");
ydn.db.Cursor.prototype.openSingle_ = function(cursor) {
  var me = this;
  var i = 0;
  cursor.onSuccess = function(opt_key, opt_p_key, opt_value) {
    if(!goog.isDefAndNotNull(opt_key)) {
      me.logger.finest("cursor " + cursor + " finished.");
      me.done_ = true
    }
    me.keys_[i] = opt_key;
    me.primary_keys_[i] = opt_p_key;
    me.values_[i] = opt_value;
    me.count_++;
    if(me.done_) {
      me.logger.finest(me + " DONE.");
      me.onNext();
      me.finalize_()
    }else {
      var key_str = goog.isDefAndNotNull(me.primary_keys_[0]) ? me.keys_[0] + ", " + me.primary_keys_[0] : me.keys_[0];
      me.logger.finest(me + " new cursor position {" + key_str + "}");
      me.onNext(me.keys_[0])
    }
  };
  cursor.onError = function(e) {
    me.onFail(e);
    me.finalize_();
    me.done_ = true
  };
  var pk_str = goog.isDefAndNotNull(me.primary_keys_[i]) ? ", " + me.primary_keys_[i] : "";
  pk_str = goog.isDefAndNotNull(me.keys_[i]) ? " resume from {" + me.keys_[i] + pk_str + "}" : "";
  me.logger.finest(cursor + pk_str + " opening");
  cursor.openCursor(me.keys_[i], me.primary_keys_[i])
};
ydn.db.Cursor.prototype.openPrimaryKeyMerge_ = function() {
  var total = this.cursors_.length;
  var result_count = 0;
  var primary_keys = [];
  var me = this;
  var listenCursor = function(i_cursor) {
    var cursor = me.cursors_[i_cursor];
    cursor.onSuccess = function(opt_key, opt_p_key, opt_value) {
      result_count++;
      if(ydn.db.Cursor.DEBUG) {
        window.console.log(me + ' receiving result "' + opt_key + '" from ' + i_cursor + " of " + result_count + "/" + total + " " + cursor)
      }
      if(!goog.isDefAndNotNull(opt_key)) {
        me.logger.finest("cursor " + cursor + " finished.");
        me.done_ = true
      }
      me.keys_[i_cursor] = opt_key;
      me.primary_keys_[i_cursor] = opt_p_key;
      me.values_[i_cursor] = opt_value;
      if(cursor.isPrimaryCursor()) {
        primary_keys[i_cursor] = opt_key
      }else {
        primary_keys[i_cursor] = opt_p_key
      }
      if(result_count == total) {
        result_count = 0;
        if(me.done_) {
          me.count_++;
          me.logger.finest(me + " DONE.");
          me.onNext();
          me.finalize_()
        }else {
          var max_key = primary_keys.reduce(function(p, c) {
            if(goog.isNull(p)) {
              return c
            }else {
              return ydn.db.cmp(c, p) == 1 ? c : p
            }
          }, null);
          if(ydn.db.cmp(max_key, primary_keys[0]) == 0) {
            var key_str = goog.isDefAndNotNull(me.primary_keys_[0]) ? me.keys_[0] + ", " + me.primary_keys_[0] : me.keys_[0];
            me.logger.finest(me + " new cursor position {" + key_str + "}");
            me.onNext(me.keys_[0])
          }else {
            for(var i = 0;i < total;i++) {
              if(ydn.db.cmp(primary_keys[i], max_key) == -1) {
                var cur = me.cursors_[i];
                if(cur.isPrimaryCursor()) {
                  cur.continueEffectiveKey(max_key)
                }else {
                  cur.continuePrimaryKey(max_key)
                }
              }else {
                result_count++
              }
            }
          }
        }
        goog.array.clear(primary_keys)
      }
    };
    cursor.onError = function(e) {
      me.onFail(e);
      me.finalize_();
      me.done_ = true;
      result_count = 0
    };
    var pk_str = goog.isDefAndNotNull(me.primary_keys_[i_cursor]) ? ", " + me.primary_keys_[i_cursor] : "";
    pk_str = goog.isDefAndNotNull(me.keys_[i_cursor]) ? " resume from {" + me.keys_[i_cursor] + pk_str + "}" : "";
    me.logger.finest(cursor + pk_str + " opening");
    cursor.openCursor(me.keys_[i_cursor], me.primary_keys_[i_cursor])
  };
  for(var i = 0;i < total;i++) {
    listenCursor(i)
  }
};
ydn.db.Cursor.prototype.openSecondaryKeyMerge_ = function() {
  var total = this.cursors_.length;
  var result_count = 0;
  var keys = [];
  var primary_keys = [];
  var me = this;
  var listenCursor = function(i_cursor) {
    var cursor = me.cursors_[i_cursor];
    cursor.onSuccess = function(opt_key, opt_p_key, opt_value) {
      result_count++;
      if(ydn.db.Cursor.DEBUG) {
        window.console.log(me + ' receiving result "' + opt_key + '" from ' + i_cursor + "/" + total + " " + cursor)
      }
      if(!goog.isDefAndNotNull(opt_key)) {
        me.logger.finest("cursor " + cursor + " finished.");
        me.done_ = true
      }
      me.keys_[i_cursor] = opt_key;
      me.primary_keys_[i_cursor] = opt_p_key;
      me.values_[i_cursor] = opt_value;
      if(cursor.isPrimaryCursor()) {
        primary_keys[i_cursor] = opt_key
      }else {
        primary_keys[i_cursor] = opt_p_key
      }
      if(result_count == total) {
        if(me.done_) {
          me.count_++;
          me.logger.finest(me + " DONE.");
          me.onNext();
          me.finalize_()
        }else {
          var max_key = primary_keys.reduce(function(p, c) {
            if(goog.isNull(p)) {
              return c
            }else {
              return ydn.db.cmp(c, p) == 1 ? c : p
            }
          }, null);
          if(ydn.db.cmp(max_key, primary_keys[0]) == 0) {
            var key_str = goog.isDefAndNotNull(me.primary_keys_[0]) ? me.keys_[0] + ", " + me.primary_keys_[0] : me.keys_[0];
            me.logger.finest(me + " new cursor position {" + key_str + "}");
            me.onNext(me.keys_[0])
          }else {
            for(var i = 0;i < total;i++) {
              if(ydn.db.cmp(primary_keys[i], max_key) == -1) {
                var cur = me.cursors_[i];
                if(cur.isPrimaryCursor()) {
                  cur.continueEffectiveKey(max_key)
                }else {
                  cur.continuePrimaryKey(max_key)
                }
              }
            }
          }
        }
        result_count = 0;
        goog.array.clear(primary_keys)
      }
    };
    cursor.onError = function(e) {
      me.onFail(e);
      me.finalize_();
      me.done_ = true;
      result_count = 0
    };
    var pk_str = goog.isDefAndNotNull(me.primary_keys_[i_cursor]) ? ", " + me.primary_keys_[i_cursor] : "";
    pk_str = goog.isDefAndNotNull(me.keys_[i_cursor]) ? " resume from {" + me.keys_[i_cursor] + pk_str + "}" : "";
    me.logger.finest(cursor + pk_str + " opening");
    cursor.openCursor(me.keys_[i_cursor], me.primary_keys_[i_cursor])
  };
  for(var i = 0;i < total;i++) {
    listenCursor(i)
  }
};
ydn.db.Cursor.prototype.init_ = function() {
  var n = this.cursors_.length;
  if(ydn.db.Cursor.DEBUG) {
    this.logger.finest("Initializing " + n + " cursors")
  }
  if(n == 1) {
    this.openSingle_(this.cursors_[0])
  }else {
    if(n > 1) {
      this.openPrimaryKeyMerge_()
    }else {
      throw new ydn.debug.error.InternalError("no cursors");
    }
  }
};
ydn.db.Cursor.prototype.getCount = function() {
  return this.count_
};
ydn.db.Cursor.prototype.getKey = function(opt_idx) {
  var index = opt_idx || 0;
  return this.keys_[index]
};
ydn.db.Cursor.prototype.getPrimaryKey = function(opt_idx) {
  var index = opt_idx || 0;
  return this.cursors_[index].isIndexCursor() ? this.primary_keys_[index] : this.keys_[index]
};
ydn.db.Cursor.prototype.getValue = function(opt_idx) {
  var index = opt_idx || 0;
  return this.cursors_[index].isValueCursor() ? this.values_[index] : this.getPrimaryKey(index)
};
ydn.db.Cursor.prototype.restart = function(opt_key, opt_primary_key) {
  this.done_ = false;
  this.cursors_[0].restart(opt_primary_key, opt_key)
};
ydn.db.Cursor.prototype.continuePrimaryKey = function(key) {
  this.cursors_[0].continuePrimaryKey(key)
};
ydn.db.Cursor.prototype.continueEffectiveKey = function(opt_key) {
  this.cursors_[0].continueEffectiveKey(opt_key)
};
ydn.db.Cursor.prototype.advance = function(n) {
  for(var i = 0;i < this.cursors_.length;i++) {
    this.cursors_[i].advance(n)
  }
};
ydn.db.Cursor.prototype.update = function(obj, opt_idx) {
  var index = opt_idx || 0;
  return this.cursors_[index].update(obj)
};
ydn.db.Cursor.prototype.clear = function(opt_idx) {
  var index = opt_idx || 0;
  return this.cursors_[index].clear()
};
ydn.db.Cursor.prototype.hasDone = function() {
  return this.done_
};
ydn.db.Cursor.prototype.isExited = function() {
  return this.exited_
};
ydn.db.Cursor.prototype.exit = function() {
  this.exited_ = true;
  this.logger.finest(this + ": exit");
  this.finalize_();
  this.dispose_()
};
ydn.db.Cursor.prototype.finalize_ = function() {
  this.primary_keys_ = goog.array.map(this.primary_keys_, function(x) {
    if(goog.isDefAndNotNull(x)) {
      return ydn.db.Key.clone(x)
    }else {
      return undefined
    }
  });
  this.keys_ = goog.array.map(this.keys_, function(x) {
    if(goog.isDefAndNotNull(x)) {
      return ydn.db.Key.clone(x)
    }else {
      return undefined
    }
  })
};
ydn.db.Cursor.prototype.dispose_ = function() {
  for(var i = 0;i < this.cursors_.length;i++) {
    this.cursors_[i].dispose()
  }
  this.logger.finest(this + " disposed");
  goog.array.clear(this.values_);
  goog.array.clear(this.cursors_)
};
if(goog.DEBUG) {
  ydn.db.Cursor.prototype.toString = function() {
    var s = "[";
    for(var i = 0;i < this.keys_.length;i++) {
      if(i > 0) {
        s += " "
      }
      if(this.cursors_[i]) {
        s += this.cursors_[i].toString()
      }else {
        s += "cursor~{" + this.keys_[i];
        if(goog.isDefAndNotNull(this.primary_keys_[i])) {
          s += ";" + this.primary_keys_[i] + "}"
        }else {
          s += "}"
        }
      }
    }
    s += "]";
    return"Cursor " + s
  }
}
;goog.provide("ydn.db.Where");
goog.require("goog.string");
goog.require("ydn.db.KeyRange");
goog.require("ydn.db.utils");
goog.require("ydn.debug.error.ArgumentException");
ydn.db.Where = function(field, op, opt_value, opt_op2, opt_value2) {
  this.key_range_ = op instanceof ydn.db.KeyRange ? op : goog.isString(op) && goog.isDef(opt_value) ? ydn.db.KeyRange.where(op, opt_value, opt_op2, opt_value2) : ydn.db.KeyRange.parseKeyRange((op));
  this.field = field
};
ydn.db.Where.prototype.field = "";
ydn.db.Where.prototype.key_range_;
ydn.db.Where.prototype.getField = function() {
  return this.field
};
ydn.db.Where.prototype.getKeyRange = function() {
  return this.key_range_
};
ydn.db.Where.resolvedStartsWith = function(keyRange) {
  if(!goog.isDefAndNotNull(keyRange) || !goog.isDefAndNotNull(keyRange.lower) || !goog.isDefAndNotNull(keyRange.upper)) {
    return false
  }
  if(goog.isArray(keyRange.lower) && goog.isArray(keyRange.upper)) {
    return keyRange.lower.length == keyRange.upper.length - 1 && keyRange.upper[keyRange.upper.length - 1] == "\uffff" && keyRange.lower.every(function(x, i) {
      return x == keyRange.upper[i]
    })
  }else {
    return!keyRange.lowerOpen && !keyRange.upperOpen && keyRange.lower.length == keyRange.upper.length + 1 && keyRange.upper[keyRange.lower.length - 1] == "\uffff"
  }
};
ydn.db.Where.prototype.and = function(that) {
  if(this.field != that.field) {
    return null
  }
  var key_range = goog.isDefAndNotNull(this.key_range_) && goog.isDefAndNotNull(that.key_range_) ? this.key_range_.and(that.key_range_) : this.key_range_ || that.key_range_;
  return new ydn.db.Where(this.field, key_range)
};
goog.provide("ydn.db.core.Join");
ydn.db.core.Join = function(store_name, opt_field_name, opt_value) {
  this.store_name = store_name;
  this.field_name = opt_field_name;
  this.value = opt_value
};
ydn.db.core.Join.store_name;
ydn.db.core.Join.field_name;
ydn.db.core.Join.value;
goog.provide("ydn.db.Cursors");
goog.provide("ydn.db.IndexValueCursors");
goog.provide("ydn.db.Iterator");
goog.provide("ydn.db.Iterator.State");
goog.provide("ydn.db.KeyCursors");
goog.provide("ydn.db.ValueCursors");
goog.require("goog.debug.Logger");
goog.require("goog.functions");
goog.require("ydn.db.Cursor");
goog.require("ydn.db.KeyRange");
goog.require("ydn.db.Where");
goog.require("ydn.db.base");
goog.require("ydn.db.core.Join");
goog.require("ydn.db.core.req.ICursor");
goog.require("ydn.debug.error.ArgumentException");
ydn.db.Iterator = function(store, opt_index, opt_key_range, opt_reverse, opt_unique, opt_key_only, opt_index_key_path) {
  if(goog.DEBUG && !goog.isString(store)) {
    throw new TypeError("store name");
  }
  this.store_name_ = store;
  this.index_name_ = opt_index;
  this.index_key_path_ = opt_index_key_path;
  this.is_index_iterator_ = !!this.index_name_;
  this.is_key_iterator_ = goog.isDef(opt_key_only) ? opt_key_only : !!goog.isString(this.index_name_);
  if(goog.DEBUG && !goog.isBoolean(this.is_key_iterator_)) {
    throw new TypeError("key_only");
  }
  if(goog.DEBUG && goog.isDef(opt_reverse) && !goog.isBoolean(opt_reverse)) {
    throw new TypeError("reverse");
  }
  if(goog.DEBUG && goog.isDef(opt_unique) && !goog.isBoolean(opt_unique)) {
    throw new TypeError("unique");
  }
  var direction = ydn.db.base.Direction.NEXT;
  if(opt_reverse && opt_unique) {
    direction = ydn.db.base.Direction.PREV_UNIQUE
  }else {
    if(opt_reverse) {
      direction = ydn.db.base.Direction.PREV
    }else {
      if(opt_unique) {
        direction = ydn.db.base.Direction.NEXT_UNIQUE
      }
    }
  }
  this.direction_ = direction;
  if(goog.DEBUG) {
    var msg = ydn.db.KeyRange.validate(opt_key_range);
    if(msg) {
      throw new ydn.debug.error.ArgumentException("Invalid key range: " + msg);
    }
  }
  this.key_range_ = ydn.db.KeyRange.parseIDBKeyRange(opt_key_range);
  this.cursor_ = null
};
ydn.db.Iterator.DEBUG = false;
ydn.db.Iterator.prototype.store_name_;
ydn.db.Iterator.prototype.index_name_;
ydn.db.Iterator.prototype.cursor_;
ydn.db.Iterator.prototype.is_index_iterator_;
ydn.db.Iterator.prototype.key_range_;
ydn.db.Iterator.prototype.is_key_iterator_ = true;
ydn.db.Iterator.prototype.direction_;
ydn.db.KeyCursors = function(store, opt_key_range, opt_reverse) {
  if(arguments.length > 3) {
    throw new ydn.debug.error.ArgumentException("too many argument");
  }
  goog.base(this, store, undefined, opt_key_range, opt_reverse, undefined, true)
};
goog.inherits(ydn.db.KeyCursors, ydn.db.Iterator);
ydn.db.KeyCursors.where = function(store_name, op, value, opt_op2, opt_value2) {
  return new ydn.db.KeyCursors(store_name, ydn.db.KeyRange.where(op, value, opt_op2, opt_value2))
};
ydn.db.Cursors = function(store, index, opt_key_range, opt_reverse, opt_unique) {
  if(!goog.isString(index)) {
    throw new ydn.debug.error.ArgumentException("index name must be string");
  }
  goog.base(this, store, index, opt_key_range, opt_reverse, opt_unique, true)
};
goog.inherits(ydn.db.Cursors, ydn.db.Iterator);
ydn.db.Cursors.where = function(store_name, index, op, value, opt_op2, opt_value2) {
  return new ydn.db.Cursors(store_name, index, ydn.db.KeyRange.where(op, value, opt_op2, opt_value2))
};
ydn.db.ValueCursors = function(store, opt_key_range, opt_reverse) {
  if(arguments.length > 3) {
    throw new ydn.debug.error.ArgumentException("too many argument");
  }
  goog.base(this, store, undefined, opt_key_range, opt_reverse, undefined, false)
};
goog.inherits(ydn.db.ValueCursors, ydn.db.Iterator);
ydn.db.ValueCursors.where = function(store_name, op, value, opt_op2, opt_value2) {
  return new ydn.db.ValueCursors(store_name, ydn.db.KeyRange.where(op, value, opt_op2, opt_value2))
};
ydn.db.IndexValueCursors = function(store, index, opt_key_range, opt_reverse, opt_unique) {
  if(!goog.isString(index)) {
    throw new ydn.debug.error.ArgumentException("index name must be string");
  }
  goog.base(this, store, index, opt_key_range, opt_reverse, opt_unique, false)
};
goog.inherits(ydn.db.IndexValueCursors, ydn.db.Iterator);
ydn.db.IndexValueCursors.where = function(store_name, index, op, value, opt_op2, opt_value2) {
  return new ydn.db.IndexValueCursors(store_name, index, ydn.db.KeyRange.where(op, value, opt_op2, opt_value2))
};
ydn.db.Iterator.State = {INITIAL:"init", WORKING:"busy", RESTING:"rest", COMPLETED:"done"};
ydn.db.Iterator.prototype.getState = function() {
  if(!this.cursor_) {
    return ydn.db.Iterator.State.INITIAL
  }else {
    if(this.cursor_.hasDone()) {
      return ydn.db.Iterator.State.COMPLETED
    }else {
      if(this.cursor_.isExited()) {
        return ydn.db.Iterator.State.RESTING
      }else {
        return ydn.db.Iterator.State.WORKING
      }
    }
  }
};
ydn.db.Iterator.prototype.logger = goog.debug.Logger.getLogger("ydn.db.Iterator");
ydn.db.Iterator.prototype.getStoreName = function() {
  return this.store_name_
};
ydn.db.Iterator.prototype.getIndexName = function() {
  return this.index_name_
};
ydn.db.Iterator.prototype.getDirection = function() {
  return this.direction_
};
ydn.db.Iterator.prototype.keyRange = function() {
  return this.key_range_
};
ydn.db.Iterator.prototype.hasKeyRange = function() {
  return!!this.key_range_
};
ydn.db.Iterator.prototype.getLower = function() {
  return this.key_range_ ? undefined : this.key_range_.lower
};
ydn.db.Iterator.prototype.getLowerOpen = function() {
  return this.key_range_ ? undefined : this.key_range_.lowerOpen
};
ydn.db.Iterator.prototype.getUpper = function() {
  return this.key_range_ ? undefined : this.key_range_.upper
};
ydn.db.Iterator.prototype.getUpperOpen = function() {
  return this.key_range_ ? undefined : this.key_range_.upperOpen
};
ydn.db.Iterator.prototype.getKeyRange = function() {
  if(this.key_range_) {
    if(this.key_range_ instanceof ydn.db.IDBKeyRange) {
      return this.key_range_
    }else {
      return ydn.db.IDBKeyRange.bound(this.key_range_.lower, this.key_range_.upper, this.key_range_.lowerOpen, this.key_range_.upperOpen)
    }
  }else {
    return null
  }
};
ydn.db.Iterator.prototype.isKeyIterator = function() {
  return this.is_key_iterator_
};
ydn.db.Iterator.prototype.isValueIterator = function() {
  return!this.is_key_iterator_
};
ydn.db.Iterator.prototype.isIndexIterator = function() {
  return this.is_index_iterator_
};
ydn.db.Iterator.prototype.isPrimaryIterator = function() {
  return!this.is_index_iterator_
};
ydn.db.Iterator.prototype.toJSON = function() {
  return{"store":this.store_name_, "index":this.index_name_, "keyRange":this.key_range_ ? ydn.db.KeyRange.toJSON(this.key_range_) : null, "direction":this.direction_}
};
if(goog.DEBUG) {
  ydn.db.Iterator.prototype.toString = function() {
    var str = goog.isDef(this.index_key_path_) ? ":" + this.index_key_path_.join(",") : goog.isDef(this.index_name_) ? ":" + this.index_name_ : "";
    str += ydn.db.KeyRange.toString(this.key_range_);
    var s = this.isIndexIterator() ? "Index" : "";
    s += this.isKeyIterator() ? "Key" : "Value";
    return s + "Iterator:" + this.store_name_ + str
  }
}
ydn.db.Iterator.prototype.getKey = function() {
  return this.cursor_ ? this.cursor_.getKey() : undefined
};
ydn.db.Iterator.prototype.getPrimaryKey = function() {
  return this.cursor_ ? this.cursor_.getPrimaryKey() : undefined
};
ydn.db.Iterator.prototype.resume = function(key, opt_primary_key) {
  var iter = new ydn.db.Iterator(this.store_name_, this.index_name_, this.key_range_, this.isReversed(), this.isUnique(), this.is_key_iterator_, this.index_key_path_);
  iter.cursor_ = new ydn.db.Cursor([], null, key, opt_primary_key);
  return iter
};
ydn.db.Iterator.prototype.reverse = function(opt_key, opt_primary_key) {
  var iter = new ydn.db.Iterator(this.store_name_, this.index_name_, this.key_range_, !this.isReversed(), this.isUnique(), this.is_key_iterator_, this.index_key_path_);
  if(goog.isDefAndNotNull(opt_key)) {
    iter.cursor_ = new ydn.db.Cursor([], null, opt_key, opt_primary_key)
  }
  return iter
};
ydn.db.Iterator.prototype.count = function() {
  return this.cursor_ ? this.cursor_.getCount() : NaN
};
ydn.db.Iterator.prototype.stores = function() {
  var stores = [this.store_name_];
  if(this.joins_) {
    for(var i = 0;i < this.joins_.length;i++) {
      if(!goog.array.contains(stores, this.joins_[i].store_name)) {
        stores.push(this.joins_[i].store_name)
      }
    }
  }
  return stores
};
ydn.db.Iterator.prototype.index_key_path_;
ydn.db.Iterator.prototype.isReversed = function() {
  return this.direction_ === ydn.db.base.Direction.PREV || this.direction_ === ydn.db.base.Direction.PREV_UNIQUE
};
ydn.db.Iterator.prototype.isUnique = function() {
  return this.direction_ === ydn.db.base.Direction.NEXT_UNIQUE || this.direction_ === ydn.db.base.Direction.PREV_UNIQUE
};
ydn.db.Iterator.prototype.restrict = function(field_name, value) {
  goog.asserts.assertString(field_name, 'field name in string require but, "' + field_name + '" of type ' + typeof field_name + " found.");
  goog.asserts.assert(ydn.db.Key.isValidKey(value), 'key value "' + ydn.json.toShortString(value) + '" is invalid');
  var key_range;
  var base = [value];
  if(this.key_range_) {
    var lower = goog.isDefAndNotNull(this.key_range_.lower) ? base.concat(this.key_range_.lower) : base;
    var upper = goog.isDefAndNotNull(this.key_range_.upper) ? base.concat(this.key_range_.upper) : base;
    key_range = new ydn.db.KeyRange(lower, upper, !!this.key_range_.lowerOpen, !!this.key_range_.upperOpen)
  }else {
    if(this.is_index_iterator_) {
      key_range = ydn.db.KeyRange.starts(base)
    }else {
      key_range = ydn.db.KeyRange.only(value)
    }
  }
  var index_name;
  var index_key_path;
  if(this.index_key_path_) {
    index_key_path = [field_name].concat(this.index_key_path_)
  }else {
    if(this.is_index_iterator_) {
      index_key_path = [field_name].concat(this.index_name_)
    }else {
      index_name = field_name
    }
  }
  return new ydn.db.Iterator(this.store_name_, index_name, key_range, this.isReversed(), this.isUnique(), this.is_key_iterator_, index_key_path)
};
ydn.db.Iterator.prototype.joins_;
ydn.db.Iterator.prototype.join = function(store_name, opt_field_name, opt_value) {
  var iter = new ydn.db.Iterator(this.store_name_, this.index_name_, this.key_range_, this.isReversed(), this.isUnique(), this.is_key_iterator_, this.index_key_path_);
  var join = new ydn.db.core.Join(store_name, opt_field_name, opt_value);
  if(this.joins_) {
    iter.joins_ = this.joins_.concat(join)
  }else {
    iter.joins_ = [join]
  }
  return iter
};
ydn.db.Iterator.prototype.iterate = function(tx, tx_lbl, executor, opt_query) {
  var query_mth = opt_query || ydn.db.schema.Store.QueryMethod.VALUES;
  var cursor = executor.getCursor(tx, tx_lbl, this.store_name_, this.index_key_path_ || this.index_name_, this.key_range_, this.direction_, this.is_key_iterator_, query_mth);
  var cursors = [cursor];
  for(var i = 0, n = this.joins_ ? this.joins_.length : 0;i < n;i++) {
    var join = this.joins_[i];
    if(join.field_name && goog.isDefAndNotNull(join.value)) {
      var key_range;
      if(this.isPrimaryIterator()) {
        key_range = ydn.db.IDBKeyRange.only(join.value)
      }else {
        key_range = ydn.db.KeyRange.parseIDBKeyRange(ydn.db.KeyRange.starts([join.value]))
      }
      var cur = executor.getCursor(tx, tx_lbl, join.store_name, join.field_name, key_range, this.direction_, this.is_key_iterator_, query_mth);
      cursors.push(cur)
    }
  }
  var msg = "";
  if(this.cursor_) {
    msg = " by resuming " + this.cursor_
  }
  this.cursor_ = new ydn.db.Cursor(cursors, this.cursor_);
  this.logger.finest(tx_lbl + " " + this + " created " + this.cursor_ + msg);
  return this.cursor_
};
ydn.db.Iterator.prototype.reset = function() {
  if(this.getState() == ydn.db.Iterator.State.WORKING) {
    throw new ydn.error.InvalidOperationError(ydn.db.Iterator.State.WORKING);
  }
  this.cursor_ = null
};
goog.provide("ydn.db.crud.req.RequestExecutor");
goog.require("goog.async.Deferred");
goog.require("goog.debug.Logger");
goog.require("ydn.db.InternalError");
goog.require("ydn.db.Key");
ydn.db.crud.req.RequestExecutor = function(dbname, schema) {
  this.dbname = dbname;
  this.schema = schema
};
ydn.db.crud.req.RequestExecutor.prototype.logger = goog.debug.Logger.getLogger("ydn.db.crud.req.RequestExecutor");
ydn.db.crud.req.RequestExecutor.prototype.schema;
ydn.db.crud.req.RequestExecutor.prototype.dbname = "";
if(goog.DEBUG) {
  ydn.db.crud.req.RequestExecutor.prototype.toString = function() {
    return"RequestExecutor"
  }
}
ydn.db.crud.req.RequestExecutor.prototype.getIndexName = function(store, index_name_or_key_path) {
  var index;
  if(goog.isArray(index_name_or_key_path)) {
    index = store.getIndexByKeyPath(index_name_or_key_path);
    goog.asserts.assertObject(index, 'require index of key path "' + index_name_or_key_path + '" not found in ' + store.getName())
  }else {
    index = store.getIndex(index_name_or_key_path);
    goog.asserts.assertObject(index, 'require index "' + index_name_or_key_path + '" not found in ' + store.getName())
  }
  return index.getName()
};
goog.provide("ydn.db.crud.IOperator");
goog.require("ydn.db.crud.req.RequestExecutor");
goog.require("ydn.db.KeyRange");
ydn.db.crud.IOperator = function() {
};
ydn.db.crud.IOperator.prototype.abort = goog.abstractMethod;
ydn.db.crud.IOperator.prototype.count = goog.abstractMethod;
ydn.db.crud.IOperator.prototype.get = goog.abstractMethod;
ydn.db.crud.IOperator.prototype.values = goog.abstractMethod;
ydn.db.crud.IOperator.prototype.keys = goog.abstractMethod;
ydn.db.crud.IOperator.prototype.add = goog.abstractMethod;
ydn.db.crud.IOperator.prototype.load = goog.abstractMethod;
ydn.db.crud.IOperator.prototype.put = goog.abstractMethod;
ydn.db.crud.IOperator.prototype.clear = goog.abstractMethod;
ydn.db.crud.IOperator.prototype.remove = goog.abstractMethod;
goog.provide("ydn.db.core.IOperator");
goog.require("ydn.db.crud.IOperator");
ydn.db.core.IOperator = function() {
};
ydn.db.core.IOperator.prototype.map = goog.abstractMethod;
ydn.db.core.IOperator.prototype.reduce = goog.abstractMethod;
goog.provide("ydn.db.con.ICursorStream");
ydn.db.con.ICursorStream = function() {
};
ydn.db.con.ICursorStream.prototype.seek = goog.abstractMethod;
ydn.db.con.ICursorStream.prototype.onFinish = goog.abstractMethod;
goog.provide("ydn.db.con.IStorage");
goog.require("goog.async.Deferred");
ydn.db.con.IStorage = function() {
};
ydn.db.con.IStorage.prototype.close = goog.abstractMethod;
ydn.db.con.IStorage.prototype.transaction = goog.abstractMethod;
goog.provide("ydn.db.con.IdbCursorStream");
goog.require("goog.debug.Logger");
goog.require("ydn.db.con.ICursorStream");
goog.require("ydn.db.con.IStorage");
ydn.db.con.IdbCursorStream = function(db, store_name, index_name, sink) {
  if("transaction" in db) {
    this.db_ = (db);
    this.idb_ = null;
    this.tx_ = null
  }else {
    if("objectStore" in db) {
      var tx = (db);
      this.db_ = null;
      this.idb_ = tx.db;
      this.tx_ = tx;
      if(goog.DEBUG && !this.tx_.db.objectStoreNames.contains(store_name)) {
        throw new ydn.error.ArgumentException('store "' + store_name + '" not in transaction.');
      }
    }else {
      throw new ydn.error.ArgumentException("storage instance require.");
    }
  }
  this.store_name_ = store_name;
  this.index_name_ = index_name;
  this.sink_ = sink;
  this.cursor_ = null;
  this.stack_ = [];
  this.running_ = 0;
  this.on_tx_request_ = false
};
ydn.db.con.IdbCursorStream.prototype.logger = goog.debug.Logger.getLogger("ydn.db.con.IdbCursorStream");
ydn.db.con.IdbCursorStream.prototype.db_;
ydn.db.con.IdbCursorStream.prototype.tx_;
ydn.db.con.IdbCursorStream.prototype.idb_;
ydn.db.con.IdbCursorStream.prototype.on_tx_request_ = false;
ydn.db.con.IdbCursorStream.prototype.store_name_;
ydn.db.con.IdbCursorStream.prototype.index_name_;
ydn.db.con.IdbCursorStream.prototype.stack_ = [];
ydn.db.con.IdbCursorStream.prototype.sink_;
ydn.db.con.IdbCursorStream.prototype.isIndex = function() {
  return goog.isDefAndNotNull(this.index_name_)
};
ydn.db.con.IdbCursorStream.prototype.processRequest_ = function(req) {
  this.running_++;
  var me = this;
  req.onsuccess = function(ev) {
    var cursor = ev.target.result;
    if(cursor) {
      if(goog.isFunction(me.sink_)) {
        var cursor_value = cursor["value"];
        var value = me.isIndex() ? cursor_value[me.index_name_] : cursor_value;
        me.sink_(cursor.primaryKey, value)
      }else {
        me.logger.warning("sink gone, dropping value for: " + cursor.primaryKey)
      }
      if(cursor && me.stack_.length > 0) {
        cursor["continue"](me.stack_.shift())
      }else {
        me.running_--;
        me.clearStack_()
      }
    }
  };
  req.onerror = function(ev) {
    var msg = "error" in req ? req["error"].name + ":" + req["error"].message : "";
    me.logger.warning("seeking fail. " + msg);
    me.running_--;
    me.clearStack_()
  }
};
ydn.db.con.IdbCursorStream.prototype.onFinish = function(callback) {
  if(this.stack_.length == 0 && this.running_ == 0) {
    callback()
  }else {
    this.collector_ = callback
  }
};
ydn.db.con.IdbCursorStream.prototype.createRequest_ = function() {
  if(this.on_tx_request_) {
    return
  }
  var me = this;
  var on_completed = function(type, ev) {
    me.tx_ = null;
    if(type !== ydn.db.base.TxEventTypes.COMPLETE) {
      me.logger.warning(ev.name + ":" + ev.message)
    }
    me.logger.finest(me + " transaction " + type)
  };
  var doRequest = function(tx) {
    var key = me.stack_.shift();
    me.logger.finest(me + " transaction started for " + key);
    var store = tx.objectStore(me.store_name_);
    me.processRequest_(store.openCursor(key))
  };
  if(this.tx_) {
    me.logger.finest(me + " using existing tx.");
    doRequest(this.tx_)
  }else {
    if(this.idb_) {
      me.logger.finest(me + " creating tx from IDBDatabase.");
      this.tx = this.idb_.transaction([this.store_name_], ydn.db.base.TransactionMode.READ_ONLY);
      this.tx.oncomplete = function(event) {
        on_completed(ydn.db.base.TxEventTypes.COMPLETE, event)
      };
      this.tx.onerror = function(event) {
        on_completed(ydn.db.base.TxEventTypes.ERROR, event)
      };
      this.tx.onabort = function(event) {
        on_completed(ydn.db.base.TxEventTypes.ABORT, event)
      }
    }else {
      if(this.db_) {
        me.logger.finest(me + " creating tx from ydn.db.con.IStorage.");
        this.on_tx_request_ = true;
        this.db_.transaction(function(tx) {
          me.on_tx_request_ = false;
          doRequest(tx)
        }, [me.store_name_], ydn.db.base.TransactionMode.READ_ONLY, on_completed)
      }else {
        var msg = goog.DEBUG ? "no way to create a transaction provided." : "";
        throw new ydn.error.InternalError(msg);
      }
    }
  }
};
ydn.db.con.IdbCursorStream.prototype.clearStack_ = function() {
  if(this.cursor_ && this.stack_.length > 0) {
    this.cursor_["continue"](this.stack_.shift())
  }else {
    if(this.running_ == 0) {
      if(this.collector_) {
        this.collector_()
      }
    }
  }
};
ydn.db.con.IdbCursorStream.prototype.seek = function(key) {
  this.stack_.push(key);
  this.createRequest_()
};
goog.provide("ydn.db.Streamer");
goog.require("ydn.db.con.IdbCursorStream");
goog.require("ydn.db.con.IStorage");
goog.require("ydn.db.Iterator");
goog.require("ydn.debug.error.ArgumentException");
ydn.db.Streamer = function(storage, store_name, field_name) {
  if(storage && storage instanceof ydn.db.con.Storage) {
    this.db_ = (storage);
    this.cursor_ = null
  }else {
    if(storage && storage.db) {
      var tx = (storage);
      this.db_ = null;
      this.setTx(tx)
    }else {
      throw new ydn.debug.error.ArgumentException("ydn.db.Streamer: First argument requires storage or transaction " + "instance required.");
    }
  }
  if(!goog.isString(store_name)) {
    throw new ydn.debug.error.ArgumentException("a store name required.");
  }
  this.store_name_ = store_name;
  if(goog.isDef(field_name) && !goog.isString(field_name)) {
    throw new ydn.debug.error.ArgumentException("index name must be a string.");
  }
  this.index_name_ = field_name;
  this.cursor_ = null;
  this.stack_value_ = [];
  this.stack_key_ = [];
  this.is_collecting_ = false
};
ydn.db.Streamer.prototype.logger = goog.debug.Logger.getLogger("ydn.db.Streamer");
ydn.db.Streamer.prototype.db_ = null;
ydn.db.Streamer.prototype.key_only_ = true;
ydn.db.Streamer.prototype.storage_ = null;
ydn.db.Streamer.prototype.store_name_;
ydn.db.Streamer.prototype.index_name_;
ydn.db.Streamer.prototype.sink_ = null;
ydn.db.Streamer.prototype.stack_key_ = [];
ydn.db.Streamer.prototype.stack_value_ = [];
ydn.db.Streamer.prototype.getFieldName = function() {
  return this.index_name_
};
ydn.db.Streamer.prototype.cursor_ = null;
ydn.db.Streamer.prototype.isKeyIterator = function() {
  return this.key_only_
};
ydn.db.Streamer.prototype.setSink = function(sink) {
  this.sink_ = sink
};
ydn.db.Streamer.prototype.setTx = function(tx) {
  if(tx.db) {
    var idb_tx = (tx);
    this.cursor_ = new ydn.db.con.IdbCursorStream(idb_tx, this.store_name_, this.index_name_, goog.bind(this.collector_, this))
  }else {
    throw new ydn.debug.error.ArgumentException("Invalid IndexedDB Transaction.");
  }
};
ydn.db.Streamer.prototype.push_ = function() {
  var on_queue = this.stack_value_.length > 0;
  if(on_queue && !this.is_collecting_ && goog.isFunction(this.sink_)) {
    var me = this;
    var waiter = function() {
      me.push_()
    };
    var key = this.stack_key_.shift();
    var value = this.stack_value_.shift();
    on_queue = this.stack_value_.length > 0;
    var to_wait = this.sink_(key, value, on_queue ? waiter : null);
    if(on_queue && !to_wait) {
      this.push_()
    }
  }
};
ydn.db.Streamer.prototype.is_collecting_ = false;
ydn.db.Streamer.prototype.collect = function(callback) {
  if(this.cursor_) {
    this.is_collecting_ = true;
    var me = this;
    this.cursor_.onFinish(function on_finish(e) {
      callback(me.stack_key_, me.stack_value_);
      me.stack_key_ = [];
      me.stack_value_ = [];
      me.is_collecting_ = false
    })
  }else {
    callback(this.stack_key_, this.stack_value_);
    this.stack_key_ = [];
    this.stack_value_ = []
  }
};
ydn.db.Streamer.prototype.collector_ = function(key, value) {
  this.stack_key_.push(key);
  this.stack_value_.push(value);
  this.push_()
};
ydn.db.Streamer.prototype.push = function(key, value) {
  if(this.is_collecting_) {
    var msg = goog.DEBUG ? "push not allowed after a collection is started" : "";
    throw new ydn.error.InvalidOperationError(msg);
  }
  if(arguments.length >= 2) {
    this.collector_(key, value)
  }else {
    if(!this.cursor_) {
      if(!this.db_) {
        var msg2 = goog.DEBUG ? "Database is not setup." : "";
        throw new ydn.error.InvalidOperationError(msg2);
      }
      var type = this.db_.getType();
      if(!type) {
        var msg3 = goog.DEBUG ? "Database is not connected." : "";
        throw new ydn.error.InvalidOperationError(msg3);
      }else {
        if(type === ydn.db.base.Mechanisms.IDB) {
          this.cursor_ = new ydn.db.con.IdbCursorStream(this.db_, this.store_name_, this.index_name_, goog.bind(this.collector_, this))
        }else {
          throw new ydn.error.NotImplementedException(type);
        }
      }
    }
    this.cursor_.seek(key)
  }
};
ydn.db.Streamer.prototype.pull = function(key, value) {
  if(!goog.isDef(this.foreign_key_index_name_)) {
    this.push(key)
  }else {
    if(this.key_only_) {
      this.push(value)
    }else {
      if(goog.isDefAndNotNull(value)) {
        this.push(value[this.foreign_key_index_name_])
      }else {
        this.push(undefined, undefined)
      }
    }
  }
};
ydn.db.Streamer.prototype.foreign_key_store_name_;
ydn.db.Streamer.prototype.foreign_key_index_name_;
ydn.db.Streamer.prototype.setRelation = function(store_name, index_name) {
  this.foreign_key_store_name_ = store_name;
  this.foreign_key_index_name_ = index_name
};
ydn.db.Streamer.prototype.getRelation = function() {
  return[this.foreign_key_store_name_, this.foreign_key_index_name_]
};
ydn.db.Streamer.prototype.getStoreName = function() {
  return this.store_name_
};
ydn.db.Streamer.prototype.getIndexName = function() {
  return this.index_name_
};
if(goog.DEBUG) {
  ydn.db.Streamer.prototype.toString = function() {
    return"Streamer:" + this.store_name_ + (this.index_name_ || "")
  }
}
;goog.provide("ydn.db.core.req.AbstractCursor");
goog.require("goog.Disposable");
goog.require("ydn.debug.error.InternalError");
ydn.db.core.req.AbstractCursor = function(tx, tx_no, store_name, index_name, keyRange, direction, is_key_cursor, mth) {
  goog.base(this);
  this.store_name = store_name;
  this.index_name = index_name;
  this.is_index = goog.isString(this.index_name);
  this.key_range = keyRange || null;
  this.tx = tx;
  this.tx_no = tx_no;
  this.reverse = direction == ydn.db.base.Direction.PREV || direction == ydn.db.base.Direction.PREV_UNIQUE;
  this.unique = direction == ydn.db.base.Direction.NEXT_UNIQUE || direction == ydn.db.base.Direction.PREV_UNIQUE;
  this.dir = direction;
  this.is_key_cursor_ = is_key_cursor;
  this.query_method = mth
};
goog.inherits(ydn.db.core.req.AbstractCursor, goog.Disposable);
ydn.db.core.req.AbstractCursor.prototype.index_name;
ydn.db.core.req.AbstractCursor.prototype.is_index;
ydn.db.core.req.AbstractCursor.prototype.store_name = "";
ydn.db.core.req.AbstractCursor.prototype.dir = "";
ydn.db.core.req.AbstractCursor.prototype.key_range = null;
ydn.db.core.req.AbstractCursor.prototype.unique = false;
ydn.db.core.req.AbstractCursor.prototype.reverse = false;
ydn.db.core.req.AbstractCursor.prototype.is_key_cursor_ = true;
ydn.db.core.req.AbstractCursor.prototype.query_method;
ydn.db.core.req.AbstractCursor.prototype.isActive = function() {
  return!!this.tx
};
ydn.db.core.req.AbstractCursor.prototype.isIndexCursor = function() {
  return this.is_index
};
ydn.db.core.req.AbstractCursor.prototype.isPrimaryCursor = function() {
  return!this.is_index
};
ydn.db.core.req.AbstractCursor.prototype.isValueCursor = function() {
  return!this.is_key_cursor_
};
ydn.db.core.req.AbstractCursor.prototype.onError = function(e) {
  throw new ydn.debug.error.InternalError;
};
ydn.db.core.req.AbstractCursor.prototype.onSuccess = function(opt_key, opt_primary_key, opt_value) {
  throw new ydn.debug.error.InternalError;
};
ydn.db.core.req.AbstractCursor.prototype.disposeInternal = function() {
  this.tx = null
};
if(goog.DEBUG) {
  ydn.db.core.req.AbstractCursor.prototype.toString = function() {
    var index = goog.isDef(this.index_name) ? ":" + this.index_name : "";
    var active = this.tx ? "" : "~";
    return"Cursor:" + this.store_name + index + "[" + active + this.tx_no + "]"
  }
}
;goog.provide("ydn.db.crud.req.IRequestExecutor");
ydn.db.crud.req.IRequestExecutor = function() {
};
ydn.db.crud.req.IRequestExecutor.prototype.addObject = goog.abstractMethod;
ydn.db.crud.req.IRequestExecutor.prototype.addObjects = goog.abstractMethod;
ydn.db.crud.req.IRequestExecutor.prototype.removeById = goog.abstractMethod;
ydn.db.crud.req.IRequestExecutor.prototype.removeByKeys = goog.abstractMethod;
ydn.db.crud.req.IRequestExecutor.prototype.removeByKeyRange = goog.abstractMethod;
ydn.db.crud.req.IRequestExecutor.prototype.clearByKeyRange = goog.abstractMethod;
ydn.db.crud.req.IRequestExecutor.prototype.removeByIndexKeyRange = goog.abstractMethod;
ydn.db.crud.req.IRequestExecutor.prototype.clearByStores = goog.abstractMethod;
ydn.db.crud.req.IRequestExecutor.prototype.countStores = goog.abstractMethod;
ydn.db.crud.req.IRequestExecutor.prototype.countKeyRange = goog.abstractMethod;
ydn.db.crud.req.IRequestExecutor.prototype.getById = goog.abstractMethod;
ydn.db.crud.req.IRequestExecutor.prototype.keysByKeyRange = goog.abstractMethod;
ydn.db.crud.req.IRequestExecutor.prototype.keysByIndexKeyRange = goog.abstractMethod;
ydn.db.crud.req.IRequestExecutor.prototype.listByIds = goog.abstractMethod;
ydn.db.crud.req.IRequestExecutor.prototype.listByKeys = goog.abstractMethod;
ydn.db.crud.req.IRequestExecutor.prototype.listByKeyRange = goog.abstractMethod;
ydn.db.crud.req.IRequestExecutor.prototype.listByIndexKeyRange = goog.abstractMethod;
ydn.db.crud.req.IRequestExecutor.prototype.listByStore = goog.abstractMethod;
ydn.db.crud.req.IRequestExecutor.prototype.putData = goog.abstractMethod;
ydn.db.crud.req.IRequestExecutor.prototype.putObject = goog.abstractMethod;
ydn.db.crud.req.IRequestExecutor.prototype.putObjects = goog.abstractMethod;
ydn.db.crud.req.IRequestExecutor.prototype.putByKeys = goog.abstractMethod;
goog.provide("ydn.db.core.req.IRequestExecutor");
goog.require("ydn.db.Streamer");
goog.require("ydn.db.core.req.AbstractCursor");
goog.require("ydn.db.crud.req.IRequestExecutor");
ydn.db.core.req.IRequestExecutor = function() {
};
ydn.db.core.req.IRequestExecutor.prototype.keysByIterator = goog.abstractMethod;
ydn.db.core.req.IRequestExecutor.prototype.listByIterator = goog.abstractMethod;
ydn.db.core.req.IRequestExecutor.prototype.getCursor = goog.abstractMethod;
ydn.db.core.req.IRequestExecutor.prototype.getStreamer = goog.abstractMethod;
goog.provide("ydn.db.algo.AbstractSolver");
goog.require("goog.debug.Logger");
goog.require("ydn.db");
goog.require("ydn.db.Streamer");
ydn.db.algo.AbstractSolver = function(out, opt_limit) {
  if(goog.DEBUG && goog.isDefAndNotNull(out) && !("push" in out)) {
    throw new ydn.error.ArgumentException;
  }
  this.out = out || null;
  this.limit = opt_limit;
  this.match_count = 0
};
ydn.db.algo.AbstractSolver.prototype.getIterators = function() {
  return null
};
ydn.db.algo.AbstractSolver.prototype.logger = goog.debug.Logger.getLogger("ydn.db.algo.AbstractSolver");
ydn.db.algo.AbstractSolver.prototype.out = null;
ydn.db.algo.AbstractSolver.prototype.begin = function(iterators, callback) {
  if(goog.DEBUG) {
    if(!goog.isArray(iterators)) {
      throw new TypeError("iterators must be array");
    }
    if(iterators.length < 2) {
      throw new RangeError("ZigzagMerge require at least 2 iterators, but " + " only " + iterators.length + " found.");
    }
    for(var i = 0;i < iterators.length;i++) {
      if(!(iterators[i] instanceof ydn.db.Iterator)) {
        throw new TypeError("item at iterators " + i + " is not an iterator.");
      }
    }
  }
  return false
};
ydn.db.algo.AbstractSolver.prototype.pusher = function(advance, keys, values, opt_match_key) {
  var matched = goog.isDefAndNotNull(opt_match_key);
  if(!goog.isDef(opt_match_key)) {
    opt_match_key = values[0];
    matched = goog.isDefAndNotNull(opt_match_key);
    for(var i = 1;matched && i < values.length;i++) {
      if(!goog.isDefAndNotNull(values[i]) || ydn.db.cmp(values[i], opt_match_key) != 0) {
        matched = false
      }
    }
  }
  if(matched) {
    this.match_count++;
    if(this.out) {
      this.out.push(opt_match_key)
    }
    if(goog.isDef(this.limit) && this.match_count >= this.limit) {
      return[]
    }
  }
  return advance
};
ydn.db.algo.AbstractSolver.prototype.solver = function(input, output) {
  return[]
};
ydn.db.algo.AbstractSolver.prototype.finish = function(callback) {
  return false
};
goog.provide("ydn.db.core.req.IDBCursor");
goog.require("ydn.db.core.req.AbstractCursor");
goog.require("ydn.debug.error.InternalError");
ydn.db.core.req.IDBCursor = function(tx, tx_no, store_name, index_name, keyRange, direction, key_only, q_mth) {
  goog.base(this, tx, tx_no, store_name, index_name, keyRange, direction, key_only, q_mth);
  this.request_ = null
};
goog.inherits(ydn.db.core.req.IDBCursor, ydn.db.core.req.AbstractCursor);
ydn.db.core.req.IDBCursor.DEBUG = false;
ydn.db.core.req.IDBCursor.prototype.logger = goog.debug.Logger.getLogger("ydn.db.core.req.IDBCursor");
ydn.db.core.req.IDBCursor.prototype.defaultOnSuccess = function(ev) {
  var cursor = ev.target.result;
  if(ydn.db.core.req.IDBCursor.DEBUG) {
    window.console.log(this + " onSuccess " + (cursor ? cursor.key + ", " + cursor.primaryKey : ""))
  }
  if(cursor) {
    var p_key = this.isIndexCursor() ? cursor.primaryKey : undefined;
    this.onSuccess(cursor.key, p_key, cursor.value)
  }else {
    this.onSuccess()
  }
};
ydn.db.core.req.IDBCursor.prototype.request_ = null;
ydn.db.core.req.IDBCursor.prototype.openCursor = function(key, primary_key) {
  var msg = this + " opening ";
  if(goog.isDefAndNotNull(key)) {
    msg += "{" + key;
    if(goog.isDefAndNotNull(primary_key)) {
      msg += ";" + primary_key + "}"
    }else {
      msg += "}"
    }
  }
  this.logger.finest(msg);
  var key_range = this.key_range;
  var obj_store = this.tx.objectStore(this.store_name);
  var index = goog.isString(this.index_name) ? obj_store.index(this.index_name) : null;
  var request;
  if(!this.isValueCursor()) {
    if(index) {
      if(goog.isDefAndNotNull(this.dir)) {
        request = index.openKeyCursor(key_range, this.dir)
      }else {
        if(goog.isDefAndNotNull(key_range)) {
          request = index.openKeyCursor(key_range)
        }else {
          request = index.openKeyCursor()
        }
      }
    }else {
      if(goog.isDefAndNotNull(this.dir)) {
        request = obj_store.openCursor(key_range, this.dir)
      }else {
        if(goog.isDefAndNotNull(key_range)) {
          request = obj_store.openCursor(key_range)
        }else {
          request = obj_store.openCursor()
        }
      }
    }
  }else {
    if(index) {
      if(goog.isDefAndNotNull(this.dir)) {
        request = index.openCursor(key_range, this.dir)
      }else {
        if(goog.isDefAndNotNull(key_range)) {
          request = index.openCursor(key_range)
        }else {
          request = index.openCursor()
        }
      }
    }else {
      if(goog.isDefAndNotNull(this.dir)) {
        request = obj_store.openCursor(key_range, this.dir)
      }else {
        if(goog.isDefAndNotNull(key_range)) {
          request = obj_store.openCursor(key_range)
        }else {
          request = obj_store.openCursor()
        }
      }
    }
  }
  var me = this;
  request.onerror = function(ev) {
    var err = request.error;
    me.onError(err)
  };
  var requestReady = function(key, primaryKey, value) {
    me.request_ = request;
    var p_key = me.isIndexCursor() ? primaryKey : undefined;
    if(ydn.db.core.req.IDBCursor.DEBUG) {
      window.console.log(me + " onSuccess " + key)
    }
    me.onSuccess(key, p_key, value);
    if(me.request_) {
      me.request_.onsuccess = goog.bind(me.defaultOnSuccess, me)
    }
    request = null
  };
  if(goog.isDefAndNotNull(key)) {
    request.onsuccess = function(ev) {
      var cursor = ev.target.result;
      if(cursor) {
        var cmp = ydn.db.con.IndexedDb.indexedDb.cmp(cursor.key, key);
        var dir = me.reverse ? -1 : 1;
        if(cmp == dir) {
          requestReady(cursor.key, cursor.primaryKey, cursor.value)
        }else {
          if(cmp == -dir) {
            cursor["continue"](key)
          }else {
            if(goog.isDefAndNotNull(primary_key)) {
              var cmp2 = ydn.db.con.IndexedDb.indexedDb.cmp(cursor.primaryKey, primary_key);
              if(cmp2 == dir) {
                requestReady(cursor.key, cursor.primaryKey, cursor.value)
              }else {
                cursor["continue"]()
              }
            }else {
              cursor["continue"]()
            }
          }
        }
      }else {
        requestReady()
      }
    }
  }else {
    me.request_ = request;
    me.request_.onsuccess = goog.bind(me.defaultOnSuccess, me)
  }
};
ydn.db.core.req.IDBCursor.prototype.hasCursor = function() {
  return!!this.request_
};
ydn.db.core.req.IDBCursor.prototype.update = function(record) {
  var cursor = this.request_.result;
  if(cursor) {
    var df = new goog.async.Deferred;
    var req = cursor.update(record);
    req.onsuccess = function(x) {
      df.callback(x.target.result)
    };
    req.onerror = function(e) {
      df.errback(e)
    };
    return df
  }else {
    throw new ydn.db.InvalidAccessError("cursor gone");
  }
};
ydn.db.core.req.IDBCursor.prototype.clear = function() {
  var cursor = this.request_.result;
  if(cursor) {
    var df = new goog.async.Deferred;
    var req = cursor["delete"]();
    req.onsuccess = function(x) {
      df.callback(1)
    };
    req.onerror = function(e) {
      df.errback(e)
    };
    return df
  }else {
    throw new ydn.db.InvalidAccessError("cursor gone");
  }
};
ydn.db.core.req.IDBCursor.prototype.restart = function(effective_key, primary_key) {
  this.logger.finest(this + " restarting.");
  this.openCursor(primary_key, effective_key)
};
ydn.db.core.req.IDBCursor.prototype.advance = function(step) {
  var cursor = this.request_.result;
  if(step == 1) {
    cursor["continue"]()
  }else {
    cursor.advance(step)
  }
};
ydn.db.core.req.IDBCursor.prototype.continuePrimaryKey = function(key) {
  var cursor = this.request_.result;
  if(goog.DEBUG) {
    var cmp = ydn.db.con.IndexedDb.indexedDb.cmp(key, cursor.primaryKey);
    if(cmp != 1) {
      throw new ydn.debug.error.InternalError('continuing primary key "' + key + '" must higher than current primary key "' + cursor.primaryKey + '"');
    }
  }
  var me = this;
  this.request_.onsuccess = function(ev) {
    cursor = ev.target.result;
    if(cursor) {
      cmp = ydn.db.con.IndexedDb.indexedDb.cmp(cursor.primaryKey, key);
      if(cmp == 0 || cmp == 1 && !me.reverse || cmp == -1 && me.reverse) {
        me.request_.onsuccess = goog.bind(me.defaultOnSuccess, me);
        var p_key = me.isIndexCursor() ? cursor.primaryKey : undefined;
        me.onSuccess(cursor.key, p_key, cursor.value)
      }else {
        cursor["continue"]()
      }
    }else {
      me.request_.onsuccess = goog.bind(me.defaultOnSuccess, me);
      me.onSuccess()
    }
  };
  cursor["continue"]()
};
ydn.db.core.req.IDBCursor.prototype.continueEffectiveKey = function(key) {
  var cursor = this.request_.result;
  if(goog.isDefAndNotNull(key)) {
    cursor["continue"](key)
  }else {
    cursor["continue"]()
  }
};
ydn.db.core.req.IDBCursor.prototype.disposeInternal = function() {
  goog.base(this, "disposeInternal");
  this.request_ = null
};
if(goog.DEBUG) {
  ydn.db.core.req.IDBCursor.prototype.toString = function() {
    return"IDB" + goog.base(this, "toString")
  }
}
;goog.provide("ydn.db.crud.req.IndexedDb");
goog.require("goog.async.DeferredList");
goog.require("ydn.db.crud.req.IRequestExecutor");
goog.require("ydn.db.crud.req.RequestExecutor");
goog.require("ydn.error");
goog.require("ydn.json");
ydn.db.crud.req.IndexedDb = function(dbname, schema) {
  goog.base(this, dbname, schema)
};
goog.inherits(ydn.db.crud.req.IndexedDb, ydn.db.crud.req.RequestExecutor);
ydn.db.crud.req.IndexedDb.prototype.logger = goog.debug.Logger.getLogger("ydn.db.crud.req.IndexedDb");
ydn.db.crud.req.IndexedDb.DEBUG = false;
ydn.db.crud.req.IndexedDb.REQ_PER_TX = 10;
ydn.db.crud.req.IndexedDb.prototype.countStores = function(tx, tx_no, df, stores) {
  var me = this;
  var out = [];
  var msg = tx_no + " countStores: " + stores;
  this.logger.finest(msg);
  var count_store = function(i) {
    var table = stores[i];
    var store = tx.objectStore(table);
    var request = store.count();
    request.onsuccess = function(event) {
      if(ydn.db.crud.req.IndexedDb.DEBUG) {
        window.console.log(event)
      }
      out[i] = event.target.result;
      i++;
      if(i == stores.length) {
        df(out);
        df = null
      }else {
        count_store(i)
      }
    };
    request.onerror = function(event) {
      if(ydn.db.crud.req.IndexedDb.DEBUG) {
        window.console.log(event)
      }
      df(event, true);
      df = null
    }
  };
  if(stores.length == 0) {
    df([]);
    df = null
  }else {
    count_store(0)
  }
};
ydn.db.crud.req.IndexedDb.prototype.addObject = function(tx, tx_no, df, table, value, opt_key) {
  var store = tx.objectStore(table);
  var msg = tx_no + " addObject: " + table + " " + opt_key;
  this.logger.finest(msg);
  var me = this;
  var request;
  if(goog.isDef(opt_key)) {
    request = store.add(value, opt_key)
  }else {
    request = store.add(value)
  }
  request.onsuccess = function(event) {
    if(ydn.db.crud.req.IndexedDb.DEBUG) {
      window.console.log([event, table, value])
    }
    df(event.target.result)
  };
  request.onerror = function(event) {
    if(ydn.db.crud.req.IndexedDb.DEBUG) {
      window.console.log([event, table, value])
    }
    df(request.error, true)
  }
};
ydn.db.crud.req.IndexedDb.prototype.putObject = function(tx, tx_no, df, table, value, opt_key) {
  var store = tx.objectStore(table);
  var msg = tx_no + " putObject: " + table + " " + (goog.isDef(opt_key) ? opt_key : "");
  this.logger.finest(msg);
  var me = this;
  var request;
  if(goog.isDef(opt_key)) {
    request = store.put(value, opt_key)
  }else {
    request = store.put(value)
  }
  request.onsuccess = function(event) {
    if(ydn.db.crud.req.IndexedDb.DEBUG) {
      window.console.log([event, table, value])
    }
    df(event.target.result)
  };
  request.onerror = function(event) {
    if(ydn.db.crud.req.IndexedDb.DEBUG) {
      window.console.log([event, table, value])
    }
    if(goog.DEBUG && event.name == "DataError") {
      var str = ydn.json.stringify(value);
      event = new ydn.db.InvalidKeyException(table + ": " + str.substring(0, 70))
    }
    df(event, true)
  }
};
ydn.db.crud.req.IndexedDb.prototype.addObjects = function(tx, tx_no, df, store_name, objs, opt_keys) {
  var results = [];
  var result_count = 0;
  var me = this;
  var store = tx.objectStore(store_name);
  var msg = tx_no + " addObjects: " + store_name + " " + objs.length + " objects";
  this.logger.finest(msg);
  var put = function(i) {
    var request;
    if(goog.isDefAndNotNull(opt_keys)) {
      request = store.add(objs[i], opt_keys[i])
    }else {
      request = store.add(objs[i])
    }
    request.onsuccess = function(event) {
      result_count++;
      results[i] = event.target.result;
      if(result_count == objs.length) {
        df(results)
      }else {
        var next = i + ydn.db.crud.req.IndexedDb.REQ_PER_TX;
        if(next < objs.length) {
          put(next)
        }
      }
    };
    request.onerror = function(event) {
      result_count++;
      if(ydn.db.crud.req.IndexedDb.DEBUG) {
        window.console.log([store_name, event])
      }
      if(goog.DEBUG) {
        if(event.name == "DataError") {
          event = new ydn.db.InvalidKeyException('put to "' + store_name + '": ' + i + " of " + objs.length)
        }else {
          if(event.name == "DataCloneError") {
            event = new ydn.db.DataCloneError('put to "' + store_name + '": ' + i + " of " + objs.length)
          }
        }
      }
      df(request.error, true)
    }
  };
  if(objs.length > 0) {
    for(var i = 0;i < ydn.db.crud.req.IndexedDb.REQ_PER_TX && i < objs.length;i++) {
      put(i)
    }
  }else {
    df([])
  }
};
ydn.db.crud.req.IndexedDb.prototype.putObjects = function(tx, tx_no, df, store_name, objs, opt_keys) {
  var results = [];
  var result_count = 0;
  var has_error = false;
  var me = this;
  var store = tx.objectStore(store_name);
  var msg = tx_no + " putObjects: " + store_name + " " + objs.length + " objects";
  this.logger.finest(msg);
  var out = function(tx) {
    if(has_error) {
      df(results, true)
    }else {
      df(results)
    }
  };
  var put = function(i) {
    var request;
    if(goog.isDefAndNotNull(opt_keys)) {
      request = store.put(objs[i], opt_keys[i])
    }else {
      request = store.put(objs[i])
    }
    request.onsuccess = function(event) {
      result_count++;
      results[i] = event.target.result;
      if(result_count == objs.length) {
        out(event.target.transaction)
      }else {
        var next = i + ydn.db.crud.req.IndexedDb.REQ_PER_TX;
        if(next < objs.length) {
          put(next)
        }
      }
    };
    request.onerror = function(event) {
      result_count++;
      if(ydn.db.crud.req.IndexedDb.DEBUG) {
        window.console.log([store_name, event])
      }
      if(goog.DEBUG) {
        var name = event.name;
        me.logger.warning("request result " + name + ' error when put to "' + store_name + '" for object "' + ydn.json.toShortString(objs[i]) + '" at index ' + i + " of " + objs.length + " objects.")
      }
      results[i] = request.error;
      has_error = true;
      if(result_count == objs.length) {
        out(event.target.transaction)
      }else {
        var next = i + ydn.db.crud.req.IndexedDb.REQ_PER_TX;
        if(next < objs.length) {
          put(next)
        }
      }
    }
  };
  if(objs.length > 0) {
    for(var i = 0;i < ydn.db.crud.req.IndexedDb.REQ_PER_TX && i < objs.length;i++) {
      put(i)
    }
  }else {
    df([])
  }
};
ydn.db.crud.req.IndexedDb.prototype.putByKeys = function(tx, tx_no, df, objs, keys) {
  var results = [];
  var result_count = 0;
  var has_error = false;
  var out = function() {
    if(has_error) {
      df(results, true)
    }else {
      df(results)
    }
  };
  var me = this;
  var msg = tx_no + " putByKeys: of " + objs.length + " objects";
  this.logger.finest(msg);
  var put = function(i) {
    var key = keys[i];
    var store_name = key.getStoreName();
    var store = tx.objectStore(store_name);
    var request;
    if(goog.isNull(store.keyPath)) {
      request = store.put(objs[i], key.getId())
    }else {
      request = store.put(objs[i])
    }
    request.onsuccess = function(event) {
      result_count++;
      results[i] = event.target.result;
      if(result_count == objs.length) {
        out()
      }else {
        var next = i + ydn.db.crud.req.IndexedDb.REQ_PER_TX;
        if(next < objs.length) {
          put(next)
        }
      }
    };
    request.onerror = function(event) {
      result_count++;
      if(ydn.db.crud.req.IndexedDb.DEBUG) {
        window.console.log([store_name, event])
      }
      var name = event.name;
      if(goog.DEBUG) {
        me.logger.warning("request result " + name + ' error when put keys to "' + store_name + '" for object "' + ydn.json.toShortString(objs[i]) + '" at index ' + i + " of " + objs.length + " objects.")
      }
      results[i] = request.error;
      has_error = true;
      if(result_count == objs.length) {
        out()
      }else {
        var next = i + ydn.db.crud.req.IndexedDb.REQ_PER_TX;
        if(next < objs.length) {
          put(next)
        }
      }
    }
  };
  if(objs.length > 0) {
    for(var i = 0;i < ydn.db.crud.req.IndexedDb.REQ_PER_TX && i < objs.length;i++) {
      put(i)
    }
  }else {
    out()
  }
};
ydn.db.crud.req.IndexedDb.prototype.putData = function(tx, tx_no, df, store_name, data, delimiter) {
  var me = this;
  var store = this.schema.getStore(store_name);
  var objectStore = tx.objectStore(store_name);
  var results = [];
  var prev_pos = data.indexOf("\n");
  var fields = data.substr(0, prev_pos).split(delimiter);
  var types = [];
  for(var j = 0;j < fields.length;j++) {
    var index = store.getIndex(fields[j]);
    if(index) {
      types[j] = index.getType()
    }else {
      if(fields[j] == store.getKeyPath()) {
        types[j] = store.getType()
      }
    }
  }
  prev_pos++;
  var msg = tx_no + " Loading data " + " of " + fields.length + "-fields record to " + store_name;
  this.logger.finest(msg);
  var put = function() {
    var obj = {};
    var next_pos = data.indexOf("\n", prev_pos);
    var done = false;
    var text;
    if(next_pos == -1) {
      done = true;
      text = data.substring(prev_pos)
    }else {
      text = data.substring(prev_pos, next_pos);
      prev_pos = next_pos + 1
    }
    var values = text.split(delimiter);
    for(var j = 0;j < fields.length;j++) {
      var value = values[j];
      if(types[j]) {
        if(types[j] == ydn.db.schema.DataType.TEXT) {
          value = goog.string.stripQuotes(value, '"')
        }else {
          if(types[j] == ydn.db.schema.DataType.INTEGER) {
            value = parseInt(value, 10)
          }else {
            if(types[j] == ydn.db.schema.DataType.NUMERIC) {
              value = parseFloat(value)
            }
          }
        }
      }
      obj[fields[j]] = value
    }
    var request = objectStore.put(obj);
    request.onsuccess = function(event) {
      results.push(event.target.result);
      if(done) {
        df(results)
      }else {
        put()
      }
    };
    request.onerror = function(event) {
      if(ydn.db.crud.req.IndexedDb.DEBUG) {
        window.console.log([store_name, event])
      }
      if(goog.DEBUG && event.name == "DataError") {
        event = new ydn.db.InvalidKeyException(store + ": " + text.substring(0, 70))
      }
      df(request.error, true)
    }
  };
  put()
};
ydn.db.crud.req.IndexedDb.prototype.removeById = function(tx, tx_no, df, store_name, key) {
  var me = this;
  var store = tx.objectStore(store_name);
  var msg = tx_no + " clearById: " + store_name + " " + key;
  this.logger.finest(msg);
  var request = store.openCursor(ydn.db.IDBKeyRange.only(key));
  request.onsuccess = function(event) {
    if(ydn.db.crud.req.IndexedDb.DEBUG) {
      window.console.log([store_name, key, event])
    }
    var cursor = event.target.result;
    if(cursor) {
      var req = cursor["delete"]();
      req.onsuccess = function(e) {
        df(1)
      };
      req.onerror = function(e) {
        df(event, true)
      }
    }else {
      df(undefined)
    }
  };
  request.onerror = function(event) {
    if(ydn.db.crud.req.IndexedDb.DEBUG) {
      window.console.log([store_name, key, event])
    }
    df(request.error, true)
  }
};
ydn.db.crud.req.IndexedDb.prototype.removeByKeys = function(tx, tx_no, df, keys) {
  var me = this;
  var count = 0;
  var has_failed = false;
  var store_name, store, key;
  var msg = tx_no + " removeByKeys: " + keys.length + " keys";
  this.logger.finest(msg);
  var removeAt = function(i) {
    if(i >= keys.length) {
      df(count, has_failed);
      return
    }
    if(keys[i].getStoreName() != store_name) {
      store_name = keys[i].getStoreName();
      store = tx.objectStore(store_name)
    }
    var request = store.openCursor(ydn.db.IDBKeyRange.only(keys[i].getId()));
    request.onsuccess = function(event) {
      if(ydn.db.crud.req.IndexedDb.DEBUG) {
        window.console.log([store_name, i, keys[i], event])
      }
      i++;
      var cursor = event.target.result;
      if(cursor) {
        var req = cursor["delete"]();
        req.onsuccess = function(e) {
          count++;
          removeAt(i)
        };
        req.onerror = function(e) {
          has_failed = true;
          removeAt(i)
        }
      }else {
        removeAt(i)
      }
    };
    request.onerror = function(event) {
      if(ydn.db.crud.req.IndexedDb.DEBUG) {
        window.console.log([store_name, key, event])
      }
      df(request.error, true)
    }
  };
  removeAt(0)
};
ydn.db.crud.req.IndexedDb.prototype.removeByKeyRange = function(tx, tx_no, df, store_name, key_range) {
  var me = this;
  var store = tx.objectStore(store_name);
  var request = store.count(key_range);
  var msg = tx_no + " clearByKeyRange: " + store_name + " " + key_range;
  this.logger.finest(msg);
  request.onsuccess = function(event) {
    var n = event.target.result;
    var req = store["delete"](key_range);
    req.onsuccess = function() {
      df(n)
    };
    req.onerror = function(e) {
      df(request.error, true)
    }
  };
  request.onerror = function(event) {
    if(ydn.db.crud.req.IndexedDb.DEBUG) {
      window.console.log([store_name, key_range, event])
    }
    me.logger.finest("count error " + msg);
    df(event, true)
  }
};
ydn.db.crud.req.IndexedDb.prototype.clearByKeyRange = function(tx, tx_no, df, store_name, key_range) {
  var me = this;
  var store = tx.objectStore(store_name);
  var msg = tx_no + " clearByKeyRange: " + store_name + " " + key_range;
  this.logger.finest(msg);
  var req = store["delete"](key_range);
  req.onsuccess = function(event) {
    df(undefined)
  };
  req.onerror = function(event) {
    df(req.error, true)
  }
};
ydn.db.crud.req.IndexedDb.prototype.removeByIndexKeyRange = function(tx, tx_no, df, store_name, index_name, key_range) {
  var me = this;
  var store = tx.objectStore(store_name);
  var index = store.index(index_name);
  var msg = tx_no + " clearByIndexKeyRange: " + store_name + ":" + index_name + " " + key_range;
  this.logger.finest(msg);
  var request = index.openCursor(key_range);
  var n = 0;
  request.onsuccess = function(event) {
    var cursor = event.target.result;
    if(cursor) {
      var req = cursor["delete"]();
      req.onsuccess = function() {
        n++;
        cursor["continue"]()
      };
      req.onerror = function(e) {
        me.logger.finest("error " + msg);
        throw req.error;
      }
    }else {
      df(n)
    }
  };
  request.onerror = function(event) {
    df(request.error, true)
  }
};
ydn.db.crud.req.IndexedDb.prototype.clearByStores = function(tx, tx_no, df, store_names) {
  var me = this;
  var n_todo = store_names.length;
  var n_done = 0;
  var msg = tx_no + " clearByStores: " + store_names;
  this.logger.finest(msg);
  for(var i = 0;i < n_todo;i++) {
    var store_name = store_names[i];
    var store = tx.objectStore(store_name);
    var request = store.clear();
    request.onsuccess = function(event) {
      n_done++;
      if(n_done == n_todo) {
        df(n_done)
      }
    };
    request.onerror = function(event) {
      n_done++;
      if(ydn.db.crud.req.IndexedDb.DEBUG) {
        window.console.log([n_done, event])
      }
      if(n_done == n_todo) {
        df(request.error, true)
      }
    }
  }
};
ydn.db.crud.req.IndexedDb.prototype.listByKeyRange_ = function(tx, tx_no, df, store_name, index, key_range, reverse, limit, offset, opt_unique) {
  var me = this;
  var results = [];
  var store = tx.objectStore(store_name);
  var dir = ydn.db.base.getDirection(reverse, opt_unique);
  var msg = tx_no + " listByKeyRange: " + store_name + (index ? ":" + index : "") + (key_range ? ydn.json.stringify(key_range) : "");
  if(reverse) {
    msg += " reverse"
  }
  if(opt_unique) {
    msg += " unique"
  }
  this.logger.finest(msg);
  var request;
  if(index) {
    request = store.index(index).openCursor(key_range, dir)
  }else {
    request = store.openCursor(key_range, dir)
  }
  var cued = false;
  request.onsuccess = function(event) {
    var cursor = event.target.result;
    if(cursor) {
      if(!cued && offset > 0) {
        cued = true;
        cursor.advance(offset);
        return
      }
      results.push(cursor.value);
      if(results.length < limit) {
        cursor["continue"]()
      }else {
        me.logger.finest("success " + msg);
        df(results)
      }
    }else {
      df(results)
    }
  };
  request.onerror = function(event) {
    if(ydn.db.crud.req.IndexedDb.DEBUG) {
      window.console.log([store_name, event])
    }
    df(request.error, true)
  }
};
ydn.db.crud.req.IndexedDb.prototype.listByKeyRange = function(tx, tx_no, df, store_name, key_range, reverse, limit, offset) {
  this.listByKeyRange_(tx, tx_no, df, store_name, null, key_range, reverse, limit, offset)
};
ydn.db.crud.req.IndexedDb.prototype.listByIndexKeyRange = function(tx, tx_no, df, store_name, index, key_range, reverse, limit, offset, unique) {
  this.listByKeyRange_(tx, tx_no, df, store_name, index, key_range, reverse, limit, offset, unique)
};
ydn.db.crud.req.IndexedDb.prototype.keysByKeyRange = function(tx, tx_no, df, store_name, key_range, reverse, limit, offset) {
  var results = [];
  var me = this;
  var store = tx.objectStore(store_name);
  var dir = ydn.db.base.getDirection(reverse);
  var msg = tx_no + " keysByKeyRange: " + store_name + " " + key_range;
  this.logger.finest(msg);
  var request = store.openCursor(key_range, dir);
  var cued = false;
  request.onsuccess = function(event) {
    var cursor = event.target.result;
    if(cursor) {
      if(!cued && offset > 0) {
        cued = true;
        cursor.advance(offset);
        return
      }
      results.push(cursor.key);
      if(results.length < limit) {
        cursor["continue"]()
      }else {
        df(results)
      }
    }else {
      df(results)
    }
  };
  request.onerror = function(event) {
    if(ydn.db.crud.req.IndexedDb.DEBUG) {
      window.console.log([store_name, event])
    }
    df(request.error, true)
  }
};
ydn.db.crud.req.IndexedDb.prototype.keysByIndexKeyRange = function(tx, lbl, df, store_name, index_name, key_range, reverse, limit, offset, unique) {
  var results = [];
  var me = this;
  var store = tx.objectStore(store_name);
  var index = store.index(index_name);
  var msg = lbl + " keysByStore: " + store_name + ":" + index_name + " " + key_range;
  this.logger.finest(msg);
  var dir = ydn.db.base.getDirection(reverse, unique);
  var request = index.openKeyCursor(key_range, dir);
  var cued = false;
  request.onsuccess = function(event) {
    var cursor = event.target.result;
    if(cursor) {
      if(!cued && offset > 0) {
        cued = true;
        cursor.advance(offset);
        return
      }
      results.push(cursor.primaryKey);
      if(results.length < limit) {
        cursor["continue"]()
      }
    }else {
      df(results)
    }
  };
  request.onerror = function(event) {
    if(ydn.db.crud.req.IndexedDb.DEBUG) {
      window.console.log([store_name, event])
    }
    df(request.error, true)
  }
};
ydn.db.crud.req.IndexedDb.prototype.listByStore = function(tx, tx_no, df, store_name) {
  var me = this;
  var results = [];
  var msg = tx_no + " listByStore: " + store_name;
  this.logger.finest(msg);
  var store = tx.objectStore(store_name);
  var request = store.openCursor();
  request.onsuccess = function(event) {
    var cursor = event.target.result;
    if(cursor) {
      results.push(cursor["value"]);
      cursor["continue"]()
    }else {
      df(results)
    }
  };
  request.onerror = function(event) {
    if(ydn.db.crud.req.IndexedDb.DEBUG) {
      window.console.log([store_name, event])
    }
    df(request.error, true)
  }
};
ydn.db.crud.req.IndexedDb.prototype.getById = function(tx, tx_no, df, store_name, id) {
  var me = this;
  var msg = tx_no + " getById: " + store_name + ":" + id;
  this.logger.finest(msg);
  var store = tx.objectStore(store_name);
  var request = store.get(id);
  request.onsuccess = function(event) {
    if(ydn.db.crud.req.IndexedDb.DEBUG) {
      window.console.log([store_name, id, event])
    }
    df(event.target.result)
  };
  request.onerror = function(event) {
    if(ydn.db.crud.req.IndexedDb.DEBUG) {
      window.console.log([store_name, id, event])
    }
    df(request.error, true)
  }
};
ydn.db.crud.req.IndexedDb.prototype.listByIds = function(tx, tx_no, df, store_name, ids) {
  var me = this;
  var results = [];
  var result_count = 0;
  var store = tx.objectStore(store_name);
  var n = ids.length;
  var msg = tx_no + " listByIds: " + store_name + ":" + n + " ids";
  this.logger.finest(msg);
  var get = function(i) {
    if(!goog.isDefAndNotNull(ids[i])) {
      result_count++;
      results[i] = undefined;
      if(result_count == n) {
        df(results)
      }else {
        var next = i + ydn.db.crud.req.IndexedDb.REQ_PER_TX;
        if(next < n) {
          get(next)
        }
      }
    }
    var request;
    try {
      request = store.get(ids[i])
    }catch(e) {
      if(e.name == "DataError") {
        if(ydn.db.crud.req.IndexedDb.DEBUG) {
          window.console.log([store_name, i, ids[i], e])
        }
        throw new ydn.db.InvalidKeyException(ids[i]);
      }else {
        throw e;
      }
    }
    request.onsuccess = function(event) {
      result_count++;
      if(ydn.db.crud.req.IndexedDb.DEBUG) {
        window.console.log([store_name, ids, i, event])
      }
      results[i] = event.target.result;
      if(result_count == n) {
        df(results)
      }else {
        var next = i + ydn.db.crud.req.IndexedDb.REQ_PER_TX;
        if(next < n) {
          get(next)
        }
      }
    };
    request.onerror = function(event) {
      result_count++;
      if(ydn.db.crud.req.IndexedDb.DEBUG) {
        window.console.log([store_name, ids, i, event])
      }
      df(request.error, true)
    }
  };
  if(n > 0) {
    for(var i = 0;i < ydn.db.crud.req.IndexedDb.REQ_PER_TX && i < n;i++) {
      get(i)
    }
  }else {
    df([])
  }
};
ydn.db.crud.req.IndexedDb.prototype.listByKeys = function(tx, tx_no, df, keys) {
  var me = this;
  var results = [];
  var result_count = 0;
  var msg = tx_no + " listByKeys: " + keys.length + " ids";
  this.logger.finest(msg);
  var getKey = function(i) {
    var key = keys[i];
    var store = tx.objectStore(key.getStoreName());
    var request = store.get(key.getId());
    request.onsuccess = function(event) {
      result_count++;
      if(ydn.db.crud.req.IndexedDb.DEBUG) {
        window.console.log(event)
      }
      results[i] = event.target.result;
      if(result_count == keys.length) {
        df(results)
      }else {
        var next = i + ydn.db.crud.req.IndexedDb.REQ_PER_TX;
        if(next < keys.length) {
          getKey(next)
        }
      }
    };
    request.onerror = function(event) {
      result_count++;
      if(ydn.db.crud.req.IndexedDb.DEBUG) {
        window.console.log([keys, event])
      }
      df(request.error, true)
    }
  };
  if(keys.length > 0) {
    for(var i = 0;i < ydn.db.crud.req.IndexedDb.REQ_PER_TX && i < keys.length;i++) {
      getKey(i)
    }
  }else {
    df([])
  }
};
ydn.db.crud.req.IndexedDb.prototype.countKeyRange = function(tx, tx_no, df, table, keyRange, index_name) {
  var me = this;
  var store = tx.objectStore(table);
  var msg = tx_no + " countKeyRange: " + table + (index_name ? ":" + index_name : "") + (keyRange ? ":" + ydn.json.stringify(keyRange) : "");
  this.logger.finest(msg);
  var request;
  if(goog.isDefAndNotNull(index_name)) {
    var index = store.index(index_name);
    if(goog.isDefAndNotNull(keyRange)) {
      request = index.count(keyRange)
    }else {
      request = index.count()
    }
  }else {
    if(goog.isDefAndNotNull(keyRange)) {
      request = store.count(keyRange)
    }else {
      request = store.count()
    }
  }
  request.onsuccess = function(event) {
    if(ydn.db.crud.req.IndexedDb.DEBUG) {
      window.console.log(event)
    }
    df(event.target.result)
  };
  request.onerror = function(event) {
    if(ydn.db.crud.req.IndexedDb.DEBUG) {
      window.console.log(event)
    }
    df(request.error, true)
  }
};
goog.provide("ydn.db.core.req.IndexedDb");
goog.require("ydn.db.algo.AbstractSolver");
goog.require("ydn.db.core.req.IDBCursor");
goog.require("ydn.db.core.req.IRequestExecutor");
goog.require("ydn.db.crud.req.IndexedDb");
goog.require("ydn.error");
goog.require("ydn.json");
ydn.db.core.req.IndexedDb = function(dbname, schema) {
  goog.base(this, dbname, schema)
};
goog.inherits(ydn.db.core.req.IndexedDb, ydn.db.crud.req.IndexedDb);
ydn.db.core.req.IndexedDb.DEBUG = false;
ydn.db.core.req.IndexedDb.prototype.logger = goog.debug.Logger.getLogger("ydn.db.core.req.IndexedDb");
ydn.db.core.req.IndexedDb.prototype.keysByIterator = function(tx, tx_no, df, iter, limit, offset) {
  this.iterate_(ydn.db.schema.Store.QueryMethod.KEYS, tx, tx_no, df, iter, limit, offset)
};
ydn.db.core.req.IndexedDb.prototype.iterate_ = function(mth, tx, tx_no, df, iter, opt_limit, opt_offset) {
  var arr = [];
  var is_keys = mth == ydn.db.schema.Store.QueryMethod.KEYS;
  var q = is_keys ? "keys" : mth == ydn.db.schema.Store.QueryMethod.VALUES ? "values" : mth == ydn.db.schema.Store.QueryMethod.COUNT ? "count" : "";
  var msg = tx_no + " " + q + "ByIterator " + iter;
  if(opt_limit > 0) {
    msg += " limit " + opt_limit
  }
  var me = this;
  this.logger.finer(msg);
  var cursor = iter.iterate(tx, tx_no, this, mth);
  cursor.onFail = function(e) {
    me.logger.finer("error:" + msg);
    cursor.exit();
    df(e, true)
  };
  var count = 0;
  var cued = false;
  var displayed = false;
  cursor.onNext = function(opt_key) {
    if(!displayed) {
      me.logger.finest(msg + " starting");
      displayed = true
    }
    if(goog.isDefAndNotNull(opt_key)) {
      var primary_key = iter.isIndexIterator() ? cursor.getPrimaryKey() : opt_key;
      if(!cued && opt_offset > 0) {
        cursor.advance(opt_offset);
        cued = true;
        return
      }
      count++;
      if(is_keys) {
        arr.push(opt_key)
      }else {
        arr.push(iter.isKeyIterator() ? primary_key : cursor.getValue())
      }
      if(!goog.isDef(opt_limit) || count < opt_limit) {
        cursor.continueEffectiveKey()
      }else {
        me.logger.finer("success:" + msg + " " + arr.length + " records");
        cursor.exit();
        df(arr)
      }
    }else {
      me.logger.finer("success:" + msg + " " + arr.length + " records");
      cursor.exit();
      df(arr)
    }
  }
};
ydn.db.core.req.IndexedDb.prototype.listByIterator = function(tx, tx_no, df, iter, limit, offset) {
  this.iterate_(ydn.db.schema.Store.QueryMethod.VALUES, tx, tx_no, df, iter, limit, offset)
};
ydn.db.core.req.IndexedDb.prototype.getCursor = function(tx, tx_no, store_name, index_name, keyRange, direction, key_only, key_query) {
  var store = this.schema.getStore(store_name);
  goog.asserts.assertObject(store, 'store "' + store_name + '" not found.');
  if(goog.isDef(index_name)) {
    index_name = this.getIndexName(store, index_name)
  }
  return new ydn.db.core.req.IDBCursor(tx, tx_no, store_name, index_name, keyRange, direction, key_only, key_query)
};
ydn.db.core.req.IndexedDb.prototype.getStreamer = function(tx, tx_no, store_name, index_name) {
  return new ydn.db.Streamer(tx, store_name, index_name)
};
goog.provide("ydn.db.base.Mutex");
ydn.db.base.Mutex = function() {
  this.state_ = false
};
ydn.db.base.Mutex.prototype.state_ = false;
ydn.db.base.Mutex.prototype.up = function() {
  goog.asserts.assert(!this.state_);
  this.state_ = true
};
ydn.db.base.Mutex.prototype.down = function() {
  goog.asserts.assert(this.state_);
  this.state_ = false
};
ydn.db.base.Mutex.prototype.state = function() {
  return this.state_
};
goog.provide("ydn.db.core.req.SimpleCursor");
goog.require("goog.Timer");
goog.require("ydn.db.base.Mutex");
goog.require("ydn.db.core.req.AbstractCursor");
goog.require("ydn.db.core.req.ICursor");
ydn.db.core.req.SimpleCursor = function(tx, tx_no, store_schema, store_name, index_name, keyRange, direction, key_only, q_mth) {
  goog.base(this, tx, tx_no, store_name, index_name, keyRange, direction, key_only, q_mth);
  goog.asserts.assert(store_schema);
  this.store_schema_ = store_schema;
  this.key_ = undefined;
  this.primary_key_ = undefined;
  this.value_ = undefined;
  this.current_ = null;
  this.buffer_ = null;
  this.store_ = null;
  this.onCursorComplete_ = null;
  this.result_ready_ = new ydn.db.base.Mutex
};
goog.inherits(ydn.db.core.req.SimpleCursor, ydn.db.core.req.AbstractCursor);
ydn.db.core.req.SimpleCursor.DEBUG = false;
ydn.db.core.req.SimpleCursor.prototype.buffer_;
ydn.db.core.req.SimpleCursor.prototype.store_;
ydn.db.core.req.SimpleCursor.prototype.logger = goog.debug.Logger.getLogger("ydn.db.core.req.SimpleCursor");
ydn.db.core.req.SimpleCursor.prototype.store_schema_;
ydn.db.core.req.SimpleCursor.prototype.key_;
ydn.db.core.req.SimpleCursor.prototype.primary_key_;
ydn.db.core.req.SimpleCursor.prototype.value_;
ydn.db.core.req.SimpleCursor.prototype.current_;
ydn.db.core.req.SimpleCursor.prototype.hasCursor = function() {
  return this.isActive()
};
ydn.db.core.req.SimpleCursor.prototype.update = function(obj) {
  throw new ydn.debug.error.NotImplementedException;
};
ydn.db.core.req.SimpleCursor.prototype.advance = function(step) {
  var me = this;
  var cnt = this.current_ ? -1 : 0;
  if(ydn.db.core.req.SimpleCursor.DEBUG) {
    var msg = this.current_ ? " advancing " : " starting ";
    window.console.log(this + msg + step + " step")
  }
  var tr_fn = function(node) {
    cnt++;
    if(!node || cnt >= step) {
      if(ydn.db.core.req.SimpleCursor.DEBUG) {
        window.console.log("advance to " + (node ? node.value : "null"))
      }
      return me.defaultOnSuccess_(node)
    }
  };
  if(this.reverse) {
    this.buffer_.reverseTraverse(tr_fn, this.current_)
  }else {
    this.buffer_.traverse(tr_fn, this.current_)
  }
};
ydn.db.core.req.SimpleCursor.prototype.continueEffectiveKey = function(key) {
  if(goog.isDefAndNotNull(key)) {
    var me = this;
    var start_node = new ydn.db.con.simple.Node(key);
    var tr_fn = function(node) {
      me.current_ = node;
      if(!node) {
        return me.defaultOnSuccess_(node)
      }
      var x = (node.value);
      var e_key = x.getKey();
      var cmp = ydn.db.cmp(e_key, key);
      if(me.reverse) {
        if(cmp != 1) {
          return me.defaultOnSuccess_(node)
        }
      }else {
        if(cmp != -1) {
          return me.defaultOnSuccess_(node)
        }
      }
    };
    if(this.reverse) {
      this.buffer_.reverseTraverse(tr_fn, start_node)
    }else {
      this.buffer_.traverse(tr_fn, start_node)
    }
  }else {
    this.advance(1)
  }
};
ydn.db.core.req.SimpleCursor.prototype.result_ready_;
ydn.db.core.req.SimpleCursor.prototype.dispatchOnSuccess_ = function() {
  var me = this;
  goog.Timer.callOnce(function() {
    if(me.result_ready_.state()) {
      if(ydn.db.core.req.SimpleCursor.DEBUG) {
        window.console.log(this + " invoke success " + this.key_)
      }
      me.result_ready_.down();
      this.onSuccess(this.key_, this.primary_key_, this.value_);
      this.dispatchOnSuccess_()
    }else {
      if(ydn.db.core.req.SimpleCursor.DEBUG) {
        window.console.log(this + " complete")
      }
      this.onCursorComplete_();
      this.onCursorComplete_ = null
    }
  }, 0, this)
};
ydn.db.core.req.SimpleCursor.prototype.defaultOnSuccess_ = function(node) {
  this.current_ = node;
  if(node) {
    var x = (node.value);
    if(this.key_range) {
      if(!this.reverse && goog.isDefAndNotNull(this.key_range.upper)) {
        var cmp = ydn.db.cmp(x.getKey(), this.key_range.upper);
        if(cmp == 1 || cmp == 0 && this.key_range.upperOpen) {
          this.current_ = null
        }
      }else {
        if(this.reverse && goog.isDefAndNotNull(this.key_range.lower)) {
          var cmp = ydn.db.cmp(x.getKey(), this.key_range.lower);
          if(cmp == -1 || cmp == 0 && this.key_range.lowerOpen) {
            this.current_ = null
          }
        }
      }
    }
    if(this.current_) {
      if(this.unique && goog.isDefAndNotNull(this.key_) && goog.isDefAndNotNull(x.getKey())) {
        if(ydn.db.cmp(this.key_, x.getKey()) == 0) {
          return
        }
      }
      this.key_ = x.getKey();
      this.primary_key_ = this.is_index ? x.getPrimaryKey() : this.key_;
      if(this.query_method == ydn.db.schema.Store.QueryMethod.VALUES) {
        if(!this.isValueCursor()) {
          this.value_ = this.primary_key_
        }else {
          goog.asserts.assert(goog.isDefAndNotNull(this.primary_key_));
          this.value_ = this.store_.getRecord(null, this.primary_key_)
        }
      }
    }
  }
  if(!this.current_) {
    this.key_ = undefined;
    this.primary_key_ = undefined;
    this.value_ = undefined
  }
  this.result_ready_.up();
  if(ydn.db.core.req.SimpleCursor.DEBUG) {
    var key_str = this.key_ + (this.is_index ? ", " + this.primary_key_ : "");
    window.console.log(this + " new position " + key_str + " " + this.result_ready_)
  }
  return true
};
ydn.db.core.req.SimpleCursor.prototype.onCursorComplete_;
ydn.db.core.req.SimpleCursor.prototype.openCursor = function(opt_key, opt_primary_key) {
  var start_node = null;
  if(this.key_range) {
    if(this.reverse) {
      if(goog.isDefAndNotNull(this.key_range.upper)) {
        start_node = new ydn.db.con.simple.Node((this.key_range.upper))
      }
    }else {
      if(goog.isDefAndNotNull(this.key_range.lower)) {
        start_node = new ydn.db.con.simple.Node((this.key_range.lower))
      }
    }
  }
  if(goog.isDefAndNotNull(opt_key)) {
    if(this.isIndexCursor()) {
      start_node = new ydn.db.con.simple.Node(opt_key, opt_primary_key)
    }else {
      start_node = new ydn.db.con.simple.Node(opt_key)
    }
  }
  this.onCursorComplete_ = this.tx.getStorage(function(storage) {
    var skip_lower_bound_check = goog.isDefAndNotNull(opt_key) || !this.key_range;
    var onSuccess = function(node) {
      var x = (node.value);
      var key = x.getKey();
      if(node && goog.isDefAndNotNull(key)) {
        if(goog.isDefAndNotNull(opt_key)) {
          if(goog.isDefAndNotNull(opt_primary_key)) {
            var p_key = x.getPrimaryKey();
            if(goog.isDefAndNotNull(p_key) && ydn.db.cmp(opt_key, key) == 0 && ydn.db.cmp(opt_primary_key, p_key) == 0) {
              return
            }
          }else {
            if(ydn.db.cmp(opt_key, key) == 0) {
              return
            }
          }
        }else {
          if(this.key_range) {
            if(!this.reverse && this.key_range.lowerOpen && goog.isDefAndNotNull(this.key_range.lower)) {
              var cmp = ydn.db.cmp(key, this.key_range.lower);
              if(cmp == 0) {
                return
              }
            }
            if(this.reverse && this.key_range.upperOpen && goog.isDefAndNotNull(this.key_range.upper)) {
              var cmp = ydn.db.cmp(key, this.key_range.upper);
              if(cmp == 0) {
                return
              }
            }
          }
        }
      }
      return this.defaultOnSuccess_(node)
    };
    this.store_ = storage.getSimpleStore(this.store_name);
    this.buffer_ = this.store_.getIndexCache(this.index_name);
    if(this.reverse) {
      this.buffer_.reverseTraverse(goog.bind(onSuccess, this), start_node)
    }else {
      this.buffer_.traverse(goog.bind(onSuccess, this), start_node)
    }
    this.dispatchOnSuccess_()
  }, this)
};
ydn.db.core.req.SimpleCursor.prototype.clear = function() {
  throw new ydn.debug.error.NotImplementedException;
};
ydn.db.core.req.SimpleCursor.prototype.restart = function(effective_key, primary_key) {
  throw new ydn.debug.error.NotImplementedException;
};
ydn.db.core.req.SimpleCursor.prototype.continuePrimaryKey = function(key) {
  throw new ydn.debug.error.NotImplementedException;
};
if(goog.DEBUG) {
  ydn.db.core.req.SimpleCursor.prototype.toString = function() {
    return"Simple" + goog.base(this, "toString")
  }
}
;goog.provide("ydn.db.crud.req.SimpleStore");
goog.require("goog.Timer");
goog.require("goog.asserts");
goog.require("goog.async.Deferred");
goog.require("ydn.db.ConstraintError");
goog.require("ydn.db.crud.req.IRequestExecutor");
goog.require("ydn.db.crud.req.RequestExecutor");
ydn.db.crud.req.SimpleStore = function(dbname, schema) {
  goog.base(this, dbname, schema)
};
goog.inherits(ydn.db.crud.req.SimpleStore, ydn.db.crud.req.RequestExecutor);
ydn.db.crud.req.SimpleStore.prototype.logger = goog.debug.Logger.getLogger("ydn.db.crud.req.SimpleStore");
ydn.db.crud.req.SimpleStore.SYNC = true;
ydn.db.crud.req.SimpleStore.DEBUG = false;
ydn.db.crud.req.SimpleStore.prototype.keysByIndexKeyRange = function(tx, tx_no, df, store_name, index_name, key_range, reverse, limit, offset) {
  var msg = tx_no + " keysByIndexKeyRange " + store_name + ":" + index_name + " " + (key_range ? ydn.json.toShortString(key_range) : "");
  this.logger.finest(msg);
  var on_complete = tx.getStorage(function(storage) {
    var store = storage.getSimpleStore(store_name);
    var arr = store.getKeys(index_name, key_range, reverse, limit, offset);
    this.logger.finer("success " + msg);
    df(arr);
    on_complete();
    on_complete = null
  }, this)
};
ydn.db.crud.req.SimpleStore.prototype.keysByKeyRange = function(tx, tx_no, df, store_name, key_range, reverse, limit, offset) {
  var msg = tx_no + " keysByKeyRange " + store_name + " " + (key_range ? ydn.json.toShortString(key_range) : "");
  this.logger.finest(msg);
  var comp = tx.getStorage(function(storage) {
    var store = storage.getSimpleStore(store_name);
    var arr = store.getKeys(null, key_range, reverse, limit, offset);
    this.logger.finer("success " + msg);
    df(arr);
    comp();
    comp = null
  }, this)
};
ydn.db.crud.req.SimpleStore.prototype.putByKeys = function(tx, tx_no, df, objs, keys) {
  this.insertRecord_(tx, tx_no, df, null, objs, keys, true, false)
};
ydn.db.crud.req.SimpleStore.prototype.insertRecord_ = function(tx, tx_no, df, store_name, value, opt_key, opt_is_update, opt_single) {
  var label = tx_no + " " + (opt_is_update ? "put" : "add") + "Object" + (opt_single ? "" : "s " + value.length + " objects");
  this.logger.finest(label);
  var me = this;
  var on_comp = tx.getStorage(function(storage) {
    var store;
    if(opt_single) {
      store = storage.getSimpleStore(store_name);
      var key = store.addRecord(opt_key, value, !opt_is_update);
      if(goog.isDefAndNotNull(key)) {
        df(key)
      }else {
        var msg = goog.DEBUG ? ydn.json.toShortString(key) : "";
        var e = new ydn.db.ConstraintError(msg);
        df(e, true)
      }
    }else {
      var st = store_name;
      var arr = [];
      var has_error = false;
      var keys = opt_key || {};
      for(var i = 0;i < value.length;i++) {
        var id;
        if(!store_name) {
          var db_key = opt_key[i];
          id = db_key.getId();
          st = db_key.getStoreName()
        }else {
          id = keys[i]
        }
        if(!store || store.getName() != st) {
          store = storage.getSimpleStore(st)
        }
        var result_key = store.addRecord(id, value[i], !opt_is_update);
        if(!goog.isDefAndNotNull(result_key)) {
          has_error = true
        }
        arr.push(result_key)
      }
      me.logger.finer((has_error ? "error " : "success ") + label);
      df(arr, has_error)
    }
    on_comp();
    on_comp = null
  }, this)
};
ydn.db.crud.req.SimpleStore.prototype.addObject = function(tx, tx_no, df, store_name, value, opt_key) {
  this.insertRecord_(tx, tx_no, df, store_name, value, opt_key, false, true)
};
ydn.db.crud.req.SimpleStore.prototype.putObject = function(tx, tx_no, df, store_name, value, opt_key) {
  this.insertRecord_(tx, tx_no, df, store_name, value, opt_key, true, true)
};
ydn.db.crud.req.SimpleStore.prototype.addObjects = function(tx, tx_no, df, store_name, value, opt_key) {
  this.insertRecord_(tx, tx_no, df, store_name, value, opt_key, false, false)
};
ydn.db.crud.req.SimpleStore.prototype.putData = function(tx, tx_no, df, store_name, data, delimiter) {
  throw"not impl";
};
ydn.db.crud.req.SimpleStore.prototype.putObjects = function(tx, tx_no, df, store_name, value, opt_key) {
  this.insertRecord_(tx, tx_no, df, store_name, value, opt_key, true, false)
};
ydn.db.crud.req.SimpleStore.prototype.getById = function(tx, tx_no, df, store_name, id) {
  var onComp = tx.getStorage(function(storage) {
    var store = storage.getSimpleStore(store_name);
    var key = store.getRecord(null, id);
    df(key);
    onComp();
    onComp = null
  }, this)
};
ydn.db.crud.req.SimpleStore.prototype.listByStore = function(tx, tx_no, df, store_name) {
  var onComp = tx.getStorage(function(storage) {
    var store = storage.getSimpleStore(store_name);
    df(store.getRecords());
    onComp();
    onComp = null
  }, this)
};
ydn.db.crud.req.SimpleStore.prototype.listByIds_ = function(tx, tx_no, df, store_name, ids) {
  var onComp = tx.getStorage(function(storage) {
    var arr = [];
    var has_error = false;
    var st = store_name;
    var store;
    for(var i = 0;i < ids.length;i++) {
      var id = ids[i];
      if(id instanceof ydn.db.Key) {
        var db_key = id;
        id = db_key.getId();
        st = db_key.getStoreName()
      }
      if(!store || store.getName() != st) {
        store = storage.getSimpleStore(st)
      }
      var key = store.getRecord(null, id);
      if(!goog.isDefAndNotNull(key)) {
        has_error = true
      }
      arr.push(key)
    }
    df(arr, has_error);
    onComp();
    onComp = null
  }, this)
};
ydn.db.crud.req.SimpleStore.prototype.listByIds = function(tx, tx_no, df, store_name, ids) {
  this.listByIds_(tx, tx_no, df, store_name, ids)
};
ydn.db.crud.req.SimpleStore.prototype.listByKeys = function(tx, tx_no, df, keys) {
  this.listByIds_(tx, tx_no, df, null, keys)
};
ydn.db.crud.req.SimpleStore.prototype.listByKeyRange = function(tx, tx_no, df, store_name, key_range, reverse, limit, offset) {
  var msg = tx_no + " listByKeyRange " + store_name + " " + (key_range ? ydn.json.toShortString(key_range) : "");
  this.logger.finest(msg);
  var onComp = tx.getStorage(function(storage) {
    var store = storage.getSimpleStore(store_name);
    var results = store.getRecords(null, key_range, reverse, limit, offset);
    this.logger.finer(msg + " " + results.length + " records found.");
    df(results);
    onComp();
    onComp = null
  }, this)
};
ydn.db.crud.req.SimpleStore.prototype.listByIndexKeyRange = function(tx, tx_no, df, store_name, index, key_range, reverse, limit, offset, unique) {
  var msg = tx_no + " listByIndexKeyRange " + store_name + " " + (key_range ? ydn.json.toShortString(key_range) : "");
  this.logger.finest(msg);
  var onComp = tx.getStorage(function(storage) {
    var store = storage.getSimpleStore(store_name);
    var results = store.getItems(false, true, index, key_range, reverse, limit, offset, unique);
    this.logger.finer(msg + " " + results.length + " records found.");
    df(results);
    onComp();
    onComp = null
  }, this)
};
ydn.db.crud.req.SimpleStore.prototype.removeById = function(tx, tx_no, df, store_name, id) {
  var msg = tx_no + " removeById " + store_name + " " + id;
  this.logger.finest(msg);
  var me = this;
  var onComp = tx.getStorage(function(storage) {
    var store = storage.getSimpleStore(store_name);
    var cnt = store.removeRecord(id);
    me.logger.finer("success " + msg + (cnt == 0 ? " [not found]" : ""));
    df(cnt);
    onComp();
    onComp = null
  }, this)
};
ydn.db.crud.req.SimpleStore.prototype.removeByKeys = function(tx, tx_no, df, keys) {
  var msg = tx_no + " removeByKeys " + keys.length + " keys";
  this.logger.finest(msg);
  var me = this;
  var store;
  var deleted = 0;
  var onComp = tx.getStorage(function(storage) {
    for(var i = 0;i < keys.length;i++) {
      var store_name = keys[i].getStoreName();
      var id = keys[i].getId();
      if(!store || store.getName() != store_name) {
        store = storage.getSimpleStore(store_name)
      }
      deleted += store.removeRecord(id)
    }
    me.logger.finer("success " + msg + deleted + " deleted");
    df(deleted);
    onComp();
    onComp = null
  }, this)
};
ydn.db.crud.req.SimpleStore.prototype.clearByKeyRange = function(tx, tx_no, df, store_name, key_range) {
  this.removeByKeyRange(tx, tx_no, df, store_name, key_range)
};
ydn.db.crud.req.SimpleStore.prototype.removeByKeyRange = function(tx, tx_no, df, store_name, key_range) {
  var msg = tx_no + " removeByKeyRange " + (key_range ? ydn.json.stringify(key_range) : "");
  this.logger.finest(msg);
  var me = this;
  var onComp = tx.getStorage(function(storage) {
    var store = storage.getSimpleStore(store_name);
    var cnt = store.removeRecords(key_range);
    me.logger.finer(msg + " deleted " + cnt + " records.");
    df(cnt);
    onComp();
    onComp = null
  }, this)
};
ydn.db.crud.req.SimpleStore.prototype.removeByIndexKeyRange = function(tx, tx_no, df, store_name, index_name, key_range) {
  var msg = tx_no + " removeByIndexKeyRange " + (key_range ? ydn.json.stringify(key_range) : "");
  this.logger.finest(msg);
  var me = this;
  var onComp = tx.getStorage(function(storage) {
    var store = storage.getSimpleStore(store_name);
    var keys = store.getKeys(index_name, key_range);
    var cnt = keys.length;
    for(var i = 0;i < cnt;i++) {
      store.removeRecord(keys[i])
    }
    me.logger.finer(msg + " deleted " + cnt + " records.");
    df(cnt);
    onComp();
    onComp = null
  }, this)
};
ydn.db.crud.req.SimpleStore.prototype.clearByStores = function(tx, tx_no, df, store_names) {
  var msg = tx_no + " clearByStores";
  this.logger.finest(msg);
  var onComp = tx.getStorage(function(storage) {
    for(var i = 0;i < store_names.length;i++) {
      var store = storage.getSimpleStore(store_names[i]);
      store.clear()
    }
    this.logger.finer("success " + msg);
    df(store_names.length);
    onComp();
    onComp = null
  }, this)
};
ydn.db.crud.req.SimpleStore.prototype.countStores = function(tx, tx_no, df, store_names) {
  var msg = tx_no + " countStores";
  this.logger.finest(msg);
  var onComp = tx.getStorage(function(storage) {
    var arr = [];
    for(var i = 0;i < store_names.length;i++) {
      var store = storage.getSimpleStore(store_names[i]);
      arr.push(store.countRecords())
    }
    this.logger.finer("success " + msg);
    df(arr);
    onComp();
    onComp = null
  }, this)
};
ydn.db.crud.req.SimpleStore.prototype.countKeyRange = function(tx, tx_no, df, store_name, keyRange, index_name) {
  var msg = tx_no + " count" + (goog.isDefAndNotNull(index_name) ? "Index" : "") + (goog.isDefAndNotNull(keyRange) ? "KeyRange" : "Store");
  var me = this;
  this.logger.finest(msg);
  var onComp = tx.getStorage(function(storage) {
    var store = storage.getSimpleStore(store_name);
    var no = store.countRecords(index_name, keyRange);
    this.logger.finer("success " + msg);
    df(no);
    onComp();
    onComp = null
  }, this)
};
goog.provide("ydn.db.core.req.SimpleStore");
goog.require("ydn.db.core.req.IRequestExecutor");
goog.require("ydn.db.core.req.SimpleCursor");
goog.require("ydn.db.crud.req.SimpleStore");
ydn.db.core.req.SimpleStore = function(dbname, schema) {
  goog.base(this, dbname, schema)
};
goog.inherits(ydn.db.core.req.SimpleStore, ydn.db.crud.req.SimpleStore);
ydn.db.core.req.SimpleStore.DEBUG = false;
ydn.db.core.req.SimpleStore.prototype.keysByIterator = function(tx, tx_no, df, iter, limit, offset) {
  var arr = [];
  var msg = tx_no + " keysByIterator:" + iter;
  var me = this;
  this.logger.finest(msg);
  var cursor = iter.iterate(tx, tx_no, this);
  cursor.onFail = function(e) {
    me.logger.warning("error:" + msg);
    df(e, true)
  };
  var count = 0;
  var cued = false;
  cursor.onNext = function(opt_key) {
    if(ydn.db.core.req.SimpleStore.DEBUG) {
      window.console.log("receiving keysByIterator onNext: " + opt_key)
    }
    if(goog.isDefAndNotNull(opt_key)) {
      if(!cued && offset > 0) {
        cursor.advance(offset);
        cued = true;
        return
      }
      count++;
      arr.push(opt_key);
      if(!goog.isDef(limit) || count < limit) {
        cursor.advance(1)
      }else {
        cursor.exit();
        me.logger.finest("success:" + msg);
        df(arr)
      }
    }else {
      cursor.exit();
      me.logger.finest("success:" + msg);
      df(arr)
    }
  }
};
ydn.db.core.req.SimpleStore.prototype.listByIterator = function(tx, tx_no, df, iter, limit, offset) {
  var arr = [];
  var msg = tx_no + " listByIterator" + iter;
  var me = this;
  this.logger.finest(msg);
  var cursor = iter.iterate(tx, tx_no, this);
  cursor.onFail = function(e) {
    me.logger.finer("error:" + msg);
    cursor.exit();
    df(e, false)
  };
  var count = 0;
  var cued = false;
  cursor.onNext = function(opt_key) {
    if(goog.isDefAndNotNull(opt_key)) {
      var primary_key = iter.isIndexIterator() ? cursor.getPrimaryKey() : opt_key;
      var value = cursor.getValue();
      if(!cued && offset > 0) {
        cursor.advance(offset);
        cued = true;
        return
      }
      count++;
      arr.push(iter.isKeyIterator() ? primary_key : value);
      if(!goog.isDef(limit) || count < limit) {
        cursor.advance(1)
      }else {
        me.logger.finer("success:" + msg);
        cursor.exit();
        df(arr)
      }
    }else {
      me.logger.finest("success:" + msg);
      cursor.exit();
      df(arr)
    }
  }
};
ydn.db.core.req.SimpleStore.prototype.getCursor = function(tx, tx_no, store_name, index_name, keyRange, direction, key_only, key_query) {
  var store = this.schema.getStore(store_name);
  goog.asserts.assertObject(store, 'store "' + store_name + '" not found.');
  if(goog.isDef(index_name)) {
    index_name = this.getIndexName(store, index_name)
  }
  return new ydn.db.core.req.SimpleCursor(tx, tx_no, store, store_name, index_name, keyRange, direction, key_only, key_query)
};
ydn.db.core.req.SimpleStore.prototype.getStreamer = function(tx, tx_no, store_name, index_name) {
  throw"not yet";
};
goog.provide("ydn.db.core.req.CachedWebsqlCursor");
goog.require("ydn.db.core.req.AbstractCursor");
goog.require("ydn.db.core.req.ICursor");
ydn.db.core.req.CachedWebsqlCursor = function(tx, tx_no, store_schema, store_name, index_name, keyRange, direction, key_only, key_query) {
  goog.base(this, tx, tx_no, store_name, index_name, keyRange, direction, key_only, key_query);
  goog.asserts.assert(store_schema);
  this.store_schema_ = store_schema;
  this.cursor_ = null;
  this.current_cursor_index_ = NaN
};
goog.inherits(ydn.db.core.req.CachedWebsqlCursor, ydn.db.core.req.AbstractCursor);
ydn.db.core.req.CachedWebsqlCursor.DEBUG = false;
ydn.db.core.req.CachedWebsqlCursor.prototype.logger = goog.debug.Logger.getLogger("ydn.db.core.req.CachedWebsqlCursor");
ydn.db.core.req.CachedWebsqlCursor.prototype.store_schema_;
ydn.db.core.req.CachedWebsqlCursor.prototype.current_key_ = null;
ydn.db.core.req.CachedWebsqlCursor.prototype.current_primary_key_ = null;
ydn.db.core.req.CachedWebsqlCursor.prototype.current_value_ = null;
ydn.db.core.req.CachedWebsqlCursor.prototype.cursor_ = null;
ydn.db.core.req.CachedWebsqlCursor.prototype.current_cursor_index_ = NaN;
ydn.db.core.req.CachedWebsqlCursor.prototype.moveNext_ = function() {
  this.current_cursor_index_++;
  return[this.getPrimaryKey(), this.getIndexKey(), this.getValue()]
};
ydn.db.core.req.CachedWebsqlCursor.prototype.invokeNextSuccess_ = function() {
  var current_values = this.moveNext_();
  if(ydn.db.core.req.CachedWebsqlCursor.DEBUG) {
    window.console.log(["onSuccess", this.current_cursor_index_].concat(current_values))
  }
  var primary_key = current_values[0];
  var index_key = current_values[1];
  var value = current_values[2];
  this.onSuccess(primary_key, index_key, value)
};
ydn.db.core.req.CachedWebsqlCursor.prototype.openCursor = function(ini_key, ini_index_key, exclusive) {
  var me = this;
  var request;
  var sqls = ["SELECT"];
  var params = [];
  var primary_column_name = this.store_schema_.getSQLKeyColumnName();
  var q_primary_column_name = goog.string.quote(primary_column_name);
  var index = !!this.index_name ? this.store_schema_.getIndex(this.index_name) : null;
  var type = index ? index.getType() : this.store_schema_.getType();
  var effective_col_name = index ? index.getSQLIndexColumnName() : primary_column_name;
  var q_effective_col_name = goog.string.quote(effective_col_name);
  var order = " ORDER BY ";
  if(!this.isValueCursor()) {
    if(index) {
      goog.asserts.assertString(effective_col_name);
      sqls.push(goog.string.quote(effective_col_name) + ", " + q_primary_column_name);
      order += this.reverse ? goog.string.quote(effective_col_name) + " DESC, " + q_primary_column_name + " DESC " : goog.string.quote(effective_col_name) + " ASC, " + q_primary_column_name + " ASC "
    }else {
      sqls.push(q_primary_column_name);
      order += q_primary_column_name;
      order += this.reverse ? " DESC" : " ASC"
    }
  }else {
    sqls.push("*");
    if(index) {
      goog.asserts.assertString(effective_col_name);
      order += this.reverse ? goog.string.quote(effective_col_name) + " DESC, " + q_primary_column_name + " DESC " : goog.string.quote(effective_col_name) + " ASC, " + q_primary_column_name + " ASC "
    }else {
      order += q_primary_column_name;
      order += this.reverse ? " DESC" : " ASC"
    }
  }
  sqls.push("FROM " + goog.string.quote(this.store_name));
  var wheres = [];
  var is_multi_entry = !!index && index.isMultiEntry();
  var key_range = this.key_range;
  if(goog.isDefAndNotNull(ini_key)) {
    if(!!this.index_name) {
      goog.asserts.assert(goog.isDefAndNotNull(ini_index_key));
      if(goog.isDefAndNotNull(this.key_range)) {
        var cmp = ydn.db.con.IndexedDb.indexedDb.cmp(ini_index_key, this.key_range.upper);
        if(cmp == 1 || cmp == 0 && !this.key_range.upperOpen) {
          this.onSuccess(undefined, undefined, undefined);
          return
        }
        key_range = ydn.db.IDBKeyRange.bound(ini_index_key, this.key_range.upper, false, this.key_range.upperOpen)
      }else {
        key_range = ydn.db.IDBKeyRange.lowerBound(ini_index_key)
      }
      ydn.db.KeyRange.toSql(q_effective_col_name, type, key_range, wheres, params)
    }else {
      if(this.reverse) {
        key_range = ydn.db.IDBKeyRange.upperBound(ini_key, !!exclusive)
      }else {
        key_range = ydn.db.IDBKeyRange.lowerBound(ini_key, !!exclusive)
      }
      ydn.db.KeyRange.toSql(q_primary_column_name, this.store_schema_.getType(), key_range, wheres, params)
    }
  }else {
    if(!!this.index_name) {
      ydn.db.KeyRange.toSql(q_effective_col_name, type, key_range, wheres, params)
    }else {
      ydn.db.KeyRange.toSql(q_primary_column_name, this.store_schema_.getType(), key_range, wheres, params)
    }
  }
  if(wheres.length > 0) {
    sqls.push("WHERE " + wheres.join(" AND "))
  }
  sqls.push(order);
  var onSuccess = function(transaction, results) {
    if(ydn.db.core.req.CachedWebsqlCursor.DEBUG) {
      window.console.log([sql, results])
    }
    me.has_pending_request = false;
    me.cursor_ = results;
    me.current_cursor_index_ = 0;
    if(!!me.index_name && goog.isDefAndNotNull(ini_key)) {
      var cmp = ydn.db.cmp(me.getPrimaryKey(), ini_key);
      while(cmp == -1 || cmp == 0 && exclusive) {
        me.current_cursor_index_++;
        cmp = ydn.db.cmp(me.getPrimaryKey(), ini_key)
      }
    }
    me.onSuccess(me.getPrimaryKey(), me.getIndexKey(), me.getValue())
  };
  var onError = function(tr, error) {
    if(ydn.db.core.req.CachedWebsqlCursor.DEBUG) {
      window.console.log([sql, tr, error])
    }
    me.has_pending_request = false;
    me.logger.warning("get error: " + error.message);
    me.onError(error);
    return true
  };
  var sql = sqls.join(" ");
  var from = "{" + (!!ini_index_key ? ini_index_key + "-" : "") + (!!ini_key ? ini_key : "") + "}";
  me.logger.finest(this + ": opened: " + from + " SQL: " + sql + " : " + ydn.json.stringify(params));
  this.tx.executeSql(sql, params, onSuccess, onError)
};
ydn.db.core.req.CachedWebsqlCursor.prototype.hasCursor = function() {
  return!!this.cursor_ && this.current_cursor_index_ < this.cursor_.rows.length
};
ydn.db.core.req.CachedWebsqlCursor.prototype.getIndexKey = function() {
  if(this.isIndexCursor()) {
    if(this.current_cursor_index_ < this.cursor_.rows.length) {
      var row = this.cursor_.rows.item(this.current_cursor_index_);
      var index = this.store_schema_.getIndex((this.index_name));
      var type = index.getType();
      return ydn.db.schema.Index.sql2js(row[index.getSQLIndexColumnName()], type)
    }else {
      return undefined
    }
  }else {
    return undefined
  }
};
ydn.db.core.req.CachedWebsqlCursor.prototype.getPrimaryKey = function() {
  if(this.current_cursor_index_ < this.cursor_.rows.length) {
    var primary_column_name = this.store_schema_.getSQLKeyColumnName();
    var row = this.cursor_.rows.item(this.current_cursor_index_);
    return ydn.db.schema.Index.sql2js(row[primary_column_name], this.store_schema_.getType())
  }else {
    return undefined
  }
};
ydn.db.core.req.CachedWebsqlCursor.prototype.getEffectiveKey = function() {
  if(this.isIndexCursor()) {
    return this.getIndexKey()
  }else {
    return this.getPrimaryKey()
  }
};
ydn.db.core.req.CachedWebsqlCursor.prototype.getValue = function() {
  var column_name = this.index_name ? this.index_name : this.store_schema_.getSQLKeyColumnName();
  if(this.current_cursor_index_ < this.cursor_.rows.length) {
    if(!this.isValueCursor()) {
      return this.getPrimaryKey()
    }else {
      var row = this.cursor_.rows.item(this.current_cursor_index_);
      return ydn.db.crud.req.WebSql.parseRow((row), this.store_schema_)
    }
  }else {
    return undefined
  }
};
ydn.db.core.req.CachedWebsqlCursor.prototype.clear = function() {
  if(!this.hasCursor()) {
    throw new ydn.db.InvalidAccessError;
  }
  var df = new goog.async.Deferred;
  var me = this;
  this.has_pending_request = true;
  var onSuccess = function(transaction, results) {
    if(ydn.db.core.req.CachedWebsqlCursor.DEBUG) {
      window.console.log([sql, results])
    }
    me.has_pending_request = false;
    df.callback(results.rowsAffected)
  };
  var onError = function(tr, error) {
    if(ydn.db.core.req.CachedWebsqlCursor.DEBUG) {
      window.console.log([sql, tr, error])
    }
    me.has_pending_request = false;
    me.logger.warning("get error: " + error.message);
    df.errback(error);
    return true
  };
  var primary_column_name = this.store_schema_.getSQLKeyColumnName();
  var sql = "DELETE FROM " + this.store_schema_.getQuotedName() + " WHERE " + primary_column_name + " = ?";
  var params = [this.getPrimaryKey()];
  me.logger.finest(this + ': clear "' + sql + '" : ' + ydn.json.stringify(params));
  this.tx.executeSql(sql, params, onSuccess, onError);
  return df
};
ydn.db.core.req.CachedWebsqlCursor.prototype.update = function(obj) {
  if(!this.hasCursor()) {
    throw new ydn.db.InvalidAccessError;
  }
  var df = new goog.async.Deferred;
  var me = this;
  this.has_pending_request = true;
  var primary_key = (this.getPrimaryKey());
  var onSuccess = function(transaction, results) {
    if(ydn.db.core.req.CachedWebsqlCursor.DEBUG) {
      window.console.log([sql, results])
    }
    me.has_pending_request = false;
    df.callback(primary_key)
  };
  var onError = function(tr, error) {
    if(ydn.db.core.req.CachedWebsqlCursor.DEBUG) {
      window.console.log([sql, tr, error])
    }
    me.has_pending_request = false;
    me.logger.warning("get error: " + error.message);
    df.errback(error);
    return true
  };
  goog.asserts.assertObject(obj);
  var out = me.store_schema_.getIndexedValues(obj, primary_key);
  var sql = "REPLACE INTO " + this.store_schema_.getQuotedName() + " (" + out.columns.join(", ") + ")" + " VALUES (" + out.slots.join(", ") + ")" + " ON CONFLICT FAIL";
  me.logger.finest(this + ': clear "' + sql + '" : ' + ydn.json.stringify(out.values));
  this.tx.executeSql(sql, out.values, onSuccess, onError);
  return df
};
ydn.db.core.req.CachedWebsqlCursor.prototype.restart = function(effective_key, primary_key) {
  this.logger.finest(this + " restarting.");
  this.openCursor(primary_key, effective_key, true)
};
ydn.db.core.req.CachedWebsqlCursor.prototype.advance = function(step) {
  if(!this.hasCursor()) {
    throw new ydn.error.InvalidOperationError(this + " cursor gone.");
  }
  var n = this.cursor_.rows.length;
  this.current_cursor_index_ += step;
  var p_key = this.getPrimaryKey();
  var key = this.getIndexKey();
  var value = this.getValue();
  goog.Timer.callOnce(function() {
    this.onSuccess(p_key, key, value)
  }, 0, this)
};
ydn.db.core.req.CachedWebsqlCursor.prototype.continuePrimaryKey = function(key) {
  if(!this.hasCursor()) {
    throw new ydn.error.InvalidOperationError(this + " cursor gone.");
  }
  var cmp = ydn.db.cmp(key, this.getPrimaryKey());
  if(cmp == 0 || cmp == 1 && this.reverse || cmp == -1 && !this.reverse) {
    throw new ydn.error.InvalidOperationError(this + " wrong direction.");
  }
  var index_position = this.getIndexKey();
  var n = this.cursor_.rows.length;
  for(var i = 0;i < n;i++) {
    if(cmp == 0 || cmp == 1 && this.reverse || cmp == -1 && !this.reverse) {
      this.onSuccess(this.getPrimaryKey(), this.getIndexKey(), this.getValue());
      return
    }
    this.current_cursor_index_++;
    if(index_position && index_position != this.getIndexKey()) {
      this.onSuccess(this.getPrimaryKey(), this.getIndexKey(), this.getValue());
      return
    }
    var eff_key = this.getPrimaryKey();
    cmp = goog.isDefAndNotNull(eff_key) ? ydn.db.cmp(key, eff_key) : 1
  }
  this.onSuccess(undefined, undefined, undefined)
};
ydn.db.core.req.CachedWebsqlCursor.prototype.continueEffectiveKey = function(key) {
  if(!this.hasCursor()) {
    throw new ydn.error.InvalidOperationError(this + " cursor gone.");
  }
  if(!goog.isDefAndNotNull(key)) {
    this.advance(1);
    return
  }
  var cmp = ydn.db.cmp(key, this.getEffectiveKey());
  if(cmp == 0 || cmp == 1 && this.reverse || cmp == -1 && !this.reverse) {
    throw new ydn.error.InvalidOperationError(this + " wrong direction.");
  }
  var n = this.cursor_.rows.length;
  for(var i = 0;i < n;i++) {
    if(cmp == 0 || cmp == 1 && this.reverse || cmp == -1 && !this.reverse) {
      this.onSuccess(this.getPrimaryKey(), this.getIndexKey(), this.getValue());
      return
    }
    this.current_cursor_index_++;
    var eff_key = this.getEffectiveKey();
    cmp = goog.isDefAndNotNull(eff_key) ? ydn.db.cmp(key, eff_key) : 1
  }
  this.onSuccess(undefined, undefined, undefined)
};
goog.provide("ydn.db.core.req.WebsqlCursor");
goog.require("ydn.db.core.req.AbstractCursor");
goog.require("ydn.db.core.req.ICursor");
ydn.db.core.req.WebsqlCursor = function(tx, tx_no, store_schema, store_name, index_name, keyRange, direction, key_only, mth) {
  goog.base(this, tx, tx_no, store_name, index_name, keyRange, direction, key_only, mth);
  goog.asserts.assert(store_schema);
  this.store_schema_ = store_schema;
  this.index_ = goog.isString(index_name) ? store_schema.getIndex(index_name) : null;
  this.current_key_ = undefined;
  this.current_primary_key_ = undefined
};
goog.inherits(ydn.db.core.req.WebsqlCursor, ydn.db.core.req.AbstractCursor);
ydn.db.core.req.WebsqlCursor.DEBUG = false;
ydn.db.core.req.WebsqlCursor.prototype.logger = goog.debug.Logger.getLogger("ydn.db.core.req.WebsqlCursor");
ydn.db.core.req.WebsqlCursor.prototype.store_schema_;
ydn.db.core.req.WebsqlCursor.prototype.index_;
ydn.db.core.req.WebsqlCursor.prototype.current_key_;
ydn.db.core.req.WebsqlCursor.prototype.current_primary_key_;
ydn.db.core.req.WebsqlCursor.prototype.current_value_;
ydn.db.core.req.WebsqlCursor.prototype.getIndexKey = function() {
  return this.current_key_
};
ydn.db.core.req.WebsqlCursor.prototype.getPrimaryKey = function() {
  return this.current_primary_key_
};
ydn.db.core.req.WebsqlCursor.prototype.getValue = function() {
  return this.current_value_
};
ydn.db.core.req.WebsqlCursor.prototype.collect = function(opt_row) {
  this.current_key_ = undefined;
  this.current_primary_key_ = undefined;
  this.current_value_ = undefined;
  if(ydn.db.core.req.WebsqlCursor.DEBUG) {
    window.console.log(opt_row)
  }
  if(goog.isDef(opt_row)) {
    var row = opt_row;
    if(goog.isObject(row)) {
      var primary_column_name = this.store_schema_.getSQLKeyColumnName();
      var primary_key = ydn.db.schema.Index.sql2js(row[primary_column_name], this.store_schema_.getType());
      if(this.isIndexCursor()) {
        goog.asserts.assertString(this.index_name);
        var type = this.store_schema_.getIndex(this.index_name).getType();
        this.current_primary_key_ = primary_key;
        this.current_key_ = ydn.db.schema.Index.sql2js(row[this.index_name], type)
      }else {
        this.current_key_ = primary_key
      }
      this.current_value_ = !this.isValueCursor() ? primary_key : ydn.db.crud.req.WebSql.parseRow(row, this.store_schema_)
    }else {
      this.current_value_ = row
    }
  }
};
ydn.db.core.req.WebsqlCursor.prototype.continuePrimaryKey_ = function(callback, primary_key, opt_inclusive, opt_offset) {
  goog.asserts.assertString(this.index_name);
  goog.asserts.assert(goog.isDefAndNotNull(this.current_key_));
  var index = this.store_schema_.getIndex(this.index_name);
  var params = [];
  var index_name = this.index_name;
  var key_range = this.key_range;
  var key = this.current_key_;
  if(goog.isDefAndNotNull(key_range)) {
    var lower = (key_range.lower);
    var upper = (key_range.upper);
    var lowerOpen = key_range.lowerOpen;
    var upperOpen = key_range.upperOpen;
    if(this.reverse) {
      upper = goog.isDefAndNotNull(upper) && ydn.db.cmp(upper, key) == -1 ? upper : key
    }else {
      lower = goog.isDefAndNotNull(lower) && ydn.db.cmp(lower, key) == 1 ? lower : key
    }
    if(goog.isDefAndNotNull(lower) && goog.isDefAndNotNull(upper)) {
      key_range = ydn.db.KeyRange.bound(lower, upper, !!lowerOpen, !!upperOpen)
    }else {
      if(goog.isDefAndNotNull(lower)) {
        key_range = ydn.db.IDBKeyRange.lowerBound(lower, !!lowerOpen)
      }else {
        key_range = ydn.db.IDBKeyRange.upperBound(upper, !!upperOpen)
      }
    }
  }else {
    if(this.reverse) {
      key_range = ydn.db.IDBKeyRange.upperBound(key)
    }else {
      key_range = ydn.db.IDBKeyRange.lowerBound(key)
    }
  }
  var e_sql = this.store_schema_.inSql(params, this.query_method, index_name, key_range, this.reverse, this.unique);
  var p_key_range = this.reverse ? ydn.db.IDBKeyRange.upperBound(primary_key, !opt_inclusive) : ydn.db.IDBKeyRange.lowerBound(primary_key, !opt_inclusive);
  var p_sql = this.store_schema_.inSql(params, this.query_method, this.store_schema_.getSQLKeyColumnName(), p_key_range, this.reverse, this.unique);
  if(e_sql.where) {
    e_sql.where += " AND " + p_sql.where
  }else {
    e_sql.where = p_sql.where
  }
  var sql = "SELECT " + e_sql.select + " FROM " + e_sql.from + (e_sql.where ? " WHERE " + e_sql.where : "") + (e_sql.group ? " GROUP BY " + e_sql.group : "") + " ORDER BY " + e_sql.order;
  sql += " LIMIT 1";
  if(opt_offset > 0) {
    sql += " OFFSET " + opt_offset
  }
  var me = this;
  var onSuccess = function(tx, results) {
    if(ydn.db.core.req.WebsqlCursor.DEBUG) {
      window.console.log([sql, results])
    }
    if(results.rows.length > 0) {
      me.collect(results.rows.item(0))
    }else {
      me.collect()
    }
    callback.call(me, me.current_key_, me.current_primary_key_, me.current_value_);
    callback = null
  };
  var onError = function(tr, error) {
    if(ydn.db.core.req.WebsqlCursor.DEBUG) {
      window.console.log([sql, error])
    }
    me.logger.warning("get error: " + error.message);
    me.onError(error);
    me.collect();
    callback.call(me, me.current_primary_key_, me.current_key_, me.current_value_);
    callback = null;
    return false
  };
  this.logger.finest(this + ": continuePrimary: " + " SQL: " + sql + " : " + ydn.json.stringify(params));
  this.tx.executeSql(sql, params, onSuccess, onError)
};
ydn.db.core.req.WebsqlCursor.prototype.sqlContinueIndexEffectiveKey_ = function(params, callback, key, open, primary_key) {
  var index_column = this.index_.getSQLIndexColumnName();
  var q_index_column = this.index_.getSQLIndexColumnNameQuoted();
  var primary_column = this.store_schema_.getSQLKeyColumnName();
  var q_primary_column = this.store_schema_.getSQLKeyColumnNameQuoted();
  var op = this.reverse ? " <" : " >";
  if(open) {
    op += " "
  }else {
    op += "= "
  }
  var encode_key = ydn.db.schema.Index.js2sql(key, this.index_.getType());
  var encode_primary_key = ydn.db.schema.Index.js2sql(primary_key, this.store_schema_.getType());
  var e_sql;
  var or = "";
  if(this.key_range) {
    e_sql = this.store_schema_.inSql(params, this.query_method, index_column, this.key_range, this.reverse, this.unique);
    e_sql.where += " AND ";
    or = q_index_column + op + "?";
    params.push(encode_key)
  }else {
    var key_range = this.reverse ? ydn.db.KeyRange.upperBound(key, true) : ydn.db.KeyRange.lowerBound(key, true);
    e_sql = this.store_schema_.inSql(params, this.query_method, index_column, key_range, this.reverse, this.unique);
    or = e_sql.where;
    e_sql.where = ""
  }
  e_sql.where += "(" + or + " OR (" + q_index_column + " = ? AND " + q_primary_column + op + "?))";
  params.push(encode_key);
  params.push(encode_primary_key);
  return"SELECT " + e_sql.select + " FROM " + e_sql.from + " WHERE " + e_sql.where + (e_sql.group ? " GROUP BY " + e_sql.group : "") + " ORDER BY " + e_sql.order
};
ydn.db.core.req.WebsqlCursor.prototype.sqlContinueEffectiveKey_ = function(params, callback, key, open) {
  var p_sql;
  var lower;
  var upper;
  var lowerOpen, upperOpen;
  if(goog.isDefAndNotNull(this.key_range)) {
    lower = (this.key_range.lower);
    upper = (this.key_range.upper);
    lowerOpen = this.key_range.lowerOpen;
    upperOpen = this.key_range.upperOpen;
    if(this.reverse) {
      if(goog.isDefAndNotNull(upper)) {
        var u_cmp = ydn.db.cmp(key, upper);
        if(u_cmp == -1) {
          upper = key;
          upperOpen = open
        }else {
          if(u_cmp == 0) {
            upperOpen = open || upperOpen
          }
        }
      }else {
        upper = key;
        upperOpen = open
      }
    }else {
      if(goog.isDefAndNotNull(lower)) {
        var l_cmp = ydn.db.cmp(key, lower);
        if(l_cmp == 1) {
          lower = key;
          lowerOpen = open
        }else {
          if(l_cmp == 0) {
            lowerOpen = open || lowerOpen
          }
        }
      }else {
        lower = key;
        lowerOpen = open
      }
    }
  }else {
    if(this.reverse) {
      upper = key;
      upperOpen = open
    }else {
      lower = key;
      lowerOpen = open
    }
  }
  var key_range = new ydn.db.KeyRange(lower, upper, !!lowerOpen, !!upperOpen);
  var column = this.index_ ? this.index_.getSQLIndexColumnName() : this.store_schema_.getSQLKeyColumnName();
  var e_sql = this.store_schema_.inSql(params, this.query_method, column, key_range, this.reverse, this.unique);
  var sql = "SELECT " + e_sql.select + " FROM " + e_sql.from + (e_sql.where ? " WHERE " + e_sql.where : "") + (e_sql.group ? " GROUP BY " + e_sql.group : "") + " ORDER BY " + e_sql.order;
  if(this.isIndexCursor()) {
    var order = this.reverse ? "DESC" : "ASC";
    sql += ", " + this.store_schema_.getSQLKeyColumnNameQuoted() + order
  }
  return sql
};
ydn.db.core.req.WebsqlCursor.prototype.continueEffectiveKey_ = function(callback, opt_key, opt_inclusive, opt_offset, opt_primary_key) {
  var offset = opt_offset || 0;
  var open = !opt_inclusive;
  var params = [];
  var sql;
  if(goog.isDefAndNotNull(opt_primary_key)) {
    goog.asserts.assert(this.is_index);
    goog.asserts.assert(goog.isDefAndNotNull(opt_key));
    sql = this.sqlContinueIndexEffectiveKey_(params, callback, opt_key, open, opt_primary_key)
  }else {
    if(goog.isDefAndNotNull(opt_key)) {
      sql = this.sqlContinueEffectiveKey_(params, callback, opt_key, open)
    }else {
      var column = this.isPrimaryCursor() ? this.store_schema_.getSQLKeyColumnName() : this.index_.getSQLIndexColumnName();
      sql = this.store_schema_.toSql(params, this.query_method, column, this.key_range, this.reverse, this.unique);
      if(this.isIndexCursor()) {
        var order = this.reverse ? "DESC" : "ASC";
        sql += ", " + this.store_schema_.getSQLKeyColumnNameQuoted() + " ASC"
      }
    }
  }
  sql += " LIMIT 1";
  if(opt_offset > 0) {
    sql += " OFFSET " + opt_offset
  }
  var me = this;
  var onSuccess = function(tx, results) {
    if(results.rows.length > 0) {
      me.collect(results.rows.item(0))
    }else {
      me.collect()
    }
    callback.call(me, me.current_key_, me.current_primary_key_, me.current_value_);
    callback = null
  };
  var onError = function(tr, error) {
    if(ydn.db.core.req.WebsqlCursor.DEBUG) {
      window.console.log([sql, tr, error])
    }
    me.logger.warning("get error: " + error.message);
    me.onError(error);
    me.collect();
    callback.call(me, me.current_primary_key_, me.current_key_, me.current_value_);
    callback = null;
    return false
  };
  this.logger.finest(this + ": continue: " + " SQL: " + sql + " : " + ydn.json.stringify(params));
  this.tx.executeSql(sql, params, onSuccess, onError)
};
ydn.db.core.req.WebsqlCursor.callback;
ydn.db.core.req.WebsqlCursor.prototype.hasCursor = function() {
  return this.isActive()
};
ydn.db.core.req.WebsqlCursor.prototype.update = function(obj) {
  if(!this.hasCursor()) {
    throw new ydn.db.InvalidAccessError;
  }
  var df = new goog.async.Deferred;
  var me = this;
  var primary_key = (this.getPrimaryKey());
  var onSuccess = function(transaction, results) {
    if(ydn.db.core.req.WebsqlCursor.DEBUG) {
      window.console.log([sql, results])
    }
    df.callback(primary_key)
  };
  var onError = function(tr, error) {
    if(ydn.db.core.req.WebsqlCursor.DEBUG) {
      window.console.log([sql, tr, error])
    }
    me.logger.warning("get error: " + error.message);
    df.errback(error);
    return false
  };
  goog.asserts.assertObject(obj);
  var out = me.store_schema_.getIndexedValues(obj, primary_key);
  var sql = "REPLACE INTO " + this.store_schema_.getQuotedName() + " (" + out.columns.join(", ") + ")" + " VALUES (" + out.slots.join(", ") + ")" + " ON CONFLICT FAIL";
  me.logger.finest(this + ': clear "' + sql + '" : ' + ydn.json.stringify(out.values));
  this.tx.executeSql(sql, out.values, onSuccess, onError);
  return df
};
ydn.db.core.req.WebsqlCursor.MONITOR = true;
ydn.db.core.req.WebsqlCursor.prototype.advance = function(step) {
  var key = this.current_key_;
  var p_key = this.current_primary_key_;
  var on_success = function(opt_key, opt_p_key, opt_value) {
    var same_k = goog.isDefAndNotNull(key) && goog.isDefAndNotNull(opt_key) && ydn.db.cmp(key, opt_key) == 0;
    if(this.isPrimaryCursor()) {
      if(same_k) {
        throw new ydn.debug.error.InternalError("current: " + key + " next: " + opt_key);
      }
    }else {
      var same_p_k = goog.isDefAndNotNull(opt_p_key) && goog.isDefAndNotNull(p_key) && ydn.db.cmp(opt_p_key, p_key) == 0;
      if(same_k && same_p_k) {
        throw new ydn.debug.error.InternalError("current: " + key + ";" + p_key + " next: " + opt_key + ";" + opt_p_key);
      }
    }
    this.onSuccess(opt_key, opt_p_key, opt_value)
  };
  goog.asserts.assert(step > 0);
  var inclusive = true;
  if(goog.isDefAndNotNull(this.current_key_) && (this.isPrimaryCursor() || goog.isDefAndNotNull(this.current_primary_key_))) {
    step = step - 1;
    inclusive = false
  }
  this.continueEffectiveKey_(ydn.db.core.req.WebsqlCursor.MONITOR ? on_success : this.onSuccess, this.current_key_, inclusive, step, this.current_primary_key_)
};
ydn.db.core.req.WebsqlCursor.prototype.continueEffectiveKey = function(key) {
  if(goog.isDefAndNotNull(key)) {
    this.continueEffectiveKey_(this.onSuccess, key, true)
  }else {
    this.advance(1)
  }
};
ydn.db.core.req.WebsqlCursor.prototype.prepareBaseSql = function(params) {
  var column = this.index_ ? this.index_.getSQLIndexColumnName() : this.store_schema_.getSQLKeyColumnName();
  var sql = this.store_schema_.inSql(params, this.query_method, column, this.key_range, this.reverse, this.unique);
  return sql
};
ydn.db.core.req.WebsqlCursor.prototype.openCursor = function(opt_key, opt_primary_key) {
  this.continueEffectiveKey_(this.onSuccess, opt_key, false, 0, opt_primary_key)
};
ydn.db.core.req.WebsqlCursor.prototype.clear = function() {
  if(!this.hasCursor()) {
    throw new ydn.db.InvalidAccessError;
  }
  var df = new goog.async.Deferred;
  var me = this;
  var onSuccess = function(transaction, results) {
    if(ydn.db.core.req.WebsqlCursor.DEBUG) {
      window.console.log([sql, results])
    }
    df.callback(results.rowsAffected)
  };
  var onError = function(tr, error) {
    if(ydn.db.core.req.WebsqlCursor.DEBUG) {
      window.console.log([sql, tr, error])
    }
    me.logger.warning("get error: " + error.message);
    df.errback(error);
    return false
  };
  var primary_column_name = this.store_schema_.getSQLKeyColumnName();
  var sql = "DELETE FROM " + this.store_schema_.getQuotedName() + " WHERE " + primary_column_name + " = ?";
  var params = [this.getPrimaryKey()];
  me.logger.finest(this + ': clear "' + sql + '" : ' + ydn.json.stringify(params));
  this.tx.executeSql(sql, params, onSuccess, onError);
  return df
};
ydn.db.core.req.WebsqlCursor.prototype.restart = function(effective_key, primary_key) {
  this.logger.finest(this + " restarting.");
  this.openCursor(primary_key, effective_key)
};
ydn.db.core.req.WebsqlCursor.prototype.continuePrimaryKey = function(key) {
  goog.asserts.assert(this.isIndexCursor());
  goog.asserts.assert(goog.isDefAndNotNull(this.current_key_));
  goog.asserts.assert(goog.isDefAndNotNull(this.current_primary_key_));
  var cmp = ydn.db.cmp(key, this.current_primary_key_);
  if(cmp == 0 || cmp == 1 && this.reverse || cmp == -1 && !this.reverse) {
    throw new ydn.error.InvalidOperationError(this + " to continuePrimaryKey " + " from " + this.current_primary_key_ + " to " + key + " on " + this.dir + " direction is wrong");
  }
  this.continuePrimaryKey_(this.onSuccess, key, true)
};
if(goog.DEBUG) {
  ydn.db.core.req.WebsqlCursor.prototype.toString = function() {
    return"WebSql" + goog.base(this, "toString")
  }
}
;goog.provide("ydn.db.crud.req.WebSql");
goog.require("goog.async.Deferred");
goog.require("goog.debug.Logger");
goog.require("goog.events");
goog.require("ydn.async");
goog.require("ydn.db.Where");
goog.require("ydn.db.crud.req.IRequestExecutor");
goog.require("ydn.db.crud.req.RequestExecutor");
goog.require("ydn.json");
ydn.db.crud.req.WebSql = function(dbname, schema) {
  goog.base(this, dbname, schema)
};
goog.inherits(ydn.db.crud.req.WebSql, ydn.db.crud.req.RequestExecutor);
ydn.db.crud.req.WebSql.DEBUG = false;
ydn.db.crud.req.WebSql.REQ_PER_TX = 10;
ydn.db.crud.req.WebSql.RW_REQ_PER_TX = 2;
ydn.db.crud.req.WebSql.prototype.logger = goog.debug.Logger.getLogger("ydn.db.crud.req.WebSql");
ydn.db.crud.req.WebSql.parseRow = function(row, store) {
  var value = row[ydn.db.base.DEFAULT_BLOB_COLUMN] ? ydn.json.parse(row[ydn.db.base.DEFAULT_BLOB_COLUMN]) : {};
  if(goog.isDefAndNotNull(store.keyPath)) {
    var key = ydn.db.schema.Index.sql2js(row[store.keyPath], store.getType());
    if(goog.isDefAndNotNull(key)) {
      store.setKeyValue(value, key)
    }
  }
  for(var j = 0;j < store.indexes.length;j++) {
    var index = store.indexes[j];
    var column_name = index.getSQLIndexColumnName();
    if(column_name == ydn.db.base.DEFAULT_BLOB_COLUMN || index.isComposite() || index.isMultiEntry()) {
      continue
    }
    if(index.getType() == ydn.db.schema.DataType.DATE) {
      var x = row[column_name];
      var v = ydn.db.schema.Index.sql2js(x, index.getType());
      if(goog.isDef(v)) {
        index.applyValue(value, v)
      }
    }
  }
  return value
};
ydn.db.crud.req.WebSql.prototype.getKeyFromRow = function(table, row) {
  return row[table.keyPath || ydn.db.base.SQLITE_SPECIAL_COLUNM_NAME]
};
ydn.db.crud.req.WebSql.prototype.keysByKeyRange = function(tx, tx_no, df, store_name, key_range, reverse, limit, offset) {
  this.list_by_key_range_(tx, tx_no, df, true, store_name, undefined, key_range, reverse, limit, offset, false)
};
ydn.db.crud.req.WebSql.prototype.keysByIndexKeyRange = function(tx, tx_no, df, store_name, index_name, key_range, reverse, limit, offset, unique) {
  this.list_by_key_range_(tx, tx_no, df, true, store_name, index_name, key_range, reverse, limit, offset, unique)
};
ydn.db.crud.req.WebSql.prototype.list_by_key_range_ = function(tx, tx_no, df, key_only, store_name, index_column, key_range, reverse, limit, offset, distinct) {
  var me = this;
  var arr = [];
  var store = this.schema.getStore(store_name);
  var key_column = store.getSQLKeyColumnName();
  var index = goog.isDefAndNotNull(index_column) && index_column !== key_column ? store.getIndex(index_column) : null;
  var is_index = !!index;
  var effective_column = index_column || key_column;
  var params = [];
  var mth = key_only ? ydn.db.schema.Store.QueryMethod.KEYS : ydn.db.schema.Store.QueryMethod.VALUES;
  var sql = store.toSql(params, mth, effective_column, key_range, reverse, distinct);
  if(goog.isNumber(limit)) {
    sql += " LIMIT " + limit
  }
  if(goog.isNumber(offset)) {
    sql += " OFFSET " + offset
  }
  var callback = function(transaction, results) {
    var n = results.rows.length;
    if(ydn.db.crud.req.WebSql.DEBUG) {
      window.console.log(results)
    }
    for(var i = 0;i < n;i++) {
      var row = results.rows.item(i);
      if(ydn.db.crud.req.WebSql.DEBUG) {
        window.console.log(row)
      }
      if(key_only) {
        arr[i] = ydn.db.schema.Index.sql2js(row[key_column], store.getType())
      }else {
        if(goog.isDefAndNotNull(row)) {
          arr[i] = ydn.db.crud.req.WebSql.parseRow(row, store)
        }
      }
    }
    me.logger.finer("success " + msg);
    df(arr)
  };
  var msg = tx_no + " SQL: " + sql + " ;params= " + ydn.json.stringify(params);
  var error_callback = function(tr, error) {
    if(ydn.db.crud.req.WebSql.DEBUG) {
      window.console.log([tr, error])
    }
    me.logger.warning("error: " + msg + error.message);
    df(error, true);
    return false
  };
  this.logger.finest(msg);
  tx.executeSql(sql, params, callback, error_callback)
};
ydn.db.crud.req.WebSql.prototype.putByKeys = goog.abstractMethod;
ydn.db.crud.req.WebSql.prototype.addObject = function(tx, tx_no, df, store_name, obj, opt_key) {
  this.insertObjects(tx, tx_no, df, true, true, store_name, [obj], [opt_key])
};
ydn.db.crud.req.WebSql.prototype.putData = function(tx, tx_no, df, store_name, data, delimiter) {
  throw"not impl";
};
ydn.db.crud.req.WebSql.prototype.putObject = function(tx, tx_no, df, store_name, obj, opt_key) {
  this.insertObjects(tx, tx_no, df, false, true, store_name, [obj], [opt_key])
};
ydn.db.crud.req.WebSql.prototype.addObjects = function(tx, tx_no, df, store_name, objects, opt_keys) {
  this.insertObjects(tx, tx_no, df, true, false, store_name, objects, opt_keys)
};
ydn.db.crud.req.WebSql.prototype.insertObjects = function(tx, tx_no, df, create, single, store_name, objects, opt_keys) {
  var table = this.schema.getStore(store_name);
  var insert_statement = create ? "INSERT INTO " : "INSERT OR REPLACE INTO ";
  var me = this;
  var result_keys = [];
  var result_count = 0;
  var msg = tx_no + " inserting " + objects.length + " objects.";
  var put = function(i, tx) {
    if(goog.DEBUG && !goog.isDefAndNotNull(objects[i])) {
      var t = goog.isDef(objects[i]) ? "null" : "undefined";
      var at = objects.length == 1 ? "" : " at " + i + " of " + objects.length;
      throw new ydn.debug.error.InvalidOperationException("inserting " + t + "object " + at + ' "' + ydn.json.toShortString(objects[i]));
    }
    var out;
    if(goog.isDef(opt_keys)) {
      out = table.getIndexedValues(objects[i], opt_keys[i])
    }else {
      out = table.getIndexedValues(objects[i])
    }
    var sql = insert_statement + table.getQuotedName() + " (" + out.columns.join(", ") + ") " + "VALUES (" + out.slots.join(", ") + ");";
    var i_msg = tx_no + " SQL: " + sql + " PARAMS: " + out.values + " REQ: " + i + " of " + objects.length;
    var success_callback = function(transaction, results) {
      result_count++;
      var key = goog.isDef(out.key) ? out.key : results.insertId;
      var insertMultiEntryIndex = function(index, value) {
        var idx_name = ydn.db.con.WebSql.PREFIX_MULTIENTRY + table.getName() + ":" + index.getName();
        var idx_sql = insert_statement + goog.string.quote(idx_name) + " (" + table.getSQLKeyColumnNameQuoted() + ", " + index.getSQLIndexColumnNameQuoted() + ") VALUES (?, ?)";
        var idx_params = [ydn.db.schema.Index.js2sql(key, table.getType()), value];
        var idx_success = function(tx, rs) {
        };
        var idx_error = function(tr, error) {
          me.logger.warning("multiEntry index insert error: " + error.message);
          return false
        };
        me.logger.finest(tx_no + " multiEntry " + idx_sql + " " + idx_params);
        tx.executeSql(idx_sql, idx_params, idx_success, idx_error)
      };
      for(var j = 0, nj = table.countIndex();j < nj;j++) {
        var idx = table.index(j);
        if(idx.isMultiEntry()) {
          var index_values = ydn.db.utils.getValueByKeys(objects[i], idx.getKeyPath());
          var n = (!index_values ? 0 : index_values.length) || 0;
          for(var k = 0;k < n;k++) {
            insertMultiEntryIndex(idx, index_values[k])
          }
        }
      }
      if(single) {
        me.logger.finer("success " + msg);
        df(key)
      }else {
        result_keys[i] = key;
        if(result_count == objects.length) {
          me.logger.finer("success " + msg);
          df(result_keys)
        }else {
          var next = i + ydn.db.crud.req.WebSql.RW_REQ_PER_TX;
          if(next < objects.length) {
            put(next, transaction)
          }
        }
      }
    };
    var error_callback = function(tr, error) {
      if(ydn.db.crud.req.WebSql.DEBUG) {
        window.console.log([sql, out, tr, error])
      }
      result_count++;
      if(error.code == 6) {
        error.name = "ConstraintError";
        if(single) {
          me.logger.finer("success " + i_msg);
          df(error, true)
        }else {
          result_keys[i] = null;
          if(result_count == objects.length) {
            me.logger.finest("success " + msg);
            df(result_keys)
          }else {
            var next = i + ydn.db.crud.req.WebSql.RW_REQ_PER_TX;
            if(next < objects.length) {
              put(next, tr)
            }
          }
        }
        if(create && single) {
          return true
        }else {
          return false
        }
      }else {
        me.logger.warning("error: " + error.message + " " + msg);
        df(error, true);
        return false
      }
    };
    me.logger.finest(i_msg);
    tx.executeSql(sql, out.values, success_callback, error_callback)
  };
  if(objects.length > 0) {
    for(var i = 0;i < ydn.db.crud.req.WebSql.RW_REQ_PER_TX && i < objects.length;i++) {
      put(i, (tx))
    }
  }else {
    this.logger.finer("success");
    df([])
  }
};
ydn.db.crud.req.WebSql.prototype.putObjects = function(tx, tx_no, df, store_name, objects, opt_keys) {
  this.insertObjects(tx, tx_no, df, false, false, store_name, objects, opt_keys)
};
ydn.db.crud.req.WebSql.prototype.putByKeys = function(tx, tx_no, df, objs, keys) {
  if(keys.length == 0) {
    df([]);
    return
  }
  var results = [];
  var count = 0;
  var total = 0;
  var me = this;
  var execute_on_store = function(store_name, idx) {
    var idf = function(xs, is_error) {
      if(is_error) {
        count++;
        if(count == total) {
          df(xs, true)
        }
      }else {
        for(var i = 0;i < idx.length;i++) {
          results[idx[i]] = xs[i]
        }
        count++;
        if(count == total) {
          df(results)
        }
      }
    };
    var idx_objs = [];
    me.logger.finest("put " + idx.length + " objects to " + store_name);
    var store = me.schema.getStore(store_name);
    var inline = store.usedInlineKey();
    var idx_keys = inline ? undefined : [];
    for(var i = 0;i < idx.length;i++) {
      idx_objs.push(objs[idx[i]]);
      if(!inline) {
        idx_keys.push(keys[idx[i]].getId())
      }
    }
    me.insertObjects(tx, tx_no, idf, false, false, store_name, idx_objs, idx_keys)
  };
  var store_name = "";
  var store;
  var idx = [];
  var ids = [];
  for(var i = 0;i < keys.length;i++) {
    var name = keys[i].getStoreName();
    var id = keys[i].getId();
    if(name != store_name) {
      total++;
      if(idx.length > 0) {
        execute_on_store(store_name, idx)
      }
      idx = [i];
      ids = [id];
      store_name = name
    }else {
      idx.push(i);
      ids.push(id)
    }
  }
  if(idx.length > 0) {
    execute_on_store(store_name, idx)
  }
};
ydn.db.crud.req.WebSql.prototype.getById = function(tx, tx_no, d, table_name, id) {
  var table = this.schema.getStore(table_name);
  goog.asserts.assertInstanceof(table, ydn.db.schema.Store, table_name + " not found.");
  var me = this;
  var column_name = table.getSQLKeyColumnNameQuoted();
  var params = [ydn.db.schema.Index.js2sql(id, table.getType())];
  var sql = "SELECT * FROM " + table.getQuotedName() + " WHERE " + column_name + " = ?";
  var msg = tx_no + " SQL: " + sql + " PARAMS: " + params;
  var callback = function(transaction, results) {
    if(results.rows.length > 0) {
      var row = results.rows.item(0);
      if(goog.isDefAndNotNull(row)) {
        var value = ydn.db.crud.req.WebSql.parseRow(row, table);
        d(value)
      }else {
        me.logger.finer("success: " + msg);
        d(undefined)
      }
    }else {
      me.logger.finer("success no result: " + msg);
      d(undefined)
    }
  };
  var error_callback = function(tr, error) {
    if(ydn.db.crud.req.WebSql.DEBUG) {
      window.console.log([tr, error])
    }
    me.logger.warning("error: " + msg + " " + error.message);
    d(error, true);
    return false
  };
  this.logger.finest(msg);
  tx.executeSql(sql, params, callback, error_callback)
};
ydn.db.crud.req.WebSql.prototype.listByIds = function(tx, tx_no, df, table_name, ids) {
  var me = this;
  var objects = [];
  var result_count = 0;
  var table = this.schema.getStore(table_name);
  goog.asserts.assertInstanceof(table, ydn.db.schema.Store, table_name + " not found.");
  var get = function(i, tx) {
    var callback = function(transaction, results) {
      result_count++;
      if(results.rows.length > 0) {
        var row = results.rows.item(0);
        if(goog.isDefAndNotNull(row)) {
          objects[i] = ydn.db.crud.req.WebSql.parseRow(row, table)
        }
      }else {
        objects[i] = undefined
      }
      if(result_count == ids.length) {
        me.logger.finer("TxNo:" + tx_no + "success " + sql);
        df(objects)
      }else {
        var next = i + ydn.db.crud.req.WebSql.REQ_PER_TX;
        if(next < ids.length) {
          get(next, transaction)
        }
      }
    };
    var error_callback = function(tr, error) {
      result_count++;
      if(ydn.db.crud.req.WebSql.DEBUG) {
        window.console.log([tr, error])
      }
      me.logger.warning("error: " + sql + " " + error.message);
      if(result_count == ids.length) {
        me.logger.finer("TxNo:" + tx_no + "success " + sql);
        df(objects)
      }else {
        var next = i + ydn.db.crud.req.WebSql.REQ_PER_TX;
        if(next < ids.length) {
          get(next, tr)
        }
      }
      return false
    };
    var id = ids[i];
    var column_name = table.getSQLKeyColumnNameQuoted();
    var params = [ydn.db.schema.Index.js2sql(id, table.getType())];
    var sql = "SELECT * FROM " + table.getQuotedName() + " WHERE " + column_name + " = ?";
    me.logger.finest("SQL: " + sql + " PARAMS: " + params);
    tx.executeSql(sql, params, callback, error_callback)
  };
  if(ids.length > 0) {
    for(var i = 0;i < ydn.db.crud.req.WebSql.REQ_PER_TX && i < ids.length;i++) {
      get(i, (tx))
    }
  }else {
    me.logger.finer("success");
    df([])
  }
};
ydn.db.crud.req.WebSql.prototype.listByKeyRange = function(tx, tx_no, df, store_name, key_range, reverse, limit, offset) {
  this.list_by_key_range_(tx, tx_no, df, false, store_name, undefined, key_range, reverse, limit, offset, false)
};
ydn.db.crud.req.WebSql.prototype.listByIndexKeyRange = function(tx, tx_no, df, store_name, index, key_range, reverse, limit, offset, unqiue) {
  this.list_by_key_range_(tx, tx_no, df, false, store_name, index, key_range, reverse, limit, offset, unqiue)
};
ydn.db.crud.req.WebSql.prototype.listByStore = function(tx, tx_no, df, table_name) {
  var me = this;
  var arr = [];
  var table = me.schema.getStore(table_name);
  goog.asserts.assertInstanceof(table, ydn.db.schema.Store, table_name + " not found.");
  var sql = "SELECT * FROM " + table.getQuotedName();
  var callback = function(transaction, results) {
    for(var i = 0, n = results.rows.length;i < n;i++) {
      var row = results.rows.item(i);
      if(goog.isDefAndNotNull(row)) {
        arr.push(ydn.db.crud.req.WebSql.parseRow(row, table))
      }
    }
    df(arr)
  };
  var error_callback = function(tr, error) {
    if(ydn.db.crud.req.WebSql.DEBUG) {
      window.console.log([tr, error])
    }
    me.logger.warning("error: " + sql + " " + error.message);
    df(error, true);
    return false
  };
  me.logger.finest("SQL: " + sql + " PARAMS: []");
  tx.executeSql(sql, [], callback, error_callback)
};
ydn.db.crud.req.WebSql.prototype.listByKeys = function(tx, tx_no, df, keys) {
  var me = this;
  var objects = [];
  var result_count = 0;
  var get = function(i, tx) {
    var key = keys[i];
    var table_name = key.getStoreName();
    var table = me.schema.getStore(table_name);
    var callback = function(transaction, results) {
      result_count++;
      if(results.rows.length > 0) {
        var row = results.rows.item(0);
        if(goog.isDefAndNotNull(row)) {
          objects[i] = ydn.db.crud.req.WebSql.parseRow(row, table)
        }
      }else {
        objects[i] = undefined
      }
      if(result_count == keys.length) {
        me.logger.finest("success " + sql);
        df(objects)
      }else {
        var next = i + ydn.db.crud.req.WebSql.REQ_PER_TX;
        if(next < keys.length) {
          get(next, transaction)
        }
      }
    };
    var error_callback = function(tr, error) {
      if(ydn.db.crud.req.WebSql.DEBUG) {
        window.console.log([tr, error])
      }
      me.logger.warning("error: " + sql + " " + error.message);
      df(error, true);
      return false
    };
    var id = key.getNormalizedId();
    var column_name = table.getSQLKeyColumnNameQuoted();
    var params = [ydn.db.schema.Index.js2sql(id, table.getType())];
    var sql = "SELECT * FROM " + table.getQuotedName() + " WHERE " + column_name + " = ?";
    me.logger.finest("SQL: " + sql + " PARAMS: " + params);
    tx.executeSql(sql, params, callback, error_callback)
  };
  if(keys.length > 0) {
    for(var i = 0;i < ydn.db.crud.req.WebSql.REQ_PER_TX && i < keys.length;i++) {
      get(i, tx)
    }
  }else {
    this.logger.finest("success");
    df([])
  }
};
ydn.db.crud.req.WebSql.prototype.clearByStores = function(tx, tx_no, d, store_names) {
  var me = this;
  var deleteStore = function(i, tx) {
    var store = me.schema.getStore(store_names[i]);
    var sql = "DELETE FROM  " + store.getQuotedName();
    var callback = function(transaction, results) {
      if(i == store_names.length - 1) {
        me.logger.finest("success " + sql);
        d(store_names.length)
      }else {
        deleteStore(i + 1, transaction)
      }
    };
    var errback = function(tr, error) {
      if(ydn.db.crud.req.WebSql.DEBUG) {
        window.console.log([tr, error])
      }
      me.logger.warning("error: " + sql + " " + error.message);
      d(error, true);
      return false
    };
    me.logger.finest("SQL: " + sql + " PARAMS: []");
    tx.executeSql(sql, [], callback, errback);
    var deleteMultiEntryIndex = function(index) {
      var idx_name = ydn.db.con.WebSql.PREFIX_MULTIENTRY + store.getName() + ":" + index.getName();
      var idx_sql = "DELETE FROM  " + goog.string.quote(idx_name);
      me.logger.finest("SQL: " + idx_sql);
      tx.executeSql(idx_sql, [])
    };
    for(var j = 0, n = store.countIndex();j < n;j++) {
      var index = store.index(j);
      if(index.isMultiEntry()) {
        deleteMultiEntryIndex(index)
      }
    }
    return d
  };
  if(store_names.length > 0) {
    deleteStore(0, tx)
  }else {
    this.logger.finest("success");
    d(0)
  }
};
ydn.db.crud.req.WebSql.prototype.removeByKeys = function(tx, tx_no, df, keys) {
  var me = this;
  var count = 0;
  var has_failed = false;
  var store_name, store, key;
  var msg = tx_no + " removeByKeys: " + keys.length + " keys";
  this.logger.finest(msg);
  var removeAt = function(i) {
    if(i >= keys.length) {
      me.logger.finest("success " + msg);
      df(count, has_failed);
      return
    }
    var store = me.schema.getStore(keys[i].getStoreName());
    var key = ydn.db.schema.Index.js2sql(keys[i].getId(), store.getType());
    var success_callback = function(transaction, results) {
      if(ydn.db.crud.req.WebSql.DEBUG) {
        window.console.log(results)
      }
      count++;
      removeAt(i)
    };
    var error_callback = function(tr, error) {
      if(ydn.db.crud.req.WebSql.DEBUG) {
        window.console.log([tr, error])
      }
      me.logger.warning("error: " + i_msg + error.message);
      has_failed = true;
      removeAt(i);
      return false
    };
    var where = " WHERE " + store.getSQLKeyColumnNameQuoted() + " = ?";
    var sql = "DELETE FROM " + store.getQuotedName() + where;
    var i_msg = tx_no + " SQL: " + sql + " PARAMS: " + [key];
    if(ydn.db.crud.req.WebSql.DEBUG) {
      window.console.log(i_msg)
    }
    tx.executeSql(sql, [key], success_callback, error_callback);
    i++;
    var deleteMultiEntryIndex = function(index) {
      var idx_name = ydn.db.con.WebSql.PREFIX_MULTIENTRY + store.getName() + ":" + index.getName();
      var idx_sql = "DELETE FROM  " + goog.string.quote(idx_name) + where;
      me.logger.finest(tx_no + +" SQL: " + idx_sql);
      tx.executeSql(idx_sql, [key])
    };
    for(var j = 0, n = store.countIndex();j < n;j++) {
      var index = store.index(j);
      if(index.isMultiEntry()) {
        deleteMultiEntryIndex(index)
      }
    }
  };
  removeAt(0)
};
ydn.db.crud.req.WebSql.prototype.removeById = function(tx, tx_no, d, table, id) {
  var store = this.schema.getStore(table);
  var key = ydn.db.schema.Index.js2sql(id, store.getType());
  var me = this;
  var success_callback = function(transaction, results) {
    if(ydn.db.crud.req.WebSql.DEBUG) {
      window.console.log(results)
    }
    me.logger.finest("success " + msg);
    d(results.rowsAffected)
  };
  var error_callback = function(tr, error) {
    if(ydn.db.crud.req.WebSql.DEBUG) {
      window.console.log([tr, error])
    }
    me.logger.warning("error: " + msg + error.message);
    d(error, true);
    return false
  };
  var where = " WHERE " + store.getSQLKeyColumnNameQuoted() + " = ?";
  var sql = "DELETE FROM " + store.getQuotedName() + where;
  var msg = tx_no + " SQL: " + sql + " PARAMS: " + [key];
  this.logger.finest(msg);
  tx.executeSql(sql, [key], success_callback, error_callback);
  var deleteMultiEntryIndex = function(index) {
    var idx_name = ydn.db.con.WebSql.PREFIX_MULTIENTRY + store.getName() + ":" + index.getName();
    var idx_sql = "DELETE FROM  " + goog.string.quote(idx_name) + where;
    me.logger.finest(tx_no + +" SQL: " + idx_sql);
    tx.executeSql(idx_sql, [key])
  };
  for(var j = 0, n = store.countIndex();j < n;j++) {
    var index = store.index(j);
    if(index.isMultiEntry()) {
      deleteMultiEntryIndex(index)
    }
  }
};
ydn.db.crud.req.WebSql.prototype.clearByKeyRange = function(tx, tx_no, df, store_name, key_range) {
  this.clear_by_key_range_(tx, tx_no, df, store_name, undefined, key_range)
};
ydn.db.crud.req.WebSql.prototype.removeByKeyRange = function(tx, tx_no, df, store_name, key_range) {
  this.clear_by_key_range_(tx, tx_no, df, store_name, undefined, key_range)
};
ydn.db.crud.req.WebSql.prototype.removeByIndexKeyRange = function(tx, tx_no, df, store_name, index_name, key_range) {
  this.clear_by_key_range_(tx, tx_no, df, store_name, index_name, key_range)
};
ydn.db.crud.req.WebSql.prototype.clear_by_key_range_ = function(tx, tx_no, df, store_name, column_name, key_range) {
  var me = this;
  var arr = [];
  var store = this.schema.getStore(store_name);
  var sql = "DELETE FROM " + store.getQuotedName();
  var params = [];
  var where_params = [];
  var where = "";
  if(goog.isDefAndNotNull(key_range)) {
    if(goog.isDef(column_name)) {
      var index = store.getIndex(column_name);
      ydn.db.KeyRange.toSql(index.getSQLIndexColumnNameQuoted(), index.getType(), key_range, where_params, params)
    }else {
      ydn.db.KeyRange.toSql(store.getSQLKeyColumnNameQuoted(), store.getType(), key_range, where_params, params)
    }
    where = " WHERE " + where_params.join(" AND ")
  }
  sql += where;
  var callback = function(transaction, results) {
    me.logger.finest("success " + msg);
    df(results.rowsAffected)
  };
  var error_callback = function(tr, error) {
    if(ydn.db.crud.req.WebSql.DEBUG) {
      window.console.log([tr, error])
    }
    me.logger.warning("error: " + msg + error.message);
    df(error, true);
    return false
  };
  var msg = tx_no + " SQL: " + sql + " PARAMS: " + params;
  this.logger.finest(msg);
  tx.executeSql(sql, params, callback, error_callback);
  var deleteMultiEntryIndex = function(index) {
    var idx_name = ydn.db.con.WebSql.PREFIX_MULTIENTRY + store.getName() + ":" + index.getName();
    var idx_sql = "DELETE FROM  " + goog.string.quote(idx_name) + where;
    me.logger.finest(tx_no + +" SQL: " + idx_sql);
    tx.executeSql(idx_sql, where_params)
  };
  for(var j = 0, n = store.countIndex();j < n;j++) {
    var j_index = store.index(j);
    if(j_index.isMultiEntry()) {
      deleteMultiEntryIndex(j_index)
    }
  }
};
ydn.db.crud.req.WebSql.prototype.countStores = function(tx, tx_no, d, tables) {
  var me = this;
  var out = [];
  var count = function(i) {
    var table = tables[i];
    var sql = "SELECT COUNT(*) FROM " + goog.string.quote(table);
    var callback = function(transaction, results) {
      var row = results.rows.item(0);
      out[i] = parseInt(row["COUNT(*)"], 10);
      i++;
      me.logger.finest(i + ". success " + sql);
      if(i == tables.length) {
        d(out)
      }else {
        count(i)
      }
    };
    var error_callback = function(tr, error) {
      if(ydn.db.crud.req.WebSql.DEBUG) {
        window.console.log([tr, error])
      }
      me.logger.warning("error: " + sql + " " + error.message);
      d(error, true);
      return false
    };
    me.logger.finest("SQL: " + sql + " PARAMS: []");
    tx.executeSql(sql, [], callback, error_callback)
  };
  if(tables.length == 0) {
    this.logger.finest("success");
    d(0)
  }else {
    count(0)
  }
  return d
};
ydn.db.crud.req.WebSql.prototype.countKeyRange = function(tx, tx_no, d, table, key_range, index_name, unique) {
  var me = this;
  var params = [];
  var store = this.schema.getStore(table);
  var sql = store.toSql(params, ydn.db.schema.Store.QueryMethod.COUNT, index_name, key_range, false, unique);
  var callback = function(transaction, results) {
    if(ydn.db.crud.req.WebSql.DEBUG) {
      window.console.log([sql, results])
    }
    var row = results.rows.item(0);
    me.logger.finest("success " + msg);
    d(ydn.object.takeFirst(row))
  };
  var error_callback = function(tr, error) {
    if(ydn.db.crud.req.WebSql.DEBUG) {
      window.console.log([sql, error])
    }
    me.logger.warning("error: " + msg + error.message);
    d(error, true);
    return false
  };
  var msg = tx_no + " SQL: " + sql + " PARAMS: " + params;
  this.logger.finest(msg);
  tx.executeSql(sql, params, callback, error_callback);
  return d
};
goog.provide("ydn.db.core.req.WebSql");
goog.require("goog.async.Deferred");
goog.require("goog.debug.Logger");
goog.require("goog.events");
goog.require("ydn.async");
goog.require("ydn.db.core.req.CachedWebsqlCursor");
goog.require("ydn.db.core.req.IRequestExecutor");
goog.require("ydn.db.core.req.WebsqlCursor");
goog.require("ydn.db.crud.req.WebSql");
goog.require("ydn.json");
ydn.db.core.req.WebSql = function(dbname, schema) {
  goog.base(this, dbname, schema)
};
goog.inherits(ydn.db.core.req.WebSql, ydn.db.crud.req.WebSql);
ydn.db.core.req.WebSql.DEBUG = false;
ydn.db.core.req.WebSql.prototype.logger = goog.debug.Logger.getLogger("ydn.db.core.req.WebSql");
ydn.db.core.req.WebSql.prototype.keysByIterator = function(tx, tx_no, df, iter, limit, offset) {
  this.fetchIterator_(tx, tx_no, df, iter, ydn.db.schema.Store.QueryMethod.KEYS, limit, offset)
};
ydn.db.core.req.WebSql.prototype.listByIterator = function(tx, tx_no, df, q, limit, offset) {
  this.fetchIterator_(tx, tx_no, df, q, ydn.db.schema.Store.QueryMethod.VALUES, limit, offset)
};
ydn.db.core.req.WebSql.prototype.fetchIterator_ = function(tx, tx_no, df, iter, mth, opt_limit, opt_offset) {
  var arr = [];
  var q = mth == ydn.db.schema.Store.QueryMethod.KEYS ? "keys" : mth == ydn.db.schema.Store.QueryMethod.VALUES ? "values" : mth == ydn.db.schema.Store.QueryMethod.COUNT ? "count" : "";
  var msg = tx_no + " " + q + "ByIterator " + iter;
  if(opt_limit > 0) {
    msg += " limit " + opt_limit
  }
  var me = this;
  this.logger.finer(msg);
  var cursor = iter.iterate(tx, tx_no, this, mth);
  cursor.onFail = function(e) {
    me.logger.finer("error:" + msg);
    cursor.exit();
    df(e, true)
  };
  var count = 0;
  var cued = false;
  cursor.onNext = function(opt_key) {
    if(goog.isDef(opt_key)) {
      var key = opt_key;
      var primary_key = cursor.getPrimaryKey();
      var value = cursor.getValue();
      if(!cued && opt_offset > 0) {
        cursor.advance(opt_offset);
        cued = true;
        return
      }
      count++;
      var out;
      if(mth == ydn.db.schema.Store.QueryMethod.KEYS) {
        out = key
      }else {
        if(iter.isIndexIterator() && iter.isKeyIterator()) {
          out = primary_key
        }else {
          out = value
        }
      }
      arr.push(out);
      if(!goog.isDef(opt_limit) || count < opt_limit) {
        cursor.continueEffectiveKey()
      }else {
        cursor.exit();
        me.logger.finer("success:" + msg + " " + arr.length + " records");
        df(arr)
      }
    }else {
      cursor.exit();
      me.logger.finer("success:" + msg + " " + arr.length + " records");
      df(arr)
    }
  }
};
ydn.db.core.req.WebSql.prototype.getCursor = function(tx, tx_no, store_name, index_name, keyRange, direction, key_only, key_query) {
  var store = this.schema.getStore(store_name);
  goog.asserts.assertObject(store, 'store "' + store_name + '" not found.');
  if(goog.isDef(index_name)) {
    index_name = this.getIndexName(store, index_name)
  }
  return new ydn.db.core.req.WebsqlCursor(tx, tx_no, store, store_name, index_name, keyRange, direction, key_only, key_query)
};
ydn.db.core.req.WebSql.prototype.getStreamer = function(tx, tx_no, store_name, index_name) {
  throw"not yet";
};
goog.provide("ydn.db.ISyncOperator");
ydn.db.ISyncOperator = function() {
};
ydn.db.ISyncOperator.prototype.dumpInternal = goog.abstractMethod;
ydn.db.ISyncOperator.prototype.listInternal = goog.abstractMethod;
ydn.db.ISyncOperator.prototype.keysInternal = goog.abstractMethod;
goog.provide("ydn.db.tr.IThread");
goog.provide("ydn.db.tr.IThread.Policy");
ydn.db.tr.IThread = function() {
};
ydn.db.tr.IThread.prototype.exec = goog.abstractMethod;
ydn.db.tr.IThread.prototype.abort = goog.abstractMethod;
ydn.db.tr.IThread.prototype.getTxNo = goog.abstractMethod;
ydn.db.tr.IThread.prototype.processTx = goog.abstractMethod;
ydn.db.tr.IThread.Policy = {MULTI:"multi", REPEAT:"repeat", ALL:"all", ATOMIC:"atomic", SINGLE:"single"};
ydn.db.tr.IThread.abort = function(tx) {
  if(tx) {
    if(goog.isFunction(tx.abort)) {
      tx.abort()
    }else {
      if(goog.isFunction(tx.executeSql)) {
        var callback = function(transaction, results) {
        };
        var error_callback = function(tr, error) {
          return true
        };
        tx.executeSql("ABORT", [], callback, error_callback)
      }else {
        throw new ydn.error.NotSupportedException;
      }
    }
  }else {
    throw new ydn.db.InvalidStateError("No active transaction");
  }
};
/*
 _try.
*/
goog.provide("ydn.db.tr.Serial");
goog.require("ydn.db.tr.IThread");
goog.require("ydn.error.NotSupportedException");
ydn.db.tr.Serial = function(storage, ptx_no, opt_max_tx_no) {
  this.storage_ = storage;
  this.q_no_ = ptx_no;
  this.r_no_ = 0;
  this.trQueue_ = [];
  this.completed_handlers = null;
  this.s_request_tx = null;
  this.mu_tx_ = new ydn.db.tr.Mutex(ptx_no);
  this.max_tx_no_ = opt_max_tx_no || 0
};
ydn.db.tr.Serial.DEBUG = false;
ydn.db.tr.Serial.prototype.r_no_;
ydn.db.tr.Serial.prototype.q_no_;
ydn.db.tr.Serial.prototype.storage_;
ydn.db.tr.Serial.prototype.mu_tx_ = null;
ydn.db.tr.Serial.prototype.max_tx_no_ = 0;
ydn.db.tr.Serial.prototype.trQueue_;
ydn.db.tr.Serial.prototype.logger = goog.debug.Logger.getLogger("ydn.db.tr.Serial");
ydn.db.tr.Serial.prototype.getMuTx = function() {
  return this.mu_tx_
};
ydn.db.tr.Serial.prototype.getTxNo = function() {
  return this.mu_tx_.getTxCount()
};
ydn.db.tr.Serial.prototype.getQueueNo = function() {
  return this.q_no_
};
ydn.db.tr.Serial.prototype.getActiveTx = function() {
  return this.mu_tx_.isActiveAndAvailable() ? this.mu_tx_ : null
};
ydn.db.tr.Serial.prototype.isActive = function() {
  return this.mu_tx_.isActiveAndAvailable()
};
ydn.db.tr.Serial.prototype.getStorage = function() {
  return this.storage_
};
ydn.db.tr.Serial.prototype.getTx = function() {
  return this.mu_tx_.isActiveAndAvailable() ? this.mu_tx_.getTx() : null
};
ydn.db.tr.Serial.prototype.lock = function() {
  this.mu_tx_.lock()
};
ydn.db.tr.Serial.prototype.s_request_tx = null;
ydn.db.tr.Serial.prototype.type = function() {
  return this.storage_.getType()
};
ydn.db.tr.Serial.prototype.last_queue_checkin_ = NaN;
ydn.db.tr.Serial.MAX_QUEUE = 1E3;
ydn.db.tr.Serial.prototype.popTxQueue_ = function() {
  var task = this.trQueue_.shift();
  if(task) {
    if(ydn.db.tr.Serial.DEBUG) {
      this.logger.finest("pop tx queue of " + this.trQueue_.length + " " + task.fnc.name)
    }
    this.processTx(task.fnc, task.store_names, task.mode, task.oncompleted)
  }
};
ydn.db.tr.Serial.prototype.peekScopes = function() {
  if(this.trQueue_.length > 0) {
    return this.trQueue_[0].store_names
  }else {
    return null
  }
};
ydn.db.tr.Serial.prototype.peekMode = function() {
  if(this.trQueue_.length > 0) {
    return this.trQueue_[0].mode
  }else {
    return null
  }
};
ydn.db.tr.Serial.prototype.isNextTxCompatible = function() {
  return false
};
ydn.db.tr.Serial.prototype.pushTxQueue = function(trFn, store_names, opt_mode, opt_on_completed) {
  this.logger.finest("Serial push tx queue " + trFn.name);
  this.trQueue_.push({fnc:trFn, store_names:store_names, mode:opt_mode, oncompleted:opt_on_completed})
};
ydn.db.tr.Serial.prototype.abort = function() {
  this.logger.finer(this + ": aborting");
  ydn.db.tr.IThread.abort(this.s_request_tx)
};
ydn.db.tr.Serial.prototype.completed_handlers;
ydn.db.tr.Serial.prototype.processTx = function(trFn, store_names, opt_mode, opt_on_completed) {
  var names = goog.isString(store_names) ? [store_names] : store_names;
  if(goog.DEBUG) {
    if(!goog.isArrayLike(names)) {
      throw new ydn.debug.error.ArgumentException("store names must be an array");
    }else {
      if(names.length == 0) {
        throw new ydn.debug.error.ArgumentException("number of store names must more than 0");
      }else {
        for(var i = 0;i < names.length;i++) {
          if(!goog.isString(names[i])) {
            throw new ydn.debug.error.ArgumentException("store name at " + i + " must be string but found " + names[i] + " of type " + typeof names[i]);
          }
        }
      }
    }
  }
  var mode = goog.isDef(opt_mode) ? opt_mode : ydn.db.base.TransactionMode.READ_ONLY;
  var me = this;
  if(this.mu_tx_.isActive() || !this.getStorage().isReady() && !goog.isNull(this.completed_handlers) > 0) {
    this.pushTxQueue(trFn, store_names, mode, opt_on_completed)
  }else {
    var label = this.getLabel();
    var transaction_process = function(tx) {
      me.mu_tx_.up(tx, store_names, mode);
      label = me.getLabel();
      me.logger.fine(label + " BEGIN " + ydn.json.stringify(store_names) + " " + mode);
      trFn(me);
      trFn = null;
      me.mu_tx_.out();
      while(me.isNextTxCompatible()) {
        var task = me.trQueue_.shift();
        if(task.oncompleted) {
          me.completed_handlers.push(task.oncompleted)
        }
        me.logger.finest("pop tx queue in continue " + task.fnc.name);
        task.fnc()
      }
    };
    var completed_handler = function(type, event) {
      if(type == ydn.db.base.TxEventTypes.COMPLETE) {
        me.logger.fine(label + " COMMITTED")
      }else {
        me.logger.fine(label + " COMMITTED" + " with " + type)
      }
      try {
        var fn;
        while(fn = me.completed_handlers.shift()) {
          fn(type, event)
        }
      }catch(e) {
        if(goog.DEBUG) {
          throw e;
        }
      }finally {
        me.mu_tx_.down(type, event);
        me.popTxQueue_()
      }
      me.r_no_ = 0
    };
    this.completed_handlers = opt_on_completed ? [opt_on_completed] : [];
    if(this.max_tx_no_ && this.getTxNo() >= this.max_tx_no_) {
      throw new ydn.debug.error.InvalidOperationException("Exceed maximum number of transactions of " + this.max_tx_no_);
    }
    this.storage_.transaction(transaction_process, names, mode, completed_handler)
  }
};
ydn.db.tr.Serial.prototype.reusedTx = function(store_names, mode) {
  return false
};
ydn.db.tr.Serial.prototype.getLabel = function() {
  return this.mu_tx_.getLabel()
};
ydn.db.tr.Serial.prototype.exec = function(df, callback, store_names, opt_mode, on_complete) {
  var mode = opt_mode || ydn.db.base.TransactionMode.READ_ONLY;
  var me = this;
  var rq_label;
  if(me.mu_tx_.isActiveAndAvailable() && this.reusedTx(store_names, mode)) {
    var tx = me.mu_tx_.getTx();
    var resultCallback = function(result, opt_is_error) {
      me.s_request_tx = tx;
      if(opt_is_error) {
        me.logger.finer(rq_label + " ERROR");
        df.errback(result)
      }else {
        me.logger.finer(rq_label + " SUCCESS");
        df.callback(result)
      }
      me.s_request_tx = null
    };
    me.r_no_++;
    rq_label = me.getLabel() + "R" + me.r_no_;
    me.logger.finer(rq_label + " BEGIN");
    callback(tx, rq_label, resultCallback);
    me.logger.finer(rq_label + " END");
    callback = null
  }else {
    var tx_callback = function(cb) {
      var tx = me.mu_tx_.getTx();
      var resultCallback2 = function(result, opt_is_error) {
        me.s_request_tx = tx;
        if(opt_is_error) {
          me.logger.finer(rq_label + " ERROR");
          df.errback(result)
        }else {
          me.logger.finer(rq_label + " SUCCESS");
          df.callback(result)
        }
        me.s_request_tx = null
      };
      me.r_no_++;
      rq_label = me.getLabel() + "R" + me.r_no_;
      me.logger.finer(rq_label + " BEGIN");
      callback(tx, rq_label, resultCallback2);
      me.logger.finer(rq_label + " END");
      callback = null
    };
    me.processTx(tx_callback, store_names, mode, on_complete)
  }
};
ydn.db.tr.Serial.prototype.getName = function() {
  return this.getStorage().getName()
};
if(goog.DEBUG) {
  ydn.db.tr.Serial.prototype.toString = function() {
    var s = !!this.s_request_tx ? "*" : "";
    return"Serial" + ":" + this.getLabel() + s
  }
}
;goog.provide("ydn.db.tr.AtomicSerial");
goog.require("ydn.db.tr.IThread");
goog.require("ydn.db.tr.Serial");
goog.require("ydn.error.NotSupportedException");
ydn.db.tr.AtomicSerial = function(storage, ptx_no) {
  goog.base(this, storage, ptx_no)
};
goog.inherits(ydn.db.tr.AtomicSerial, ydn.db.tr.Serial);
ydn.db.tr.AtomicSerial.DEBUG = false;
ydn.db.tr.AtomicSerial.prototype.logger = goog.debug.Logger.getLogger("ydn.db.tr.AtomicSerial");
ydn.db.tr.AtomicSerial.prototype.exec = function(df, callback, store_names, mode, on_completed) {
  var result;
  var is_error;
  var cdf = new goog.async.Deferred;
  cdf.addCallbacks(function(x) {
    is_error = false;
    result = x
  }, function(e) {
    is_error = true;
    result = e
  });
  var completed_handler = function(t, e) {
    if(is_error === true) {
      df.errback(result)
    }else {
      if(is_error === false) {
        df.callback(result)
      }else {
        var err = new ydn.db.TimeoutError;
        df.errback(err)
      }
    }
    if(on_completed) {
      on_completed(t, e);
      on_completed = undefined
    }
  };
  goog.base(this, "exec", cdf, callback, store_names, mode, completed_handler)
};
goog.provide("ydn.db.tr.DbOperator");
goog.require("ydn.db.tr.AtomicSerial");
goog.require("ydn.db.tr.IThread");
goog.require("ydn.db.crud.IOperator");
goog.require("ydn.error.NotSupportedException");
ydn.db.tr.DbOperator = function(storage, schema, tx_thread, sync_thread) {
  this.storage_ = storage;
  this.schema = schema;
  this.tx_thread = tx_thread;
  this.sync_thread = sync_thread;
  this.executor = null
};
ydn.db.tr.DbOperator.prototype.logger = goog.debug.Logger.getLogger("ydn.db.tr.DbOperator");
ydn.db.tr.DbOperator.prototype.executor;
ydn.db.tr.DbOperator.prototype.tx_thread;
ydn.db.tr.DbOperator.prototype.sync_thread;
ydn.db.tr.DbOperator.prototype.getTxNo = function() {
  return this.tx_thread.getTxNo()
};
ydn.db.tr.DbOperator.prototype.abort = function() {
  this.tx_thread.abort()
};
ydn.db.tr.DbOperator.prototype.getExecutor = function() {
  if(!this.executor) {
    this.executor = this.storage_.newExecutor()
  }
  return this.executor
};
ydn.db.tr.DbOperator.prototype.getStorage = function() {
  return this.storage_
};
ydn.db.tr.DbOperator.prototype.addStoreSchema = function(store) {
  return this.getStorage().addStoreSchema(store)
};
if(goog.DEBUG) {
  ydn.db.tr.DbOperator.prototype.toString = function() {
    var s = "TxStorage:" + this.getStorage().getName();
    return s
  }
}
;goog.provide("ydn.db.crud.DbOperator");
goog.require("goog.debug.Logger");
goog.require("ydn.db");
goog.require("ydn.db.ISyncOperator");
goog.require("ydn.db.Key");
goog.require("ydn.db.crud.IOperator");
goog.require("ydn.db.tr.AtomicSerial");
goog.require("ydn.db.tr.DbOperator");
goog.require("ydn.db.tr.IThread");
goog.require("ydn.debug.error.ArgumentException");
goog.require("ydn.error.NotSupportedException");
ydn.db.crud.DbOperator = function(storage, schema, tx_thread, sync_thread) {
  goog.base(this, storage, schema, tx_thread, sync_thread)
};
goog.inherits(ydn.db.crud.DbOperator, ydn.db.tr.DbOperator);
ydn.db.crud.DbOperator.prototype.logger = goog.debug.Logger.getLogger("ydn.db.crud.DbOperator");
ydn.db.crud.DbOperator.prototype.count = function(store_name, index_or_keyrange, index_key_range, unique) {
  var df = ydn.db.base.createDeferred();
  var me = this;
  var store_names;
  var index_name;
  var key_range;
  if(!goog.isDef(store_name)) {
    if(goog.isDef(index_key_range) || goog.isDef(index_or_keyrange)) {
      throw new ydn.debug.error.ArgumentException("too many arguments.");
    }
    store_names = this.schema.getStoreNames();
    var dfl = new goog.async.Deferred;
    this.logger.finer("countStores: " + ydn.json.stringify(store_names));
    this.tx_thread.exec(df, function(tx, tx_no, cb) {
      me.getExecutor().countStores(tx, tx_no, cb, store_names)
    }, store_names, ydn.db.base.TransactionMode.READ_ONLY);
    df.addCallbacks(function(count) {
      var total = goog.array.reduce(count, function(p, x) {
        return x + p
      }, 0);
      dfl.callback(total)
    }, function(e) {
      dfl.errback(e)
    });
    return dfl
  }else {
    if(goog.isArray(store_name)) {
      if(goog.isDef(index_key_range) || goog.isDef(index_or_keyrange)) {
        throw new ydn.debug.error.ArgumentException("too many arguments.");
      }
      store_names = store_name;
      for(var i = 0;i < store_names.length;i++) {
        if(!this.schema.hasStore(store_names[i])) {
          throw new ydn.debug.error.ArgumentException('store name "' + store_names[i] + '" at ' + i + " not found.");
        }
      }
      this.logger.finer("countStores: " + ydn.json.stringify(store_names));
      this.tx_thread.exec(df, function(tx, tx_no, cb) {
        me.getExecutor().countStores(tx, tx_no, cb, store_names)
      }, store_names, ydn.db.base.TransactionMode.READ_ONLY)
    }else {
      if(goog.isString(store_name)) {
        if(!this.schema.hasStore(store_name)) {
          throw new ydn.debug.error.ArgumentException('store name "' + store_name + '" not found.');
        }
        if(goog.DEBUG && goog.isDef(unique) && !goog.isBoolean(unique)) {
          throw new TypeError('unique value "' + unique + '" must be boolean, but found ' + typeof unique + ".");
        }
        store_names = [store_name];
        if(goog.isString(index_or_keyrange)) {
          index_name = index_or_keyrange;
          if(goog.isObject(index_key_range)) {
            if(goog.DEBUG) {
              var msg1 = ydn.db.KeyRange.validate(index_key_range);
              if(msg1) {
                throw new ydn.debug.error.ArgumentException("invalid key range: " + ydn.json.toShortString(index_key_range) + " " + msg1);
              }
            }
            key_range = ydn.db.KeyRange.parseIDBKeyRange(index_key_range)
          }else {
            if(goog.DEBUG && goog.isDefAndNotNull(index_key_range)) {
              throw new ydn.debug.error.ArgumentException("invalid key range: " + ydn.json.toShortString(index_key_range) + " of type " + typeof index_key_range);
            }
            key_range = null
          }
        }else {
          if(goog.isObject(index_or_keyrange) || !goog.isDef(index_or_keyrange)) {
            if(goog.isObject(index_or_keyrange)) {
              if(goog.DEBUG) {
                var msg = ydn.db.KeyRange.validate(index_or_keyrange);
                if(msg) {
                  throw new ydn.debug.error.ArgumentException("invalid key range: " + ydn.json.toShortString(index_or_keyrange) + " " + msg);
                }
              }
              key_range = ydn.db.KeyRange.parseIDBKeyRange(index_or_keyrange)
            }else {
              if(goog.isDefAndNotNull(index_or_keyrange)) {
                throw new ydn.debug.error.ArgumentException("key range must be " + " an object but found " + ydn.json.toShortString(index_or_keyrange) + " of type " + typeof index_or_keyrange);
              }
              key_range = null
            }
          }else {
            throw new ydn.debug.error.ArgumentException("key range must be an " + "object, but " + ydn.json.toShortString(index_key_range) + " of type " + typeof index_or_keyrange + " found.");
          }
        }
        this.logger.finer("countKeyRange: " + store_names[0] + " " + (index_name ? index_name : "") + ydn.json.stringify(key_range));
        this.tx_thread.exec(df, function(tx, tx_no, cb) {
          me.getExecutor().countKeyRange(tx, tx_no, cb, store_names[0], key_range, index_name, !!unique)
        }, store_names, ydn.db.base.TransactionMode.READ_ONLY)
      }else {
        throw new ydn.debug.error.ArgumentException("Invalid store name or store names.");
      }
    }
  }
  return df
};
ydn.db.crud.DbOperator.prototype.get = function(arg1, arg2) {
  var me = this;
  var df = ydn.db.base.createDeferred();
  if(arg1 instanceof ydn.db.Key) {
    var k = arg1;
    var k_store_name = k.getStoreName();
    if(!this.schema.hasStore(k_store_name)) {
      if(this.schema.isAutoSchema()) {
        return goog.async.Deferred.succeed(undefined)
      }else {
        throw new ydn.debug.error.ArgumentException("Store: " + k_store_name + " not found.");
      }
    }
    var kid = k.getId();
    this.logger.finer("getById: " + k_store_name + ":" + kid);
    this.tx_thread.exec(df, function(tx, tx_no, cb) {
      me.getExecutor().getById(tx, tx_no, cb, k_store_name, kid)
    }, [k_store_name], ydn.db.base.TransactionMode.READ_ONLY)
  }else {
    if(goog.isString(arg1) && goog.isDef(arg2)) {
      var store_name = arg1;
      var store = this.schema.getStore(store_name);
      if(!store) {
        if(this.schema.isAutoSchema()) {
          return goog.async.Deferred.succeed(undefined)
        }else {
          throw new ydn.debug.error.ArgumentException('Store name "' + store_name + '" not found.');
        }
      }
      if(arg2 instanceof ydn.db.IDBKeyRange || arg2 instanceof ydn.db.KeyRange) {
        var list_df = new goog.async.Deferred;
        list_df.addCallbacks(function(x) {
          df.callback(x[0])
        }, function(e) {
          df.errback(e)
        });
        if(goog.DEBUG) {
          var msg = ydn.db.KeyRange.validate(arg2);
          if(msg) {
            throw new ydn.debug.error.ArgumentException("invalid key range: " + arg2 + " " + msg);
          }
        }
        var key_range = ydn.db.KeyRange.parseIDBKeyRange(arg2);
        this.logger.finer("getById: " + store_name + ":" + ydn.json.stringify(key_range));
        this.tx_thread.exec(list_df, function(tx, tx_no, cb) {
          me.getExecutor().listByKeyRange(tx, tx_no, cb, store_name, key_range, false, 1, 0)
        }, [store_name], ydn.db.base.TransactionMode.READ_ONLY)
      }else {
        var id = arg2;
        this.logger.finer("getById: " + store_name + ":" + id);
        if(ydn.db.base.USE_HOOK) {
          var req_df = new goog.async.Deferred;
          this.tx_thread.exec(req_df, function(tx, tx_no, cb) {
            me.getExecutor().getById(tx, tx_no, cb, store_name, id)
          }, [store_name], ydn.db.base.TransactionMode.READ_ONLY);
          req_df.addCallbacks(function(record) {
            store.postHook(ydn.db.schema.Store.SyncMethod.GET, {}, function(x) {
              df.callback(x)
            }, record, id)
          }, function(e) {
            df.errback(e)
          })
        }else {
          this.tx_thread.exec(df, function(tx, tx_no, cb) {
            me.getExecutor().getById(tx, tx_no, cb, store_name, id)
          }, [store_name], ydn.db.base.TransactionMode.READ_ONLY)
        }
      }
    }else {
      throw new ydn.debug.error.ArgumentException("get require valid input arguments.");
    }
  }
  return df
};
ydn.db.crud.DbOperator.prototype.keys = function(opt_store_name, arg1, arg2, arg3, arg4, arg5) {
  var me = this;
  var limit;
  var offset;
  var range = null;
  var reverse = false;
  var store_name = (opt_store_name);
  var store = this.schema.getStore(store_name);
  if(goog.DEBUG) {
    if(!goog.isString(store_name)) {
      throw new ydn.debug.error.ArgumentException("store name must be a string, " + "but " + store_name + " of type " + typeof store_name + " is not.");
    }
    if(!this.schema.isAutoSchema()) {
      if(!store) {
        throw new ydn.debug.error.ArgumentException('store name "' + store_name + '" not found.');
      }
      if(goog.isString(arg1)) {
        var index = store.getIndex(arg1);
        if(!index) {
          throw new ydn.debug.error.ArgumentException('index "' + arg1 + '" not found in store "' + store_name + '".');
        }
      }
    }
  }
  if(this.schema.isAutoSchema() && !store) {
    return goog.async.Deferred.succeed([])
  }
  var df = new goog.async.Deferred;
  if(goog.isString(arg1)) {
    var index_name = arg1;
    if(goog.DEBUG) {
      var msg = ydn.db.KeyRange.validate((arg2));
      if(msg) {
        throw new ydn.debug.error.ArgumentException("invalid key range: " + arg2 + " " + msg);
      }
    }
    range = ydn.db.KeyRange.parseIDBKeyRange((arg2));
    if(goog.isNumber(arg3)) {
      limit = arg3
    }else {
      if(!goog.isDef(arg3)) {
        limit = ydn.db.base.DEFAULT_RESULT_LIMIT
      }else {
        throw new ydn.debug.error.ArgumentException("limit must be a number");
      }
    }
    if(goog.isNumber(arg4)) {
      offset = arg4
    }else {
      if(!goog.isDef(arg4)) {
        offset = 0
      }else {
        throw new ydn.debug.error.ArgumentException("offset must be a number");
      }
    }
    if(goog.isDef(arg5)) {
      if(goog.isBoolean) {
        reverse = arg5
      }else {
        throw new ydn.debug.error.ArgumentException("reverse must be a boolean");
      }
    }
    this.logger.finer("keysByIndexKeyRange: " + store_name);
    this.tx_thread.exec(df, function(tx, tx_no, cb) {
      me.getExecutor().keysByIndexKeyRange(tx, tx_no, cb, store_name, index_name, range, reverse, limit, offset, false)
    }, [store_name], ydn.db.base.TransactionMode.READ_ONLY)
  }else {
    if(goog.isObject(arg1)) {
      if(goog.DEBUG) {
        var msg = ydn.db.KeyRange.validate(arg1);
        if(msg) {
          throw new ydn.debug.error.ArgumentException("invalid key range: " + ydn.json.toShortString(arg1) + " " + msg);
        }
      }
      range = ydn.db.KeyRange.parseIDBKeyRange(arg1)
    }else {
      if(goog.DEBUG && goog.isDefAndNotNull(arg1)) {
        throw new TypeError("invalid key range: " + ydn.json.toShortString(arg1) + " of type " + typeof arg1);
      }
      range = null
    }
    if(goog.isNumber(arg2)) {
      limit = arg2
    }else {
      if(!goog.isDef(arg2)) {
        limit = ydn.db.base.DEFAULT_RESULT_LIMIT
      }else {
        throw new ydn.debug.error.ArgumentException("limit must be a number");
      }
    }
    if(goog.isNumber(arg3)) {
      offset = arg3
    }else {
      if(!goog.isDef(arg3)) {
        offset = 0
      }else {
        throw new ydn.debug.error.ArgumentException("offset must be a number");
      }
    }
    if(goog.isDef(arg4)) {
      if(goog.isBoolean(arg4)) {
        reverse = arg4
      }else {
        throw new ydn.debug.error.ArgumentException("reverse must be a boolean");
      }
    }
    this.logger.finer("keysByKeyRange: " + store_name);
    this.tx_thread.exec(df, function(tx, tx_no, cb) {
      me.getExecutor().keysByKeyRange(tx, tx_no, cb, store_name, range, reverse, limit, offset)
    }, [store_name], ydn.db.base.TransactionMode.READ_ONLY)
  }
  return df
};
ydn.db.crud.DbOperator.prototype.values = function(arg1, arg2, arg3, arg4, arg5, arg6) {
  var me = this;
  var df = ydn.db.base.createDeferred();
  var limit;
  var offset;
  var reverse = false;
  if(goog.isString(arg1)) {
    var store_name = arg1;
    var store = this.schema.getStore(store_name);
    if(!store) {
      if(this.schema.isAutoSchema()) {
        return goog.async.Deferred.succeed([])
      }else {
        throw new ydn.db.NotFoundError(store_name);
      }
    }
    if(goog.isArray(arg2)) {
      if(goog.DEBUG && (goog.isDef(arg3) || goog.isDef(arg4))) {
        throw new ydn.debug.error.ArgumentException("too many input arguments");
      }
      var ids = arg2;
      this.logger.finer("listByIds: " + store_name + " " + ids.length + " ids");
      this.tx_thread.exec(df, function(tx, tx_no, cb) {
        me.getExecutor().listByIds(tx, tx_no, cb, store_name, ids)
      }, [store_name], ydn.db.base.TransactionMode.READ_ONLY)
    }else {
      if(goog.isString(arg2)) {
        var index_name = arg2;
        if(goog.DEBUG) {
          var msg = ydn.db.KeyRange.validate((arg3));
          if(msg) {
            throw new ydn.debug.error.ArgumentException("invalid key range: " + arg3 + " " + msg);
          }
        }
        var range = ydn.db.KeyRange.parseIDBKeyRange((arg3));
        if(!goog.isDef(arg4)) {
          limit = ydn.db.base.DEFAULT_RESULT_LIMIT
        }else {
          if(goog.isNumber(arg4)) {
            limit = arg4
          }else {
            throw new ydn.debug.error.ArgumentException("limit must be a number.");
          }
        }
        if(!goog.isDef(arg5)) {
          offset = 0
        }else {
          if(goog.isNumber(arg5)) {
            offset = arg5
          }else {
            throw new ydn.debug.error.ArgumentException("offset must be a number.");
          }
        }
        if(goog.isBoolean(arg6)) {
          reverse = arg6
        }else {
          if(goog.isDef(arg6)) {
            throw new ydn.debug.error.ArgumentException("reverse must be a boolean, but " + arg6);
          }
        }
        this.logger.finer("listByIndexKeyRange: " + store_name + ":" + index_name);
        if(ydn.db.base.USE_HOOK) {
          var opt = {index:index_name, reverse:reverse, offset:offset, limit:limit};
          store.preHook(ydn.db.schema.Store.SyncMethod.LIST, opt, function() {
            me.logger.finest("listByIndexKeyRange: continue from preHook");
            me.sync_thread.exec(df, function(tx, tx_no, cb) {
              me.getExecutor().listByIndexKeyRange(tx, tx_no, cb, store_name, index_name, range, reverse, limit, offset, false)
            }, [store_name], ydn.db.base.TransactionMode.READ_ONLY)
          }, 100)
        }else {
          this.tx_thread.exec(df, function(tx, tx_no, cb) {
            me.getExecutor().listByIndexKeyRange(tx, tx_no, cb, store_name, index_name, range, reverse, limit, offset, false)
          }, [store_name], ydn.db.base.TransactionMode.READ_ONLY)
        }
      }else {
        var range = null;
        if(goog.isObject(arg2)) {
          if(goog.DEBUG) {
            var msg = ydn.db.KeyRange.validate(arg2);
            if(msg) {
              throw new ydn.debug.error.ArgumentException("invalid key range: " + arg2 + " " + msg);
            }
          }
          range = ydn.db.KeyRange.parseIDBKeyRange(arg2)
        }else {
          if(goog.DEBUG && goog.isDefAndNotNull(arg2)) {
            throw new TypeError('expect key range object, but found "' + ydn.json.toShortString(arg2) + '" of type ' + typeof arg2);
          }
        }
        if(!goog.isDef(arg3)) {
          limit = ydn.db.base.DEFAULT_RESULT_LIMIT
        }else {
          if(goog.isNumber(arg3)) {
            limit = arg3
          }else {
            throw new ydn.debug.error.ArgumentException("limit must be a number, " + "but " + arg3 + " is " + typeof arg3);
          }
        }
        if(!goog.isDef(arg4)) {
          offset = 0
        }else {
          if(goog.isNumber(arg4)) {
            offset = arg4
          }else {
            throw new ydn.debug.error.ArgumentException("offset must be a number, " + "but " + arg4 + " is " + typeof arg4);
          }
        }
        if(goog.isDef(arg5)) {
          if(goog.isBoolean(arg5)) {
            reverse = arg5
          }else {
            throw new ydn.debug.error.ArgumentException("reverse must be a " + "boolean, but " + arg5 + " is " + typeof arg5);
          }
        }
        this.logger.finer((range ? "listByKeyRange: " : "listByStore: ") + store_name);
        if(ydn.db.base.USE_HOOK) {
          var opt = {index:null, offset:offset, reverse:reverse};
          store.preHook(ydn.db.schema.Store.SyncMethod.LIST, opt, function() {
            me.tx_thread.exec(df, function(tx, tx_no, cb) {
              me.getExecutor().listByKeyRange(tx, tx_no, cb, store_name, range, reverse, limit, offset)
            }, [store_name], ydn.db.base.TransactionMode.READ_ONLY)
          })
        }else {
          this.tx_thread.exec(df, function(tx, tx_no, cb) {
            me.getExecutor().listByKeyRange(tx, tx_no, cb, store_name, range, reverse, limit, offset)
          }, [store_name], ydn.db.base.TransactionMode.READ_ONLY)
        }
      }
    }
  }else {
    if(goog.isArray(arg1)) {
      if(arg1[0] instanceof ydn.db.Key) {
        var store_names = [];
        var keys = (arg1);
        for(var i = 0;i < keys.length;i++) {
          var key = keys[i];
          var i_store_name = key.getStoreName();
          if(!this.schema.hasStore(i_store_name)) {
            if(this.schema.isAutoSchema()) {
              var fail_array = [];
              fail_array[keys.length - 1] = undefined;
              return goog.async.Deferred.succeed(fail_array)
            }else {
              throw new ydn.debug.error.ArgumentException("Store: " + i_store_name + " not found.");
            }
          }
          if(!goog.array.contains(store_names, i_store_name)) {
            store_names.push(i_store_name)
          }
        }
        this.logger.finer("listByKeys: " + ydn.json.stringify(store_names) + " " + keys.length + " keys");
        this.tx_thread.exec(df, function(tx, tx_no, cb) {
          me.getExecutor().listByKeys(tx, tx_no, cb, keys)
        }, store_names, ydn.db.base.TransactionMode.READ_ONLY)
      }else {
        throw new ydn.debug.error.ArgumentException("first argument" + "must be array of ydn.db.Key, but " + arg1[0] + " of " + typeof arg1[0] + " found.");
      }
    }else {
      throw new ydn.debug.error.ArgumentException("first argument " + arg1 + " is invalid.");
    }
  }
  return df
};
ydn.db.crud.DbOperator.prototype.add = function(store_name_or_schema, value, opt_keys) {
  var store_name = goog.isString(store_name_or_schema) ? store_name_or_schema : goog.isObject(store_name_or_schema) ? store_name_or_schema["name"] : undefined;
  if(!goog.isString(store_name)) {
    throw new ydn.debug.error.ArgumentException("store name " + store_name + " must be a string, but " + typeof store_name);
  }
  var store = this.schema.getStore(store_name);
  if(!store) {
    if(!this.schema.isAutoSchema()) {
      throw new ydn.debug.error.ArgumentException('store name "' + store_name + '" not found.');
    }
    var schema = goog.isObject(store_name_or_schema) ? store_name_or_schema : {"name":store_name};
    store = ydn.db.schema.Store.fromJSON((schema));
    this.logger.finer("Adding object store: " + store_name);
    this.addStoreSchema(store)
  }else {
    if(this.schema.isAutoSchema() && goog.isObject(store_name_or_schema)) {
      var new_schema = ydn.db.schema.Store.fromJSON(store_name_or_schema);
      var diff = store.difference(new_schema);
      if(diff) {
        throw new ydn.error.NotSupportedException(diff);
      }
    }
  }
  var df = ydn.db.base.createDeferred();
  var me = this;
  if(!store) {
    throw new ydn.debug.error.ArgumentException('store name "' + store_name + '" not found.');
  }
  if(goog.isString(store.keyPath) && goog.isDef(opt_keys)) {
    throw new ydn.debug.error.ArgumentException("key must not be provided while the store uses in-line key.");
  }else {
    if(!store.usedInlineKey() && !store.autoIncrement && !goog.isDef(opt_keys)) {
      throw new ydn.debug.error.ArgumentException("out-of-line key must be provided.");
    }
  }
  if(goog.isArray(value)) {
    var objs = value;
    var keys = (opt_keys);
    this.logger.finer("addObjects: " + store_name + " " + objs.length + " objects");
    this.tx_thread.exec(df, function(tx, tx_no, cb) {
      me.getExecutor().addObjects(tx, tx_no, cb, store_name, objs, keys)
    }, [store_name], ydn.db.base.TransactionMode.READ_WRITE);
    if(store.dispatch_events) {
      df.addCallback(function(keys) {
        var event = new ydn.db.events.StoreEvent(ydn.db.events.Types.CREATED, me.getStorage(), store.getName(), keys, objs);
        me.getStorage().dispatchEvent(event)
      })
    }
  }else {
    if(goog.isObject(value)) {
      var obj = value;
      var key = (opt_keys);
      var label = "store: " + store_name + " key: " + store.usedInlineKey() ? store.extractKey(obj) : key;
      this.logger.finer("addObject: " + label);
      if(ydn.db.base.USE_HOOK) {
        var post_df = new goog.async.Deferred;
        var opt = {};
        store.preHook(ydn.db.schema.Store.SyncMethod.ADD, opt, function(obj) {
          if(goog.isObject(obj)) {
            me.logger.finest("addObject prehook: " + label);
            me.tx_thread.exec(post_df, function(tx, tx_no, cb) {
              me.getExecutor().addObject(tx, tx_no, cb, store_name, obj, key)
            }, [store_name], ydn.db.base.TransactionMode.READ_WRITE)
          }else {
            me.logger.finer("prehook reject add: " + label);
            post_df.errback()
          }
        }, obj, key);
        post_df.addCallbacks(function(key) {
          df.callback(key)
        }, function(e) {
          df.errback(e)
        })
      }else {
        this.tx_thread.exec(df, function(tx, tx_no, cb) {
          me.getExecutor().addObject(tx, tx_no, cb, store_name, obj, key)
        }, [store_name], ydn.db.base.TransactionMode.READ_WRITE)
      }
      if(store.dispatch_events) {
        df.addCallback(function(key) {
          var event = new ydn.db.events.RecordEvent(ydn.db.events.Types.CREATED, me.getStorage(), store.getName(), key, obj);
          me.getStorage().dispatchEvent(event)
        })
      }
    }else {
      throw new ydn.debug.error.ArgumentException("record must be an object or " + "array list of objects" + ", but " + value + " of type " + typeof value + " found.");
    }
  }
  return df
};
ydn.db.crud.DbOperator.prototype.getStore_ = function(store_name_schema) {
  var store_name = goog.isString(store_name_schema) ? store_name_schema : goog.isObject(store_name_schema) ? store_name_schema["name"] : undefined;
  if(!goog.isString(store_name)) {
    throw new ydn.debug.error.ArgumentException("store name must be a string");
  }
  var store = this.schema.getStore(store_name);
  if(!store) {
    if(!this.schema.isAutoSchema()) {
      throw new ydn.db.NotFoundError(store_name);
    }
    var schema = goog.isObject(store_name_schema) ? store_name_schema : {"name":store_name};
    store = ydn.db.schema.Store.fromJSON((schema));
    this.logger.finer("Adding object store: " + store_name);
    this.addStoreSchema(store)
  }else {
    if(this.schema.isAutoSchema() && goog.isObject(store_name_schema)) {
      var new_schema = ydn.db.schema.Store.fromJSON(store_name_schema);
      var diff = store.difference(new_schema);
      if(diff) {
        throw new ydn.error.NotSupportedException(diff);
      }
    }
  }
  if(!store) {
    throw new ydn.db.NotFoundError(store_name);
  }
  return store
};
ydn.db.crud.DbOperator.prototype.load = function(store_name_or_schema, data, opt_delimiter) {
  var delimiter = opt_delimiter || ",";
  var store = this.getStore_(store_name_or_schema);
  var store_name = store.getName();
  var df = ydn.db.base.createDeferred();
  var me = this;
  this.tx_thread.exec(df, function(tx, tx_no, cb) {
    me.getExecutor().putData(tx, tx_no, cb, store_name, data, delimiter)
  }, [store_name], ydn.db.base.TransactionMode.READ_WRITE);
  return df
};
ydn.db.crud.DbOperator.prototype.put = function(arg1, value, opt_keys) {
  var df = ydn.db.base.createDeferred();
  var me = this;
  if(arg1 instanceof ydn.db.Key) {
    var k = arg1;
    var k_s_name = k.getStoreName();
    var k_store = this.schema.getStore(k_s_name);
    if(!k_store) {
      throw new ydn.debug.error.ArgumentException('store "' + k_s_name + '" not found.');
    }
    if(k_store.usedInlineKey()) {
      var v_k = k_store.extractKey(value);
      if(goog.isDefAndNotNull(v_k)) {
        if(ydn.db.cmp(v_k, k.getId()) != 0) {
          throw new ydn.debug.error.ArgumentException("Inline key must be " + k + " but " + v_k + " found.");
        }
      }else {
        k_store.setKeyValue(value, k.getId())
      }
      return this.put(k_s_name, value)
    }else {
      return this.put(k_s_name, value, k.getId())
    }
  }else {
    if(goog.isArray(arg1)) {
      if(goog.isDef(opt_keys)) {
        throw new ydn.debug.error.ArgumentException("too many arguments");
      }
      var db_keys = (arg1);
      if(goog.DEBUG && !goog.isDef(value)) {
        throw new ydn.debug.error.ArgumentException("record values required");
      }
      goog.asserts.assertArray(value, "record values must also be in an array");
      var values = (value);
      goog.asserts.assert(db_keys.length === values.length, "number of keys " + "and number of object must be same, but found " + db_keys.length + " vs. " + values.length);
      var store_names = [];
      for(var i = 0, n = db_keys.length;i < n;i++) {
        var s_name = db_keys[i].getStoreName();
        if(goog.array.indexOf(store_names, s_name) == -1) {
          store_names.push(s_name)
        }
        var store = this.schema.getStore(s_name);
        if(!store) {
          throw new ydn.debug.error.ArgumentException('store "' + s_name + '" not found.');
        }
        if(store.usedInlineKey()) {
          store.setKeyValue(values[i], db_keys[i].getId())
        }
      }
      this.logger.finer("putByKeys: to " + ydn.json.stringify(store_names) + " " + values.length + " objects");
      this.tx_thread.exec(df, function(tx, tx_no, cb) {
        me.getExecutor().putByKeys(tx, tx_no, cb, values, db_keys)
      }, store_names, ydn.db.base.TransactionMode.READ_WRITE)
    }else {
      if(goog.isString(arg1) || goog.isObject(arg1)) {
        var store = this.getStore_(arg1);
        var store_name = store.getName();
        if(store.usedInlineKey() && goog.isDef(opt_keys)) {
          throw new ydn.debug.error.ArgumentException("key must not be provided while the store uses in-line key.");
        }else {
          if(!store.usedInlineKey() && !store.autoIncrement && !goog.isDef(opt_keys)) {
            throw new ydn.debug.error.ArgumentException("out-of-line key must be provided.");
          }
        }
        if(goog.isArray(value)) {
          var objs = value;
          var keys = (opt_keys);
          this.logger.finer("putObjects: " + store_name + " " + objs.length + " objects");
          this.tx_thread.exec(df, function(tx, tx_no, cb) {
            me.getExecutor().putObjects(tx, tx_no, cb, store_name, objs, keys)
          }, [store_name], ydn.db.base.TransactionMode.READ_WRITE);
          if(store.dispatch_events) {
            df.addCallback(function(keys) {
              var event = new ydn.db.events.StoreEvent(ydn.db.events.Types.UPDATED, me.getStorage(), store_name, keys, objs);
              me.getStorage().dispatchEvent(event)
            })
          }
        }else {
          if(goog.isObject(value)) {
            var obj = value;
            var key = (opt_keys);
            if(goog.DEBUG) {
              if(goog.isDef(key)) {
                goog.asserts.assert(ydn.db.Key.isValidKey(key), key + " of type " + typeof key + " is invalid key for " + ydn.json.toShortString(obj))
              }else {
                if(!store.getAutoIncrement() && store.usedInlineKey()) {
                  goog.asserts.assert(ydn.db.Key.isValidKey(store.extractKey(obj)), "in-line key on " + store.getKeyPath() + " must provided in " + ydn.json.toShortString(obj))
                }
              }
            }
            this.logger.finer("putObject: " + store_name + " " + key);
            if(ydn.db.base.USE_HOOK) {
              var post_df = new goog.async.Deferred;
              var opt = {};
              store.preHook(ydn.db.schema.Store.SyncMethod.PUT, opt, function(obj) {
                goog.asserts.assertObject(obj);
                me.tx_thread.exec(df, function(tx, tx_no, cb) {
                  me.getExecutor().putObject(tx, tx_no, cb, store_name, obj, key)
                }, [store_name], ydn.db.base.TransactionMode.READ_WRITE)
              }, obj, key);
              post_df.addCallbacks(function(key) {
                df.callback(key)
              }, function(e) {
                df.errback(e)
              })
            }else {
              this.tx_thread.exec(df, function(tx, tx_no, cb) {
                me.getExecutor().putObject(tx, tx_no, cb, store_name, obj, key)
              }, [store_name], ydn.db.base.TransactionMode.READ_WRITE)
            }
            if(store.dispatch_events) {
              df.addCallback(function(key) {
                var event = new ydn.db.events.RecordEvent(ydn.db.events.Types.UPDATED, me.getStorage(), store_name, key, obj);
                me.getStorage().dispatchEvent(event)
              })
            }
          }else {
            throw new ydn.debug.error.ArgumentException("put record value must be " + "Object or array of Objects");
          }
        }
      }else {
        throw new ydn.debug.error.ArgumentException("the first argument of put " + "must be store name, store schema or array of keys.");
      }
    }
  }
  return df
};
ydn.db.crud.DbOperator.prototype.dumpInternal = function(store_name, objs, opt_keys) {
  var df = new goog.async.Deferred;
  var me = this;
  var on_completed = function(t, e) {
    if(t == ydn.db.base.TxEventTypes.COMPLETE) {
      df.callback()
    }else {
      df.errback()
    }
  };
  this.sync_thread.exec(df, function(tx, tx_no, cb) {
    me.getExecutor().putObjects(tx, tx_no, cb, store_name, objs, opt_keys)
  }, [store_name], ydn.db.base.TransactionMode.READ_WRITE, on_completed);
  return df
};
ydn.db.crud.DbOperator.prototype.listInternal = function(store_name, index_name, key_range, reverse, limit) {
  var df = new goog.async.Deferred;
  var me = this;
  var out;
  var on_completed = function(t, e) {
    if(t == ydn.db.base.TxEventTypes.COMPLETE) {
      df.callback(out)
    }else {
      df.errback(e)
    }
    out = null
  };
  var req_df = new goog.async.Deferred;
  req_df.addBoth(function(x) {
    out = x
  });
  var kr = ydn.db.KeyRange.parseIDBKeyRange(key_range);
  if(goog.isString(index_name)) {
    var index = index_name;
    this.sync_thread.exec(req_df, function(tx, tx_no, cb) {
      me.getExecutor().listByIndexKeyRange(tx, tx_no, cb, store_name, index, kr, reverse, limit, 0, false)
    }, [store_name], ydn.db.base.TransactionMode.READ_ONLY, on_completed)
  }else {
    this.sync_thread.exec(req_df, function(tx, tx_no, cb) {
      me.getExecutor().listByKeyRange(tx, tx_no, cb, store_name, kr, reverse, limit, 0)
    }, [store_name], ydn.db.base.TransactionMode.READ_ONLY, on_completed)
  }
  return df
};
ydn.db.crud.DbOperator.prototype.keysInternal = function(store_name, index_name, key_range, reverse, limit) {
  var df = new goog.async.Deferred;
  var me = this;
  var out;
  var on_completed = function(t, e) {
    if(t == ydn.db.base.TxEventTypes.COMPLETE) {
      df.callback(out)
    }else {
      df.errback(e)
    }
    out = null
  };
  var req_df = new goog.async.Deferred;
  req_df.addBoth(function(x) {
    out = x
  });
  if(goog.isString(index_name)) {
    var index = index_name;
    this.sync_thread.exec(req_df, function(tx, tx_no, cb) {
      me.getExecutor().keysByIndexKeyRange(tx, tx_no, cb, store_name, index, key_range, reverse, limit, 0, false)
    }, [store_name], ydn.db.base.TransactionMode.READ_ONLY, on_completed)
  }else {
    this.sync_thread.exec(req_df, function(tx, tx_no, cb) {
      me.getExecutor().keysByKeyRange(tx, tx_no, cb, store_name, key_range, reverse, limit, 0)
    }, [store_name], ydn.db.base.TransactionMode.READ_ONLY, on_completed)
  }
  return df
};
ydn.db.crud.DbOperator.prototype.clear = function(arg1, arg2, arg3) {
  if(goog.DEBUG && goog.isDef(arg3)) {
    throw new ydn.debug.error.ArgumentException("too many input arguments");
  }
  var df = ydn.db.base.createDeferred();
  var me = this;
  if(goog.isString(arg1)) {
    var st_name = arg1;
    var store = this.schema.getStore(st_name);
    if(!store) {
      throw new ydn.debug.error.ArgumentException('store name "' + st_name + '" not found.');
    }
    if(goog.isObject(arg2)) {
      var key_range = ydn.db.KeyRange.parseIDBKeyRange((arg2));
      if(goog.isNull(key_range)) {
        throw new ydn.debug.error.ArgumentException("clear method requires" + " a valid non-null KeyRange object.");
      }
      this.logger.finer("clearByKeyRange: " + st_name + ":" + ydn.json.stringify(key_range));
      this.tx_thread.exec(df, function(tx, tx_no, cb) {
        me.getExecutor().clearByKeyRange(tx, tx_no, cb, st_name, key_range)
      }, [st_name], ydn.db.base.TransactionMode.READ_WRITE)
    }else {
      if(!goog.isDef(arg2)) {
        this.logger.finer("clearByStore: " + st_name);
        this.tx_thread.exec(df, function(tx, tx_no, cb) {
          me.getExecutor().clearByStores(tx, tx_no, cb, [st_name])
        }, [st_name], ydn.db.base.TransactionMode.READ_WRITE)
      }else {
        throw new ydn.debug.error.ArgumentException("clear method requires" + " a valid KeyRange object as second argument, but found " + arg2 + " of type " + typeof arg2);
      }
    }
  }else {
    if(!goog.isDef(arg1) || goog.isArray(arg1) && goog.isString(arg1[0])) {
      var store_names = arg1 || this.schema.getStoreNames();
      this.logger.finer("clearByStores: " + ydn.json.stringify(store_names));
      this.tx_thread.exec(df, function(tx, tx_no, cb) {
        me.getExecutor().clearByStores(tx, tx_no, cb, store_names)
      }, store_names, ydn.db.base.TransactionMode.READ_WRITE)
    }else {
      throw new ydn.debug.error.ArgumentException('first argument "' + arg1 + '" is invalid.');
    }
  }
  return df
};
ydn.db.crud.DbOperator.prototype.remove = function(arg1, arg2, arg3) {
  var df = ydn.db.base.createDeferred();
  var me = this;
  if(goog.isString(arg1)) {
    var store_name = arg1;
    var store = this.schema.getStore(store_name);
    if(!store) {
      throw new ydn.debug.error.ArgumentException('store name "' + store_name + '" not found.');
    }
    if(goog.isDef(arg3)) {
      if(goog.isString(arg2)) {
        var index = store.getIndex(arg2);
        if(!index) {
          throw new ydn.debug.error.ArgumentException("index: " + arg2 + " not found in " + store_name);
        }
        if(goog.isObject(arg3) || goog.isNull(arg3)) {
          var key_range = ydn.db.KeyRange.parseIDBKeyRange((arg3));
          this.logger.finer("removeByIndexKeyRange: " + store_name + ":" + index.getName() + " " + store_name);
          this.tx_thread.exec(df, function(tx, tx_no, cb) {
            me.getExecutor().removeByIndexKeyRange(tx, tx_no, cb, store_name, index.getName(), key_range)
          }, [store_name], ydn.db.base.TransactionMode.READ_WRITE)
        }else {
          throw new ydn.debug.error.ArgumentException("key range " + arg3 + ' is invalid type "' + typeof arg3 + '".');
        }
      }else {
        throw new ydn.debug.error.ArgumentException('index name "' + arg2 + '" must be a string, but ' + typeof arg2 + " found.");
      }
    }else {
      if(goog.isString(arg2) || goog.isNumber(arg2) || goog.isArrayLike(arg2) || arg2 instanceof Date) {
        var id = (arg2);
        this.logger.finer("removeById: " + store_name + ":" + id);
        if(ydn.db.base.USE_HOOK) {
          var post_df = new goog.async.Deferred;
          var opt = {};
          store.preHook(ydn.db.schema.Store.SyncMethod.REMOVE, opt, function(server_id) {
            if(server_id === id) {
              me.tx_thread.exec(post_df, function(tx, tx_no, cb) {
                me.getExecutor().removeById(tx, tx_no, cb, store_name, id)
              }, [store_name], ydn.db.base.TransactionMode.READ_WRITE)
            }else {
              post_df.callback(0)
            }
          }, null, id);
          post_df.addCallbacks(function(key) {
            df.callback(key)
          }, function(e) {
            df.errback(e)
          })
        }else {
          this.tx_thread.exec(df, function(tx, tx_no, cb) {
            me.getExecutor().removeById(tx, tx_no, cb, store_name, id)
          }, [store_name], ydn.db.base.TransactionMode.READ_WRITE)
        }
        if(store.dispatch_events) {
          df.addCallback(function(key) {
            var event = new ydn.db.events.RecordEvent(ydn.db.events.Types.DELETED, me.getStorage(), store_name, key, undefined);
            me.getStorage().dispatchEvent(event)
          })
        }
      }else {
        if(goog.isObject(arg2)) {
          var key_range = ydn.db.KeyRange.parseIDBKeyRange((arg2));
          this.logger.finer("removeByKeyRange: " + store_name + ":" + ydn.json.stringify(key_range));
          this.tx_thread.exec(df, function(tx, tx_no, cb) {
            me.getExecutor().removeByKeyRange(tx, tx_no, cb, store_name, key_range)
          }, [store_name], ydn.db.base.TransactionMode.READ_WRITE);
          if(store.dispatch_events) {
            df.addCallback(function(key) {
              var event = new ydn.db.events.StoreEvent(ydn.db.events.Types.DELETED, me.getStorage(), store_name, key, undefined);
              me.getStorage().dispatchEvent(event)
            })
          }
        }else {
          throw new ydn.debug.error.ArgumentException('Invalid key or key range "' + arg2 + '" of type ' + typeof arg2);
        }
      }
    }
  }else {
    if(arg1 instanceof ydn.db.Key) {
      var key = arg1;
      this.tx_thread.exec(df, function(tx, tx_no, cb) {
        me.getExecutor().removeById(tx, tx_no, cb, key.getStoreName(), arg1.getId())
      }, [key.getStoreName()], ydn.db.base.TransactionMode.READ_WRITE)
    }else {
      if(goog.isArray(arg1)) {
        var arr = arg1;
        var store_names = [];
        for(var i = 0, n = arr.length;i < n;i++) {
          if(goog.DEBUG && !(arr[i] instanceof ydn.db.Key)) {
            throw new ydn.debug.error.ArgumentException("key list element at " + i + " of " + n + ' must be yn.db.Key, but "' + ydn.json.toShortString(arg1[i]) + '" (' + goog.typeOf(arg1[i]) + ") " + "is not ydn.db.Key.");
          }
          var st = arr[i].getStoreName();
          if(goog.array.indexOf(store_names, st) == -1) {
            store_names.push(st)
          }
        }
        if(store_names.length < 1) {
          throw new ydn.debug.error.ArgumentException("at least one valid key " + 'required in key list "' + ydn.json.toShortString(arg1) + '"');
        }
        this.tx_thread.exec(df, function(tx, tx_no, cb) {
          me.getExecutor().removeByKeys(tx, tx_no, cb, arr)
        }, store_names, ydn.db.base.TransactionMode.READ_WRITE)
      }else {
        throw new ydn.debug.error.ArgumentException("first argument requires " + 'store name, key (ydn.db.Key) or list of keys (array) , but "' + ydn.json.toShortString(arg1) + '" (' + goog.typeOf(arg1) + ") found.");
      }
    }
  }
  return df
};
if(goog.DEBUG) {
  ydn.db.crud.DbOperator.prototype.toString = function() {
    var s = "DbOperator:" + this.getStorage().getName();
    return s
  }
}
;goog.provide("ydn.db.core.DbOperator");
goog.require("ydn.db.Iterator");
goog.require("ydn.db.core.IOperator");
goog.require("ydn.db.core.req.IRequestExecutor");
if(!ydn.db.base.NO_IDB) {
  goog.require("ydn.db.core.req.IndexedDb")
}
if(!ydn.db.base.NO_SIMPLE) {
  goog.require("ydn.db.core.req.SimpleStore")
}
if(!ydn.db.base.NO_WEBSQL) {
  goog.require("ydn.db.core.req.WebSql")
}
goog.require("ydn.db.crud.DbOperator");
goog.require("ydn.debug.error.ArgumentException");
ydn.db.core.DbOperator = function(storage, schema, thread, sync_thread) {
  goog.base(this, storage, schema, thread, sync_thread)
};
goog.inherits(ydn.db.core.DbOperator, ydn.db.crud.DbOperator);
ydn.db.core.DbOperator.prototype.logger = goog.debug.Logger.getLogger("ydn.db.core.DbOperator");
ydn.db.core.DbOperator.DEBUG = false;
ydn.db.core.DbOperator.prototype.get = function(arg1, arg2) {
  var me = this;
  if(arg1 instanceof ydn.db.Iterator) {
    var df = ydn.db.base.createDeferred();
    var q = arg1;
    var q_store_name = q.getStoreName();
    var store = this.schema.getStore(q_store_name);
    if(!store) {
      throw new ydn.debug.error.ArgumentException('store "' + q_store_name + '" not found.');
    }
    var index_name = q.getIndexName();
    if(goog.isDef(index_name) && !store.hasIndex(index_name)) {
      throw new ydn.debug.error.ArgumentException('index "' + index_name + '" not found in store "' + q_store_name + '".');
    }
    var list_df = new goog.async.Deferred;
    list_df.addCallbacks(function(x) {
      df.callback(x[0])
    }, function(e) {
      df.errback(e)
    });
    this.logger.finer("getByIterator:" + q);
    this.tx_thread.exec(list_df, function(tx, tx_no, cb) {
      me.getIndexExecutor().listByIterator(tx, tx_no, cb, q, 1)
    }, [q_store_name], ydn.db.base.TransactionMode.READ_ONLY);
    return df
  }else {
    return goog.base(this, "get", arg1, arg2)
  }
};
ydn.db.core.DbOperator.prototype.keys = function(arg1, arg2, arg3, arg4, arg5) {
  var me = this;
  if(arg1 instanceof ydn.db.Iterator) {
    var df = ydn.db.base.createDeferred();
    var limit = ydn.db.base.DEFAULT_RESULT_LIMIT;
    if(goog.isNumber(arg2)) {
      limit = (arg2);
      if(limit < 1) {
        throw new ydn.debug.error.ArgumentException("limit must be " + "a positive value, but " + arg2);
      }
    }else {
      if(goog.isDef(arg2)) {
        throw new ydn.debug.error.ArgumentException("limit must be a number, " + " but " + arg2);
      }
    }
    if(goog.isDef(arg3)) {
      throw new ydn.debug.error.ArgumentException("offset must not be specified");
    }
    var q = arg1;
    this.logger.finer("keysByIterator:" + q);
    this.tx_thread.exec(df, function(tx, tx_no, cb) {
      me.getIndexExecutor().keysByIterator(tx, tx_no, cb, q, limit)
    }, q.stores(), ydn.db.base.TransactionMode.READ_ONLY);
    return df
  }else {
    return goog.base(this, "keys", arg1, arg2, arg3, arg4, arg5)
  }
};
ydn.db.core.DbOperator.prototype.count = function(arg1, arg2, arg3) {
  var me = this;
  if(arg1 instanceof ydn.db.Iterator) {
    if(goog.isDef(arg2) || goog.isDef(arg3)) {
      throw new ydn.debug.error.ArgumentException("too many arguments.");
    }
    var df = ydn.db.base.createDeferred();
    var q = arg1;
    this.logger.finer("countKeyRange:" + q);
    this.tx_thread.exec(df, function(tx, tx_no, cb) {
      me.getIndexExecutor().countKeyRange(tx, tx_no, cb, q.getStoreName(), q.keyRange(), q.getIndexName(), q.isUnique())
    }, q.stores(), ydn.db.base.TransactionMode.READ_ONLY);
    return df
  }else {
    return goog.base(this, "count", arg1, arg2, arg3)
  }
};
ydn.db.core.DbOperator.prototype.values = function(arg1, arg2, arg3, arg4, arg5, arg6) {
  var me = this;
  if(arg1 instanceof ydn.db.Iterator) {
    var df = ydn.db.base.createDeferred();
    var limit;
    if(goog.isNumber(arg2)) {
      limit = (arg2);
      if(limit < 1) {
        throw new ydn.debug.error.ArgumentException("limit must be " + "a positive value, but " + limit);
      }
    }else {
      if(goog.isDef(arg2)) {
        throw new ydn.debug.error.ArgumentException("limit must be a number, " + "but " + arg2);
      }
    }
    if(goog.isDef(arg3)) {
      throw new ydn.debug.error.ArgumentException("offset must not be specified");
    }
    var q = arg1;
    this.logger.finer("listByIterator:" + q);
    this.tx_thread.exec(df, function(tx, tx_no, cb) {
      me.getIndexExecutor().listByIterator(tx, tx_no, cb, q, limit)
    }, q.stores(), ydn.db.base.TransactionMode.READ_ONLY);
    return df
  }else {
    return goog.base(this, "values", arg1, arg2, arg3, arg4, arg5, arg6)
  }
};
ydn.db.core.DbOperator.prototype.scan = function(solver, opt_iterators) {
  var df = ydn.db.base.createDeferred();
  if(goog.DEBUG) {
    if(goog.isDef(opt_iterators)) {
      if(!goog.isArray(opt_iterators)) {
        throw new TypeError("Iterator argument must be an array.");
      }
      for(var i = 0;i < opt_iterators.length;i++) {
        var is_iter = opt_iterators[i] instanceof ydn.db.Iterator;
        if(!is_iter) {
          throw new TypeError("Iterator at " + i + " must be cursor range iterator.");
        }
      }
    }
  }
  var iterators;
  if(opt_iterators) {
    iterators = opt_iterators
  }else {
    var iter = solver.getIterators();
    goog.asserts.assertArray(iter, "array of iterators required.");
    iterators = iter
  }
  var tr_mode = ydn.db.base.TransactionMode.READ_ONLY;
  var scopes = [];
  for(var i = 0;i < iterators.length;i++) {
    var stores = iterators[i].stores();
    for(var j = 0;j < stores.length;j++) {
      if(!goog.array.contains(scopes, stores[j])) {
        scopes.push(stores[j])
      }
    }
  }
  this.logger.finest(this + ": scan for " + iterators.length + " iterators on " + scopes);
  var me = this;
  this.tx_thread.exec(df, function(tx, tx_no, cb) {
    var lbl = tx_no + " " + me + " scanning";
    me.logger.finest(lbl);
    var done = false;
    var total;
    var idx2iterator = [];
    var keys = [];
    var values = [];
    var cursors = [];
    var do_exit = function() {
      for(var k = 0;k < cursors.length;k++) {
        cursors[k].exit()
      }
      done = true;
      goog.array.clear(cursors);
      me.logger.finer("success " + lbl);
      cb(undefined)
    };
    var result_count = 0;
    var streamer_result_count = 0;
    var has_key_count = 0;
    var on_result_ready = function() {
      var out;
      if(solver instanceof ydn.db.algo.AbstractSolver) {
        out = solver.solver(keys, values)
      }else {
        out = solver(keys, values)
      }
      if(ydn.db.core.DbOperator.DEBUG) {
        window.console.log(me + " received result from solver " + ydn.json.stringify(out) + " for keys " + ydn.json.stringify(keys))
      }
      var next_primary_keys = [];
      var next_effective_keys = [];
      var advance = [];
      var restart = [];
      if(goog.isArray(out)) {
        for(var i = 0;i < out.length;i++) {
          if(out[i] === true) {
            advance[i] = 1
          }else {
            if(out[i] === false) {
              restart[i] = true
            }else {
              next_effective_keys[i] = out[i]
            }
          }
        }
      }else {
        if(goog.isNull(out)) {
          next_primary_keys = []
        }else {
          if(!goog.isDef(out)) {
            next_primary_keys = [];
            for(var i = 0;i < iterators.length;i++) {
              if(goog.isDef(idx2iterator[i])) {
                advance[i] = 1
              }
            }
          }else {
            if(goog.isObject(out)) {
              if(goog.DEBUG) {
                var valid_att = ["advance", "continue", "continuePrimary", "restart"];
                for(var key in out) {
                  if(!goog.array.contains(valid_att, key)) {
                    throw new ydn.debug.error.InvalidOperationException('Unknown attribute "' + key + '" in cursor advancement object');
                  }
                }
              }
              next_primary_keys = out["continuePrimary"] || [];
              next_effective_keys = out["continue"] || [];
              advance = out["advance"] || [];
              restart = out["restart"] || []
            }else {
              throw new ydn.error.InvalidOperationException("scan callback output");
            }
          }
        }
      }
      var move_count = 0;
      result_count = 0;
      for(var i = 0;i < iterators.length;i++) {
        if(goog.isDefAndNotNull(next_primary_keys[i]) || goog.isDef(next_effective_keys[i]) || goog.isDefAndNotNull(restart[i]) || goog.isDefAndNotNull(advance[i])) {
        }else {
          result_count++
        }
      }
      for(var i = 0;i < iterators.length;i++) {
        if(goog.isDefAndNotNull(next_primary_keys[i]) || goog.isDef(next_effective_keys[i]) || goog.isDefAndNotNull(restart[i]) || goog.isDefAndNotNull(advance[i])) {
          var idx = idx2iterator[i];
          if(!goog.isDef(idx)) {
            throw new ydn.error.InvalidOperationException(i + " is not an iterator.");
          }
          var iterator = iterators[idx];
          var cursor = cursors[i];
          if(goog.DEBUG && !goog.isDefAndNotNull(keys[i])) {
            var at = i + "/" + iterators.length;
            if(goog.isDefAndNotNull(advance[i])) {
              throw new ydn.error.InvalidOperationError(cursor + " " + at + " must not advance " + advance[i] + " steps");
            }else {
              if(goog.isDef(next_effective_keys[i])) {
                throw new ydn.error.InvalidOperationError(cursor + " " + at + " must not continue to key " + next_effective_keys[i]);
              }else {
                if(goog.isDefAndNotNull(next_primary_keys[i])) {
                  throw new ydn.error.InvalidOperationError(cursor + " " + at + " must not continue to primary key " + next_primary_keys[i]);
                }
              }
            }
          }
          keys[i] = undefined;
          values[i] = undefined;
          if(goog.isDefAndNotNull(restart[i])) {
            if(ydn.db.core.DbOperator.DEBUG) {
              window.console.log("cursor " + cursor + " of iterator " + iterator + ": restarting.")
            }
            goog.asserts.assert(restart[i] === true, i + " restart must be true");
            cursor.restart()
          }else {
            if(goog.isDef(next_effective_keys[i])) {
              if(ydn.db.core.DbOperator.DEBUG) {
                window.console.log(iterator + ": continuing to " + next_effective_keys[i])
              }
              cursor.continueEffectiveKey(next_effective_keys[i])
            }else {
              if(goog.isDefAndNotNull(next_primary_keys[i])) {
                if(ydn.db.core.DbOperator.DEBUG) {
                  window.console.log(cursor + ": continuing to primary key " + next_primary_keys[i])
                }
                cursor.continuePrimaryKey(next_primary_keys[i])
              }else {
                if(goog.isDefAndNotNull(advance[i])) {
                  if(ydn.db.core.DbOperator.DEBUG) {
                    window.console.log(iterator + ": advancing " + advance[i] + " steps.")
                  }
                  goog.asserts.assert(advance[i] === 1, i + " advance value must be 1");
                  cursor.advance(1)
                }else {
                  throw new ydn.error.InternalError(iterator + ": has no action");
                }
              }
            }
          }
          move_count++
        }
      }
      if(move_count == 0) {
        do_exit()
      }
    };
    var on_iterator_next = function(i, opt_key) {
      if(done) {
        if(ydn.db.core.DbOperator.DEBUG) {
          window.console.log("iterator " + i + " done")
        }
        throw new ydn.error.InternalError;
      }
      result_count++;
      var is_result_ready = result_count === total;
      var idx = idx2iterator[i];
      var iterator = iterators[idx];
      var cursor = cursors[idx];
      var primary_key = cursor.getPrimaryKey();
      var value = cursor.getValue();
      if(ydn.db.core.DbOperator.DEBUG) {
        var key_str = opt_key + (goog.isDefAndNotNull(primary_key) ? ", " + primary_key : "");
        var ready_str = is_result_ready ? " (all result done)" : "";
        window.console.log(cursor + " new position " + key_str + ready_str)
      }
      keys[i] = opt_key;
      if(iterator.isIndexIterator()) {
        if(iterator.isKeyIterator()) {
          values[i] = primary_key
        }else {
          values[i] = value
        }
      }else {
        if(iterator.isKeyIterator()) {
          values[i] = opt_key
        }else {
          values[i] = value
        }
      }
      if(is_result_ready) {
        on_result_ready()
      }
    };
    var on_error = function(e) {
      for(var k = 0;k < cursors.length;k++) {
        cursors[k].exit()
      }
      goog.array.clear(cursors);
      me.logger.finer(lbl + " error");
      cb(e, true)
    };
    var open_iterators = function() {
      var idx = 0;
      for(var i = 0;i < iterators.length;i++) {
        var iterator = iterators[i];
        var cursor = iterator.iterate(tx, tx_no, me.getIndexExecutor());
        cursor.onFail = on_error;
        cursor.onNext = goog.partial(on_iterator_next, idx);
        cursors[i] = cursor;
        idx2iterator[idx] = i;
        idx++
      }
      total = iterators.length
    };
    if(solver instanceof ydn.db.algo.AbstractSolver) {
      var wait = solver.begin(iterators, function() {
        open_iterators()
      });
      if(!wait) {
        open_iterators()
      }
    }else {
      open_iterators()
    }
  }, scopes, tr_mode);
  return df
};
ydn.db.core.DbOperator.prototype.getIndexExecutor = function() {
  return(this.getExecutor())
};
ydn.db.core.DbOperator.prototype.open = function(callback, iter, opt_mode) {
  if(!(iter instanceof ydn.db.Iterator)) {
    throw new ydn.debug.error.ArgumentException("Second argument must be cursor range iterator.");
  }
  var store = this.schema.getStore(iter.getStoreName());
  if(!store) {
    throw new ydn.debug.error.ArgumentException('Store "' + iter.getStoreName() + '" not found.');
  }
  var tr_mode = opt_mode || ydn.db.base.TransactionMode.READ_ONLY;
  var me = this;
  var df = ydn.db.base.createDeferred();
  this.logger.finer("open:" + tr_mode + " " + iter);
  this.tx_thread.exec(df, function(tx, tx_no, cb) {
    var lbl = tx_no + " iterating " + iter;
    me.logger.finest(lbl);
    var cursor = iter.iterate(tx, tx_no, me.getIndexExecutor());
    cursor.onFail = function(e) {
      cb(e, true)
    };
    cursor.onNext = function(opt_key) {
      if(goog.isDefAndNotNull(opt_key)) {
        var adv = callback(cursor);
        if(adv === true) {
          cursor.restart()
        }else {
          if(goog.isObject(adv)) {
            if(adv["restart"] === true) {
              cursor.restart(adv["continue"], adv["continuePrimary"])
            }else {
              if(goog.isDefAndNotNull(adv["continue"])) {
                cursor.continueEffectiveKey(adv["continue"])
              }else {
                if(goog.isDefAndNotNull(adv["continuePrimary"])) {
                  cursor.continuePrimaryKey(adv["continuePrimary"])
                }else {
                  cursor.exit();
                  cb(undefined)
                }
              }
            }
          }else {
            cursor.advance(1)
          }
        }
      }else {
        cursor.exit();
        cb(undefined)
      }
    }
  }, iter.stores(), tr_mode);
  return df
};
ydn.db.core.DbOperator.prototype.map = function(iterator, callback) {
  var me = this;
  var stores = iterator.stores();
  for(var store, i = 0;store = stores[i];i++) {
    if(!store) {
      throw new ydn.debug.error.ArgumentException('Store "' + store + '" not found.');
    }
  }
  var df = ydn.db.base.createDeferred();
  this.logger.finest("map:" + iterator);
  this.tx_thread.exec(df, function(tx, tx_no, cb) {
    var lbl = tx_no + " iterating " + iterator;
    me.logger.finest(lbl);
    var cursor = iterator.iterate(tx, tx_no, me.getIndexExecutor());
    cursor.onFail = function(e) {
      cb(e, false)
    };
    cursor.onNext = function(opt_key) {
      if(goog.isDefAndNotNull(opt_key)) {
        var key = opt_key;
        var ref;
        if(iterator.isIndexIterator()) {
          if(iterator.isKeyIterator()) {
            ref = key
          }else {
            ref = cursor.getPrimaryKey()
          }
        }else {
          if(iterator.isKeyIterator()) {
            ref = key
          }else {
            ref = cursor.getValue()
          }
        }
        callback(ref);
        cursor.advance(1)
      }else {
        cb(undefined);
        callback = null
      }
    }
  }, stores, ydn.db.base.TransactionMode.READ_ONLY);
  return df
};
ydn.db.core.DbOperator.prototype.reduce = function(iterator, callback, opt_initial) {
  var me = this;
  var stores = iterator.stores();
  for(var store, i = 0;store = stores[i];i++) {
    if(!store) {
      throw new ydn.debug.error.ArgumentException('Store "' + store + '" not found.');
    }
  }
  var df = ydn.db.base.createDeferred();
  var previous = goog.isObject(opt_initial) ? ydn.object.clone(opt_initial) : opt_initial;
  this.logger.finer("reduce:" + iterator);
  this.tx_thread.exec(df, function(tx, tx_no, cb) {
    var cursor = iterator.iterate(tx, tx_no, me.getIndexExecutor());
    cursor.onFail = function(e) {
      cb(e, true)
    };
    var index = 0;
    cursor.onNext = function(opt_key) {
      if(goog.isDefAndNotNull(opt_key)) {
        var current_value;
        if(iterator.isIndexIterator()) {
          if(iterator.isKeyIterator()) {
            current_value = opt_key
          }else {
            current_value = cursor.getPrimaryKey()
          }
        }else {
          if(iterator.isKeyIterator()) {
            current_value = opt_key
          }else {
            current_value = cursor.getValue()
          }
        }
        previous = callback(previous, current_value, index++);
        cursor.advance(1)
      }else {
        cb(previous)
      }
    }
  }, stores, ydn.db.base.TransactionMode.READ_ONLY);
  return df
};
goog.provide("goog.userAgent.product");
goog.require("goog.userAgent");
goog.userAgent.product.ASSUME_FIREFOX = false;
goog.userAgent.product.ASSUME_CAMINO = false;
goog.userAgent.product.ASSUME_IPHONE = false;
goog.userAgent.product.ASSUME_IPAD = false;
goog.userAgent.product.ASSUME_ANDROID = false;
goog.userAgent.product.ASSUME_CHROME = false;
goog.userAgent.product.ASSUME_SAFARI = false;
goog.userAgent.product.PRODUCT_KNOWN_ = goog.userAgent.ASSUME_IE || goog.userAgent.ASSUME_OPERA || goog.userAgent.product.ASSUME_FIREFOX || goog.userAgent.product.ASSUME_CAMINO || goog.userAgent.product.ASSUME_IPHONE || goog.userAgent.product.ASSUME_IPAD || goog.userAgent.product.ASSUME_ANDROID || goog.userAgent.product.ASSUME_CHROME || goog.userAgent.product.ASSUME_SAFARI;
goog.userAgent.product.init_ = function() {
  goog.userAgent.product.detectedFirefox_ = false;
  goog.userAgent.product.detectedCamino_ = false;
  goog.userAgent.product.detectedIphone_ = false;
  goog.userAgent.product.detectedIpad_ = false;
  goog.userAgent.product.detectedAndroid_ = false;
  goog.userAgent.product.detectedChrome_ = false;
  goog.userAgent.product.detectedSafari_ = false;
  var ua = goog.userAgent.getUserAgentString();
  if(!ua) {
    return
  }
  if(ua.indexOf("Firefox") != -1) {
    goog.userAgent.product.detectedFirefox_ = true
  }else {
    if(ua.indexOf("Camino") != -1) {
      goog.userAgent.product.detectedCamino_ = true
    }else {
      if(ua.indexOf("iPhone") != -1 || ua.indexOf("iPod") != -1) {
        goog.userAgent.product.detectedIphone_ = true
      }else {
        if(ua.indexOf("iPad") != -1) {
          goog.userAgent.product.detectedIpad_ = true
        }else {
          if(ua.indexOf("Android") != -1) {
            goog.userAgent.product.detectedAndroid_ = true
          }else {
            if(ua.indexOf("Chrome") != -1) {
              goog.userAgent.product.detectedChrome_ = true
            }else {
              if(ua.indexOf("Safari") != -1) {
                goog.userAgent.product.detectedSafari_ = true
              }
            }
          }
        }
      }
    }
  }
};
if(!goog.userAgent.product.PRODUCT_KNOWN_) {
  goog.userAgent.product.init_()
}
goog.userAgent.product.OPERA = goog.userAgent.OPERA;
goog.userAgent.product.IE = goog.userAgent.IE;
goog.userAgent.product.FIREFOX = goog.userAgent.product.PRODUCT_KNOWN_ ? goog.userAgent.product.ASSUME_FIREFOX : goog.userAgent.product.detectedFirefox_;
goog.userAgent.product.CAMINO = goog.userAgent.product.PRODUCT_KNOWN_ ? goog.userAgent.product.ASSUME_CAMINO : goog.userAgent.product.detectedCamino_;
goog.userAgent.product.IPHONE = goog.userAgent.product.PRODUCT_KNOWN_ ? goog.userAgent.product.ASSUME_IPHONE : goog.userAgent.product.detectedIphone_;
goog.userAgent.product.IPAD = goog.userAgent.product.PRODUCT_KNOWN_ ? goog.userAgent.product.ASSUME_IPAD : goog.userAgent.product.detectedIpad_;
goog.userAgent.product.ANDROID = goog.userAgent.product.PRODUCT_KNOWN_ ? goog.userAgent.product.ASSUME_ANDROID : goog.userAgent.product.detectedAndroid_;
goog.userAgent.product.CHROME = goog.userAgent.product.PRODUCT_KNOWN_ ? goog.userAgent.product.ASSUME_CHROME : goog.userAgent.product.detectedChrome_;
goog.userAgent.product.SAFARI = goog.userAgent.product.PRODUCT_KNOWN_ ? goog.userAgent.product.ASSUME_SAFARI : goog.userAgent.product.detectedSafari_;
goog.provide("ydn.db.events.StoreEvent");
goog.provide("ydn.db.events.StorageEvent");
goog.provide("ydn.db.events.RecordEvent");
goog.provide("ydn.db.events.Types");
ydn.db.events.Types = {READY:"ready", CREATED:"created", DELETED:"deleted", UPDATED:"updated"};
ydn.db.events.Event = function(event_type, event_target) {
  goog.base(this, event_type, event_target)
};
goog.inherits(ydn.db.events.Event, goog.events.Event);
ydn.db.events.Event.prototype.store_name;
ydn.db.events.Event.prototype.getStoreName = function() {
  return this.store_name
};
ydn.db.events.StorageEvent = function(event_type, event_target, version, old_version, error) {
  goog.base(this, event_type, event_target);
  this.version = version;
  this.oldVersion = old_version;
  this.error = error
};
goog.inherits(ydn.db.events.StorageEvent, ydn.db.events.Event);
ydn.db.events.StorageEvent.prototype.name = "StorageEvent";
ydn.db.events.StorageEvent.prototype.version = NaN;
ydn.db.events.StorageEvent.prototype.oldVersion = NaN;
ydn.db.events.StorageEvent.prototype.error = null;
ydn.db.events.StorageEvent.prototype.getVersion = function() {
  return this.version
};
ydn.db.events.StorageEvent.prototype.getOldVersion = function() {
  return this.oldVersion
};
ydn.db.events.StorageEvent.prototype.getError = function() {
  return this.error
};
ydn.db.events.RecordEvent = function(event_type, event_target, store_name, key, value) {
  goog.base(this, event_type, event_target);
  this.store_name = store_name;
  this.key = key;
  this.value = value
};
goog.inherits(ydn.db.events.RecordEvent, ydn.db.events.Event);
ydn.db.events.RecordEvent.prototype.name = "RecordEvent";
ydn.db.events.RecordEvent.prototype.key;
ydn.db.events.RecordEvent.prototype.value;
ydn.db.events.RecordEvent.prototype.getKey = function() {
  return this.key
};
ydn.db.events.RecordEvent.prototype.getValue = function() {
  return this.value
};
ydn.db.events.StoreEvent = function(event_type, event_target, store_name, keys, opt_values) {
  goog.base(this, event_type, event_target);
  this.store_name = store_name;
  this.keys = keys;
  this.values = opt_values
};
goog.inherits(ydn.db.events.StoreEvent, ydn.db.events.Event);
ydn.db.events.StoreEvent.prototype.name = "StoreEvent";
ydn.db.events.StoreEvent.prototype.keys;
ydn.db.events.StoreEvent.prototype.values;
ydn.db.events.StoreEvent.prototype.getKeys = function() {
  return this.keys
};
ydn.db.events.StoreEvent.prototype.getValues = function() {
  return this.values
};
goog.provide("ydn.db.schema.EditableDatabase");
goog.require("ydn.db.schema.Database");
ydn.db.schema.EditableDatabase = function(version, opt_stores) {
  goog.base(this, version, opt_stores)
};
goog.inherits(ydn.db.schema.EditableDatabase, ydn.db.schema.Database);
ydn.db.schema.EditableDatabase.prototype.isAutoSchema = function() {
  return true
};
ydn.db.schema.EditableDatabase.prototype.addStore = function(table) {
  this.stores.push(table)
};
goog.provide("ydn.object");
goog.require("ydn.json");
ydn.object.clone = function(obj) {
  return ydn.json.parse(ydn.json.stringify(obj))
};
ydn.object.equals = function(obj1, obj2, opt_ignore_fields) {
  opt_ignore_fields = opt_ignore_fields || {};
  if(!goog.isDefAndNotNull(obj1) || !goog.isDefAndNotNull(obj2)) {
    return false
  }else {
    if(goog.isArray(obj1) && goog.isArray(obj2)) {
      if(obj1.length != obj2.length) {
        return false
      }
      for(var i = 0;i < obj1.length;i++) {
        var idx = goog.array.find(obj2, function(ele) {
          return ydn.object.equals(ele, obj1[i])
        });
        if(idx == -1) {
          return false
        }
      }
      return true
    }else {
      if(goog.isArray(obj1)) {
        return obj1.length == 1 && ydn.object.equals(obj1[0], obj2)
      }else {
        if(goog.isArray(obj2)) {
          return obj2.length == 1 && ydn.object.equals(obj2[0], obj1)
        }else {
          if(goog.isObject(obj1) && goog.isObject(obj1)) {
            for(var key in obj1) {
              if(obj1.hasOwnProperty(key) && !opt_ignore_fields[key]) {
                var same = ydn.object.equals(obj1[key], obj2[key]);
                if(!same) {
                  return false
                }
              }
            }
            for(var key in obj2) {
              if(obj2.hasOwnProperty(key) && !opt_ignore_fields[key]) {
                var same = ydn.object.equals(obj1[key], obj2[key]);
                if(!same) {
                  return false
                }
              }
            }
            return true
          }else {
            return obj1 === obj2
          }
        }
      }
    }
  }
};
ydn.object.length = function(obj) {
  if(obj && obj["length"] && goog.isNumber(obj["length"])) {
    return obj.length
  }
  var count = 0;
  for(var id in obj) {
    if(obj.hasOwnProperty(id)) {
      count++
    }
  }
  return count
};
ydn.object.extend = function(target, var_args) {
  var out = ydn.object.clone(target);
  for(var key in var_args) {
    if(var_args.hasOwnProperty(key)) {
      out[key] = var_args[key]
    }
  }
  return out
};
ydn.object.reparr = function(v, n) {
  var arr = [];
  for(var i = 0;i < n;i++) {
    arr[i] = v
  }
  return arr
};
ydn.object.takeFirst = function(row) {
  for(var key in row) {
    if(row.hasOwnProperty(key)) {
      return row[key]
    }
  }
  return undefined
};
goog.provide("goog.storage.mechanism.ErrorCode");
goog.storage.mechanism.ErrorCode = {INVALID_VALUE:"Storage mechanism: Invalid value was encountered", QUOTA_EXCEEDED:"Storage mechanism: Quota exceeded", STORAGE_DISABLED:"Storage mechanism: Storage disabled"};
goog.provide("goog.storage.mechanism.Mechanism");
goog.storage.mechanism.Mechanism = function() {
};
goog.storage.mechanism.Mechanism.prototype.set = goog.abstractMethod;
goog.storage.mechanism.Mechanism.prototype.get = goog.abstractMethod;
goog.storage.mechanism.Mechanism.prototype.remove = goog.abstractMethod;
goog.provide("goog.storage.mechanism.IterableMechanism");
goog.require("goog.array");
goog.require("goog.asserts");
goog.require("goog.iter");
goog.require("goog.iter.Iterator");
goog.require("goog.storage.mechanism.Mechanism");
goog.storage.mechanism.IterableMechanism = function() {
  goog.base(this)
};
goog.inherits(goog.storage.mechanism.IterableMechanism, goog.storage.mechanism.Mechanism);
goog.storage.mechanism.IterableMechanism.prototype.getCount = function() {
  var count = 0;
  goog.iter.forEach(this.__iterator__(true), function(key) {
    goog.asserts.assertString(key);
    count++
  });
  return count
};
goog.storage.mechanism.IterableMechanism.prototype.__iterator__ = goog.abstractMethod;
goog.storage.mechanism.IterableMechanism.prototype.clear = function() {
  var keys = goog.iter.toArray(this.__iterator__(true));
  var selfObj = this;
  goog.array.forEach(keys, function(key) {
    selfObj.remove(key)
  })
};
goog.provide("goog.storage.mechanism.IEUserData");
goog.require("goog.asserts");
goog.require("goog.iter.Iterator");
goog.require("goog.iter.StopIteration");
goog.require("goog.storage.mechanism.ErrorCode");
goog.require("goog.storage.mechanism.IterableMechanism");
goog.require("goog.structs.Map");
goog.require("goog.userAgent");
goog.storage.mechanism.IEUserData = function(storageKey, opt_storageNodeId) {
  goog.base(this);
  if(goog.userAgent.IE && !goog.userAgent.isDocumentModeOrHigher(9)) {
    if(!goog.storage.mechanism.IEUserData.storageMap_) {
      goog.storage.mechanism.IEUserData.storageMap_ = new goog.structs.Map
    }
    this.storageNode_ = (goog.storage.mechanism.IEUserData.storageMap_.get(storageKey));
    if(!this.storageNode_) {
      if(opt_storageNodeId) {
        this.storageNode_ = document.getElementById(opt_storageNodeId)
      }else {
        this.storageNode_ = document.createElement("userdata");
        this.storageNode_["addBehavior"]("#default#userData");
        document.body.appendChild(this.storageNode_)
      }
      goog.storage.mechanism.IEUserData.storageMap_.set(storageKey, this.storageNode_)
    }
    this.storageKey_ = storageKey;
    try {
      this.loadNode_()
    }catch(e) {
      this.storageNode_ = null
    }
  }
};
goog.inherits(goog.storage.mechanism.IEUserData, goog.storage.mechanism.IterableMechanism);
goog.storage.mechanism.IEUserData.ENCODE_MAP = {".":".2E", "!":".21", "~":".7E", "*":".2A", "'":".27", "(":".28", ")":".29", "%":"."};
goog.storage.mechanism.IEUserData.storageMap_ = null;
goog.storage.mechanism.IEUserData.prototype.storageNode_ = null;
goog.storage.mechanism.IEUserData.prototype.storageKey_ = null;
goog.storage.mechanism.IEUserData.encodeKey_ = function(key) {
  return"_" + encodeURIComponent(key).replace(/[.!~*'()%]/g, function(c) {
    return goog.storage.mechanism.IEUserData.ENCODE_MAP[c]
  })
};
goog.storage.mechanism.IEUserData.decodeKey_ = function(key) {
  return decodeURIComponent(key.replace(/\./g, "%")).substr(1)
};
goog.storage.mechanism.IEUserData.prototype.isAvailable = function() {
  return!!this.storageNode_
};
goog.storage.mechanism.IEUserData.prototype.set = function(key, value) {
  this.storageNode_.setAttribute(goog.storage.mechanism.IEUserData.encodeKey_(key), value);
  this.saveNode_()
};
goog.storage.mechanism.IEUserData.prototype.get = function(key) {
  var value = this.storageNode_.getAttribute(goog.storage.mechanism.IEUserData.encodeKey_(key));
  if(!goog.isString(value) && !goog.isNull(value)) {
    throw goog.storage.mechanism.ErrorCode.INVALID_VALUE;
  }
  return value
};
goog.storage.mechanism.IEUserData.prototype.remove = function(key) {
  this.storageNode_.removeAttribute(goog.storage.mechanism.IEUserData.encodeKey_(key));
  this.saveNode_()
};
goog.storage.mechanism.IEUserData.prototype.getCount = function() {
  return this.getNode_().attributes.length
};
goog.storage.mechanism.IEUserData.prototype.__iterator__ = function(opt_keys) {
  var i = 0;
  var attributes = this.getNode_().attributes;
  var newIter = new goog.iter.Iterator;
  newIter.next = function() {
    if(i >= attributes.length) {
      throw goog.iter.StopIteration;
    }
    var item = goog.asserts.assert(attributes[i++]);
    if(opt_keys) {
      return goog.storage.mechanism.IEUserData.decodeKey_(item.nodeName)
    }
    var value = item.nodeValue;
    if(!goog.isString(value)) {
      throw goog.storage.mechanism.ErrorCode.INVALID_VALUE;
    }
    return value
  };
  return newIter
};
goog.storage.mechanism.IEUserData.prototype.clear = function() {
  var node = this.getNode_();
  for(var left = node.attributes.length;left > 0;left--) {
    node.removeAttribute(node.attributes[left - 1].nodeName)
  }
  this.saveNode_()
};
goog.storage.mechanism.IEUserData.prototype.loadNode_ = function() {
  this.storageNode_["load"](this.storageKey_)
};
goog.storage.mechanism.IEUserData.prototype.saveNode_ = function() {
  try {
    this.storageNode_["save"](this.storageKey_)
  }catch(e) {
    throw goog.storage.mechanism.ErrorCode.QUOTA_EXCEEDED;
  }
};
goog.storage.mechanism.IEUserData.prototype.getNode_ = function() {
  var doc = (this.storageNode_["XMLDocument"]);
  return doc.documentElement
};
goog.provide("ydn.db.con.simple.UserData");
goog.require("goog.storage.mechanism.IEUserData");
goog.require("ydn.db.base");
goog.require("ydn.db.con.SimpleStorage");
goog.require("ydn.db.con.simple.IStorageProvider");
ydn.db.con.simple.UserData = function() {
  goog.base(this, this)
};
goog.inherits(ydn.db.con.simple.UserData, ydn.db.con.SimpleStorage);
ydn.db.con.simple.UserData.KEY = "ydn.db";
ydn.db.con.simple.UserData.isSupported = function() {
  var d = new goog.storage.mechanism.IEUserData("ydn.db");
  return d.isAvailable()
};
ydn.db.con.simple.UserData.prototype.connectDb = function(db_name) {
  var x = new ydn.db.con.simple.UserData.Storage(db_name);
  return(x)
};
ydn.db.con.simple.UserData.prototype.getType = function() {
  return ydn.db.base.Mechanisms.USER_DATA
};
ydn.db.con.simple.UserData.deleteDatabase = function(db_name) {
  var db = new ydn.db.con.simple.UserData;
  var schema = new ydn.db.schema.EditableDatabase;
  db.connect(db_name, schema);
  db.getSchema(function(sch) {
    for(var i = 0;i < sch.stores.length;i++) {
      var store = db.getSimpleStore(sch.stores[i].name);
      store.clear()
    }
  })
};
ydn.db.con.simple.UserData.Storage = function(db_name) {
  this.storage_ = new goog.storage.mechanism.IEUserData(db_name);
  this.length = this.keys().length
};
ydn.db.con.simple.UserData.Storage.prototype.length = 0;
ydn.db.con.simple.UserData.Storage.prototype.storage_;
ydn.db.con.simple.UserData.Storage.prototype.keys_;
ydn.db.con.simple.UserData.Storage.prototype.clear = function() {
  this.storage_.clear();
  this.keys_ = []
};
ydn.db.con.simple.UserData.Storage.prototype.keys = function() {
  if(!this.keys_) {
    this.keys_ = [];
    goog.iter.forEach(this.storage_, function(k) {
      this.keys_.push(k)
    }, this)
  }
  return this.keys_
};
ydn.db.con.simple.UserData.Storage.prototype.key = function(idx) {
  return this.keys()[idx]
};
ydn.db.con.simple.UserData.Storage.prototype.setItem = function(key, value) {
  if(this.keys_) {
    this.keys_.push(key)
  }
  this.storage_.set(key, value)
};
ydn.db.con.simple.UserData.Storage.prototype.getItem = function(key) {
  var value = this.storage_.get(key);
  if(goog.isDef(value)) {
    return value
  }else {
    return null
  }
};
ydn.db.con.simple.UserData.Storage.prototype.removeItem = function(key) {
  this.keys_ = null;
  this.storage_.remove(key)
};
/*
 Copyright 2012 YDN Authors, Yathit. All Rights Reserved.
 Licensed under the Apache License, Version 2.0 (the "License");.
*/
goog.provide("ydn.db.con.Storage");
goog.require("goog.events.EventTarget");
goog.require("ydn.async");
goog.require("ydn.db.con.IStorage");
goog.require("ydn.db.events.StorageEvent");
goog.require("ydn.db.schema.EditableDatabase");
goog.require("ydn.debug.error.ArgumentException");
goog.require("ydn.object");
goog.require("ydn.db.base");
if(!ydn.db.base.NO_SIMPLE) {
  goog.require("ydn.db.con.simple.UserData");
  goog.require("ydn.db.con.LocalStorage");
  goog.require("ydn.db.con.SessionStorage")
}
if(!ydn.db.base.NO_IDB) {
  goog.require("ydn.db.con.IndexedDb")
}
if(!ydn.db.base.NO_WEBSQL) {
  goog.require("ydn.db.con.WebSql")
}
ydn.db.con.Storage = function(opt_dbname, opt_schema, opt_options) {
  goog.base(this);
  var options = opt_options || {};
  if(goog.DEBUG) {
    var fields = ["autoSchema", "connectionTimeout", "size", "mechanisms", "policy", "isSerial"];
    for(var key in options) {
      if(options.hasOwnProperty(key) && goog.array.indexOf(fields, key) == -1) {
        throw new ydn.debug.error.ArgumentException('Unknown attribute "' + key + '" in options.');
      }
    }
    if(options.mechanisms) {
      if(!goog.isArray(options.mechanisms)) {
        throw new ydn.debug.error.ArgumentException("mechanisms attribute " + "must be an array but " + goog.typeOf(options.mechanisms) + " found.");
      }
      for(var i = 0;i < options.mechanisms.length;i++) {
        if(!goog.array.contains(ydn.db.con.Storage.PREFERENCE, options.mechanisms[i])) {
          throw new ydn.debug.error.ArgumentException('Invalid mechanism "' + options.mechanisms[i] + '"');
        }
      }
    }
  }
  this.mechanisms = options.mechanisms || ydn.db.con.Storage.PREFERENCE;
  this.size = options.size;
  this.connectionTimeout = goog.isDef(options.connectionTimeout) ? options.connectionTimeout : ydn.db.con.Storage.DEBUG ? 1E3 : goog.DEBUG ? 30 * 1E3 : 30 * 60 * 1E3;
  this.use_text_store = goog.isDef(options.use_text_store) ? options.use_text_store : ydn.db.base.ENABLE_DEFAULT_TEXT_STORE;
  this.db_ = null;
  this.txQueue_ = [];
  this.in_version_change_tx_ = false;
  var schema;
  if(opt_schema instanceof ydn.db.schema.Database) {
    schema = opt_schema
  }else {
    if(goog.isObject(opt_schema)) {
      var schema_json = opt_schema;
      if(options.autoSchema || !goog.isDef(schema_json.stores)) {
        schema = new ydn.db.schema.EditableDatabase(schema_json)
      }else {
        schema = new ydn.db.schema.Database(schema_json)
      }
      var n = n = schema_json.stores ? schema_json.stores.length : 0;
      for(var i = 0;i < n;i++) {
        var store = schema.getStore(schema_json.stores[i].name);
        if(schema_json.stores[i].Sync) {
          this.addSynchronizer(store, schema_json.stores[i].Sync)
        }
      }
    }else {
      schema = new ydn.db.schema.EditableDatabase
    }
  }
  this.schema = schema;
  if(goog.isDef(opt_dbname)) {
    this.setName(opt_dbname)
  }
};
goog.inherits(ydn.db.con.Storage, goog.events.EventTarget);
ydn.db.con.Storage.DEBUG = false;
ydn.db.con.Storage.prototype.logger = goog.debug.Logger.getLogger("ydn.db.con.Storage");
ydn.db.con.Storage.prototype.getSchema = function(opt_callback) {
  if(goog.isDef(opt_callback)) {
    var callback = function(schema) {
      opt_callback(schema.toJSON())
    };
    if(this.db_) {
      this.db_.getSchema(callback)
    }else {
      var me = this;
      goog.asserts.assertFunction(callback);
      var get_schema = function(tx) {
        me.db_.getSchema(callback, tx)
      };
      this.transaction(get_schema, null, ydn.db.base.TransactionMode.READ_ONLY)
    }
  }
  return this.schema ? (this.schema.toJSON()) : null
};
ydn.db.con.Storage.prototype.addStoreSchema = function(store_schema) {
  var new_store = store_schema instanceof ydn.db.schema.Store ? store_schema : ydn.db.schema.Store.fromJSON(store_schema);
  var store_name = store_schema.name;
  var store = this.schema.getStore(store_name);
  if(!new_store.similar(store)) {
    var action = store ? "update" : "add";
    if(this.schema instanceof ydn.db.schema.EditableDatabase) {
      var schema = (this.schema);
      schema.addStore(new_store);
      if(this.db_) {
        this.db_.close();
        this.db_ = null;
        return this.connectDatabase()
      }else {
        return goog.async.Deferred.succeed(false)
      }
    }else {
      var msg = goog.DEBUG ? "Cannot " + action + " store: " + store_name + ". Not auto schema generation mode." : "";
      throw new ydn.error.ConstraintError(msg);
    }
  }else {
    return goog.async.Deferred.succeed(false)
  }
};
ydn.db.con.Storage.prototype.setName = function(db_name) {
  if(this.db_) {
    throw Error("Already defined with " + this.db_name);
  }
  this.db_name = db_name;
  this.connectDatabase()
};
ydn.db.con.Storage.prototype.db_name;
ydn.db.con.Storage.prototype.db_;
ydn.db.con.Storage.prototype.size;
ydn.db.con.Storage.prototype.connectionTimeout;
ydn.db.con.Storage.prototype.schema;
ydn.db.con.Storage.prototype.getName = function() {
  return this.db_name
};
ydn.db.con.Storage.PREFERENCE = [ydn.db.base.Mechanisms.IDB, ydn.db.base.Mechanisms.WEBSQL, ydn.db.base.Mechanisms.LOCAL_STORAGE, ydn.db.base.Mechanisms.SESSION_STORAGE, ydn.db.base.Mechanisms.USER_DATA, ydn.db.base.Mechanisms.MEMORY_STORAGE];
ydn.db.con.Storage.prototype.createDbInstance = function(db_type) {
  if(!ydn.db.base.NO_IDB && db_type == ydn.db.base.Mechanisms.IDB) {
    return new ydn.db.con.IndexedDb(this.size, this.connectionTimeout)
  }else {
    if(!ydn.db.base.NO_WEBSQL && db_type == ydn.db.base.Mechanisms.WEBSQL) {
      return new ydn.db.con.WebSql(this.size)
    }else {
      if(!ydn.db.base.NO_SIMPLE && db_type == ydn.db.base.Mechanisms.LOCAL_STORAGE) {
        return new ydn.db.con.LocalStorage
      }else {
        if(!ydn.db.base.NO_SIMPLE && db_type == ydn.db.base.Mechanisms.SESSION_STORAGE) {
          return new ydn.db.con.SessionStorage
        }else {
          if(!ydn.db.base.NO_SIMPLE && db_type == ydn.db.base.Mechanisms.MEMORY_STORAGE) {
            return new ydn.db.con.SimpleStorage
          }else {
            if(!ydn.db.base.NO_SIMPLE && db_type == ydn.db.base.Mechanisms.USER_DATA) {
              return new ydn.db.con.simple.UserData
            }
          }
        }
      }
    }
  }
  return null
};
ydn.db.con.Storage.prototype.connectDatabase = function() {
  var me = this;
  goog.asserts.assertString(this.db_name);
  var df = new goog.async.Deferred;
  var resolve = function(is_connected, ev) {
    if(is_connected) {
      me.logger.finest(me + ": ready.");
      me.last_queue_checkin_ = NaN;
      goog.Timer.callOnce(function() {
        me.onReady(ev);
        me.popTxQueue_()
      });
      df.callback(ev)
    }else {
      me.logger.warning(me + ": database connection fail " + ev.name);
      goog.Timer.callOnce(function() {
        me.onReady(ev);
        me.purgeTxQueue_(ev)
      });
      df.errback(ev)
    }
  };
  var db = null;
  var preference = this.mechanisms;
  for(var i = 0;i < preference.length;i++) {
    var db_type = preference[i].toLowerCase();
    if(db_type == ydn.db.base.Mechanisms.IDB && ydn.db.con.IndexedDb.isSupported()) {
      db = this.createDbInstance(db_type);
      break
    }else {
      if(db_type == ydn.db.base.Mechanisms.WEBSQL && ydn.db.con.WebSql.isSupported()) {
        db = this.createDbInstance(db_type);
        break
      }else {
        if(db_type == ydn.db.base.Mechanisms.LOCAL_STORAGE && ydn.db.con.LocalStorage.isSupported()) {
          db = this.createDbInstance(db_type);
          break
        }else {
          if(db_type == ydn.db.base.Mechanisms.SESSION_STORAGE && ydn.db.con.SessionStorage.isSupported()) {
            db = this.createDbInstance(db_type);
            break
          }else {
            if(db_type == ydn.db.base.Mechanisms.MEMORY_STORAGE) {
              db = this.createDbInstance(db_type);
              break
            }else {
              if(db_type == ydn.db.base.Mechanisms.USER_DATA) {
                db = this.createDbInstance(db_type);
                break
              }
            }
          }
        }
      }
    }
  }
  if(goog.isNull(db)) {
    var e = new ydn.error.ConstraintError("No storage mechanism found.");
    var event = new ydn.db.events.StorageEvent(ydn.db.events.Types.READY, this, NaN, NaN, e);
    resolve(false, event)
  }else {
    this.init();
    db.connect(this.db_name, this.schema).addCallbacks(function(old_version) {
      this.db_ = db;
      var event = new ydn.db.events.StorageEvent(ydn.db.events.Types.READY, this, parseFloat(db.getVersion()), parseFloat(old_version), null);
      resolve(true, event);
      db.onDisconnected = function(e) {
        this.logger.finest(this + ": disconnected.")
      }
    }, function(e) {
      this.logger.warning(this + ": opening fail: " + e.message);
      var event = new ydn.db.events.StorageEvent(ydn.db.events.Types.READY, this, NaN, NaN, e);
      event.message = e.message;
      resolve(false, event)
    }, this)
  }
  return df
};
ydn.db.con.Storage.prototype.getType = function() {
  if(this.db_) {
    return this.db_.getType()
  }else {
    return undefined
  }
};
ydn.db.con.Storage.prototype.onReady = function(ev) {
  this.dispatchEvent(ev)
};
ydn.db.con.Storage.prototype.isReady = function() {
  return!!this.db_ && this.db_.isReady()
};
ydn.db.con.Storage.prototype.init = function() {
};
ydn.db.con.Storage.prototype.close = function() {
  if(this.db_) {
    this.db_.close();
    this.db_ = null;
    this.logger.finest(this + " closed")
  }
};
ydn.db.con.Storage.prototype.getDbInstance = function() {
  return this.db_ ? this.db_.getDbInstance() : null
};
ydn.db.con.Storage.prototype.last_queue_checkin_ = NaN;
ydn.db.con.Storage.QUEUE_LIMIT = 100;
ydn.db.con.Storage.prototype.countTxQueue = function() {
  return this.txQueue_.length
};
ydn.db.con.Storage.prototype.popTxQueue_ = function() {
  var task = this.txQueue_.shift();
  if(task) {
    this.logger.finest("pop tx queue " + task.fnc.name);
    this.transaction(task.fnc, task.scopes, task.mode, task.oncompleted)
  }
  this.last_queue_checkin_ = goog.now()
};
ydn.db.con.Storage.prototype.pushTxQueue_ = function(trFn, store_names, opt_mode, opt_on_completed) {
  this.logger.finest("push tx queue " + trFn.name);
  this.txQueue_.push({fnc:trFn, scopes:store_names, mode:opt_mode, oncompleted:opt_on_completed});
  if(goog.DEBUG && this.txQueue_.length > ydn.db.con.Storage.QUEUE_LIMIT && this.txQueue_.length % ydn.db.con.Storage.QUEUE_LIMIT == 0) {
    this.logger.warning("Transaction queue stack size is " + this.txQueue_.length + ". It is too large, possibility due to incorrect usage.")
  }
};
ydn.db.con.Storage.prototype.purgeTxQueue_ = function(e) {
  if(this.txQueue_) {
    this.logger.info("Purging " + this.txQueue_.length + " transactions request.");
    var task;
    while(task = this.txQueue_.shift()) {
      if(task.oncompleted) {
        task.oncompleted(ydn.db.base.TxEventTypes.ERROR, e)
      }
    }
  }
};
ydn.db.con.Storage.prototype.in_version_change_tx_ = false;
ydn.db.con.Storage.prototype.transaction = function(trFn, store_names, opt_mode, opt_on_completed) {
  var names = store_names;
  if(goog.isString(store_names)) {
    names = [store_names]
  }else {
    if(!goog.isDefAndNotNull(store_names)) {
      names = null
    }else {
      if(goog.DEBUG) {
        if(!goog.isArrayLike(store_names)) {
          throw new ydn.debug.error.ArgumentException("store names must be an array");
        }else {
          if(store_names.length == 0) {
            throw new ydn.debug.error.ArgumentException("number of store names must more than 0");
          }else {
            for(var i = 0;i < store_names.length;i++) {
              if(!goog.isString(store_names[i])) {
                throw new ydn.debug.error.ArgumentException("store name at " + i + " must be string but found " + typeof store_names[i]);
              }
            }
          }
        }
      }
    }
  }
  var is_ready = !!this.db_ && this.db_.isReady();
  if(!is_ready || this.in_version_change_tx_) {
    this.pushTxQueue_(trFn, names, opt_mode, opt_on_completed);
    return
  }
  var me = this;
  var mode = goog.isDef(opt_mode) ? opt_mode : ydn.db.base.TransactionMode.READ_ONLY;
  if(mode == ydn.db.base.TransactionMode.VERSION_CHANGE) {
    this.in_version_change_tx_ = true
  }
  var on_complete = function(type, ev) {
    if(goog.isFunction(opt_on_completed)) {
      opt_on_completed(type, ev);
      opt_on_completed = undefined
    }
    if(mode == ydn.db.base.TransactionMode.VERSION_CHANGE) {
      me.in_version_change_tx_ = false
    }
    me.popTxQueue_()
  };
  this.db_.doTransaction(function(tx) {
    trFn(tx);
    trFn = null
  }, names, mode, on_complete)
};
ydn.db.con.Storage.prototype.isAutoVersion = function() {
  return this.schema.isAutoVersion()
};
ydn.db.con.Storage.prototype.isAutoSchema = function() {
  return this.schema.isAutoSchema()
};
ydn.db.con.Storage.prototype.addSynchronizer = function(store, option) {
  this.logger.warning("Synchronization option for " + store.getName() + " ignored.")
};
if(goog.DEBUG) {
  ydn.db.con.Storage.prototype.addEventListener = function(type, handler, opt_capture, opt_handlerScope) {
    var checkType = function(type) {
      if(!goog.array.contains(["created", "ready", "deleted", "updated"], type)) {
        throw new ydn.debug.error.ArgumentException('Invalid event type "' + type + '"');
      }
    };
    if(goog.isArrayLike(type)) {
      for(var i = 0;i < type.length;i++) {
        checkType(type[i])
      }
    }else {
      checkType(type)
    }
    goog.base(this, "addEventListener", type, handler, opt_capture, opt_handlerScope)
  }
}
if(goog.DEBUG) {
  ydn.db.con.Storage.prototype.toString = function() {
    return"Storage:" + this.db_
  }
}
;goog.provide("ydn.db.tr.ParallelTxExecutor");
goog.require("ydn.debug.error.InternalError");
ydn.db.tr.ParallelTxExecutor = function(tx, tx_no, store_names, mode) {
  this.tx_ = tx;
  this.tx_no_ = tx_no;
  this.scopes_ = goog.array.clone(store_names);
  this.mode_ = mode;
  this.oncompleted_handlers = []
};
ydn.db.tr.ParallelTxExecutor.prototype.tx_ = null;
ydn.db.tr.ParallelTxExecutor.prototype.tx_no_;
ydn.db.tr.ParallelTxExecutor.prototype.oncompleted_handlers;
ydn.db.tr.ParallelTxExecutor.prototype.scopes_;
ydn.db.tr.ParallelTxExecutor.prototype.mode_;
ydn.db.tr.ParallelTxExecutor.prototype.isActive = function() {
  return!!this.tx_
};
ydn.db.tr.ParallelTxExecutor.prototype.getTx = function() {
  return this.tx_
};
ydn.db.tr.ParallelTxExecutor.prototype.getTxNo = function() {
  return this.tx_no_
};
ydn.db.tr.ParallelTxExecutor.prototype.onCompleted = function(t, e) {
  goog.asserts.assert(this.isActive(), this.tx_no_ + " already completed?");
  var fn;
  while(fn = this.oncompleted_handlers.shift()) {
    fn(t, e)
  }
  this.tx_ = null;
  this.scopes_ = null;
  this.oncompleted_handlers = null
};
ydn.db.tr.ParallelTxExecutor.prototype.executeTx = function(on_tx, opt_on_completed) {
  if(this.tx_) {
    on_tx(this.tx_);
    if(opt_on_completed) {
      this.oncompleted_handlers.push(opt_on_completed)
    }
  }else {
    throw new ydn.debug.error.InternalError("tx committed on ParallelTxExecutor");
  }
};
ydn.db.tr.ParallelTxExecutor.prototype.sameScope = function(scopes, mode) {
  if(!this.scopes_ || !this.mode_) {
    return false
  }
  if(mode != this.mode_) {
    return false
  }
  if(this.scopes_.length != scopes.length) {
    return false
  }
  for(var i = 0;i < scopes.length;i++) {
    if(this.scopes_.indexOf(scopes[i]) == -1) {
      return false
    }
  }
  return true
};
ydn.db.tr.ParallelTxExecutor.prototype.subScope = function(store_names, mode) {
  if(!this.scopes_ || !this.mode_) {
    return false
  }
  if(mode != this.mode_) {
    if(this.mode_ != ydn.db.base.TransactionMode.READ_WRITE || mode != ydn.db.base.TransactionMode.READ_ONLY) {
      return false
    }
  }
  if(store_names.length > this.scopes_.length) {
    return false
  }
  for(var i = 0;i < store_names.length;i++) {
    if(this.scopes_.indexOf(store_names[i]) == -1) {
      return false
    }
  }
  return true
};
if(goog.DEBUG) {
  ydn.db.tr.ParallelTxExecutor.prototype.toString = function() {
    return"ParallelTxExecutor: txNo:" + this.tx_no_ + " mode:" + this.mode_ + " scopes:" + ydn.json.stringify(this.scopes_)
  }
}
;goog.provide("ydn.db.tr.Parallel");
goog.require("ydn.db.tr.IThread");
goog.require("ydn.db.tr.ParallelTxExecutor");
goog.require("ydn.error.NotSupportedException");
ydn.db.tr.Parallel = function(storage, ptx_no, opt_policy, opt_store_names, opt_mode, opt_max_tx_no) {
  this.storage_ = storage;
  this.q_no_ = ptx_no;
  this.tx_no_ = 0;
  this.r_no_ = 0;
  this.pl_tx_ex_ = null;
  this.p_request_tx = null;
  this.scope_store_names_ = opt_store_names;
  this.scope_mode_ = opt_mode;
  this.policy_ = opt_policy || ydn.db.tr.IThread.Policy.SINGLE;
  this.max_tx_no_ = opt_max_tx_no || 0
};
ydn.db.tr.Parallel.DEBUG = false;
ydn.db.tr.Parallel.prototype.r_no_;
ydn.db.tr.Parallel.prototype.q_no_;
ydn.db.tr.Parallel.prototype.tx_no_ = 0;
ydn.db.tr.Parallel.prototype.max_tx_no_ = 0;
ydn.db.tr.Parallel.prototype.scope_store_names_;
ydn.db.tr.Parallel.prototype.scope_mode_;
ydn.db.tr.Parallel.prototype.policy_;
ydn.db.tr.Parallel.prototype.pl_tx_ex_ = null;
ydn.db.tr.Parallel.prototype.p_request_tx = null;
ydn.db.tr.Parallel.prototype.logger = goog.debug.Logger.getLogger("ydn.db.tr.Parallel");
ydn.db.tr.Parallel.prototype.addStoreSchema = function(store) {
  return this.storage_.addStoreSchema(store)
};
ydn.db.tr.Parallel.prototype.getThreadName = function() {
  return this.getLabel()
};
ydn.db.tr.Parallel.prototype.getTxNo = function() {
  return this.tx_no_
};
ydn.db.tr.Parallel.prototype.getQueueNo = function() {
  return this.q_no_
};
ydn.db.tr.Parallel.prototype.type = function() {
  return this.storage_.getType()
};
ydn.db.tr.Parallel.prototype.getStorage = function() {
  return this.storage_
};
ydn.db.tr.Parallel.prototype.getPlTx = function() {
  return this.pl_tx_ex_
};
ydn.db.tr.Parallel.prototype.isActive = function() {
  return!!this.pl_tx_ex_ && this.pl_tx_ex_.isActive()
};
ydn.db.tr.Parallel.prototype.sameScope = function(store_names, mode) {
  return this.pl_tx_ex_.sameScope(store_names, mode)
};
ydn.db.tr.Parallel.prototype.subScope = function(store_names, mode) {
  return this.pl_tx_ex_.subScope(store_names, mode)
};
ydn.db.tr.Parallel.prototype.abort = function() {
  this.logger.finer(this + ": aborting");
  ydn.db.tr.IThread.abort(this.p_request_tx)
};
ydn.db.tr.Parallel.prototype.getExecutor = goog.abstractMethod;
ydn.db.tr.Parallel.prototype.reusedTx = function(store_names, mode) {
  if(this.policy_ == ydn.db.tr.IThread.Policy.MULTI) {
    return this.pl_tx_ex_.subScope(store_names, mode)
  }else {
    if(this.policy_ == ydn.db.tr.IThread.Policy.REPEAT) {
      return this.pl_tx_ex_.sameScope(store_names, mode)
    }else {
      if(this.policy_ == ydn.db.tr.IThread.Policy.ALL) {
        return true
      }else {
        return false
      }
    }
  }
};
ydn.db.tr.Parallel.prototype.processTx = function(callback, store_names, opt_mode, on_completed) {
  var label;
  if(this.scope_store_names_) {
    store_names = this.scope_store_names_
  }
  if(this.scope_mode_) {
    opt_mode = this.scope_mode_
  }
  var mode = goog.isDef(opt_mode) ? opt_mode : ydn.db.base.TransactionMode.READ_ONLY;
  var me = this;
  var pl_tx_ex;
  var completed_handler = function(type, event) {
    if(type == ydn.db.base.TxEventTypes.COMPLETE) {
      me.logger.fine(label + " COMMITTED")
    }else {
      me.logger.fine(label + " COMMITTED" + " with " + type)
    }
    pl_tx_ex.onCompleted(type, event)
  };
  var transaction_process = function(tx) {
    me.tx_no_++;
    pl_tx_ex = new ydn.db.tr.ParallelTxExecutor(tx, me.tx_no_, store_names, mode);
    label = me.getLabel();
    me.logger.fine(label + " BEGIN " + ydn.json.stringify(store_names) + " " + mode);
    me.pl_tx_ex_ = pl_tx_ex;
    me.pl_tx_ex_.executeTx(callback, on_completed)
  };
  var reused = this.isActive() && this.reusedTx(store_names, mode);
  if(ydn.db.tr.Parallel.DEBUG) {
    var act = this.isActive() ? "active" : "inactive";
    window.console.log(this + " " + this.pl_tx_ex_ + (reused ? " reusing " + act + " transaction" : " opening " + act + " transaction ") + " for mode:" + mode + " scopes:" + ydn.json.stringify(store_names))
  }
  if(reused) {
    this.pl_tx_ex_.executeTx(callback, on_completed)
  }else {
    if(this.max_tx_no_ && this.tx_no_ >= this.max_tx_no_) {
      throw new ydn.debug.error.InvalidOperationException("Exceed maximum number of transactions of " + this.max_tx_no_);
    }
    this.storage_.transaction(transaction_process, store_names, mode, completed_handler)
  }
};
ydn.db.tr.Parallel.prototype.exec = function(df, callback, store_names, mode, on_completed) {
  var me = this;
  var rq_label;
  if(ydn.db.tr.Parallel.DEBUG) {
    var rdn = "SN" + Math.random();
    rdn = rdn.replace(".", "");
    window.console.log(this + " scheduling to execute " + store_names + " " + mode + " " + rdn)
  }
  this.processTx(function(tx) {
    if(ydn.db.tr.Parallel.DEBUG) {
      window.console.log(this + " executing " + rdn)
    }
    me.r_no_++;
    rq_label = me.getLabel() + "R" + me.r_no_;
    var resultCallback = function(result, is_error) {
      me.p_request_tx = tx;
      rq_label = me.getLabel() + "R" + me.r_no_;
      if(is_error) {
        me.logger.finer(rq_label + " ERROR");
        df.errback(result)
      }else {
        me.logger.finer(rq_label + " SUCCESS");
        df.callback(result)
      }
      me.p_request_tx = null
    };
    me.logger.finer(rq_label + " BEGIN");
    callback(tx, me.getLabel(), resultCallback);
    callback = null;
    me.logger.finer(rq_label + " END")
  }, store_names, mode, on_completed)
};
ydn.db.tr.Parallel.prototype.getLabel = function() {
  return"B" + this.q_no_ + "T" + this.tx_no_
};
if(goog.DEBUG) {
  ydn.db.tr.Parallel.prototype.toString = function() {
    var s = this.p_request_tx ? "*" : "";
    return"Parallel:" + this.policy_ + ":" + this.getLabel() + s
  }
}
;goog.provide("ydn.db.tr.AtomicParallel");
goog.require("ydn.db.tr.IThread");
goog.require("ydn.db.tr.Parallel");
goog.require("ydn.error.NotSupportedException");
ydn.db.tr.AtomicParallel = function(storage, ptx_no) {
  goog.base(this, storage, ptx_no, ydn.db.tr.IThread.Policy.SINGLE)
};
goog.inherits(ydn.db.tr.AtomicParallel, ydn.db.tr.Parallel);
ydn.db.tr.AtomicParallel.DEBUG = false;
ydn.db.tr.AtomicParallel.prototype.reusedTx = function(scopes, mode) {
  return false
};
ydn.db.tr.AtomicParallel.prototype.exec = function(df, callback, store_names, mode, on_completed) {
  var result;
  var is_error;
  var cdf = new goog.async.Deferred;
  cdf.addCallbacks(function(x) {
    is_error = false;
    result = x
  }, function(e) {
    is_error = true;
    result = e
  });
  var completed_handler = function(t, e) {
    if(is_error === true) {
      df.errback(result)
    }else {
      if(is_error === false) {
        df.callback(result)
      }else {
        var err = new ydn.db.TimeoutError;
        df.errback(err)
      }
    }
    if(on_completed) {
      on_completed(t, e);
      on_completed = undefined
    }
  };
  goog.base(this, "exec", cdf, callback, store_names, mode, completed_handler)
};
goog.provide("ydn.db.tr.OverflowSerial");
goog.require("ydn.db.tr.IThread");
goog.require("ydn.db.tr.Serial");
goog.require("ydn.error.NotSupportedException");
ydn.db.tr.OverflowSerial = function(storage, ptx_no) {
  goog.base(this, storage, ptx_no)
};
goog.inherits(ydn.db.tr.OverflowSerial, ydn.db.tr.Serial);
ydn.db.tr.OverflowSerial.DEBUG = false;
ydn.db.tr.OverflowSerial.prototype.reusedTx = function(store_names, mode) {
  return this.getMuTx().subScope(store_names, mode)
};
goog.provide("ydn.db.tr.StrictOverflowSerial");
goog.require("ydn.db.tr.IThread");
goog.require("ydn.db.tr.Serial");
goog.require("ydn.error.NotSupportedException");
ydn.db.tr.StrictOverflowSerial = function(storage, ptx_no) {
  goog.base(this, storage, ptx_no)
};
goog.inherits(ydn.db.tr.StrictOverflowSerial, ydn.db.tr.Serial);
ydn.db.tr.StrictOverflowSerial.DEBUG = false;
ydn.db.tr.StrictOverflowSerial.prototype.logger = goog.debug.Logger.getLogger("ydn.db.tr.StrictOverflowSerial");
ydn.db.tr.StrictOverflowSerial.prototype.reusedTx = function(store_names, mode) {
  return this.getMuTx().sameScope(store_names, mode)
};
ydn.db.tr.StrictOverflowSerial.prototype.isNextTxCompatible = function() {
  var mu_tx = this.getMuTx();
  return!!mu_tx && mu_tx.sameScope(this.peekScopes(), this.peekMode())
};
goog.provide("ydn.db.tr.Mutex");
goog.require("goog.array");
goog.require("goog.asserts");
goog.require("ydn.db.InvalidStateError");
ydn.db.tr.Mutex = function(tr_no) {
  this.tr_no = tr_no;
  this.tx_ = null;
  this.tx_count_ = 0
};
ydn.db.tr.Mutex.prototype.tx_;
ydn.db.tr.Mutex.prototype.logger = goog.debug.Logger.getLogger("ydn.db.tr.Mutex");
ydn.db.tr.Mutex.DEBUG = false;
ydn.db.tr.Mutex.prototype.up = function(tx, store_names, mode) {
  goog.asserts.assert(!this.tx_, this + ": transaction overlap");
  this.tx_ = tx;
  this.is_locked_ = false;
  this.out_of_scope_ = false;
  this.store_names = store_names;
  this.mode = mode;
  this.tx_count_++;
  this.oncompleted = null;
  if(ydn.db.tr.Mutex.DEBUG) {
    window.console.log(this + ": open")
  }
};
ydn.db.tr.Mutex.prototype.idb_tx_ = null;
ydn.db.tr.Mutex.prototype.is_set_done_ = false;
ydn.db.tr.Mutex.prototype.scope_name;
ydn.db.tr.Mutex.prototype.tx_count_;
ydn.db.tr.Mutex.prototype.store_names = null;
ydn.db.tr.Mutex.prototype.mode;
ydn.db.tr.Mutex.prototype.getThreadName = function() {
  return"B" + this.scope_name + "T" + this.tx_count_
};
ydn.db.tr.Mutex.prototype.sameScope = function(store_names, mode) {
  if(!this.store_names || !this.mode) {
    return false
  }
  if(mode != this.mode) {
    return false
  }
  if(this.store_names.length != store_names.length) {
    return false
  }
  for(var i = 0;i < store_names.length;i++) {
    if(this.store_names.indexOf(store_names[i]) == -1) {
      return false
    }
  }
  return true
};
ydn.db.tr.Mutex.prototype.subScope = function(store_names, mode) {
  if(!this.store_names || !this.mode) {
    return false
  }
  if(mode != this.mode) {
    if(this.mode != ydn.db.base.TransactionMode.READ_WRITE || mode != ydn.db.base.TransactionMode.READ_ONLY) {
      return false
    }
  }
  if(store_names.length > this.store_names.length) {
    return false
  }
  for(var i = 0;i < store_names.length;i++) {
    if(this.store_names.indexOf(store_names[i]) == -1) {
      return false
    }
  }
  return true
};
ydn.db.tr.Mutex.prototype.down = function(type, event) {
  if(this.tx_) {
    if(ydn.db.tr.Mutex.DEBUG) {
      window.console.log(this + ": close")
    }
    this.tx_ = null;
    this.store_names = null;
    this.mode = null;
    if(goog.isFunction(this.oncompleted)) {
      this.oncompleted(type, event)
    }
    this.oncompleted = null
  }else {
    this.logger.warning(this + " has no TX to be unlocked for " + type)
  }
};
ydn.db.tr.Mutex.prototype.out = function() {
  this.out_of_scope_ = true
};
ydn.db.tr.Mutex.prototype.inScope = function() {
  return!this.out_of_scope_
};
ydn.db.tr.Mutex.prototype.lock = function() {
  if(ydn.db.tr.Mutex.DEBUG) {
    window.console.log(this + ": locked")
  }
  this.is_locked_ = true
};
ydn.db.tr.Mutex.prototype.getTxCount = function() {
  return this.tx_count_
};
ydn.db.tr.Mutex.prototype.isLocked = function() {
  return this.is_locked_
};
ydn.db.tr.Mutex.prototype.isActive = function() {
  return!!this.tx_
};
ydn.db.tr.Mutex.prototype.isAvailable = function() {
  return!this.is_locked_
};
ydn.db.tr.Mutex.prototype.isActiveAndAvailable = function() {
  return this.isActive() && this.isAvailable()
};
ydn.db.tr.Mutex.prototype.oncompleted = null;
ydn.db.tr.Mutex.prototype.getTx = function() {
  return this.tx_
};
ydn.db.tr.Mutex.prototype.getLabel = function() {
  return"B" + this.tr_no + "T" + this.tx_count_
};
if(goog.DEBUG) {
  ydn.db.tr.Mutex.prototype.toString = function() {
    var s = !!this.tx_ ? "*" : "";
    return"Mutex:" + this.getLabel() + s
  }
}
;goog.provide("ydn.db.tr.IStorage");
goog.require("ydn.db.tr.Mutex");
ydn.db.tr.IStorage = function() {
};
ydn.db.tr.IStorage.prototype.run = goog.abstractMethod;
ydn.db.tr.IStorage.getTx = function() {
};
ydn.db.tr.IStorage.prototype.getTxNo = function() {
};
goog.provide("ydn.db.tr.Storage");
goog.require("ydn.db.con.Storage");
goog.require("ydn.db.tr.AtomicParallel");
goog.require("ydn.db.tr.AtomicSerial");
goog.require("ydn.db.tr.OverflowSerial");
goog.require("ydn.db.tr.StrictOverflowSerial");
goog.require("ydn.db.tr.DbOperator");
goog.require("ydn.db.tr.IStorage");
goog.require("ydn.db.tr.Parallel");
goog.require("ydn.db.tr.Serial");
ydn.db.tr.Storage = function(opt_dbname, opt_schema, opt_options) {
  goog.base(this, opt_dbname, opt_schema, opt_options);
  this.ptx_no = 0;
  var is_serial = true;
  var req_type = ydn.db.tr.IThread.Policy.SINGLE;
  if(opt_options) {
    if(goog.isDef(opt_options.isSerial)) {
      is_serial = !!opt_options.isSerial
    }
    if(opt_options.policy) {
      req_type = (opt_options.policy)
    }
  }
  this.sync_thread = ydn.db.base.USE_HOOK ? this.newTxQueue(ydn.db.tr.IThread.Policy.ATOMIC, false) : null;
  this.db_operator = this.branch(req_type, is_serial)
};
goog.inherits(ydn.db.tr.Storage, ydn.db.con.Storage);
ydn.db.tr.Storage.prototype.sync_thread;
ydn.db.tr.Storage.prototype.db_operator;
ydn.db.tr.Storage.prototype.ptx_no = 0;
ydn.db.tr.Storage.prototype.branch = function(request_type, opt_is_serial, opt_store_names, opt_mode, opt_max_tx) {
  var mode;
  if(opt_mode == ydn.db.base.StandardTransactionMode.READ_ONLY) {
    mode = ydn.db.base.TransactionMode.READ_ONLY
  }else {
    if(opt_mode == ydn.db.base.StandardTransactionMode.READ_WRITE) {
      mode = ydn.db.base.TransactionMode.READ_WRITE
    }
  }
  var tx_thread = this.newTxQueue(request_type, opt_is_serial, opt_store_names, mode, opt_max_tx);
  return this.newOperator(tx_thread, this.sync_thread)
};
ydn.db.tr.Storage.prototype.getTxNo = function() {
  return this.db_operator ? this.db_operator.getTxNo() : NaN
};
ydn.db.tr.Storage.prototype.newOperator = function(tx_thread, sync_thread) {
  return new ydn.db.tr.DbOperator(this, this.schema, tx_thread, sync_thread)
};
ydn.db.tr.Storage.prototype.newTxQueue = function(request_type, opt_is_serial, opt_store_names, opt_mode, opt_max_tx) {
  if(opt_is_serial) {
    if(request_type == ydn.db.tr.IThread.Policy.MULTI) {
      return new ydn.db.tr.OverflowSerial(this, this.ptx_no++)
    }else {
      if(request_type == ydn.db.tr.IThread.Policy.REPEAT) {
        return new ydn.db.tr.StrictOverflowSerial(this, this.ptx_no++)
      }else {
        if(request_type == ydn.db.tr.IThread.Policy.ATOMIC) {
          return new ydn.db.tr.AtomicSerial(this, this.ptx_no++)
        }else {
          if(request_type == ydn.db.tr.IThread.Policy.SINGLE) {
            return new ydn.db.tr.Serial(this, this.ptx_no++, opt_max_tx)
          }else {
            throw new ydn.debug.error.ArgumentException('Invalid requestType "' + request_type + '"');
          }
        }
      }
    }
  }else {
    if(request_type == ydn.db.tr.IThread.Policy.MULTI || request_type == ydn.db.tr.IThread.Policy.REPEAT || request_type == ydn.db.tr.IThread.Policy.ALL || request_type == ydn.db.tr.IThread.Policy.SINGLE) {
      return new ydn.db.tr.Parallel(this, this.ptx_no++, request_type, opt_store_names, opt_mode, opt_max_tx)
    }else {
      if(request_type == ydn.db.tr.IThread.Policy.ATOMIC) {
        return new ydn.db.tr.AtomicParallel(this, this.ptx_no++)
      }else {
        throw new ydn.debug.error.ArgumentException('Invalid requestType "' + request_type + '"');
      }
    }
  }
};
ydn.db.tr.Storage.prototype.abort = function() {
  this.db_operator.abort()
};
ydn.db.tr.Storage.prototype.run = function(trFn, store_names, opt_mode, oncompleted, opt_args) {
  var me = this;
  this.ptx_no++;
  var mode = ydn.db.base.TransactionMode.READ_ONLY;
  if(opt_mode) {
    if(opt_mode == ydn.db.base.StandardTransactionMode.READ_WRITE) {
      mode = ydn.db.base.TransactionMode.READ_WRITE
    }else {
      if(opt_mode != ydn.db.base.StandardTransactionMode.READ_ONLY) {
        throw new ydn.debug.error.ArgumentException('Invalid transaction mode "' + opt_mode + '"');
      }
    }
  }
  var tx_thread = this.newTxQueue(ydn.db.tr.IThread.Policy.ALL, false, store_names, mode, 1);
  var db_operator = this.newOperator(tx_thread, this.sync_thread);
  if(!goog.isDefAndNotNull(store_names)) {
    store_names = this.schema.getStoreNames()
  }
  if(goog.DEBUG) {
    if(!goog.isArrayLike(store_names)) {
      throw new ydn.debug.error.ArgumentException("store names must be an array");
    }else {
      if(store_names.length == 0) {
        throw new ydn.debug.error.ArgumentException("number of store names must more than 0");
      }else {
        for(var i = 0;i < store_names.length;i++) {
          if(!goog.isString(store_names[i])) {
            throw new ydn.debug.error.ArgumentException("store name at " + i + " must be string but found " + typeof store_names[i]);
          }
        }
      }
    }
  }
  var outFn = trFn;
  if(arguments.length > 4) {
    var args = Array.prototype.slice.call(arguments, 4);
    outFn = function() {
      var newArgs = Array.prototype.slice.call(arguments);
      newArgs = newArgs.concat(args);
      return trFn.apply(this, newArgs)
    }
  }
  this.logger.finest("scheduling run in transaction with " + tx_thread);
  tx_thread.processTx(function(tx) {
    me.logger.finest("executing run in transaction on " + tx_thread);
    outFn((db_operator));
    outFn = null
  }, store_names, mode, oncompleted)
};
goog.provide("ydn.db.crud.Storage");
goog.require("goog.userAgent.product");
goog.require("ydn.async");
goog.require("ydn.db.crud.IOperator");
goog.require("ydn.db.crud.DbOperator");
goog.require("ydn.db.tr.Storage");
goog.require("ydn.object");
if(!ydn.db.base.NO_IDB) {
  goog.require("ydn.db.crud.req.IndexedDb")
}
if(!ydn.db.base.NO_SIMPLE) {
  goog.require("ydn.db.crud.req.SimpleStore")
}
if(!ydn.db.base.NO_WEBSQL) {
  goog.require("ydn.db.crud.req.WebSql")
}
ydn.db.crud.Storage = function(opt_dbname, opt_schema, opt_options) {
  goog.base(this, opt_dbname, opt_schema, opt_options)
};
goog.inherits(ydn.db.crud.Storage, ydn.db.tr.Storage);
ydn.db.crud.Storage.prototype.init = function() {
  goog.base(this, "init")
};
ydn.db.crud.Storage.prototype.newOperator = function(tx_thread, sync_thread) {
  return new ydn.db.crud.DbOperator(this, this.schema, tx_thread, sync_thread)
};
ydn.db.crud.Storage.prototype.getCoreOperator = function() {
  return(this.db_operator)
};
ydn.db.crud.Storage.prototype.newExecutor = function() {
  var type = this.getType();
  if(!ydn.db.base.NO_IDB && type == ydn.db.base.Mechanisms.IDB) {
    return new ydn.db.crud.req.IndexedDb(this.db_name, this.schema)
  }else {
    if(!ydn.db.base.NO_WEBSQL && type == ydn.db.base.Mechanisms.WEBSQL) {
      return new ydn.db.crud.req.WebSql(this.db_name, this.schema)
    }else {
      if(!ydn.db.base.NO_SIMPLE && type == ydn.db.base.Mechanisms.MEMORY_STORAGE || type == ydn.db.base.Mechanisms.LOCAL_STORAGE || type == ydn.db.base.Mechanisms.USER_DATA || type == ydn.db.base.Mechanisms.SESSION_STORAGE) {
        return new ydn.db.crud.req.SimpleStore(this.db_name, this.schema)
      }else {
        throw new ydn.db.InternalError("No executor for " + type);
      }
    }
  }
};
ydn.db.crud.Storage.prototype.add = function(store, value, opt_key) {
  return this.getCoreOperator().add(store, value, opt_key)
};
ydn.db.crud.Storage.prototype.count = function(store_name, key_range, index, unique) {
  return this.getCoreOperator().count(store_name, key_range, index, unique)
};
ydn.db.crud.Storage.prototype.get = function(arg1, arg2) {
  return this.getCoreOperator().get(arg1, arg2)
};
ydn.db.crud.Storage.prototype.keys = function(store_name, arg2, arg3, arg4, arg5, arg6) {
  return this.getCoreOperator().keys(store_name, arg2, arg3, arg4, arg5, arg6)
};
ydn.db.crud.Storage.prototype.values = function(arg1, arg2, arg3, arg4, arg5, arg6) {
  return this.getCoreOperator().values(arg1, arg2, arg3, arg4, arg5, arg6)
};
ydn.db.crud.Storage.prototype.load = function(store_name_or_schema, data, delimiter) {
  return this.getCoreOperator().load(store_name_or_schema, data, delimiter)
};
ydn.db.crud.Storage.prototype.put = function(store, value, opt_key) {
  return this.getCoreOperator().put(store, value, opt_key)
};
ydn.db.crud.Storage.prototype.clear = function(arg1, arg2, arg3) {
  return this.getCoreOperator().clear(arg1, arg2, arg3)
};
ydn.db.crud.Storage.prototype.remove = function(arg1, arg2, arg3) {
  return this.getCoreOperator().remove(arg1, arg2, arg3)
};
if(goog.DEBUG) {
  ydn.db.crud.Storage.prototype.toString = function() {
    var s = "Storage:" + this.getName();
    if(this.isReady()) {
      s += " [" + this.getType() + "]"
    }
    return s
  }
}
;goog.provide("ydn.db.core.Storage");
goog.require("ydn.db.core.DbOperator");
goog.require("ydn.db.crud.Storage");
ydn.db.core.Storage = function(opt_dbname, opt_schema, opt_options) {
  goog.base(this, opt_dbname, opt_schema, opt_options)
};
goog.inherits(ydn.db.core.Storage, ydn.db.crud.Storage);
ydn.db.core.Storage.prototype.newExecutor = function() {
  var type = this.getType();
  if(type == ydn.db.base.Mechanisms.IDB) {
    return new ydn.db.core.req.IndexedDb(this.db_name, this.schema)
  }else {
    if(type == ydn.db.base.Mechanisms.WEBSQL) {
      return new ydn.db.core.req.WebSql(this.db_name, this.schema)
    }else {
      if(type == ydn.db.base.Mechanisms.MEMORY_STORAGE || type == ydn.db.base.Mechanisms.USER_DATA || type == ydn.db.base.Mechanisms.LOCAL_STORAGE || type == ydn.db.base.Mechanisms.SESSION_STORAGE) {
        return new ydn.db.core.req.SimpleStore(this.db_name, this.schema)
      }else {
        throw new ydn.db.InternalError("No executor for " + type);
      }
    }
  }
};
ydn.db.core.Storage.prototype.newOperator = function(tx_thread, sync_thread) {
  return new ydn.db.core.DbOperator(this, this.schema, tx_thread, sync_thread)
};
ydn.db.core.Storage.prototype.getIndexOperator = function() {
  return(this.db_operator)
};
ydn.db.core.Storage.prototype.open = function(callback, iterator, opt_mode) {
  return this.getIndexOperator().open(callback, iterator, opt_mode)
};
ydn.db.core.Storage.prototype.scan = function(solver, iterators) {
  return this.getIndexOperator().scan(solver, iterators)
};
ydn.db.core.Storage.prototype.map = function(iterator, callback) {
  return this.getIndexOperator().map(iterator, callback)
};
ydn.db.core.Storage.prototype.reduce = function(iterator, callback, opt_initial) {
  return this.getIndexOperator().reduce(iterator, callback, opt_initial)
};
goog.provide("ydn.db.sql.req.IterableQuery");
goog.require("ydn.db.Iterator");
goog.require("goog.functions");
goog.require("ydn.db.KeyRange");
goog.require("ydn.db.Where");
goog.require("ydn.error.ArgumentException");
ydn.db.sql.req.IterableQuery = function(store, index, keyRange, reverse, unique, key_only, filter, continued) {
  goog.base(this, store, index, keyRange, reverse, unique, key_only);
  this.initial = null;
  this.map = null;
  this.reduce = null;
  this.finalize = null;
  this.filter_fn = filter || null;
  this.continued = continued || null
};
goog.inherits(ydn.db.sql.req.IterableQuery, ydn.db.Iterator);
ydn.db.sql.req.IterableQuery.prototype.toJSON = function() {
  var obj = goog.base(this, "toJSON");
  obj["initial"] = this.initial ? this.initial.toString() : null;
  obj["map"] = this.map ? this.map.toString() : null;
  obj["reduce"] = this.reduce ? this.reduce.toString() : null;
  obj["finalize"] = this.finalize ? this.finalize.toString() : null;
  return obj
};
ydn.db.sql.req.IterableQuery.prototype.initial = null;
ydn.db.sql.req.IterableQuery.prototype.map = null;
ydn.db.sql.req.IterableQuery.prototype.reduce = null;
ydn.db.sql.req.IterableQuery.prototype.finalize = null;
ydn.db.sql.req.IterableQuery.prototype.toString = function() {
  var idx = goog.isDef(this.getIndexName()) ? ":" + this.getIndexName() : "";
  return"Cursor:" + this.getStoreName() + idx
};
ydn.db.sql.req.IterableQuery.prototype.processWhereAsFilter = function(where) {
  var prev_filter = goog.functions.TRUE;
  if(goog.isFunction(this.filter_fn)) {
    prev_filter = this.filter_fn
  }
  this.filter_fn = function(obj) {
    var value = obj[where.getField()];
    var ok1 = true;
    var key_range = where.getKeyRange();
    if(key_range) {
      if(goog.isDefAndNotNull(key_range.lower)) {
        ok1 = key_range.lowerOpen ? value < key_range.lower : value <= key_range.lower
      }
      var ok2 = true;
      if(goog.isDefAndNotNull(key_range.upper)) {
        ok2 = key_range.upperOpen ? value > key_range.upper : value >= key_range.upper
      }
    }
    return prev_filter(obj) && ok1 && ok2
  }
};
goog.provide("ydn.db.sql.req.IdbQuery");
goog.require("ydn.db.sql.req.IterableQuery");
goog.require("goog.functions");
goog.require("ydn.db.KeyRange");
goog.require("ydn.db.Where");
goog.require("ydn.error.ArgumentException");
ydn.db.sql.req.IdbQuery = function(store, index, keyRange, reverse, unique, key_only, filter, continued) {
  goog.base(this, store, index, keyRange, reverse, unique, key_only, filter, continued)
};
goog.inherits(ydn.db.sql.req.IdbQuery, ydn.db.sql.req.IterableQuery);
ydn.db.sql.req.IdbQuery.Methods = {OPEN:"op", COUNT:"cn"};
ydn.db.sql.req.IdbQuery.prototype.method = ydn.db.sql.req.IdbQuery.Methods.OPEN;
goog.provide("ydn.math.Expression");
goog.require("ydn.string");
goog.require("goog.string");
goog.require("ydn.object");
goog.require("ydn.error");
ydn.math.Expression = function(tokens) {
  this.tokens = tokens
};
ydn.math.Expression.prototype.tokens = [];
ydn.math.Expression.prototype.evaluate = function(with_object, var_args) {
  var stack = [];
  for(var i = 0;i < this.tokens.length;i++) {
    var tok = this.tokens[i];
    var is_field_name = tok[0] === '"' && tok[tok.length - 1] === '"';
    var is_string_literal = tok[0] === "'" && tok[tok.length - 1] === "'";
    if(is_field_name) {
      var keys = goog.string.stripQuotes(tok, '"').split(".");
      goog.asserts.assertObject(with_object);
      var value = goog.object.getValueByKeys(with_object, keys);
      stack.push(value)
    }else {
      if(is_string_literal) {
        stack.push(goog.string.stripQuotes(tok, "'"))
      }else {
        if(goog.isString(tok)) {
          if(tok === "true") {
            stack.push(true)
          }else {
            if(tok === "false") {
              stack.push(false)
            }else {
              if(tok === "Date") {
                stack.push(new Date(parseInt(stack.pop(), 10)))
              }else {
                if(tok === "now") {
                  stack.push(new Date)
                }else {
                  if(tok === "!") {
                    stack[stack.length - 1] = !stack[stack.length - 1]
                  }else {
                    if(tok === "==") {
                      stack.push(stack.pop() == stack.pop())
                    }else {
                      if(tok === "===") {
                        stack.push(stack.pop() === stack.pop())
                      }else {
                        if(tok === "!=") {
                          stack.push(stack.pop() != stack.pop())
                        }else {
                          if(tok === "!==") {
                            stack.push(stack.pop() !== stack.pop())
                          }else {
                            if(tok === "<=") {
                              stack.push(stack.pop() <= stack.pop())
                            }else {
                              if(tok === "<") {
                                stack.push(stack.pop() < stack.pop())
                              }else {
                                if(tok === ">=") {
                                  stack.push(stack.pop() >= stack.pop())
                                }else {
                                  if(tok === ">") {
                                    stack.push(stack.pop() > stack.pop())
                                  }else {
                                    if(tok === "&") {
                                      stack.push(stack.pop() & stack.pop())
                                    }else {
                                      if(tok === "|") {
                                        stack.push(stack.pop() | stack.pop())
                                      }else {
                                        if(tok === "?") {
                                          var ok = !!stack.pop();
                                          var a = stack.pop();
                                          var b = stack.pop();
                                          var v = ok ? a : b;
                                          stack.push(v)
                                        }else {
                                          if(tok === "+") {
                                            stack.push(stack.pop() + stack.pop())
                                          }else {
                                            if(tok === "-") {
                                              stack.push(stack.pop() - stack.pop())
                                            }else {
                                              if(tok === "*") {
                                                stack.push(stack.pop() * stack.pop())
                                              }else {
                                                if(tok === "/") {
                                                  stack.push(stack.pop() / stack.pop())
                                                }else {
                                                  if(tok === "%") {
                                                    stack.push(stack.pop() % stack.pop())
                                                  }else {
                                                    if(tok === "at") {
                                                      var at = stack.pop();
                                                      var arr = stack.pop();
                                                      stack.push(arr[at])
                                                    }else {
                                                      if(tok === "of") {
                                                        var ele = stack.pop();
                                                        var arr = stack.pop();
                                                        var v = goog.isArray(arr) ? arr.indexOf(ele) : -1;
                                                        stack.push(v)
                                                      }else {
                                                        if(tok === "in") {
                                                          var ele = stack.pop();
                                                          var arr = stack.pop();
                                                          var v = goog.isArray(arr) ? arr.indexOf(ele) >= 0 : false;
                                                          stack.push(v)
                                                        }else {
                                                          if(tok === "abs") {
                                                            stack[stack.length - 1] = Math.abs(stack[stack.length - 1])
                                                          }else {
                                                            if(tok[0] == "$" && /^\$\d$/.test(tok)) {
                                                              var pos = parseInt(tok.match(/^\$(\d)$/)[1], 10);
                                                              stack.push(arguments[pos])
                                                            }else {
                                                              stack.push(parseFloat(tok))
                                                            }
                                                          }
                                                        }
                                                      }
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }else {
          stack.push(tok)
        }
      }
    }
  }
  return stack[0]
};
ydn.math.Expression.prototype.compile = function() {
  var tokens = this.tokens;
  return function() {
    var args = arguments.length > 2 ? Array.prototype.slice(arguments, 2) : undefined;
    return ydn.math.Expression.prototype.evaluate.apply(null, args)
  }
};
ydn.math.Expression.prototype.toJSON = function() {
  return{"Tokens":ydn.object.clone(this.tokens)}
};
ydn.math.Expression.parseRpn = function(expression) {
  return new ydn.math.Expression(ydn.string.split_space(expression))
};
ydn.math.Expression.parseInfix = function(expression) {
  throw new ydn.error.NotImplementedException("Too lazy to learn Dutch in Shunting Yard station, " + "we speak Polish here.");
};
goog.provide("ydn.db.Sql");
goog.require("goog.functions");
goog.require("ydn.db.KeyRange");
goog.require("ydn.db.schema.Database");
goog.require("ydn.error.ArgumentException");
goog.require("ydn.db.sql.req.IdbQuery");
goog.require("ydn.math.Expression");
goog.require("ydn.db.Where");
goog.require("ydn.string");
ydn.db.Sql = function(sql) {
  if(!goog.isString(sql)) {
    throw new ydn.error.ArgumentException;
  }
  this.sql_ = sql;
  this.parseBasic_(sql);
  this.last_error_ = "";
  this.has_parsed_ = false
};
ydn.db.Sql.prototype.sql_ = "";
ydn.db.Sql.prototype.mode_ = ydn.db.base.TransactionMode.READ_ONLY;
ydn.db.Sql.prototype.store_names_;
ydn.db.Sql.prototype.modifier_;
ydn.db.Sql.prototype.condition_;
ydn.db.Sql.prototype.aggregate_;
ydn.db.Sql.prototype.order_;
ydn.db.Sql.prototype.limit_ = NaN;
ydn.db.Sql.prototype.offset_ = NaN;
ydn.db.Sql.prototype.reverse_ = false;
ydn.db.Sql.prototype.selList_;
ydn.db.Sql.prototype.last_error_ = "";
ydn.db.Sql.prototype.has_parsed_ = false;
ydn.db.Sql.prototype.parseBasic_ = function(sql) {
  var from_parts = sql.split(/\sFROM\s/i);
  if(from_parts.length != 2) {
    throw new ydn.db.SqlParseError("FROM required.");
  }
  var pre_from = from_parts[0];
  var post_from = from_parts[1];
  var pre_from_parts = pre_from.match(/\s*?(SELECT|INSERT|UPDATE|DELETE)\s+(.*)/i);
  if(pre_from_parts.length != 3) {
    throw new ydn.db.SqlParseError("Unable to parse: " + sql);
  }
  this.action_ = pre_from_parts[1].toUpperCase();
  if(this.action_ == "SELECT") {
    this.mode_ = ydn.db.base.TransactionMode.READ_ONLY
  }else {
    if(this.action_ == "INSERT") {
      this.mode_ = ydn.db.base.TransactionMode.READ_WRITE
    }else {
      if(this.action_ == "UPDATE") {
        this.mode_ = ydn.db.base.TransactionMode.READ_WRITE
      }else {
        if(this.action_ == "DELETE") {
          this.mode_ = ydn.db.base.TransactionMode.READ_WRITE
        }else {
          throw new ydn.db.SqlParseError("Unknown SQL verb: " + this.action_);
        }
      }
    }
  }
  var selList = pre_from_parts[2].trim();
  var agg = selList.match(/^(MIN|MAX|COUNT|AVG|SUM)/i);
  if(agg) {
    this.aggregate_ = agg[0].toUpperCase();
    selList = selList.replace(/^(MIN|MAX|COUNT|AVG|SUM)/i, "").trim()
  }else {
    this.aggregate_ = undefined
  }
  if(selList.charAt(0) == "(") {
    if(selList.charAt(selList.length - 1) == ")") {
      selList = selList.substring(1, selList.length - 1)
    }else {
      new ydn.db.SqlParseError("missing closing parentheses")
    }
  }
  this.selList_ = selList;
  var mod_idx = post_from.search(/(ORDER BY|LIMIT|OFFSET)/i);
  if(mod_idx > 0) {
    this.modifier_ = post_from.substring(mod_idx);
    post_from = post_from.substring(0, mod_idx)
  }else {
    this.modifier_ = ""
  }
  var where_idx = post_from.search(/WHERE/i);
  if(where_idx > 0) {
    this.condition_ = post_from.substring(where_idx + 6).trim();
    post_from = post_from.substring(0, where_idx)
  }else {
    this.condition_ = ""
  }
  var stores = post_from.trim().split(",");
  this.store_names_ = stores.map(function(x) {
    x = goog.string.stripQuotes(x, '"');
    x = goog.string.stripQuotes(x, "'");
    return x.trim()
  })
};
ydn.db.Sql.prototype.parse = function(params) {
  if(params) {
    for(var i = 0;i < params.length;i++) {
      this.sql_ = this.sql_.replace("?", params[i])
    }
    this.parseBasic_(this.sql_)
  }
  this.wheres_ = this.parseConditions();
  if(!this.wheres_) {
    return this.last_error_
  }
  var start_idx = this.modifier_.length;
  var offset_result = /OFFSET\s+(\d+)/i.exec(this.modifier_);
  if(offset_result) {
    this.offset_ = parseInt(offset_result[1], 10);
    start_idx = this.modifier_.search(/OFFSET/i)
  }
  var limit_result = /LIMIT\s+(\d+)/i.exec(this.modifier_);
  if(limit_result) {
    this.limit_ = parseInt(limit_result[1], 10);
    var idx = this.modifier_.search(/LIMIT/i);
    if(idx < start_idx) {
      start_idx = idx
    }
  }
  var order_str = this.modifier_.substr(0, start_idx);
  var order_result = /ORDER BY\s+(.+)/i.exec(order_str);
  if(order_result) {
    var order = order_result[1].trim();
    var asc_desc = order.match(/(ASC|DESC)/i);
    if(asc_desc) {
      this.reverse_ = asc_desc[0].toUpperCase() == "DESC";
      order = order.replace(/\s+(ASC|DESC)/i, "")
    }else {
      this.reverse_ = false
    }
    this.order_ = goog.string.stripQuotes(goog.string.stripQuotes(order, '"'), "'");
    goog.asserts.assert(this.order_.length > 0, "Invalid order by field")
  }else {
    this.order_ = undefined
  }
  this.has_parsed_ = true;
  return""
};
ydn.db.Sql.prototype.getSelList = function() {
  if(this.selList_ == "*") {
    return null
  }else {
    var fields = this.selList_.split(",");
    fields = fields.map(function(s) {
      return goog.string.stripQuotes(s.trim(), '"')
    });
    return fields
  }
};
ydn.db.Sql.prototype.getSql = function() {
  return this.sql_
};
ydn.db.Sql.prototype.toJSON = function() {
  return{"sql":this.sql_}
};
ydn.db.Sql.prototype.getStoreNames = function() {
  return goog.array.clone(this.store_names_)
};
ydn.db.Sql.prototype.getMode = function() {
  return this.mode_
};
ydn.db.Sql.prototype.getLimit = function() {
  return this.limit_
};
ydn.db.Sql.prototype.getOffset = function() {
  return this.offset_
};
ydn.db.Sql.prototype.getOrderBy = function() {
  return this.order_
};
ydn.db.Sql.prototype.isReversed = function() {
  return this.reverse_
};
ydn.db.Sql.prototype.getConditions = function() {
  return this.wheres_
};
ydn.db.Sql.prototype.parseConditions = function() {
  var wheres = [];
  var re_op = /(.+?)(<=|>=|=|>|<)(.+)/i;
  var findIndex = function(field) {
    return goog.array.findIndex(wheres, function(w) {
      return w.getField() == field
    })
  };
  if(this.condition_.length > 0) {
    var conds = this.condition_.split("AND");
    for(var i = 0;i < conds.length;i++) {
      var cond = conds[i];
      var result = re_op.exec(cond);
      if(result) {
        var field = result[1].trim();
        field = goog.string.stripQuotes(field, '"');
        field = goog.string.stripQuotes(field, "'");
        if(field.length > 0) {
          var value = result[3].trim();
          if(goog.string.startsWith(value, '"')) {
            value = goog.string.stripQuotes(value, '"')
          }else {
            if(goog.string.startsWith(value, "'")) {
              value = goog.string.stripQuotes(value, "'")
            }else {
              value = parseFloat(value)
            }
          }
          var op = result[2];
          var where = new ydn.db.Where(field, op, value);
          var ex_idx = findIndex(field);
          if(ex_idx >= 0) {
            wheres[ex_idx] = wheres[ex_idx].and(where);
            if(!wheres[ex_idx]) {
              this.last_error_ = 'where clause "' + cond + '" conflict';
              return null
            }
          }else {
            wheres.push(where)
          }
        }else {
          this.last_error_ = 'Invalid clause "' + cond + '"';
          return null
        }
      }else {
        this.last_error_ = 'Invalid clause "' + cond + '"';
        return null
      }
    }
  }
  return wheres
};
ydn.db.Sql.prototype.getAction = function() {
  return this.action_
};
ydn.db.Sql.prototype.toString = function() {
  if(goog.DEBUG) {
    return"query:" + this.sql_
  }else {
    return goog.base(this, "toString")
  }
};
ydn.db.Sql.prototype.getAggregate = function() {
  return this.aggregate_
};
goog.provide("ydn.db.sql.req.IRequestExecutor");
goog.require("ydn.db.crud.req.IRequestExecutor");
goog.require("ydn.db.Streamer");
goog.require("ydn.db.Sql");
ydn.db.sql.req.IRequestExecutor = function() {
};
ydn.db.sql.req.IRequestExecutor.prototype.executeSql = goog.abstractMethod;
goog.provide("ydn.db.sql.IStorage");
goog.require("ydn.db.sql.req.IRequestExecutor");
goog.require("ydn.db.core.IOperator");
ydn.db.sql.IStorage = function() {
};
goog.provide("ydn.db.sql.req.nosql.Node");
goog.require("ydn.db.Iterator");
goog.require("ydn.db.KeyRange");
goog.require("ydn.db.Sql");
goog.require("ydn.error.ArgumentException");
ydn.db.sql.req.nosql.Node = function(schema, sql) {
  this.sql = sql;
  this.store_schema = schema
};
ydn.db.sql.req.nosql.Node.prototype.logger = goog.debug.Logger.getLogger("ydn.db.sql.req.nosql.Node");
ydn.db.sql.req.nosql.Node.prototype.store_schema;
ydn.db.sql.req.nosql.Node.prototype.sql;
ydn.db.sql.req.nosql.Node.prototype.toJSON = function() {
  return{"sql":this.sql}
};
ydn.db.sql.req.nosql.Node.prototype.toString = function() {
  return"idb.Node:"
};
ydn.db.sql.req.nosql.Node.prototype.execute = function(tx, tx_no, df, req) {
  var me = this;
  var out = [];
  var store_name = this.sql.getStoreNames()[0];
  var wheres = this.sql.getConditions();
  var limit = this.sql.getLimit();
  limit = isNaN(limit) ? ydn.db.base.DEFAULT_RESULT_LIMIT : limit;
  var offset = this.sql.getOffset();
  offset = isNaN(offset) ? 0 : offset;
  var order = this.sql.getOrderBy();
  var sel_fields = this.sql.getSelList();
  var key_range = null;
  var reverse = this.sql.isReversed();
  if(wheres.length == 0) {
    key_range = null
  }else {
    if(wheres.length == 1) {
      key_range = ydn.db.KeyRange.parseIDBKeyRange(wheres[0].getKeyRange())
    }else {
      throw new ydn.debug.error.NotSupportedException("too many conditions.");
    }
  }
  var ndf = df;
  if(!goog.isNull(sel_fields)) {
    ndf = function(records, is_error) {
      if(is_error) {
        df(records, true)
      }else {
        var out = records.map(function(record) {
          var n = sel_fields.length;
          if(n == 1) {
            return ydn.db.utils.getValueByKeys(record, sel_fields[0])
          }else {
            var obj = {};
            for(var i = 0;i < n;i++) {
              obj[sel_fields[i]] = ydn.db.utils.getValueByKeys(record, sel_fields[i])
            }
            return obj
          }
        });
        df(out)
      }
    }
  }
  var index_name = wheres.length > 0 ? wheres[0].getField() : undefined;
  var msg = tx_no + " executing on" + store_name;
  if(index_name) {
    msg += ":" + index_name
  }
  msg += " " + ydn.db.KeyRange.toString(key_range);
  this.logger.finer(msg);
  if(order && order != this.store_schema.getKeyPath()) {
    req.listByIndexKeyRange(tx, tx_no, ndf, store_name, order, key_range, reverse, limit, offset, false)
  }else {
    if(goog.isDef(index_name) && index_name != this.store_schema.getKeyPath()) {
      req.listByIndexKeyRange(tx, tx_no, ndf, store_name, index_name, key_range, reverse, limit, offset, false)
    }else {
      req.listByKeyRange(tx, tx_no, ndf, store_name, key_range, reverse, limit, offset)
    }
  }
};
goog.provide("ydn.db.sql.req.nosql.ReduceNode");
goog.require("ydn.db.sql.req.nosql.Node");
goog.require("ydn.object");
ydn.db.sql.req.nosql.ReduceNode = function(schema, sql) {
  goog.base(this, schema, sql)
};
goog.inherits(ydn.db.sql.req.nosql.ReduceNode, ydn.db.sql.req.nosql.Node);
ydn.db.sql.req.nosql.ReduceNode.prototype.execute = function(tx, tx_no, df, req) {
  var me = this;
  var out;
  var store_name = this.sql.getStoreNames()[0];
  var wheres = this.sql.getConditions();
  var key_range = null;
  var reverse = this.sql.isReversed();
  if(wheres.length == 0) {
    key_range = null
  }else {
    if(wheres.length == 1) {
      key_range = ydn.db.KeyRange.parseIDBKeyRange(wheres[0].getKeyRange())
    }else {
      throw new ydn.debug.error.NotSupportedException("too many conditions.");
    }
  }
  var aggregate = this.sql.getAggregate();
  var index_name = wheres.length > 0 ? wheres[0].getField() : undefined;
  var msg = tx_no + " executing " + aggregate + " on " + store_name;
  if(index_name) {
    msg += ":" + index_name
  }
  msg += " " + ydn.db.KeyRange.toString(key_range);
  this.logger.finer(msg);
  if(aggregate == "COUNT") {
    if(key_range) {
      req.countKeyRange(tx, tx_no, df, store_name, key_range, index_name, false)
    }else {
      req.countKeyRange(tx, tx_no, df, store_name, null, undefined, false)
    }
  }else {
    var reduce;
    var fields = this.sql.getSelList();
    if(!fields || fields.length == 0) {
      throw new ydn.error.InvalidOperationError("field name require for reduce operation: " + aggregate);
    }
    var field_name = fields[0];
    if(aggregate == "MIN") {
      reduce = ydn.db.sql.req.nosql.ReduceNode.reduceMin(field_name)
    }else {
      if(aggregate == "MAX") {
        reduce = ydn.db.sql.req.nosql.ReduceNode.reduceMax(field_name)
      }else {
        if(aggregate == "AVG") {
          out = 0;
          reduce = ydn.db.sql.req.nosql.ReduceNode.reduceAverage(field_name)
        }else {
          if(aggregate == "SUM") {
            out = 0;
            reduce = ydn.db.sql.req.nosql.ReduceNode.reduceSum(field_name)
          }else {
            throw new ydn.error.NotSupportedException(aggregate);
          }
        }
      }
    }
    var iter;
    if(goog.isDef(index_name)) {
      iter = new ydn.db.IndexValueCursors(store_name, index_name, key_range)
    }else {
      iter = new ydn.db.ValueCursors(store_name, key_range)
    }
    var cursor = iter.iterate(tx, tx_no, req);
    cursor.onFail = function(e) {
      df(e, true)
    };
    var i = 0;
    cursor.onNext = function(opt_key) {
      if(goog.isDefAndNotNull(opt_key)) {
        var value = iter.isKeyIterator() ? cursor.getPrimaryKey() : cursor.getValue();
        out = reduce(value, out, i);
        cursor.advance(1);
        i++
      }else {
        df(out)
      }
    }
  }
};
ydn.db.sql.req.nosql.ReduceNode.reduceAverage = function(field) {
  return function(curr, prev, i) {
    if(!goog.isDef(prev)) {
      prev = 0
    }
    return(prev * i + curr[field]) / (i + 1)
  }
};
ydn.db.sql.req.nosql.ReduceNode.reduceSum = function(field) {
  return function(curr, prev, i) {
    return prev + curr[field]
  }
};
ydn.db.sql.req.nosql.ReduceNode.reduceMin = function(field) {
  return function(curr, prev, i) {
    var x = curr[field];
    if(!goog.isDef(prev)) {
      return x
    }
    return prev < x ? prev : x
  }
};
ydn.db.sql.req.nosql.ReduceNode.reduceMax = function(field) {
  return function(curr, prev, i) {
    var x = curr[field];
    if(!goog.isDef(prev)) {
      return x
    }
    return prev > x ? prev : x
  }
};
goog.provide("ydn.db.sql.req.IndexedDb");
goog.require("ydn.db.core.req.IndexedDb");
goog.require("ydn.db.sql.req.IRequestExecutor");
goog.require("ydn.db.sql.req.nosql.Node");
goog.require("ydn.db.sql.req.nosql.ReduceNode");
ydn.db.sql.req.IndexedDb = function(dbname, schema) {
  goog.base(this, dbname, schema)
};
goog.inherits(ydn.db.sql.req.IndexedDb, ydn.db.core.req.IndexedDb);
ydn.db.sql.req.IndexedDb.DEBUG = false;
ydn.db.sql.req.IndexedDb.prototype.logger = goog.debug.Logger.getLogger("ydn.db.sql.req.IndexedDb");
ydn.db.sql.req.IndexedDb.prototype.executeSql = function(tx, tx_no, df, sql, params) {
  var msg = sql.parse(params);
  if(msg) {
    throw new ydn.db.SqlParseError(msg);
  }
  var store_names = sql.getStoreNames();
  if(store_names.length == 1) {
    var store_schema = this.schema.getStore(store_names[0]);
    if(!store_schema) {
      throw new ydn.db.NotFoundError(store_names[0]);
    }
    var fields = sql.getSelList();
    if(fields) {
      for(var i = 0;i < fields.length;i++) {
        if(!store_schema.hasIndex(fields[i])) {
          throw new ydn.db.NotFoundError('Index "' + fields[i] + '" not found in ' + store_names[0]);
        }
      }
    }
    var node;
    if(sql.getAggregate()) {
      node = new ydn.db.sql.req.nosql.ReduceNode(store_schema, sql)
    }else {
      node = new ydn.db.sql.req.nosql.Node(store_schema, sql)
    }
    node.execute(tx, tx_no, df, this)
  }else {
    throw new ydn.error.NotSupportedException(sql.getSql());
  }
};
goog.provide("ydn.db.sql.req.SqlQuery");
goog.require("ydn.db.sql.req.IterableQuery");
goog.require("goog.functions");
goog.require("ydn.db.KeyRange");
goog.require("ydn.db.Where");
goog.require("ydn.error.ArgumentException");
ydn.db.sql.req.SqlQuery = function(store, index, keyRange, reverse, unique, key_only, filter, continued) {
  goog.base(this, store, index, keyRange, reverse, unique, key_only, filter, continued);
  this.parseRow = ydn.db.sql.req.SqlQuery.prototype.parseRow;
  this.sql = "";
  this.params = []
};
goog.inherits(ydn.db.sql.req.SqlQuery, ydn.db.sql.req.IterableQuery);
ydn.db.sql.req.SqlQuery.prototype.toJSON = function() {
  var obj = goog.base(this, "toJSON");
  obj["sql"] = this.sql;
  obj["params"] = ydn.object.clone(this.params);
  return obj
};
ydn.db.sql.req.SqlQuery.prototype.sql = "";
ydn.db.sql.req.SqlQuery.prototype.params = [];
ydn.db.sql.req.SqlQuery.prototype.toString = function() {
  var idx = goog.isDef(this.getIndexName()) ? ":" + this.getIndexName() : "";
  return"Cursor:" + this.getStoreName() + idx
};
ydn.db.sql.req.SqlQuery.prototype.parseRow = function(row, store) {
  return ydn.db.crud.req.WebSql.parseRow(row, store)
};
ydn.db.sql.req.SqlQuery.parseRowIdentity = function(row, store) {
  return row
};
goog.provide("ydn.db.sql.req.websql.Node");
goog.require("ydn.db.Sql");
goog.require("ydn.db.schema.Store");
ydn.db.sql.req.websql.Node = function(schema, sql) {
  this.sql = sql;
  this.store_schema_ = schema;
  this.sel_fields_ = sql.getSelList()
};
ydn.db.sql.req.websql.Node.prototype.logger = goog.debug.Logger.getLogger("ydn.db.sql.req.websql.Node");
ydn.db.sql.req.websql.Node.prototype.store_schema_;
ydn.db.sql.req.websql.Node.prototype.sql;
ydn.db.sql.req.websql.Node.prototype.sel_fields_;
ydn.db.sql.req.websql.Node.prototype.toJSON = function() {
  return{"sql":this.sql.getSql()}
};
ydn.db.sql.req.websql.Node.prototype.toString = function() {
  return"websql.Node:"
};
ydn.db.sql.req.websql.Node.prototype.parseRow = function(row) {
  if(!this.sel_fields_) {
    return ydn.db.crud.req.WebSql.parseRow(row, this.store_schema_)
  }else {
    if(this.sel_fields_.length == 1) {
      if(goog.isObject(row)) {
        return goog.object.getValueByKeys(row, this.sel_fields_[0])
      }else {
        return undefined
      }
    }else {
      var obj = {};
      for(var i = 0;i < this.sel_fields_.length;i++) {
        obj[this.sel_fields_[i]] = goog.object.getValueByKeys(row, this.sel_fields_[i])
      }
      return obj
    }
  }
};
ydn.db.sql.req.websql.Node.prototype.execute = function(df, tx, params) {
  var sql_stm = this.sql.getSql();
  var me = this;
  var out = [];
  var callback = function(transaction, results) {
    var n = results.rows.length;
    for(var i = 0;i < n;i++) {
      var row = results.rows.item(i);
      if(goog.isObject(row)) {
        var value = me.parseRow(row);
        out.push(value)
      }else {
        out.push(value)
      }
    }
    df(out)
  };
  var error_callback = function(tr, error) {
    if(ydn.db.sql.req.WebSql.DEBUG) {
      window.console.log([sql_stm, tr, error])
    }
    me.logger.warning("Sqlite error: " + error.message);
    df(error, true);
    return true
  };
  if(ydn.db.sql.req.WebSql.DEBUG) {
    window.console.log(this + " open SQL: " + sql_stm + " PARAMS:" + ydn.json.stringify(params))
  }
  tx.executeSql(sql_stm, params, callback, error_callback)
};
goog.provide("ydn.db.sql.req.websql.ReduceNode");
goog.require("ydn.db.sql.req.websql.Node");
goog.require("ydn.object");
ydn.db.sql.req.websql.ReduceNode = function(schema, sql) {
  goog.base(this, schema, sql)
};
goog.inherits(ydn.db.sql.req.websql.ReduceNode, ydn.db.sql.req.websql.Node);
ydn.db.sql.req.websql.ReduceNode.prototype.execute = function(df, tx, params) {
  var sql_stm = this.sql.getSql();
  var me = this;
  var out = [];
  var callback = function(transaction, results) {
    var n = results.rows.length;
    if(n == 1) {
      var value = ydn.object.takeFirst(results.rows.item(0));
      df(value)
    }else {
      if(n == 0) {
        df(undefined)
      }else {
        throw new ydn.db.InternalError;
      }
    }
  };
  var error_callback = function(tr, error) {
    if(ydn.db.sql.req.WebSql.DEBUG) {
      window.console.log([sql_stm, tr, error])
    }
    me.logger.warning("Sqlite error: " + error.message);
    df(error, true);
    return true
  };
  if(ydn.db.sql.req.WebSql.DEBUG) {
    window.console.log(this + " open SQL: " + sql_stm + " PARAMS:" + ydn.json.stringify(params))
  }
  tx.executeSql(sql_stm, params, callback, error_callback)
};
goog.provide("ydn.db.sql.req.WebSql");
goog.require("ydn.db.core.req.WebSql");
goog.require("ydn.db.sql.req.SqlQuery");
goog.require("ydn.db.sql.req.IRequestExecutor");
goog.require("ydn.db.sql.req.websql.Node");
goog.require("ydn.db.sql.req.websql.ReduceNode");
ydn.db.sql.req.WebSql = function(dbname, schema) {
  goog.base(this, dbname, schema)
};
goog.inherits(ydn.db.sql.req.WebSql, ydn.db.core.req.WebSql);
ydn.db.sql.req.WebSql.DEBUG = false;
ydn.db.sql.req.WebSql.prototype.logger = goog.debug.Logger.getLogger("ydn.db.sql.req.WebSql");
ydn.db.sql.req.WebSql.prototype.executeSql = function(tx, tx_no, df, sql, params) {
  var store_names = sql.getStoreNames();
  if(store_names.length == 1) {
    var store_schema = this.schema.getStore(store_names[0]);
    if(!store_schema) {
      throw new ydn.db.NotFoundError(store_names[0]);
    }
    var fields = sql.getSelList();
    if(fields) {
      for(var i = 0;i < fields.length;i++) {
        if(!store_schema.hasIndex(fields[i])) {
          throw new ydn.db.NotFoundError('Index "' + fields[i] + '" not found in ' + store_names[0]);
        }
      }
    }
    var node;
    if(sql.getAggregate()) {
      node = new ydn.db.sql.req.websql.ReduceNode(store_schema, sql)
    }else {
      node = new ydn.db.sql.req.websql.Node(store_schema, sql)
    }
    node.execute(df, (tx), params)
  }else {
    throw new ydn.error.NotSupportedException(sql.getSql());
  }
};
ydn.db.sql.req.WebSql.prototype.planQuery = function(query) {
  var store = this.schema.getStore(query.getStoreName());
  if(!store) {
    throw new ydn.db.SqlParseError("TABLE: " + query.getStoreName() + " not found.");
  }
  var key_range = query.getKeyRange();
  var sql = new ydn.db.sql.req.SqlQuery(query.getStoreName(), query.getIndexName(), key_range, query.isReversed(), query.isUnique(), query.isKeyIterator());
  var select = "SELECT";
  var idx_name = sql.getIndexName();
  var index = goog.isDef(idx_name) ? store.getIndex(idx_name) : null;
  var key_column = index ? index.getKeyPath() : goog.isDefAndNotNull(store.keyPath) ? store.keyPath : ydn.db.base.SQLITE_SPECIAL_COLUNM_NAME;
  goog.asserts.assertString(key_column);
  var column = goog.string.quote(key_column);
  var fields = query.isKeyIterator() ? column : "*";
  var from = fields + " FROM " + store.getQuotedName();
  var where_clause = "";
  if(key_range) {
    if(ydn.db.Where.resolvedStartsWith(key_range)) {
      where_clause = column + " LIKE ?";
      sql.params.push(key_range["lower"] + "%")
    }else {
      if(goog.isDefAndNotNull(key_range.lower)) {
        var lowerOp = key_range["lowerOpen"] ? " > " : " >= ";
        where_clause += " " + column + lowerOp + "?";
        sql.params.push(key_range.lower)
      }
      if(goog.isDefAndNotNull(key_range["upper"])) {
        var upperOp = key_range["upperOpen"] ? " < " : " <= ";
        var and = where_clause.length > 0 ? " AND " : " ";
        where_clause += and + column + upperOp + "?";
        sql.params.push(key_range.upper)
      }
    }
    where_clause = " WHERE " + "(" + where_clause + ")"
  }
  var dir = "ASC";
  if(query.isReversed()) {
    dir = "DESC"
  }
  var order = "ORDER BY " + column;
  sql.sql = [select, from, where_clause, order, dir].join(" ");
  return sql
};
goog.provide("ydn.db.sql.req.SimpleStore");
goog.require("ydn.db.core.req.SimpleStore");
goog.require("ydn.db.sql.req.IRequestExecutor");
goog.require("ydn.db.sql.req.nosql.Node");
goog.require("ydn.db.sql.req.nosql.ReduceNode");
ydn.db.sql.req.SimpleStore = function(dbname, schema) {
  goog.base(this, dbname, schema)
};
goog.inherits(ydn.db.sql.req.SimpleStore, ydn.db.core.req.SimpleStore);
ydn.db.sql.req.SimpleStore.DEBUG = false;
ydn.db.sql.req.SimpleStore.prototype.logger = goog.debug.Logger.getLogger("ydn.db.sql.req.SimpleStore");
ydn.db.sql.req.SimpleStore.prototype.executeSql = function(tx, tx_no, df, sql, params) {
  var msg = sql.parse(params);
  if(msg) {
    throw new ydn.db.SqlParseError(msg);
  }
  var store_names = sql.getStoreNames();
  if(store_names.length == 1) {
    var store_schema = this.schema.getStore(store_names[0]);
    if(!store_schema) {
      throw new ydn.db.NotFoundError(store_names[0]);
    }
    var fields = sql.getSelList();
    if(fields) {
      for(var i = 0;i < fields.length;i++) {
        if(!store_schema.hasIndex(fields[i])) {
          throw new ydn.debug.error.ArgumentException('Index "' + fields[i] + '" not found in ' + store_names[0]);
        }
      }
    }
    var node;
    if(sql.getAggregate()) {
      node = new ydn.db.sql.req.nosql.ReduceNode(store_schema, sql)
    }else {
      node = new ydn.db.sql.req.nosql.Node(store_schema, sql)
    }
    node.execute(tx, tx_no, df, this)
  }else {
    throw new ydn.debug.error.NotSupportedException(sql.getSql());
  }
};
goog.provide("ydn.db.sql.DbOperator");
goog.require("ydn.db.Iterator");
goog.require("ydn.db.core.DbOperator");
goog.require("ydn.db.sql.IStorage");
goog.require("ydn.db.sql.req.IRequestExecutor");
goog.require("ydn.db.sql.req.IndexedDb");
goog.require("ydn.db.sql.req.WebSql");
goog.require("ydn.db.sql.req.SimpleStore");
goog.require("ydn.debug.error.ArgumentException");
ydn.db.sql.DbOperator = function(storage, schema, thread, sync_thread) {
  goog.base(this, storage, schema, thread, sync_thread)
};
goog.inherits(ydn.db.sql.DbOperator, ydn.db.core.DbOperator);
ydn.db.sql.DbOperator.prototype.executeSql = function(sql, opt_params) {
  var df = ydn.db.base.createDeferred();
  var query = new ydn.db.Sql(sql);
  var stores = query.getStoreNames();
  for(var i = 0;i < stores.length;i++) {
    var store = this.schema.getStore(stores[i]);
    if(!store) {
      throw new ydn.debug.error.ArgumentException("store: " + store + " not exists.");
    }
  }
  var me = this;
  this.logger.finer("executeSql: " + sql + " params: " + opt_params);
  this.tx_thread.exec(df, function(tx, tx_no, cb) {
    me.getExecutor().executeSql(tx, tx_no, cb, query, opt_params || [])
  }, query.getStoreNames(), query.getMode());
  return df
};
goog.provide("ydn.db.sql.Storage");
goog.require("ydn.db.core.Storage");
goog.require("ydn.db.sql.DbOperator");
ydn.db.sql.Storage = function(opt_dbname, opt_schema, opt_options) {
  goog.base(this, opt_dbname, opt_schema, opt_options)
};
goog.inherits(ydn.db.sql.Storage, ydn.db.core.Storage);
ydn.db.sql.Storage.prototype.newExecutor = function() {
  var type = this.getType();
  if(type == ydn.db.base.Mechanisms.IDB) {
    return new ydn.db.sql.req.IndexedDb(this.db_name, this.schema)
  }else {
    if(type == ydn.db.base.Mechanisms.WEBSQL) {
      return new ydn.db.sql.req.WebSql(this.db_name, this.schema)
    }else {
      if(type == ydn.db.base.Mechanisms.MEMORY_STORAGE || type == ydn.db.base.Mechanisms.LOCAL_STORAGE || type == ydn.db.base.Mechanisms.USER_DATA || type == ydn.db.base.Mechanisms.SESSION_STORAGE) {
        return new ydn.db.sql.req.SimpleStore(this.db_name, this.schema)
      }else {
        throw new ydn.db.InternalError("No executor for " + type);
      }
    }
  }
};
ydn.db.sql.Storage.prototype.newOperator = function(tx_thread, sync_thread) {
  return new ydn.db.sql.DbOperator(this, this.schema, tx_thread, sync_thread)
};
ydn.db.sql.Storage.prototype.getSqlOperator = function() {
  return(this.db_operator)
};
ydn.db.sql.Storage.prototype.executeSql = function(sql, opt_params) {
  return this.getSqlOperator().executeSql(sql, opt_params)
};
goog.provide("ydn.db.Storage");
goog.require("ydn.db.sql.Storage");
ydn.db.Storage = function(opt_dbname, opt_schema, opt_options) {
  goog.base(this, opt_dbname, opt_schema, opt_options)
};
goog.inherits(ydn.db.Storage, ydn.db.sql.Storage);
goog.provide("ydn.db.algo.NestedLoop");
goog.require("ydn.db.algo.AbstractSolver");
ydn.db.algo.NestedLoop = function(out, opt_limit) {
  goog.base(this, out, opt_limit)
};
goog.inherits(ydn.db.algo.NestedLoop, ydn.db.algo.AbstractSolver);
ydn.db.algo.NestedLoop.DEBUG = false;
ydn.db.algo.NestedLoop.prototype.current_loop = -1;
ydn.db.algo.NestedLoop.prototype.begin = function(iterators, callback) {
  this.current_loop = iterators.length - 1;
  return false
};
ydn.db.algo.NestedLoop.prototype.solver = function(keys, values) {
  var advancement = [];
  var all_restarting = true;
  var next = function(idx) {
    if(!goog.isDef(keys[idx])) {
      advancement[idx] = false;
      if(idx - 1 >= 0) {
        next(idx - 1)
      }
    }else {
      all_restarting = false;
      advancement[idx] = true
    }
  };
  next(keys.length - 1);
  if(ydn.db.algo.NestedLoop.DEBUG) {
    window.console.log([keys, values, advancement])
  }
  if(all_restarting) {
    advancement = []
  }
  return this.pusher(advancement, keys, values)
};
goog.provide("ydn.db.algo.ZigzagMerge");
goog.require("ydn.db");
ydn.db.algo.ZigzagMerge = function(out, opt_limit) {
  goog.base(this, out, opt_limit);
  this.is_duplex_output_ = out instanceof ydn.db.Streamer && !!out.getFieldName()
};
goog.inherits(ydn.db.algo.ZigzagMerge, ydn.db.algo.AbstractSolver);
ydn.db.algo.ZigzagMerge.DEBUG = false;
ydn.db.algo.ZigzagMerge.prototype.logger = goog.debug.Logger.getLogger("ydn.db.algo.ZigzagMerge");
ydn.db.algo.ZigzagMerge.prototype.is_duplex_output_ = false;
ydn.db.algo.ZigzagMerge.prototype.begin = function(iterators, callback) {
  var result = goog.base(this, "begin", iterators, callback);
  if(this.is_duplex_output_) {
    var iter_index = iterators[0].getIndexName().split(", ");
    if(iter_index.length > 1) {
      if(iter_index[iter_index.length - 1] != this.out.getFieldName()) {
        throw new ydn.error.InvalidOperationError("Output streamer " + "projection field must be same as postfix field in the iterator");
      }
    }else {
      if(goog.DEBUG) {
        this.logger.warning("Unable to check correctness of output streamer.")
      }
    }
  }
  return result
};
ydn.db.algo.ZigzagMerge.prototype.solver = function(keys, values) {
  var advancement = [];
  if(keys.length == 0 || !goog.isDefAndNotNull(keys[0])) {
    return[]
  }
  var postfix = function(x) {
    return x[x.length - 1]
  };
  var prefix = function(x) {
    return x.slice(0, x.length - 1)
  };
  var makeKey = function(key, post_fix) {
    var new_key = prefix(key);
    new_key.push(post_fix);
    return new_key
  };
  if(!goog.isDefAndNotNull(keys[0])) {
    if(ydn.db.algo.SortedMerge.DEBUG) {
      window.console.log("SortedMerge: done.")
    }
    return[]
  }
  var all_match = true;
  goog.asserts.assertArray(keys[0]);
  var highest_idx = 0;
  var highest_postfix = postfix(keys[highest_idx]);
  var cmps = [];
  for(var i = 1;i < keys.length;i++) {
    if(goog.isDefAndNotNull(keys[i])) {
      var postfix_part = postfix(keys[i]);
      var cmp = ydn.db.cmp(highest_postfix, postfix_part);
      cmps[i] = cmp;
      if(cmp === 1) {
        all_match = false
      }else {
        if(cmp === -1) {
          all_match = false;
          highest_postfix = postfix_part;
          highest_idx = 1
        }
      }
    }else {
      if(ydn.db.algo.ZigzagMerge.DEBUG) {
        window.console.log(this + ": iterator " + i + " reach the end")
      }
      return[]
    }
  }
  if(ydn.db.algo.ZigzagMerge.DEBUG) {
    window.console.log("ZigzagMerge: match: " + all_match + ", highest_key: " + JSON.stringify((highest_postfix)) + ", keys: " + JSON.stringify(keys) + ", cmps: " + JSON.stringify(cmps) + ", advancement: " + JSON.stringify(advancement))
  }
  if(all_match) {
    for(var j = 0;j < keys.length;j++) {
      if(goog.isDefAndNotNull(keys[j])) {
        advancement[j] = true
      }
    }
    if(this.out) {
      if(this.is_duplex_output_) {
        this.out.push(values[0], highest_postfix)
      }else {
        this.out.push(values[0])
      }
    }
    return advancement
  }else {
    if(highest_idx == 0) {
      for(var j = 1;j < keys.length;j++) {
        if(cmps[j] === 1) {
          advancement[j] = makeKey(keys[j], highest_postfix)
        }
      }
    }else {
      for(var j = 0;j < keys.length;j++) {
        if(j == highest_idx) {
          continue
        }
        if(goog.isDefAndNotNull(keys[j])) {
          goog.asserts.assertArray(keys[j]);
          if(ydn.db.cmp(highest_postfix, postfix(keys[j])) === 1) {
            advancement[j] = makeKey(keys[j], highest_postfix)
          }
        }
      }
    }
  }
  return{"continue":advancement}
};
goog.provide("ydn.db.algo.SortedMerge");
goog.require("ydn.db");
goog.require("ydn.db.algo.AbstractSolver");
ydn.db.algo.SortedMerge = function(out, opt_limit) {
  goog.base(this, out, opt_limit)
};
goog.inherits(ydn.db.algo.SortedMerge, ydn.db.algo.AbstractSolver);
ydn.db.algo.SortedMerge.DEBUG = false;
ydn.db.algo.SortedMerge.prototype.begin = function(iterators, callback) {
  return false
};
ydn.db.algo.SortedMerge.prototype.solver = function(keys, values) {
  var advancement = [];
  var base_key = values[0];
  if(!goog.isDefAndNotNull(base_key)) {
    if(ydn.db.algo.SortedMerge.DEBUG) {
      window.console.log("SortedMerge: done.")
    }
    return[]
  }
  var all_match = true;
  var skip = false;
  var highest_key = base_key;
  var cmps = [];
  for(var i = 1;i < keys.length;i++) {
    if(goog.isDefAndNotNull(values[i])) {
      var cmp = ydn.db.cmp(base_key, values[i]);
      cmps[i] = cmp;
      if(cmp === 1) {
        all_match = false
      }else {
        if(cmp === -1) {
          all_match = false;
          skip = true;
          if(ydn.db.cmp(values[i], highest_key) === 1) {
            highest_key = values[i]
          }
        }
      }
    }else {
      all_match = false;
      skip = true
    }
  }
  if(all_match) {
    for(var j = 0;j < keys.length;j++) {
      if(goog.isDefAndNotNull(values[j])) {
        advancement[j] = true
      }
    }
  }else {
    if(skip) {
      for(var j = 0;j < keys.length;j++) {
        if(goog.isDefAndNotNull(values[j])) {
          if(ydn.db.cmp(highest_key, values[j]) === 1) {
            advancement[j] = highest_key
          }
        }
      }
    }else {
      for(var j = 1;j < keys.length;j++) {
        if(cmps[j] === 1) {
          advancement[j] = base_key
        }
      }
    }
  }
  if(ydn.db.algo.SortedMerge.DEBUG) {
    window.console.log("SortedMerge: match: " + all_match + ", skip: " + skip + ", highest_key: " + JSON.stringify(highest_key) + ", keys: " + JSON.stringify(keys) + ", cmps: " + JSON.stringify(cmps) + ", advancement: " + JSON.stringify(advancement))
  }
  if(all_match) {
    this.match_count++;
    if(this.out) {
      this.out.push(highest_key)
    }
    return advancement
  }else {
    return{"continuePrimary":advancement}
  }
};
goog.require("ydn.db.Storage");
goog.require("ydn.db.algo.NestedLoop");
goog.require("ydn.db.algo.ZigzagMerge");
goog.require("ydn.db.algo.SortedMerge");
goog.exportSymbol("ydn.db.Storage", ydn.db.Storage);
goog.exportSymbol("ydn.db.algo.NestedLoop", ydn.db.algo.NestedLoop);
goog.exportSymbol("ydn.db.algo.ZigzagMerge", ydn.db.algo.ZigzagMerge);
goog.exportSymbol("ydn.db.algo.SortedMerge", ydn.db.algo.SortedMerge);
goog.addDependency("../../third_party/closure/goog/caja/string/html/htmlparser.js", ["goog.string.html.HtmlParser", "goog.string.html.HtmlParser.EFlags", "goog.string.html.HtmlParser.Elements", "goog.string.html.HtmlParser.Entities", "goog.string.html.HtmlSaxHandler"], []);
goog.addDependency("../../third_party/closure/goog/caja/string/html/htmlsanitizer.js", ["goog.string.html.HtmlSanitizer", "goog.string.html.HtmlSanitizer.AttributeType", "goog.string.html.HtmlSanitizer.Attributes", "goog.string.html.htmlSanitize"], ["goog.string.StringBuffer", "goog.string.html.HtmlParser", "goog.string.html.HtmlParser.EFlags", "goog.string.html.HtmlParser.Elements", "goog.string.html.HtmlSaxHandler"]);
goog.addDependency("../../third_party/closure/goog/dojo/dom/query.js", ["goog.dom.query"], ["goog.array", "goog.dom", "goog.functions", "goog.string", "goog.userAgent"]);
goog.addDependency("../../third_party/closure/goog/jpeg_encoder/jpeg_encoder_basic.js", ["goog.crypt.JpegEncoder"], ["goog.crypt.base64"]);
goog.addDependency("../../third_party/closure/goog/loremipsum/text/loremipsum.js", ["goog.text.LoremIpsum"], ["goog.array", "goog.math", "goog.string", "goog.structs.Map", "goog.structs.Set"]);
goog.addDependency("../../third_party/closure/goog/mochikit/async/deferred.js", ["goog.async.Deferred", "goog.async.Deferred.AlreadyCalledError", "goog.async.Deferred.CanceledError"], ["goog.array", "goog.asserts", "goog.debug.Error", "goog.functions"]);
goog.addDependency("../../third_party/closure/goog/mochikit/async/deferredlist.js", ["goog.async.DeferredList"], ["goog.async.Deferred"]);
goog.addDependency("../../third_party/closure/goog/osapi/osapi.js", ["goog.osapi"], []);
goog.addDependency("a11y/aria/announcer.js", ["goog.a11y.aria.Announcer"], ["goog.Disposable", "goog.a11y.aria", "goog.a11y.aria.LivePriority", "goog.a11y.aria.State", "goog.dom", "goog.object"]);
goog.addDependency("a11y/aria/aria.js", ["goog.a11y.aria"], ["goog.a11y.aria.State", "goog.asserts", "goog.dom", "goog.object"]);
goog.addDependency("a11y/aria/attributes.js", ["goog.a11y.aria.LivePriority", "goog.a11y.aria.State"], []);
goog.addDependency("a11y/aria/roles.js", ["goog.a11y.aria.Role"], []);
goog.addDependency("array/array.js", ["goog.array", "goog.array.ArrayLike"], ["goog.asserts"]);
goog.addDependency("asserts/asserts.js", ["goog.asserts", "goog.asserts.AssertionError"], ["goog.debug.Error", "goog.string"]);
goog.addDependency("async/animationdelay.js", ["goog.async.AnimationDelay"], ["goog.Disposable", "goog.events", "goog.functions"]);
goog.addDependency("async/conditionaldelay.js", ["goog.async.ConditionalDelay"], ["goog.Disposable", "goog.async.Delay"]);
goog.addDependency("async/delay.js", ["goog.Delay", "goog.async.Delay"], ["goog.Disposable", "goog.Timer"]);
goog.addDependency("async/nexttick.js", ["goog.async.nextTick"], []);
goog.addDependency("async/throttle.js", ["goog.Throttle", "goog.async.Throttle"], ["goog.Disposable", "goog.Timer"]);
goog.addDependency("base.js", ["goog"], []);
goog.addDependency("color/alpha.js", ["goog.color.alpha"], ["goog.color"]);
goog.addDependency("color/color.js", ["goog.color"], ["goog.color.names", "goog.math"]);
goog.addDependency("color/names.js", ["goog.color.names"], []);
goog.addDependency("crypt/aes.js", ["goog.crypt.Aes"], ["goog.asserts", "goog.crypt.BlockCipher"]);
goog.addDependency("crypt/arc4.js", ["goog.crypt.Arc4"], ["goog.asserts"]);
goog.addDependency("crypt/base64.js", ["goog.crypt.base64"], ["goog.crypt", "goog.userAgent"]);
goog.addDependency("crypt/basen.js", ["goog.crypt.baseN"], []);
goog.addDependency("crypt/blobhasher.js", ["goog.crypt.BlobHasher", "goog.crypt.BlobHasher.EventType"], ["goog.asserts", "goog.crypt", "goog.crypt.Hash", "goog.debug.Logger", "goog.events.EventTarget", "goog.fs"]);
goog.addDependency("crypt/blockcipher.js", ["goog.crypt.BlockCipher"], []);
goog.addDependency("crypt/cbc.js", ["goog.crypt.Cbc"], ["goog.array", "goog.crypt"]);
goog.addDependency("crypt/cbc_test.js", ["goog.crypt.CbcTest"], ["goog.crypt", "goog.crypt.Aes", "goog.crypt.Cbc", "goog.testing.jsunit"]);
goog.addDependency("crypt/crypt.js", ["goog.crypt"], ["goog.array"]);
goog.addDependency("crypt/hash.js", ["goog.crypt.Hash"], []);
goog.addDependency("crypt/hash32.js", ["goog.crypt.hash32"], ["goog.crypt"]);
goog.addDependency("crypt/hashtester.js", ["goog.crypt.hashTester"], ["goog.array", "goog.crypt", "goog.testing.PerformanceTable", "goog.testing.PseudoRandom", "goog.testing.asserts"]);
goog.addDependency("crypt/hmac.js", ["goog.crypt.Hmac"], ["goog.asserts", "goog.crypt.Hash"]);
goog.addDependency("crypt/md5.js", ["goog.crypt.Md5"], ["goog.crypt.Hash"]);
goog.addDependency("crypt/pbkdf2.js", ["goog.crypt.pbkdf2"], ["goog.asserts", "goog.crypt", "goog.crypt.Hmac", "goog.crypt.Sha1"]);
goog.addDependency("crypt/sha1.js", ["goog.crypt.Sha1"], ["goog.crypt.Hash"]);
goog.addDependency("crypt/sha2.js", ["goog.crypt.Sha2"], ["goog.array", "goog.asserts", "goog.crypt.Hash"]);
goog.addDependency("crypt/sha224.js", ["goog.crypt.Sha224"], ["goog.crypt.Sha2"]);
goog.addDependency("crypt/sha256.js", ["goog.crypt.Sha256"], ["goog.crypt.Sha2"]);
goog.addDependency("cssom/cssom.js", ["goog.cssom", "goog.cssom.CssRuleType"], ["goog.array", "goog.dom"]);
goog.addDependency("cssom/iframe/style.js", ["goog.cssom.iframe.style"], ["goog.cssom", "goog.dom", "goog.dom.NodeType", "goog.dom.TagName", "goog.dom.classes", "goog.string", "goog.style", "goog.userAgent"]);
goog.addDependency("datasource/datamanager.js", ["goog.ds.DataManager"], ["goog.ds.BasicNodeList", "goog.ds.DataNode", "goog.ds.Expr", "goog.string", "goog.structs", "goog.structs.Map"]);
goog.addDependency("datasource/datasource.js", ["goog.ds.BaseDataNode", "goog.ds.BasicNodeList", "goog.ds.DataNode", "goog.ds.DataNodeList", "goog.ds.EmptyNodeList", "goog.ds.LoadState", "goog.ds.SortedNodeList", "goog.ds.Util", "goog.ds.logger"], ["goog.array", "goog.debug.Logger"]);
goog.addDependency("datasource/expr.js", ["goog.ds.Expr"], ["goog.ds.BasicNodeList", "goog.ds.EmptyNodeList", "goog.string"]);
goog.addDependency("datasource/fastdatanode.js", ["goog.ds.AbstractFastDataNode", "goog.ds.FastDataNode", "goog.ds.FastListNode", "goog.ds.PrimitiveFastDataNode"], ["goog.ds.DataManager", "goog.ds.EmptyNodeList", "goog.string"]);
goog.addDependency("datasource/jsdatasource.js", ["goog.ds.JsDataSource", "goog.ds.JsPropertyDataSource"], ["goog.ds.BaseDataNode", "goog.ds.BasicNodeList", "goog.ds.DataManager", "goog.ds.EmptyNodeList", "goog.ds.LoadState"]);
goog.addDependency("datasource/jsondatasource.js", ["goog.ds.JsonDataSource"], ["goog.Uri", "goog.dom", "goog.ds.DataManager", "goog.ds.JsDataSource", "goog.ds.LoadState", "goog.ds.logger"]);
goog.addDependency("datasource/jsxmlhttpdatasource.js", ["goog.ds.JsXmlHttpDataSource"], ["goog.Uri", "goog.ds.DataManager", "goog.ds.FastDataNode", "goog.ds.LoadState", "goog.ds.logger", "goog.events", "goog.net.EventType", "goog.net.XhrIo"]);
goog.addDependency("datasource/xmldatasource.js", ["goog.ds.XmlDataSource", "goog.ds.XmlHttpDataSource"], ["goog.Uri", "goog.dom.NodeType", "goog.dom.xml", "goog.ds.BasicNodeList", "goog.ds.DataManager", "goog.ds.LoadState", "goog.ds.logger", "goog.net.XhrIo", "goog.string"]);
goog.addDependency("date/date.js", ["goog.date", "goog.date.Date", "goog.date.DateTime", "goog.date.Interval", "goog.date.month", "goog.date.weekDay"], ["goog.asserts", "goog.date.DateLike", "goog.i18n.DateTimeSymbols", "goog.string"]);
goog.addDependency("date/datelike.js", ["goog.date.DateLike"], []);
goog.addDependency("date/daterange.js", ["goog.date.DateRange", "goog.date.DateRange.Iterator", "goog.date.DateRange.StandardDateRangeKeys"], ["goog.date.Date", "goog.date.Interval", "goog.iter.Iterator", "goog.iter.StopIteration"]);
goog.addDependency("date/relative.js", ["goog.date.relative"], ["goog.i18n.DateTimeFormat"]);
goog.addDependency("date/utcdatetime.js", ["goog.date.UtcDateTime"], ["goog.date", "goog.date.Date", "goog.date.DateTime", "goog.date.Interval"]);
goog.addDependency("db/cursor.js", ["goog.db.Cursor"], ["goog.async.Deferred", "goog.db.Error", "goog.debug", "goog.events.EventTarget"]);
goog.addDependency("db/db.js", ["goog.db"], ["goog.async.Deferred", "goog.db.Error", "goog.db.IndexedDb", "goog.db.Transaction"]);
goog.addDependency("db/error.js", ["goog.db.Error", "goog.db.Error.ErrorCode", "goog.db.Error.ErrorName", "goog.db.Error.VersionChangeBlockedError"], ["goog.debug.Error"]);
goog.addDependency("db/index.js", ["goog.db.Index"], ["goog.async.Deferred", "goog.db.Error", "goog.debug"]);
goog.addDependency("db/indexeddb.js", ["goog.db.IndexedDb"], ["goog.async.Deferred", "goog.db.Error", "goog.db.Error.VersionChangeBlockedError", "goog.db.ObjectStore", "goog.db.Transaction", "goog.db.Transaction.TransactionMode", "goog.events.Event", "goog.events.EventHandler", "goog.events.EventTarget"]);
goog.addDependency("db/keyrange.js", ["goog.db.KeyRange"], []);
goog.addDependency("db/objectstore.js", ["goog.db.ObjectStore"], ["goog.async.Deferred", "goog.db.Cursor", "goog.db.Error", "goog.db.Index", "goog.debug", "goog.events"]);
goog.addDependency("db/transaction.js", ["goog.db.Transaction", "goog.db.Transaction.TransactionMode"], ["goog.async.Deferred", "goog.db.Error", "goog.db.ObjectStore", "goog.events.EventHandler", "goog.events.EventTarget"]);
goog.addDependency("debug/console.js", ["goog.debug.Console"], ["goog.debug.LogManager", "goog.debug.Logger.Level", "goog.debug.TextFormatter"]);
goog.addDependency("debug/debug.js", ["goog.debug"], ["goog.array", "goog.string", "goog.structs.Set", "goog.userAgent"]);
goog.addDependency("debug/debugwindow.js", ["goog.debug.DebugWindow"], ["goog.debug.HtmlFormatter", "goog.debug.LogManager", "goog.debug.Logger", "goog.structs.CircularBuffer", "goog.userAgent"]);
goog.addDependency("debug/devcss/devcss.js", ["goog.debug.DevCss", "goog.debug.DevCss.UserAgent"], ["goog.cssom", "goog.dom.classes", "goog.events", "goog.events.EventType", "goog.string", "goog.userAgent"]);
goog.addDependency("debug/devcss/devcssrunner.js", ["goog.debug.devCssRunner"], ["goog.debug.DevCss"]);
goog.addDependency("debug/divconsole.js", ["goog.debug.DivConsole"], ["goog.debug.HtmlFormatter", "goog.debug.LogManager", "goog.style"]);
goog.addDependency("debug/entrypointregistry.js", ["goog.debug.EntryPointMonitor", "goog.debug.entryPointRegistry"], ["goog.asserts"]);
goog.addDependency("debug/error.js", ["goog.debug.Error"], []);
goog.addDependency("debug/errorhandler.js", ["goog.debug.ErrorHandler", "goog.debug.ErrorHandler.ProtectedFunctionError"], ["goog.asserts", "goog.debug", "goog.debug.EntryPointMonitor", "goog.debug.Trace"]);
goog.addDependency("debug/errorhandlerweakdep.js", ["goog.debug.errorHandlerWeakDep"], []);
goog.addDependency("debug/errorreporter.js", ["goog.debug.ErrorReporter", "goog.debug.ErrorReporter.ExceptionEvent"], ["goog.debug", "goog.debug.ErrorHandler", "goog.debug.Logger", "goog.debug.entryPointRegistry", "goog.events", "goog.events.Event", "goog.events.EventTarget", "goog.net.XhrIo", "goog.object", "goog.string", "goog.uri.utils", "goog.userAgent"]);
goog.addDependency("debug/fancywindow.js", ["goog.debug.FancyWindow"], ["goog.debug.DebugWindow", "goog.debug.LogManager", "goog.debug.Logger", "goog.dom.DomHelper", "goog.object", "goog.string", "goog.userAgent"]);
goog.addDependency("debug/formatter.js", ["goog.debug.Formatter", "goog.debug.HtmlFormatter", "goog.debug.TextFormatter"], ["goog.debug.RelativeTimeProvider", "goog.string"]);
goog.addDependency("debug/fpsdisplay.js", ["goog.debug.FpsDisplay"], ["goog.asserts", "goog.async.AnimationDelay", "goog.ui.Component"]);
goog.addDependency("debug/gcdiagnostics.js", ["goog.debug.GcDiagnostics"], ["goog.debug.Logger", "goog.debug.Trace", "goog.userAgent"]);
goog.addDependency("debug/logbuffer.js", ["goog.debug.LogBuffer"], ["goog.asserts", "goog.debug.LogRecord"]);
goog.addDependency("debug/logger.js", ["goog.debug.LogManager", "goog.debug.Logger", "goog.debug.Logger.Level"], ["goog.array", "goog.asserts", "goog.debug", "goog.debug.LogBuffer", "goog.debug.LogRecord"]);
goog.addDependency("debug/logrecord.js", ["goog.debug.LogRecord"], []);
goog.addDependency("debug/logrecordserializer.js", ["goog.debug.logRecordSerializer"], ["goog.debug.LogRecord", "goog.debug.Logger.Level", "goog.json", "goog.object"]);
goog.addDependency("debug/reflect.js", ["goog.debug.reflect"], []);
goog.addDependency("debug/relativetimeprovider.js", ["goog.debug.RelativeTimeProvider"], []);
goog.addDependency("debug/tracer.js", ["goog.debug.Trace"], ["goog.array", "goog.debug.Logger", "goog.iter", "goog.structs.Map", "goog.structs.SimplePool"]);
goog.addDependency("disposable/disposable.js", ["goog.Disposable", "goog.dispose"], ["goog.disposable.IDisposable"]);
goog.addDependency("disposable/idisposable.js", ["goog.disposable.IDisposable"], []);
goog.addDependency("dom/a11y.js", ["goog.dom.a11y", "goog.dom.a11y.Announcer", "goog.dom.a11y.LivePriority", "goog.dom.a11y.Role", "goog.dom.a11y.State"], ["goog.a11y.aria", "goog.a11y.aria.Announcer", "goog.a11y.aria.LivePriority", "goog.a11y.aria.Role", "goog.a11y.aria.State"]);
goog.addDependency("dom/abstractmultirange.js", ["goog.dom.AbstractMultiRange"], ["goog.array", "goog.dom", "goog.dom.AbstractRange"]);
goog.addDependency("dom/abstractrange.js", ["goog.dom.AbstractRange", "goog.dom.RangeIterator", "goog.dom.RangeType"], ["goog.dom", "goog.dom.NodeType", "goog.dom.SavedCaretRange", "goog.dom.TagIterator", "goog.userAgent"]);
goog.addDependency("dom/annotate.js", ["goog.dom.annotate"], ["goog.array", "goog.dom", "goog.dom.NodeType", "goog.string"]);
goog.addDependency("dom/browserfeature.js", ["goog.dom.BrowserFeature"], ["goog.userAgent"]);
goog.addDependency("dom/browserrange/abstractrange.js", ["goog.dom.browserrange.AbstractRange"], ["goog.array", "goog.asserts", "goog.dom", "goog.dom.NodeType", "goog.dom.RangeEndpoint", "goog.dom.TagName", "goog.dom.TextRangeIterator", "goog.iter", "goog.math.Coordinate", "goog.string", "goog.string.StringBuffer", "goog.userAgent"]);
goog.addDependency("dom/browserrange/browserrange.js", ["goog.dom.browserrange", "goog.dom.browserrange.Error"], ["goog.dom", "goog.dom.NodeType", "goog.dom.browserrange.GeckoRange", "goog.dom.browserrange.IeRange", "goog.dom.browserrange.OperaRange", "goog.dom.browserrange.W3cRange", "goog.dom.browserrange.WebKitRange", "goog.userAgent"]);
goog.addDependency("dom/browserrange/geckorange.js", ["goog.dom.browserrange.GeckoRange"], ["goog.dom.browserrange.W3cRange"]);
goog.addDependency("dom/browserrange/ierange.js", ["goog.dom.browserrange.IeRange"], ["goog.array", "goog.debug.Logger", "goog.dom", "goog.dom.NodeType", "goog.dom.RangeEndpoint", "goog.dom.TagName", "goog.dom.browserrange.AbstractRange", "goog.string"]);
goog.addDependency("dom/browserrange/operarange.js", ["goog.dom.browserrange.OperaRange"], ["goog.dom.browserrange.W3cRange"]);
goog.addDependency("dom/browserrange/w3crange.js", ["goog.dom.browserrange.W3cRange"], ["goog.dom", "goog.dom.NodeType", "goog.dom.RangeEndpoint", "goog.dom.browserrange.AbstractRange", "goog.string"]);
goog.addDependency("dom/browserrange/webkitrange.js", ["goog.dom.browserrange.WebKitRange"], ["goog.dom.RangeEndpoint", "goog.dom.browserrange.W3cRange", "goog.userAgent"]);
goog.addDependency("dom/bufferedviewportsizemonitor.js", ["goog.dom.BufferedViewportSizeMonitor"], ["goog.asserts", "goog.async.Delay", "goog.events", "goog.events.EventTarget", "goog.events.EventType"]);
goog.addDependency("dom/bufferedviewportsizemonitor_test.js", ["goog.dom.BufferedViewportSizeMonitorTest"], ["goog.dom.BufferedViewportSizeMonitor", "goog.dom.ViewportSizeMonitor", "goog.events", "goog.events.EventType", "goog.math.Size", "goog.testing.MockClock", "goog.testing.events", "goog.testing.events.Event", "goog.testing.jsunit"]);
goog.addDependency("dom/classes.js", ["goog.dom.classes"], ["goog.array"]);
goog.addDependency("dom/classes_test.js", ["goog.dom.classes_test"], ["goog.dom", "goog.dom.classes", "goog.testing.jsunit"]);
goog.addDependency("dom/classlist.js", ["goog.dom.classlist"], ["goog.array", "goog.asserts"]);
goog.addDependency("dom/classlist_test.js", ["goog.dom.classlist_test"], ["goog.dom", "goog.dom.classlist", "goog.testing.jsunit"]);
goog.addDependency("dom/controlrange.js", ["goog.dom.ControlRange", "goog.dom.ControlRangeIterator"], ["goog.array", "goog.dom", "goog.dom.AbstractMultiRange", "goog.dom.AbstractRange", "goog.dom.RangeIterator", "goog.dom.RangeType", "goog.dom.SavedRange", "goog.dom.TagWalkType", "goog.dom.TextRange", "goog.iter.StopIteration", "goog.userAgent"]);
goog.addDependency("dom/dataset.js", ["goog.dom.dataset"], ["goog.string"]);
goog.addDependency("dom/dom.js", ["goog.dom", "goog.dom.Appendable", "goog.dom.DomHelper", "goog.dom.NodeType"], ["goog.array", "goog.dom.BrowserFeature", "goog.dom.TagName", "goog.dom.classes", "goog.math.Coordinate", "goog.math.Size", "goog.object", "goog.string", "goog.userAgent"]);
goog.addDependency("dom/dom_test.js", ["goog.dom.dom_test"], ["goog.dom", "goog.dom.BrowserFeature", "goog.dom.DomHelper", "goog.dom.NodeType", "goog.dom.TagName", "goog.object", "goog.string.Unicode", "goog.testing.asserts", "goog.userAgent", "goog.userAgent.product", "goog.userAgent.product.isVersion"]);
goog.addDependency("dom/fontsizemonitor.js", ["goog.dom.FontSizeMonitor", "goog.dom.FontSizeMonitor.EventType"], ["goog.dom", "goog.events", "goog.events.EventTarget", "goog.events.EventType", "goog.userAgent"]);
goog.addDependency("dom/forms.js", ["goog.dom.forms"], ["goog.structs.Map"]);
goog.addDependency("dom/fullscreen.js", ["goog.dom.fullscreen", "goog.dom.fullscreen.EventType"], ["goog.dom", "goog.userAgent", "goog.userAgent.product"]);
goog.addDependency("dom/iframe.js", ["goog.dom.iframe"], ["goog.dom"]);
goog.addDependency("dom/iter.js", ["goog.dom.iter.AncestorIterator", "goog.dom.iter.ChildIterator", "goog.dom.iter.SiblingIterator"], ["goog.iter.Iterator", "goog.iter.StopIteration"]);
goog.addDependency("dom/multirange.js", ["goog.dom.MultiRange", "goog.dom.MultiRangeIterator"], ["goog.array", "goog.debug.Logger", "goog.dom.AbstractMultiRange", "goog.dom.AbstractRange", "goog.dom.RangeIterator", "goog.dom.RangeType", "goog.dom.SavedRange", "goog.dom.TextRange", "goog.iter.StopIteration"]);
goog.addDependency("dom/nodeiterator.js", ["goog.dom.NodeIterator"], ["goog.dom.TagIterator"]);
goog.addDependency("dom/nodeoffset.js", ["goog.dom.NodeOffset"], ["goog.Disposable", "goog.dom.TagName"]);
goog.addDependency("dom/pattern/abstractpattern.js", ["goog.dom.pattern.AbstractPattern"], ["goog.dom.pattern.MatchType"]);
goog.addDependency("dom/pattern/allchildren.js", ["goog.dom.pattern.AllChildren"], ["goog.dom.pattern.AbstractPattern", "goog.dom.pattern.MatchType"]);
goog.addDependency("dom/pattern/callback/callback.js", ["goog.dom.pattern.callback"], ["goog.dom", "goog.dom.TagWalkType", "goog.iter"]);
goog.addDependency("dom/pattern/callback/counter.js", ["goog.dom.pattern.callback.Counter"], []);
goog.addDependency("dom/pattern/callback/test.js", ["goog.dom.pattern.callback.Test"], ["goog.iter.StopIteration"]);
goog.addDependency("dom/pattern/childmatches.js", ["goog.dom.pattern.ChildMatches"], ["goog.dom.pattern.AllChildren", "goog.dom.pattern.MatchType"]);
goog.addDependency("dom/pattern/endtag.js", ["goog.dom.pattern.EndTag"], ["goog.dom.TagWalkType", "goog.dom.pattern.Tag"]);
goog.addDependency("dom/pattern/fulltag.js", ["goog.dom.pattern.FullTag"], ["goog.dom.pattern.MatchType", "goog.dom.pattern.StartTag", "goog.dom.pattern.Tag"]);
goog.addDependency("dom/pattern/matcher.js", ["goog.dom.pattern.Matcher"], ["goog.dom.TagIterator", "goog.dom.pattern.MatchType", "goog.iter"]);
goog.addDependency("dom/pattern/nodetype.js", ["goog.dom.pattern.NodeType"], ["goog.dom.pattern.AbstractPattern", "goog.dom.pattern.MatchType"]);
goog.addDependency("dom/pattern/pattern.js", ["goog.dom.pattern", "goog.dom.pattern.MatchType"], []);
goog.addDependency("dom/pattern/repeat.js", ["goog.dom.pattern.Repeat"], ["goog.dom.NodeType", "goog.dom.pattern.AbstractPattern", "goog.dom.pattern.MatchType"]);
goog.addDependency("dom/pattern/sequence.js", ["goog.dom.pattern.Sequence"], ["goog.dom.NodeType", "goog.dom.pattern.AbstractPattern", "goog.dom.pattern.MatchType"]);
goog.addDependency("dom/pattern/starttag.js", ["goog.dom.pattern.StartTag"], ["goog.dom.TagWalkType", "goog.dom.pattern.Tag"]);
goog.addDependency("dom/pattern/tag.js", ["goog.dom.pattern.Tag"], ["goog.dom.pattern", "goog.dom.pattern.AbstractPattern", "goog.dom.pattern.MatchType", "goog.object"]);
goog.addDependency("dom/pattern/text.js", ["goog.dom.pattern.Text"], ["goog.dom.NodeType", "goog.dom.pattern", "goog.dom.pattern.AbstractPattern", "goog.dom.pattern.MatchType"]);
goog.addDependency("dom/range.js", ["goog.dom.Range"], ["goog.dom", "goog.dom.AbstractRange", "goog.dom.ControlRange", "goog.dom.MultiRange", "goog.dom.NodeType", "goog.dom.TextRange", "goog.userAgent"]);
goog.addDependency("dom/rangeendpoint.js", ["goog.dom.RangeEndpoint"], []);
goog.addDependency("dom/savedcaretrange.js", ["goog.dom.SavedCaretRange"], ["goog.array", "goog.dom", "goog.dom.SavedRange", "goog.dom.TagName", "goog.string"]);
goog.addDependency("dom/savedrange.js", ["goog.dom.SavedRange"], ["goog.Disposable", "goog.debug.Logger"]);
goog.addDependency("dom/selection.js", ["goog.dom.selection"], ["goog.string", "goog.userAgent"]);
goog.addDependency("dom/tagiterator.js", ["goog.dom.TagIterator", "goog.dom.TagWalkType"], ["goog.dom.NodeType", "goog.iter.Iterator", "goog.iter.StopIteration"]);
goog.addDependency("dom/tagname.js", ["goog.dom.TagName"], []);
goog.addDependency("dom/textrange.js", ["goog.dom.TextRange"], ["goog.array", "goog.dom", "goog.dom.AbstractRange", "goog.dom.RangeType", "goog.dom.SavedRange", "goog.dom.TagName", "goog.dom.TextRangeIterator", "goog.dom.browserrange", "goog.string", "goog.userAgent"]);
goog.addDependency("dom/textrangeiterator.js", ["goog.dom.TextRangeIterator"], ["goog.array", "goog.dom.NodeType", "goog.dom.RangeIterator", "goog.dom.TagName", "goog.iter.StopIteration"]);
goog.addDependency("dom/vendor.js", ["goog.dom.vendor"], ["goog.userAgent"]);
goog.addDependency("dom/viewportsizemonitor.js", ["goog.dom.ViewportSizeMonitor"], ["goog.dom", "goog.events", "goog.events.EventTarget", "goog.events.EventType", "goog.math.Size"]);
goog.addDependency("dom/xml.js", ["goog.dom.xml"], ["goog.dom", "goog.dom.NodeType"]);
goog.addDependency("editor/browserfeature.js", ["goog.editor.BrowserFeature"], ["goog.editor.defines", "goog.userAgent", "goog.userAgent.product", "goog.userAgent.product.isVersion"]);
goog.addDependency("editor/clicktoeditwrapper.js", ["goog.editor.ClickToEditWrapper"], ["goog.Disposable", "goog.asserts", "goog.debug.Logger", "goog.dom", "goog.dom.Range", "goog.dom.TagName", "goog.editor.BrowserFeature", "goog.editor.Command", "goog.editor.Field.EventType", "goog.editor.range", "goog.events.BrowserEvent.MouseButton", "goog.events.EventHandler", "goog.events.EventType"]);
goog.addDependency("editor/command.js", ["goog.editor.Command"], []);
goog.addDependency("editor/contenteditablefield.js", ["goog.editor.ContentEditableField"], ["goog.asserts", "goog.debug.Logger", "goog.editor.Field"]);
goog.addDependency("editor/defines.js", ["goog.editor.defines"], []);
goog.addDependency("editor/field.js", ["goog.editor.Field", "goog.editor.Field.EventType"], ["goog.a11y.aria", "goog.a11y.aria.Role", "goog.array", "goog.asserts", "goog.async.Delay", "goog.debug.Logger", "goog.dom", "goog.dom.Range", "goog.dom.TagName", "goog.editor.BrowserFeature", "goog.editor.Command", "goog.editor.Plugin", "goog.editor.icontent", "goog.editor.icontent.FieldFormatInfo", "goog.editor.icontent.FieldStyleInfo", "goog.editor.node", "goog.editor.range", "goog.events", "goog.events.EventHandler", 
"goog.events.EventTarget", "goog.events.EventType", "goog.events.KeyCodes", "goog.functions", "goog.string", "goog.string.Unicode", "goog.style", "goog.userAgent", "goog.userAgent.product"]);
goog.addDependency("editor/field_test.js", ["goog.editor.field_test"], ["goog.dom", "goog.dom.Range", "goog.editor.BrowserFeature", "goog.editor.Field", "goog.editor.Plugin", "goog.editor.range", "goog.events", "goog.events.BrowserEvent", "goog.events.KeyCodes", "goog.functions", "goog.testing.LooseMock", "goog.testing.MockClock", "goog.testing.dom", "goog.testing.events", "goog.testing.events.Event", "goog.testing.recordFunction", "goog.userAgent"]);
goog.addDependency("editor/focus.js", ["goog.editor.focus"], ["goog.dom.selection"]);
goog.addDependency("editor/icontent.js", ["goog.editor.icontent", "goog.editor.icontent.FieldFormatInfo", "goog.editor.icontent.FieldStyleInfo"], ["goog.editor.BrowserFeature", "goog.style", "goog.userAgent"]);
goog.addDependency("editor/link.js", ["goog.editor.Link"], ["goog.array", "goog.dom", "goog.dom.NodeType", "goog.dom.Range", "goog.editor.BrowserFeature", "goog.editor.Command", "goog.editor.node", "goog.editor.range", "goog.string", "goog.string.Unicode", "goog.uri.utils", "goog.uri.utils.ComponentIndex"]);
goog.addDependency("editor/node.js", ["goog.editor.node"], ["goog.dom", "goog.dom.NodeType", "goog.dom.TagName", "goog.dom.iter.ChildIterator", "goog.dom.iter.SiblingIterator", "goog.iter", "goog.object", "goog.string", "goog.string.Unicode", "goog.userAgent"]);
goog.addDependency("editor/plugin.js", ["goog.editor.Plugin"], ["goog.debug.Logger", "goog.editor.Command", "goog.events.EventTarget", "goog.functions", "goog.object", "goog.reflect"]);
goog.addDependency("editor/plugins/abstractbubbleplugin.js", ["goog.editor.plugins.AbstractBubblePlugin"], ["goog.dom", "goog.dom.NodeType", "goog.dom.Range", "goog.dom.TagName", "goog.editor.Plugin", "goog.editor.style", "goog.events", "goog.events.EventHandler", "goog.events.EventType", "goog.events.KeyCodes", "goog.events.actionEventWrapper", "goog.functions", "goog.string.Unicode", "goog.ui.Component.EventType", "goog.ui.editor.Bubble", "goog.userAgent"]);
goog.addDependency("editor/plugins/abstractdialogplugin.js", ["goog.editor.plugins.AbstractDialogPlugin", "goog.editor.plugins.AbstractDialogPlugin.EventType"], ["goog.dom", "goog.dom.Range", "goog.editor.Field.EventType", "goog.editor.Plugin", "goog.editor.range", "goog.events", "goog.ui.editor.AbstractDialog.EventType"]);
goog.addDependency("editor/plugins/abstracttabhandler.js", ["goog.editor.plugins.AbstractTabHandler"], ["goog.editor.Plugin", "goog.events.KeyCodes"]);
goog.addDependency("editor/plugins/basictextformatter.js", ["goog.editor.plugins.BasicTextFormatter", "goog.editor.plugins.BasicTextFormatter.COMMAND"], ["goog.array", "goog.debug.Logger", "goog.dom", "goog.dom.NodeType", "goog.dom.Range", "goog.dom.TagName", "goog.editor.BrowserFeature", "goog.editor.Command", "goog.editor.Link", "goog.editor.Plugin", "goog.editor.node", "goog.editor.range", "goog.editor.style", "goog.iter", "goog.iter.StopIteration", "goog.object", "goog.string", "goog.string.Unicode", 
"goog.style", "goog.ui.editor.messages", "goog.userAgent"]);
goog.addDependency("editor/plugins/blockquote.js", ["goog.editor.plugins.Blockquote"], ["goog.debug.Logger", "goog.dom", "goog.dom.NodeType", "goog.dom.TagName", "goog.dom.classes", "goog.editor.BrowserFeature", "goog.editor.Command", "goog.editor.Plugin", "goog.editor.node", "goog.functions"]);
goog.addDependency("editor/plugins/emoticons.js", ["goog.editor.plugins.Emoticons"], ["goog.dom.TagName", "goog.editor.Plugin", "goog.editor.range", "goog.functions", "goog.ui.emoji.Emoji", "goog.userAgent"]);
goog.addDependency("editor/plugins/enterhandler.js", ["goog.editor.plugins.EnterHandler"], ["goog.dom", "goog.dom.NodeOffset", "goog.dom.NodeType", "goog.dom.Range", "goog.dom.TagName", "goog.editor.BrowserFeature", "goog.editor.Plugin", "goog.editor.node", "goog.editor.plugins.Blockquote", "goog.editor.range", "goog.editor.style", "goog.events.KeyCodes", "goog.functions", "goog.object", "goog.string", "goog.userAgent"]);
goog.addDependency("editor/plugins/equationeditorbubble.js", ["goog.editor.plugins.equation.EquationBubble"], ["goog.dom", "goog.dom.TagName", "goog.editor.Command", "goog.editor.plugins.AbstractBubblePlugin", "goog.string.Unicode", "goog.ui.editor.Bubble", "goog.ui.equation.ImageRenderer"]);
goog.addDependency("editor/plugins/equationeditorplugin.js", ["goog.editor.plugins.EquationEditorPlugin"], ["goog.debug.Logger", "goog.dom", "goog.editor.Command", "goog.editor.plugins.AbstractDialogPlugin", "goog.editor.range", "goog.events", "goog.events.EventType", "goog.functions", "goog.ui.editor.AbstractDialog", "goog.ui.editor.EquationEditorDialog", "goog.ui.equation.ImageRenderer", "goog.ui.equation.PaletteManager"]);
goog.addDependency("editor/plugins/firststrong.js", ["goog.editor.plugins.FirstStrong"], ["goog.dom", "goog.dom.NodeType", "goog.dom.TagIterator", "goog.dom.TagName", "goog.editor.Command", "goog.editor.Plugin", "goog.editor.node", "goog.editor.range", "goog.i18n.bidi", "goog.i18n.uChar", "goog.iter", "goog.userAgent"]);
goog.addDependency("editor/plugins/headerformatter.js", ["goog.editor.plugins.HeaderFormatter"], ["goog.editor.Command", "goog.editor.Plugin", "goog.userAgent"]);
goog.addDependency("editor/plugins/linkbubble.js", ["goog.editor.plugins.LinkBubble", "goog.editor.plugins.LinkBubble.Action"], ["goog.array", "goog.dom", "goog.editor.BrowserFeature", "goog.editor.Command", "goog.editor.Link", "goog.editor.plugins.AbstractBubblePlugin", "goog.editor.range", "goog.string", "goog.style", "goog.ui.editor.messages", "goog.uri.utils", "goog.window"]);
goog.addDependency("editor/plugins/linkdialogplugin.js", ["goog.editor.plugins.LinkDialogPlugin"], ["goog.array", "goog.dom", "goog.editor.Command", "goog.editor.plugins.AbstractDialogPlugin", "goog.events.EventHandler", "goog.functions", "goog.ui.editor.AbstractDialog.EventType", "goog.ui.editor.LinkDialog", "goog.ui.editor.LinkDialog.EventType", "goog.ui.editor.LinkDialog.OkEvent", "goog.uri.utils"]);
goog.addDependency("editor/plugins/linkshortcutplugin.js", ["goog.editor.plugins.LinkShortcutPlugin"], ["goog.editor.Command", "goog.editor.Link", "goog.editor.Plugin", "goog.string"]);
goog.addDependency("editor/plugins/listtabhandler.js", ["goog.editor.plugins.ListTabHandler"], ["goog.dom.TagName", "goog.editor.Command", "goog.editor.plugins.AbstractTabHandler"]);
goog.addDependency("editor/plugins/loremipsum.js", ["goog.editor.plugins.LoremIpsum"], ["goog.asserts", "goog.dom", "goog.editor.Command", "goog.editor.Plugin", "goog.editor.node", "goog.functions"]);
goog.addDependency("editor/plugins/removeformatting.js", ["goog.editor.plugins.RemoveFormatting"], ["goog.dom", "goog.dom.NodeType", "goog.dom.Range", "goog.dom.TagName", "goog.editor.BrowserFeature", "goog.editor.Plugin", "goog.editor.node", "goog.editor.range", "goog.string", "goog.userAgent"]);
goog.addDependency("editor/plugins/spacestabhandler.js", ["goog.editor.plugins.SpacesTabHandler"], ["goog.dom", "goog.dom.TagName", "goog.editor.plugins.AbstractTabHandler", "goog.editor.range"]);
goog.addDependency("editor/plugins/tableeditor.js", ["goog.editor.plugins.TableEditor"], ["goog.array", "goog.dom", "goog.dom.TagName", "goog.editor.Plugin", "goog.editor.Table", "goog.editor.node", "goog.editor.range", "goog.object"]);
goog.addDependency("editor/plugins/tagonenterhandler.js", ["goog.editor.plugins.TagOnEnterHandler"], ["goog.dom", "goog.dom.NodeType", "goog.dom.Range", "goog.dom.TagName", "goog.editor.Command", "goog.editor.node", "goog.editor.plugins.EnterHandler", "goog.editor.range", "goog.editor.style", "goog.events.KeyCodes", "goog.string", "goog.style", "goog.userAgent"]);
goog.addDependency("editor/plugins/undoredo.js", ["goog.editor.plugins.UndoRedo"], ["goog.debug.Logger", "goog.dom", "goog.dom.NodeOffset", "goog.dom.Range", "goog.editor.BrowserFeature", "goog.editor.Command", "goog.editor.Field.EventType", "goog.editor.Plugin", "goog.editor.node", "goog.editor.plugins.UndoRedoManager", "goog.editor.plugins.UndoRedoState", "goog.events", "goog.events.EventHandler"]);
goog.addDependency("editor/plugins/undoredomanager.js", ["goog.editor.plugins.UndoRedoManager", "goog.editor.plugins.UndoRedoManager.EventType"], ["goog.editor.plugins.UndoRedoState", "goog.events.EventTarget"]);
goog.addDependency("editor/plugins/undoredostate.js", ["goog.editor.plugins.UndoRedoState"], ["goog.events.EventTarget"]);
goog.addDependency("editor/range.js", ["goog.editor.range", "goog.editor.range.Point"], ["goog.array", "goog.dom", "goog.dom.NodeType", "goog.dom.Range", "goog.dom.RangeEndpoint", "goog.dom.SavedCaretRange", "goog.editor.BrowserFeature", "goog.editor.node", "goog.editor.style", "goog.iter"]);
goog.addDependency("editor/seamlessfield.js", ["goog.editor.SeamlessField"], ["goog.cssom.iframe.style", "goog.debug.Logger", "goog.dom", "goog.dom.Range", "goog.dom.TagName", "goog.editor.BrowserFeature", "goog.editor.Field", "goog.editor.icontent", "goog.editor.icontent.FieldFormatInfo", "goog.editor.icontent.FieldStyleInfo", "goog.editor.node", "goog.events", "goog.events.EventType", "goog.style"]);
goog.addDependency("editor/seamlessfield_test.js", ["goog.editor.seamlessfield_test"], ["goog.dom", "goog.dom.DomHelper", "goog.dom.Range", "goog.editor.BrowserFeature", "goog.editor.Field", "goog.editor.SeamlessField", "goog.events", "goog.functions", "goog.style", "goog.testing.MockClock", "goog.testing.MockRange", "goog.testing.jsunit"]);
goog.addDependency("editor/style.js", ["goog.editor.style"], ["goog.dom", "goog.dom.NodeType", "goog.editor.BrowserFeature", "goog.events.EventType", "goog.object", "goog.style", "goog.userAgent"]);
goog.addDependency("editor/table.js", ["goog.editor.Table", "goog.editor.TableCell", "goog.editor.TableRow"], ["goog.debug.Logger", "goog.dom", "goog.dom.DomHelper", "goog.dom.NodeType", "goog.dom.TagName", "goog.string.Unicode", "goog.style"]);
goog.addDependency("events/actioneventwrapper.js", ["goog.events.actionEventWrapper"], ["goog.events", "goog.events.EventHandler", "goog.events.EventType", "goog.events.EventWrapper", "goog.events.KeyCodes"]);
goog.addDependency("events/actionhandler.js", ["goog.events.ActionEvent", "goog.events.ActionHandler", "goog.events.ActionHandler.EventType", "goog.events.BeforeActionEvent"], ["goog.events", "goog.events.BrowserEvent", "goog.events.EventTarget", "goog.events.EventType", "goog.events.KeyCodes", "goog.userAgent"]);
goog.addDependency("events/browserevent.js", ["goog.events.BrowserEvent", "goog.events.BrowserEvent.MouseButton"], ["goog.events.BrowserFeature", "goog.events.Event", "goog.events.EventType", "goog.reflect", "goog.userAgent"]);
goog.addDependency("events/browserfeature.js", ["goog.events.BrowserFeature"], ["goog.userAgent"]);
goog.addDependency("events/event.js", ["goog.events.Event", "goog.events.EventLike"], ["goog.Disposable"]);
goog.addDependency("events/eventhandler.js", ["goog.events.EventHandler"], ["goog.Disposable", "goog.events", "goog.object"]);
goog.addDependency("events/events.js", ["goog.events", "goog.events.Key", "goog.events.ListenableType"], ["goog.array", "goog.asserts", "goog.debug.entryPointRegistry", "goog.events.BrowserEvent", "goog.events.BrowserFeature", "goog.events.Listenable", "goog.events.Listener", "goog.object"]);
goog.addDependency("events/eventtarget.js", ["goog.events.EventTarget"], ["goog.Disposable", "goog.array", "goog.asserts", "goog.events", "goog.events.Event", "goog.events.Listenable", "goog.events.Listener", "goog.object"]);
goog.addDependency("events/eventtargettester.js", ["goog.events.eventTargetTester", "goog.events.eventTargetTester.KeyType", "goog.events.eventTargetTester.UnlistenReturnType"], ["goog.array", "goog.events", "goog.events.Event", "goog.events.EventTarget", "goog.testing.asserts", "goog.testing.recordFunction"]);
goog.addDependency("events/eventtype.js", ["goog.events.EventType"], ["goog.userAgent"]);
goog.addDependency("events/eventwrapper.js", ["goog.events.EventWrapper"], []);
goog.addDependency("events/filedrophandler.js", ["goog.events.FileDropHandler", "goog.events.FileDropHandler.EventType"], ["goog.array", "goog.debug.Logger", "goog.dom", "goog.events", "goog.events.BrowserEvent", "goog.events.EventHandler", "goog.events.EventTarget", "goog.events.EventType"]);
goog.addDependency("events/focushandler.js", ["goog.events.FocusHandler", "goog.events.FocusHandler.EventType"], ["goog.events", "goog.events.BrowserEvent", "goog.events.EventTarget", "goog.userAgent"]);
goog.addDependency("events/imehandler.js", ["goog.events.ImeHandler", "goog.events.ImeHandler.Event", "goog.events.ImeHandler.EventType"], ["goog.events.Event", "goog.events.EventHandler", "goog.events.EventTarget", "goog.events.EventType", "goog.events.KeyCodes", "goog.userAgent"]);
goog.addDependency("events/inputhandler.js", ["goog.events.InputHandler", "goog.events.InputHandler.EventType"], ["goog.Timer", "goog.dom", "goog.events.BrowserEvent", "goog.events.EventHandler", "goog.events.EventTarget", "goog.events.KeyCodes", "goog.userAgent"]);
goog.addDependency("events/keycodes.js", ["goog.events.KeyCodes"], ["goog.userAgent"]);
goog.addDependency("events/keyhandler.js", ["goog.events.KeyEvent", "goog.events.KeyHandler", "goog.events.KeyHandler.EventType"], ["goog.events", "goog.events.BrowserEvent", "goog.events.EventTarget", "goog.events.EventType", "goog.events.KeyCodes", "goog.userAgent"]);
goog.addDependency("events/keynames.js", ["goog.events.KeyNames"], []);
goog.addDependency("events/listenable.js", ["goog.events.Listenable", "goog.events.ListenableKey"], []);
goog.addDependency("events/listener.js", ["goog.events.Listener"], ["goog.events.ListenableKey"]);
goog.addDependency("events/mousewheelhandler.js", ["goog.events.MouseWheelEvent", "goog.events.MouseWheelHandler", "goog.events.MouseWheelHandler.EventType"], ["goog.dom", "goog.events", "goog.events.BrowserEvent", "goog.events.EventTarget", "goog.math", "goog.style", "goog.userAgent"]);
goog.addDependency("events/onlinehandler.js", ["goog.events.OnlineHandler", "goog.events.OnlineHandler.EventType"], ["goog.Timer", "goog.events.BrowserFeature", "goog.events.EventHandler", "goog.events.EventTarget", "goog.events.EventType", "goog.net.NetworkStatusMonitor", "goog.userAgent"]);
goog.addDependency("events/pastehandler.js", ["goog.events.PasteHandler", "goog.events.PasteHandler.EventType", "goog.events.PasteHandler.State"], ["goog.Timer", "goog.async.ConditionalDelay", "goog.debug.Logger", "goog.events.BrowserEvent", "goog.events.EventHandler", "goog.events.EventTarget", "goog.events.EventType", "goog.events.KeyCodes", "goog.userAgent"]);
goog.addDependency("format/emailaddress.js", ["goog.format.EmailAddress"], ["goog.string"]);
goog.addDependency("format/format.js", ["goog.format"], ["goog.i18n.GraphemeBreak", "goog.string", "goog.userAgent"]);
goog.addDependency("format/htmlprettyprinter.js", ["goog.format.HtmlPrettyPrinter", "goog.format.HtmlPrettyPrinter.Buffer"], ["goog.object", "goog.string.StringBuffer"]);
goog.addDependency("format/jsonprettyprinter.js", ["goog.format.JsonPrettyPrinter", "goog.format.JsonPrettyPrinter.HtmlDelimiters", "goog.format.JsonPrettyPrinter.TextDelimiters"], ["goog.json", "goog.json.Serializer", "goog.string", "goog.string.StringBuffer", "goog.string.format"]);
goog.addDependency("fs/entry.js", ["goog.fs.DirectoryEntry", "goog.fs.DirectoryEntry.Behavior", "goog.fs.Entry", "goog.fs.FileEntry"], ["goog.array", "goog.async.Deferred", "goog.fs.Error", "goog.fs.FileWriter", "goog.functions", "goog.string"]);
goog.addDependency("fs/error.js", ["goog.fs.Error", "goog.fs.Error.ErrorCode"], ["goog.debug.Error", "goog.string"]);
goog.addDependency("fs/filereader.js", ["goog.fs.FileReader", "goog.fs.FileReader.EventType", "goog.fs.FileReader.ReadyState"], ["goog.async.Deferred", "goog.events.Event", "goog.events.EventTarget", "goog.fs.Error", "goog.fs.ProgressEvent"]);
goog.addDependency("fs/filesaver.js", ["goog.fs.FileSaver", "goog.fs.FileSaver.EventType", "goog.fs.FileSaver.ProgressEvent", "goog.fs.FileSaver.ReadyState"], ["goog.events.Event", "goog.events.EventTarget", "goog.fs.Error", "goog.fs.ProgressEvent"]);
goog.addDependency("fs/filesystem.js", ["goog.fs.FileSystem"], ["goog.fs.DirectoryEntry"]);
goog.addDependency("fs/filewriter.js", ["goog.fs.FileWriter"], ["goog.fs.Error", "goog.fs.FileSaver"]);
goog.addDependency("fs/fs.js", ["goog.fs"], ["goog.array", "goog.async.Deferred", "goog.fs.Error", "goog.fs.FileReader", "goog.fs.FileSystem", "goog.userAgent"]);
goog.addDependency("fs/progressevent.js", ["goog.fs.ProgressEvent"], ["goog.events.Event"]);
goog.addDependency("functions/functions.js", ["goog.functions"], []);
goog.addDependency("fx/abstractdragdrop.js", ["goog.fx.AbstractDragDrop", "goog.fx.AbstractDragDrop.EventType", "goog.fx.DragDropEvent", "goog.fx.DragDropItem"], ["goog.dom", "goog.dom.classes", "goog.events", "goog.events.Event", "goog.events.EventHandler", "goog.events.EventTarget", "goog.events.EventType", "goog.fx.Dragger", "goog.fx.Dragger.EventType", "goog.math.Box", "goog.math.Coordinate", "goog.style"]);
goog.addDependency("fx/anim/anim.js", ["goog.fx.anim", "goog.fx.anim.Animated"], ["goog.async.AnimationDelay", "goog.async.Delay", "goog.object"]);
goog.addDependency("fx/animation.js", ["goog.fx.Animation", "goog.fx.Animation.EventType", "goog.fx.Animation.State", "goog.fx.AnimationEvent"], ["goog.array", "goog.events.Event", "goog.fx.Transition", "goog.fx.Transition.EventType", "goog.fx.TransitionBase.State", "goog.fx.anim", "goog.fx.anim.Animated"]);
goog.addDependency("fx/animationqueue.js", ["goog.fx.AnimationParallelQueue", "goog.fx.AnimationQueue", "goog.fx.AnimationSerialQueue"], ["goog.array", "goog.asserts", "goog.events.EventHandler", "goog.fx.Transition.EventType", "goog.fx.TransitionBase", "goog.fx.TransitionBase.State"]);
goog.addDependency("fx/css3/fx.js", ["goog.fx.css3"], ["goog.fx.css3.Transition"]);
goog.addDependency("fx/css3/transition.js", ["goog.fx.css3.Transition"], ["goog.Timer", "goog.fx.TransitionBase", "goog.style", "goog.style.transition"]);
goog.addDependency("fx/cssspriteanimation.js", ["goog.fx.CssSpriteAnimation"], ["goog.fx.Animation"]);
goog.addDependency("fx/dom.js", ["goog.fx.dom", "goog.fx.dom.BgColorTransform", "goog.fx.dom.ColorTransform", "goog.fx.dom.Fade", "goog.fx.dom.FadeIn", "goog.fx.dom.FadeInAndShow", "goog.fx.dom.FadeOut", "goog.fx.dom.FadeOutAndHide", "goog.fx.dom.PredefinedEffect", "goog.fx.dom.Resize", "goog.fx.dom.ResizeHeight", "goog.fx.dom.ResizeWidth", "goog.fx.dom.Scroll", "goog.fx.dom.Slide", "goog.fx.dom.SlideFrom", "goog.fx.dom.Swipe"], ["goog.color", "goog.events", "goog.fx.Animation", "goog.fx.Transition.EventType", 
"goog.style", "goog.style.bidi"]);
goog.addDependency("fx/dragdrop.js", ["goog.fx.DragDrop"], ["goog.fx.AbstractDragDrop", "goog.fx.DragDropItem"]);
goog.addDependency("fx/dragdropgroup.js", ["goog.fx.DragDropGroup"], ["goog.dom", "goog.fx.AbstractDragDrop", "goog.fx.DragDropItem"]);
goog.addDependency("fx/dragger.js", ["goog.fx.DragEvent", "goog.fx.Dragger", "goog.fx.Dragger.EventType"], ["goog.dom", "goog.events", "goog.events.Event", "goog.events.EventHandler", "goog.events.EventTarget", "goog.events.EventType", "goog.math.Coordinate", "goog.math.Rect", "goog.style", "goog.style.bidi", "goog.userAgent"]);
goog.addDependency("fx/draglistgroup.js", ["goog.fx.DragListDirection", "goog.fx.DragListGroup", "goog.fx.DragListGroup.EventType", "goog.fx.DragListGroupEvent"], ["goog.asserts", "goog.dom", "goog.dom.NodeType", "goog.dom.classes", "goog.events.Event", "goog.events.EventHandler", "goog.events.EventTarget", "goog.events.EventType", "goog.fx.Dragger", "goog.fx.Dragger.EventType", "goog.math.Coordinate", "goog.style"]);
goog.addDependency("fx/dragscrollsupport.js", ["goog.fx.DragScrollSupport"], ["goog.Disposable", "goog.Timer", "goog.dom", "goog.events.EventHandler", "goog.events.EventType", "goog.math.Coordinate", "goog.style"]);
goog.addDependency("fx/easing.js", ["goog.fx.easing"], []);
goog.addDependency("fx/fx.js", ["goog.fx"], ["goog.asserts", "goog.fx.Animation", "goog.fx.Animation.EventType", "goog.fx.Animation.State", "goog.fx.AnimationEvent", "goog.fx.Transition.EventType", "goog.fx.easing"]);
goog.addDependency("fx/transition.js", ["goog.fx.Transition", "goog.fx.Transition.EventType"], []);
goog.addDependency("fx/transitionbase.js", ["goog.fx.TransitionBase", "goog.fx.TransitionBase.State"], ["goog.events.EventTarget", "goog.fx.Transition", "goog.fx.Transition.EventType"]);
goog.addDependency("gears/basestore.js", ["goog.gears.BaseStore", "goog.gears.BaseStore.SchemaType"], ["goog.Disposable"]);
goog.addDependency("gears/database.js", ["goog.gears.Database", "goog.gears.Database.EventType", "goog.gears.Database.TransactionEvent"], ["goog.array", "goog.debug", "goog.debug.Logger", "goog.events.Event", "goog.events.EventTarget", "goog.gears", "goog.json"]);
goog.addDependency("gears/gears.js", ["goog.gears"], ["goog.string"]);
goog.addDependency("gears/httprequest.js", ["goog.gears.HttpRequest"], ["goog.Timer", "goog.gears", "goog.net.WrapperXmlHttpFactory", "goog.net.XmlHttp"]);
goog.addDependency("gears/loggerclient.js", ["goog.gears.LoggerClient"], ["goog.Disposable", "goog.debug", "goog.debug.Logger"]);
goog.addDependency("gears/loggerserver.js", ["goog.gears.LoggerServer"], ["goog.Disposable", "goog.debug.Logger", "goog.debug.Logger.Level", "goog.gears.Worker.EventType"]);
goog.addDependency("gears/logstore.js", ["goog.gears.LogStore", "goog.gears.LogStore.Query"], ["goog.async.Delay", "goog.debug.LogManager", "goog.debug.LogRecord", "goog.debug.Logger", "goog.debug.Logger.Level", "goog.gears.BaseStore", "goog.gears.BaseStore.SchemaType", "goog.json"]);
goog.addDependency("gears/managedresourcestore.js", ["goog.gears.ManagedResourceStore", "goog.gears.ManagedResourceStore.EventType", "goog.gears.ManagedResourceStore.UpdateStatus", "goog.gears.ManagedResourceStoreEvent"], ["goog.debug.Logger", "goog.events.Event", "goog.events.EventTarget", "goog.gears", "goog.string"]);
goog.addDependency("gears/multipartformdata.js", ["goog.gears.MultipartFormData"], ["goog.asserts", "goog.gears", "goog.string"]);
goog.addDependency("gears/statustype.js", ["goog.gears.StatusType"], []);
goog.addDependency("gears/urlcapture.js", ["goog.gears.UrlCapture", "goog.gears.UrlCapture.Event", "goog.gears.UrlCapture.EventType"], ["goog.Uri", "goog.debug.Logger", "goog.events.Event", "goog.events.EventTarget", "goog.gears"]);
goog.addDependency("gears/worker.js", ["goog.gears.Worker", "goog.gears.Worker.EventType", "goog.gears.WorkerEvent"], ["goog.events.Event", "goog.events.EventTarget"]);
goog.addDependency("gears/workerchannel.js", ["goog.gears.WorkerChannel"], ["goog.Disposable", "goog.debug", "goog.debug.Logger", "goog.events", "goog.gears.Worker", "goog.gears.Worker.EventType", "goog.gears.WorkerEvent", "goog.json", "goog.messaging.AbstractChannel"]);
goog.addDependency("gears/workerpool.js", ["goog.gears.WorkerPool", "goog.gears.WorkerPool.Event", "goog.gears.WorkerPool.EventType"], ["goog.events.Event", "goog.events.EventTarget", "goog.gears", "goog.gears.Worker"]);
goog.addDependency("graphics/abstractgraphics.js", ["goog.graphics.AbstractGraphics"], ["goog.dom", "goog.graphics.Path", "goog.math.Coordinate", "goog.math.Size", "goog.style", "goog.ui.Component"]);
goog.addDependency("graphics/affinetransform.js", ["goog.graphics.AffineTransform"], ["goog.math"]);
goog.addDependency("graphics/canvaselement.js", ["goog.graphics.CanvasEllipseElement", "goog.graphics.CanvasGroupElement", "goog.graphics.CanvasImageElement", "goog.graphics.CanvasPathElement", "goog.graphics.CanvasRectElement", "goog.graphics.CanvasTextElement"], ["goog.array", "goog.dom", "goog.dom.TagName", "goog.graphics.EllipseElement", "goog.graphics.GroupElement", "goog.graphics.ImageElement", "goog.graphics.Path", "goog.graphics.PathElement", "goog.graphics.RectElement", "goog.graphics.TextElement", 
"goog.math", "goog.string"]);
goog.addDependency("graphics/canvasgraphics.js", ["goog.graphics.CanvasGraphics"], ["goog.events.EventType", "goog.graphics.AbstractGraphics", "goog.graphics.CanvasEllipseElement", "goog.graphics.CanvasGroupElement", "goog.graphics.CanvasImageElement", "goog.graphics.CanvasPathElement", "goog.graphics.CanvasRectElement", "goog.graphics.CanvasTextElement", "goog.graphics.SolidFill", "goog.math.Size", "goog.style"]);
goog.addDependency("graphics/element.js", ["goog.graphics.Element"], ["goog.events", "goog.events.EventTarget", "goog.events.Listenable", "goog.graphics.AffineTransform", "goog.math"]);
goog.addDependency("graphics/ellipseelement.js", ["goog.graphics.EllipseElement"], ["goog.graphics.StrokeAndFillElement"]);
goog.addDependency("graphics/ext/coordinates.js", ["goog.graphics.ext.coordinates"], ["goog.string"]);
goog.addDependency("graphics/ext/element.js", ["goog.graphics.ext.Element"], ["goog.events", "goog.events.EventTarget", "goog.functions", "goog.graphics", "goog.graphics.ext.coordinates"]);
goog.addDependency("graphics/ext/ellipse.js", ["goog.graphics.ext.Ellipse"], ["goog.graphics.ext.StrokeAndFillElement"]);
goog.addDependency("graphics/ext/ext.js", ["goog.graphics.ext"], ["goog.graphics.ext.Ellipse", "goog.graphics.ext.Graphics", "goog.graphics.ext.Group", "goog.graphics.ext.Image", "goog.graphics.ext.Rectangle", "goog.graphics.ext.Shape", "goog.graphics.ext.coordinates"]);
goog.addDependency("graphics/ext/graphics.js", ["goog.graphics.ext.Graphics"], ["goog.events.EventType", "goog.graphics.ext.Group"]);
goog.addDependency("graphics/ext/group.js", ["goog.graphics.ext.Group"], ["goog.graphics.ext.Element"]);
goog.addDependency("graphics/ext/image.js", ["goog.graphics.ext.Image"], ["goog.graphics.ext.Element"]);
goog.addDependency("graphics/ext/path.js", ["goog.graphics.ext.Path"], ["goog.graphics.AffineTransform", "goog.graphics.Path", "goog.math", "goog.math.Rect"]);
goog.addDependency("graphics/ext/rectangle.js", ["goog.graphics.ext.Rectangle"], ["goog.graphics.ext.StrokeAndFillElement"]);
goog.addDependency("graphics/ext/shape.js", ["goog.graphics.ext.Shape"], ["goog.graphics.ext.Path", "goog.graphics.ext.StrokeAndFillElement", "goog.math.Rect"]);
goog.addDependency("graphics/ext/strokeandfillelement.js", ["goog.graphics.ext.StrokeAndFillElement"], ["goog.graphics.ext.Element"]);
goog.addDependency("graphics/fill.js", ["goog.graphics.Fill"], []);
goog.addDependency("graphics/font.js", ["goog.graphics.Font"], []);
goog.addDependency("graphics/graphics.js", ["goog.graphics"], ["goog.graphics.CanvasGraphics", "goog.graphics.SvgGraphics", "goog.graphics.VmlGraphics", "goog.userAgent"]);
goog.addDependency("graphics/groupelement.js", ["goog.graphics.GroupElement"], ["goog.graphics.Element"]);
goog.addDependency("graphics/imageelement.js", ["goog.graphics.ImageElement"], ["goog.graphics.Element"]);
goog.addDependency("graphics/lineargradient.js", ["goog.graphics.LinearGradient"], ["goog.asserts", "goog.graphics.Fill"]);
goog.addDependency("graphics/path.js", ["goog.graphics.Path", "goog.graphics.Path.Segment"], ["goog.array", "goog.math"]);
goog.addDependency("graphics/pathelement.js", ["goog.graphics.PathElement"], ["goog.graphics.StrokeAndFillElement"]);
goog.addDependency("graphics/paths.js", ["goog.graphics.paths"], ["goog.graphics.Path", "goog.math.Coordinate"]);
goog.addDependency("graphics/rectelement.js", ["goog.graphics.RectElement"], ["goog.graphics.StrokeAndFillElement"]);
goog.addDependency("graphics/solidfill.js", ["goog.graphics.SolidFill"], ["goog.graphics.Fill"]);
goog.addDependency("graphics/stroke.js", ["goog.graphics.Stroke"], []);
goog.addDependency("graphics/strokeandfillelement.js", ["goog.graphics.StrokeAndFillElement"], ["goog.graphics.Element"]);
goog.addDependency("graphics/svgelement.js", ["goog.graphics.SvgEllipseElement", "goog.graphics.SvgGroupElement", "goog.graphics.SvgImageElement", "goog.graphics.SvgPathElement", "goog.graphics.SvgRectElement", "goog.graphics.SvgTextElement"], ["goog.dom", "goog.graphics.EllipseElement", "goog.graphics.GroupElement", "goog.graphics.ImageElement", "goog.graphics.PathElement", "goog.graphics.RectElement", "goog.graphics.TextElement"]);
goog.addDependency("graphics/svggraphics.js", ["goog.graphics.SvgGraphics"], ["goog.Timer", "goog.dom", "goog.events.EventHandler", "goog.events.EventType", "goog.graphics.AbstractGraphics", "goog.graphics.LinearGradient", "goog.graphics.Path", "goog.graphics.SolidFill", "goog.graphics.Stroke", "goog.graphics.SvgEllipseElement", "goog.graphics.SvgGroupElement", "goog.graphics.SvgImageElement", "goog.graphics.SvgPathElement", "goog.graphics.SvgRectElement", "goog.graphics.SvgTextElement", "goog.math", 
"goog.math.Size", "goog.style", "goog.userAgent"]);
goog.addDependency("graphics/textelement.js", ["goog.graphics.TextElement"], ["goog.graphics.StrokeAndFillElement"]);
goog.addDependency("graphics/vmlelement.js", ["goog.graphics.VmlEllipseElement", "goog.graphics.VmlGroupElement", "goog.graphics.VmlImageElement", "goog.graphics.VmlPathElement", "goog.graphics.VmlRectElement", "goog.graphics.VmlTextElement"], ["goog.dom", "goog.graphics.EllipseElement", "goog.graphics.GroupElement", "goog.graphics.ImageElement", "goog.graphics.PathElement", "goog.graphics.RectElement", "goog.graphics.TextElement"]);
goog.addDependency("graphics/vmlgraphics.js", ["goog.graphics.VmlGraphics"], ["goog.array", "goog.events", "goog.events.EventHandler", "goog.events.EventType", "goog.graphics.AbstractGraphics", "goog.graphics.LinearGradient", "goog.graphics.Path", "goog.graphics.SolidFill", "goog.graphics.VmlEllipseElement", "goog.graphics.VmlGroupElement", "goog.graphics.VmlImageElement", "goog.graphics.VmlPathElement", "goog.graphics.VmlRectElement", "goog.graphics.VmlTextElement", "goog.math", "goog.math.Size", 
"goog.string", "goog.style"]);
goog.addDependency("history/event.js", ["goog.history.Event"], ["goog.events.Event", "goog.history.EventType"]);
goog.addDependency("history/eventtype.js", ["goog.history.EventType"], []);
goog.addDependency("history/history.js", ["goog.History", "goog.History.Event", "goog.History.EventType"], ["goog.Timer", "goog.dom", "goog.events.EventHandler", "goog.events.EventTarget", "goog.events.EventType", "goog.history.Event", "goog.history.EventType", "goog.memoize", "goog.string", "goog.userAgent"]);
goog.addDependency("history/history_test.js", ["goog.HistoryTest"], ["goog.History", "goog.testing.jsunit", "goog.userAgent"]);
goog.addDependency("history/html5history.js", ["goog.history.Html5History", "goog.history.Html5History.TokenTransformer"], ["goog.asserts", "goog.events", "goog.events.EventTarget", "goog.events.EventType", "goog.history.Event", "goog.history.EventType"]);
goog.addDependency("i18n/bidi.js", ["goog.i18n.bidi"], []);
goog.addDependency("i18n/bidiformatter.js", ["goog.i18n.BidiFormatter"], ["goog.i18n.bidi", "goog.string"]);
goog.addDependency("i18n/charlistdecompressor.js", ["goog.i18n.CharListDecompressor"], ["goog.array", "goog.i18n.uChar"]);
goog.addDependency("i18n/charpickerdata.js", ["goog.i18n.CharPickerData"], []);
goog.addDependency("i18n/collation.js", ["goog.i18n.collation"], []);
goog.addDependency("i18n/compactnumberformatsymbols.js", ["goog.i18n.CompactNumberFormatSymbols", "goog.i18n.CompactNumberFormatSymbols_af", "goog.i18n.CompactNumberFormatSymbols_af_ZA", "goog.i18n.CompactNumberFormatSymbols_am", "goog.i18n.CompactNumberFormatSymbols_am_ET", "goog.i18n.CompactNumberFormatSymbols_ar", "goog.i18n.CompactNumberFormatSymbols_ar_001", "goog.i18n.CompactNumberFormatSymbols_ar_EG", "goog.i18n.CompactNumberFormatSymbols_bg", "goog.i18n.CompactNumberFormatSymbols_bg_BG", 
"goog.i18n.CompactNumberFormatSymbols_bn", "goog.i18n.CompactNumberFormatSymbols_bn_BD", "goog.i18n.CompactNumberFormatSymbols_br", "goog.i18n.CompactNumberFormatSymbols_br_FR", "goog.i18n.CompactNumberFormatSymbols_ca", "goog.i18n.CompactNumberFormatSymbols_ca_AD", "goog.i18n.CompactNumberFormatSymbols_ca_ES", "goog.i18n.CompactNumberFormatSymbols_chr", "goog.i18n.CompactNumberFormatSymbols_chr_US", "goog.i18n.CompactNumberFormatSymbols_cs", "goog.i18n.CompactNumberFormatSymbols_cs_CZ", "goog.i18n.CompactNumberFormatSymbols_cy", 
"goog.i18n.CompactNumberFormatSymbols_cy_GB", "goog.i18n.CompactNumberFormatSymbols_da", "goog.i18n.CompactNumberFormatSymbols_da_DK", "goog.i18n.CompactNumberFormatSymbols_de", "goog.i18n.CompactNumberFormatSymbols_de_AT", "goog.i18n.CompactNumberFormatSymbols_de_BE", "goog.i18n.CompactNumberFormatSymbols_de_CH", "goog.i18n.CompactNumberFormatSymbols_de_DE", "goog.i18n.CompactNumberFormatSymbols_de_LU", "goog.i18n.CompactNumberFormatSymbols_el", "goog.i18n.CompactNumberFormatSymbols_el_GR", "goog.i18n.CompactNumberFormatSymbols_en", 
"goog.i18n.CompactNumberFormatSymbols_en_AS", "goog.i18n.CompactNumberFormatSymbols_en_AU", "goog.i18n.CompactNumberFormatSymbols_en_Dsrt_US", "goog.i18n.CompactNumberFormatSymbols_en_FM", "goog.i18n.CompactNumberFormatSymbols_en_GB", "goog.i18n.CompactNumberFormatSymbols_en_GU", "goog.i18n.CompactNumberFormatSymbols_en_IE", "goog.i18n.CompactNumberFormatSymbols_en_IN", "goog.i18n.CompactNumberFormatSymbols_en_MH", "goog.i18n.CompactNumberFormatSymbols_en_MP", "goog.i18n.CompactNumberFormatSymbols_en_PR", 
"goog.i18n.CompactNumberFormatSymbols_en_PW", "goog.i18n.CompactNumberFormatSymbols_en_SG", "goog.i18n.CompactNumberFormatSymbols_en_TC", "goog.i18n.CompactNumberFormatSymbols_en_UM", "goog.i18n.CompactNumberFormatSymbols_en_US", "goog.i18n.CompactNumberFormatSymbols_en_VG", "goog.i18n.CompactNumberFormatSymbols_en_VI", "goog.i18n.CompactNumberFormatSymbols_en_ZA", "goog.i18n.CompactNumberFormatSymbols_es", "goog.i18n.CompactNumberFormatSymbols_es_419", "goog.i18n.CompactNumberFormatSymbols_es_EA", 
"goog.i18n.CompactNumberFormatSymbols_es_ES", "goog.i18n.CompactNumberFormatSymbols_es_IC", "goog.i18n.CompactNumberFormatSymbols_et", "goog.i18n.CompactNumberFormatSymbols_et_EE", "goog.i18n.CompactNumberFormatSymbols_eu", "goog.i18n.CompactNumberFormatSymbols_eu_ES", "goog.i18n.CompactNumberFormatSymbols_fa", "goog.i18n.CompactNumberFormatSymbols_fa_IR", "goog.i18n.CompactNumberFormatSymbols_fi", "goog.i18n.CompactNumberFormatSymbols_fi_FI", "goog.i18n.CompactNumberFormatSymbols_fil", "goog.i18n.CompactNumberFormatSymbols_fil_PH", 
"goog.i18n.CompactNumberFormatSymbols_fr", "goog.i18n.CompactNumberFormatSymbols_fr_BL", "goog.i18n.CompactNumberFormatSymbols_fr_CA", "goog.i18n.CompactNumberFormatSymbols_fr_FR", "goog.i18n.CompactNumberFormatSymbols_fr_GF", "goog.i18n.CompactNumberFormatSymbols_fr_GP", "goog.i18n.CompactNumberFormatSymbols_fr_MC", "goog.i18n.CompactNumberFormatSymbols_fr_MF", "goog.i18n.CompactNumberFormatSymbols_fr_MQ", "goog.i18n.CompactNumberFormatSymbols_fr_RE", "goog.i18n.CompactNumberFormatSymbols_fr_YT", 
"goog.i18n.CompactNumberFormatSymbols_gl", "goog.i18n.CompactNumberFormatSymbols_gl_ES", "goog.i18n.CompactNumberFormatSymbols_gsw", "goog.i18n.CompactNumberFormatSymbols_gsw_CH", "goog.i18n.CompactNumberFormatSymbols_gu", "goog.i18n.CompactNumberFormatSymbols_gu_IN", "goog.i18n.CompactNumberFormatSymbols_haw", "goog.i18n.CompactNumberFormatSymbols_haw_US", "goog.i18n.CompactNumberFormatSymbols_he", "goog.i18n.CompactNumberFormatSymbols_he_IL", "goog.i18n.CompactNumberFormatSymbols_hi", "goog.i18n.CompactNumberFormatSymbols_hi_IN", 
"goog.i18n.CompactNumberFormatSymbols_hr", "goog.i18n.CompactNumberFormatSymbols_hr_HR", "goog.i18n.CompactNumberFormatSymbols_hu", "goog.i18n.CompactNumberFormatSymbols_hu_HU", "goog.i18n.CompactNumberFormatSymbols_id", "goog.i18n.CompactNumberFormatSymbols_id_ID", "goog.i18n.CompactNumberFormatSymbols_in", "goog.i18n.CompactNumberFormatSymbols_is", "goog.i18n.CompactNumberFormatSymbols_is_IS", "goog.i18n.CompactNumberFormatSymbols_it", "goog.i18n.CompactNumberFormatSymbols_it_IT", "goog.i18n.CompactNumberFormatSymbols_it_SM", 
"goog.i18n.CompactNumberFormatSymbols_iw", "goog.i18n.CompactNumberFormatSymbols_ja", "goog.i18n.CompactNumberFormatSymbols_ja_JP", "goog.i18n.CompactNumberFormatSymbols_kn", "goog.i18n.CompactNumberFormatSymbols_kn_IN", "goog.i18n.CompactNumberFormatSymbols_ko", "goog.i18n.CompactNumberFormatSymbols_ko_KR", "goog.i18n.CompactNumberFormatSymbols_ln", "goog.i18n.CompactNumberFormatSymbols_ln_CD", "goog.i18n.CompactNumberFormatSymbols_lt", "goog.i18n.CompactNumberFormatSymbols_lt_LT", "goog.i18n.CompactNumberFormatSymbols_lv", 
"goog.i18n.CompactNumberFormatSymbols_lv_LV", "goog.i18n.CompactNumberFormatSymbols_ml", "goog.i18n.CompactNumberFormatSymbols_ml_IN", "goog.i18n.CompactNumberFormatSymbols_mr", "goog.i18n.CompactNumberFormatSymbols_mr_IN", "goog.i18n.CompactNumberFormatSymbols_ms", "goog.i18n.CompactNumberFormatSymbols_ms_MY", "goog.i18n.CompactNumberFormatSymbols_mt", "goog.i18n.CompactNumberFormatSymbols_mt_MT", "goog.i18n.CompactNumberFormatSymbols_nb", "goog.i18n.CompactNumberFormatSymbols_nb_NO", "goog.i18n.CompactNumberFormatSymbols_nl", 
"goog.i18n.CompactNumberFormatSymbols_nl_CW", "goog.i18n.CompactNumberFormatSymbols_nl_NL", "goog.i18n.CompactNumberFormatSymbols_nl_SX", "goog.i18n.CompactNumberFormatSymbols_no", "goog.i18n.CompactNumberFormatSymbols_or", "goog.i18n.CompactNumberFormatSymbols_or_IN", "goog.i18n.CompactNumberFormatSymbols_pl", "goog.i18n.CompactNumberFormatSymbols_pl_PL", "goog.i18n.CompactNumberFormatSymbols_pt", "goog.i18n.CompactNumberFormatSymbols_pt_BR", "goog.i18n.CompactNumberFormatSymbols_pt_PT", "goog.i18n.CompactNumberFormatSymbols_ro", 
"goog.i18n.CompactNumberFormatSymbols_ro_RO", "goog.i18n.CompactNumberFormatSymbols_ru", "goog.i18n.CompactNumberFormatSymbols_ru_RU", "goog.i18n.CompactNumberFormatSymbols_sk", "goog.i18n.CompactNumberFormatSymbols_sk_SK", "goog.i18n.CompactNumberFormatSymbols_sl", "goog.i18n.CompactNumberFormatSymbols_sl_SI", "goog.i18n.CompactNumberFormatSymbols_sq", "goog.i18n.CompactNumberFormatSymbols_sq_AL", "goog.i18n.CompactNumberFormatSymbols_sr", "goog.i18n.CompactNumberFormatSymbols_sr_Cyrl_RS", "goog.i18n.CompactNumberFormatSymbols_sr_Latn_RS", 
"goog.i18n.CompactNumberFormatSymbols_sv", "goog.i18n.CompactNumberFormatSymbols_sv_SE", "goog.i18n.CompactNumberFormatSymbols_sw", "goog.i18n.CompactNumberFormatSymbols_sw_TZ", "goog.i18n.CompactNumberFormatSymbols_ta", "goog.i18n.CompactNumberFormatSymbols_ta_IN", "goog.i18n.CompactNumberFormatSymbols_te", "goog.i18n.CompactNumberFormatSymbols_te_IN", "goog.i18n.CompactNumberFormatSymbols_th", "goog.i18n.CompactNumberFormatSymbols_th_TH", "goog.i18n.CompactNumberFormatSymbols_tl", "goog.i18n.CompactNumberFormatSymbols_tr", 
"goog.i18n.CompactNumberFormatSymbols_tr_TR", "goog.i18n.CompactNumberFormatSymbols_uk", "goog.i18n.CompactNumberFormatSymbols_uk_UA", "goog.i18n.CompactNumberFormatSymbols_ur", "goog.i18n.CompactNumberFormatSymbols_ur_PK", "goog.i18n.CompactNumberFormatSymbols_vi", "goog.i18n.CompactNumberFormatSymbols_vi_VN", "goog.i18n.CompactNumberFormatSymbols_zh", "goog.i18n.CompactNumberFormatSymbols_zh_CN", "goog.i18n.CompactNumberFormatSymbols_zh_HK", "goog.i18n.CompactNumberFormatSymbols_zh_Hans_CN", "goog.i18n.CompactNumberFormatSymbols_zh_TW", 
"goog.i18n.CompactNumberFormatSymbols_zu", "goog.i18n.CompactNumberFormatSymbols_zu_ZA"], []);
goog.addDependency("i18n/compactnumberformatsymbols_ext.js", ["goog.i18n.CompactNumberFormatSymbolsExt", "goog.i18n.CompactNumberFormatSymbols_aa", "goog.i18n.CompactNumberFormatSymbols_aa_DJ", "goog.i18n.CompactNumberFormatSymbols_aa_ER", "goog.i18n.CompactNumberFormatSymbols_aa_ET", "goog.i18n.CompactNumberFormatSymbols_af_NA", "goog.i18n.CompactNumberFormatSymbols_agq", "goog.i18n.CompactNumberFormatSymbols_agq_CM", "goog.i18n.CompactNumberFormatSymbols_ak", "goog.i18n.CompactNumberFormatSymbols_ak_GH", 
"goog.i18n.CompactNumberFormatSymbols_ar_AE", "goog.i18n.CompactNumberFormatSymbols_ar_BH", "goog.i18n.CompactNumberFormatSymbols_ar_DJ", "goog.i18n.CompactNumberFormatSymbols_ar_DZ", "goog.i18n.CompactNumberFormatSymbols_ar_EH", "goog.i18n.CompactNumberFormatSymbols_ar_ER", "goog.i18n.CompactNumberFormatSymbols_ar_IL", "goog.i18n.CompactNumberFormatSymbols_ar_IQ", "goog.i18n.CompactNumberFormatSymbols_ar_JO", "goog.i18n.CompactNumberFormatSymbols_ar_KM", "goog.i18n.CompactNumberFormatSymbols_ar_KW", 
"goog.i18n.CompactNumberFormatSymbols_ar_LB", "goog.i18n.CompactNumberFormatSymbols_ar_LY", "goog.i18n.CompactNumberFormatSymbols_ar_MA", "goog.i18n.CompactNumberFormatSymbols_ar_MR", "goog.i18n.CompactNumberFormatSymbols_ar_OM", "goog.i18n.CompactNumberFormatSymbols_ar_PS", "goog.i18n.CompactNumberFormatSymbols_ar_QA", "goog.i18n.CompactNumberFormatSymbols_ar_SA", "goog.i18n.CompactNumberFormatSymbols_ar_SD", "goog.i18n.CompactNumberFormatSymbols_ar_SO", "goog.i18n.CompactNumberFormatSymbols_ar_SY", 
"goog.i18n.CompactNumberFormatSymbols_ar_TD", "goog.i18n.CompactNumberFormatSymbols_ar_TN", "goog.i18n.CompactNumberFormatSymbols_ar_YE", "goog.i18n.CompactNumberFormatSymbols_as", "goog.i18n.CompactNumberFormatSymbols_as_IN", "goog.i18n.CompactNumberFormatSymbols_asa", "goog.i18n.CompactNumberFormatSymbols_asa_TZ", "goog.i18n.CompactNumberFormatSymbols_ast", "goog.i18n.CompactNumberFormatSymbols_ast_ES", "goog.i18n.CompactNumberFormatSymbols_az", "goog.i18n.CompactNumberFormatSymbols_az_Cyrl", "goog.i18n.CompactNumberFormatSymbols_az_Cyrl_AZ", 
"goog.i18n.CompactNumberFormatSymbols_az_Latn", "goog.i18n.CompactNumberFormatSymbols_az_Latn_AZ", "goog.i18n.CompactNumberFormatSymbols_bas", "goog.i18n.CompactNumberFormatSymbols_bas_CM", "goog.i18n.CompactNumberFormatSymbols_be", "goog.i18n.CompactNumberFormatSymbols_be_BY", "goog.i18n.CompactNumberFormatSymbols_bem", "goog.i18n.CompactNumberFormatSymbols_bem_ZM", "goog.i18n.CompactNumberFormatSymbols_bez", "goog.i18n.CompactNumberFormatSymbols_bez_TZ", "goog.i18n.CompactNumberFormatSymbols_bm", 
"goog.i18n.CompactNumberFormatSymbols_bm_ML", "goog.i18n.CompactNumberFormatSymbols_bn_IN", "goog.i18n.CompactNumberFormatSymbols_bo", "goog.i18n.CompactNumberFormatSymbols_bo_CN", "goog.i18n.CompactNumberFormatSymbols_bo_IN", "goog.i18n.CompactNumberFormatSymbols_brx", "goog.i18n.CompactNumberFormatSymbols_brx_IN", "goog.i18n.CompactNumberFormatSymbols_bs", "goog.i18n.CompactNumberFormatSymbols_bs_Cyrl", "goog.i18n.CompactNumberFormatSymbols_bs_Cyrl_BA", "goog.i18n.CompactNumberFormatSymbols_bs_Latn", 
"goog.i18n.CompactNumberFormatSymbols_bs_Latn_BA", "goog.i18n.CompactNumberFormatSymbols_byn", "goog.i18n.CompactNumberFormatSymbols_byn_ER", "goog.i18n.CompactNumberFormatSymbols_cgg", "goog.i18n.CompactNumberFormatSymbols_cgg_UG", "goog.i18n.CompactNumberFormatSymbols_ckb", "goog.i18n.CompactNumberFormatSymbols_ckb_Arab", "goog.i18n.CompactNumberFormatSymbols_ckb_Arab_IQ", "goog.i18n.CompactNumberFormatSymbols_ckb_Arab_IR", "goog.i18n.CompactNumberFormatSymbols_ckb_IQ", "goog.i18n.CompactNumberFormatSymbols_ckb_IR", 
"goog.i18n.CompactNumberFormatSymbols_ckb_Latn", "goog.i18n.CompactNumberFormatSymbols_ckb_Latn_IQ", "goog.i18n.CompactNumberFormatSymbols_dav", "goog.i18n.CompactNumberFormatSymbols_dav_KE", "goog.i18n.CompactNumberFormatSymbols_de_LI", "goog.i18n.CompactNumberFormatSymbols_dje", "goog.i18n.CompactNumberFormatSymbols_dje_NE", "goog.i18n.CompactNumberFormatSymbols_dua", "goog.i18n.CompactNumberFormatSymbols_dua_CM", "goog.i18n.CompactNumberFormatSymbols_dyo", "goog.i18n.CompactNumberFormatSymbols_dyo_SN", 
"goog.i18n.CompactNumberFormatSymbols_dz", "goog.i18n.CompactNumberFormatSymbols_dz_BT", "goog.i18n.CompactNumberFormatSymbols_ebu", "goog.i18n.CompactNumberFormatSymbols_ebu_KE", "goog.i18n.CompactNumberFormatSymbols_ee", "goog.i18n.CompactNumberFormatSymbols_ee_GH", "goog.i18n.CompactNumberFormatSymbols_ee_TG", "goog.i18n.CompactNumberFormatSymbols_el_CY", "goog.i18n.CompactNumberFormatSymbols_en_150", "goog.i18n.CompactNumberFormatSymbols_en_AG", "goog.i18n.CompactNumberFormatSymbols_en_BB", "goog.i18n.CompactNumberFormatSymbols_en_BE", 
"goog.i18n.CompactNumberFormatSymbols_en_BM", "goog.i18n.CompactNumberFormatSymbols_en_BS", "goog.i18n.CompactNumberFormatSymbols_en_BW", "goog.i18n.CompactNumberFormatSymbols_en_BZ", "goog.i18n.CompactNumberFormatSymbols_en_CA", "goog.i18n.CompactNumberFormatSymbols_en_CM", "goog.i18n.CompactNumberFormatSymbols_en_DM", "goog.i18n.CompactNumberFormatSymbols_en_Dsrt", "goog.i18n.CompactNumberFormatSymbols_en_FJ", "goog.i18n.CompactNumberFormatSymbols_en_GD", "goog.i18n.CompactNumberFormatSymbols_en_GG", 
"goog.i18n.CompactNumberFormatSymbols_en_GH", "goog.i18n.CompactNumberFormatSymbols_en_GI", "goog.i18n.CompactNumberFormatSymbols_en_GM", "goog.i18n.CompactNumberFormatSymbols_en_GY", "goog.i18n.CompactNumberFormatSymbols_en_HK", "goog.i18n.CompactNumberFormatSymbols_en_IM", "goog.i18n.CompactNumberFormatSymbols_en_JE", "goog.i18n.CompactNumberFormatSymbols_en_JM", "goog.i18n.CompactNumberFormatSymbols_en_KE", "goog.i18n.CompactNumberFormatSymbols_en_KI", "goog.i18n.CompactNumberFormatSymbols_en_KN", 
"goog.i18n.CompactNumberFormatSymbols_en_KY", "goog.i18n.CompactNumberFormatSymbols_en_LC", "goog.i18n.CompactNumberFormatSymbols_en_LR", "goog.i18n.CompactNumberFormatSymbols_en_LS", "goog.i18n.CompactNumberFormatSymbols_en_MG", "goog.i18n.CompactNumberFormatSymbols_en_MT", "goog.i18n.CompactNumberFormatSymbols_en_MU", "goog.i18n.CompactNumberFormatSymbols_en_MW", "goog.i18n.CompactNumberFormatSymbols_en_NA", "goog.i18n.CompactNumberFormatSymbols_en_NG", "goog.i18n.CompactNumberFormatSymbols_en_NZ", 
"goog.i18n.CompactNumberFormatSymbols_en_PG", "goog.i18n.CompactNumberFormatSymbols_en_PH", "goog.i18n.CompactNumberFormatSymbols_en_PK", "goog.i18n.CompactNumberFormatSymbols_en_SB", "goog.i18n.CompactNumberFormatSymbols_en_SC", "goog.i18n.CompactNumberFormatSymbols_en_SL", "goog.i18n.CompactNumberFormatSymbols_en_SS", "goog.i18n.CompactNumberFormatSymbols_en_SZ", "goog.i18n.CompactNumberFormatSymbols_en_TO", "goog.i18n.CompactNumberFormatSymbols_en_TT", "goog.i18n.CompactNumberFormatSymbols_en_TZ", 
"goog.i18n.CompactNumberFormatSymbols_en_UG", "goog.i18n.CompactNumberFormatSymbols_en_VC", "goog.i18n.CompactNumberFormatSymbols_en_VU", "goog.i18n.CompactNumberFormatSymbols_en_WS", "goog.i18n.CompactNumberFormatSymbols_en_ZM", "goog.i18n.CompactNumberFormatSymbols_en_ZW", "goog.i18n.CompactNumberFormatSymbols_eo", "goog.i18n.CompactNumberFormatSymbols_es_AR", "goog.i18n.CompactNumberFormatSymbols_es_BO", "goog.i18n.CompactNumberFormatSymbols_es_CL", "goog.i18n.CompactNumberFormatSymbols_es_CO", 
"goog.i18n.CompactNumberFormatSymbols_es_CR", "goog.i18n.CompactNumberFormatSymbols_es_CU", "goog.i18n.CompactNumberFormatSymbols_es_DO", "goog.i18n.CompactNumberFormatSymbols_es_EC", "goog.i18n.CompactNumberFormatSymbols_es_GQ", "goog.i18n.CompactNumberFormatSymbols_es_GT", "goog.i18n.CompactNumberFormatSymbols_es_HN", "goog.i18n.CompactNumberFormatSymbols_es_MX", "goog.i18n.CompactNumberFormatSymbols_es_NI", "goog.i18n.CompactNumberFormatSymbols_es_PA", "goog.i18n.CompactNumberFormatSymbols_es_PE", 
"goog.i18n.CompactNumberFormatSymbols_es_PH", "goog.i18n.CompactNumberFormatSymbols_es_PR", "goog.i18n.CompactNumberFormatSymbols_es_PY", "goog.i18n.CompactNumberFormatSymbols_es_SV", "goog.i18n.CompactNumberFormatSymbols_es_US", "goog.i18n.CompactNumberFormatSymbols_es_UY", "goog.i18n.CompactNumberFormatSymbols_es_VE", "goog.i18n.CompactNumberFormatSymbols_ewo", "goog.i18n.CompactNumberFormatSymbols_ewo_CM", "goog.i18n.CompactNumberFormatSymbols_fa_AF", "goog.i18n.CompactNumberFormatSymbols_ff", 
"goog.i18n.CompactNumberFormatSymbols_ff_SN", "goog.i18n.CompactNumberFormatSymbols_fo", "goog.i18n.CompactNumberFormatSymbols_fo_FO", "goog.i18n.CompactNumberFormatSymbols_fr_BE", "goog.i18n.CompactNumberFormatSymbols_fr_BF", "goog.i18n.CompactNumberFormatSymbols_fr_BI", "goog.i18n.CompactNumberFormatSymbols_fr_BJ", "goog.i18n.CompactNumberFormatSymbols_fr_CD", "goog.i18n.CompactNumberFormatSymbols_fr_CF", "goog.i18n.CompactNumberFormatSymbols_fr_CG", "goog.i18n.CompactNumberFormatSymbols_fr_CH", 
"goog.i18n.CompactNumberFormatSymbols_fr_CI", "goog.i18n.CompactNumberFormatSymbols_fr_CM", "goog.i18n.CompactNumberFormatSymbols_fr_DJ", "goog.i18n.CompactNumberFormatSymbols_fr_DZ", "goog.i18n.CompactNumberFormatSymbols_fr_GA", "goog.i18n.CompactNumberFormatSymbols_fr_GN", "goog.i18n.CompactNumberFormatSymbols_fr_GQ", "goog.i18n.CompactNumberFormatSymbols_fr_HT", "goog.i18n.CompactNumberFormatSymbols_fr_KM", "goog.i18n.CompactNumberFormatSymbols_fr_LU", "goog.i18n.CompactNumberFormatSymbols_fr_MA", 
"goog.i18n.CompactNumberFormatSymbols_fr_MG", "goog.i18n.CompactNumberFormatSymbols_fr_ML", "goog.i18n.CompactNumberFormatSymbols_fr_MR", "goog.i18n.CompactNumberFormatSymbols_fr_MU", "goog.i18n.CompactNumberFormatSymbols_fr_NC", "goog.i18n.CompactNumberFormatSymbols_fr_NE", "goog.i18n.CompactNumberFormatSymbols_fr_PF", "goog.i18n.CompactNumberFormatSymbols_fr_RW", "goog.i18n.CompactNumberFormatSymbols_fr_SC", "goog.i18n.CompactNumberFormatSymbols_fr_SN", "goog.i18n.CompactNumberFormatSymbols_fr_SY", 
"goog.i18n.CompactNumberFormatSymbols_fr_TD", "goog.i18n.CompactNumberFormatSymbols_fr_TG", "goog.i18n.CompactNumberFormatSymbols_fr_TN", "goog.i18n.CompactNumberFormatSymbols_fr_VU", "goog.i18n.CompactNumberFormatSymbols_fur", "goog.i18n.CompactNumberFormatSymbols_fur_IT", "goog.i18n.CompactNumberFormatSymbols_ga", "goog.i18n.CompactNumberFormatSymbols_ga_IE", "goog.i18n.CompactNumberFormatSymbols_gd", "goog.i18n.CompactNumberFormatSymbols_gd_GB", "goog.i18n.CompactNumberFormatSymbols_guz", "goog.i18n.CompactNumberFormatSymbols_guz_KE", 
"goog.i18n.CompactNumberFormatSymbols_gv", "goog.i18n.CompactNumberFormatSymbols_gv_GB", "goog.i18n.CompactNumberFormatSymbols_ha", "goog.i18n.CompactNumberFormatSymbols_ha_Latn", "goog.i18n.CompactNumberFormatSymbols_ha_Latn_GH", "goog.i18n.CompactNumberFormatSymbols_ha_Latn_NE", "goog.i18n.CompactNumberFormatSymbols_ha_Latn_NG", "goog.i18n.CompactNumberFormatSymbols_hr_BA", "goog.i18n.CompactNumberFormatSymbols_hy", "goog.i18n.CompactNumberFormatSymbols_hy_AM", "goog.i18n.CompactNumberFormatSymbols_ia", 
"goog.i18n.CompactNumberFormatSymbols_ig", "goog.i18n.CompactNumberFormatSymbols_ig_NG", "goog.i18n.CompactNumberFormatSymbols_ii", "goog.i18n.CompactNumberFormatSymbols_ii_CN", "goog.i18n.CompactNumberFormatSymbols_it_CH", "goog.i18n.CompactNumberFormatSymbols_jgo", "goog.i18n.CompactNumberFormatSymbols_jgo_CM", "goog.i18n.CompactNumberFormatSymbols_jmc", "goog.i18n.CompactNumberFormatSymbols_jmc_TZ", "goog.i18n.CompactNumberFormatSymbols_ka", "goog.i18n.CompactNumberFormatSymbols_ka_GE", "goog.i18n.CompactNumberFormatSymbols_kab", 
"goog.i18n.CompactNumberFormatSymbols_kab_DZ", "goog.i18n.CompactNumberFormatSymbols_kam", "goog.i18n.CompactNumberFormatSymbols_kam_KE", "goog.i18n.CompactNumberFormatSymbols_kde", "goog.i18n.CompactNumberFormatSymbols_kde_TZ", "goog.i18n.CompactNumberFormatSymbols_kea", "goog.i18n.CompactNumberFormatSymbols_kea_CV", "goog.i18n.CompactNumberFormatSymbols_khq", "goog.i18n.CompactNumberFormatSymbols_khq_ML", "goog.i18n.CompactNumberFormatSymbols_ki", "goog.i18n.CompactNumberFormatSymbols_ki_KE", "goog.i18n.CompactNumberFormatSymbols_kk", 
"goog.i18n.CompactNumberFormatSymbols_kk_Cyrl", "goog.i18n.CompactNumberFormatSymbols_kk_Cyrl_KZ", "goog.i18n.CompactNumberFormatSymbols_kkj", "goog.i18n.CompactNumberFormatSymbols_kkj_CM", "goog.i18n.CompactNumberFormatSymbols_kl", "goog.i18n.CompactNumberFormatSymbols_kl_GL", "goog.i18n.CompactNumberFormatSymbols_kln", "goog.i18n.CompactNumberFormatSymbols_kln_KE", "goog.i18n.CompactNumberFormatSymbols_km", "goog.i18n.CompactNumberFormatSymbols_km_KH", "goog.i18n.CompactNumberFormatSymbols_ko_KP", 
"goog.i18n.CompactNumberFormatSymbols_kok", "goog.i18n.CompactNumberFormatSymbols_kok_IN", "goog.i18n.CompactNumberFormatSymbols_ks", "goog.i18n.CompactNumberFormatSymbols_ks_Arab", "goog.i18n.CompactNumberFormatSymbols_ks_Arab_IN", "goog.i18n.CompactNumberFormatSymbols_ksb", "goog.i18n.CompactNumberFormatSymbols_ksb_TZ", "goog.i18n.CompactNumberFormatSymbols_ksf", "goog.i18n.CompactNumberFormatSymbols_ksf_CM", "goog.i18n.CompactNumberFormatSymbols_ksh", "goog.i18n.CompactNumberFormatSymbols_ksh_DE", 
"goog.i18n.CompactNumberFormatSymbols_kw", "goog.i18n.CompactNumberFormatSymbols_kw_GB", "goog.i18n.CompactNumberFormatSymbols_ky", "goog.i18n.CompactNumberFormatSymbols_ky_KG", "goog.i18n.CompactNumberFormatSymbols_lag", "goog.i18n.CompactNumberFormatSymbols_lag_TZ", "goog.i18n.CompactNumberFormatSymbols_lg", "goog.i18n.CompactNumberFormatSymbols_lg_UG", "goog.i18n.CompactNumberFormatSymbols_ln_AO", "goog.i18n.CompactNumberFormatSymbols_ln_CF", "goog.i18n.CompactNumberFormatSymbols_ln_CG", "goog.i18n.CompactNumberFormatSymbols_lo", 
"goog.i18n.CompactNumberFormatSymbols_lo_LA", "goog.i18n.CompactNumberFormatSymbols_lu", "goog.i18n.CompactNumberFormatSymbols_lu_CD", "goog.i18n.CompactNumberFormatSymbols_luo", "goog.i18n.CompactNumberFormatSymbols_luo_KE", "goog.i18n.CompactNumberFormatSymbols_luy", "goog.i18n.CompactNumberFormatSymbols_luy_KE", "goog.i18n.CompactNumberFormatSymbols_mas", "goog.i18n.CompactNumberFormatSymbols_mas_KE", "goog.i18n.CompactNumberFormatSymbols_mas_TZ", "goog.i18n.CompactNumberFormatSymbols_mer", "goog.i18n.CompactNumberFormatSymbols_mer_KE", 
"goog.i18n.CompactNumberFormatSymbols_mfe", "goog.i18n.CompactNumberFormatSymbols_mfe_MU", "goog.i18n.CompactNumberFormatSymbols_mg", "goog.i18n.CompactNumberFormatSymbols_mg_MG", "goog.i18n.CompactNumberFormatSymbols_mgh", "goog.i18n.CompactNumberFormatSymbols_mgh_MZ", "goog.i18n.CompactNumberFormatSymbols_mgo", "goog.i18n.CompactNumberFormatSymbols_mgo_CM", "goog.i18n.CompactNumberFormatSymbols_mk", "goog.i18n.CompactNumberFormatSymbols_mk_MK", "goog.i18n.CompactNumberFormatSymbols_ms_BN", "goog.i18n.CompactNumberFormatSymbols_ms_SG", 
"goog.i18n.CompactNumberFormatSymbols_mua", "goog.i18n.CompactNumberFormatSymbols_mua_CM", "goog.i18n.CompactNumberFormatSymbols_my", "goog.i18n.CompactNumberFormatSymbols_my_MM", "goog.i18n.CompactNumberFormatSymbols_naq", "goog.i18n.CompactNumberFormatSymbols_naq_NA", "goog.i18n.CompactNumberFormatSymbols_nd", "goog.i18n.CompactNumberFormatSymbols_nd_ZW", "goog.i18n.CompactNumberFormatSymbols_ne", "goog.i18n.CompactNumberFormatSymbols_ne_IN", "goog.i18n.CompactNumberFormatSymbols_ne_NP", "goog.i18n.CompactNumberFormatSymbols_nl_AW", 
"goog.i18n.CompactNumberFormatSymbols_nl_BE", "goog.i18n.CompactNumberFormatSymbols_nl_SR", "goog.i18n.CompactNumberFormatSymbols_nmg", "goog.i18n.CompactNumberFormatSymbols_nmg_CM", "goog.i18n.CompactNumberFormatSymbols_nn", "goog.i18n.CompactNumberFormatSymbols_nn_NO", "goog.i18n.CompactNumberFormatSymbols_nnh", "goog.i18n.CompactNumberFormatSymbols_nnh_CM", "goog.i18n.CompactNumberFormatSymbols_nr", "goog.i18n.CompactNumberFormatSymbols_nr_ZA", "goog.i18n.CompactNumberFormatSymbols_nso", "goog.i18n.CompactNumberFormatSymbols_nso_ZA", 
"goog.i18n.CompactNumberFormatSymbols_nus", "goog.i18n.CompactNumberFormatSymbols_nus_SD", "goog.i18n.CompactNumberFormatSymbols_nyn", "goog.i18n.CompactNumberFormatSymbols_nyn_UG", "goog.i18n.CompactNumberFormatSymbols_om", "goog.i18n.CompactNumberFormatSymbols_om_ET", "goog.i18n.CompactNumberFormatSymbols_om_KE", "goog.i18n.CompactNumberFormatSymbols_os", "goog.i18n.CompactNumberFormatSymbols_os_GE", "goog.i18n.CompactNumberFormatSymbols_os_RU", "goog.i18n.CompactNumberFormatSymbols_pa", "goog.i18n.CompactNumberFormatSymbols_pa_Arab", 
"goog.i18n.CompactNumberFormatSymbols_pa_Arab_PK", "goog.i18n.CompactNumberFormatSymbols_pa_Guru", "goog.i18n.CompactNumberFormatSymbols_pa_Guru_IN", "goog.i18n.CompactNumberFormatSymbols_ps", "goog.i18n.CompactNumberFormatSymbols_ps_AF", "goog.i18n.CompactNumberFormatSymbols_pt_AO", "goog.i18n.CompactNumberFormatSymbols_pt_CV", "goog.i18n.CompactNumberFormatSymbols_pt_GW", "goog.i18n.CompactNumberFormatSymbols_pt_MO", "goog.i18n.CompactNumberFormatSymbols_pt_MZ", "goog.i18n.CompactNumberFormatSymbols_pt_ST", 
"goog.i18n.CompactNumberFormatSymbols_pt_TL", "goog.i18n.CompactNumberFormatSymbols_rm", "goog.i18n.CompactNumberFormatSymbols_rm_CH", "goog.i18n.CompactNumberFormatSymbols_rn", "goog.i18n.CompactNumberFormatSymbols_rn_BI", "goog.i18n.CompactNumberFormatSymbols_ro_MD", "goog.i18n.CompactNumberFormatSymbols_rof", "goog.i18n.CompactNumberFormatSymbols_rof_TZ", "goog.i18n.CompactNumberFormatSymbols_ru_BY", "goog.i18n.CompactNumberFormatSymbols_ru_KG", "goog.i18n.CompactNumberFormatSymbols_ru_KZ", "goog.i18n.CompactNumberFormatSymbols_ru_MD", 
"goog.i18n.CompactNumberFormatSymbols_ru_UA", "goog.i18n.CompactNumberFormatSymbols_rw", "goog.i18n.CompactNumberFormatSymbols_rw_RW", "goog.i18n.CompactNumberFormatSymbols_rwk", "goog.i18n.CompactNumberFormatSymbols_rwk_TZ", "goog.i18n.CompactNumberFormatSymbols_sah", "goog.i18n.CompactNumberFormatSymbols_sah_RU", "goog.i18n.CompactNumberFormatSymbols_saq", "goog.i18n.CompactNumberFormatSymbols_saq_KE", "goog.i18n.CompactNumberFormatSymbols_sbp", "goog.i18n.CompactNumberFormatSymbols_sbp_TZ", "goog.i18n.CompactNumberFormatSymbols_se", 
"goog.i18n.CompactNumberFormatSymbols_se_FI", "goog.i18n.CompactNumberFormatSymbols_se_NO", "goog.i18n.CompactNumberFormatSymbols_seh", "goog.i18n.CompactNumberFormatSymbols_seh_MZ", "goog.i18n.CompactNumberFormatSymbols_ses", "goog.i18n.CompactNumberFormatSymbols_ses_ML", "goog.i18n.CompactNumberFormatSymbols_sg", "goog.i18n.CompactNumberFormatSymbols_sg_CF", "goog.i18n.CompactNumberFormatSymbols_shi", "goog.i18n.CompactNumberFormatSymbols_shi_Latn", "goog.i18n.CompactNumberFormatSymbols_shi_Latn_MA", 
"goog.i18n.CompactNumberFormatSymbols_shi_Tfng", "goog.i18n.CompactNumberFormatSymbols_shi_Tfng_MA", "goog.i18n.CompactNumberFormatSymbols_si", "goog.i18n.CompactNumberFormatSymbols_si_LK", "goog.i18n.CompactNumberFormatSymbols_sn", "goog.i18n.CompactNumberFormatSymbols_sn_ZW", "goog.i18n.CompactNumberFormatSymbols_so", "goog.i18n.CompactNumberFormatSymbols_so_DJ", "goog.i18n.CompactNumberFormatSymbols_so_ET", "goog.i18n.CompactNumberFormatSymbols_so_KE", "goog.i18n.CompactNumberFormatSymbols_so_SO", 
"goog.i18n.CompactNumberFormatSymbols_sq_MK", "goog.i18n.CompactNumberFormatSymbols_sr_Cyrl", "goog.i18n.CompactNumberFormatSymbols_sr_Cyrl_BA", "goog.i18n.CompactNumberFormatSymbols_sr_Cyrl_ME", "goog.i18n.CompactNumberFormatSymbols_sr_Latn", "goog.i18n.CompactNumberFormatSymbols_sr_Latn_BA", "goog.i18n.CompactNumberFormatSymbols_sr_Latn_ME", "goog.i18n.CompactNumberFormatSymbols_ss", "goog.i18n.CompactNumberFormatSymbols_ss_SZ", "goog.i18n.CompactNumberFormatSymbols_ss_ZA", "goog.i18n.CompactNumberFormatSymbols_ssy", 
"goog.i18n.CompactNumberFormatSymbols_ssy_ER", "goog.i18n.CompactNumberFormatSymbols_st", "goog.i18n.CompactNumberFormatSymbols_st_LS", "goog.i18n.CompactNumberFormatSymbols_st_ZA", "goog.i18n.CompactNumberFormatSymbols_sv_AX", "goog.i18n.CompactNumberFormatSymbols_sv_FI", "goog.i18n.CompactNumberFormatSymbols_sw_KE", "goog.i18n.CompactNumberFormatSymbols_sw_UG", "goog.i18n.CompactNumberFormatSymbols_swc", "goog.i18n.CompactNumberFormatSymbols_swc_CD", "goog.i18n.CompactNumberFormatSymbols_ta_LK", 
"goog.i18n.CompactNumberFormatSymbols_ta_MY", "goog.i18n.CompactNumberFormatSymbols_ta_SG", "goog.i18n.CompactNumberFormatSymbols_teo", "goog.i18n.CompactNumberFormatSymbols_teo_KE", "goog.i18n.CompactNumberFormatSymbols_teo_UG", "goog.i18n.CompactNumberFormatSymbols_tg", "goog.i18n.CompactNumberFormatSymbols_tg_Cyrl", "goog.i18n.CompactNumberFormatSymbols_tg_Cyrl_TJ", "goog.i18n.CompactNumberFormatSymbols_ti", "goog.i18n.CompactNumberFormatSymbols_ti_ER", "goog.i18n.CompactNumberFormatSymbols_ti_ET", 
"goog.i18n.CompactNumberFormatSymbols_tig", "goog.i18n.CompactNumberFormatSymbols_tig_ER", "goog.i18n.CompactNumberFormatSymbols_tn", "goog.i18n.CompactNumberFormatSymbols_tn_BW", "goog.i18n.CompactNumberFormatSymbols_tn_ZA", "goog.i18n.CompactNumberFormatSymbols_to", "goog.i18n.CompactNumberFormatSymbols_to_TO", "goog.i18n.CompactNumberFormatSymbols_tr_CY", "goog.i18n.CompactNumberFormatSymbols_ts", "goog.i18n.CompactNumberFormatSymbols_ts_ZA", "goog.i18n.CompactNumberFormatSymbols_twq", "goog.i18n.CompactNumberFormatSymbols_twq_NE", 
"goog.i18n.CompactNumberFormatSymbols_tzm", "goog.i18n.CompactNumberFormatSymbols_tzm_Latn", "goog.i18n.CompactNumberFormatSymbols_tzm_Latn_MA", "goog.i18n.CompactNumberFormatSymbols_ur_IN", "goog.i18n.CompactNumberFormatSymbols_uz", "goog.i18n.CompactNumberFormatSymbols_uz_Arab", "goog.i18n.CompactNumberFormatSymbols_uz_Arab_AF", "goog.i18n.CompactNumberFormatSymbols_uz_Cyrl", "goog.i18n.CompactNumberFormatSymbols_uz_Cyrl_UZ", "goog.i18n.CompactNumberFormatSymbols_uz_Latn", "goog.i18n.CompactNumberFormatSymbols_uz_Latn_UZ", 
"goog.i18n.CompactNumberFormatSymbols_vai", "goog.i18n.CompactNumberFormatSymbols_vai_Latn", "goog.i18n.CompactNumberFormatSymbols_vai_Latn_LR", "goog.i18n.CompactNumberFormatSymbols_vai_Vaii", "goog.i18n.CompactNumberFormatSymbols_vai_Vaii_LR", "goog.i18n.CompactNumberFormatSymbols_ve", "goog.i18n.CompactNumberFormatSymbols_ve_ZA", "goog.i18n.CompactNumberFormatSymbols_vo", "goog.i18n.CompactNumberFormatSymbols_vun", "goog.i18n.CompactNumberFormatSymbols_vun_TZ", "goog.i18n.CompactNumberFormatSymbols_wae", 
"goog.i18n.CompactNumberFormatSymbols_wae_CH", "goog.i18n.CompactNumberFormatSymbols_wal", "goog.i18n.CompactNumberFormatSymbols_wal_ET", "goog.i18n.CompactNumberFormatSymbols_xh", "goog.i18n.CompactNumberFormatSymbols_xh_ZA", "goog.i18n.CompactNumberFormatSymbols_xog", "goog.i18n.CompactNumberFormatSymbols_xog_UG", "goog.i18n.CompactNumberFormatSymbols_yav", "goog.i18n.CompactNumberFormatSymbols_yav_CM", "goog.i18n.CompactNumberFormatSymbols_yo", "goog.i18n.CompactNumberFormatSymbols_yo_NG", "goog.i18n.CompactNumberFormatSymbols_zh_Hans", 
"goog.i18n.CompactNumberFormatSymbols_zh_Hans_HK", "goog.i18n.CompactNumberFormatSymbols_zh_Hans_MO", "goog.i18n.CompactNumberFormatSymbols_zh_Hans_SG", "goog.i18n.CompactNumberFormatSymbols_zh_Hant", "goog.i18n.CompactNumberFormatSymbols_zh_Hant_HK", "goog.i18n.CompactNumberFormatSymbols_zh_Hant_MO", "goog.i18n.CompactNumberFormatSymbols_zh_Hant_TW"], []);
goog.addDependency("i18n/currency.js", ["goog.i18n.currency", "goog.i18n.currency.CurrencyInfo", "goog.i18n.currency.CurrencyInfoTier2"], []);
goog.addDependency("i18n/currencycodemap.js", ["goog.i18n.currencyCodeMap", "goog.i18n.currencyCodeMapTier2"], []);
goog.addDependency("i18n/datetimeformat.js", ["goog.i18n.DateTimeFormat", "goog.i18n.DateTimeFormat.Format"], ["goog.asserts", "goog.i18n.DateTimeSymbols", "goog.i18n.TimeZone", "goog.string"]);
goog.addDependency("i18n/datetimeparse.js", ["goog.i18n.DateTimeParse"], ["goog.i18n.DateTimeFormat", "goog.i18n.DateTimeSymbols"]);
goog.addDependency("i18n/datetimepatterns.js", ["goog.i18n.DateTimePatterns", "goog.i18n.DateTimePatterns_af", "goog.i18n.DateTimePatterns_am", "goog.i18n.DateTimePatterns_ar", "goog.i18n.DateTimePatterns_bg", "goog.i18n.DateTimePatterns_bn", "goog.i18n.DateTimePatterns_br", "goog.i18n.DateTimePatterns_ca", "goog.i18n.DateTimePatterns_chr", "goog.i18n.DateTimePatterns_cs", "goog.i18n.DateTimePatterns_cy", "goog.i18n.DateTimePatterns_da", "goog.i18n.DateTimePatterns_de", "goog.i18n.DateTimePatterns_de_AT", 
"goog.i18n.DateTimePatterns_de_CH", "goog.i18n.DateTimePatterns_el", "goog.i18n.DateTimePatterns_en", "goog.i18n.DateTimePatterns_en_AU", "goog.i18n.DateTimePatterns_en_GB", "goog.i18n.DateTimePatterns_en_IE", "goog.i18n.DateTimePatterns_en_IN", "goog.i18n.DateTimePatterns_en_SG", "goog.i18n.DateTimePatterns_en_US", "goog.i18n.DateTimePatterns_en_ZA", "goog.i18n.DateTimePatterns_es", "goog.i18n.DateTimePatterns_es_419", "goog.i18n.DateTimePatterns_es_ES", "goog.i18n.DateTimePatterns_et", "goog.i18n.DateTimePatterns_eu", 
"goog.i18n.DateTimePatterns_fa", "goog.i18n.DateTimePatterns_fi", "goog.i18n.DateTimePatterns_fil", "goog.i18n.DateTimePatterns_fr", "goog.i18n.DateTimePatterns_fr_CA", "goog.i18n.DateTimePatterns_gl", "goog.i18n.DateTimePatterns_gsw", "goog.i18n.DateTimePatterns_gu", "goog.i18n.DateTimePatterns_haw", "goog.i18n.DateTimePatterns_he", "goog.i18n.DateTimePatterns_hi", "goog.i18n.DateTimePatterns_hr", "goog.i18n.DateTimePatterns_hu", "goog.i18n.DateTimePatterns_id", "goog.i18n.DateTimePatterns_in", 
"goog.i18n.DateTimePatterns_is", "goog.i18n.DateTimePatterns_it", "goog.i18n.DateTimePatterns_iw", "goog.i18n.DateTimePatterns_ja", "goog.i18n.DateTimePatterns_kn", "goog.i18n.DateTimePatterns_ko", "goog.i18n.DateTimePatterns_ln", "goog.i18n.DateTimePatterns_lt", "goog.i18n.DateTimePatterns_lv", "goog.i18n.DateTimePatterns_ml", "goog.i18n.DateTimePatterns_mo", "goog.i18n.DateTimePatterns_mr", "goog.i18n.DateTimePatterns_ms", "goog.i18n.DateTimePatterns_mt", "goog.i18n.DateTimePatterns_nb", "goog.i18n.DateTimePatterns_nl", 
"goog.i18n.DateTimePatterns_no", "goog.i18n.DateTimePatterns_or", "goog.i18n.DateTimePatterns_pl", "goog.i18n.DateTimePatterns_pt", "goog.i18n.DateTimePatterns_pt_BR", "goog.i18n.DateTimePatterns_pt_PT", "goog.i18n.DateTimePatterns_ro", "goog.i18n.DateTimePatterns_ru", "goog.i18n.DateTimePatterns_sk", "goog.i18n.DateTimePatterns_sl", "goog.i18n.DateTimePatterns_sq", "goog.i18n.DateTimePatterns_sr", "goog.i18n.DateTimePatterns_sv", "goog.i18n.DateTimePatterns_sw", "goog.i18n.DateTimePatterns_ta", 
"goog.i18n.DateTimePatterns_te", "goog.i18n.DateTimePatterns_th", "goog.i18n.DateTimePatterns_tl", "goog.i18n.DateTimePatterns_tr", "goog.i18n.DateTimePatterns_uk", "goog.i18n.DateTimePatterns_ur", "goog.i18n.DateTimePatterns_vi", "goog.i18n.DateTimePatterns_zh", "goog.i18n.DateTimePatterns_zh_CN", "goog.i18n.DateTimePatterns_zh_HK", "goog.i18n.DateTimePatterns_zh_TW", "goog.i18n.DateTimePatterns_zu"], []);
goog.addDependency("i18n/datetimepatternsext.js", ["goog.i18n.DateTimePatternsExt", "goog.i18n.DateTimePatterns_af_NA", "goog.i18n.DateTimePatterns_af_ZA", "goog.i18n.DateTimePatterns_agq", "goog.i18n.DateTimePatterns_agq_CM", "goog.i18n.DateTimePatterns_ak", "goog.i18n.DateTimePatterns_ak_GH", "goog.i18n.DateTimePatterns_am_ET", "goog.i18n.DateTimePatterns_ar_001", "goog.i18n.DateTimePatterns_ar_AE", "goog.i18n.DateTimePatterns_ar_BH", "goog.i18n.DateTimePatterns_ar_DJ", "goog.i18n.DateTimePatterns_ar_DZ", 
"goog.i18n.DateTimePatterns_ar_EG", "goog.i18n.DateTimePatterns_ar_EH", "goog.i18n.DateTimePatterns_ar_ER", "goog.i18n.DateTimePatterns_ar_IL", "goog.i18n.DateTimePatterns_ar_IQ", "goog.i18n.DateTimePatterns_ar_JO", "goog.i18n.DateTimePatterns_ar_KM", "goog.i18n.DateTimePatterns_ar_KW", "goog.i18n.DateTimePatterns_ar_LB", "goog.i18n.DateTimePatterns_ar_LY", "goog.i18n.DateTimePatterns_ar_MA", "goog.i18n.DateTimePatterns_ar_MR", "goog.i18n.DateTimePatterns_ar_OM", "goog.i18n.DateTimePatterns_ar_PS", 
"goog.i18n.DateTimePatterns_ar_QA", "goog.i18n.DateTimePatterns_ar_SA", "goog.i18n.DateTimePatterns_ar_SD", "goog.i18n.DateTimePatterns_ar_SO", "goog.i18n.DateTimePatterns_ar_SY", "goog.i18n.DateTimePatterns_ar_TD", "goog.i18n.DateTimePatterns_ar_TN", "goog.i18n.DateTimePatterns_ar_YE", "goog.i18n.DateTimePatterns_as", "goog.i18n.DateTimePatterns_as_IN", "goog.i18n.DateTimePatterns_asa", "goog.i18n.DateTimePatterns_asa_TZ", "goog.i18n.DateTimePatterns_az", "goog.i18n.DateTimePatterns_az_Cyrl", "goog.i18n.DateTimePatterns_az_Cyrl_AZ", 
"goog.i18n.DateTimePatterns_az_Latn", "goog.i18n.DateTimePatterns_az_Latn_AZ", "goog.i18n.DateTimePatterns_bas", "goog.i18n.DateTimePatterns_bas_CM", "goog.i18n.DateTimePatterns_be", "goog.i18n.DateTimePatterns_be_BY", "goog.i18n.DateTimePatterns_bem", "goog.i18n.DateTimePatterns_bem_ZM", "goog.i18n.DateTimePatterns_bez", "goog.i18n.DateTimePatterns_bez_TZ", "goog.i18n.DateTimePatterns_bg_BG", "goog.i18n.DateTimePatterns_bm", "goog.i18n.DateTimePatterns_bm_ML", "goog.i18n.DateTimePatterns_bn_BD", 
"goog.i18n.DateTimePatterns_bn_IN", "goog.i18n.DateTimePatterns_bo", "goog.i18n.DateTimePatterns_bo_CN", "goog.i18n.DateTimePatterns_bo_IN", "goog.i18n.DateTimePatterns_br_FR", "goog.i18n.DateTimePatterns_brx", "goog.i18n.DateTimePatterns_brx_IN", "goog.i18n.DateTimePatterns_bs", "goog.i18n.DateTimePatterns_bs_Cyrl", "goog.i18n.DateTimePatterns_bs_Cyrl_BA", "goog.i18n.DateTimePatterns_bs_Latn", "goog.i18n.DateTimePatterns_bs_Latn_BA", "goog.i18n.DateTimePatterns_ca_AD", "goog.i18n.DateTimePatterns_ca_ES", 
"goog.i18n.DateTimePatterns_cgg", "goog.i18n.DateTimePatterns_cgg_UG", "goog.i18n.DateTimePatterns_chr_US", "goog.i18n.DateTimePatterns_cs_CZ", "goog.i18n.DateTimePatterns_cy_GB", "goog.i18n.DateTimePatterns_da_DK", "goog.i18n.DateTimePatterns_dav", "goog.i18n.DateTimePatterns_dav_KE", "goog.i18n.DateTimePatterns_de_BE", "goog.i18n.DateTimePatterns_de_DE", "goog.i18n.DateTimePatterns_de_LI", "goog.i18n.DateTimePatterns_de_LU", "goog.i18n.DateTimePatterns_dje", "goog.i18n.DateTimePatterns_dje_NE", 
"goog.i18n.DateTimePatterns_dua", "goog.i18n.DateTimePatterns_dua_CM", "goog.i18n.DateTimePatterns_dyo", "goog.i18n.DateTimePatterns_dyo_SN", "goog.i18n.DateTimePatterns_dz", "goog.i18n.DateTimePatterns_dz_BT", "goog.i18n.DateTimePatterns_ebu", "goog.i18n.DateTimePatterns_ebu_KE", "goog.i18n.DateTimePatterns_ee", "goog.i18n.DateTimePatterns_ee_GH", "goog.i18n.DateTimePatterns_ee_TG", "goog.i18n.DateTimePatterns_el_CY", "goog.i18n.DateTimePatterns_el_GR", "goog.i18n.DateTimePatterns_en_150", "goog.i18n.DateTimePatterns_en_AG", 
"goog.i18n.DateTimePatterns_en_AS", "goog.i18n.DateTimePatterns_en_BB", "goog.i18n.DateTimePatterns_en_BE", "goog.i18n.DateTimePatterns_en_BM", "goog.i18n.DateTimePatterns_en_BS", "goog.i18n.DateTimePatterns_en_BW", "goog.i18n.DateTimePatterns_en_BZ", "goog.i18n.DateTimePatterns_en_CA", "goog.i18n.DateTimePatterns_en_CM", "goog.i18n.DateTimePatterns_en_DM", "goog.i18n.DateTimePatterns_en_FJ", "goog.i18n.DateTimePatterns_en_FM", "goog.i18n.DateTimePatterns_en_GD", "goog.i18n.DateTimePatterns_en_GG", 
"goog.i18n.DateTimePatterns_en_GH", "goog.i18n.DateTimePatterns_en_GI", "goog.i18n.DateTimePatterns_en_GM", "goog.i18n.DateTimePatterns_en_GU", "goog.i18n.DateTimePatterns_en_GY", "goog.i18n.DateTimePatterns_en_HK", "goog.i18n.DateTimePatterns_en_IM", "goog.i18n.DateTimePatterns_en_JE", "goog.i18n.DateTimePatterns_en_JM", "goog.i18n.DateTimePatterns_en_KE", "goog.i18n.DateTimePatterns_en_KI", "goog.i18n.DateTimePatterns_en_KN", "goog.i18n.DateTimePatterns_en_KY", "goog.i18n.DateTimePatterns_en_LC", 
"goog.i18n.DateTimePatterns_en_LR", "goog.i18n.DateTimePatterns_en_LS", "goog.i18n.DateTimePatterns_en_MG", "goog.i18n.DateTimePatterns_en_MH", "goog.i18n.DateTimePatterns_en_MP", "goog.i18n.DateTimePatterns_en_MT", "goog.i18n.DateTimePatterns_en_MU", "goog.i18n.DateTimePatterns_en_MW", "goog.i18n.DateTimePatterns_en_NA", "goog.i18n.DateTimePatterns_en_NG", "goog.i18n.DateTimePatterns_en_NZ", "goog.i18n.DateTimePatterns_en_PG", "goog.i18n.DateTimePatterns_en_PH", "goog.i18n.DateTimePatterns_en_PK", 
"goog.i18n.DateTimePatterns_en_PR", "goog.i18n.DateTimePatterns_en_PW", "goog.i18n.DateTimePatterns_en_SB", "goog.i18n.DateTimePatterns_en_SC", "goog.i18n.DateTimePatterns_en_SL", "goog.i18n.DateTimePatterns_en_SS", "goog.i18n.DateTimePatterns_en_SZ", "goog.i18n.DateTimePatterns_en_TC", "goog.i18n.DateTimePatterns_en_TO", "goog.i18n.DateTimePatterns_en_TT", "goog.i18n.DateTimePatterns_en_TZ", "goog.i18n.DateTimePatterns_en_UG", "goog.i18n.DateTimePatterns_en_UM", "goog.i18n.DateTimePatterns_en_US_POSIX", 
"goog.i18n.DateTimePatterns_en_VC", "goog.i18n.DateTimePatterns_en_VG", "goog.i18n.DateTimePatterns_en_VI", "goog.i18n.DateTimePatterns_en_VU", "goog.i18n.DateTimePatterns_en_WS", "goog.i18n.DateTimePatterns_en_ZM", "goog.i18n.DateTimePatterns_en_ZW", "goog.i18n.DateTimePatterns_eo", "goog.i18n.DateTimePatterns_es_AR", "goog.i18n.DateTimePatterns_es_BO", "goog.i18n.DateTimePatterns_es_CL", "goog.i18n.DateTimePatterns_es_CO", "goog.i18n.DateTimePatterns_es_CR", "goog.i18n.DateTimePatterns_es_CU", 
"goog.i18n.DateTimePatterns_es_DO", "goog.i18n.DateTimePatterns_es_EA", "goog.i18n.DateTimePatterns_es_EC", "goog.i18n.DateTimePatterns_es_GQ", "goog.i18n.DateTimePatterns_es_GT", "goog.i18n.DateTimePatterns_es_HN", "goog.i18n.DateTimePatterns_es_IC", "goog.i18n.DateTimePatterns_es_MX", "goog.i18n.DateTimePatterns_es_NI", "goog.i18n.DateTimePatterns_es_PA", "goog.i18n.DateTimePatterns_es_PE", "goog.i18n.DateTimePatterns_es_PH", "goog.i18n.DateTimePatterns_es_PR", "goog.i18n.DateTimePatterns_es_PY", 
"goog.i18n.DateTimePatterns_es_SV", "goog.i18n.DateTimePatterns_es_US", "goog.i18n.DateTimePatterns_es_UY", "goog.i18n.DateTimePatterns_es_VE", "goog.i18n.DateTimePatterns_et_EE", "goog.i18n.DateTimePatterns_eu_ES", "goog.i18n.DateTimePatterns_ewo", "goog.i18n.DateTimePatterns_ewo_CM", "goog.i18n.DateTimePatterns_fa_AF", "goog.i18n.DateTimePatterns_fa_IR", "goog.i18n.DateTimePatterns_ff", "goog.i18n.DateTimePatterns_ff_SN", "goog.i18n.DateTimePatterns_fi_FI", "goog.i18n.DateTimePatterns_fil_PH", 
"goog.i18n.DateTimePatterns_fo", "goog.i18n.DateTimePatterns_fo_FO", "goog.i18n.DateTimePatterns_fr_BE", "goog.i18n.DateTimePatterns_fr_BF", "goog.i18n.DateTimePatterns_fr_BI", "goog.i18n.DateTimePatterns_fr_BJ", "goog.i18n.DateTimePatterns_fr_BL", "goog.i18n.DateTimePatterns_fr_CD", "goog.i18n.DateTimePatterns_fr_CF", "goog.i18n.DateTimePatterns_fr_CG", "goog.i18n.DateTimePatterns_fr_CH", "goog.i18n.DateTimePatterns_fr_CI", "goog.i18n.DateTimePatterns_fr_CM", "goog.i18n.DateTimePatterns_fr_DJ", 
"goog.i18n.DateTimePatterns_fr_DZ", "goog.i18n.DateTimePatterns_fr_FR", "goog.i18n.DateTimePatterns_fr_GA", "goog.i18n.DateTimePatterns_fr_GF", "goog.i18n.DateTimePatterns_fr_GN", "goog.i18n.DateTimePatterns_fr_GP", "goog.i18n.DateTimePatterns_fr_GQ", "goog.i18n.DateTimePatterns_fr_HT", "goog.i18n.DateTimePatterns_fr_KM", "goog.i18n.DateTimePatterns_fr_LU", "goog.i18n.DateTimePatterns_fr_MA", "goog.i18n.DateTimePatterns_fr_MC", "goog.i18n.DateTimePatterns_fr_MF", "goog.i18n.DateTimePatterns_fr_MG", 
"goog.i18n.DateTimePatterns_fr_ML", "goog.i18n.DateTimePatterns_fr_MQ", "goog.i18n.DateTimePatterns_fr_MR", "goog.i18n.DateTimePatterns_fr_MU", "goog.i18n.DateTimePatterns_fr_NC", "goog.i18n.DateTimePatterns_fr_NE", "goog.i18n.DateTimePatterns_fr_PF", "goog.i18n.DateTimePatterns_fr_RE", "goog.i18n.DateTimePatterns_fr_RW", "goog.i18n.DateTimePatterns_fr_SC", "goog.i18n.DateTimePatterns_fr_SN", "goog.i18n.DateTimePatterns_fr_SY", "goog.i18n.DateTimePatterns_fr_TD", "goog.i18n.DateTimePatterns_fr_TG", 
"goog.i18n.DateTimePatterns_fr_TN", "goog.i18n.DateTimePatterns_fr_VU", "goog.i18n.DateTimePatterns_fr_YT", "goog.i18n.DateTimePatterns_ga", "goog.i18n.DateTimePatterns_ga_IE", "goog.i18n.DateTimePatterns_gl_ES", "goog.i18n.DateTimePatterns_gsw_CH", "goog.i18n.DateTimePatterns_gu_IN", "goog.i18n.DateTimePatterns_guz", "goog.i18n.DateTimePatterns_guz_KE", "goog.i18n.DateTimePatterns_gv", "goog.i18n.DateTimePatterns_gv_GB", "goog.i18n.DateTimePatterns_ha", "goog.i18n.DateTimePatterns_ha_Latn", "goog.i18n.DateTimePatterns_ha_Latn_GH", 
"goog.i18n.DateTimePatterns_ha_Latn_NE", "goog.i18n.DateTimePatterns_ha_Latn_NG", "goog.i18n.DateTimePatterns_haw_US", "goog.i18n.DateTimePatterns_he_IL", "goog.i18n.DateTimePatterns_hi_IN", "goog.i18n.DateTimePatterns_hr_BA", "goog.i18n.DateTimePatterns_hr_HR", "goog.i18n.DateTimePatterns_hu_HU", "goog.i18n.DateTimePatterns_hy", "goog.i18n.DateTimePatterns_hy_AM", "goog.i18n.DateTimePatterns_id_ID", "goog.i18n.DateTimePatterns_ig", "goog.i18n.DateTimePatterns_ig_NG", "goog.i18n.DateTimePatterns_ii", 
"goog.i18n.DateTimePatterns_ii_CN", "goog.i18n.DateTimePatterns_is_IS", "goog.i18n.DateTimePatterns_it_CH", "goog.i18n.DateTimePatterns_it_IT", "goog.i18n.DateTimePatterns_it_SM", "goog.i18n.DateTimePatterns_ja_JP", "goog.i18n.DateTimePatterns_jgo", "goog.i18n.DateTimePatterns_jgo_CM", "goog.i18n.DateTimePatterns_jmc", "goog.i18n.DateTimePatterns_jmc_TZ", "goog.i18n.DateTimePatterns_ka", "goog.i18n.DateTimePatterns_ka_GE", "goog.i18n.DateTimePatterns_kab", "goog.i18n.DateTimePatterns_kab_DZ", "goog.i18n.DateTimePatterns_kam", 
"goog.i18n.DateTimePatterns_kam_KE", "goog.i18n.DateTimePatterns_kde", "goog.i18n.DateTimePatterns_kde_TZ", "goog.i18n.DateTimePatterns_kea", "goog.i18n.DateTimePatterns_kea_CV", "goog.i18n.DateTimePatterns_khq", "goog.i18n.DateTimePatterns_khq_ML", "goog.i18n.DateTimePatterns_ki", "goog.i18n.DateTimePatterns_ki_KE", "goog.i18n.DateTimePatterns_kk", "goog.i18n.DateTimePatterns_kk_Cyrl", "goog.i18n.DateTimePatterns_kk_Cyrl_KZ", "goog.i18n.DateTimePatterns_kl", "goog.i18n.DateTimePatterns_kl_GL", "goog.i18n.DateTimePatterns_kln", 
"goog.i18n.DateTimePatterns_kln_KE", "goog.i18n.DateTimePatterns_km", "goog.i18n.DateTimePatterns_km_KH", "goog.i18n.DateTimePatterns_kn_IN", "goog.i18n.DateTimePatterns_ko_KP", "goog.i18n.DateTimePatterns_ko_KR", "goog.i18n.DateTimePatterns_kok", "goog.i18n.DateTimePatterns_kok_IN", "goog.i18n.DateTimePatterns_ks", "goog.i18n.DateTimePatterns_ks_Arab", "goog.i18n.DateTimePatterns_ks_Arab_IN", "goog.i18n.DateTimePatterns_ksb", "goog.i18n.DateTimePatterns_ksb_TZ", "goog.i18n.DateTimePatterns_ksf", 
"goog.i18n.DateTimePatterns_ksf_CM", "goog.i18n.DateTimePatterns_kw", "goog.i18n.DateTimePatterns_kw_GB", "goog.i18n.DateTimePatterns_lag", "goog.i18n.DateTimePatterns_lag_TZ", "goog.i18n.DateTimePatterns_lg", "goog.i18n.DateTimePatterns_lg_UG", "goog.i18n.DateTimePatterns_ln_AO", "goog.i18n.DateTimePatterns_ln_CD", "goog.i18n.DateTimePatterns_ln_CF", "goog.i18n.DateTimePatterns_ln_CG", "goog.i18n.DateTimePatterns_lo", "goog.i18n.DateTimePatterns_lo_LA", "goog.i18n.DateTimePatterns_lt_LT", "goog.i18n.DateTimePatterns_lu", 
"goog.i18n.DateTimePatterns_lu_CD", "goog.i18n.DateTimePatterns_luo", "goog.i18n.DateTimePatterns_luo_KE", "goog.i18n.DateTimePatterns_luy", "goog.i18n.DateTimePatterns_luy_KE", "goog.i18n.DateTimePatterns_lv_LV", "goog.i18n.DateTimePatterns_mas", "goog.i18n.DateTimePatterns_mas_KE", "goog.i18n.DateTimePatterns_mas_TZ", "goog.i18n.DateTimePatterns_mer", "goog.i18n.DateTimePatterns_mer_KE", "goog.i18n.DateTimePatterns_mfe", "goog.i18n.DateTimePatterns_mfe_MU", "goog.i18n.DateTimePatterns_mg", "goog.i18n.DateTimePatterns_mg_MG", 
"goog.i18n.DateTimePatterns_mgh", "goog.i18n.DateTimePatterns_mgh_MZ", "goog.i18n.DateTimePatterns_mgo", "goog.i18n.DateTimePatterns_mgo_CM", "goog.i18n.DateTimePatterns_mk", "goog.i18n.DateTimePatterns_mk_MK", "goog.i18n.DateTimePatterns_ml_IN", "goog.i18n.DateTimePatterns_mr_IN", "goog.i18n.DateTimePatterns_ms_BN", "goog.i18n.DateTimePatterns_ms_MY", "goog.i18n.DateTimePatterns_ms_SG", "goog.i18n.DateTimePatterns_mt_MT", "goog.i18n.DateTimePatterns_mua", "goog.i18n.DateTimePatterns_mua_CM", "goog.i18n.DateTimePatterns_my", 
"goog.i18n.DateTimePatterns_my_MM", "goog.i18n.DateTimePatterns_naq", "goog.i18n.DateTimePatterns_naq_NA", "goog.i18n.DateTimePatterns_nb_NO", "goog.i18n.DateTimePatterns_nd", "goog.i18n.DateTimePatterns_nd_ZW", "goog.i18n.DateTimePatterns_ne", "goog.i18n.DateTimePatterns_ne_IN", "goog.i18n.DateTimePatterns_ne_NP", "goog.i18n.DateTimePatterns_nl_AW", "goog.i18n.DateTimePatterns_nl_BE", "goog.i18n.DateTimePatterns_nl_CW", "goog.i18n.DateTimePatterns_nl_NL", "goog.i18n.DateTimePatterns_nl_SR", "goog.i18n.DateTimePatterns_nl_SX", 
"goog.i18n.DateTimePatterns_nmg", "goog.i18n.DateTimePatterns_nmg_CM", "goog.i18n.DateTimePatterns_nn", "goog.i18n.DateTimePatterns_nn_NO", "goog.i18n.DateTimePatterns_nus", "goog.i18n.DateTimePatterns_nus_SD", "goog.i18n.DateTimePatterns_nyn", "goog.i18n.DateTimePatterns_nyn_UG", "goog.i18n.DateTimePatterns_om", "goog.i18n.DateTimePatterns_om_ET", "goog.i18n.DateTimePatterns_om_KE", "goog.i18n.DateTimePatterns_or_IN", "goog.i18n.DateTimePatterns_pa", "goog.i18n.DateTimePatterns_pa_Arab", "goog.i18n.DateTimePatterns_pa_Arab_PK", 
"goog.i18n.DateTimePatterns_pa_Guru", "goog.i18n.DateTimePatterns_pa_Guru_IN", "goog.i18n.DateTimePatterns_pl_PL", "goog.i18n.DateTimePatterns_ps", "goog.i18n.DateTimePatterns_ps_AF", "goog.i18n.DateTimePatterns_pt_AO", "goog.i18n.DateTimePatterns_pt_CV", "goog.i18n.DateTimePatterns_pt_GW", "goog.i18n.DateTimePatterns_pt_MO", "goog.i18n.DateTimePatterns_pt_MZ", "goog.i18n.DateTimePatterns_pt_ST", "goog.i18n.DateTimePatterns_pt_TL", "goog.i18n.DateTimePatterns_rm", "goog.i18n.DateTimePatterns_rm_CH", 
"goog.i18n.DateTimePatterns_rn", "goog.i18n.DateTimePatterns_rn_BI", "goog.i18n.DateTimePatterns_ro_MD", "goog.i18n.DateTimePatterns_ro_RO", "goog.i18n.DateTimePatterns_rof", "goog.i18n.DateTimePatterns_rof_TZ", "goog.i18n.DateTimePatterns_ru_BY", "goog.i18n.DateTimePatterns_ru_KG", "goog.i18n.DateTimePatterns_ru_KZ", "goog.i18n.DateTimePatterns_ru_MD", "goog.i18n.DateTimePatterns_ru_RU", "goog.i18n.DateTimePatterns_ru_UA", "goog.i18n.DateTimePatterns_rw", "goog.i18n.DateTimePatterns_rw_RW", "goog.i18n.DateTimePatterns_rwk", 
"goog.i18n.DateTimePatterns_rwk_TZ", "goog.i18n.DateTimePatterns_saq", "goog.i18n.DateTimePatterns_saq_KE", "goog.i18n.DateTimePatterns_sbp", "goog.i18n.DateTimePatterns_sbp_TZ", "goog.i18n.DateTimePatterns_seh", "goog.i18n.DateTimePatterns_seh_MZ", "goog.i18n.DateTimePatterns_ses", "goog.i18n.DateTimePatterns_ses_ML", "goog.i18n.DateTimePatterns_sg", "goog.i18n.DateTimePatterns_sg_CF", "goog.i18n.DateTimePatterns_shi", "goog.i18n.DateTimePatterns_shi_Latn", "goog.i18n.DateTimePatterns_shi_Latn_MA", 
"goog.i18n.DateTimePatterns_shi_Tfng", "goog.i18n.DateTimePatterns_shi_Tfng_MA", "goog.i18n.DateTimePatterns_si", "goog.i18n.DateTimePatterns_si_LK", "goog.i18n.DateTimePatterns_sk_SK", "goog.i18n.DateTimePatterns_sl_SI", "goog.i18n.DateTimePatterns_sn", "goog.i18n.DateTimePatterns_sn_ZW", "goog.i18n.DateTimePatterns_so", "goog.i18n.DateTimePatterns_so_DJ", "goog.i18n.DateTimePatterns_so_ET", "goog.i18n.DateTimePatterns_so_KE", "goog.i18n.DateTimePatterns_so_SO", "goog.i18n.DateTimePatterns_sq_AL", 
"goog.i18n.DateTimePatterns_sq_MK", "goog.i18n.DateTimePatterns_sr_Cyrl", "goog.i18n.DateTimePatterns_sr_Cyrl_BA", "goog.i18n.DateTimePatterns_sr_Cyrl_ME", "goog.i18n.DateTimePatterns_sr_Cyrl_RS", "goog.i18n.DateTimePatterns_sr_Latn", "goog.i18n.DateTimePatterns_sr_Latn_BA", "goog.i18n.DateTimePatterns_sr_Latn_ME", "goog.i18n.DateTimePatterns_sr_Latn_RS", "goog.i18n.DateTimePatterns_sv_AX", "goog.i18n.DateTimePatterns_sv_FI", "goog.i18n.DateTimePatterns_sv_SE", "goog.i18n.DateTimePatterns_sw_KE", 
"goog.i18n.DateTimePatterns_sw_TZ", "goog.i18n.DateTimePatterns_sw_UG", "goog.i18n.DateTimePatterns_swc", "goog.i18n.DateTimePatterns_swc_CD", "goog.i18n.DateTimePatterns_ta_IN", "goog.i18n.DateTimePatterns_ta_LK", "goog.i18n.DateTimePatterns_ta_MY", "goog.i18n.DateTimePatterns_ta_SG", "goog.i18n.DateTimePatterns_te_IN", "goog.i18n.DateTimePatterns_teo", "goog.i18n.DateTimePatterns_teo_KE", "goog.i18n.DateTimePatterns_teo_UG", "goog.i18n.DateTimePatterns_th_TH", "goog.i18n.DateTimePatterns_ti", "goog.i18n.DateTimePatterns_ti_ER", 
"goog.i18n.DateTimePatterns_ti_ET", "goog.i18n.DateTimePatterns_to", "goog.i18n.DateTimePatterns_to_TO", "goog.i18n.DateTimePatterns_tr_CY", "goog.i18n.DateTimePatterns_tr_TR", "goog.i18n.DateTimePatterns_twq", "goog.i18n.DateTimePatterns_twq_NE", "goog.i18n.DateTimePatterns_tzm", "goog.i18n.DateTimePatterns_tzm_Latn", "goog.i18n.DateTimePatterns_tzm_Latn_MA", "goog.i18n.DateTimePatterns_uk_UA", "goog.i18n.DateTimePatterns_ur_IN", "goog.i18n.DateTimePatterns_ur_PK", "goog.i18n.DateTimePatterns_uz", 
"goog.i18n.DateTimePatterns_uz_Arab", "goog.i18n.DateTimePatterns_uz_Arab_AF", "goog.i18n.DateTimePatterns_uz_Cyrl", "goog.i18n.DateTimePatterns_uz_Cyrl_UZ", "goog.i18n.DateTimePatterns_uz_Latn", "goog.i18n.DateTimePatterns_uz_Latn_UZ", "goog.i18n.DateTimePatterns_vai", "goog.i18n.DateTimePatterns_vai_Latn", "goog.i18n.DateTimePatterns_vai_Latn_LR", "goog.i18n.DateTimePatterns_vai_Vaii", "goog.i18n.DateTimePatterns_vai_Vaii_LR", "goog.i18n.DateTimePatterns_vi_VN", "goog.i18n.DateTimePatterns_vun", 
"goog.i18n.DateTimePatterns_vun_TZ", "goog.i18n.DateTimePatterns_xog", "goog.i18n.DateTimePatterns_xog_UG", "goog.i18n.DateTimePatterns_yav", "goog.i18n.DateTimePatterns_yav_CM", "goog.i18n.DateTimePatterns_yo", "goog.i18n.DateTimePatterns_yo_NG", "goog.i18n.DateTimePatterns_zh_Hans", "goog.i18n.DateTimePatterns_zh_Hans_CN", "goog.i18n.DateTimePatterns_zh_Hans_HK", "goog.i18n.DateTimePatterns_zh_Hans_MO", "goog.i18n.DateTimePatterns_zh_Hans_SG", "goog.i18n.DateTimePatterns_zh_Hant", "goog.i18n.DateTimePatterns_zh_Hant_HK", 
"goog.i18n.DateTimePatterns_zh_Hant_MO", "goog.i18n.DateTimePatterns_zh_Hant_TW", "goog.i18n.DateTimePatterns_zu_ZA"], ["goog.i18n.DateTimePatterns"]);
goog.addDependency("i18n/datetimesymbols.js", ["goog.i18n.DateTimeSymbols", "goog.i18n.DateTimeSymbols_af", "goog.i18n.DateTimeSymbols_am", "goog.i18n.DateTimeSymbols_ar", "goog.i18n.DateTimeSymbols_bg", "goog.i18n.DateTimeSymbols_bn", "goog.i18n.DateTimeSymbols_br", "goog.i18n.DateTimeSymbols_ca", "goog.i18n.DateTimeSymbols_chr", "goog.i18n.DateTimeSymbols_cs", "goog.i18n.DateTimeSymbols_cy", "goog.i18n.DateTimeSymbols_da", "goog.i18n.DateTimeSymbols_de", "goog.i18n.DateTimeSymbols_de_AT", "goog.i18n.DateTimeSymbols_de_CH", 
"goog.i18n.DateTimeSymbols_el", "goog.i18n.DateTimeSymbols_en", "goog.i18n.DateTimeSymbols_en_AU", "goog.i18n.DateTimeSymbols_en_GB", "goog.i18n.DateTimeSymbols_en_IE", "goog.i18n.DateTimeSymbols_en_IN", "goog.i18n.DateTimeSymbols_en_ISO", "goog.i18n.DateTimeSymbols_en_SG", "goog.i18n.DateTimeSymbols_en_US", "goog.i18n.DateTimeSymbols_en_ZA", "goog.i18n.DateTimeSymbols_es", "goog.i18n.DateTimeSymbols_es_419", "goog.i18n.DateTimeSymbols_es_ES", "goog.i18n.DateTimeSymbols_et", "goog.i18n.DateTimeSymbols_eu", 
"goog.i18n.DateTimeSymbols_fa", "goog.i18n.DateTimeSymbols_fi", "goog.i18n.DateTimeSymbols_fil", "goog.i18n.DateTimeSymbols_fr", "goog.i18n.DateTimeSymbols_fr_CA", "goog.i18n.DateTimeSymbols_gl", "goog.i18n.DateTimeSymbols_gsw", "goog.i18n.DateTimeSymbols_gu", "goog.i18n.DateTimeSymbols_haw", "goog.i18n.DateTimeSymbols_he", "goog.i18n.DateTimeSymbols_hi", "goog.i18n.DateTimeSymbols_hr", "goog.i18n.DateTimeSymbols_hu", "goog.i18n.DateTimeSymbols_id", "goog.i18n.DateTimeSymbols_in", "goog.i18n.DateTimeSymbols_is", 
"goog.i18n.DateTimeSymbols_it", "goog.i18n.DateTimeSymbols_iw", "goog.i18n.DateTimeSymbols_ja", "goog.i18n.DateTimeSymbols_kn", "goog.i18n.DateTimeSymbols_ko", "goog.i18n.DateTimeSymbols_ln", "goog.i18n.DateTimeSymbols_lt", "goog.i18n.DateTimeSymbols_lv", "goog.i18n.DateTimeSymbols_ml", "goog.i18n.DateTimeSymbols_mr", "goog.i18n.DateTimeSymbols_ms", "goog.i18n.DateTimeSymbols_mt", "goog.i18n.DateTimeSymbols_nb", "goog.i18n.DateTimeSymbols_nl", "goog.i18n.DateTimeSymbols_no", "goog.i18n.DateTimeSymbols_or", 
"goog.i18n.DateTimeSymbols_pl", "goog.i18n.DateTimeSymbols_pt", "goog.i18n.DateTimeSymbols_pt_BR", "goog.i18n.DateTimeSymbols_pt_PT", "goog.i18n.DateTimeSymbols_ro", "goog.i18n.DateTimeSymbols_ru", "goog.i18n.DateTimeSymbols_sk", "goog.i18n.DateTimeSymbols_sl", "goog.i18n.DateTimeSymbols_sq", "goog.i18n.DateTimeSymbols_sr", "goog.i18n.DateTimeSymbols_sv", "goog.i18n.DateTimeSymbols_sw", "goog.i18n.DateTimeSymbols_ta", "goog.i18n.DateTimeSymbols_te", "goog.i18n.DateTimeSymbols_th", "goog.i18n.DateTimeSymbols_tl", 
"goog.i18n.DateTimeSymbols_tr", "goog.i18n.DateTimeSymbols_uk", "goog.i18n.DateTimeSymbols_ur", "goog.i18n.DateTimeSymbols_vi", "goog.i18n.DateTimeSymbols_zh", "goog.i18n.DateTimeSymbols_zh_CN", "goog.i18n.DateTimeSymbols_zh_HK", "goog.i18n.DateTimeSymbols_zh_TW", "goog.i18n.DateTimeSymbols_zu"], []);
goog.addDependency("i18n/datetimesymbolsext.js", ["goog.i18n.DateTimeSymbolsExt", "goog.i18n.DateTimeSymbols_aa", "goog.i18n.DateTimeSymbols_aa_DJ", "goog.i18n.DateTimeSymbols_aa_ER", "goog.i18n.DateTimeSymbols_aa_ET", "goog.i18n.DateTimeSymbols_af_NA", "goog.i18n.DateTimeSymbols_af_ZA", "goog.i18n.DateTimeSymbols_agq", "goog.i18n.DateTimeSymbols_agq_CM", "goog.i18n.DateTimeSymbols_ak", "goog.i18n.DateTimeSymbols_ak_GH", "goog.i18n.DateTimeSymbols_am_ET", "goog.i18n.DateTimeSymbols_ar_001", "goog.i18n.DateTimeSymbols_ar_AE", 
"goog.i18n.DateTimeSymbols_ar_BH", "goog.i18n.DateTimeSymbols_ar_DJ", "goog.i18n.DateTimeSymbols_ar_DZ", "goog.i18n.DateTimeSymbols_ar_EG", "goog.i18n.DateTimeSymbols_ar_EH", "goog.i18n.DateTimeSymbols_ar_ER", "goog.i18n.DateTimeSymbols_ar_IL", "goog.i18n.DateTimeSymbols_ar_IQ", "goog.i18n.DateTimeSymbols_ar_JO", "goog.i18n.DateTimeSymbols_ar_KM", "goog.i18n.DateTimeSymbols_ar_KW", "goog.i18n.DateTimeSymbols_ar_LB", "goog.i18n.DateTimeSymbols_ar_LY", "goog.i18n.DateTimeSymbols_ar_MA", "goog.i18n.DateTimeSymbols_ar_MR", 
"goog.i18n.DateTimeSymbols_ar_OM", "goog.i18n.DateTimeSymbols_ar_PS", "goog.i18n.DateTimeSymbols_ar_QA", "goog.i18n.DateTimeSymbols_ar_SA", "goog.i18n.DateTimeSymbols_ar_SD", "goog.i18n.DateTimeSymbols_ar_SO", "goog.i18n.DateTimeSymbols_ar_SY", "goog.i18n.DateTimeSymbols_ar_TD", "goog.i18n.DateTimeSymbols_ar_TN", "goog.i18n.DateTimeSymbols_ar_YE", "goog.i18n.DateTimeSymbols_as", "goog.i18n.DateTimeSymbols_as_IN", "goog.i18n.DateTimeSymbols_asa", "goog.i18n.DateTimeSymbols_asa_TZ", "goog.i18n.DateTimeSymbols_ast", 
"goog.i18n.DateTimeSymbols_ast_ES", "goog.i18n.DateTimeSymbols_az", "goog.i18n.DateTimeSymbols_az_Cyrl", "goog.i18n.DateTimeSymbols_az_Cyrl_AZ", "goog.i18n.DateTimeSymbols_az_Latn", "goog.i18n.DateTimeSymbols_az_Latn_AZ", "goog.i18n.DateTimeSymbols_bas", "goog.i18n.DateTimeSymbols_bas_CM", "goog.i18n.DateTimeSymbols_be", "goog.i18n.DateTimeSymbols_be_BY", "goog.i18n.DateTimeSymbols_bem", "goog.i18n.DateTimeSymbols_bem_ZM", "goog.i18n.DateTimeSymbols_bez", "goog.i18n.DateTimeSymbols_bez_TZ", "goog.i18n.DateTimeSymbols_bg_BG", 
"goog.i18n.DateTimeSymbols_bm", "goog.i18n.DateTimeSymbols_bm_ML", "goog.i18n.DateTimeSymbols_bn_BD", "goog.i18n.DateTimeSymbols_bn_IN", "goog.i18n.DateTimeSymbols_bo", "goog.i18n.DateTimeSymbols_bo_CN", "goog.i18n.DateTimeSymbols_bo_IN", "goog.i18n.DateTimeSymbols_br_FR", "goog.i18n.DateTimeSymbols_brx", "goog.i18n.DateTimeSymbols_brx_IN", "goog.i18n.DateTimeSymbols_bs", "goog.i18n.DateTimeSymbols_bs_Cyrl", "goog.i18n.DateTimeSymbols_bs_Cyrl_BA", "goog.i18n.DateTimeSymbols_bs_Latn", "goog.i18n.DateTimeSymbols_bs_Latn_BA", 
"goog.i18n.DateTimeSymbols_byn", "goog.i18n.DateTimeSymbols_byn_ER", "goog.i18n.DateTimeSymbols_ca_AD", "goog.i18n.DateTimeSymbols_ca_ES", "goog.i18n.DateTimeSymbols_cgg", "goog.i18n.DateTimeSymbols_cgg_UG", "goog.i18n.DateTimeSymbols_chr_US", "goog.i18n.DateTimeSymbols_ckb", "goog.i18n.DateTimeSymbols_ckb_Arab", "goog.i18n.DateTimeSymbols_ckb_Arab_IQ", "goog.i18n.DateTimeSymbols_ckb_Arab_IR", "goog.i18n.DateTimeSymbols_ckb_IQ", "goog.i18n.DateTimeSymbols_ckb_IR", "goog.i18n.DateTimeSymbols_ckb_Latn", 
"goog.i18n.DateTimeSymbols_ckb_Latn_IQ", "goog.i18n.DateTimeSymbols_cs_CZ", "goog.i18n.DateTimeSymbols_cy_GB", "goog.i18n.DateTimeSymbols_da_DK", "goog.i18n.DateTimeSymbols_dav", "goog.i18n.DateTimeSymbols_dav_KE", "goog.i18n.DateTimeSymbols_de_BE", "goog.i18n.DateTimeSymbols_de_DE", "goog.i18n.DateTimeSymbols_de_LI", "goog.i18n.DateTimeSymbols_de_LU", "goog.i18n.DateTimeSymbols_dje", "goog.i18n.DateTimeSymbols_dje_NE", "goog.i18n.DateTimeSymbols_dua", "goog.i18n.DateTimeSymbols_dua_CM", "goog.i18n.DateTimeSymbols_dyo", 
"goog.i18n.DateTimeSymbols_dyo_SN", "goog.i18n.DateTimeSymbols_dz", "goog.i18n.DateTimeSymbols_dz_BT", "goog.i18n.DateTimeSymbols_ebu", "goog.i18n.DateTimeSymbols_ebu_KE", "goog.i18n.DateTimeSymbols_ee", "goog.i18n.DateTimeSymbols_ee_GH", "goog.i18n.DateTimeSymbols_ee_TG", "goog.i18n.DateTimeSymbols_el_CY", "goog.i18n.DateTimeSymbols_el_GR", "goog.i18n.DateTimeSymbols_en_150", "goog.i18n.DateTimeSymbols_en_AG", "goog.i18n.DateTimeSymbols_en_AS", "goog.i18n.DateTimeSymbols_en_BB", "goog.i18n.DateTimeSymbols_en_BE", 
"goog.i18n.DateTimeSymbols_en_BM", "goog.i18n.DateTimeSymbols_en_BS", "goog.i18n.DateTimeSymbols_en_BW", "goog.i18n.DateTimeSymbols_en_BZ", "goog.i18n.DateTimeSymbols_en_CA", "goog.i18n.DateTimeSymbols_en_CM", "goog.i18n.DateTimeSymbols_en_DM", "goog.i18n.DateTimeSymbols_en_Dsrt", "goog.i18n.DateTimeSymbols_en_Dsrt_US", "goog.i18n.DateTimeSymbols_en_FJ", "goog.i18n.DateTimeSymbols_en_FM", "goog.i18n.DateTimeSymbols_en_GD", "goog.i18n.DateTimeSymbols_en_GG", "goog.i18n.DateTimeSymbols_en_GH", "goog.i18n.DateTimeSymbols_en_GI", 
"goog.i18n.DateTimeSymbols_en_GM", "goog.i18n.DateTimeSymbols_en_GU", "goog.i18n.DateTimeSymbols_en_GY", "goog.i18n.DateTimeSymbols_en_HK", "goog.i18n.DateTimeSymbols_en_IM", "goog.i18n.DateTimeSymbols_en_JE", "goog.i18n.DateTimeSymbols_en_JM", "goog.i18n.DateTimeSymbols_en_KE", "goog.i18n.DateTimeSymbols_en_KI", "goog.i18n.DateTimeSymbols_en_KN", "goog.i18n.DateTimeSymbols_en_KY", "goog.i18n.DateTimeSymbols_en_LC", "goog.i18n.DateTimeSymbols_en_LR", "goog.i18n.DateTimeSymbols_en_LS", "goog.i18n.DateTimeSymbols_en_MG", 
"goog.i18n.DateTimeSymbols_en_MH", "goog.i18n.DateTimeSymbols_en_MP", "goog.i18n.DateTimeSymbols_en_MT", "goog.i18n.DateTimeSymbols_en_MU", "goog.i18n.DateTimeSymbols_en_MW", "goog.i18n.DateTimeSymbols_en_NA", "goog.i18n.DateTimeSymbols_en_NG", "goog.i18n.DateTimeSymbols_en_NZ", "goog.i18n.DateTimeSymbols_en_PG", "goog.i18n.DateTimeSymbols_en_PH", "goog.i18n.DateTimeSymbols_en_PK", "goog.i18n.DateTimeSymbols_en_PR", "goog.i18n.DateTimeSymbols_en_PW", "goog.i18n.DateTimeSymbols_en_SB", "goog.i18n.DateTimeSymbols_en_SC", 
"goog.i18n.DateTimeSymbols_en_SL", "goog.i18n.DateTimeSymbols_en_SS", "goog.i18n.DateTimeSymbols_en_SZ", "goog.i18n.DateTimeSymbols_en_TC", "goog.i18n.DateTimeSymbols_en_TO", "goog.i18n.DateTimeSymbols_en_TT", "goog.i18n.DateTimeSymbols_en_TZ", "goog.i18n.DateTimeSymbols_en_UG", "goog.i18n.DateTimeSymbols_en_UM", "goog.i18n.DateTimeSymbols_en_VC", "goog.i18n.DateTimeSymbols_en_VG", "goog.i18n.DateTimeSymbols_en_VI", "goog.i18n.DateTimeSymbols_en_VU", "goog.i18n.DateTimeSymbols_en_WS", "goog.i18n.DateTimeSymbols_en_ZM", 
"goog.i18n.DateTimeSymbols_en_ZW", "goog.i18n.DateTimeSymbols_eo", "goog.i18n.DateTimeSymbols_es_AR", "goog.i18n.DateTimeSymbols_es_BO", "goog.i18n.DateTimeSymbols_es_CL", "goog.i18n.DateTimeSymbols_es_CO", "goog.i18n.DateTimeSymbols_es_CR", "goog.i18n.DateTimeSymbols_es_CU", "goog.i18n.DateTimeSymbols_es_DO", "goog.i18n.DateTimeSymbols_es_EA", "goog.i18n.DateTimeSymbols_es_EC", "goog.i18n.DateTimeSymbols_es_GQ", "goog.i18n.DateTimeSymbols_es_GT", "goog.i18n.DateTimeSymbols_es_HN", "goog.i18n.DateTimeSymbols_es_IC", 
"goog.i18n.DateTimeSymbols_es_MX", "goog.i18n.DateTimeSymbols_es_NI", "goog.i18n.DateTimeSymbols_es_PA", "goog.i18n.DateTimeSymbols_es_PE", "goog.i18n.DateTimeSymbols_es_PH", "goog.i18n.DateTimeSymbols_es_PR", "goog.i18n.DateTimeSymbols_es_PY", "goog.i18n.DateTimeSymbols_es_SV", "goog.i18n.DateTimeSymbols_es_US", "goog.i18n.DateTimeSymbols_es_UY", "goog.i18n.DateTimeSymbols_es_VE", "goog.i18n.DateTimeSymbols_et_EE", "goog.i18n.DateTimeSymbols_eu_ES", "goog.i18n.DateTimeSymbols_ewo", "goog.i18n.DateTimeSymbols_ewo_CM", 
"goog.i18n.DateTimeSymbols_fa_AF", "goog.i18n.DateTimeSymbols_fa_IR", "goog.i18n.DateTimeSymbols_ff", "goog.i18n.DateTimeSymbols_ff_SN", "goog.i18n.DateTimeSymbols_fi_FI", "goog.i18n.DateTimeSymbols_fil_PH", "goog.i18n.DateTimeSymbols_fo", "goog.i18n.DateTimeSymbols_fo_FO", "goog.i18n.DateTimeSymbols_fr_BE", "goog.i18n.DateTimeSymbols_fr_BF", "goog.i18n.DateTimeSymbols_fr_BI", "goog.i18n.DateTimeSymbols_fr_BJ", "goog.i18n.DateTimeSymbols_fr_BL", "goog.i18n.DateTimeSymbols_fr_CD", "goog.i18n.DateTimeSymbols_fr_CF", 
"goog.i18n.DateTimeSymbols_fr_CG", "goog.i18n.DateTimeSymbols_fr_CH", "goog.i18n.DateTimeSymbols_fr_CI", "goog.i18n.DateTimeSymbols_fr_CM", "goog.i18n.DateTimeSymbols_fr_DJ", "goog.i18n.DateTimeSymbols_fr_DZ", "goog.i18n.DateTimeSymbols_fr_FR", "goog.i18n.DateTimeSymbols_fr_GA", "goog.i18n.DateTimeSymbols_fr_GF", "goog.i18n.DateTimeSymbols_fr_GN", "goog.i18n.DateTimeSymbols_fr_GP", "goog.i18n.DateTimeSymbols_fr_GQ", "goog.i18n.DateTimeSymbols_fr_HT", "goog.i18n.DateTimeSymbols_fr_KM", "goog.i18n.DateTimeSymbols_fr_LU", 
"goog.i18n.DateTimeSymbols_fr_MA", "goog.i18n.DateTimeSymbols_fr_MC", "goog.i18n.DateTimeSymbols_fr_MF", "goog.i18n.DateTimeSymbols_fr_MG", "goog.i18n.DateTimeSymbols_fr_ML", "goog.i18n.DateTimeSymbols_fr_MQ", "goog.i18n.DateTimeSymbols_fr_MR", "goog.i18n.DateTimeSymbols_fr_MU", "goog.i18n.DateTimeSymbols_fr_NC", "goog.i18n.DateTimeSymbols_fr_NE", "goog.i18n.DateTimeSymbols_fr_PF", "goog.i18n.DateTimeSymbols_fr_RE", "goog.i18n.DateTimeSymbols_fr_RW", "goog.i18n.DateTimeSymbols_fr_SC", "goog.i18n.DateTimeSymbols_fr_SN", 
"goog.i18n.DateTimeSymbols_fr_SY", "goog.i18n.DateTimeSymbols_fr_TD", "goog.i18n.DateTimeSymbols_fr_TG", "goog.i18n.DateTimeSymbols_fr_TN", "goog.i18n.DateTimeSymbols_fr_VU", "goog.i18n.DateTimeSymbols_fr_YT", "goog.i18n.DateTimeSymbols_fur", "goog.i18n.DateTimeSymbols_fur_IT", "goog.i18n.DateTimeSymbols_ga", "goog.i18n.DateTimeSymbols_ga_IE", "goog.i18n.DateTimeSymbols_gd", "goog.i18n.DateTimeSymbols_gd_GB", "goog.i18n.DateTimeSymbols_gl_ES", "goog.i18n.DateTimeSymbols_gsw_CH", "goog.i18n.DateTimeSymbols_gu_IN", 
"goog.i18n.DateTimeSymbols_guz", "goog.i18n.DateTimeSymbols_guz_KE", "goog.i18n.DateTimeSymbols_gv", "goog.i18n.DateTimeSymbols_gv_GB", "goog.i18n.DateTimeSymbols_ha", "goog.i18n.DateTimeSymbols_ha_Latn", "goog.i18n.DateTimeSymbols_ha_Latn_GH", "goog.i18n.DateTimeSymbols_ha_Latn_NE", "goog.i18n.DateTimeSymbols_ha_Latn_NG", "goog.i18n.DateTimeSymbols_haw_US", "goog.i18n.DateTimeSymbols_he_IL", "goog.i18n.DateTimeSymbols_hi_IN", "goog.i18n.DateTimeSymbols_hr_BA", "goog.i18n.DateTimeSymbols_hr_HR", 
"goog.i18n.DateTimeSymbols_hu_HU", "goog.i18n.DateTimeSymbols_hy", "goog.i18n.DateTimeSymbols_hy_AM", "goog.i18n.DateTimeSymbols_ia", "goog.i18n.DateTimeSymbols_id_ID", "goog.i18n.DateTimeSymbols_ig", "goog.i18n.DateTimeSymbols_ig_NG", "goog.i18n.DateTimeSymbols_ii", "goog.i18n.DateTimeSymbols_ii_CN", "goog.i18n.DateTimeSymbols_is_IS", "goog.i18n.DateTimeSymbols_it_CH", "goog.i18n.DateTimeSymbols_it_IT", "goog.i18n.DateTimeSymbols_it_SM", "goog.i18n.DateTimeSymbols_ja_JP", "goog.i18n.DateTimeSymbols_jgo", 
"goog.i18n.DateTimeSymbols_jgo_CM", "goog.i18n.DateTimeSymbols_jmc", "goog.i18n.DateTimeSymbols_jmc_TZ", "goog.i18n.DateTimeSymbols_ka", "goog.i18n.DateTimeSymbols_ka_GE", "goog.i18n.DateTimeSymbols_kab", "goog.i18n.DateTimeSymbols_kab_DZ", "goog.i18n.DateTimeSymbols_kam", "goog.i18n.DateTimeSymbols_kam_KE", "goog.i18n.DateTimeSymbols_kde", "goog.i18n.DateTimeSymbols_kde_TZ", "goog.i18n.DateTimeSymbols_kea", "goog.i18n.DateTimeSymbols_kea_CV", "goog.i18n.DateTimeSymbols_khq", "goog.i18n.DateTimeSymbols_khq_ML", 
"goog.i18n.DateTimeSymbols_ki", "goog.i18n.DateTimeSymbols_ki_KE", "goog.i18n.DateTimeSymbols_kk", "goog.i18n.DateTimeSymbols_kk_Cyrl", "goog.i18n.DateTimeSymbols_kk_Cyrl_KZ", "goog.i18n.DateTimeSymbols_kkj", "goog.i18n.DateTimeSymbols_kkj_CM", "goog.i18n.DateTimeSymbols_kl", "goog.i18n.DateTimeSymbols_kl_GL", "goog.i18n.DateTimeSymbols_kln", "goog.i18n.DateTimeSymbols_kln_KE", "goog.i18n.DateTimeSymbols_km", "goog.i18n.DateTimeSymbols_km_KH", "goog.i18n.DateTimeSymbols_kn_IN", "goog.i18n.DateTimeSymbols_ko_KP", 
"goog.i18n.DateTimeSymbols_ko_KR", "goog.i18n.DateTimeSymbols_kok", "goog.i18n.DateTimeSymbols_kok_IN", "goog.i18n.DateTimeSymbols_ks", "goog.i18n.DateTimeSymbols_ks_Arab", "goog.i18n.DateTimeSymbols_ks_Arab_IN", "goog.i18n.DateTimeSymbols_ksb", "goog.i18n.DateTimeSymbols_ksb_TZ", "goog.i18n.DateTimeSymbols_ksf", "goog.i18n.DateTimeSymbols_ksf_CM", "goog.i18n.DateTimeSymbols_ksh", "goog.i18n.DateTimeSymbols_ksh_DE", "goog.i18n.DateTimeSymbols_kw", "goog.i18n.DateTimeSymbols_kw_GB", "goog.i18n.DateTimeSymbols_ky", 
"goog.i18n.DateTimeSymbols_ky_KG", "goog.i18n.DateTimeSymbols_lag", "goog.i18n.DateTimeSymbols_lag_TZ", "goog.i18n.DateTimeSymbols_lg", "goog.i18n.DateTimeSymbols_lg_UG", "goog.i18n.DateTimeSymbols_ln_AO", "goog.i18n.DateTimeSymbols_ln_CD", "goog.i18n.DateTimeSymbols_ln_CF", "goog.i18n.DateTimeSymbols_ln_CG", "goog.i18n.DateTimeSymbols_lo", "goog.i18n.DateTimeSymbols_lo_LA", "goog.i18n.DateTimeSymbols_lt_LT", "goog.i18n.DateTimeSymbols_lu", "goog.i18n.DateTimeSymbols_lu_CD", "goog.i18n.DateTimeSymbols_luo", 
"goog.i18n.DateTimeSymbols_luo_KE", "goog.i18n.DateTimeSymbols_luy", "goog.i18n.DateTimeSymbols_luy_KE", "goog.i18n.DateTimeSymbols_lv_LV", "goog.i18n.DateTimeSymbols_mas", "goog.i18n.DateTimeSymbols_mas_KE", "goog.i18n.DateTimeSymbols_mas_TZ", "goog.i18n.DateTimeSymbols_mer", "goog.i18n.DateTimeSymbols_mer_KE", "goog.i18n.DateTimeSymbols_mfe", "goog.i18n.DateTimeSymbols_mfe_MU", "goog.i18n.DateTimeSymbols_mg", "goog.i18n.DateTimeSymbols_mg_MG", "goog.i18n.DateTimeSymbols_mgh", "goog.i18n.DateTimeSymbols_mgh_MZ", 
"goog.i18n.DateTimeSymbols_mgo", "goog.i18n.DateTimeSymbols_mgo_CM", "goog.i18n.DateTimeSymbols_mk", "goog.i18n.DateTimeSymbols_mk_MK", "goog.i18n.DateTimeSymbols_ml_IN", "goog.i18n.DateTimeSymbols_mr_IN", "goog.i18n.DateTimeSymbols_ms_BN", "goog.i18n.DateTimeSymbols_ms_MY", "goog.i18n.DateTimeSymbols_ms_SG", "goog.i18n.DateTimeSymbols_mt_MT", "goog.i18n.DateTimeSymbols_mua", "goog.i18n.DateTimeSymbols_mua_CM", "goog.i18n.DateTimeSymbols_my", "goog.i18n.DateTimeSymbols_my_MM", "goog.i18n.DateTimeSymbols_naq", 
"goog.i18n.DateTimeSymbols_naq_NA", "goog.i18n.DateTimeSymbols_nb_NO", "goog.i18n.DateTimeSymbols_nd", "goog.i18n.DateTimeSymbols_nd_ZW", "goog.i18n.DateTimeSymbols_ne", "goog.i18n.DateTimeSymbols_ne_IN", "goog.i18n.DateTimeSymbols_ne_NP", "goog.i18n.DateTimeSymbols_nl_AW", "goog.i18n.DateTimeSymbols_nl_BE", "goog.i18n.DateTimeSymbols_nl_CW", "goog.i18n.DateTimeSymbols_nl_NL", "goog.i18n.DateTimeSymbols_nl_SR", "goog.i18n.DateTimeSymbols_nl_SX", "goog.i18n.DateTimeSymbols_nmg", "goog.i18n.DateTimeSymbols_nmg_CM", 
"goog.i18n.DateTimeSymbols_nn", "goog.i18n.DateTimeSymbols_nn_NO", "goog.i18n.DateTimeSymbols_nnh", "goog.i18n.DateTimeSymbols_nnh_CM", "goog.i18n.DateTimeSymbols_nr", "goog.i18n.DateTimeSymbols_nr_ZA", "goog.i18n.DateTimeSymbols_nso", "goog.i18n.DateTimeSymbols_nso_ZA", "goog.i18n.DateTimeSymbols_nus", "goog.i18n.DateTimeSymbols_nus_SD", "goog.i18n.DateTimeSymbols_nyn", "goog.i18n.DateTimeSymbols_nyn_UG", "goog.i18n.DateTimeSymbols_om", "goog.i18n.DateTimeSymbols_om_ET", "goog.i18n.DateTimeSymbols_om_KE", 
"goog.i18n.DateTimeSymbols_or_IN", "goog.i18n.DateTimeSymbols_os", "goog.i18n.DateTimeSymbols_os_GE", "goog.i18n.DateTimeSymbols_os_RU", "goog.i18n.DateTimeSymbols_pa", "goog.i18n.DateTimeSymbols_pa_Arab", "goog.i18n.DateTimeSymbols_pa_Arab_PK", "goog.i18n.DateTimeSymbols_pa_Guru", "goog.i18n.DateTimeSymbols_pa_Guru_IN", "goog.i18n.DateTimeSymbols_pl_PL", "goog.i18n.DateTimeSymbols_ps", "goog.i18n.DateTimeSymbols_ps_AF", "goog.i18n.DateTimeSymbols_pt_AO", "goog.i18n.DateTimeSymbols_pt_CV", "goog.i18n.DateTimeSymbols_pt_GW", 
"goog.i18n.DateTimeSymbols_pt_MO", "goog.i18n.DateTimeSymbols_pt_MZ", "goog.i18n.DateTimeSymbols_pt_ST", "goog.i18n.DateTimeSymbols_pt_TL", "goog.i18n.DateTimeSymbols_rm", "goog.i18n.DateTimeSymbols_rm_CH", "goog.i18n.DateTimeSymbols_rn", "goog.i18n.DateTimeSymbols_rn_BI", "goog.i18n.DateTimeSymbols_ro_MD", "goog.i18n.DateTimeSymbols_ro_RO", "goog.i18n.DateTimeSymbols_rof", "goog.i18n.DateTimeSymbols_rof_TZ", "goog.i18n.DateTimeSymbols_ru_BY", "goog.i18n.DateTimeSymbols_ru_KG", "goog.i18n.DateTimeSymbols_ru_KZ", 
"goog.i18n.DateTimeSymbols_ru_MD", "goog.i18n.DateTimeSymbols_ru_RU", "goog.i18n.DateTimeSymbols_ru_UA", "goog.i18n.DateTimeSymbols_rw", "goog.i18n.DateTimeSymbols_rw_RW", "goog.i18n.DateTimeSymbols_rwk", "goog.i18n.DateTimeSymbols_rwk_TZ", "goog.i18n.DateTimeSymbols_sah", "goog.i18n.DateTimeSymbols_sah_RU", "goog.i18n.DateTimeSymbols_saq", "goog.i18n.DateTimeSymbols_saq_KE", "goog.i18n.DateTimeSymbols_sbp", "goog.i18n.DateTimeSymbols_sbp_TZ", "goog.i18n.DateTimeSymbols_se", "goog.i18n.DateTimeSymbols_se_FI", 
"goog.i18n.DateTimeSymbols_se_NO", "goog.i18n.DateTimeSymbols_seh", "goog.i18n.DateTimeSymbols_seh_MZ", "goog.i18n.DateTimeSymbols_ses", "goog.i18n.DateTimeSymbols_ses_ML", "goog.i18n.DateTimeSymbols_sg", "goog.i18n.DateTimeSymbols_sg_CF", "goog.i18n.DateTimeSymbols_shi", "goog.i18n.DateTimeSymbols_shi_Latn", "goog.i18n.DateTimeSymbols_shi_Latn_MA", "goog.i18n.DateTimeSymbols_shi_Tfng", "goog.i18n.DateTimeSymbols_shi_Tfng_MA", "goog.i18n.DateTimeSymbols_si", "goog.i18n.DateTimeSymbols_si_LK", "goog.i18n.DateTimeSymbols_sk_SK", 
"goog.i18n.DateTimeSymbols_sl_SI", "goog.i18n.DateTimeSymbols_sn", "goog.i18n.DateTimeSymbols_sn_ZW", "goog.i18n.DateTimeSymbols_so", "goog.i18n.DateTimeSymbols_so_DJ", "goog.i18n.DateTimeSymbols_so_ET", "goog.i18n.DateTimeSymbols_so_KE", "goog.i18n.DateTimeSymbols_so_SO", "goog.i18n.DateTimeSymbols_sq_AL", "goog.i18n.DateTimeSymbols_sq_MK", "goog.i18n.DateTimeSymbols_sr_Cyrl", "goog.i18n.DateTimeSymbols_sr_Cyrl_BA", "goog.i18n.DateTimeSymbols_sr_Cyrl_ME", "goog.i18n.DateTimeSymbols_sr_Cyrl_RS", 
"goog.i18n.DateTimeSymbols_sr_Latn", "goog.i18n.DateTimeSymbols_sr_Latn_BA", "goog.i18n.DateTimeSymbols_sr_Latn_ME", "goog.i18n.DateTimeSymbols_sr_Latn_RS", "goog.i18n.DateTimeSymbols_ss", "goog.i18n.DateTimeSymbols_ss_SZ", "goog.i18n.DateTimeSymbols_ss_ZA", "goog.i18n.DateTimeSymbols_ssy", "goog.i18n.DateTimeSymbols_ssy_ER", "goog.i18n.DateTimeSymbols_st", "goog.i18n.DateTimeSymbols_st_LS", "goog.i18n.DateTimeSymbols_st_ZA", "goog.i18n.DateTimeSymbols_sv_AX", "goog.i18n.DateTimeSymbols_sv_FI", "goog.i18n.DateTimeSymbols_sv_SE", 
"goog.i18n.DateTimeSymbols_sw_KE", "goog.i18n.DateTimeSymbols_sw_TZ", "goog.i18n.DateTimeSymbols_sw_UG", "goog.i18n.DateTimeSymbols_swc", "goog.i18n.DateTimeSymbols_swc_CD", "goog.i18n.DateTimeSymbols_ta_IN", "goog.i18n.DateTimeSymbols_ta_LK", "goog.i18n.DateTimeSymbols_ta_MY", "goog.i18n.DateTimeSymbols_ta_SG", "goog.i18n.DateTimeSymbols_te_IN", "goog.i18n.DateTimeSymbols_teo", "goog.i18n.DateTimeSymbols_teo_KE", "goog.i18n.DateTimeSymbols_teo_UG", "goog.i18n.DateTimeSymbols_tg", "goog.i18n.DateTimeSymbols_tg_Cyrl", 
"goog.i18n.DateTimeSymbols_tg_Cyrl_TJ", "goog.i18n.DateTimeSymbols_th_TH", "goog.i18n.DateTimeSymbols_ti", "goog.i18n.DateTimeSymbols_ti_ER", "goog.i18n.DateTimeSymbols_ti_ET", "goog.i18n.DateTimeSymbols_tig", "goog.i18n.DateTimeSymbols_tig_ER", "goog.i18n.DateTimeSymbols_tn", "goog.i18n.DateTimeSymbols_tn_BW", "goog.i18n.DateTimeSymbols_tn_ZA", "goog.i18n.DateTimeSymbols_to", "goog.i18n.DateTimeSymbols_to_TO", "goog.i18n.DateTimeSymbols_tr_CY", "goog.i18n.DateTimeSymbols_tr_TR", "goog.i18n.DateTimeSymbols_ts", 
"goog.i18n.DateTimeSymbols_ts_ZA", "goog.i18n.DateTimeSymbols_twq", "goog.i18n.DateTimeSymbols_twq_NE", "goog.i18n.DateTimeSymbols_tzm", "goog.i18n.DateTimeSymbols_tzm_Latn", "goog.i18n.DateTimeSymbols_tzm_Latn_MA", "goog.i18n.DateTimeSymbols_uk_UA", "goog.i18n.DateTimeSymbols_ur_IN", "goog.i18n.DateTimeSymbols_ur_PK", "goog.i18n.DateTimeSymbols_uz", "goog.i18n.DateTimeSymbols_uz_Arab", "goog.i18n.DateTimeSymbols_uz_Arab_AF", "goog.i18n.DateTimeSymbols_uz_Cyrl", "goog.i18n.DateTimeSymbols_uz_Cyrl_UZ", 
"goog.i18n.DateTimeSymbols_uz_Latn", "goog.i18n.DateTimeSymbols_uz_Latn_UZ", "goog.i18n.DateTimeSymbols_vai", "goog.i18n.DateTimeSymbols_vai_Latn", "goog.i18n.DateTimeSymbols_vai_Latn_LR", "goog.i18n.DateTimeSymbols_vai_Vaii", "goog.i18n.DateTimeSymbols_vai_Vaii_LR", "goog.i18n.DateTimeSymbols_ve", "goog.i18n.DateTimeSymbols_ve_ZA", "goog.i18n.DateTimeSymbols_vi_VN", "goog.i18n.DateTimeSymbols_vo", "goog.i18n.DateTimeSymbols_vun", "goog.i18n.DateTimeSymbols_vun_TZ", "goog.i18n.DateTimeSymbols_wae", 
"goog.i18n.DateTimeSymbols_wae_CH", "goog.i18n.DateTimeSymbols_wal", "goog.i18n.DateTimeSymbols_wal_ET", "goog.i18n.DateTimeSymbols_xh", "goog.i18n.DateTimeSymbols_xh_ZA", "goog.i18n.DateTimeSymbols_xog", "goog.i18n.DateTimeSymbols_xog_UG", "goog.i18n.DateTimeSymbols_yav", "goog.i18n.DateTimeSymbols_yav_CM", "goog.i18n.DateTimeSymbols_yo", "goog.i18n.DateTimeSymbols_yo_NG", "goog.i18n.DateTimeSymbols_zh_Hans", "goog.i18n.DateTimeSymbols_zh_Hans_CN", "goog.i18n.DateTimeSymbols_zh_Hans_HK", "goog.i18n.DateTimeSymbols_zh_Hans_MO", 
"goog.i18n.DateTimeSymbols_zh_Hans_SG", "goog.i18n.DateTimeSymbols_zh_Hant", "goog.i18n.DateTimeSymbols_zh_Hant_HK", "goog.i18n.DateTimeSymbols_zh_Hant_MO", "goog.i18n.DateTimeSymbols_zh_Hant_TW", "goog.i18n.DateTimeSymbols_zu_ZA"], ["goog.i18n.DateTimeSymbols"]);
goog.addDependency("i18n/graphemebreak.js", ["goog.i18n.GraphemeBreak"], ["goog.structs.InversionMap"]);
goog.addDependency("i18n/messageformat.js", ["goog.i18n.MessageFormat"], ["goog.asserts", "goog.i18n.NumberFormat", "goog.i18n.ordinalRules", "goog.i18n.pluralRules"]);
goog.addDependency("i18n/mime.js", ["goog.i18n.mime", "goog.i18n.mime.encode"], ["goog.array"]);
goog.addDependency("i18n/numberformat.js", ["goog.i18n.NumberFormat", "goog.i18n.NumberFormat.CurrencyStyle", "goog.i18n.NumberFormat.Format"], ["goog.i18n.CompactNumberFormatSymbols", "goog.i18n.NumberFormatSymbols", "goog.i18n.currency"]);
goog.addDependency("i18n/numberformatsymbols.js", ["goog.i18n.NumberFormatSymbols", "goog.i18n.NumberFormatSymbols_af", "goog.i18n.NumberFormatSymbols_af_ZA", "goog.i18n.NumberFormatSymbols_am", "goog.i18n.NumberFormatSymbols_am_ET", "goog.i18n.NumberFormatSymbols_ar", "goog.i18n.NumberFormatSymbols_ar_001", "goog.i18n.NumberFormatSymbols_ar_EG", "goog.i18n.NumberFormatSymbols_bg", "goog.i18n.NumberFormatSymbols_bg_BG", "goog.i18n.NumberFormatSymbols_bn", "goog.i18n.NumberFormatSymbols_bn_BD", "goog.i18n.NumberFormatSymbols_br", 
"goog.i18n.NumberFormatSymbols_br_FR", "goog.i18n.NumberFormatSymbols_ca", "goog.i18n.NumberFormatSymbols_ca_AD", "goog.i18n.NumberFormatSymbols_ca_ES", "goog.i18n.NumberFormatSymbols_chr", "goog.i18n.NumberFormatSymbols_chr_US", "goog.i18n.NumberFormatSymbols_cs", "goog.i18n.NumberFormatSymbols_cs_CZ", "goog.i18n.NumberFormatSymbols_cy", "goog.i18n.NumberFormatSymbols_cy_GB", "goog.i18n.NumberFormatSymbols_da", "goog.i18n.NumberFormatSymbols_da_DK", "goog.i18n.NumberFormatSymbols_de", "goog.i18n.NumberFormatSymbols_de_AT", 
"goog.i18n.NumberFormatSymbols_de_BE", "goog.i18n.NumberFormatSymbols_de_CH", "goog.i18n.NumberFormatSymbols_de_DE", "goog.i18n.NumberFormatSymbols_de_LU", "goog.i18n.NumberFormatSymbols_el", "goog.i18n.NumberFormatSymbols_el_GR", "goog.i18n.NumberFormatSymbols_en", "goog.i18n.NumberFormatSymbols_en_AS", "goog.i18n.NumberFormatSymbols_en_AU", "goog.i18n.NumberFormatSymbols_en_Dsrt_US", "goog.i18n.NumberFormatSymbols_en_FM", "goog.i18n.NumberFormatSymbols_en_GB", "goog.i18n.NumberFormatSymbols_en_GU", 
"goog.i18n.NumberFormatSymbols_en_IE", "goog.i18n.NumberFormatSymbols_en_IN", "goog.i18n.NumberFormatSymbols_en_MH", "goog.i18n.NumberFormatSymbols_en_MP", "goog.i18n.NumberFormatSymbols_en_PR", "goog.i18n.NumberFormatSymbols_en_PW", "goog.i18n.NumberFormatSymbols_en_SG", "goog.i18n.NumberFormatSymbols_en_TC", "goog.i18n.NumberFormatSymbols_en_UM", "goog.i18n.NumberFormatSymbols_en_US", "goog.i18n.NumberFormatSymbols_en_VG", "goog.i18n.NumberFormatSymbols_en_VI", "goog.i18n.NumberFormatSymbols_en_ZA", 
"goog.i18n.NumberFormatSymbols_es", "goog.i18n.NumberFormatSymbols_es_419", "goog.i18n.NumberFormatSymbols_es_EA", "goog.i18n.NumberFormatSymbols_es_ES", "goog.i18n.NumberFormatSymbols_es_IC", "goog.i18n.NumberFormatSymbols_et", "goog.i18n.NumberFormatSymbols_et_EE", "goog.i18n.NumberFormatSymbols_eu", "goog.i18n.NumberFormatSymbols_eu_ES", "goog.i18n.NumberFormatSymbols_fa", "goog.i18n.NumberFormatSymbols_fa_IR", "goog.i18n.NumberFormatSymbols_fi", "goog.i18n.NumberFormatSymbols_fi_FI", "goog.i18n.NumberFormatSymbols_fil", 
"goog.i18n.NumberFormatSymbols_fil_PH", "goog.i18n.NumberFormatSymbols_fr", "goog.i18n.NumberFormatSymbols_fr_BL", "goog.i18n.NumberFormatSymbols_fr_CA", "goog.i18n.NumberFormatSymbols_fr_FR", "goog.i18n.NumberFormatSymbols_fr_GF", "goog.i18n.NumberFormatSymbols_fr_GP", "goog.i18n.NumberFormatSymbols_fr_MC", "goog.i18n.NumberFormatSymbols_fr_MF", "goog.i18n.NumberFormatSymbols_fr_MQ", "goog.i18n.NumberFormatSymbols_fr_RE", "goog.i18n.NumberFormatSymbols_fr_YT", "goog.i18n.NumberFormatSymbols_gl", 
"goog.i18n.NumberFormatSymbols_gl_ES", "goog.i18n.NumberFormatSymbols_gsw", "goog.i18n.NumberFormatSymbols_gsw_CH", "goog.i18n.NumberFormatSymbols_gu", "goog.i18n.NumberFormatSymbols_gu_IN", "goog.i18n.NumberFormatSymbols_haw", "goog.i18n.NumberFormatSymbols_haw_US", "goog.i18n.NumberFormatSymbols_he", "goog.i18n.NumberFormatSymbols_he_IL", "goog.i18n.NumberFormatSymbols_hi", "goog.i18n.NumberFormatSymbols_hi_IN", "goog.i18n.NumberFormatSymbols_hr", "goog.i18n.NumberFormatSymbols_hr_HR", "goog.i18n.NumberFormatSymbols_hu", 
"goog.i18n.NumberFormatSymbols_hu_HU", "goog.i18n.NumberFormatSymbols_id", "goog.i18n.NumberFormatSymbols_id_ID", "goog.i18n.NumberFormatSymbols_in", "goog.i18n.NumberFormatSymbols_is", "goog.i18n.NumberFormatSymbols_is_IS", "goog.i18n.NumberFormatSymbols_it", "goog.i18n.NumberFormatSymbols_it_IT", "goog.i18n.NumberFormatSymbols_it_SM", "goog.i18n.NumberFormatSymbols_iw", "goog.i18n.NumberFormatSymbols_ja", "goog.i18n.NumberFormatSymbols_ja_JP", "goog.i18n.NumberFormatSymbols_kn", "goog.i18n.NumberFormatSymbols_kn_IN", 
"goog.i18n.NumberFormatSymbols_ko", "goog.i18n.NumberFormatSymbols_ko_KR", "goog.i18n.NumberFormatSymbols_ln", "goog.i18n.NumberFormatSymbols_ln_CD", "goog.i18n.NumberFormatSymbols_lt", "goog.i18n.NumberFormatSymbols_lt_LT", "goog.i18n.NumberFormatSymbols_lv", "goog.i18n.NumberFormatSymbols_lv_LV", "goog.i18n.NumberFormatSymbols_ml", "goog.i18n.NumberFormatSymbols_ml_IN", "goog.i18n.NumberFormatSymbols_mr", "goog.i18n.NumberFormatSymbols_mr_IN", "goog.i18n.NumberFormatSymbols_ms", "goog.i18n.NumberFormatSymbols_ms_MY", 
"goog.i18n.NumberFormatSymbols_mt", "goog.i18n.NumberFormatSymbols_mt_MT", "goog.i18n.NumberFormatSymbols_nb", "goog.i18n.NumberFormatSymbols_nb_NO", "goog.i18n.NumberFormatSymbols_nl", "goog.i18n.NumberFormatSymbols_nl_CW", "goog.i18n.NumberFormatSymbols_nl_NL", "goog.i18n.NumberFormatSymbols_nl_SX", "goog.i18n.NumberFormatSymbols_no", "goog.i18n.NumberFormatSymbols_or", "goog.i18n.NumberFormatSymbols_or_IN", "goog.i18n.NumberFormatSymbols_pl", "goog.i18n.NumberFormatSymbols_pl_PL", "goog.i18n.NumberFormatSymbols_pt", 
"goog.i18n.NumberFormatSymbols_pt_BR", "goog.i18n.NumberFormatSymbols_pt_PT", "goog.i18n.NumberFormatSymbols_ro", "goog.i18n.NumberFormatSymbols_ro_RO", "goog.i18n.NumberFormatSymbols_ru", "goog.i18n.NumberFormatSymbols_ru_RU", "goog.i18n.NumberFormatSymbols_sk", "goog.i18n.NumberFormatSymbols_sk_SK", "goog.i18n.NumberFormatSymbols_sl", "goog.i18n.NumberFormatSymbols_sl_SI", "goog.i18n.NumberFormatSymbols_sq", "goog.i18n.NumberFormatSymbols_sq_AL", "goog.i18n.NumberFormatSymbols_sr", "goog.i18n.NumberFormatSymbols_sr_Cyrl_RS", 
"goog.i18n.NumberFormatSymbols_sr_Latn_RS", "goog.i18n.NumberFormatSymbols_sv", "goog.i18n.NumberFormatSymbols_sv_SE", "goog.i18n.NumberFormatSymbols_sw", "goog.i18n.NumberFormatSymbols_sw_TZ", "goog.i18n.NumberFormatSymbols_ta", "goog.i18n.NumberFormatSymbols_ta_IN", "goog.i18n.NumberFormatSymbols_te", "goog.i18n.NumberFormatSymbols_te_IN", "goog.i18n.NumberFormatSymbols_th", "goog.i18n.NumberFormatSymbols_th_TH", "goog.i18n.NumberFormatSymbols_tl", "goog.i18n.NumberFormatSymbols_tr", "goog.i18n.NumberFormatSymbols_tr_TR", 
"goog.i18n.NumberFormatSymbols_uk", "goog.i18n.NumberFormatSymbols_uk_UA", "goog.i18n.NumberFormatSymbols_ur", "goog.i18n.NumberFormatSymbols_ur_PK", "goog.i18n.NumberFormatSymbols_vi", "goog.i18n.NumberFormatSymbols_vi_VN", "goog.i18n.NumberFormatSymbols_zh", "goog.i18n.NumberFormatSymbols_zh_CN", "goog.i18n.NumberFormatSymbols_zh_HK", "goog.i18n.NumberFormatSymbols_zh_Hans_CN", "goog.i18n.NumberFormatSymbols_zh_TW", "goog.i18n.NumberFormatSymbols_zu", "goog.i18n.NumberFormatSymbols_zu_ZA"], []);
goog.addDependency("i18n/numberformatsymbolsext.js", ["goog.i18n.NumberFormatSymbolsExt", "goog.i18n.NumberFormatSymbols_aa", "goog.i18n.NumberFormatSymbols_aa_DJ", "goog.i18n.NumberFormatSymbols_aa_ER", "goog.i18n.NumberFormatSymbols_aa_ET", "goog.i18n.NumberFormatSymbols_af_NA", "goog.i18n.NumberFormatSymbols_agq", "goog.i18n.NumberFormatSymbols_agq_CM", "goog.i18n.NumberFormatSymbols_ak", "goog.i18n.NumberFormatSymbols_ak_GH", "goog.i18n.NumberFormatSymbols_ar_AE", "goog.i18n.NumberFormatSymbols_ar_BH", 
"goog.i18n.NumberFormatSymbols_ar_DJ", "goog.i18n.NumberFormatSymbols_ar_DZ", "goog.i18n.NumberFormatSymbols_ar_EH", "goog.i18n.NumberFormatSymbols_ar_ER", "goog.i18n.NumberFormatSymbols_ar_IL", "goog.i18n.NumberFormatSymbols_ar_IQ", "goog.i18n.NumberFormatSymbols_ar_JO", "goog.i18n.NumberFormatSymbols_ar_KM", "goog.i18n.NumberFormatSymbols_ar_KW", "goog.i18n.NumberFormatSymbols_ar_LB", "goog.i18n.NumberFormatSymbols_ar_LY", "goog.i18n.NumberFormatSymbols_ar_MA", "goog.i18n.NumberFormatSymbols_ar_MR", 
"goog.i18n.NumberFormatSymbols_ar_OM", "goog.i18n.NumberFormatSymbols_ar_PS", "goog.i18n.NumberFormatSymbols_ar_QA", "goog.i18n.NumberFormatSymbols_ar_SA", "goog.i18n.NumberFormatSymbols_ar_SD", "goog.i18n.NumberFormatSymbols_ar_SO", "goog.i18n.NumberFormatSymbols_ar_SY", "goog.i18n.NumberFormatSymbols_ar_TD", "goog.i18n.NumberFormatSymbols_ar_TN", "goog.i18n.NumberFormatSymbols_ar_YE", "goog.i18n.NumberFormatSymbols_as", "goog.i18n.NumberFormatSymbols_as_IN", "goog.i18n.NumberFormatSymbols_asa", 
"goog.i18n.NumberFormatSymbols_asa_TZ", "goog.i18n.NumberFormatSymbols_ast", "goog.i18n.NumberFormatSymbols_ast_ES", "goog.i18n.NumberFormatSymbols_az", "goog.i18n.NumberFormatSymbols_az_Cyrl", "goog.i18n.NumberFormatSymbols_az_Cyrl_AZ", "goog.i18n.NumberFormatSymbols_az_Latn", "goog.i18n.NumberFormatSymbols_az_Latn_AZ", "goog.i18n.NumberFormatSymbols_bas", "goog.i18n.NumberFormatSymbols_bas_CM", "goog.i18n.NumberFormatSymbols_be", "goog.i18n.NumberFormatSymbols_be_BY", "goog.i18n.NumberFormatSymbols_bem", 
"goog.i18n.NumberFormatSymbols_bem_ZM", "goog.i18n.NumberFormatSymbols_bez", "goog.i18n.NumberFormatSymbols_bez_TZ", "goog.i18n.NumberFormatSymbols_bm", "goog.i18n.NumberFormatSymbols_bm_ML", "goog.i18n.NumberFormatSymbols_bn_IN", "goog.i18n.NumberFormatSymbols_bo", "goog.i18n.NumberFormatSymbols_bo_CN", "goog.i18n.NumberFormatSymbols_bo_IN", "goog.i18n.NumberFormatSymbols_brx", "goog.i18n.NumberFormatSymbols_brx_IN", "goog.i18n.NumberFormatSymbols_bs", "goog.i18n.NumberFormatSymbols_bs_Cyrl", "goog.i18n.NumberFormatSymbols_bs_Cyrl_BA", 
"goog.i18n.NumberFormatSymbols_bs_Latn", "goog.i18n.NumberFormatSymbols_bs_Latn_BA", "goog.i18n.NumberFormatSymbols_byn", "goog.i18n.NumberFormatSymbols_byn_ER", "goog.i18n.NumberFormatSymbols_cgg", "goog.i18n.NumberFormatSymbols_cgg_UG", "goog.i18n.NumberFormatSymbols_ckb", "goog.i18n.NumberFormatSymbols_ckb_Arab", "goog.i18n.NumberFormatSymbols_ckb_Arab_IQ", "goog.i18n.NumberFormatSymbols_ckb_Arab_IR", "goog.i18n.NumberFormatSymbols_ckb_IQ", "goog.i18n.NumberFormatSymbols_ckb_IR", "goog.i18n.NumberFormatSymbols_ckb_Latn", 
"goog.i18n.NumberFormatSymbols_ckb_Latn_IQ", "goog.i18n.NumberFormatSymbols_dav", "goog.i18n.NumberFormatSymbols_dav_KE", "goog.i18n.NumberFormatSymbols_de_LI", "goog.i18n.NumberFormatSymbols_dje", "goog.i18n.NumberFormatSymbols_dje_NE", "goog.i18n.NumberFormatSymbols_dua", "goog.i18n.NumberFormatSymbols_dua_CM", "goog.i18n.NumberFormatSymbols_dyo", "goog.i18n.NumberFormatSymbols_dyo_SN", "goog.i18n.NumberFormatSymbols_dz", "goog.i18n.NumberFormatSymbols_dz_BT", "goog.i18n.NumberFormatSymbols_ebu", 
"goog.i18n.NumberFormatSymbols_ebu_KE", "goog.i18n.NumberFormatSymbols_ee", "goog.i18n.NumberFormatSymbols_ee_GH", "goog.i18n.NumberFormatSymbols_ee_TG", "goog.i18n.NumberFormatSymbols_el_CY", "goog.i18n.NumberFormatSymbols_en_150", "goog.i18n.NumberFormatSymbols_en_AG", "goog.i18n.NumberFormatSymbols_en_BB", "goog.i18n.NumberFormatSymbols_en_BE", "goog.i18n.NumberFormatSymbols_en_BM", "goog.i18n.NumberFormatSymbols_en_BS", "goog.i18n.NumberFormatSymbols_en_BW", "goog.i18n.NumberFormatSymbols_en_BZ", 
"goog.i18n.NumberFormatSymbols_en_CA", "goog.i18n.NumberFormatSymbols_en_CM", "goog.i18n.NumberFormatSymbols_en_DM", "goog.i18n.NumberFormatSymbols_en_Dsrt", "goog.i18n.NumberFormatSymbols_en_FJ", "goog.i18n.NumberFormatSymbols_en_GD", "goog.i18n.NumberFormatSymbols_en_GG", "goog.i18n.NumberFormatSymbols_en_GH", "goog.i18n.NumberFormatSymbols_en_GI", "goog.i18n.NumberFormatSymbols_en_GM", "goog.i18n.NumberFormatSymbols_en_GY", "goog.i18n.NumberFormatSymbols_en_HK", "goog.i18n.NumberFormatSymbols_en_IM", 
"goog.i18n.NumberFormatSymbols_en_JE", "goog.i18n.NumberFormatSymbols_en_JM", "goog.i18n.NumberFormatSymbols_en_KE", "goog.i18n.NumberFormatSymbols_en_KI", "goog.i18n.NumberFormatSymbols_en_KN", "goog.i18n.NumberFormatSymbols_en_KY", "goog.i18n.NumberFormatSymbols_en_LC", "goog.i18n.NumberFormatSymbols_en_LR", "goog.i18n.NumberFormatSymbols_en_LS", "goog.i18n.NumberFormatSymbols_en_MG", "goog.i18n.NumberFormatSymbols_en_MT", "goog.i18n.NumberFormatSymbols_en_MU", "goog.i18n.NumberFormatSymbols_en_MW", 
"goog.i18n.NumberFormatSymbols_en_NA", "goog.i18n.NumberFormatSymbols_en_NG", "goog.i18n.NumberFormatSymbols_en_NZ", "goog.i18n.NumberFormatSymbols_en_PG", "goog.i18n.NumberFormatSymbols_en_PH", "goog.i18n.NumberFormatSymbols_en_PK", "goog.i18n.NumberFormatSymbols_en_SB", "goog.i18n.NumberFormatSymbols_en_SC", "goog.i18n.NumberFormatSymbols_en_SL", "goog.i18n.NumberFormatSymbols_en_SS", "goog.i18n.NumberFormatSymbols_en_SZ", "goog.i18n.NumberFormatSymbols_en_TO", "goog.i18n.NumberFormatSymbols_en_TT", 
"goog.i18n.NumberFormatSymbols_en_TZ", "goog.i18n.NumberFormatSymbols_en_UG", "goog.i18n.NumberFormatSymbols_en_VC", "goog.i18n.NumberFormatSymbols_en_VU", "goog.i18n.NumberFormatSymbols_en_WS", "goog.i18n.NumberFormatSymbols_en_ZM", "goog.i18n.NumberFormatSymbols_en_ZW", "goog.i18n.NumberFormatSymbols_eo", "goog.i18n.NumberFormatSymbols_es_AR", "goog.i18n.NumberFormatSymbols_es_BO", "goog.i18n.NumberFormatSymbols_es_CL", "goog.i18n.NumberFormatSymbols_es_CO", "goog.i18n.NumberFormatSymbols_es_CR", 
"goog.i18n.NumberFormatSymbols_es_CU", "goog.i18n.NumberFormatSymbols_es_DO", "goog.i18n.NumberFormatSymbols_es_EC", "goog.i18n.NumberFormatSymbols_es_GQ", "goog.i18n.NumberFormatSymbols_es_GT", "goog.i18n.NumberFormatSymbols_es_HN", "goog.i18n.NumberFormatSymbols_es_MX", "goog.i18n.NumberFormatSymbols_es_NI", "goog.i18n.NumberFormatSymbols_es_PA", "goog.i18n.NumberFormatSymbols_es_PE", "goog.i18n.NumberFormatSymbols_es_PH", "goog.i18n.NumberFormatSymbols_es_PR", "goog.i18n.NumberFormatSymbols_es_PY", 
"goog.i18n.NumberFormatSymbols_es_SV", "goog.i18n.NumberFormatSymbols_es_US", "goog.i18n.NumberFormatSymbols_es_UY", "goog.i18n.NumberFormatSymbols_es_VE", "goog.i18n.NumberFormatSymbols_ewo", "goog.i18n.NumberFormatSymbols_ewo_CM", "goog.i18n.NumberFormatSymbols_fa_AF", "goog.i18n.NumberFormatSymbols_ff", "goog.i18n.NumberFormatSymbols_ff_SN", "goog.i18n.NumberFormatSymbols_fo", "goog.i18n.NumberFormatSymbols_fo_FO", "goog.i18n.NumberFormatSymbols_fr_BE", "goog.i18n.NumberFormatSymbols_fr_BF", "goog.i18n.NumberFormatSymbols_fr_BI", 
"goog.i18n.NumberFormatSymbols_fr_BJ", "goog.i18n.NumberFormatSymbols_fr_CD", "goog.i18n.NumberFormatSymbols_fr_CF", "goog.i18n.NumberFormatSymbols_fr_CG", "goog.i18n.NumberFormatSymbols_fr_CH", "goog.i18n.NumberFormatSymbols_fr_CI", "goog.i18n.NumberFormatSymbols_fr_CM", "goog.i18n.NumberFormatSymbols_fr_DJ", "goog.i18n.NumberFormatSymbols_fr_DZ", "goog.i18n.NumberFormatSymbols_fr_GA", "goog.i18n.NumberFormatSymbols_fr_GN", "goog.i18n.NumberFormatSymbols_fr_GQ", "goog.i18n.NumberFormatSymbols_fr_HT", 
"goog.i18n.NumberFormatSymbols_fr_KM", "goog.i18n.NumberFormatSymbols_fr_LU", "goog.i18n.NumberFormatSymbols_fr_MA", "goog.i18n.NumberFormatSymbols_fr_MG", "goog.i18n.NumberFormatSymbols_fr_ML", "goog.i18n.NumberFormatSymbols_fr_MR", "goog.i18n.NumberFormatSymbols_fr_MU", "goog.i18n.NumberFormatSymbols_fr_NC", "goog.i18n.NumberFormatSymbols_fr_NE", "goog.i18n.NumberFormatSymbols_fr_PF", "goog.i18n.NumberFormatSymbols_fr_RW", "goog.i18n.NumberFormatSymbols_fr_SC", "goog.i18n.NumberFormatSymbols_fr_SN", 
"goog.i18n.NumberFormatSymbols_fr_SY", "goog.i18n.NumberFormatSymbols_fr_TD", "goog.i18n.NumberFormatSymbols_fr_TG", "goog.i18n.NumberFormatSymbols_fr_TN", "goog.i18n.NumberFormatSymbols_fr_VU", "goog.i18n.NumberFormatSymbols_fur", "goog.i18n.NumberFormatSymbols_fur_IT", "goog.i18n.NumberFormatSymbols_ga", "goog.i18n.NumberFormatSymbols_ga_IE", "goog.i18n.NumberFormatSymbols_gd", "goog.i18n.NumberFormatSymbols_gd_GB", "goog.i18n.NumberFormatSymbols_guz", "goog.i18n.NumberFormatSymbols_guz_KE", "goog.i18n.NumberFormatSymbols_gv", 
"goog.i18n.NumberFormatSymbols_gv_GB", "goog.i18n.NumberFormatSymbols_ha", "goog.i18n.NumberFormatSymbols_ha_Latn", "goog.i18n.NumberFormatSymbols_ha_Latn_GH", "goog.i18n.NumberFormatSymbols_ha_Latn_NE", "goog.i18n.NumberFormatSymbols_ha_Latn_NG", "goog.i18n.NumberFormatSymbols_hr_BA", "goog.i18n.NumberFormatSymbols_hy", "goog.i18n.NumberFormatSymbols_hy_AM", "goog.i18n.NumberFormatSymbols_ia", "goog.i18n.NumberFormatSymbols_ig", "goog.i18n.NumberFormatSymbols_ig_NG", "goog.i18n.NumberFormatSymbols_ii", 
"goog.i18n.NumberFormatSymbols_ii_CN", "goog.i18n.NumberFormatSymbols_it_CH", "goog.i18n.NumberFormatSymbols_jgo", "goog.i18n.NumberFormatSymbols_jgo_CM", "goog.i18n.NumberFormatSymbols_jmc", "goog.i18n.NumberFormatSymbols_jmc_TZ", "goog.i18n.NumberFormatSymbols_ka", "goog.i18n.NumberFormatSymbols_ka_GE", "goog.i18n.NumberFormatSymbols_kab", "goog.i18n.NumberFormatSymbols_kab_DZ", "goog.i18n.NumberFormatSymbols_kam", "goog.i18n.NumberFormatSymbols_kam_KE", "goog.i18n.NumberFormatSymbols_kde", "goog.i18n.NumberFormatSymbols_kde_TZ", 
"goog.i18n.NumberFormatSymbols_kea", "goog.i18n.NumberFormatSymbols_kea_CV", "goog.i18n.NumberFormatSymbols_khq", "goog.i18n.NumberFormatSymbols_khq_ML", "goog.i18n.NumberFormatSymbols_ki", "goog.i18n.NumberFormatSymbols_ki_KE", "goog.i18n.NumberFormatSymbols_kk", "goog.i18n.NumberFormatSymbols_kk_Cyrl", "goog.i18n.NumberFormatSymbols_kk_Cyrl_KZ", "goog.i18n.NumberFormatSymbols_kkj", "goog.i18n.NumberFormatSymbols_kkj_CM", "goog.i18n.NumberFormatSymbols_kl", "goog.i18n.NumberFormatSymbols_kl_GL", 
"goog.i18n.NumberFormatSymbols_kln", "goog.i18n.NumberFormatSymbols_kln_KE", "goog.i18n.NumberFormatSymbols_km", "goog.i18n.NumberFormatSymbols_km_KH", "goog.i18n.NumberFormatSymbols_ko_KP", "goog.i18n.NumberFormatSymbols_kok", "goog.i18n.NumberFormatSymbols_kok_IN", "goog.i18n.NumberFormatSymbols_ks", "goog.i18n.NumberFormatSymbols_ks_Arab", "goog.i18n.NumberFormatSymbols_ks_Arab_IN", "goog.i18n.NumberFormatSymbols_ksb", "goog.i18n.NumberFormatSymbols_ksb_TZ", "goog.i18n.NumberFormatSymbols_ksf", 
"goog.i18n.NumberFormatSymbols_ksf_CM", "goog.i18n.NumberFormatSymbols_ksh", "goog.i18n.NumberFormatSymbols_ksh_DE", "goog.i18n.NumberFormatSymbols_kw", "goog.i18n.NumberFormatSymbols_kw_GB", "goog.i18n.NumberFormatSymbols_ky", "goog.i18n.NumberFormatSymbols_ky_KG", "goog.i18n.NumberFormatSymbols_lag", "goog.i18n.NumberFormatSymbols_lag_TZ", "goog.i18n.NumberFormatSymbols_lg", "goog.i18n.NumberFormatSymbols_lg_UG", "goog.i18n.NumberFormatSymbols_ln_AO", "goog.i18n.NumberFormatSymbols_ln_CF", "goog.i18n.NumberFormatSymbols_ln_CG", 
"goog.i18n.NumberFormatSymbols_lo", "goog.i18n.NumberFormatSymbols_lo_LA", "goog.i18n.NumberFormatSymbols_lu", "goog.i18n.NumberFormatSymbols_lu_CD", "goog.i18n.NumberFormatSymbols_luo", "goog.i18n.NumberFormatSymbols_luo_KE", "goog.i18n.NumberFormatSymbols_luy", "goog.i18n.NumberFormatSymbols_luy_KE", "goog.i18n.NumberFormatSymbols_mas", "goog.i18n.NumberFormatSymbols_mas_KE", "goog.i18n.NumberFormatSymbols_mas_TZ", "goog.i18n.NumberFormatSymbols_mer", "goog.i18n.NumberFormatSymbols_mer_KE", "goog.i18n.NumberFormatSymbols_mfe", 
"goog.i18n.NumberFormatSymbols_mfe_MU", "goog.i18n.NumberFormatSymbols_mg", "goog.i18n.NumberFormatSymbols_mg_MG", "goog.i18n.NumberFormatSymbols_mgh", "goog.i18n.NumberFormatSymbols_mgh_MZ", "goog.i18n.NumberFormatSymbols_mgo", "goog.i18n.NumberFormatSymbols_mgo_CM", "goog.i18n.NumberFormatSymbols_mk", "goog.i18n.NumberFormatSymbols_mk_MK", "goog.i18n.NumberFormatSymbols_ms_BN", "goog.i18n.NumberFormatSymbols_ms_SG", "goog.i18n.NumberFormatSymbols_mua", "goog.i18n.NumberFormatSymbols_mua_CM", "goog.i18n.NumberFormatSymbols_my", 
"goog.i18n.NumberFormatSymbols_my_MM", "goog.i18n.NumberFormatSymbols_naq", "goog.i18n.NumberFormatSymbols_naq_NA", "goog.i18n.NumberFormatSymbols_nd", "goog.i18n.NumberFormatSymbols_nd_ZW", "goog.i18n.NumberFormatSymbols_ne", "goog.i18n.NumberFormatSymbols_ne_IN", "goog.i18n.NumberFormatSymbols_ne_NP", "goog.i18n.NumberFormatSymbols_nl_AW", "goog.i18n.NumberFormatSymbols_nl_BE", "goog.i18n.NumberFormatSymbols_nl_SR", "goog.i18n.NumberFormatSymbols_nmg", "goog.i18n.NumberFormatSymbols_nmg_CM", "goog.i18n.NumberFormatSymbols_nn", 
"goog.i18n.NumberFormatSymbols_nn_NO", "goog.i18n.NumberFormatSymbols_nnh", "goog.i18n.NumberFormatSymbols_nnh_CM", "goog.i18n.NumberFormatSymbols_nr", "goog.i18n.NumberFormatSymbols_nr_ZA", "goog.i18n.NumberFormatSymbols_nso", "goog.i18n.NumberFormatSymbols_nso_ZA", "goog.i18n.NumberFormatSymbols_nus", "goog.i18n.NumberFormatSymbols_nus_SD", "goog.i18n.NumberFormatSymbols_nyn", "goog.i18n.NumberFormatSymbols_nyn_UG", "goog.i18n.NumberFormatSymbols_om", "goog.i18n.NumberFormatSymbols_om_ET", "goog.i18n.NumberFormatSymbols_om_KE", 
"goog.i18n.NumberFormatSymbols_os", "goog.i18n.NumberFormatSymbols_os_GE", "goog.i18n.NumberFormatSymbols_os_RU", "goog.i18n.NumberFormatSymbols_pa", "goog.i18n.NumberFormatSymbols_pa_Arab", "goog.i18n.NumberFormatSymbols_pa_Arab_PK", "goog.i18n.NumberFormatSymbols_pa_Guru", "goog.i18n.NumberFormatSymbols_pa_Guru_IN", "goog.i18n.NumberFormatSymbols_ps", "goog.i18n.NumberFormatSymbols_ps_AF", "goog.i18n.NumberFormatSymbols_pt_AO", "goog.i18n.NumberFormatSymbols_pt_CV", "goog.i18n.NumberFormatSymbols_pt_GW", 
"goog.i18n.NumberFormatSymbols_pt_MO", "goog.i18n.NumberFormatSymbols_pt_MZ", "goog.i18n.NumberFormatSymbols_pt_ST", "goog.i18n.NumberFormatSymbols_pt_TL", "goog.i18n.NumberFormatSymbols_rm", "goog.i18n.NumberFormatSymbols_rm_CH", "goog.i18n.NumberFormatSymbols_rn", "goog.i18n.NumberFormatSymbols_rn_BI", "goog.i18n.NumberFormatSymbols_ro_MD", "goog.i18n.NumberFormatSymbols_rof", "goog.i18n.NumberFormatSymbols_rof_TZ", "goog.i18n.NumberFormatSymbols_ru_BY", "goog.i18n.NumberFormatSymbols_ru_KG", "goog.i18n.NumberFormatSymbols_ru_KZ", 
"goog.i18n.NumberFormatSymbols_ru_MD", "goog.i18n.NumberFormatSymbols_ru_UA", "goog.i18n.NumberFormatSymbols_rw", "goog.i18n.NumberFormatSymbols_rw_RW", "goog.i18n.NumberFormatSymbols_rwk", "goog.i18n.NumberFormatSymbols_rwk_TZ", "goog.i18n.NumberFormatSymbols_sah", "goog.i18n.NumberFormatSymbols_sah_RU", "goog.i18n.NumberFormatSymbols_saq", "goog.i18n.NumberFormatSymbols_saq_KE", "goog.i18n.NumberFormatSymbols_sbp", "goog.i18n.NumberFormatSymbols_sbp_TZ", "goog.i18n.NumberFormatSymbols_se", "goog.i18n.NumberFormatSymbols_se_FI", 
"goog.i18n.NumberFormatSymbols_se_NO", "goog.i18n.NumberFormatSymbols_seh", "goog.i18n.NumberFormatSymbols_seh_MZ", "goog.i18n.NumberFormatSymbols_ses", "goog.i18n.NumberFormatSymbols_ses_ML", "goog.i18n.NumberFormatSymbols_sg", "goog.i18n.NumberFormatSymbols_sg_CF", "goog.i18n.NumberFormatSymbols_shi", "goog.i18n.NumberFormatSymbols_shi_Latn", "goog.i18n.NumberFormatSymbols_shi_Latn_MA", "goog.i18n.NumberFormatSymbols_shi_Tfng", "goog.i18n.NumberFormatSymbols_shi_Tfng_MA", "goog.i18n.NumberFormatSymbols_si", 
"goog.i18n.NumberFormatSymbols_si_LK", "goog.i18n.NumberFormatSymbols_sn", "goog.i18n.NumberFormatSymbols_sn_ZW", "goog.i18n.NumberFormatSymbols_so", "goog.i18n.NumberFormatSymbols_so_DJ", "goog.i18n.NumberFormatSymbols_so_ET", "goog.i18n.NumberFormatSymbols_so_KE", "goog.i18n.NumberFormatSymbols_so_SO", "goog.i18n.NumberFormatSymbols_sq_MK", "goog.i18n.NumberFormatSymbols_sr_Cyrl", "goog.i18n.NumberFormatSymbols_sr_Cyrl_BA", "goog.i18n.NumberFormatSymbols_sr_Cyrl_ME", "goog.i18n.NumberFormatSymbols_sr_Latn", 
"goog.i18n.NumberFormatSymbols_sr_Latn_BA", "goog.i18n.NumberFormatSymbols_sr_Latn_ME", "goog.i18n.NumberFormatSymbols_ss", "goog.i18n.NumberFormatSymbols_ss_SZ", "goog.i18n.NumberFormatSymbols_ss_ZA", "goog.i18n.NumberFormatSymbols_ssy", "goog.i18n.NumberFormatSymbols_ssy_ER", "goog.i18n.NumberFormatSymbols_st", "goog.i18n.NumberFormatSymbols_st_LS", "goog.i18n.NumberFormatSymbols_st_ZA", "goog.i18n.NumberFormatSymbols_sv_AX", "goog.i18n.NumberFormatSymbols_sv_FI", "goog.i18n.NumberFormatSymbols_sw_KE", 
"goog.i18n.NumberFormatSymbols_sw_UG", "goog.i18n.NumberFormatSymbols_swc", "goog.i18n.NumberFormatSymbols_swc_CD", "goog.i18n.NumberFormatSymbols_ta_LK", "goog.i18n.NumberFormatSymbols_ta_MY", "goog.i18n.NumberFormatSymbols_ta_SG", "goog.i18n.NumberFormatSymbols_teo", "goog.i18n.NumberFormatSymbols_teo_KE", "goog.i18n.NumberFormatSymbols_teo_UG", "goog.i18n.NumberFormatSymbols_tg", "goog.i18n.NumberFormatSymbols_tg_Cyrl", "goog.i18n.NumberFormatSymbols_tg_Cyrl_TJ", "goog.i18n.NumberFormatSymbols_ti", 
"goog.i18n.NumberFormatSymbols_ti_ER", "goog.i18n.NumberFormatSymbols_ti_ET", "goog.i18n.NumberFormatSymbols_tig", "goog.i18n.NumberFormatSymbols_tig_ER", "goog.i18n.NumberFormatSymbols_tn", "goog.i18n.NumberFormatSymbols_tn_BW", "goog.i18n.NumberFormatSymbols_tn_ZA", "goog.i18n.NumberFormatSymbols_to", "goog.i18n.NumberFormatSymbols_to_TO", "goog.i18n.NumberFormatSymbols_tr_CY", "goog.i18n.NumberFormatSymbols_ts", "goog.i18n.NumberFormatSymbols_ts_ZA", "goog.i18n.NumberFormatSymbols_twq", "goog.i18n.NumberFormatSymbols_twq_NE", 
"goog.i18n.NumberFormatSymbols_tzm", "goog.i18n.NumberFormatSymbols_tzm_Latn", "goog.i18n.NumberFormatSymbols_tzm_Latn_MA", "goog.i18n.NumberFormatSymbols_ur_IN", "goog.i18n.NumberFormatSymbols_uz", "goog.i18n.NumberFormatSymbols_uz_Arab", "goog.i18n.NumberFormatSymbols_uz_Arab_AF", "goog.i18n.NumberFormatSymbols_uz_Cyrl", "goog.i18n.NumberFormatSymbols_uz_Cyrl_UZ", "goog.i18n.NumberFormatSymbols_uz_Latn", "goog.i18n.NumberFormatSymbols_uz_Latn_UZ", "goog.i18n.NumberFormatSymbols_vai", "goog.i18n.NumberFormatSymbols_vai_Latn", 
"goog.i18n.NumberFormatSymbols_vai_Latn_LR", "goog.i18n.NumberFormatSymbols_vai_Vaii", "goog.i18n.NumberFormatSymbols_vai_Vaii_LR", "goog.i18n.NumberFormatSymbols_ve", "goog.i18n.NumberFormatSymbols_ve_ZA", "goog.i18n.NumberFormatSymbols_vo", "goog.i18n.NumberFormatSymbols_vun", "goog.i18n.NumberFormatSymbols_vun_TZ", "goog.i18n.NumberFormatSymbols_wae", "goog.i18n.NumberFormatSymbols_wae_CH", "goog.i18n.NumberFormatSymbols_wal", "goog.i18n.NumberFormatSymbols_wal_ET", "goog.i18n.NumberFormatSymbols_xh", 
"goog.i18n.NumberFormatSymbols_xh_ZA", "goog.i18n.NumberFormatSymbols_xog", "goog.i18n.NumberFormatSymbols_xog_UG", "goog.i18n.NumberFormatSymbols_yav", "goog.i18n.NumberFormatSymbols_yav_CM", "goog.i18n.NumberFormatSymbols_yo", "goog.i18n.NumberFormatSymbols_yo_NG", "goog.i18n.NumberFormatSymbols_zh_Hans", "goog.i18n.NumberFormatSymbols_zh_Hans_HK", "goog.i18n.NumberFormatSymbols_zh_Hans_MO", "goog.i18n.NumberFormatSymbols_zh_Hans_SG", "goog.i18n.NumberFormatSymbols_zh_Hant", "goog.i18n.NumberFormatSymbols_zh_Hant_HK", 
"goog.i18n.NumberFormatSymbols_zh_Hant_MO", "goog.i18n.NumberFormatSymbols_zh_Hant_TW"], ["goog.i18n.NumberFormatSymbols"]);
goog.addDependency("i18n/ordinalrules.js", ["goog.i18n.ordinalRules"], []);
goog.addDependency("i18n/pluralrules.js", ["goog.i18n.pluralRules"], []);
goog.addDependency("i18n/timezone.js", ["goog.i18n.TimeZone"], ["goog.array", "goog.date.DateLike", "goog.string"]);
goog.addDependency("i18n/uchar.js", ["goog.i18n.uChar"], []);
goog.addDependency("i18n/uchar/localnamefetcher.js", ["goog.i18n.uChar.LocalNameFetcher"], ["goog.debug.Logger", "goog.i18n.uChar", "goog.i18n.uChar.NameFetcher"]);
goog.addDependency("i18n/uchar/namefetcher.js", ["goog.i18n.uChar.NameFetcher"], []);
goog.addDependency("i18n/uchar/remotenamefetcher.js", ["goog.i18n.uChar.RemoteNameFetcher"], ["goog.Disposable", "goog.Uri", "goog.debug.Logger", "goog.i18n.uChar", "goog.i18n.uChar.NameFetcher", "goog.net.XhrIo", "goog.structs.Map"]);
goog.addDependency("iter/iter.js", ["goog.iter", "goog.iter.Iterator", "goog.iter.StopIteration"], ["goog.array", "goog.asserts"]);
goog.addDependency("json/evaljsonprocessor.js", ["goog.json.EvalJsonProcessor"], ["goog.json", "goog.json.Processor", "goog.json.Serializer"]);
goog.addDependency("json/json.js", ["goog.json", "goog.json.Serializer"], []);
goog.addDependency("json/nativejsonprocessor.js", ["goog.json.NativeJsonProcessor"], ["goog.asserts", "goog.json", "goog.json.Processor"]);
goog.addDependency("json/processor.js", ["goog.json.Processor"], ["goog.string.Parser", "goog.string.Stringifier"]);
goog.addDependency("labs/classdef/classdef.js", ["goog.labs.classdef"], []);
goog.addDependency("labs/mock/mock.js", ["goog.labs.mock"], ["goog.array", "goog.debug", "goog.debug.Error", "goog.functions", "goog.json"]);
goog.addDependency("labs/net/image.js", ["goog.labs.net.image"], ["goog.events.EventHandler", "goog.events.EventType", "goog.net.EventType", "goog.result.SimpleResult", "goog.userAgent"]);
goog.addDependency("labs/net/image_test.js", ["goog.labs.net.imageTest"], ["goog.events", "goog.labs.net.image", "goog.result", "goog.result.Result", "goog.string", "goog.testing.AsyncTestCase", "goog.testing.jsunit", "goog.testing.recordFunction"]);
goog.addDependency("labs/net/webchannel.js", ["goog.net.WebChannel", "goog.net.WebChannel.ErrorEvent", "goog.net.WebChannel.ErrorStatus", "goog.net.WebChannel.MessageData", "goog.net.WebChannel.MessageEvent", "goog.net.WebChannel.Options"], ["goog.events.Event", "goog.events.EventTarget"]);
goog.addDependency("labs/net/webchanneltransport.js", ["goog.net.WebChannelTransport"], ["goog.net.WebChannel", "goog.net.WebChannel.Options"]);
goog.addDependency("labs/net/xhr.js", ["goog.labs.net.xhr", "goog.labs.net.xhr.Error", "goog.labs.net.xhr.HttpError", "goog.labs.net.xhr.TimeoutError"], ["goog.debug.Error", "goog.json", "goog.net.HttpStatus", "goog.net.XmlHttp", "goog.result", "goog.result.SimpleResult", "goog.string", "goog.uri.utils"]);
goog.addDependency("labs/object/object.js", ["goog.labs.object"], []);
goog.addDependency("labs/observe/notice.js", ["goog.labs.observe.Notice"], []);
goog.addDependency("labs/observe/observable.js", ["goog.labs.observe.Observable"], ["goog.disposable.IDisposable"]);
goog.addDependency("labs/observe/observableset.js", ["goog.labs.observe.ObservableSet"], ["goog.array", "goog.labs.observe.Observer"]);
goog.addDependency("labs/observe/observationset.js", ["goog.labs.observe.ObservationSet"], ["goog.array", "goog.labs.observe.Observer"]);
goog.addDependency("labs/observe/observer.js", ["goog.labs.observe.Observer"], []);
goog.addDependency("labs/observe/simpleobservable.js", ["goog.labs.observe.SimpleObservable"], ["goog.Disposable", "goog.array", "goog.asserts", "goog.labs.observe.Notice", "goog.labs.observe.Observable", "goog.labs.observe.Observer", "goog.object"]);
goog.addDependency("labs/structs/map.js", ["goog.labs.structs.Map"], ["goog.array", "goog.asserts", "goog.labs.object", "goog.object"]);
goog.addDependency("labs/structs/map_perf.js", ["goog.labs.structs.mapPerf"], ["goog.dom", "goog.labs.structs.Map", "goog.structs.Map", "goog.testing.PerformanceTable", "goog.testing.jsunit"]);
goog.addDependency("labs/structs/multimap.js", ["goog.labs.structs.Multimap"], ["goog.array", "goog.labs.object", "goog.labs.structs.Map"]);
goog.addDependency("labs/style/pixeldensitymonitor.js", ["goog.labs.style.PixelDensityMonitor", "goog.labs.style.PixelDensityMonitor.Density", "goog.labs.style.PixelDensityMonitor.EventType"], ["goog.asserts", "goog.events", "goog.events.EventTarget"]);
goog.addDependency("labs/style/pixeldensitymonitor_test.js", ["goog.labs.style.PixelDensityMonitorTest"], ["goog.array", "goog.dom.DomHelper", "goog.events", "goog.labs.style.PixelDensityMonitor", "goog.testing.MockControl", "goog.testing.jsunit", "goog.testing.recordFunction"]);
goog.addDependency("labs/testing/assertthat.js", ["goog.labs.testing.MatcherError", "goog.labs.testing.assertThat"], ["goog.asserts", "goog.debug.Error", "goog.labs.testing.Matcher"]);
goog.addDependency("labs/testing/decoratormatcher.js", ["goog.labs.testing.AnythingMatcher"], ["goog.labs.testing.Matcher"]);
goog.addDependency("labs/testing/dictionarymatcher.js", ["goog.labs.testing.HasEntriesMatcher", "goog.labs.testing.HasEntryMatcher", "goog.labs.testing.HasKeyMatcher", "goog.labs.testing.HasValueMatcher"], ["goog.array", "goog.asserts", "goog.labs.testing.Matcher", "goog.string"]);
goog.addDependency("labs/testing/logicmatcher.js", ["goog.labs.testing.AllOfMatcher", "goog.labs.testing.AnyOfMatcher", "goog.labs.testing.IsNotMatcher"], ["goog.array", "goog.labs.testing.Matcher"]);
goog.addDependency("labs/testing/matcher.js", ["goog.labs.testing.Matcher"], []);
goog.addDependency("labs/testing/numbermatcher.js", ["goog.labs.testing.CloseToMatcher", "goog.labs.testing.EqualToMatcher", "goog.labs.testing.GreaterThanEqualToMatcher", "goog.labs.testing.GreaterThanMatcher", "goog.labs.testing.LessThanEqualToMatcher", "goog.labs.testing.LessThanMatcher"], ["goog.asserts", "goog.labs.testing.Matcher"]);
goog.addDependency("labs/testing/objectmatcher.js", ["goog.labs.testing.HasPropertyMatcher", "goog.labs.testing.InstanceOfMatcher", "goog.labs.testing.IsNullMatcher", "goog.labs.testing.IsNullOrUndefinedMatcher", "goog.labs.testing.IsUndefinedMatcher", "goog.labs.testing.ObjectEqualsMatcher"], ["goog.labs.testing.Matcher", "goog.string"]);
goog.addDependency("labs/testing/stringmatcher.js", ["goog.labs.testing.ContainsStringMatcher", "goog.labs.testing.EndsWithMatcher", "goog.labs.testing.EqualToIgnoringCaseMatcher", "goog.labs.testing.EqualToIgnoringWhitespaceMatcher", "goog.labs.testing.EqualsMatcher", "goog.labs.testing.RegexMatcher", "goog.labs.testing.StartsWithMatcher", "goog.labs.testing.StringContainsInOrderMatcher"], ["goog.asserts", "goog.labs.testing.Matcher", "goog.string"]);
goog.addDependency("labs/useragent/browser.js", ["goog.labs.userAgent.browser"], ["goog.asserts", "goog.labs.userAgent.util", "goog.memoize", "goog.string"]);
goog.addDependency("labs/useragent/browser_test.js", ["goog.labs.userAgent.browserTest"], ["goog.labs.userAgent.browser", "goog.labs.userAgent.testAgents", "goog.testing.PropertyReplacer", "goog.testing.jsunit"]);
goog.addDependency("labs/useragent/device.js", ["goog.labs.userAgent.device"], ["goog.labs.userAgent.util"]);
goog.addDependency("labs/useragent/device_test.js", ["goog.labs.userAgent.deviceTest"], ["goog.labs.userAgent.device", "goog.labs.userAgent.testAgents", "goog.testing.PropertyReplacer", "goog.testing.jsunit"]);
goog.addDependency("labs/useragent/engine.js", ["goog.labs.userAgent.engine"], ["goog.array", "goog.labs.userAgent.util", "goog.memoize", "goog.string"]);
goog.addDependency("labs/useragent/engine_test.js", ["goog.labs.userAgent.engineTest"], ["goog.labs.userAgent.engine", "goog.testing.PropertyReplacer", "goog.testing.jsunit"]);
goog.addDependency("labs/useragent/platform.js", ["goog.labs.userAgent.platform"], ["goog.labs.userAgent.util", "goog.memoize", "goog.string"]);
goog.addDependency("labs/useragent/platform_test.js", ["goog.labs.userAgent.platformTest"], ["goog.labs.userAgent.platform", "goog.labs.userAgent.testAgents", "goog.testing.PropertyReplacer", "goog.testing.jsunit"]);
goog.addDependency("labs/useragent/test_agents.js", ["goog.labs.userAgent.testAgents"], []);
goog.addDependency("labs/useragent/util.js", ["goog.labs.userAgent.util"], ["goog.memoize", "goog.string"]);
goog.addDependency("labs/useragent/util_test.js", ["goog.labs.userAgent.utilTest"], ["goog.labs.userAgent.testAgents", "goog.labs.userAgent.util", "goog.testing.jsunit"]);
goog.addDependency("locale/countries.js", ["goog.locale.countries"], []);
goog.addDependency("locale/defaultlocalenameconstants.js", ["goog.locale.defaultLocaleNameConstants"], []);
goog.addDependency("locale/genericfontnames.js", ["goog.locale.genericFontNames"], []);
goog.addDependency("locale/genericfontnamesdata.js", ["goog.locale.genericFontNamesData"], []);
goog.addDependency("locale/locale.js", ["goog.locale"], ["goog.locale.nativeNameConstants"]);
goog.addDependency("locale/nativenameconstants.js", ["goog.locale.nativeNameConstants"], []);
goog.addDependency("locale/scriptToLanguages.js", ["goog.locale.scriptToLanguages"], ["goog.locale"]);
goog.addDependency("locale/timezonedetection.js", ["goog.locale.timeZoneDetection"], ["goog.locale", "goog.locale.TimeZoneFingerprint"]);
goog.addDependency("locale/timezonefingerprint.js", ["goog.locale.TimeZoneFingerprint"], []);
goog.addDependency("locale/timezonelist.js", ["goog.locale.TimeZoneList"], ["goog.locale"]);
goog.addDependency("log/log.js", ["goog.log", "goog.log.Level", "goog.log.LogRecord", "goog.log.Logger"], ["goog.debug", "goog.debug.LogRecord", "goog.debug.Logger"]);
goog.addDependency("log/log_test.js", ["goog.logTest"], ["goog.debug.LogManager", "goog.log", "goog.log.Level", "goog.testing.jsunit"]);
goog.addDependency("math/bezier.js", ["goog.math.Bezier"], ["goog.math", "goog.math.Coordinate"]);
goog.addDependency("math/box.js", ["goog.math.Box"], ["goog.math.Coordinate"]);
goog.addDependency("math/coordinate.js", ["goog.math.Coordinate"], ["goog.math"]);
goog.addDependency("math/coordinate3.js", ["goog.math.Coordinate3"], []);
goog.addDependency("math/exponentialbackoff.js", ["goog.math.ExponentialBackoff"], ["goog.asserts"]);
goog.addDependency("math/integer.js", ["goog.math.Integer"], []);
goog.addDependency("math/interpolator/interpolator1.js", ["goog.math.interpolator.Interpolator1"], []);
goog.addDependency("math/interpolator/linear1.js", ["goog.math.interpolator.Linear1"], ["goog.array", "goog.math", "goog.math.interpolator.Interpolator1"]);
goog.addDependency("math/interpolator/pchip1.js", ["goog.math.interpolator.Pchip1"], ["goog.math", "goog.math.interpolator.Spline1"]);
goog.addDependency("math/interpolator/spline1.js", ["goog.math.interpolator.Spline1"], ["goog.array", "goog.math", "goog.math.interpolator.Interpolator1", "goog.math.tdma"]);
goog.addDependency("math/line.js", ["goog.math.Line"], ["goog.math", "goog.math.Coordinate"]);
goog.addDependency("math/long.js", ["goog.math.Long"], []);
goog.addDependency("math/math.js", ["goog.math"], ["goog.array", "goog.asserts"]);
goog.addDependency("math/matrix.js", ["goog.math.Matrix"], ["goog.array", "goog.math", "goog.math.Size"]);
goog.addDependency("math/range.js", ["goog.math.Range"], []);
goog.addDependency("math/rangeset.js", ["goog.math.RangeSet"], ["goog.array", "goog.iter.Iterator", "goog.iter.StopIteration", "goog.math.Range"]);
goog.addDependency("math/rect.js", ["goog.math.Rect"], ["goog.math.Box", "goog.math.Coordinate", "goog.math.Size"]);
goog.addDependency("math/size.js", ["goog.math.Size"], []);
goog.addDependency("math/tdma.js", ["goog.math.tdma"], []);
goog.addDependency("math/vec2.js", ["goog.math.Vec2"], ["goog.math", "goog.math.Coordinate"]);
goog.addDependency("math/vec3.js", ["goog.math.Vec3"], ["goog.math", "goog.math.Coordinate3"]);
goog.addDependency("memoize/memoize.js", ["goog.memoize"], []);
goog.addDependency("messaging/abstractchannel.js", ["goog.messaging.AbstractChannel"], ["goog.Disposable", "goog.debug", "goog.debug.Logger", "goog.json", "goog.messaging.MessageChannel"]);
goog.addDependency("messaging/bufferedchannel.js", ["goog.messaging.BufferedChannel"], ["goog.Timer", "goog.Uri", "goog.debug.Error", "goog.debug.Logger", "goog.events", "goog.messaging.MessageChannel", "goog.messaging.MultiChannel"]);
goog.addDependency("messaging/deferredchannel.js", ["goog.messaging.DeferredChannel"], ["goog.Disposable", "goog.async.Deferred", "goog.messaging.MessageChannel"]);
goog.addDependency("messaging/loggerclient.js", ["goog.messaging.LoggerClient"], ["goog.Disposable", "goog.debug", "goog.debug.LogManager", "goog.debug.Logger"]);
goog.addDependency("messaging/loggerserver.js", ["goog.messaging.LoggerServer"], ["goog.Disposable", "goog.debug.Logger"]);
goog.addDependency("messaging/messagechannel.js", ["goog.messaging.MessageChannel"], []);
goog.addDependency("messaging/messaging.js", ["goog.messaging"], ["goog.messaging.MessageChannel"]);
goog.addDependency("messaging/multichannel.js", ["goog.messaging.MultiChannel", "goog.messaging.MultiChannel.VirtualChannel"], ["goog.Disposable", "goog.debug.Logger", "goog.events.EventHandler", "goog.messaging.MessageChannel", "goog.object"]);
goog.addDependency("messaging/portcaller.js", ["goog.messaging.PortCaller"], ["goog.Disposable", "goog.async.Deferred", "goog.messaging.DeferredChannel", "goog.messaging.PortChannel", "goog.messaging.PortNetwork", "goog.object"]);
goog.addDependency("messaging/portchannel.js", ["goog.messaging.PortChannel"], ["goog.Timer", "goog.array", "goog.async.Deferred", "goog.debug", "goog.debug.Logger", "goog.dom", "goog.dom.DomHelper", "goog.events", "goog.events.EventType", "goog.json", "goog.messaging.AbstractChannel", "goog.messaging.DeferredChannel", "goog.object", "goog.string"]);
goog.addDependency("messaging/portnetwork.js", ["goog.messaging.PortNetwork"], []);
goog.addDependency("messaging/portoperator.js", ["goog.messaging.PortOperator"], ["goog.Disposable", "goog.asserts", "goog.debug.Logger", "goog.messaging.PortChannel", "goog.messaging.PortNetwork", "goog.object"]);
goog.addDependency("messaging/respondingchannel.js", ["goog.messaging.RespondingChannel"], ["goog.Disposable", "goog.debug.Logger", "goog.messaging.MessageChannel", "goog.messaging.MultiChannel", "goog.messaging.MultiChannel.VirtualChannel"]);
goog.addDependency("messaging/testdata/portchannel_worker.js", ["goog.messaging.testdata.portchannel_worker"], ["goog.messaging.PortChannel"]);
goog.addDependency("messaging/testdata/portnetwork_worker1.js", ["goog.messaging.testdata.portnetwork_worker1"], ["goog.messaging.PortCaller", "goog.messaging.PortChannel"]);
goog.addDependency("messaging/testdata/portnetwork_worker2.js", ["goog.messaging.testdata.portnetwork_worker2"], ["goog.messaging.PortCaller", "goog.messaging.PortChannel"]);
goog.addDependency("module/abstractmoduleloader.js", ["goog.module.AbstractModuleLoader"], []);
goog.addDependency("module/basemodule.js", ["goog.module.BaseModule"], ["goog.Disposable"]);
goog.addDependency("module/loader.js", ["goog.module.Loader"], ["goog.Timer", "goog.array", "goog.dom", "goog.object"]);
goog.addDependency("module/module.js", ["goog.module"], ["goog.array", "goog.module.Loader"]);
goog.addDependency("module/moduleinfo.js", ["goog.module.ModuleInfo"], ["goog.Disposable", "goog.functions", "goog.module.BaseModule", "goog.module.ModuleLoadCallback"]);
goog.addDependency("module/moduleloadcallback.js", ["goog.module.ModuleLoadCallback"], ["goog.debug.entryPointRegistry", "goog.debug.errorHandlerWeakDep"]);
goog.addDependency("module/moduleloader.js", ["goog.module.ModuleLoader"], ["goog.Timer", "goog.array", "goog.debug.Logger", "goog.events", "goog.events.Event", "goog.events.EventHandler", "goog.events.EventTarget", "goog.module.AbstractModuleLoader", "goog.net.BulkLoader", "goog.net.EventType", "goog.net.jsloader", "goog.userAgent.product"]);
goog.addDependency("module/moduleloader_test.js", ["goog.module.ModuleLoaderTest"], ["goog.array", "goog.dom", "goog.functions", "goog.module.ModuleLoader", "goog.module.ModuleManager", "goog.module.ModuleManager.CallbackType", "goog.object", "goog.testing.AsyncTestCase", "goog.testing.PropertyReplacer", "goog.testing.events.EventObserver", "goog.testing.jsunit", "goog.testing.recordFunction", "goog.userAgent.product"]);
goog.addDependency("module/modulemanager.js", ["goog.module.ModuleManager", "goog.module.ModuleManager.CallbackType", "goog.module.ModuleManager.FailureType"], ["goog.Disposable", "goog.array", "goog.asserts", "goog.async.Deferred", "goog.debug.Logger", "goog.debug.Trace", "goog.dispose", "goog.module.ModuleInfo", "goog.module.ModuleLoadCallback", "goog.object"]);
goog.addDependency("module/testdata/modA_1.js", ["goog.module.testdata.modA_1"], []);
goog.addDependency("module/testdata/modA_2.js", ["goog.module.testdata.modA_2"], ["goog.module.ModuleManager"]);
goog.addDependency("module/testdata/modB_1.js", ["goog.module.testdata.modB_1"], ["goog.module.ModuleManager"]);
goog.addDependency("net/browserchannel.js", ["goog.net.BrowserChannel", "goog.net.BrowserChannel.Error", "goog.net.BrowserChannel.Event", "goog.net.BrowserChannel.Handler", "goog.net.BrowserChannel.LogSaver", "goog.net.BrowserChannel.QueuedMap", "goog.net.BrowserChannel.ServerReachability", "goog.net.BrowserChannel.ServerReachabilityEvent", "goog.net.BrowserChannel.Stat", "goog.net.BrowserChannel.StatEvent", "goog.net.BrowserChannel.State", "goog.net.BrowserChannel.TimingEvent"], ["goog.Uri", "goog.array", 
"goog.asserts", "goog.debug.Logger", "goog.debug.TextFormatter", "goog.events.Event", "goog.events.EventTarget", "goog.json", "goog.json.EvalJsonProcessor", "goog.net.BrowserTestChannel", "goog.net.ChannelDebug", "goog.net.ChannelRequest", "goog.net.XhrIo", "goog.net.tmpnetwork", "goog.string", "goog.structs", "goog.structs.CircularBuffer"]);
goog.addDependency("net/browsertestchannel.js", ["goog.net.BrowserTestChannel"], ["goog.json.EvalJsonProcessor", "goog.net.ChannelRequest", "goog.net.ChannelRequest.Error", "goog.net.tmpnetwork", "goog.string.Parser", "goog.userAgent"]);
goog.addDependency("net/bulkloader.js", ["goog.net.BulkLoader"], ["goog.debug.Logger", "goog.events.Event", "goog.events.EventHandler", "goog.events.EventTarget", "goog.net.BulkLoaderHelper", "goog.net.EventType", "goog.net.XhrIo"]);
goog.addDependency("net/bulkloaderhelper.js", ["goog.net.BulkLoaderHelper"], ["goog.Disposable", "goog.debug.Logger"]);
goog.addDependency("net/channeldebug.js", ["goog.net.ChannelDebug"], ["goog.json", "goog.log"]);
goog.addDependency("net/channelrequest.js", ["goog.net.ChannelRequest", "goog.net.ChannelRequest.Error"], ["goog.Timer", "goog.async.Throttle", "goog.events.EventHandler", "goog.net.ErrorCode", "goog.net.EventType", "goog.net.XmlHttp", "goog.object", "goog.userAgent"]);
goog.addDependency("net/cookies.js", ["goog.net.Cookies", "goog.net.cookies"], []);
goog.addDependency("net/crossdomainrpc.js", ["goog.net.CrossDomainRpc"], ["goog.Uri.QueryData", "goog.debug.Logger", "goog.dom", "goog.events", "goog.events.EventTarget", "goog.events.EventType", "goog.json", "goog.net.EventType", "goog.net.HttpStatus", "goog.userAgent"]);
goog.addDependency("net/errorcode.js", ["goog.net.ErrorCode"], []);
goog.addDependency("net/eventtype.js", ["goog.net.EventType"], []);
goog.addDependency("net/filedownloader.js", ["goog.net.FileDownloader", "goog.net.FileDownloader.Error"], ["goog.Disposable", "goog.asserts", "goog.async.Deferred", "goog.crypt.hash32", "goog.debug.Error", "goog.events.EventHandler", "goog.fs", "goog.fs.DirectoryEntry.Behavior", "goog.fs.Error.ErrorCode", "goog.fs.FileSaver.EventType", "goog.net.EventType", "goog.net.XhrIo.ResponseType", "goog.net.XhrIoPool"]);
goog.addDependency("net/httpstatus.js", ["goog.net.HttpStatus"], []);
goog.addDependency("net/iframeio.js", ["goog.net.IframeIo", "goog.net.IframeIo.IncrementalDataEvent"], ["goog.Timer", "goog.Uri", "goog.debug", "goog.debug.Logger", "goog.dom", "goog.events", "goog.events.Event", "goog.events.EventTarget", "goog.events.EventType", "goog.json", "goog.net.ErrorCode", "goog.net.EventType", "goog.reflect", "goog.string", "goog.structs", "goog.userAgent"]);
goog.addDependency("net/iframeloadmonitor.js", ["goog.net.IframeLoadMonitor"], ["goog.dom", "goog.events", "goog.events.EventTarget", "goog.events.EventType", "goog.userAgent"]);
goog.addDependency("net/imageloader.js", ["goog.net.ImageLoader"], ["goog.array", "goog.dom", "goog.events.EventHandler", "goog.events.EventTarget", "goog.events.EventType", "goog.net.EventType", "goog.object", "goog.userAgent"]);
goog.addDependency("net/ipaddress.js", ["goog.net.IpAddress", "goog.net.Ipv4Address", "goog.net.Ipv6Address"], ["goog.array", "goog.math.Integer", "goog.object", "goog.string"]);
goog.addDependency("net/jsloader.js", ["goog.net.jsloader", "goog.net.jsloader.Error"], ["goog.array", "goog.async.Deferred", "goog.debug.Error", "goog.dom", "goog.userAgent"]);
goog.addDependency("net/jsonp.js", ["goog.net.Jsonp"], ["goog.Uri", "goog.dom", "goog.net.jsloader"]);
goog.addDependency("net/mockiframeio.js", ["goog.net.MockIFrameIo"], ["goog.events.EventTarget", "goog.json", "goog.net.ErrorCode", "goog.net.EventType", "goog.net.IframeIo"]);
goog.addDependency("net/mockxhrlite.js", ["goog.net.MockXhrLite"], ["goog.testing.net.XhrIo"]);
goog.addDependency("net/multiiframeloadmonitor.js", ["goog.net.MultiIframeLoadMonitor"], ["goog.events", "goog.net.IframeLoadMonitor"]);
goog.addDependency("net/networkstatusmonitor.js", ["goog.net.NetworkStatusMonitor"], ["goog.events.Listenable"]);
goog.addDependency("net/networktester.js", ["goog.net.NetworkTester"], ["goog.Timer", "goog.Uri", "goog.debug.Logger"]);
goog.addDependency("net/testdata/jsloader_test1.js", ["goog.net.testdata.jsloader_test1"], []);
goog.addDependency("net/testdata/jsloader_test2.js", ["goog.net.testdata.jsloader_test2"], []);
goog.addDependency("net/testdata/jsloader_test3.js", ["goog.net.testdata.jsloader_test3"], []);
goog.addDependency("net/testdata/jsloader_test4.js", ["goog.net.testdata.jsloader_test4"], []);
goog.addDependency("net/tmpnetwork.js", ["goog.net.tmpnetwork"], ["goog.Uri", "goog.net.ChannelDebug"]);
goog.addDependency("net/websocket.js", ["goog.net.WebSocket", "goog.net.WebSocket.ErrorEvent", "goog.net.WebSocket.EventType", "goog.net.WebSocket.MessageEvent"], ["goog.Timer", "goog.asserts", "goog.debug.Logger", "goog.debug.entryPointRegistry", "goog.events", "goog.events.Event", "goog.events.EventTarget"]);
goog.addDependency("net/wrapperxmlhttpfactory.js", ["goog.net.WrapperXmlHttpFactory"], ["goog.net.XmlHttpFactory"]);
goog.addDependency("net/xhrio.js", ["goog.net.XhrIo", "goog.net.XhrIo.ResponseType"], ["goog.Timer", "goog.array", "goog.debug.Logger", "goog.debug.entryPointRegistry", "goog.events", "goog.events.EventTarget", "goog.json", "goog.net.ErrorCode", "goog.net.EventType", "goog.net.HttpStatus", "goog.net.XmlHttp", "goog.object", "goog.string", "goog.structs", "goog.structs.Map", "goog.uri.utils"]);
goog.addDependency("net/xhriopool.js", ["goog.net.XhrIoPool"], ["goog.net.XhrIo", "goog.structs", "goog.structs.PriorityPool"]);
goog.addDependency("net/xhrlite.js", ["goog.net.XhrLite"], ["goog.net.XhrIo"]);
goog.addDependency("net/xhrlitepool.js", ["goog.net.XhrLitePool"], ["goog.net.XhrIoPool"]);
goog.addDependency("net/xhrmanager.js", ["goog.net.XhrManager", "goog.net.XhrManager.Event", "goog.net.XhrManager.Request"], ["goog.Disposable", "goog.events", "goog.events.Event", "goog.events.EventHandler", "goog.events.EventTarget", "goog.net.EventType", "goog.net.XhrIo", "goog.net.XhrIoPool", "goog.structs.Map"]);
goog.addDependency("net/xmlhttp.js", ["goog.net.DefaultXmlHttpFactory", "goog.net.XmlHttp", "goog.net.XmlHttp.OptionType", "goog.net.XmlHttp.ReadyState"], ["goog.net.WrapperXmlHttpFactory", "goog.net.XmlHttpFactory"]);
goog.addDependency("net/xmlhttpfactory.js", ["goog.net.XmlHttpFactory"], []);
goog.addDependency("net/xpc/crosspagechannel.js", ["goog.net.xpc.CrossPageChannel"], ["goog.Disposable", "goog.Uri", "goog.async.Deferred", "goog.async.Delay", "goog.dom", "goog.events", "goog.events.EventHandler", "goog.json", "goog.messaging.AbstractChannel", "goog.net.xpc", "goog.net.xpc.CrossPageChannelRole", "goog.net.xpc.FrameElementMethodTransport", "goog.net.xpc.IframePollingTransport", "goog.net.xpc.IframeRelayTransport", "goog.net.xpc.NativeMessagingTransport", "goog.net.xpc.NixTransport", 
"goog.net.xpc.Transport", "goog.userAgent"]);
goog.addDependency("net/xpc/crosspagechannelrole.js", ["goog.net.xpc.CrossPageChannelRole"], []);
goog.addDependency("net/xpc/frameelementmethodtransport.js", ["goog.net.xpc.FrameElementMethodTransport"], ["goog.net.xpc", "goog.net.xpc.CrossPageChannelRole", "goog.net.xpc.Transport"]);
goog.addDependency("net/xpc/iframepollingtransport.js", ["goog.net.xpc.IframePollingTransport", "goog.net.xpc.IframePollingTransport.Receiver", "goog.net.xpc.IframePollingTransport.Sender"], ["goog.array", "goog.dom", "goog.net.xpc", "goog.net.xpc.CrossPageChannelRole", "goog.net.xpc.Transport", "goog.userAgent"]);
goog.addDependency("net/xpc/iframerelaytransport.js", ["goog.net.xpc.IframeRelayTransport"], ["goog.dom", "goog.events", "goog.net.xpc", "goog.net.xpc.Transport", "goog.userAgent"]);
goog.addDependency("net/xpc/nativemessagingtransport.js", ["goog.net.xpc.NativeMessagingTransport"], ["goog.Timer", "goog.asserts", "goog.async.Deferred", "goog.events", "goog.events.EventHandler", "goog.net.xpc", "goog.net.xpc.CrossPageChannelRole", "goog.net.xpc.Transport"]);
goog.addDependency("net/xpc/nixtransport.js", ["goog.net.xpc.NixTransport"], ["goog.net.xpc", "goog.net.xpc.CrossPageChannelRole", "goog.net.xpc.Transport", "goog.reflect"]);
goog.addDependency("net/xpc/relay.js", ["goog.net.xpc.relay"], []);
goog.addDependency("net/xpc/transport.js", ["goog.net.xpc.Transport"], ["goog.Disposable", "goog.dom", "goog.net.xpc"]);
goog.addDependency("net/xpc/xpc.js", ["goog.net.xpc", "goog.net.xpc.CfgFields", "goog.net.xpc.ChannelStates", "goog.net.xpc.TransportNames", "goog.net.xpc.TransportTypes", "goog.net.xpc.UriCfgFields"], ["goog.debug.Logger"]);
goog.addDependency("object/object.js", ["goog.object"], []);
goog.addDependency("positioning/absoluteposition.js", ["goog.positioning.AbsolutePosition"], ["goog.math.Box", "goog.math.Coordinate", "goog.math.Size", "goog.positioning", "goog.positioning.AbstractPosition"]);
goog.addDependency("positioning/abstractposition.js", ["goog.positioning.AbstractPosition"], ["goog.math.Box", "goog.math.Size", "goog.positioning.Corner"]);
goog.addDependency("positioning/anchoredposition.js", ["goog.positioning.AnchoredPosition"], ["goog.math.Box", "goog.positioning", "goog.positioning.AbstractPosition"]);
goog.addDependency("positioning/anchoredviewportposition.js", ["goog.positioning.AnchoredViewportPosition"], ["goog.math.Box", "goog.positioning", "goog.positioning.AnchoredPosition", "goog.positioning.Corner", "goog.positioning.Overflow", "goog.positioning.OverflowStatus"]);
goog.addDependency("positioning/clientposition.js", ["goog.positioning.ClientPosition"], ["goog.asserts", "goog.math.Box", "goog.math.Coordinate", "goog.math.Size", "goog.positioning", "goog.positioning.AbstractPosition", "goog.style"]);
goog.addDependency("positioning/clientposition_test.js", ["goog.positioning.clientPositionTest"], ["goog.dom", "goog.positioning.ClientPosition", "goog.style", "goog.testing.jsunit"]);
goog.addDependency("positioning/menuanchoredposition.js", ["goog.positioning.MenuAnchoredPosition"], ["goog.math.Box", "goog.math.Size", "goog.positioning", "goog.positioning.AnchoredViewportPosition", "goog.positioning.Corner", "goog.positioning.Overflow"]);
goog.addDependency("positioning/positioning.js", ["goog.positioning", "goog.positioning.Corner", "goog.positioning.CornerBit", "goog.positioning.Overflow", "goog.positioning.OverflowStatus"], ["goog.asserts", "goog.dom", "goog.dom.TagName", "goog.math.Box", "goog.math.Coordinate", "goog.math.Size", "goog.style", "goog.style.bidi"]);
goog.addDependency("positioning/positioning_test.js", ["goog.positioningTest"], ["goog.dom", "goog.dom.DomHelper", "goog.math.Box", "goog.math.Coordinate", "goog.math.Rect", "goog.math.Size", "goog.positioning", "goog.positioning.Corner", "goog.positioning.Overflow", "goog.positioning.OverflowStatus", "goog.style", "goog.testing.ExpectedFailures", "goog.testing.jsunit", "goog.userAgent", "goog.userAgent.product"]);
goog.addDependency("positioning/viewportclientposition.js", ["goog.positioning.ViewportClientPosition"], ["goog.math.Box", "goog.math.Coordinate", "goog.math.Size", "goog.positioning.ClientPosition"]);
goog.addDependency("positioning/viewportposition.js", ["goog.positioning.ViewportPosition"], ["goog.math.Box", "goog.math.Coordinate", "goog.math.Size", "goog.positioning.AbstractPosition"]);
goog.addDependency("proto/proto.js", ["goog.proto"], ["goog.proto.Serializer"]);
goog.addDependency("proto/serializer.js", ["goog.proto.Serializer"], ["goog.json.Serializer", "goog.string"]);
goog.addDependency("proto2/descriptor.js", ["goog.proto2.Descriptor", "goog.proto2.Metadata"], ["goog.array", "goog.object", "goog.proto2.Util"]);
goog.addDependency("proto2/fielddescriptor.js", ["goog.proto2.FieldDescriptor"], ["goog.proto2.Util", "goog.string"]);
goog.addDependency("proto2/lazydeserializer.js", ["goog.proto2.LazyDeserializer"], ["goog.proto2.Message", "goog.proto2.Serializer", "goog.proto2.Util"]);
goog.addDependency("proto2/message.js", ["goog.proto2.Message"], ["goog.proto2.Descriptor", "goog.proto2.FieldDescriptor", "goog.proto2.Util", "goog.string"]);
goog.addDependency("proto2/objectserializer.js", ["goog.proto2.ObjectSerializer"], ["goog.proto2.Serializer", "goog.proto2.Util", "goog.string"]);
goog.addDependency("proto2/package_test.pb.js", ["someprotopackage.TestPackageTypes"], ["goog.proto2.Message", "proto2.TestAllTypes"]);
goog.addDependency("proto2/pbliteserializer.js", ["goog.proto2.PbLiteSerializer"], ["goog.proto2.LazyDeserializer", "goog.proto2.Util"]);
goog.addDependency("proto2/serializer.js", ["goog.proto2.Serializer"], ["goog.proto2.Descriptor", "goog.proto2.FieldDescriptor", "goog.proto2.Message", "goog.proto2.Util"]);
goog.addDependency("proto2/test.pb.js", ["proto2.TestAllTypes", "proto2.TestAllTypes.NestedEnum", "proto2.TestAllTypes.NestedMessage", "proto2.TestAllTypes.OptionalGroup", "proto2.TestAllTypes.RepeatedGroup"], ["goog.proto2.Message"]);
goog.addDependency("proto2/textformatserializer.js", ["goog.proto2.TextFormatSerializer", "goog.proto2.TextFormatSerializer.Parser"], ["goog.array", "goog.asserts", "goog.json", "goog.proto2.Serializer", "goog.proto2.Util", "goog.string"]);
goog.addDependency("proto2/textformatserializer_test.js", ["goog.proto2.TextFormatSerializerTest"], ["goog.proto2.TextFormatSerializer", "goog.testing.jsunit", "proto2.TestAllTypes"]);
goog.addDependency("proto2/util.js", ["goog.proto2.Util"], ["goog.asserts"]);
goog.addDependency("pubsub/pubsub.js", ["goog.pubsub.PubSub"], ["goog.Disposable", "goog.array"]);
goog.addDependency("reflect/reflect.js", ["goog.reflect"], []);
goog.addDependency("result/deferredadaptor.js", ["goog.result.DeferredAdaptor"], ["goog.async.Deferred", "goog.result", "goog.result.Result"]);
goog.addDependency("result/dependentresult.js", ["goog.result.DependentResult"], ["goog.result.Result"]);
goog.addDependency("result/result_interface.js", ["goog.result.Result"], []);
goog.addDependency("result/resultutil.js", ["goog.result"], ["goog.array", "goog.result.DependentResult", "goog.result.Result", "goog.result.SimpleResult"]);
goog.addDependency("result/simpleresult.js", ["goog.result.SimpleResult", "goog.result.SimpleResult.StateError"], ["goog.debug.Error", "goog.result.Result"]);
goog.addDependency("soy/data.js", ["goog.soy.data", "goog.soy.data.SanitizedContent", "goog.soy.data.SanitizedContentKind"], []);
goog.addDependency("soy/renderer.js", ["goog.soy.InjectedDataSupplier", "goog.soy.Renderer"], ["goog.asserts", "goog.dom", "goog.soy", "goog.soy.data.SanitizedContent", "goog.soy.data.SanitizedContentKind"]);
goog.addDependency("soy/soy.js", ["goog.soy"], ["goog.asserts", "goog.dom", "goog.dom.NodeType", "goog.dom.TagName", "goog.soy.data", "goog.string"]);
goog.addDependency("soy/soy_test.js", ["goog.soy.testHelper"], ["goog.dom", "goog.dom.TagName", "goog.soy.data.SanitizedContent", "goog.soy.data.SanitizedContentKind", "goog.string", "goog.userAgent"]);
goog.addDependency("spell/spellcheck.js", ["goog.spell.SpellCheck", "goog.spell.SpellCheck.WordChangedEvent"], ["goog.Timer", "goog.events.EventTarget", "goog.structs.Set"]);
goog.addDependency("stats/basicstat.js", ["goog.stats.BasicStat"], ["goog.array", "goog.debug.Logger", "goog.iter", "goog.object", "goog.string.format", "goog.structs.CircularBuffer"]);
goog.addDependency("storage/collectablestorage.js", ["goog.storage.CollectableStorage"], ["goog.array", "goog.asserts", "goog.iter", "goog.storage.ErrorCode", "goog.storage.ExpiringStorage", "goog.storage.RichStorage.Wrapper", "goog.storage.mechanism.IterableMechanism"]);
goog.addDependency("storage/encryptedstorage.js", ["goog.storage.EncryptedStorage"], ["goog.crypt", "goog.crypt.Arc4", "goog.crypt.Sha1", "goog.crypt.base64", "goog.json", "goog.json.Serializer", "goog.storage.CollectableStorage", "goog.storage.ErrorCode", "goog.storage.RichStorage", "goog.storage.RichStorage.Wrapper", "goog.storage.mechanism.IterableMechanism"]);
goog.addDependency("storage/errorcode.js", ["goog.storage.ErrorCode"], []);
goog.addDependency("storage/expiringstorage.js", ["goog.storage.ExpiringStorage"], ["goog.storage.RichStorage", "goog.storage.RichStorage.Wrapper", "goog.storage.mechanism.Mechanism"]);
goog.addDependency("storage/mechanism/errorcode.js", ["goog.storage.mechanism.ErrorCode"], []);
goog.addDependency("storage/mechanism/errorhandlingmechanism.js", ["goog.storage.mechanism.ErrorHandlingMechanism"], ["goog.storage.mechanism.Mechanism"]);
goog.addDependency("storage/mechanism/html5localstorage.js", ["goog.storage.mechanism.HTML5LocalStorage"], ["goog.storage.mechanism.HTML5WebStorage"]);
goog.addDependency("storage/mechanism/html5sessionstorage.js", ["goog.storage.mechanism.HTML5SessionStorage"], ["goog.storage.mechanism.HTML5WebStorage"]);
goog.addDependency("storage/mechanism/html5webstorage.js", ["goog.storage.mechanism.HTML5WebStorage"], ["goog.asserts", "goog.iter.Iterator", "goog.iter.StopIteration", "goog.storage.mechanism.ErrorCode", "goog.storage.mechanism.IterableMechanism"]);
goog.addDependency("storage/mechanism/ieuserdata.js", ["goog.storage.mechanism.IEUserData"], ["goog.asserts", "goog.iter.Iterator", "goog.iter.StopIteration", "goog.storage.mechanism.ErrorCode", "goog.storage.mechanism.IterableMechanism", "goog.structs.Map", "goog.userAgent"]);
goog.addDependency("storage/mechanism/iterablemechanism.js", ["goog.storage.mechanism.IterableMechanism"], ["goog.array", "goog.asserts", "goog.iter", "goog.iter.Iterator", "goog.storage.mechanism.Mechanism"]);
goog.addDependency("storage/mechanism/iterablemechanismtester.js", ["goog.storage.mechanism.iterableMechanismTester"], ["goog.iter.Iterator", "goog.storage.mechanism.IterableMechanism", "goog.testing.asserts"]);
goog.addDependency("storage/mechanism/mechanism.js", ["goog.storage.mechanism.Mechanism"], []);
goog.addDependency("storage/mechanism/mechanismfactory.js", ["goog.storage.mechanism.mechanismfactory"], ["goog.storage.mechanism.HTML5LocalStorage", "goog.storage.mechanism.HTML5SessionStorage", "goog.storage.mechanism.IEUserData", "goog.storage.mechanism.IterableMechanism", "goog.storage.mechanism.PrefixedMechanism"]);
goog.addDependency("storage/mechanism/mechanismseparationtester.js", ["goog.storage.mechanism.mechanismSeparationTester"], ["goog.iter.Iterator", "goog.storage.mechanism.IterableMechanism", "goog.testing.asserts"]);
goog.addDependency("storage/mechanism/mechanismsharingtester.js", ["goog.storage.mechanism.mechanismSharingTester"], ["goog.iter.Iterator", "goog.storage.mechanism.IterableMechanism", "goog.testing.asserts"]);
goog.addDependency("storage/mechanism/mechanismtester.js", ["goog.storage.mechanism.mechanismTester"], ["goog.storage.mechanism.ErrorCode", "goog.storage.mechanism.HTML5LocalStorage", "goog.storage.mechanism.Mechanism", "goog.testing.asserts", "goog.userAgent.product", "goog.userAgent.product.isVersion"]);
goog.addDependency("storage/mechanism/prefixedmechanism.js", ["goog.storage.mechanism.PrefixedMechanism"], ["goog.iter.Iterator", "goog.storage.mechanism.IterableMechanism"]);
goog.addDependency("storage/richstorage.js", ["goog.storage.RichStorage", "goog.storage.RichStorage.Wrapper"], ["goog.storage.ErrorCode", "goog.storage.Storage", "goog.storage.mechanism.Mechanism"]);
goog.addDependency("storage/storage.js", ["goog.storage.Storage"], ["goog.json", "goog.json.Serializer", "goog.storage.ErrorCode"]);
goog.addDependency("storage/storage_test.js", ["goog.storage.storage_test"], ["goog.storage.Storage", "goog.structs.Map", "goog.testing.asserts"]);
goog.addDependency("string/linkify.js", ["goog.string.linkify"], ["goog.string"]);
goog.addDependency("string/newlines.js", ["goog.string.newlines"], ["goog.array"]);
goog.addDependency("string/newlines_test.js", ["goog.string.newlinesTest"], ["goog.string.newlines", "goog.testing.jsunit"]);
goog.addDependency("string/parser.js", ["goog.string.Parser"], []);
goog.addDependency("string/path.js", ["goog.string.path"], ["goog.array", "goog.string"]);
goog.addDependency("string/string.js", ["goog.string", "goog.string.Unicode"], []);
goog.addDependency("string/string_test.js", ["goog.stringTest"], ["goog.functions", "goog.object", "goog.string", "goog.testing.PropertyReplacer", "goog.testing.jsunit"]);
goog.addDependency("string/stringbuffer.js", ["goog.string.StringBuffer"], []);
goog.addDependency("string/stringformat.js", ["goog.string.format"], ["goog.string"]);
goog.addDependency("string/stringifier.js", ["goog.string.Stringifier"], []);
goog.addDependency("structs/avltree.js", ["goog.structs.AvlTree", "goog.structs.AvlTree.Node"], ["goog.structs", "goog.structs.Collection"]);
goog.addDependency("structs/circularbuffer.js", ["goog.structs.CircularBuffer"], []);
goog.addDependency("structs/collection.js", ["goog.structs.Collection"], []);
goog.addDependency("structs/heap.js", ["goog.structs.Heap"], ["goog.array", "goog.object", "goog.structs.Node"]);
goog.addDependency("structs/inversionmap.js", ["goog.structs.InversionMap"], ["goog.array"]);
goog.addDependency("structs/linkedmap.js", ["goog.structs.LinkedMap"], ["goog.structs.Map"]);
goog.addDependency("structs/map.js", ["goog.structs.Map"], ["goog.iter.Iterator", "goog.iter.StopIteration", "goog.object", "goog.structs"]);
goog.addDependency("structs/node.js", ["goog.structs.Node"], []);
goog.addDependency("structs/pool.js", ["goog.structs.Pool"], ["goog.Disposable", "goog.structs.Queue", "goog.structs.Set"]);
goog.addDependency("structs/prioritypool.js", ["goog.structs.PriorityPool"], ["goog.structs.Pool", "goog.structs.PriorityQueue"]);
goog.addDependency("structs/priorityqueue.js", ["goog.structs.PriorityQueue"], ["goog.structs", "goog.structs.Heap"]);
goog.addDependency("structs/quadtree.js", ["goog.structs.QuadTree", "goog.structs.QuadTree.Node", "goog.structs.QuadTree.Point"], ["goog.math.Coordinate"]);
goog.addDependency("structs/queue.js", ["goog.structs.Queue"], ["goog.array"]);
goog.addDependency("structs/set.js", ["goog.structs.Set"], ["goog.structs", "goog.structs.Collection", "goog.structs.Map"]);
goog.addDependency("structs/simplepool.js", ["goog.structs.SimplePool"], ["goog.Disposable"]);
goog.addDependency("structs/stringset.js", ["goog.structs.StringSet"], ["goog.iter"]);
goog.addDependency("structs/structs.js", ["goog.structs"], ["goog.array", "goog.object"]);
goog.addDependency("structs/treenode.js", ["goog.structs.TreeNode"], ["goog.array", "goog.asserts", "goog.structs.Node"]);
goog.addDependency("structs/trie.js", ["goog.structs.Trie"], ["goog.object", "goog.structs"]);
goog.addDependency("style/bidi.js", ["goog.style.bidi"], ["goog.dom", "goog.style", "goog.userAgent"]);
goog.addDependency("style/cursor.js", ["goog.style.cursor"], ["goog.userAgent"]);
goog.addDependency("style/style.js", ["goog.style"], ["goog.array", "goog.asserts", "goog.dom", "goog.dom.NodeType", "goog.dom.vendor", "goog.math.Box", "goog.math.Coordinate", "goog.math.Rect", "goog.math.Size", "goog.object", "goog.string", "goog.userAgent"]);
goog.addDependency("style/style_test.js", ["goog.style_test"], ["goog.array", "goog.color", "goog.dom", "goog.events.BrowserEvent", "goog.math.Box", "goog.math.Coordinate", "goog.math.Rect", "goog.math.Size", "goog.object", "goog.string", "goog.style", "goog.testing.ExpectedFailures", "goog.testing.PropertyReplacer", "goog.testing.asserts", "goog.testing.jsunit", "goog.userAgent", "goog.userAgent.product", "goog.userAgent.product.isVersion"]);
goog.addDependency("style/stylescrollbartester.js", ["goog.styleScrollbarTester"], ["goog.dom", "goog.style", "goog.testing.asserts"]);
goog.addDependency("style/transition.js", ["goog.style.transition", "goog.style.transition.Css3Property"], ["goog.array", "goog.asserts", "goog.dom.vendor", "goog.style", "goog.userAgent"]);
goog.addDependency("testing/asserts.js", ["goog.testing.JsUnitException", "goog.testing.asserts"], ["goog.testing.stacktrace"]);
goog.addDependency("testing/async/mockcontrol.js", ["goog.testing.async.MockControl"], ["goog.asserts", "goog.async.Deferred", "goog.debug", "goog.testing.asserts", "goog.testing.mockmatchers.IgnoreArgument"]);
goog.addDependency("testing/asynctestcase.js", ["goog.testing.AsyncTestCase", "goog.testing.AsyncTestCase.ControlBreakingException"], ["goog.testing.TestCase", "goog.testing.TestCase.Test", "goog.testing.asserts"]);
goog.addDependency("testing/benchmark.js", ["goog.testing.benchmark"], ["goog.dom", "goog.dom.TagName", "goog.testing.PerformanceTable", "goog.testing.PerformanceTimer", "goog.testing.TestCase"]);
goog.addDependency("testing/continuationtestcase.js", ["goog.testing.ContinuationTestCase", "goog.testing.ContinuationTestCase.Step", "goog.testing.ContinuationTestCase.Test"], ["goog.array", "goog.events.EventHandler", "goog.testing.TestCase", "goog.testing.TestCase.Test", "goog.testing.asserts"]);
goog.addDependency("testing/deferredtestcase.js", ["goog.testing.DeferredTestCase"], ["goog.async.Deferred", "goog.testing.AsyncTestCase", "goog.testing.TestCase"]);
goog.addDependency("testing/dom.js", ["goog.testing.dom"], ["goog.dom", "goog.dom.NodeIterator", "goog.dom.NodeType", "goog.dom.TagIterator", "goog.dom.TagName", "goog.dom.classes", "goog.iter", "goog.object", "goog.string", "goog.style", "goog.testing.asserts", "goog.userAgent"]);
goog.addDependency("testing/editor/dom.js", ["goog.testing.editor.dom"], ["goog.dom.NodeType", "goog.dom.TagIterator", "goog.dom.TagWalkType", "goog.iter", "goog.string", "goog.testing.asserts"]);
goog.addDependency("testing/editor/fieldmock.js", ["goog.testing.editor.FieldMock"], ["goog.dom", "goog.dom.Range", "goog.editor.Field", "goog.testing.LooseMock", "goog.testing.mockmatchers"]);
goog.addDependency("testing/editor/testhelper.js", ["goog.testing.editor.TestHelper"], ["goog.Disposable", "goog.dom", "goog.dom.Range", "goog.editor.BrowserFeature", "goog.editor.node", "goog.editor.plugins.AbstractBubblePlugin", "goog.testing.dom"]);
goog.addDependency("testing/events/eventobserver.js", ["goog.testing.events.EventObserver"], ["goog.array"]);
goog.addDependency("testing/events/events.js", ["goog.testing.events", "goog.testing.events.Event"], ["goog.Disposable", "goog.dom.NodeType", "goog.events", "goog.events.BrowserEvent", "goog.events.BrowserFeature", "goog.events.EventTarget", "goog.events.EventType", "goog.events.KeyCodes", "goog.object", "goog.style", "goog.userAgent"]);
goog.addDependency("testing/events/matchers.js", ["goog.testing.events.EventMatcher"], ["goog.events.Event", "goog.testing.mockmatchers.ArgumentMatcher"]);
goog.addDependency("testing/events/onlinehandler.js", ["goog.testing.events.OnlineHandler"], ["goog.events.EventTarget", "goog.net.NetworkStatusMonitor"]);
goog.addDependency("testing/expectedfailures.js", ["goog.testing.ExpectedFailures"], ["goog.debug.DivConsole", "goog.debug.Logger", "goog.dom", "goog.dom.TagName", "goog.events", "goog.events.EventType", "goog.style", "goog.testing.JsUnitException", "goog.testing.TestCase", "goog.testing.asserts"]);
goog.addDependency("testing/fs/blob.js", ["goog.testing.fs.Blob"], ["goog.crypt.base64"]);
goog.addDependency("testing/fs/entry.js", ["goog.testing.fs.DirectoryEntry", "goog.testing.fs.Entry", "goog.testing.fs.FileEntry"], ["goog.Timer", "goog.array", "goog.async.Deferred", "goog.fs.DirectoryEntry", "goog.fs.DirectoryEntry.Behavior", "goog.fs.Error", "goog.functions", "goog.object", "goog.string", "goog.testing.fs.File", "goog.testing.fs.FileWriter"]);
goog.addDependency("testing/fs/file.js", ["goog.testing.fs.File"], ["goog.testing.fs.Blob"]);
goog.addDependency("testing/fs/filereader.js", ["goog.testing.fs.FileReader"], ["goog.Timer", "goog.events.EventTarget", "goog.fs.Error", "goog.fs.FileReader.EventType", "goog.fs.FileReader.ReadyState", "goog.testing.fs.File", "goog.testing.fs.ProgressEvent"]);
goog.addDependency("testing/fs/filesystem.js", ["goog.testing.fs.FileSystem"], ["goog.testing.fs.DirectoryEntry"]);
goog.addDependency("testing/fs/filewriter.js", ["goog.testing.fs.FileWriter"], ["goog.Timer", "goog.events.Event", "goog.events.EventTarget", "goog.fs.Error", "goog.fs.FileSaver.EventType", "goog.fs.FileSaver.ReadyState", "goog.string", "goog.testing.fs.File", "goog.testing.fs.ProgressEvent"]);
goog.addDependency("testing/fs/fs.js", ["goog.testing.fs"], ["goog.Timer", "goog.array", "goog.async.Deferred", "goog.fs", "goog.testing.fs.Blob", "goog.testing.fs.FileSystem"]);
goog.addDependency("testing/fs/progressevent.js", ["goog.testing.fs.ProgressEvent"], ["goog.events.Event"]);
goog.addDependency("testing/functionmock.js", ["goog.testing", "goog.testing.FunctionMock", "goog.testing.GlobalFunctionMock", "goog.testing.MethodMock"], ["goog.object", "goog.testing.LooseMock", "goog.testing.Mock", "goog.testing.MockInterface", "goog.testing.PropertyReplacer", "goog.testing.StrictMock"]);
goog.addDependency("testing/graphics.js", ["goog.testing.graphics"], ["goog.graphics.Path.Segment", "goog.testing.asserts"]);
goog.addDependency("testing/jsunit.js", ["goog.testing.jsunit"], ["goog.testing.TestCase", "goog.testing.TestRunner"]);
goog.addDependency("testing/loosemock.js", ["goog.testing.LooseExpectationCollection", "goog.testing.LooseMock"], ["goog.array", "goog.structs.Map", "goog.testing.Mock"]);
goog.addDependency("testing/messaging/mockmessagechannel.js", ["goog.testing.messaging.MockMessageChannel"], ["goog.messaging.AbstractChannel", "goog.testing.asserts"]);
goog.addDependency("testing/messaging/mockmessageevent.js", ["goog.testing.messaging.MockMessageEvent"], ["goog.events.BrowserEvent", "goog.events.EventType", "goog.testing.events"]);
goog.addDependency("testing/messaging/mockmessageport.js", ["goog.testing.messaging.MockMessagePort"], ["goog.events.EventTarget"]);
goog.addDependency("testing/messaging/mockportnetwork.js", ["goog.testing.messaging.MockPortNetwork"], ["goog.messaging.PortNetwork", "goog.testing.messaging.MockMessageChannel"]);
goog.addDependency("testing/mock.js", ["goog.testing.Mock", "goog.testing.MockExpectation"], ["goog.array", "goog.object", "goog.testing.JsUnitException", "goog.testing.MockInterface", "goog.testing.mockmatchers"]);
goog.addDependency("testing/mockclassfactory.js", ["goog.testing.MockClassFactory", "goog.testing.MockClassRecord"], ["goog.array", "goog.object", "goog.testing.LooseMock", "goog.testing.StrictMock", "goog.testing.TestCase", "goog.testing.mockmatchers"]);
goog.addDependency("testing/mockclock.js", ["goog.testing.MockClock"], ["goog.Disposable", "goog.testing.PropertyReplacer", "goog.testing.events", "goog.testing.events.Event"]);
goog.addDependency("testing/mockcontrol.js", ["goog.testing.MockControl"], ["goog.array", "goog.testing", "goog.testing.LooseMock", "goog.testing.MockInterface", "goog.testing.StrictMock"]);
goog.addDependency("testing/mockinterface.js", ["goog.testing.MockInterface"], []);
goog.addDependency("testing/mockmatchers.js", ["goog.testing.mockmatchers", "goog.testing.mockmatchers.ArgumentMatcher", "goog.testing.mockmatchers.IgnoreArgument", "goog.testing.mockmatchers.InstanceOf", "goog.testing.mockmatchers.ObjectEquals", "goog.testing.mockmatchers.RegexpMatch", "goog.testing.mockmatchers.SaveArgument", "goog.testing.mockmatchers.TypeOf"], ["goog.array", "goog.dom", "goog.testing.asserts"]);
goog.addDependency("testing/mockrandom.js", ["goog.testing.MockRandom"], ["goog.Disposable"]);
goog.addDependency("testing/mockrange.js", ["goog.testing.MockRange"], ["goog.dom.AbstractRange", "goog.testing.LooseMock"]);
goog.addDependency("testing/mockstorage.js", ["goog.testing.MockStorage"], ["goog.structs.Map"]);
goog.addDependency("testing/mockuseragent.js", ["goog.testing.MockUserAgent"], ["goog.Disposable", "goog.userAgent"]);
goog.addDependency("testing/multitestrunner.js", ["goog.testing.MultiTestRunner", "goog.testing.MultiTestRunner.TestFrame"], ["goog.Timer", "goog.array", "goog.dom", "goog.dom.classes", "goog.events.EventHandler", "goog.functions", "goog.string", "goog.ui.Component", "goog.ui.ServerChart", "goog.ui.TableSorter"]);
goog.addDependency("testing/net/xhrio.js", ["goog.testing.net.XhrIo"], ["goog.array", "goog.dom.xml", "goog.events", "goog.events.EventTarget", "goog.json", "goog.net.ErrorCode", "goog.net.EventType", "goog.net.HttpStatus", "goog.net.XhrIo", "goog.net.XmlHttp", "goog.object", "goog.structs.Map"]);
goog.addDependency("testing/net/xhriopool.js", ["goog.testing.net.XhrIoPool"], ["goog.net.XhrIoPool", "goog.testing.net.XhrIo"]);
goog.addDependency("testing/objectpropertystring.js", ["goog.testing.ObjectPropertyString"], []);
goog.addDependency("testing/performancetable.js", ["goog.testing.PerformanceTable"], ["goog.dom", "goog.testing.PerformanceTimer"]);
goog.addDependency("testing/performancetimer.js", ["goog.testing.PerformanceTimer", "goog.testing.PerformanceTimer.Task"], ["goog.array", "goog.async.Deferred", "goog.math"]);
goog.addDependency("testing/propertyreplacer.js", ["goog.testing.PropertyReplacer"], ["goog.userAgent"]);
goog.addDependency("testing/proto2/proto2.js", ["goog.testing.proto2"], ["goog.proto2.Message", "goog.testing.asserts"]);
goog.addDependency("testing/pseudorandom.js", ["goog.testing.PseudoRandom"], ["goog.Disposable"]);
goog.addDependency("testing/recordfunction.js", ["goog.testing.FunctionCall", "goog.testing.recordConstructor", "goog.testing.recordFunction"], []);
goog.addDependency("testing/shardingtestcase.js", ["goog.testing.ShardingTestCase"], ["goog.asserts", "goog.testing.TestCase"]);
goog.addDependency("testing/singleton.js", ["goog.testing.singleton"], []);
goog.addDependency("testing/stacktrace.js", ["goog.testing.stacktrace", "goog.testing.stacktrace.Frame"], []);
goog.addDependency("testing/storage/fakemechanism.js", ["goog.testing.storage.FakeMechanism"], ["goog.storage.mechanism.IterableMechanism", "goog.structs.Map"]);
goog.addDependency("testing/strictmock.js", ["goog.testing.StrictMock"], ["goog.array", "goog.testing.Mock"]);
goog.addDependency("testing/style/layoutasserts.js", ["goog.testing.style.layoutasserts"], ["goog.style", "goog.testing.asserts", "goog.testing.style"]);
goog.addDependency("testing/style/style.js", ["goog.testing.style"], ["goog.dom", "goog.math.Rect", "goog.style"]);
goog.addDependency("testing/testcase.js", ["goog.testing.TestCase", "goog.testing.TestCase.Error", "goog.testing.TestCase.Order", "goog.testing.TestCase.Result", "goog.testing.TestCase.Test"], ["goog.object", "goog.testing.asserts", "goog.testing.stacktrace"]);
goog.addDependency("testing/testqueue.js", ["goog.testing.TestQueue"], []);
goog.addDependency("testing/testrunner.js", ["goog.testing.TestRunner"], ["goog.testing.TestCase"]);
goog.addDependency("testing/ui/rendererasserts.js", ["goog.testing.ui.rendererasserts"], ["goog.testing.asserts"]);
goog.addDependency("testing/ui/rendererharness.js", ["goog.testing.ui.RendererHarness"], ["goog.Disposable", "goog.dom.NodeType", "goog.testing.asserts", "goog.testing.dom"]);
goog.addDependency("testing/ui/style.js", ["goog.testing.ui.style"], ["goog.array", "goog.dom", "goog.dom.classes", "goog.testing.asserts"]);
goog.addDependency("timer/timer.js", ["goog.Timer"], ["goog.events.EventTarget"]);
goog.addDependency("tweak/entries.js", ["goog.tweak.BaseEntry", "goog.tweak.BasePrimitiveSetting", "goog.tweak.BaseSetting", "goog.tweak.BooleanGroup", "goog.tweak.BooleanInGroupSetting", "goog.tweak.BooleanSetting", "goog.tweak.ButtonAction", "goog.tweak.NumericSetting", "goog.tweak.StringSetting"], ["goog.array", "goog.asserts", "goog.debug.Logger", "goog.object"]);
goog.addDependency("tweak/registry.js", ["goog.tweak.Registry"], ["goog.asserts", "goog.debug.Logger", "goog.object", "goog.string", "goog.tweak.BaseEntry", "goog.uri.utils"]);
goog.addDependency("tweak/testhelpers.js", ["goog.tweak.testhelpers"], ["goog.tweak", "goog.tweak.BooleanGroup", "goog.tweak.BooleanInGroupSetting", "goog.tweak.BooleanSetting", "goog.tweak.ButtonAction", "goog.tweak.NumericSetting", "goog.tweak.Registry", "goog.tweak.StringSetting"]);
goog.addDependency("tweak/tweak.js", ["goog.tweak", "goog.tweak.ConfigParams"], ["goog.asserts", "goog.tweak.BooleanGroup", "goog.tweak.BooleanInGroupSetting", "goog.tweak.BooleanSetting", "goog.tweak.ButtonAction", "goog.tweak.NumericSetting", "goog.tweak.Registry", "goog.tweak.StringSetting"]);
goog.addDependency("tweak/tweakui.js", ["goog.tweak.EntriesPanel", "goog.tweak.TweakUi"], ["goog.array", "goog.asserts", "goog.dom.DomHelper", "goog.object", "goog.style", "goog.tweak", "goog.ui.Zippy", "goog.userAgent"]);
goog.addDependency("ui/abstractspellchecker.js", ["goog.ui.AbstractSpellChecker", "goog.ui.AbstractSpellChecker.AsyncResult"], ["goog.a11y.aria", "goog.array", "goog.asserts", "goog.dom", "goog.dom.NodeType", "goog.dom.classes", "goog.dom.selection", "goog.events", "goog.events.Event", "goog.events.EventType", "goog.math.Coordinate", "goog.spell.SpellCheck", "goog.structs.Set", "goog.style", "goog.ui.Component", "goog.ui.MenuItem", "goog.ui.MenuSeparator", "goog.ui.PopupMenu"]);
goog.addDependency("ui/ac/ac.js", ["goog.ui.ac"], ["goog.ui.ac.ArrayMatcher", "goog.ui.ac.AutoComplete", "goog.ui.ac.InputHandler", "goog.ui.ac.Renderer"]);
goog.addDependency("ui/ac/arraymatcher.js", ["goog.ui.ac.ArrayMatcher"], ["goog.string"]);
goog.addDependency("ui/ac/autocomplete.js", ["goog.ui.ac.AutoComplete", "goog.ui.ac.AutoComplete.EventType"], ["goog.events", "goog.events.EventTarget"]);
goog.addDependency("ui/ac/inputhandler.js", ["goog.ui.ac.InputHandler"], ["goog.Disposable", "goog.Timer", "goog.a11y.aria", "goog.dom", "goog.dom.selection", "goog.events.EventHandler", "goog.events.EventType", "goog.events.KeyCodes", "goog.events.KeyHandler", "goog.string", "goog.userAgent", "goog.userAgent.product"]);
goog.addDependency("ui/ac/remote.js", ["goog.ui.ac.Remote"], ["goog.ui.ac.AutoComplete", "goog.ui.ac.InputHandler", "goog.ui.ac.RemoteArrayMatcher", "goog.ui.ac.Renderer"]);
goog.addDependency("ui/ac/remotearraymatcher.js", ["goog.ui.ac.RemoteArrayMatcher"], ["goog.Disposable", "goog.Uri", "goog.events", "goog.json", "goog.net.XhrIo"]);
goog.addDependency("ui/ac/renderer.js", ["goog.ui.ac.Renderer", "goog.ui.ac.Renderer.CustomRenderer"], ["goog.a11y.aria", "goog.a11y.aria.Role", "goog.a11y.aria.State", "goog.array", "goog.dispose", "goog.dom", "goog.dom.classes", "goog.events.Event", "goog.events.EventTarget", "goog.events.EventType", "goog.fx.dom.FadeInAndShow", "goog.fx.dom.FadeOutAndHide", "goog.positioning", "goog.positioning.Corner", "goog.positioning.Overflow", "goog.string", "goog.style", "goog.ui.IdGenerator", "goog.ui.ac.AutoComplete.EventType", 
"goog.userAgent"]);
goog.addDependency("ui/ac/renderoptions.js", ["goog.ui.ac.RenderOptions"], []);
goog.addDependency("ui/ac/richinputhandler.js", ["goog.ui.ac.RichInputHandler"], ["goog.ui.ac.InputHandler"]);
goog.addDependency("ui/ac/richremote.js", ["goog.ui.ac.RichRemote"], ["goog.ui.ac.AutoComplete", "goog.ui.ac.Remote", "goog.ui.ac.Renderer", "goog.ui.ac.RichInputHandler", "goog.ui.ac.RichRemoteArrayMatcher"]);
goog.addDependency("ui/ac/richremotearraymatcher.js", ["goog.ui.ac.RichRemoteArrayMatcher"], ["goog.ui.ac.RemoteArrayMatcher"]);
goog.addDependency("ui/activitymonitor.js", ["goog.ui.ActivityMonitor"], ["goog.array", "goog.asserts", "goog.dom", "goog.events.EventHandler", "goog.events.EventTarget", "goog.events.EventType"]);
goog.addDependency("ui/advancedtooltip.js", ["goog.ui.AdvancedTooltip"], ["goog.events.EventType", "goog.math.Coordinate", "goog.ui.Tooltip", "goog.userAgent"]);
goog.addDependency("ui/animatedzippy.js", ["goog.ui.AnimatedZippy"], ["goog.dom", "goog.events", "goog.fx.Animation", "goog.fx.Animation.EventType", "goog.fx.Transition.EventType", "goog.fx.easing", "goog.ui.Zippy", "goog.ui.ZippyEvent"]);
goog.addDependency("ui/attachablemenu.js", ["goog.ui.AttachableMenu"], ["goog.a11y.aria", "goog.a11y.aria.State", "goog.array", "goog.asserts", "goog.dom", "goog.dom.classes", "goog.events.Event", "goog.events.KeyCodes", "goog.string", "goog.style", "goog.ui.ItemEvent", "goog.ui.MenuBase", "goog.ui.PopupBase", "goog.userAgent"]);
goog.addDependency("ui/bidiinput.js", ["goog.ui.BidiInput"], ["goog.dom", "goog.events", "goog.events.InputHandler", "goog.i18n.bidi", "goog.ui.Component"]);
goog.addDependency("ui/bubble.js", ["goog.ui.Bubble"], ["goog.Timer", "goog.events", "goog.events.EventType", "goog.math.Box", "goog.positioning", "goog.positioning.AbsolutePosition", "goog.positioning.AnchoredPosition", "goog.positioning.Corner", "goog.positioning.CornerBit", "goog.style", "goog.ui.Component", "goog.ui.Popup"]);
goog.addDependency("ui/button.js", ["goog.ui.Button", "goog.ui.Button.Side"], ["goog.events.KeyCodes", "goog.ui.ButtonRenderer", "goog.ui.ButtonSide", "goog.ui.Control", "goog.ui.ControlContent", "goog.ui.NativeButtonRenderer"]);
goog.addDependency("ui/buttonrenderer.js", ["goog.ui.ButtonRenderer"], ["goog.a11y.aria", "goog.a11y.aria.Role", "goog.a11y.aria.State", "goog.asserts", "goog.string", "goog.ui.ButtonSide", "goog.ui.Component.State", "goog.ui.ControlRenderer"]);
goog.addDependency("ui/buttonside.js", ["goog.ui.ButtonSide"], []);
goog.addDependency("ui/charcounter.js", ["goog.ui.CharCounter", "goog.ui.CharCounter.Display"], ["goog.dom", "goog.events", "goog.events.EventTarget", "goog.events.InputHandler"]);
goog.addDependency("ui/charpicker.js", ["goog.ui.CharPicker"], ["goog.a11y.aria", "goog.array", "goog.asserts", "goog.dom", "goog.events", "goog.events.EventHandler", "goog.events.EventType", "goog.events.InputHandler", "goog.events.KeyHandler", "goog.i18n.CharListDecompressor", "goog.i18n.uChar", "goog.i18n.uChar.NameFetcher", "goog.structs.Set", "goog.style", "goog.ui.Button", "goog.ui.Component", "goog.ui.ContainerScroller", "goog.ui.FlatButtonRenderer", "goog.ui.HoverCard", "goog.ui.LabelInput", 
"goog.ui.Menu", "goog.ui.MenuButton", "goog.ui.MenuItem", "goog.ui.Tooltip.ElementTooltipPosition"]);
goog.addDependency("ui/checkbox.js", ["goog.ui.Checkbox", "goog.ui.Checkbox.State"], ["goog.a11y.aria", "goog.a11y.aria.State", "goog.asserts", "goog.events.EventType", "goog.events.KeyCodes", "goog.ui.CheckboxRenderer", "goog.ui.Component.EventType", "goog.ui.Component.State", "goog.ui.Control", "goog.ui.registry"]);
goog.addDependency("ui/checkboxmenuitem.js", ["goog.ui.CheckBoxMenuItem"], ["goog.ui.MenuItem", "goog.ui.registry"]);
goog.addDependency("ui/checkboxrenderer.js", ["goog.ui.CheckboxRenderer"], ["goog.a11y.aria", "goog.a11y.aria.Role", "goog.a11y.aria.State", "goog.array", "goog.asserts", "goog.dom.classes", "goog.object", "goog.ui.ControlRenderer"]);
goog.addDependency("ui/colorbutton.js", ["goog.ui.ColorButton"], ["goog.ui.Button", "goog.ui.ColorButtonRenderer", "goog.ui.registry"]);
goog.addDependency("ui/colorbuttonrenderer.js", ["goog.ui.ColorButtonRenderer"], ["goog.dom.classes", "goog.functions", "goog.ui.ColorMenuButtonRenderer"]);
goog.addDependency("ui/colormenubutton.js", ["goog.ui.ColorMenuButton"], ["goog.array", "goog.object", "goog.ui.ColorMenuButtonRenderer", "goog.ui.ColorPalette", "goog.ui.Component", "goog.ui.Menu", "goog.ui.MenuButton", "goog.ui.registry"]);
goog.addDependency("ui/colormenubuttonrenderer.js", ["goog.ui.ColorMenuButtonRenderer"], ["goog.color", "goog.dom.classes", "goog.ui.ControlContent", "goog.ui.MenuButtonRenderer", "goog.userAgent"]);
goog.addDependency("ui/colorpalette.js", ["goog.ui.ColorPalette"], ["goog.array", "goog.color", "goog.style", "goog.ui.Palette", "goog.ui.PaletteRenderer"]);
goog.addDependency("ui/colorpicker.js", ["goog.ui.ColorPicker", "goog.ui.ColorPicker.EventType"], ["goog.ui.ColorPalette", "goog.ui.Component", "goog.ui.Component.State"]);
goog.addDependency("ui/colorsplitbehavior.js", ["goog.ui.ColorSplitBehavior"], ["goog.ui.ColorButton", "goog.ui.ColorMenuButton", "goog.ui.SplitBehavior"]);
goog.addDependency("ui/combobox.js", ["goog.ui.ComboBox", "goog.ui.ComboBoxItem"], ["goog.Timer", "goog.debug.Logger", "goog.dom.classlist", "goog.events", "goog.events.InputHandler", "goog.events.KeyCodes", "goog.events.KeyHandler", "goog.positioning.Corner", "goog.positioning.MenuAnchoredPosition", "goog.string", "goog.style", "goog.ui.Component", "goog.ui.ItemEvent", "goog.ui.LabelInput", "goog.ui.Menu", "goog.ui.MenuItem", "goog.ui.registry", "goog.userAgent"]);
goog.addDependency("ui/component.js", ["goog.ui.Component", "goog.ui.Component.Error", "goog.ui.Component.EventType", "goog.ui.Component.State"], ["goog.array", "goog.asserts", "goog.dom", "goog.dom.NodeType", "goog.events.EventHandler", "goog.events.EventTarget", "goog.object", "goog.style", "goog.ui.IdGenerator"]);
goog.addDependency("ui/container.js", ["goog.ui.Container", "goog.ui.Container.EventType", "goog.ui.Container.Orientation"], ["goog.a11y.aria", "goog.a11y.aria.State", "goog.asserts", "goog.dom", "goog.events.EventType", "goog.events.KeyCodes", "goog.events.KeyHandler", "goog.object", "goog.style", "goog.ui.Component", "goog.ui.ContainerRenderer", "goog.ui.Control"]);
goog.addDependency("ui/containerrenderer.js", ["goog.ui.ContainerRenderer"], ["goog.a11y.aria", "goog.array", "goog.asserts", "goog.dom.NodeType", "goog.dom.classes", "goog.string", "goog.style", "goog.ui.registry", "goog.userAgent"]);
goog.addDependency("ui/containerscroller.js", ["goog.ui.ContainerScroller"], ["goog.Timer", "goog.events.EventHandler", "goog.style", "goog.ui.Component", "goog.ui.Component.EventType", "goog.ui.Container.EventType"]);
goog.addDependency("ui/control.js", ["goog.ui.Control"], ["goog.array", "goog.dom", "goog.events.BrowserEvent", "goog.events.Event", "goog.events.EventType", "goog.events.KeyCodes", "goog.events.KeyHandler", "goog.string", "goog.ui.Component", "goog.ui.ControlContent", "goog.ui.ControlRenderer", "goog.ui.decorate", "goog.ui.registry", "goog.userAgent"]);
goog.addDependency("ui/controlcontent.js", ["goog.ui.ControlContent"], []);
goog.addDependency("ui/controlrenderer.js", ["goog.ui.ControlRenderer"], ["goog.a11y.aria", "goog.a11y.aria.State", "goog.array", "goog.asserts", "goog.dom", "goog.dom.classes", "goog.object", "goog.style", "goog.ui.Component", "goog.userAgent"]);
goog.addDependency("ui/cookieeditor.js", ["goog.ui.CookieEditor"], ["goog.dom", "goog.dom.TagName", "goog.events.EventType", "goog.net.cookies", "goog.string", "goog.style", "goog.ui.Component"]);
goog.addDependency("ui/css3buttonrenderer.js", ["goog.ui.Css3ButtonRenderer"], ["goog.dom", "goog.dom.TagName", "goog.dom.classes", "goog.ui.Button", "goog.ui.ButtonRenderer", "goog.ui.ControlContent", "goog.ui.INLINE_BLOCK_CLASSNAME", "goog.ui.registry"]);
goog.addDependency("ui/css3menubuttonrenderer.js", ["goog.ui.Css3MenuButtonRenderer"], ["goog.dom", "goog.dom.TagName", "goog.ui.ControlContent", "goog.ui.INLINE_BLOCK_CLASSNAME", "goog.ui.MenuButton", "goog.ui.MenuButtonRenderer", "goog.ui.registry"]);
goog.addDependency("ui/cssnames.js", ["goog.ui.INLINE_BLOCK_CLASSNAME"], []);
goog.addDependency("ui/custombutton.js", ["goog.ui.CustomButton"], ["goog.ui.Button", "goog.ui.ControlContent", "goog.ui.CustomButtonRenderer", "goog.ui.registry"]);
goog.addDependency("ui/custombuttonrenderer.js", ["goog.ui.CustomButtonRenderer"], ["goog.a11y.aria.Role", "goog.dom", "goog.dom.classes", "goog.string", "goog.ui.ButtonRenderer", "goog.ui.ControlContent", "goog.ui.INLINE_BLOCK_CLASSNAME"]);
goog.addDependency("ui/customcolorpalette.js", ["goog.ui.CustomColorPalette"], ["goog.color", "goog.dom", "goog.dom.classes", "goog.ui.ColorPalette", "goog.ui.Component"]);
goog.addDependency("ui/datepicker.js", ["goog.ui.DatePicker", "goog.ui.DatePicker.Events", "goog.ui.DatePickerEvent"], ["goog.a11y.aria", "goog.asserts", "goog.date", "goog.date.Date", "goog.date.Interval", "goog.dom", "goog.dom.NodeType", "goog.dom.classes", "goog.events.Event", "goog.events.EventType", "goog.events.KeyHandler", "goog.i18n.DateTimeFormat", "goog.i18n.DateTimeSymbols", "goog.style", "goog.ui.Component", "goog.ui.IdGenerator"]);
goog.addDependency("ui/decorate.js", ["goog.ui.decorate"], ["goog.ui.registry"]);
goog.addDependency("ui/dialog.js", ["goog.ui.Dialog", "goog.ui.Dialog.ButtonSet", "goog.ui.Dialog.ButtonSet.DefaultButtons", "goog.ui.Dialog.DefaultButtonCaptions", "goog.ui.Dialog.DefaultButtonKeys", "goog.ui.Dialog.Event", "goog.ui.Dialog.EventType"], ["goog.a11y.aria", "goog.a11y.aria.Role", "goog.a11y.aria.State", "goog.asserts", "goog.dom", "goog.dom.NodeType", "goog.dom.TagName", "goog.dom.classes", "goog.events", "goog.events.Event", "goog.events.EventType", "goog.events.KeyCodes", "goog.fx.Dragger", 
"goog.math.Rect", "goog.structs", "goog.structs.Map", "goog.style", "goog.ui.ModalPopup", "goog.userAgent"]);
goog.addDependency("ui/dimensionpicker.js", ["goog.ui.DimensionPicker"], ["goog.events.EventType", "goog.math.Size", "goog.ui.Control", "goog.ui.DimensionPickerRenderer", "goog.ui.registry"]);
goog.addDependency("ui/dimensionpickerrenderer.js", ["goog.ui.DimensionPickerRenderer"], ["goog.a11y.aria", "goog.a11y.aria.State", "goog.dom", "goog.dom.TagName", "goog.i18n.bidi", "goog.style", "goog.ui.ControlRenderer", "goog.userAgent"]);
goog.addDependency("ui/dragdropdetector.js", ["goog.ui.DragDropDetector", "goog.ui.DragDropDetector.EventType", "goog.ui.DragDropDetector.ImageDropEvent", "goog.ui.DragDropDetector.LinkDropEvent"], ["goog.dom", "goog.dom.TagName", "goog.events.Event", "goog.events.EventHandler", "goog.events.EventTarget", "goog.events.EventType", "goog.math.Coordinate", "goog.string", "goog.style", "goog.userAgent"]);
goog.addDependency("ui/drilldownrow.js", ["goog.ui.DrilldownRow"], ["goog.dom", "goog.dom.classes", "goog.ui.Component"]);
goog.addDependency("ui/editor/abstractdialog.js", ["goog.ui.editor.AbstractDialog", "goog.ui.editor.AbstractDialog.Builder", "goog.ui.editor.AbstractDialog.EventType"], ["goog.dom", "goog.dom.classes", "goog.events.EventTarget", "goog.ui.Dialog", "goog.ui.Dialog.ButtonSet", "goog.ui.Dialog.DefaultButtonKeys", "goog.ui.Dialog.Event", "goog.ui.Dialog.EventType"]);
goog.addDependency("ui/editor/bubble.js", ["goog.ui.editor.Bubble"], ["goog.debug.Logger", "goog.dom", "goog.dom.ViewportSizeMonitor", "goog.editor.style", "goog.events", "goog.events.EventHandler", "goog.events.EventType", "goog.math.Box", "goog.positioning", "goog.string", "goog.style", "goog.ui.Component.EventType", "goog.ui.PopupBase", "goog.ui.PopupBase.EventType", "goog.userAgent"]);
goog.addDependency("ui/editor/defaulttoolbar.js", ["goog.ui.editor.ButtonDescriptor", "goog.ui.editor.DefaultToolbar"], ["goog.dom", "goog.dom.TagName", "goog.dom.classes", "goog.editor.Command", "goog.style", "goog.ui.editor.ToolbarFactory", "goog.ui.editor.messages", "goog.userAgent"]);
goog.addDependency("ui/editor/equationeditordialog.js", ["goog.ui.editor.EquationEditorDialog"], ["goog.editor.Command", "goog.ui.Dialog", "goog.ui.editor.AbstractDialog", "goog.ui.editor.EquationEditorOkEvent", "goog.ui.equation.TexEditor"]);
goog.addDependency("ui/editor/equationeditorokevent.js", ["goog.ui.editor.EquationEditorOkEvent"], ["goog.events.Event", "goog.ui.editor.AbstractDialog"]);
goog.addDependency("ui/editor/linkdialog.js", ["goog.ui.editor.LinkDialog", "goog.ui.editor.LinkDialog.BeforeTestLinkEvent", "goog.ui.editor.LinkDialog.EventType", "goog.ui.editor.LinkDialog.OkEvent"], ["goog.dom", "goog.dom.TagName", "goog.editor.BrowserFeature", "goog.editor.Link", "goog.editor.focus", "goog.editor.node", "goog.events.Event", "goog.events.EventHandler", "goog.events.EventType", "goog.events.InputHandler", "goog.string", "goog.style", "goog.ui.Button", "goog.ui.Component", "goog.ui.LinkButtonRenderer", 
"goog.ui.editor.AbstractDialog", "goog.ui.editor.TabPane", "goog.ui.editor.messages", "goog.userAgent", "goog.window"]);
goog.addDependency("ui/editor/messages.js", ["goog.ui.editor.messages"], []);
goog.addDependency("ui/editor/tabpane.js", ["goog.ui.editor.TabPane"], ["goog.dom.TagName", "goog.dom.classes", "goog.events.EventHandler", "goog.events.EventType", "goog.style", "goog.ui.Component", "goog.ui.Control", "goog.ui.Tab", "goog.ui.TabBar"]);
goog.addDependency("ui/editor/toolbarcontroller.js", ["goog.ui.editor.ToolbarController"], ["goog.editor.Field.EventType", "goog.events.EventHandler", "goog.events.EventTarget", "goog.ui.Component.EventType"]);
goog.addDependency("ui/editor/toolbarfactory.js", ["goog.ui.editor.ToolbarFactory"], ["goog.array", "goog.dom", "goog.dom.TagName", "goog.string", "goog.string.Unicode", "goog.style", "goog.ui.Component", "goog.ui.Container", "goog.ui.Option", "goog.ui.Toolbar", "goog.ui.ToolbarButton", "goog.ui.ToolbarColorMenuButton", "goog.ui.ToolbarMenuButton", "goog.ui.ToolbarRenderer", "goog.ui.ToolbarSelect", "goog.userAgent"]);
goog.addDependency("ui/emoji/emoji.js", ["goog.ui.emoji.Emoji"], []);
goog.addDependency("ui/emoji/emojipalette.js", ["goog.ui.emoji.EmojiPalette"], ["goog.events.Event", "goog.events.EventType", "goog.net.ImageLoader", "goog.ui.Palette", "goog.ui.emoji.Emoji", "goog.ui.emoji.EmojiPaletteRenderer"]);
goog.addDependency("ui/emoji/emojipaletterenderer.js", ["goog.ui.emoji.EmojiPaletteRenderer"], ["goog.a11y.aria", "goog.dom", "goog.ui.PaletteRenderer", "goog.ui.emoji.Emoji", "goog.ui.emoji.SpriteInfo"]);
goog.addDependency("ui/emoji/emojipicker.js", ["goog.ui.emoji.EmojiPicker"], ["goog.debug.Logger", "goog.dom", "goog.ui.Component", "goog.ui.TabPane", "goog.ui.TabPane.TabPage", "goog.ui.emoji.Emoji", "goog.ui.emoji.EmojiPalette", "goog.ui.emoji.EmojiPaletteRenderer", "goog.ui.emoji.ProgressiveEmojiPaletteRenderer"]);
goog.addDependency("ui/emoji/popupemojipicker.js", ["goog.ui.emoji.PopupEmojiPicker"], ["goog.dom", "goog.events.EventType", "goog.positioning.AnchoredPosition", "goog.ui.Component", "goog.ui.Popup", "goog.ui.emoji.EmojiPicker"]);
goog.addDependency("ui/emoji/progressiveemojipaletterenderer.js", ["goog.ui.emoji.ProgressiveEmojiPaletteRenderer"], ["goog.ui.emoji.EmojiPaletteRenderer"]);
goog.addDependency("ui/emoji/spriteinfo.js", ["goog.ui.emoji.SpriteInfo"], []);
goog.addDependency("ui/equation/arrowpalette.js", ["goog.ui.equation.ArrowPalette"], ["goog.math.Size", "goog.ui.equation.Palette"]);
goog.addDependency("ui/equation/changeevent.js", ["goog.ui.equation.ChangeEvent"], ["goog.events.Event", "goog.events.EventType"]);
goog.addDependency("ui/equation/comparisonpalette.js", ["goog.ui.equation.ComparisonPalette"], ["goog.math.Size", "goog.ui.equation.Palette"]);
goog.addDependency("ui/equation/editorpane.js", ["goog.ui.equation.EditorPane"], ["goog.dom", "goog.style", "goog.ui.Component"]);
goog.addDependency("ui/equation/equationeditor.js", ["goog.ui.equation.EquationEditor"], ["goog.dom", "goog.events", "goog.ui.Component", "goog.ui.Tab", "goog.ui.TabBar", "goog.ui.equation.EditorPane", "goog.ui.equation.ImageRenderer", "goog.ui.equation.TexPane"]);
goog.addDependency("ui/equation/equationeditordialog.js", ["goog.ui.equation.EquationEditorDialog"], ["goog.dom", "goog.dom.classes", "goog.ui.Dialog", "goog.ui.equation.EquationEditor", "goog.ui.equation.PaletteManager", "goog.ui.equation.TexEditor"]);
goog.addDependency("ui/equation/greekpalette.js", ["goog.ui.equation.GreekPalette"], ["goog.math.Size", "goog.ui.equation.Palette"]);
goog.addDependency("ui/equation/imagerenderer.js", ["goog.ui.equation.ImageRenderer"], ["goog.dom.TagName", "goog.dom.classes", "goog.string", "goog.uri.utils"]);
goog.addDependency("ui/equation/mathpalette.js", ["goog.ui.equation.MathPalette"], ["goog.math.Size", "goog.ui.equation.Palette"]);
goog.addDependency("ui/equation/menupalette.js", ["goog.ui.equation.MenuPalette", "goog.ui.equation.MenuPaletteRenderer"], ["goog.math.Size", "goog.style", "goog.ui.equation.Palette", "goog.ui.equation.PaletteRenderer"]);
goog.addDependency("ui/equation/palette.js", ["goog.ui.equation.Palette", "goog.ui.equation.PaletteEvent", "goog.ui.equation.PaletteRenderer"], ["goog.dom", "goog.dom.TagName", "goog.events.Event", "goog.ui.Palette", "goog.ui.PaletteRenderer"]);
goog.addDependency("ui/equation/palettemanager.js", ["goog.ui.equation.PaletteManager"], ["goog.Timer", "goog.events.EventHandler", "goog.events.EventTarget", "goog.ui.equation.ArrowPalette", "goog.ui.equation.ComparisonPalette", "goog.ui.equation.GreekPalette", "goog.ui.equation.MathPalette", "goog.ui.equation.MenuPalette", "goog.ui.equation.Palette", "goog.ui.equation.SymbolPalette"]);
goog.addDependency("ui/equation/symbolpalette.js", ["goog.ui.equation.SymbolPalette"], ["goog.math.Size", "goog.ui.equation.Palette"]);
goog.addDependency("ui/equation/texeditor.js", ["goog.ui.equation.TexEditor"], ["goog.dom", "goog.ui.Component", "goog.ui.equation.ImageRenderer", "goog.ui.equation.TexPane"]);
goog.addDependency("ui/equation/texpane.js", ["goog.ui.equation.TexPane"], ["goog.Timer", "goog.dom", "goog.dom.TagName", "goog.dom.selection", "goog.events", "goog.events.EventType", "goog.events.InputHandler", "goog.string", "goog.style", "goog.ui.Component", "goog.ui.equation.ChangeEvent", "goog.ui.equation.EditorPane", "goog.ui.equation.ImageRenderer", "goog.ui.equation.PaletteManager"]);
goog.addDependency("ui/filteredmenu.js", ["goog.ui.FilteredMenu"], ["goog.dom", "goog.events", "goog.events.EventType", "goog.events.InputHandler", "goog.events.KeyCodes", "goog.string", "goog.style", "goog.ui.Component", "goog.ui.FilterObservingMenuItem", "goog.ui.Menu", "goog.userAgent"]);
goog.addDependency("ui/filterobservingmenuitem.js", ["goog.ui.FilterObservingMenuItem"], ["goog.ui.ControlContent", "goog.ui.FilterObservingMenuItemRenderer", "goog.ui.MenuItem", "goog.ui.registry"]);
goog.addDependency("ui/filterobservingmenuitemrenderer.js", ["goog.ui.FilterObservingMenuItemRenderer"], ["goog.ui.MenuItemRenderer"]);
goog.addDependency("ui/flatbuttonrenderer.js", ["goog.ui.FlatButtonRenderer"], ["goog.a11y.aria", "goog.a11y.aria.Role", "goog.dom.classes", "goog.ui.Button", "goog.ui.ButtonRenderer", "goog.ui.INLINE_BLOCK_CLASSNAME", "goog.ui.registry"]);
goog.addDependency("ui/flatmenubuttonrenderer.js", ["goog.ui.FlatMenuButtonRenderer"], ["goog.a11y.aria", "goog.a11y.aria.State", "goog.asserts", "goog.dom", "goog.string", "goog.style", "goog.ui.FlatButtonRenderer", "goog.ui.INLINE_BLOCK_CLASSNAME", "goog.ui.Menu", "goog.ui.MenuButton", "goog.ui.MenuRenderer", "goog.ui.registry"]);
goog.addDependency("ui/formpost.js", ["goog.ui.FormPost"], ["goog.array", "goog.dom.TagName", "goog.string", "goog.string.StringBuffer", "goog.ui.Component"]);
goog.addDependency("ui/gauge.js", ["goog.ui.Gauge", "goog.ui.GaugeColoredRange"], ["goog.a11y.aria", "goog.asserts", "goog.dom", "goog.fx.Animation", "goog.fx.Animation.EventType", "goog.fx.Transition.EventType", "goog.fx.easing", "goog.graphics", "goog.graphics.Font", "goog.graphics.Path", "goog.graphics.SolidFill", "goog.ui.Component", "goog.ui.GaugeTheme"]);
goog.addDependency("ui/gaugetheme.js", ["goog.ui.GaugeTheme"], ["goog.graphics.LinearGradient", "goog.graphics.SolidFill", "goog.graphics.Stroke"]);
goog.addDependency("ui/hovercard.js", ["goog.ui.HoverCard", "goog.ui.HoverCard.EventType", "goog.ui.HoverCard.TriggerEvent"], ["goog.dom", "goog.events", "goog.events.EventType", "goog.ui.AdvancedTooltip"]);
goog.addDependency("ui/hsvapalette.js", ["goog.ui.HsvaPalette"], ["goog.array", "goog.color", "goog.color.alpha", "goog.events.EventType", "goog.ui.Component.EventType", "goog.ui.HsvPalette"]);
goog.addDependency("ui/hsvpalette.js", ["goog.ui.HsvPalette"], ["goog.color", "goog.dom.TagName", "goog.events", "goog.events.EventType", "goog.events.InputHandler", "goog.style", "goog.style.bidi", "goog.ui.Component", "goog.userAgent"]);
goog.addDependency("ui/idgenerator.js", ["goog.ui.IdGenerator"], []);
goog.addDependency("ui/idletimer.js", ["goog.ui.IdleTimer"], ["goog.Timer", "goog.events", "goog.events.EventTarget", "goog.structs.Set", "goog.ui.ActivityMonitor"]);
goog.addDependency("ui/iframemask.js", ["goog.ui.IframeMask"], ["goog.Disposable", "goog.Timer", "goog.dom", "goog.dom.DomHelper", "goog.dom.iframe", "goog.events.EventHandler", "goog.events.EventTarget", "goog.style"]);
goog.addDependency("ui/imagelessbuttonrenderer.js", ["goog.ui.ImagelessButtonRenderer"], ["goog.dom.classes", "goog.ui.Button", "goog.ui.ControlContent", "goog.ui.CustomButtonRenderer", "goog.ui.INLINE_BLOCK_CLASSNAME", "goog.ui.registry"]);
goog.addDependency("ui/imagelessmenubuttonrenderer.js", ["goog.ui.ImagelessMenuButtonRenderer"], ["goog.dom", "goog.dom.TagName", "goog.dom.classes", "goog.ui.ControlContent", "goog.ui.INLINE_BLOCK_CLASSNAME", "goog.ui.MenuButton", "goog.ui.MenuButtonRenderer", "goog.ui.registry"]);
goog.addDependency("ui/inputdatepicker.js", ["goog.ui.InputDatePicker"], ["goog.date.DateTime", "goog.dom", "goog.string", "goog.ui.Component", "goog.ui.DatePicker", "goog.ui.PopupBase", "goog.ui.PopupDatePicker"]);
goog.addDependency("ui/itemevent.js", ["goog.ui.ItemEvent"], ["goog.events.Event"]);
goog.addDependency("ui/keyboardshortcuthandler.js", ["goog.ui.KeyboardShortcutEvent", "goog.ui.KeyboardShortcutHandler", "goog.ui.KeyboardShortcutHandler.EventType"], ["goog.Timer", "goog.events", "goog.events.Event", "goog.events.EventTarget", "goog.events.EventType", "goog.events.KeyCodes", "goog.events.KeyNames", "goog.object", "goog.userAgent"]);
goog.addDependency("ui/labelinput.js", ["goog.ui.LabelInput"], ["goog.Timer", "goog.a11y.aria", "goog.a11y.aria.State", "goog.asserts", "goog.dom", "goog.dom.classlist", "goog.events.EventHandler", "goog.events.EventType", "goog.ui.Component", "goog.userAgent"]);
goog.addDependency("ui/linkbuttonrenderer.js", ["goog.ui.LinkButtonRenderer"], ["goog.ui.Button", "goog.ui.FlatButtonRenderer", "goog.ui.registry"]);
goog.addDependency("ui/media/flashobject.js", ["goog.ui.media.FlashObject", "goog.ui.media.FlashObject.ScriptAccessLevel", "goog.ui.media.FlashObject.Wmodes"], ["goog.asserts", "goog.debug.Logger", "goog.events.Event", "goog.events.EventHandler", "goog.events.EventType", "goog.object", "goog.string", "goog.structs.Map", "goog.style", "goog.ui.Component", "goog.userAgent", "goog.userAgent.flash"]);
goog.addDependency("ui/media/flickr.js", ["goog.ui.media.FlickrSet", "goog.ui.media.FlickrSetModel"], ["goog.object", "goog.ui.media.FlashObject", "goog.ui.media.Media", "goog.ui.media.MediaModel", "goog.ui.media.MediaModel.Player", "goog.ui.media.MediaRenderer"]);
goog.addDependency("ui/media/googlevideo.js", ["goog.ui.media.GoogleVideo", "goog.ui.media.GoogleVideoModel"], ["goog.string", "goog.ui.media.FlashObject", "goog.ui.media.Media", "goog.ui.media.MediaModel", "goog.ui.media.MediaModel.Player", "goog.ui.media.MediaRenderer"]);
goog.addDependency("ui/media/media.js", ["goog.ui.media.Media", "goog.ui.media.MediaRenderer"], ["goog.style", "goog.ui.Component", "goog.ui.Control", "goog.ui.ControlRenderer"]);
goog.addDependency("ui/media/mediamodel.js", ["goog.ui.media.MediaModel", "goog.ui.media.MediaModel.Category", "goog.ui.media.MediaModel.Credit", "goog.ui.media.MediaModel.Credit.Role", "goog.ui.media.MediaModel.Credit.Scheme", "goog.ui.media.MediaModel.Medium", "goog.ui.media.MediaModel.MimeType", "goog.ui.media.MediaModel.Player", "goog.ui.media.MediaModel.SubTitle", "goog.ui.media.MediaModel.Thumbnail"], ["goog.array"]);
goog.addDependency("ui/media/mp3.js", ["goog.ui.media.Mp3"], ["goog.string", "goog.ui.media.FlashObject", "goog.ui.media.Media", "goog.ui.media.MediaRenderer"]);
goog.addDependency("ui/media/photo.js", ["goog.ui.media.Photo"], ["goog.ui.media.Media", "goog.ui.media.MediaRenderer"]);
goog.addDependency("ui/media/picasa.js", ["goog.ui.media.PicasaAlbum", "goog.ui.media.PicasaAlbumModel"], ["goog.object", "goog.ui.media.FlashObject", "goog.ui.media.Media", "goog.ui.media.MediaModel", "goog.ui.media.MediaModel.Player", "goog.ui.media.MediaRenderer"]);
goog.addDependency("ui/media/vimeo.js", ["goog.ui.media.Vimeo", "goog.ui.media.VimeoModel"], ["goog.string", "goog.ui.media.FlashObject", "goog.ui.media.Media", "goog.ui.media.MediaModel", "goog.ui.media.MediaModel.Player", "goog.ui.media.MediaRenderer"]);
goog.addDependency("ui/media/youtube.js", ["goog.ui.media.Youtube", "goog.ui.media.YoutubeModel"], ["goog.string", "goog.ui.Component", "goog.ui.media.FlashObject", "goog.ui.media.Media", "goog.ui.media.MediaModel", "goog.ui.media.MediaRenderer"]);
goog.addDependency("ui/menu.js", ["goog.ui.Menu", "goog.ui.Menu.EventType"], ["goog.math.Coordinate", "goog.string", "goog.style", "goog.ui.Component.EventType", "goog.ui.Component.State", "goog.ui.Container", "goog.ui.Container.Orientation", "goog.ui.MenuHeader", "goog.ui.MenuItem", "goog.ui.MenuRenderer", "goog.ui.MenuSeparator"]);
goog.addDependency("ui/menubar.js", ["goog.ui.menuBar"], ["goog.ui.Container", "goog.ui.MenuBarRenderer"]);
goog.addDependency("ui/menubardecorator.js", ["goog.ui.menuBarDecorator"], ["goog.ui.MenuBarRenderer", "goog.ui.menuBar", "goog.ui.registry"]);
goog.addDependency("ui/menubarrenderer.js", ["goog.ui.MenuBarRenderer"], ["goog.a11y.aria.Role", "goog.dom", "goog.ui.ContainerRenderer"]);
goog.addDependency("ui/menubase.js", ["goog.ui.MenuBase"], ["goog.events.EventHandler", "goog.events.EventType", "goog.events.KeyHandler", "goog.ui.Popup"]);
goog.addDependency("ui/menubutton.js", ["goog.ui.MenuButton"], ["goog.Timer", "goog.a11y.aria", "goog.a11y.aria.State", "goog.asserts", "goog.dom", "goog.events.EventType", "goog.events.KeyCodes", "goog.events.KeyHandler", "goog.math.Box", "goog.math.Rect", "goog.positioning", "goog.positioning.Corner", "goog.positioning.MenuAnchoredPosition", "goog.positioning.Overflow", "goog.style", "goog.ui.Button", "goog.ui.Component", "goog.ui.Menu", "goog.ui.MenuButtonRenderer", "goog.ui.registry", "goog.userAgent", 
"goog.userAgent.product"]);
goog.addDependency("ui/menubuttonrenderer.js", ["goog.ui.MenuButtonRenderer"], ["goog.a11y.aria", "goog.a11y.aria.State", "goog.asserts", "goog.dom", "goog.string", "goog.style", "goog.ui.CustomButtonRenderer", "goog.ui.INLINE_BLOCK_CLASSNAME", "goog.ui.Menu", "goog.ui.MenuRenderer", "goog.userAgent"]);
goog.addDependency("ui/menuheader.js", ["goog.ui.MenuHeader"], ["goog.ui.Component.State", "goog.ui.Control", "goog.ui.MenuHeaderRenderer", "goog.ui.registry"]);
goog.addDependency("ui/menuheaderrenderer.js", ["goog.ui.MenuHeaderRenderer"], ["goog.dom", "goog.dom.classes", "goog.ui.ControlRenderer"]);
goog.addDependency("ui/menuitem.js", ["goog.ui.MenuItem"], ["goog.array", "goog.dom", "goog.dom.classes", "goog.events.KeyCodes", "goog.math.Coordinate", "goog.string", "goog.ui.Component.State", "goog.ui.Control", "goog.ui.ControlContent", "goog.ui.MenuItemRenderer", "goog.ui.registry"]);
goog.addDependency("ui/menuitemrenderer.js", ["goog.ui.MenuItemRenderer"], ["goog.a11y.aria", "goog.a11y.aria.Role", "goog.dom", "goog.dom.classes", "goog.ui.Component.State", "goog.ui.ControlContent", "goog.ui.ControlRenderer"]);
goog.addDependency("ui/menurenderer.js", ["goog.ui.MenuRenderer"], ["goog.a11y.aria", "goog.a11y.aria.Role", "goog.a11y.aria.State", "goog.asserts", "goog.dom", "goog.ui.ContainerRenderer", "goog.ui.Separator"]);
goog.addDependency("ui/menuseparator.js", ["goog.ui.MenuSeparator"], ["goog.ui.MenuSeparatorRenderer", "goog.ui.Separator", "goog.ui.registry"]);
goog.addDependency("ui/menuseparatorrenderer.js", ["goog.ui.MenuSeparatorRenderer"], ["goog.dom", "goog.dom.classes", "goog.ui.ControlContent", "goog.ui.ControlRenderer"]);
goog.addDependency("ui/mockactivitymonitor.js", ["goog.ui.MockActivityMonitor"], ["goog.events.EventType", "goog.ui.ActivityMonitor"]);
goog.addDependency("ui/mockactivitymonitor_test.js", ["goog.ui.MockActivityMonitorTest"], ["goog.events", "goog.functions", "goog.testing.jsunit", "goog.testing.recordFunction", "goog.ui.ActivityMonitor", "goog.ui.MockActivityMonitor"]);
goog.addDependency("ui/modalpopup.js", ["goog.ui.ModalPopup"], ["goog.Timer", "goog.a11y.aria", "goog.a11y.aria.State", "goog.asserts", "goog.dom", "goog.dom.NodeType", "goog.dom.TagName", "goog.dom.classes", "goog.dom.iframe", "goog.events", "goog.events.EventType", "goog.events.FocusHandler", "goog.fx.Transition", "goog.style", "goog.ui.Component", "goog.ui.PopupBase", "goog.userAgent"]);
goog.addDependency("ui/nativebuttonrenderer.js", ["goog.ui.NativeButtonRenderer"], ["goog.dom.classes", "goog.events.EventType", "goog.ui.ButtonRenderer", "goog.ui.Component.State"]);
goog.addDependency("ui/offlineinstalldialog.js", ["goog.ui.OfflineInstallDialog", "goog.ui.OfflineInstallDialog.ButtonKeyType", "goog.ui.OfflineInstallDialog.EnableScreen", "goog.ui.OfflineInstallDialog.InstallScreen", "goog.ui.OfflineInstallDialog.InstallingGearsScreen", "goog.ui.OfflineInstallDialog.ScreenType", "goog.ui.OfflineInstallDialog.UpgradeScreen", "goog.ui.OfflineInstallDialogScreen"], ["goog.Disposable", "goog.dom.classes", "goog.gears", "goog.string", "goog.string.StringBuffer", "goog.ui.Dialog", 
"goog.ui.Dialog.ButtonSet", "goog.ui.Dialog.EventType", "goog.window"]);
goog.addDependency("ui/offlinestatuscard.js", ["goog.ui.OfflineStatusCard", "goog.ui.OfflineStatusCard.EventType"], ["goog.dom", "goog.events.EventType", "goog.gears.StatusType", "goog.structs.Map", "goog.style", "goog.ui.Component", "goog.ui.ProgressBar"]);
goog.addDependency("ui/offlinestatuscomponent.js", ["goog.ui.OfflineStatusComponent", "goog.ui.OfflineStatusComponent.StatusClassNames"], ["goog.dom.classes", "goog.events.EventType", "goog.gears.StatusType", "goog.positioning", "goog.positioning.AnchoredPosition", "goog.positioning.Corner", "goog.positioning.Overflow", "goog.ui.Component", "goog.ui.OfflineStatusCard.EventType", "goog.ui.Popup"]);
goog.addDependency("ui/option.js", ["goog.ui.Option"], ["goog.ui.Component", "goog.ui.MenuItem", "goog.ui.registry"]);
goog.addDependency("ui/palette.js", ["goog.ui.Palette"], ["goog.array", "goog.dom", "goog.events", "goog.events.EventType", "goog.events.KeyCodes", "goog.math.Size", "goog.ui.Component", "goog.ui.Control", "goog.ui.PaletteRenderer", "goog.ui.SelectionModel"]);
goog.addDependency("ui/paletterenderer.js", ["goog.ui.PaletteRenderer"], ["goog.a11y.aria", "goog.a11y.aria.State", "goog.array", "goog.dom", "goog.dom.NodeIterator", "goog.dom.NodeType", "goog.dom.classes", "goog.iter", "goog.style", "goog.ui.ControlRenderer", "goog.userAgent"]);
goog.addDependency("ui/plaintextspellchecker.js", ["goog.ui.PlainTextSpellChecker"], ["goog.Timer", "goog.a11y.aria", "goog.asserts", "goog.dom", "goog.events.EventHandler", "goog.events.EventType", "goog.events.KeyCodes", "goog.events.KeyHandler", "goog.spell.SpellCheck", "goog.style", "goog.ui.AbstractSpellChecker", "goog.ui.Component", "goog.userAgent"]);
goog.addDependency("ui/popup.js", ["goog.ui.Popup", "goog.ui.Popup.AbsolutePosition", "goog.ui.Popup.AnchoredPosition", "goog.ui.Popup.AnchoredViewPortPosition", "goog.ui.Popup.ClientPosition", "goog.ui.Popup.Corner", "goog.ui.Popup.Overflow", "goog.ui.Popup.ViewPortClientPosition", "goog.ui.Popup.ViewPortPosition"], ["goog.math.Box", "goog.positioning", "goog.positioning.AbsolutePosition", "goog.positioning.AnchoredPosition", "goog.positioning.AnchoredViewportPosition", "goog.positioning.ClientPosition", 
"goog.positioning.Corner", "goog.positioning.Overflow", "goog.positioning.OverflowStatus", "goog.positioning.ViewportClientPosition", "goog.positioning.ViewportPosition", "goog.style", "goog.ui.PopupBase"]);
goog.addDependency("ui/popupbase.js", ["goog.ui.PopupBase", "goog.ui.PopupBase.EventType", "goog.ui.PopupBase.Type"], ["goog.Timer", "goog.dom", "goog.events.EventHandler", "goog.events.EventTarget", "goog.events.EventType", "goog.events.KeyCodes", "goog.fx.Transition", "goog.fx.Transition.EventType", "goog.style", "goog.userAgent"]);
goog.addDependency("ui/popupcolorpicker.js", ["goog.ui.PopupColorPicker"], ["goog.dom.classes", "goog.events.EventType", "goog.positioning.AnchoredPosition", "goog.positioning.Corner", "goog.ui.ColorPicker", "goog.ui.ColorPicker.EventType", "goog.ui.Component", "goog.ui.Popup"]);
goog.addDependency("ui/popupdatepicker.js", ["goog.ui.PopupDatePicker"], ["goog.events.EventType", "goog.positioning.AnchoredPosition", "goog.positioning.Corner", "goog.style", "goog.ui.Component", "goog.ui.DatePicker", "goog.ui.DatePicker.Events", "goog.ui.Popup", "goog.ui.PopupBase.EventType"]);
goog.addDependency("ui/popupmenu.js", ["goog.ui.PopupMenu"], ["goog.events.EventType", "goog.positioning.AnchoredViewportPosition", "goog.positioning.Corner", "goog.positioning.MenuAnchoredPosition", "goog.positioning.ViewportClientPosition", "goog.structs", "goog.structs.Map", "goog.style", "goog.ui.Component.EventType", "goog.ui.Menu", "goog.ui.PopupBase", "goog.userAgent"]);
goog.addDependency("ui/progressbar.js", ["goog.ui.ProgressBar", "goog.ui.ProgressBar.Orientation"], ["goog.a11y.aria", "goog.asserts", "goog.dom", "goog.dom.classes", "goog.events", "goog.events.EventType", "goog.ui.Component", "goog.ui.RangeModel", "goog.userAgent"]);
goog.addDependency("ui/prompt.js", ["goog.ui.Prompt"], ["goog.Timer", "goog.dom", "goog.events", "goog.events.EventType", "goog.functions", "goog.ui.Component.Error", "goog.ui.Dialog", "goog.ui.Dialog.ButtonSet", "goog.ui.Dialog.DefaultButtonKeys", "goog.ui.Dialog.EventType", "goog.userAgent"]);
goog.addDependency("ui/rangemodel.js", ["goog.ui.RangeModel"], ["goog.events.EventTarget", "goog.ui.Component.EventType"]);
goog.addDependency("ui/ratings.js", ["goog.ui.Ratings", "goog.ui.Ratings.EventType"], ["goog.a11y.aria", "goog.a11y.aria.Role", "goog.a11y.aria.State", "goog.asserts", "goog.dom.classes", "goog.events.EventType", "goog.ui.Component"]);
goog.addDependency("ui/registry.js", ["goog.ui.registry"], ["goog.dom.classes"]);
goog.addDependency("ui/richtextspellchecker.js", ["goog.ui.RichTextSpellChecker"], ["goog.Timer", "goog.dom", "goog.dom.NodeType", "goog.events", "goog.events.EventType", "goog.spell.SpellCheck", "goog.string.StringBuffer", "goog.ui.AbstractSpellChecker"]);
goog.addDependency("ui/roundedpanel.js", ["goog.ui.BaseRoundedPanel", "goog.ui.CssRoundedPanel", "goog.ui.GraphicsRoundedPanel", "goog.ui.RoundedPanel", "goog.ui.RoundedPanel.Corner"], ["goog.dom", "goog.dom.classes", "goog.graphics", "goog.graphics.Path", "goog.graphics.SolidFill", "goog.graphics.Stroke", "goog.math", "goog.math.Coordinate", "goog.style", "goog.ui.Component", "goog.userAgent"]);
goog.addDependency("ui/roundedtabrenderer.js", ["goog.ui.RoundedTabRenderer"], ["goog.dom", "goog.ui.Tab", "goog.ui.TabBar.Location", "goog.ui.TabRenderer", "goog.ui.registry"]);
goog.addDependency("ui/scrollfloater.js", ["goog.ui.ScrollFloater", "goog.ui.ScrollFloater.EventType"], ["goog.array", "goog.dom", "goog.dom.classes", "goog.events.EventType", "goog.style", "goog.ui.Component", "goog.userAgent"]);
goog.addDependency("ui/select.js", ["goog.ui.Select"], ["goog.a11y.aria", "goog.a11y.aria.Role", "goog.a11y.aria.State", "goog.asserts", "goog.events.EventType", "goog.ui.Component.EventType", "goog.ui.ControlContent", "goog.ui.MenuButton", "goog.ui.SelectionModel", "goog.ui.registry"]);
goog.addDependency("ui/selectionmenubutton.js", ["goog.ui.SelectionMenuButton", "goog.ui.SelectionMenuButton.SelectionState"], ["goog.events.EventType", "goog.ui.Component.EventType", "goog.ui.Menu", "goog.ui.MenuButton", "goog.ui.MenuItem"]);
goog.addDependency("ui/selectionmodel.js", ["goog.ui.SelectionModel"], ["goog.array", "goog.events.EventTarget", "goog.events.EventType"]);
goog.addDependency("ui/separator.js", ["goog.ui.Separator"], ["goog.a11y.aria", "goog.asserts", "goog.ui.Component.State", "goog.ui.Control", "goog.ui.MenuSeparatorRenderer", "goog.ui.registry"]);
goog.addDependency("ui/serverchart.js", ["goog.ui.ServerChart", "goog.ui.ServerChart.AxisDisplayType", "goog.ui.ServerChart.ChartType", "goog.ui.ServerChart.EncodingType", "goog.ui.ServerChart.Event", "goog.ui.ServerChart.LegendPosition", "goog.ui.ServerChart.MaximumValue", "goog.ui.ServerChart.MultiAxisAlignment", "goog.ui.ServerChart.MultiAxisType", "goog.ui.ServerChart.UriParam", "goog.ui.ServerChart.UriTooLongEvent"], ["goog.Uri", "goog.array", "goog.asserts", "goog.events.Event", "goog.string", 
"goog.ui.Component"]);
goog.addDependency("ui/slider.js", ["goog.ui.Slider", "goog.ui.Slider.Orientation"], ["goog.a11y.aria", "goog.a11y.aria.Role", "goog.dom", "goog.ui.SliderBase", "goog.ui.SliderBase.Orientation"]);
goog.addDependency("ui/sliderbase.js", ["goog.ui.SliderBase", "goog.ui.SliderBase.AnimationFactory", "goog.ui.SliderBase.Orientation"], ["goog.Timer", "goog.a11y.aria", "goog.a11y.aria.Role", "goog.a11y.aria.State", "goog.array", "goog.asserts", "goog.dom", "goog.dom.classes", "goog.events", "goog.events.EventType", "goog.events.KeyCodes", "goog.events.KeyHandler", "goog.events.MouseWheelHandler", "goog.fx.AnimationParallelQueue", "goog.fx.Dragger", "goog.fx.Transition", "goog.fx.dom.ResizeHeight", 
"goog.fx.dom.ResizeWidth", "goog.fx.dom.Slide", "goog.math", "goog.math.Coordinate", "goog.style", "goog.style.bidi", "goog.ui.Component", "goog.ui.RangeModel"]);
goog.addDependency("ui/splitbehavior.js", ["goog.ui.SplitBehavior", "goog.ui.SplitBehavior.DefaultHandlers"], ["goog.Disposable", "goog.array", "goog.dispose", "goog.dom", "goog.dom.DomHelper", "goog.dom.classes", "goog.events", "goog.events.EventHandler", "goog.events.EventType", "goog.string", "goog.ui.ButtonSide", "goog.ui.Component", "goog.ui.Component.Error", "goog.ui.INLINE_BLOCK_CLASSNAME", "goog.ui.decorate", "goog.ui.registry"]);
goog.addDependency("ui/splitpane.js", ["goog.ui.SplitPane", "goog.ui.SplitPane.Orientation"], ["goog.dom", "goog.dom.classes", "goog.events.EventType", "goog.fx.Dragger", "goog.fx.Dragger.EventType", "goog.math.Rect", "goog.math.Size", "goog.style", "goog.ui.Component", "goog.ui.Component.EventType", "goog.userAgent"]);
goog.addDependency("ui/style/app/buttonrenderer.js", ["goog.ui.style.app.ButtonRenderer"], ["goog.dom.classes", "goog.ui.Button", "goog.ui.ControlContent", "goog.ui.CustomButtonRenderer", "goog.ui.INLINE_BLOCK_CLASSNAME", "goog.ui.registry"]);
goog.addDependency("ui/style/app/menubuttonrenderer.js", ["goog.ui.style.app.MenuButtonRenderer"], ["goog.a11y.aria.Role", "goog.array", "goog.dom", "goog.style", "goog.ui.ControlContent", "goog.ui.Menu", "goog.ui.MenuRenderer", "goog.ui.style.app.ButtonRenderer"]);
goog.addDependency("ui/style/app/primaryactionbuttonrenderer.js", ["goog.ui.style.app.PrimaryActionButtonRenderer"], ["goog.ui.Button", "goog.ui.registry", "goog.ui.style.app.ButtonRenderer"]);
goog.addDependency("ui/submenu.js", ["goog.ui.SubMenu"], ["goog.Timer", "goog.dom", "goog.dom.classes", "goog.events.KeyCodes", "goog.positioning.AnchoredViewportPosition", "goog.positioning.Corner", "goog.style", "goog.ui.Component", "goog.ui.Component.EventType", "goog.ui.Component.State", "goog.ui.ControlContent", "goog.ui.Menu", "goog.ui.MenuItem", "goog.ui.SubMenuRenderer", "goog.ui.registry"]);
goog.addDependency("ui/submenurenderer.js", ["goog.ui.SubMenuRenderer"], ["goog.a11y.aria", "goog.a11y.aria.State", "goog.asserts", "goog.dom", "goog.dom.classes", "goog.style", "goog.ui.Menu", "goog.ui.MenuItemRenderer"]);
goog.addDependency("ui/tab.js", ["goog.ui.Tab"], ["goog.ui.Component.State", "goog.ui.Control", "goog.ui.ControlContent", "goog.ui.TabRenderer", "goog.ui.registry"]);
goog.addDependency("ui/tabbar.js", ["goog.ui.TabBar", "goog.ui.TabBar.Location"], ["goog.ui.Component.EventType", "goog.ui.Container", "goog.ui.Container.Orientation", "goog.ui.Tab", "goog.ui.TabBarRenderer", "goog.ui.registry"]);
goog.addDependency("ui/tabbarrenderer.js", ["goog.ui.TabBarRenderer"], ["goog.a11y.aria.Role", "goog.object", "goog.ui.ContainerRenderer"]);
goog.addDependency("ui/tablesorter.js", ["goog.ui.TableSorter", "goog.ui.TableSorter.EventType"], ["goog.array", "goog.dom", "goog.dom.TagName", "goog.dom.classes", "goog.events", "goog.events.EventType", "goog.functions", "goog.ui.Component"]);
goog.addDependency("ui/tabpane.js", ["goog.ui.TabPane", "goog.ui.TabPane.Events", "goog.ui.TabPane.TabLocation", "goog.ui.TabPane.TabPage", "goog.ui.TabPaneEvent"], ["goog.dom", "goog.dom.classes", "goog.events", "goog.events.Event", "goog.events.EventTarget", "goog.events.EventType", "goog.events.KeyCodes", "goog.style"]);
goog.addDependency("ui/tabrenderer.js", ["goog.ui.TabRenderer"], ["goog.a11y.aria.Role", "goog.ui.Component.State", "goog.ui.ControlRenderer"]);
goog.addDependency("ui/textarea.js", ["goog.ui.Textarea", "goog.ui.Textarea.EventType"], ["goog.Timer", "goog.events.EventType", "goog.events.KeyCodes", "goog.style", "goog.ui.Control", "goog.ui.TextareaRenderer", "goog.userAgent", "goog.userAgent.product"]);
goog.addDependency("ui/textarearenderer.js", ["goog.ui.TextareaRenderer"], ["goog.ui.Component.State", "goog.ui.ControlRenderer"]);
goog.addDependency("ui/togglebutton.js", ["goog.ui.ToggleButton"], ["goog.ui.Button", "goog.ui.Component", "goog.ui.CustomButtonRenderer", "goog.ui.registry"]);
goog.addDependency("ui/toolbar.js", ["goog.ui.Toolbar"], ["goog.ui.Container", "goog.ui.ToolbarRenderer"]);
goog.addDependency("ui/toolbarbutton.js", ["goog.ui.ToolbarButton"], ["goog.ui.Button", "goog.ui.ControlContent", "goog.ui.ToolbarButtonRenderer", "goog.ui.registry"]);
goog.addDependency("ui/toolbarbuttonrenderer.js", ["goog.ui.ToolbarButtonRenderer"], ["goog.ui.CustomButtonRenderer"]);
goog.addDependency("ui/toolbarcolormenubutton.js", ["goog.ui.ToolbarColorMenuButton"], ["goog.ui.ColorMenuButton", "goog.ui.ControlContent", "goog.ui.ToolbarColorMenuButtonRenderer", "goog.ui.registry"]);
goog.addDependency("ui/toolbarcolormenubuttonrenderer.js", ["goog.ui.ToolbarColorMenuButtonRenderer"], ["goog.dom.classes", "goog.ui.ColorMenuButtonRenderer", "goog.ui.ControlContent", "goog.ui.MenuButtonRenderer", "goog.ui.ToolbarMenuButtonRenderer"]);
goog.addDependency("ui/toolbarmenubutton.js", ["goog.ui.ToolbarMenuButton"], ["goog.ui.ControlContent", "goog.ui.MenuButton", "goog.ui.ToolbarMenuButtonRenderer", "goog.ui.registry"]);
goog.addDependency("ui/toolbarmenubuttonrenderer.js", ["goog.ui.ToolbarMenuButtonRenderer"], ["goog.ui.MenuButtonRenderer"]);
goog.addDependency("ui/toolbarrenderer.js", ["goog.ui.ToolbarRenderer"], ["goog.a11y.aria.Role", "goog.ui.Container.Orientation", "goog.ui.ContainerRenderer", "goog.ui.Separator", "goog.ui.ToolbarSeparatorRenderer"]);
goog.addDependency("ui/toolbarselect.js", ["goog.ui.ToolbarSelect"], ["goog.ui.ControlContent", "goog.ui.Select", "goog.ui.ToolbarMenuButtonRenderer", "goog.ui.registry"]);
goog.addDependency("ui/toolbarseparator.js", ["goog.ui.ToolbarSeparator"], ["goog.ui.Separator", "goog.ui.ToolbarSeparatorRenderer", "goog.ui.registry"]);
goog.addDependency("ui/toolbarseparatorrenderer.js", ["goog.ui.ToolbarSeparatorRenderer"], ["goog.dom.classes", "goog.ui.INLINE_BLOCK_CLASSNAME", "goog.ui.MenuSeparatorRenderer"]);
goog.addDependency("ui/toolbartogglebutton.js", ["goog.ui.ToolbarToggleButton"], ["goog.ui.ControlContent", "goog.ui.ToggleButton", "goog.ui.ToolbarButtonRenderer", "goog.ui.registry"]);
goog.addDependency("ui/tooltip.js", ["goog.ui.Tooltip", "goog.ui.Tooltip.CursorTooltipPosition", "goog.ui.Tooltip.ElementTooltipPosition", "goog.ui.Tooltip.State"], ["goog.Timer", "goog.array", "goog.dom", "goog.events", "goog.events.EventType", "goog.math.Box", "goog.math.Coordinate", "goog.positioning", "goog.positioning.AnchoredPosition", "goog.positioning.Corner", "goog.positioning.Overflow", "goog.positioning.OverflowStatus", "goog.positioning.ViewportPosition", "goog.structs.Set", "goog.style", 
"goog.ui.Popup", "goog.ui.PopupBase"]);
goog.addDependency("ui/tree/basenode.js", ["goog.ui.tree.BaseNode", "goog.ui.tree.BaseNode.EventType"], ["goog.Timer", "goog.a11y.aria", "goog.asserts", "goog.events.KeyCodes", "goog.string", "goog.string.StringBuffer", "goog.style", "goog.ui.Component", "goog.userAgent"]);
goog.addDependency("ui/tree/treecontrol.js", ["goog.ui.tree.TreeControl"], ["goog.a11y.aria", "goog.asserts", "goog.debug.Logger", "goog.dom.classes", "goog.events.EventType", "goog.events.FocusHandler", "goog.events.KeyHandler", "goog.events.KeyHandler.EventType", "goog.ui.tree.BaseNode", "goog.ui.tree.TreeNode", "goog.ui.tree.TypeAhead", "goog.userAgent"]);
goog.addDependency("ui/tree/treenode.js", ["goog.ui.tree.TreeNode"], ["goog.ui.tree.BaseNode"]);
goog.addDependency("ui/tree/typeahead.js", ["goog.ui.tree.TypeAhead", "goog.ui.tree.TypeAhead.Offset"], ["goog.array", "goog.events.KeyCodes", "goog.string", "goog.structs.Trie"]);
goog.addDependency("ui/tristatemenuitem.js", ["goog.ui.TriStateMenuItem", "goog.ui.TriStateMenuItem.State"], ["goog.dom.classes", "goog.ui.Component", "goog.ui.MenuItem", "goog.ui.TriStateMenuItemRenderer", "goog.ui.registry"]);
goog.addDependency("ui/tristatemenuitemrenderer.js", ["goog.ui.TriStateMenuItemRenderer"], ["goog.dom.classes", "goog.ui.MenuItemRenderer"]);
goog.addDependency("ui/twothumbslider.js", ["goog.ui.TwoThumbSlider"], ["goog.a11y.aria", "goog.a11y.aria.Role", "goog.dom", "goog.ui.SliderBase"]);
goog.addDependency("ui/zippy.js", ["goog.ui.Zippy", "goog.ui.Zippy.Events", "goog.ui.ZippyEvent"], ["goog.a11y.aria", "goog.a11y.aria.Role", "goog.a11y.aria.State", "goog.dom", "goog.dom.classes", "goog.events", "goog.events.Event", "goog.events.EventHandler", "goog.events.EventTarget", "goog.events.EventType", "goog.events.KeyCodes", "goog.style"]);
goog.addDependency("uri/uri.js", ["goog.Uri", "goog.Uri.QueryData"], ["goog.array", "goog.string", "goog.structs", "goog.structs.Map", "goog.uri.utils", "goog.uri.utils.ComponentIndex"]);
goog.addDependency("uri/utils.js", ["goog.uri.utils", "goog.uri.utils.ComponentIndex", "goog.uri.utils.QueryArray", "goog.uri.utils.QueryValue", "goog.uri.utils.StandardQueryParam"], ["goog.asserts", "goog.string", "goog.userAgent"]);
goog.addDependency("useragent/adobereader.js", ["goog.userAgent.adobeReader"], ["goog.string", "goog.userAgent"]);
goog.addDependency("useragent/flash.js", ["goog.userAgent.flash"], ["goog.string"]);
goog.addDependency("useragent/iphoto.js", ["goog.userAgent.iphoto"], ["goog.string", "goog.userAgent"]);
goog.addDependency("useragent/jscript.js", ["goog.userAgent.jscript"], ["goog.string"]);
goog.addDependency("useragent/picasa.js", ["goog.userAgent.picasa"], ["goog.string", "goog.userAgent"]);
goog.addDependency("useragent/platform.js", ["goog.userAgent.platform"], ["goog.userAgent"]);
goog.addDependency("useragent/product.js", ["goog.userAgent.product"], ["goog.userAgent"]);
goog.addDependency("useragent/product_isversion.js", ["goog.userAgent.product.isVersion"], ["goog.userAgent.product"]);
goog.addDependency("useragent/useragent.js", ["goog.userAgent"], ["goog.string"]);
goog.addDependency("vec/float32array.js", ["goog.vec.Float32Array"], []);
goog.addDependency("vec/float64array.js", ["goog.vec.Float64Array"], []);
goog.addDependency("vec/mat3.js", ["goog.vec.Mat3"], ["goog.vec", "goog.vec.Vec3"]);
goog.addDependency("vec/mat3d.js", ["goog.vec.mat3d"], ["goog.vec", "goog.vec.vec3d"]);
goog.addDependency("vec/mat3f.js", ["goog.vec.mat3f"], ["goog.vec", "goog.vec.vec3f"]);
goog.addDependency("vec/mat4.js", ["goog.vec.Mat4"], ["goog.vec", "goog.vec.Vec3", "goog.vec.Vec4"]);
goog.addDependency("vec/mat4d.js", ["goog.vec.mat4d"], ["goog.vec", "goog.vec.vec3d", "goog.vec.vec4d"]);
goog.addDependency("vec/mat4f.js", ["goog.vec.mat4f"], ["goog.vec", "goog.vec.vec3f", "goog.vec.vec4f"]);
goog.addDependency("vec/matrix3.js", ["goog.vec.Matrix3"], ["goog.vec"]);
goog.addDependency("vec/matrix4.js", ["goog.vec.Matrix4"], ["goog.vec", "goog.vec.Vec3", "goog.vec.Vec4"]);
goog.addDependency("vec/quaternion.js", ["goog.vec.Quaternion"], ["goog.vec", "goog.vec.Vec3", "goog.vec.Vec4"]);
goog.addDependency("vec/ray.js", ["goog.vec.Ray"], ["goog.vec.Vec3"]);
goog.addDependency("vec/vec.js", ["goog.vec", "goog.vec.AnyType", "goog.vec.ArrayType", "goog.vec.Float32", "goog.vec.Float64", "goog.vec.Number"], ["goog.vec.Float32Array", "goog.vec.Float64Array"]);
goog.addDependency("vec/vec2.js", ["goog.vec.Vec2"], ["goog.vec"]);
goog.addDependency("vec/vec2d.js", ["goog.vec.vec2d"], ["goog.vec"]);
goog.addDependency("vec/vec2f.js", ["goog.vec.vec2f"], ["goog.vec"]);
goog.addDependency("vec/vec3.js", ["goog.vec.Vec3"], ["goog.vec"]);
goog.addDependency("vec/vec3d.js", ["goog.vec.vec3d"], ["goog.vec"]);
goog.addDependency("vec/vec3f.js", ["goog.vec.vec3f"], ["goog.vec"]);
goog.addDependency("vec/vec4.js", ["goog.vec.Vec4"], ["goog.vec"]);
goog.addDependency("vec/vec4d.js", ["goog.vec.vec4d"], ["goog.vec"]);
goog.addDependency("vec/vec4f.js", ["goog.vec.vec4f"], ["goog.vec"]);
goog.addDependency("webgl/webgl.js", ["goog.webgl"], []);
goog.addDependency("window/window.js", ["goog.window"], ["goog.string", "goog.userAgent"]);

