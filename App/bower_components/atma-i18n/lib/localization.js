(function(root, factory){
	"use strict";

	var _global, _exports;
	
	if (typeof exports !== 'undefined' && (root === exports || root == null)){
		// raw nodejs module
		_global = _exports = global;
	}
	
	if (_global == null) 
		_global = typeof window === 'undefined'
			? global
			: window
			;
	
	if (_exports == null) 
		_exports = root || _global;
	
	
	_global.$L = factory(_global, _exports);
	
	if (typeof module !== 'undefined')
		module.exports = global.$L;
		
	
}(this, function(global){
	"use strict";
	
	// source /src/vars.js
	
	var _Array_slice = Array.prototype.slice,
	
		is_Browser = !!(typeof window !== 'undefined' && window.document),
		is_Node = !is_Browser
		;
	
	
	// end:source /src/vars.js
	// source /src/dependency.js
		
	var include = global.include || (global.atma && global.atma.include),
		mask = global.mask || (global.atma && global.atma.mask),
		Class = global.Class || (global.atma && global.atma.Class)
		;
	
	if (include == null && is_Node) {
		var atma = require('atma-libs/exports');
		
		include = atma.include;
		mask = atma.mask;
		Class = atma.Class;
	}
	
	// atma-formatter
	var __format = is_Node
		? require('atma-formatter')
		: window.Formatter || (mask && mask.$utils.format)
		;
	if (__format == null) 
		throw Error('atma-formatter is not preloaded.');
	
	
	// end:source /src/dependency.js
	
	// source /src/util/obj.js
	
	var obj_getProperty,
		obj_setProperty,
		obj_extend
		;
	
	(function(){
		
		obj_getProperty = function(obj, property) {
			var chain = property.split('.'),
				imax = chain.length,
				i = -1;
			while ( ++i < imax ) {
				if (obj == null) 
					return null;
				
				obj = obj[chain[i]];
			}
			return obj;
		};
		
		
		obj_setProperty = function(obj, property, value) {
			var chain = property.split('.'),
				imax = chain.length,
				i = -1,
				key;
		
			while ( ++i <  imax - 1) {
				key = chain[i];
				
				if (obj[key] == null) 
					obj[key] = {};
				
				obj = obj[key];
			}
		
			obj[chain[i]] = value;
		};
		
		
		obj_extend = function(target, source) {
			if (target == null) 
				target = {};
			if (source == null) 
				return target;
			
			var val,
				key;
			for(key in source) {
				val = source[key];
				if (val != null) 
					target[key] = val;
			}
			return target;
		};
	}());
	// end:source /src/util/obj.js
	// source /src/util/rgx.js
	
	function rgx_find(str, rgx, groupNumber) {
		var match = rgx.exec(str);
	
		if (match && match[groupNumber])
			return match[groupNumber];
	
		return null;
	}
	// end:source /src/util/rgx.js
	// source /src/util/log.js
	var log_error;
	(function(){
		
		log_error = function(){
			var args = _Array_slice.call(arguments);
			args.unshift('<i18n>');
			console.log.apply(console, args);
		};
		
	}());
	// end:source /src/util/log.js
	// source /src/util/detect.js
	var detect_fromBrowser,
		detect_fromRequest
		;
		
	(function(){
	
		detect_fromBrowser = function(){
			
			var lang = fromSearch(global.location.search);
			if (lang == null)
				lang = rgx_find(global.navigator.language, /^(\w+)/, 1);
			
			lang = lang.toLowerCase();
			return lang_contains(lang)
				? lang
				: lang_SUPPORT[0];
		};
		
		detect_fromRequest = function(req){
			// en-US,en;q=0.8,ru;q=0.6,de;q=0.4
			var queryIndex = req.url.indexOf('?'),
				lang, langs;
			
			if (queryIndex !== -1) {
				var search = req.url.substring(req.url);
				
				lang = fromSearch(search);
				if (lang_contains(lang)) 
					return lang;
			}
			
			langs = req.headers['accept-language'];
			if (!langs) 
				return lang_SUPPORT[0];
			
			langs = langs
				.replace(/\s*/g, '')
				.toLowerCase();
			
			var array = langs.split(','),
				imax = array.length,
				i = -1,
				index, x;
				
			while (++i < imax){
				x = array[i];
				index = x.indexOf(';');
				lang = index === -1
					? x
					: x.substring(0, index);
					
				if (lang_contains(lang)) 
					return lang;
			}
			
			return lang_SUPPORT[0];
		};
		
		// private
		
		function fromSearch(search){
			return rgx_find(search, /language=(\w+)/, 1);
		}
		
	}());
	
	// end:source /src/util/detect.js
	// source /src/util/lang.js
	var languages = {},
		lang_SUPPORT = ['en']
		;
		
	var lang_extend,
		lang_contains,
		lang_tryLoad
		;
	
	(function(languages){
		lang_contains = function(isoCode) {
			return lang_SUPPORT.indexOf(isoCode) !== -1;
		};
		
		lang_extend = function(isoCode, translations){
			if (translations == null) 
				return;
			
			if (languages[isoCode] == null) {
				languages[isoCode] = translations;
				return;
			}
				
			obj_extend(languages[isoCode], translations);
		};
		
		
		// check include params
		lang_tryLoad = function(callback){
			
			var params = include && include.route && include.route.params;
			if (params == null) 
				return;
			
			if (params.support) 
				lang_SUPPORT = params.support.split(',');
			
			var path = params.path;
			if (path){ 
				if (is_Browser) {
					SourceFactory
						.loadSingle({ path: path })
						.done(callback);
					return;
				}
				
				SourceFactory
					.loadAll({ path: path })
					.done(callback);
				return;
			}
			
			callback && callback();
		};
		
	}(languages));
	// end:source /src/util/lang.js
	// source /src/util/Deferred.js
	function Deferred(){}
	
	(function(){
	
		Deferred.prototype = {
			_isAsync: true,
	
			_done: null,
			_fail: null,
			_always: null,
			_resolved: null,
			_rejected: null,
	
			defer: function(){
				this._rejected = null;
				this._resolved = null;
			},
	
			resolve: function() {
				var done = this._done,
					always = this._always
					;
	
				this._resolved = arguments;
	
				dfr_clearListeners(this);
				arr_callOnce(done, this, arguments);
				arr_callOnce(always, this, [ this ]);
	
				return this;
			},
	
			reject: function() {
				var fail = this._fail,
					always = this._always
					;
	
				this._rejected = arguments;
	
				dfr_clearListeners(this);
				arr_callOnce(fail, this, arguments);
				arr_callOnce(always, this, [ this ]);
	
				return this;
			},
	
			resolveDelegate: function(){
				return fn_proxy(this.resolve, this);
			},
	
			rejectDelegate: function(){
				return fn_proxy(this.reject, this);
			},
	
			then: function(onSuccess, onError){
				return this.done(onSuccess).fail(onError);
			},
	
			done: function(callback) {
	
				return dfr_bind(
					this,
					this._resolved,
					this._done || (this._done = []),
					callback
				);
			},
	
			fail: function(callback) {
	
				return dfr_bind(
					this,
					this._rejected,
					this._fail || (this._fail = []),
					callback
				);
			},
	
			always: function(callback) {
	
				return dfr_bind(
					this,
					this._rejected || this._resolved,
					this._always || (this._always = []),
					callback
				);
			},
		};
	
		// PRIVATE
	
		function dfr_bind(dfr, arguments_, listeners, callback){
			if (callback == null) 
				return dfr;
	
			if ( arguments_ != null) 
				callback.apply(dfr, arguments_);
			else 
				listeners.push(callback);
	
			return dfr;
		}
	
		function dfr_clearListeners(dfr) {
			dfr._done = null;
			dfr._fail = null;
			dfr._always = null;
		}
	
		function arr_callOnce(arr, ctx, args) {
			if (arr == null) 
				return;
	
			var imax = arr.length,
				i = -1,
				fn;
			while ( ++i < imax ) {
				fn = arr[i];
	
				if (fn) 
					fn.apply(ctx, args);
			}
			arr.length = 0;
		}
		
		function fn_proxy(fn, ctx) {
	
			return function() {
				return fn.apply(ctx, arguments);
			};
		}
	}());
	// end:source /src/util/Deferred.js
	
	// source /src/sources/exports.js
	var SourceFactory;
	
	(function(){
		var Sources = {};
		
		// source File.js
		/**
		 *	Load translations
		 *	: NodeJS - load all supported languages
		 *	: Browser - load browser language only or default
		 *
		 *	@param path {String} e.g. '/localization/%%.json'
		 *	
		 *	export lang(s) to `Languages`
		 */
		
		(function(){
		
			Sources['file'] = {
				single: function(isoCode, path, callback){
				
					loadTranslation(path, function(data){
						lang_extend(isoCode, data);
						callback();
					});
					
				},
				/**
				 * - patter: e.g. '/localization/%%.json'
				 */
				many: function(pattern, langs, callback){
					var count = langs.length,
						max = count,
						i = -1;
					
					while (++i < max) {
						
						this.single(
							langs[i],
							pattern.replace('%%', langs[i]),
							onComplete
						);
					}
					function onComplete(){
						if (--count < 0)
							callback();
					}
				}
			};
			
			
			function loadTranslation(url, callback){
				if (include == null && is_Browser) {
					xhr(url, function(response){
						callback(response);
					});
					return;
				}
				
				var resource = is_Node
					? include.instance()
					: include
					;
				resource
					.ajax(url + '::Data')
					.done(function(resp) {
						callback(resp.ajax.Data);
					});
			}
			
			function xhr(path, callback){
				
				var req = new XMLHttpRequest();
				req.onload = function reqListener () {
					
					var json;
					try {
						json = JSON.parse(req.responseText);
					}
					catch(error){
						log_error('Should be json', error);
					}
					finally {
						callback(json);
					}
				}
				
				req.open("get", path, true);
				req.send();
			}
			
			
		}());
		
		// end:source File.js
		// source Directory.js
		/**
		 * NodeJS: look for all translations: 'baz/*.json'
		 * Browser: Not supported
		 */
		 
		Sources['directory'] = function(path, callback){
			
			var io = global.io || (global.atma && atma.io),
				glob = io && io.glob;
				
			if (glob == null) {
				try {
					io = require('atma-io');
				}catch(error){
					log_error('run `npm i atma-io -save`');
					throw error;
				}
				glob = io.glob;
			}
			
			var langs = [];
			glob
				.readFiles(path)
				.forEach(function(file){
					
					var lang = file.uri.getName(),
						translations = file.read();
					
					if (typeof translations === 'string') {
						try {
							translations = JSON.parse(translations);
						}catch(error){
							log_error('Failed to load translations', file.uri.toLocalFile());
							return;
						}
					}
					
					lang_extend(lang, translations);
				});
			
			if (langs.length === 0) 
				log_error('No translations', path);
				
			callback();
		}
		// end:source Directory.js
		//- import Mongo.js
		
		var sources__ = {};
		
		SourceFactory = {
			
			loadAll: function(config){
				if (config.support) 
					lang_SUPPORT = config.support;
				
				var count = lang_SUPPORT.length,
					imax = count,
					i = -1;
				
				while( ++i < imax){
					
					config.lang = lang_SUPPORT[i];
					this
						.loadSingle(config)
						.done(onComplete);
				}
				
				var dfr = new Deferred;
				function onComplete(){
					if (--count < 0)
						dfr.resolve();
				}
				
				return dfr;
			},
			
			/*
			 * @param config:
			 * 		{ path<Url||%%-Pattern>, ?support<Array>, ?lang }
			 * @param mix:
			 *  - NodeJS: req
			 *  - Browser: null
			 *
			 * @returns Deferred
			 */
			loadSingle: function(config, mix){
				if (config.support) 
					lang_SUPPORT = config.support;
				
				var lang = config.lang,
					path = config.path;
				
				if (lang == null) {
					lang = is_Node
						? detect_fromRequest(mix)
						: detect_fromBrowser()
						;
				}
				
				if (path) {
					if (path.indexOf('%%')) 
						path = path.replace('%%', lang);
					
					if (sources__[path]) 
						return sources__[path];
					
					var dfr = sources__[path] = new Deferred;
					
					Sources.file.single(lang, path, dfr.resolveDelegate());
					return dfr;
				}
				
				log_error('<Single Load: implemented `config.path` only>');
			}
		};
	}());
	// end:source /src/sources/exports.js
	
	// source /src/localizer/localizer.js
	var localizer_create;
	
	(function(languages){
		
		localizer_create = function(lang) {
			
			return _cache[lang] == null 
				? (_cache[lang] = localizer(lang))
				: _cache[lang]
				;
		};
		
		// private
		
		var _cache = {};
		
		function localizer(lang){
			
			var translation = languages[lang];
			if (translation == null) 
				console.error('<localization> Translation is not defined for', lang);
			
			var fn = function(key /* ... */){
				
				var str = translation == null
						? key
						: translation[key],
					args
					;
				
				if (str == null) {
					console.warn('<localization> No translation for', key);
					str = key;
				}
				
				if (arguments.length === 1)
					return str;
				
				// format string
				args = _Array_slice.call(arguments);
				args[0] = str;
				return __format.apply(null, args);
			};
			
			// properties
			fn.lang = lang;
			fn.extend = lang_extend;
			
			return fn;
		}
	}(languages));
	
	// end:source /src/localizer/localizer.js
	// source /src/localizer/browser.js
	var BrowserLocalizer;
	(function(){
		
		BrowserLocalizer = function() {
			return localizer__.apply(null, arguments);
		};
		
		var localizer__ = function(){
			localizer__ = localizer_create(detect_fromBrowser());
			return localizer__.apply(null, arguments);
		};
	}());
	
	// end:source /src/localizer/browser.js
	// source /src/localizer/node.js
	
	function NodeLocalizer(){
		
		console.warn('<localizer> In node env. please call $L.fromReq(req)("someKey")');
		return localizer_create(lang_SUPPORT[0]);
	}
	
	NodeLocalizer.fromReq = function(req){
		if (req.$L !== void 0) 
			return req.$L;
		
		var lang = detect_fromRequest(req),
			localizer = localizer_create(lang)
			;
		return req.$L = localizer;
	};
	// end:source /src/localizer/node.js
	
	// source /src/L.js
	
	var $L = is_Node
		? NodeLocalizer
		: BrowserLocalizer
		;
	
	if (mask != null) {
		// source L.mask-util.js
		var L_util_NODE,
			L_util_BROWSER
			;
			
		(function(){
		
			L_util_NODE = function(key, model, ctx){
				return localize($L.fromReq(ctx.req), arguments);
			};
			
			L_util_BROWSER = function(){
				return localize($L, arguments);
			};
		
			// private
			var evalStatements__ = mask.Utils.Expression.evalStatements;
			
			function localize($L, args) {
				return $L.apply(null, parse_arguments(args));
			}
			
			function parse_arguments(args){
				var str = args[0].trim(),
					model = args[1],
					ctx = args[2],
					ctr = args[4]
					;
				
				switch (str.charCodeAt(0)) {
					case 40: // (
					case 34: // "
					case 39: // '
						return evalStatements__(str, model, ctx, ctr);
				}
				
				var comma = str.indexOf(',');
				if (comma === -1) 
					return [str];
				
				args = evalStatements__(str.substring(comma + 1), model, ctx, ctr);
				args.unshift(str.substring(0, comma));
				
				return args;
			}
			
		}());
		
		// end:source L.mask-util.js
		
		mask.registerUtil('L', is_Node
			? L_util_NODE
			: L_util_BROWSER
		);
	}
	
	$L.loadSingle = SourceFactory.loadSingle;
	
	// source node/middleware.js
	
	if (is_Node) {
	
		/* { path, support } */
		$L.middleware = function(config){
			
			return function(req, res, next){
				$L
					.loadSingle(config, req)
					.done(function(){
						$L.fromReq(req);
						next();
					});
			};
		};
	}
	
	// end:source node/middleware.js
	// end:source /src/L.js
	
	
	
	lang_tryLoad();
	return $L;
}));