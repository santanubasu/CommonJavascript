var com = {
	anvesaka:{
		common:{
			CLASS_TYPE_MAP:{
			},
			UNDEF:undefined,
			OBJECT:{},
			FUNCTION:function(){},
			ARRAY:[],
			BOOLEAN:true,
			STRING:"",
			NUMBER:0,
			MAX_LONG:(Math.pow(2, 63)-1),
			MAX_INT:(Math.pow(2, 31)-1),
			LOG_ERROR:3,
			LOG_WARN:2,
			LOG_INFO:1,
			LOG_DEBUG:0,
			namespace:function(ns) {
				var parts = ns.split('.');
				var parent = window;
				var currentPart = "";
				for (var i=0, length=parts.length; i<length; i++) {
					currentPart = parts[i];
					parent[currentPart] = parent[currentPart] || {};
					parent = parent[currentPart];
				}
				return parent;
			},
			log:function() { 
				if(arguments.length > 0) {
					var level = 1;
					var message = "";
					if (arguments.length > 1 && typeof arguments[0] === "number") {
						level = arguments[0];
						message = arguments.length > 2 ? Array.prototype.join.call(
								Array.prototype.splice.call(arguments, 1), " ") : arguments[1];
					} 
					else {
						message = arguments.length > 1 ? Array.prototype.join.call(arguments, " ") : arguments;
					}

					try { 
						if (level >= com.anvesaka.common.LOG_ERROR) {
							console.error(message);
						} 
						else if(level >= com.anvesaka.common.LOG_WARN) {
							console.warn(message);
						} 
						else if(level >= com.anvesaka.common.LOG_INFO) {
							console.info(message);
						} 
						else {
							console.debug(message);
						}
						return true;
					} 
					catch(e) {		
						try { 
							opera.postError(message); 
							return true;
						} catch(e) { }
					}
					return false;
				}
			},
			assert:function(value, msg) {
				return value === true || com.anvesaka.common.fail(msg);
			},
			fail:function(message) {
				com.anvesaka.common.log(com.anvesaka.common.LOG_ERROR, message);
				throw message;
			},
			isBlank:function(str) {
				return (str.length==0);
			},
			isNotBlank:function(str) {
				return (com.anvesaka.common.isDefined(str)&&str!=null&&str.length>0);
			},
			isNull:function(obj) {
				return obj==null;
			},
			isNotNull:function(obj) {
				return com.anvesaka.common.isDefined(str)&&obj!=null;
			},
			isDefined:function(obj) {
				return typeof obj!=="undefined";
			},	
			isNotDefined:function(obj) {
				return !com.anvesaka.common.isDefined(obj);
			},
			generatePsuedoGuid:function() {
				return "GUID"+(-Math.floor(Math.random()*com.anvesaka.common.MAX_LONG)); 
			},
			wrapArray:function(value) {
				if (com.anvesaka.common.isArray(value)) {
					return value;
				}
				else {
					return [value];
				}
			},
			values:function(map) {
				var values = [];
				for (var key in map) {
					values.push(map[key]);
				}
				return values;
			},
			keys:function(map) {
				var keys = [];
				for (var key in map) {
					keys.push(key);
				}
				return keys;
			},
			assertQuack:function(model, candidate) {
				com.anvesaka.common.assert(com.anvesaka.common.quacksLike(model, candidate), "Duck typing mismatch.");
			},
			quacksLike:function(model, candidate) {
				if (com.anvesaka.common.isPlainObject(model)&&com.anvesaka.common.isPlainObject(candidate)) {
					for (var propName in model) {
						if  (com.anvesaka.common.isDefined(candidate[propName])) {
							if (!com.anvesaka.common.quacksLike(model[propName], candidate[propName])) {
								return false;
							}
						}
						else {
							return false;
						}
					}
					return true;
				}
				else if (com.anvesaka.common.isArray(model)&&com.anvesaka.common.isArray(candidate)) {
					return true;
				}
				else if (com.anvesaka.common.isArray(model)||com.anvesaka.common.isArray(candidate)) {
					return false;
				}
				else {
					return (typeof model)===(typeof candidate);
				}
			},
			/*
			 * http://stackoverflow.com/questions/1026069/capitalize-the-first-letter-of-string-in-javascript
			 */
			capFirst:function(string) {
			    return string.charAt(0).toUpperCase() + string.slice(1);
			},
			split:function(array, n) {
			    var len = array.length;
			    var out = [];
			    var i = 0;
			    while (i<len) {
			        var size = Math.ceil((len - i)/n--);
			        out.push(array.slice(i, i += size));
			    }
			    return out;
			},
			getPkGetter:function(pkProp) {
				if (com.anvesaka.common.isDefined(pkProp)) {
					return function(element) {
						return element[pkProp];
					};
				}
				else {
					return function(element) {
						return element;
					};
				}
			},
			intersection:function(sets, keyProp) {
				var thiz = this;
				var candidateHash = {};
				var pkGetter = this.getPkGetter(keyProp);
				sets[0].forEach(function(element) {
					candidateHash[pkGetter(element)] = element;
				});
				for (var i=1; i<sets.length; i++) {
					var resultHash = {};
					sets[i].forEach(function(element) {
						var pk = pkGetter(element);
						if (com.anvesaka.common.isDefined(candidateHash[pk])) {
							resultHash[pk] = element;
						}
					});
					candidateHash = resultHash;
				}
				return com.anvesaka.common.values(candidateHash);
			},
			union:function(sets, keyProp) {
				var thiz = this;
				var resultHash = {};
				var pkGetter = this.getPkGetter(keyProp);
				sets.forEach(function(set) {
					set.forEach(function(element) {
						var pk = pkGetter(element);
						resultHash[pk] = element;
					});
				});
				return com.anvesaka.common.values(resultHash);
			},
			difference:function(sets, keyProp) {
				var diffs = [];
				var common = {};
				var pkGetter = this.getPkGetter(keyProp);
				sets.forEach(function(set) {
					diffs.push([]);
				});
				for (var i=0; i<sets.length; i++) {
					sets[i].forEach(function(element) {
						var pk = pkGetter(element);
						if (com.anvesaka.common.isDefined(common[pk])) {
							common[pk].count++;
						}
						else {
							common[pk] = {
								diffBin:diffs[i],
								element:element,
								count:1
							};
						}
					});			
				}
				for (var pk in common) {
					if (common[pk].count==1) {
						common[pk].diffBin.push(common[pk].element);
					}
				}
				return diffs;
			},
			/*
			 * The following methods are taken directly from jQuery 1.6 so that this code can be used independently of jQuery if needed.
			 */
			extend:function() {
				var options, name, src, copy, copyIsArray, clone,
				target = arguments[0] || {},
				i = 1,
				length = arguments.length,
				deep = false;

				// Handle a deep copy situation
				if ( typeof target === "boolean" ) {
					deep = target;
					target = arguments[1] || {};
					// skip the boolean and the target
					i = 2;
				}
	
				// Handle case when target is a string or something (possible in deep copy)
				if ( typeof target !== "object" && !com.anvesaka.common.isFunction(target) ) {
					target = {};
				}
	
				// extend jQuery itself if only one argument is passed
				if ( length === i ) {
					target = this;
					--i;
				}
	
				for ( ; i < length; i++ ) {
					// Only deal with non-null/undefined values
					if ( (options = arguments[ i ]) != null ) {
						// Extend the base object
						for ( name in options ) {
							src = target[ name ];
							copy = options[ name ];
	
							// Prevent never-ending loop
							if ( target === copy ) {
								continue;
							}
	
							// Recurse if we're merging plain objects or arrays
							if ( deep && copy && ( com.anvesaka.common.isPlainObject(copy) || (copyIsArray = com.anvesaka.common.isArray(copy)) ) ) {
								if ( copyIsArray ) {
									copyIsArray = false;
									clone = src && com.anvesaka.common.isArray(src) ? src : [];
	
								} else {
									clone = src && com.anvesaka.common.isPlainObject(src) ? src : {};
								}
	
								// Never move original objects, clone them
								target[ name ] = com.anvesaka.common.extend( deep, clone, copy );
	
							// Don't bring in undefined values
							} else if ( copy !== undefined ) {
								target[ name ] = copy;
							}
						}
					}
				}
				// Return the modified object
				return target;
			},
			isFunction : function(obj) {
				return com.anvesaka.common.type(obj) === "function";
			},

			isArray : Array.isArray || function(obj) {
				return com.anvesaka.common.type(obj) === "array";
			},
			// A crude way of determining if an object is a window
			isWindow : function(obj) {
				return obj && typeof obj === "object"
						&& "setInterval" in obj;
			},
			isNaN : function(obj) {
				return obj == null || !rdigit.test(obj) || isNaN(obj);
			},
			type : function(obj) {
				return obj == null ? String(obj) : com.anvesaka.common.CLASS_TYPE_MAP[toString
						.call(obj)]
						|| "object";
			},
			isPlainObject:function(obj) {
				// Must be an Object.
				// Because of IE, we also have to check the presence of the constructor property.
				// Make sure that DOM nodes and window objects don't pass through, as well
				if ( !obj || com.anvesaka.common.type(obj) !== "object" || obj.nodeType || com.anvesaka.common.isWindow( obj ) ) {
					return false;
				}

				// Not own constructor property must be Object
				if ( obj.constructor &&
					!hasOwn.call(obj, "constructor") &&
					!hasOwn.call(obj.constructor.prototype, "isPrototypeOf") ) {
					return false;
				}

				// Own properties are enumerated firstly, so to speed up,
				// if last one is own, then all properties are own.

				var key;
				for ( key in obj ) {}

				return key === undefined || hasOwn.call( obj, key );
			}
		}
	}
};

"Boolean Number String Function Array Date RegExp Object".split(" ").forEach(function(name) {
	com.anvesaka.common.CLASS_TYPE_MAP[ "[object " + name + "]" ] = name.toLowerCase();
});

/* 
 * Modified from http://ejohn.org/blog/simple-javascript-inheritance/
 */
(function() {
	var initializing = false, fnTest = /xyz/.test(function() {
		xyz;
	}) ? /\b_super\b/ : /.*/;
	this.Class = function() {
	};
	Class.extend = function(prop, singleton) {
		var _super = this.prototype;
		initializing = true;
		var prototype = new this();
		initializing = false;
		for ( var name in prop) {
			prototype[name] = typeof prop[name] == "function"
					&& typeof _super[name] == "function"
					&& fnTest.test(prop[name]) ? (function(name, fn) {
				return function() {
					var tmp = this._super;
					this._super = _super[name];
					var ret = fn.apply(this, arguments);
					this._super = tmp;

					return ret;
				};
			})(name, prop[name]) : prop[name];
		}
		function Class() {
			if (singleton) {
			}
			else if (!initializing&&this.init) {
				this.init.apply(this, arguments);
			}
		}
		Class.prototype = prototype;
		Class.extend = arguments.callee;
		if (singleton) {
			var instance;
			Class.getInstance = function() {
	            if (instance == null) {
	                instance = new Class();
	                if (instance.init) {
	                	instance.init.apply(instance, arguments);
	                }
	                instance.constructor = null;
	            }
	            return instance;
			};
			Class.prototype.constructor = null;
		}
		else {
			Class.prototype.constructor = Class;
		}
		return Class;
	};
})();
