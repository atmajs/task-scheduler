(function(root, factory){
	"use strict";

	var __global = typeof window === 'undefined'
		? global
		: window
		;
	
	var Logger = factory(__global);
	
	// if CommonJS
	module.exports = Logger;
	// endif
	

	
}(this, function(global){
	"use strict";
	
	// source ../src/vars.js
	var _format;
	
	// if NodeJS
	_format = require('atma-formatter');
	// endif
	
	
	
	var level_TRACE = 100,
		level_DEBUG = 75,
		level_LOG = 50,
		level_WARN = 25,
		level_ERROR = 0,
		level_EXCEPTION = -25
		;
	
	var _cfg = {
			formatMessage: true,
			logCaller: true,
			logDate: false,
			logMeta: null,
			color: 'ascii',
			handleExceptions: false
		},
		_level = level_LOG,
		_levels = {}
		;
	
	// end:source ../src/vars.js
	// source ../src/utils/obj.js
	var obj_typeof,
		obj_inherit,
		obj_extend,
		obj_dimissCircular,
		obj_stringify
		;
	
	(function(){
		
		obj_typeof = function(x) {
			return Object
				.prototype
				.toString
				.call(x)
				.replace('[object ', '')
				.replace(']', '');
		};
		
		obj_inherit = function(target /* source, ..*/ ) {
			if (typeof target === 'function') 
				target = target.prototype;
			
			var i = 1,
				imax = arguments.length,
				source, key;
			for (; i < imax; i++) {
		
				source = typeof arguments[i] === 'function'
					? arguments[i].prototype
					: arguments[i];
		
				for (key in source) {
					target[key] = source[key];
				}
			}
			return target;
		};
		
		obj_extend = function(target, source) {
			if (source == null) 
				return target;
			
			for (var key in source) 
				target[key] = source[key];
				
			return target;
		};
		
		obj_dimissCircular = (function() {
			var cache;
		
			function clone(mix) {
				if (mix == null) 
					return mix;
				
				var type = obj_typeof(mix),
					cloned;
				
				
				switch (type) {
					case 'String':
					case 'Number':
					case 'Date':
					case 'RegExp':
					case 'Function':
					case 'Error':
					case 'Boolean':
						return mix;
					case 'Array':
					case 'Arguments':
						cloned = [];
						for (var i = 0, imax = mix.length; i < imax; i++) {
							cloned[i] = clone(mix[i]);
						}
						return cloned;
					case 'Object':
					case 'global':
						if (cache.indexOf(mix) !== -1) 
							return '<circular>';
						
						cache.push(mix);
						cloned = {};
						
						for (var key in mix) {
							cloned[key] = clone(mix[key]);
						}
						return cloned;
					default:
						console.warn('obj_dimissCircular: Unknown type', type);
						return mix;
				}
			}
		
			return function(mix) {
				if (typeof mix === 'object' && mix != null) {
					cache = [];
					mix = clone(mix);
					cache = null;
				}
		
				return mix;
			};
		}());
		
		
		
		obj_stringify = (function(){
			
			function doIndent(count) {
				var str = '',
					i = 0;
				for (; i < count; i++){
					str += '  ';
				}
				return str;
			}
			
			
			return function stringify(obj, visitor, indent){
				if (indent == null) 
					indent = 0;
					
				var tuple = ['', 0];
				
				if (typeof obj === 'undefined'){
					tuple[1] = '<undefined>';
					
					visitor(tuple, 'undefined');
					return tuple[1];
				}
				
				if (obj == null) {
					tuple[1] = '<null>';
					
					visitor(tuple, 'null');
					return tuple[1];
				}
				
				var type = obj_typeof(obj);
				
				switch (type) {
					case 'Array':
					case 'Arguments':
						var str = '[',
							array = obj;
							
						for (var i = 0, x, imax = array.length; i < imax; i++){
							x = array[i];
							
							if (str === '[')
								str += '\n';
							
							str += doIndent(indent + 1)
								+ stringify(x, visitor, indent + 1)
								+ (i < imax - 1 ? ',' : '')
								+ '\n'
								;
						}
						
						str += doIndent(indent) + ']';
						
						return str;
						
					case 'RegExp':
						tuple[1] = obj.toString();
						
						visitor(tuple, 'regexp');
						return tuple[1];
					case 'Date':
						tuple[1] = obj.toISOString();
						
						visitor(tuple, 'date');
						return tuple[1];
					
					case 'String':
					case 'Number':
					case 'Boolean':
						tuple[1] = obj;
						
						visitor(tuple, type.toLowerCase());
						return tuple[1];
					case 'Function':
						tuple[1] = '<function>';
						
						visitor(tuple, type.toLowerCase());
						return tuple[1];
					case 'Error':
						return obj.toString().red;
					
					case 'Object':
					case 'global':
						var str = '{',
							keys = Object.keys(obj),
							key;
							
						i = 0;
						imax = keys.length;
							
						for (; i < imax; i++){
							key = keys[i];
							
							
							if (str === '{') 
								str += '\n';
							
							tuple[0] = key;
							tuple[1] = obj[key];
							
							visitor(tuple);
							
							
							str += doIndent(indent + 1)
								+ tuple[0]
								+ ': '
								+ stringify(obj[key], visitor, indent + 1)
								+ (i < imax - 1 ? ',' : '')
								+ '\n'
								;
						}
						
						str += doIndent(indent) + '}';
						
						return str;
				}
				
				
				
			};
			
		}());
	
		
		
	}());
	
	// end:source ../src/utils/obj.js
	// source ../src/utils/function.js
	function fn_doNothing() {
		return this;
	}
	// end:source ../src/utils/function.js
	// source ../src/utils/stack.js
	var stack_formatCaller;
	
	(function() {
	
	
		var stackEntry = {
			path: null,
			file: null,
			line: null
		};
	
		var currentFile;
	
		function parseStackEntry(line) {
	
			if (line[line.length - 1] === ')')
				line = line.substr(
					line.indexOf('(') + 1,
					line.lastIndexOf(')') - 1);
	
			var match = /^(.+):(\d+):(\d)/.exec(line);
			if (match == null)
				return null;
	
			var path = stackEntry.path = match[1];
			stackEntry.file = path.substring(path.search(/[\/\\][^\/\\]+$/) + 1);
			stackEntry.line = match[2];
	
			if (currentFile == null)
				currentFile = stackEntry.file;
	
			return stackEntry;
		}
	
		stack_formatCaller = function(format, entryIndex) {
	
			var stack = new Error()
				.stack
				.split('\n')
				.splice(1);
	
			var imax = stack.length,
				i = -1,
				entry;
	
	
			while (++i < imax) {
				entry = parseStackEntry(stack[i]);
				if (entry == null || currentFile == null)
					continue;
	
				if (entry.file !== currentFile)
					break;
			}
	
			if (entry == null || i === imax)
				return '';
	
			return format
				.replace('P', entry.path)
				.replace('F', entry.file)
				.replace('L', entry.line);
		};
	
	}());
	// end:source ../src/utils/stack.js
	// source ../src/utils/date.js
	var date_formatForMessage
		;
	
	(function(){
		
		date_formatForMessage = function(format){
			if (typeof format !== 'string') 
				format = 'dd-MM hh:mm:ss';
			
			return _format(new Date, format);
		};
	}());
	// end:source ../src/utils/date.js
	// source ../src/utils/message.js
	var message_format,
		message_prepair;
	
	(function() {
	
		message_prepair = function(args, instance) {
			if (_cfg.formatMessage === false) {
				if (_cfg.logMeta)
					args.unshift(_cfg.logMeta(args));
				
				return args;
			}
			
			var message = message_format(args);
			
			if (instance._name != null) {
				message = instance._name.color + ' ' + message;
			}
			
			if (_cfg.logCaller !== false) 
				message += stack_formatCaller(' (F:L)', 5);
			
			if (typeof _cfg.logMeta === 'function') 
				message = _cfg.logMeta(args) + ' ' + message;
			
			if (_cfg.logDate !== false) {
				message = date_formatForMessage(_cfg.logDate)
					+ ' '
					+ message;
			}
			
			return message;
		};
	
		message_format = function(args) {
			var str = '',
				rgx_format = /%s|%d/,
				item;
	
			var format = args.length > 1
				&& typeof args[0] === 'string'
				&& rgx_format.test(args[0])
				;
	
	
			for (var i = 0, x, imax = args.length; i < imax; i++) {
				x = args[i];
	
				if (x instanceof String) 
					x = String(x);
				
				item = typeof x === 'string'
					? x
					: Color.formatJSON(x)
					;
	
				if (i > 0 && format && rgx_format.test(str)) {
					str = str.replace(rgx_format, item);
					continue;
				}
	
				if (str !== '')
					str += ' ';
	
				str += item;
			}
			return str;
		};
	
	}());
	// end:source ../src/utils/message.js
	// source ../src/utils/process.js
	var process_handleExceptions;
	
	(function(){
		
		process_handleExceptions = function(state){
			// if NodeJS
				process
					.removeListener('uncaughtException', onException);
					
				if (state !== false) 
					process.on('uncaughtException', onException);
			// endif
			
	
		};
		
		
		// private
		function onException(error) {
			var Transport = Logger
				.error(error)
				.getTransport()
				;
			
			if (Transport != null) {
				
				if (Transport.flush) {
					Transport.flush(exit);
					return;
				}
				if (Transport.flushAsync) {
					Transport.flushAsync(exit);
					return;
				}
			}
			exit();
		}
		function exit() {
			// if NodeJS
				process.exit(1);
			// endif
		}
	}());
	// end:source ../src/utils/process.js
	// source ../src/utils/cfg.js
	var cfg_set;
	
	(function(){
		
		cfg_set = function(key, value) {
			switch (key) {
				case 'level':
					_level = value;
					break;
				case 'levels':
					for (var scope in value){
						level_scope_Set(scope, value[scope]);
					}
					break;
				case 'transport':
					Transport.define(value);
					break;
				
				case 'handleExceptions':
					process_handleExceptions(value);
					break;
				
				case 'color':
					Color.define(value);
					/*fall through*/            
				case 'logCaller':
				case 'logDate':
				case 'formatMessage':
				case 'meta':
					_cfg[key] = value;
					break;
				default:
					console.error('Logger: unknown configuration', key);
					break;
			}
		};
		
	}());
	// end:source ../src/utils/cfg.js
	// source ../src/utils/level.js
	var level_scope_Set,
		level_scope_Get;
	
	(function(){
		
		level_scope_Set = function(scope, level){
			insert(scope, level);
		};
		
		level_scope_Get = function(scope){
			var level = _levels[scope];
			if (level === _default) 
				return null;
			
			if (level == null) 
				level = _levels[scope] = getParent(scope);
			
			
			return level.level;
		};
		
		// private
		var _levels = {},
			_default = {
				level: null
			};
			
		function getParent(scope){
			var i = scope.lastIndexOf('.');
			if (i === -1) 
				return _default;
			
			scope = scope.substring(0, i);
			if (_levels.hasOwnProperty(scope) && _levels[scope].strict !== true) {
				return _levels[scope];
			}
			
			return getParent(scope);
		}
		function insert(scope, level) {
			var any = /\.\*$/.test(scope);
			if (any) 
				scope = scope.slice(0, -2);
			
			_levels[scope] = {
				level: level,
				strict: any === false
			};
			
			if (any) 
				updateChildren(scope, level, any);
		}
		function updateChildren(scope, level) {
			var length = scope.length,
				key;
			for(key in _levels){
				if (key.length <= length + 1) 
					continue;
				
				if (key.indexOf(scope + '.') !== 0 ) 
					continue;
				
				_levels[key] = {
					level: level
				};
			}
		}
	}());
	// end:source ../src/utils/level.js
	// source ../src/color/color.js
	var Color;
	(function() {
		Color = {
			init: {
				ascii: function() {
					_colorize = initialize(ColorAscii);
				},
				html: function(){
					_colorize = initialize(ColorHtml);
				},
				none: function(){
					_colorize = initialize(ColorNone);
				}
			},
			colorize: function(str){
				return _colorize(str);
			},
			formatJSON: function(obj){
				var json = obj;
				if (json !== void 0 && typeof json === 'object') {
					json = obj_dimissCircular(obj);
				}
				
				return obj_stringify(json, function(tuple, type){
					
					if (type && JSONTheme[type]) {
						tuple[1] = String(tuple[1])[JSONTheme[type]];
					}
					
					if (tuple[0]) {
						tuple[0] = tuple[0].bold;
					}
					
					
				});
			},
			define: function(type){
				
				if (Color.init[type]) 
					return Color.init[type]();
				
				console.error('Invalid Color Type ', type);
			}
		};
	
		var _colorize;
		
		// source data/none.js
			
		var ColorNone = {
			END : '',
			value: {
				red: '',
				green: '',
				yellow: '',
				blue: '',
				magenta: '',
				cyan: '',
				
		
				bold: '',
				italic: '',
				underline: '',
				inverse: ''
			},
			start: function(key){
				return '';
			}
		};
		// end:source data/none.js
		// source data/html.js
		var ColorHtml;
		(function(){
			
			ColorHtml = {
				END : '</span>',
				
				value: {
					red: 'color:red',
					green: 'color:green',
					yellow: 'color:yellow',
					blue: 'color:blue',
					magenta: 'color:magenta',
					cyan: 'color:cyan',
					
					bg_black: 'background-color:black',
					bg_red: 'background-color:red',
					bg_green: 'background-color:green',
					bg_yellow: 'background-color:yellow',
					bg_blue: 'background-color:blue',
					bg_magenta: 'background-color:magenta',
					bg_cyan: 'background-color:cyan',
					bg_white: 'background-color:white',
			
					bold: 'font-weight:bold',
					italic: 'font-style:italic',
					underline: 'text-decoration:underline',
					inverse: 'color:black;background:white'
				},
				
				
				start: function(key){
					var str = '<span style="'
						+ this.value[key]
						+ '">';
					
					return str;
				},
				decorator: function(str){
					return str_htmlEncode(str);
				}
			};
			
			var str_htmlEncode;
			(function() {
				str_htmlEncode = function(html) {
					return html.replace(/[&"'<>\/]/g, replaceEntity);
				};
				
				var map = {
					'&': '&amp;',
					'<': '&lt;',
					'>': '&gt;',
					'"': '&quot;',
					"'": '&#x27;',
					'/': '&#x2F;'
				};
				function replaceEntity(chr) {
					return map[chr];
				}
			}());
		}());
		
		// end:source data/html.js
		// source data/ascii.js
			
		var ColorAscii = {
			type: 'ascii',
			START : '\u001b[',
			END : '\u001b[0m',
			
			value: {
				red: '31m',
				green: '32m',
				yellow: '33m',
				blue: '34m',
				magenta: '35m',
				cyan: '36m',
				white: '37m',
				black: '30m',
		
				bg_black: '40m',
				bg_red: '41m',
				bg_green: '42m',
				bg_yellow: '43m',
				bg_blue: '44m',
				bg_magenta: '45m',
				bg_cyan: '46m',
				bg_white: '47m',
				
				bold: '1m',
				italic: '3m',
				underline: '4m',
				inverse: '7m'
			},
			
			start: function(key){
				return this.START + this.value[key];
			}
		};
		// end:source data/ascii.js
		
		
		function initialize(ColorData) {
			Object
				.keys(ColorData.value)
				.forEach(function(key) {
					try {
						Object.defineProperty(String.prototype, key, {
							get: function() {
								var txt = this,
									decorator = ColorData.decorator;
								if (decorator != null) {
									if (txt.__wrapped !== true) 
										txt = decorator(txt);
								}
								var out = ColorData.start(key)
									+ txt
									+ ColorData.END;
								
								if (decorator == null) 
									return out;
								
								out = new String(out);
								out.__wrapped = true;
								return out;
							},
							enumerable: false,
							configurable: true
						});
			
					} catch(e) {
						// already exists ( with configurable: false )
					}
					
				});
	
			Object.defineProperty(String.prototype, 'color', {
				get: function() {
					return painter(this, ColorData);
				},
				enumerable: false,
				configurable: true
			});
	
			return function(str){
				return painter(str, ColorData);
			};
		}
		
		
		_colorize = initialize(ColorAscii);
		
		
		var JSONTheme = {
			'string': 'yellow',
			'number': 'cyan',
			'boolean': 'cyan',
			
			'regexp': 'magenta',
			'date': 'magenta',
			'function': 'magenta',
			
			'null': 'blue',
			'undefined': 'blue'
		};
		
		var painter;
		(function(){
			painter = function(str, ColorData) {
				prepairColor(ColorData);
				ColorData.rgx_search.lastIndex = 0;
				
				var match,
					key,
					end,
					doRenew = ColorData.type === 'ascii',
					stack = doRenew && [] || null,
					txt
					;
				
				var out = '', last = 0;
				while (1) {
					match = ColorData.rgx_search.exec(str);
					if (match == null) 
						break;
					
					key = match[1];
					if (ColorData.value[key] == null) 
						continue;
					
					var index = match.index,
						bound = index + match[0].length,
						head, txt;
						
					if (last !== index) 
						out += createRange(str, last, index, ColorData);
					
					
					end = index_End(str, bound);
					last = end + 1;
					
					if (end === -1) {
						out += createRange(str, index, end, ColorData);
						continue;
					}
					
					head = ColorData.start(key);
					txt = str.substring(bound, end);
					txt = painter(txt, ColorData);
					
					out += head
						+ txt
						+ ColorData.END
						+ (doRenew ? stack_renew(stack, end, ColorData) : '')
						;
						
					if (doRenew) 
						stack.push({end: end, key: key});
						
					ColorData.rgx_search.lastIndex = end + 1;
				}
				
				if (last < str.length) {
					out += createRange(str, last, str.length, ColorData);
				}
				
				return out;
			};
			
			function createRange(str, start, end, ColorData) {
				var txt = str.substring(start, end);
				if (ColorData.decorator) 
					return ColorData.decorator(txt);
				
				return txt;
			}
			function index_End(str, start) {
				var count = 1,
					imax = str.length,
					i = start,
					c;
				for (; i < imax; i++){
					c = str.charCodeAt(i);
					
					if (c === 60 /* < */) 
						count++;
					if (c === 62 /* > */) 
						count--;
					if (count === 0) 
						return i;
				}
				return -1;
			}
			function stack_renew(stack, index, ColorData) {
				var str = '',
					imax = stack.length,
					i = -1, x;
				while ( ++i < imax ){
					x = stack[i];
					
					if (x.end < index) 
						continue;
					str += ColorData.start(x.key);
				}
				return str;
			}
			function prepairColor(ColorData){
				if (ColorData.rgx_search == null) {
					var str = '(';
					for (var key in ColorData.value) {
						str += str === '(' ? key : '|' + key;
					}
					
					str += ')<';
					ColorData.rgx_search = new RegExp(str, 'g');
				}
				return ColorData;
			}
		}());
	}());
	// end:source ../src/color/color.js
	
	// source ../src/transport/Transport.js
	var Transport = (function(){
		var _transports = {},
			_transport;
			
		// source ./helper/Buffered.js
		var Buffered;
		
		(function(){
			
			Buffered = {
				flushAsync: function(writer, maxSize, write, cb){
					if (writer.busy) {
						if (cb != null) 
							writer.listeners.push(cb);
						
						return;
					}
					
					var data = joinBuffer(writer);
					if (data === '') {
						if (cb)
							cb();
						return;
					}
					
					writer.busy = true;
					
					write(writer, data, function(error){
						writer.busy = false;
						callAll(cb, writer.listeners);
						if (writer.buffer.length > maxSize) 
							writer.flushAsync();
					});
				},
				flush: function(writer, write, cb){
					if (writer.busy) {
						// performing Sync flush on Async writer: ensure transport is free
						writer.listeners.push(function(){
							flushBuffer(writer, write, cb);
						});
						return;
					}
					flushBuffer(writer, write);
					if (cb) 
						cb();
				}
			};
			
			function flushBuffer(writer, write){
				var data = joinBuffer(writer);
				if (data === '')
					return;
				
				write(writer, data);
			}
			function joinBuffer(writer) {
				var buf = writer.buffer;
				if (buf.length === 0) 
					return '';
				
				var newLine = writer.newLine,
					data = buf.join(newLine)+ newLine;
					
				buf.length = 0;
				return data;
			}
			function callAll(fn, fns, error) {
				if (fn) 
					fn(error);
					
				var imax = fns.length,
					i = -1;
				if (imax === 0) 
					return;
				
				while ( ++i < imax )
					fns[i](error);
					
				fns.length = 0;
			}
		}());
		// end:source ./helper/Buffered.js
		// source ./http/transport.js
		_transports.http = function(){
			
			var BUFFER_SIZE = 0,
				_url,
				_method,
				_headers,
				_type;
			
			// source ./http_send.js
			var http_send;
			(function(){
				
				http_send = function(data, cb){
					// if NodeJS
					send_node(_url, _method || 'POST', _headers, data, cb);
					// endif
					
			
				};
				
			
				
				// if NodeJS
				var Https = require('https'),
					Http = require('http'),
					Url = require('url');
				function send_node(url, method, headers, data, cb){
					method = method.toUpperCase();
					headers = headers || {};
					
					if (!headers['Content-Type']) 
						headers['Content-Type'] = 'text/plain';
						
					headers['Content-Length'] = Buffer.byteLength(data);
					
					if (method === 'GET') {
						data = encode(data);
						if (data == null) {
							if (cb) cb('Encode failed');
							return;
						}
						
						url += data;
						data = void 0;
					}
					
					var options = Url.parse(url);
					options.headers = headers;
					options.method = method;
					
					var T = options.protocol === 'https:'
						? Https
						: Http;
					
					var msg = '';
					var req = T.request(options, function(res){
						res.setEncoding('utf-8');
						res
							.on('data', function(chunk){
								msg += String(chunk);
							})
							.on('end', function(){
								if (cb) cb(msg, res);
							});
					});
					if (data != null) {
						req.write(data);
					}
					
					req.end();
				}
				// endif
				
				function encode(str) {
					try {
						return encodeURIComponent(str);
					} catch(error){
						Logger.error('Logger encode error', error);
						return null;
					}
				}
			}());
			// end:source ./http_send.js
			// source ./HttpHandler.js
			var HttpHandler;
			(function(){
				
				HttpHandler = {
					newLine: '\n',
					busy: false,
					listeners: [],
					buffer: [],
					write: function(message){
						message = message.replace(/\n/g, '\\n');
						this.buffer.push(message);
						
						if (this.buffer.length > BUFFER_SIZE) 
							this.flushAsync();
					},
					
					flushAsync: function(cb){
						Buffered.flushAsync(this, BUFFER_SIZE, Http_writeAsync, cb);
					},
				};
				
				
				
				function Http_writeAsync(handler, data, cb){
					http_send(data, cb);
				}
			}());
			// end:source ./HttpHandler.js
			
			return {
				write: function(message){
					HttpHandler.write(message);
				},
				flushAsync: function(cb){
					HttpHandler.flushAsync(cb);
				},
				
				/* { bufferSize, url, method, headers } */
				cfg: function(cfg){
					if (cfg.bufferSize != null) 
						BUFFER_SIZE = cfg.bufferSize;
					
					_url = cfg.url || _url;
					_method = cfg.method || _method;
					_headers = cfg.headers || _headers;
					
		
				}
			};
		};
		// end:source ./http/transport.js
		
		// if NodeJS
			// source ./Std.js
			_transports.std = (function(){
				
				
				return {
					write: function(message){
						process
							.stdout
							.write('\n' + message)
							;
					},
					
					cfg: function(){},
			        std: true
				};
			}());
			// end:source ./Std.js
			// source ./Stream.js
			_transports.stream = (function(){
				
				var _stream;
				
				return {
					write: function(message){
						_stream.write(message);
					},
					
					cfg: function(config){
						var stream = config.stream;
						if (stream == null) 
							throw Error('Transport Configuration: No `stream` property');
						
						if (stream.write == null) 
							throw Error('Transport Configuration: Invalid stream object');
						
						_stream = stream;
					}
				};
			}());
			// end:source ./Stream.js
			// source ./fs/transport.js
			_transports.fs = function(){
				
				var Path = require('path'),
					Fs = require('fs')
					;
				
				// source vars.js
				var path_DIR = 'logs',
					path_Ext = 'txt',
					os_EndOfLine = require('os').EOL,
					
					// Bytes
					FILE_MAXSIZE = 500 * 1024,
					FILE_MAXCOUNT = 10,
					
					// Message Count
					BUFFER_SIZE = 0,
					
					use_SYNC = false,
					
					// EOL or <br/>
					newLine
					;
				
				// end:source vars.js
				// source utils/file.js
				var file_append,
					file_appendAsync,
					file_readSize,
					file_removeAsync,
					file_remove;
				
				(function() {
				
					var Fs = require('fs'),
						Path = require('path');
				
					file_readSize = function(path) {
						try {
							return Fs.lstatSync(path).size;
						} catch (error) {
							return 0;
						}
					};
				
					file_removeAsync = function(path, callback) {
						Fs.unlink(path, function(error) {
							if (error)
								exception_(error);
					
							callback(error);
						});
					};
				
					file_remove = function(path) {
						try {
							
							Fs.unlinkSync(path);
						} catch (error) {
							exception_(error);
						}
					};
				
					file_appendAsync = function(path, str, callback) {
						if (!str) {
							callback();
							return;
						}
					
						Fs.open(path, 'a', function(error, fd) {
							if (error != null) {
								exception_(error);
								callback(error);
								return;
							}
					
							var buffer = new Buffer(str, 'utf8');
							Fs.write(fd, buffer, 0, buffer.length, 0, function(error) {
								if (error) 
									exception_(error);
								
								Fs.close(fd, callback);
							});
						});
					};
				
					file_append = function(path, str) {
						if (!str) 
							return;
						
						try {
							var fd = Fs.openSync(path, 'a');
				
							Fs.writeSync(fd, str);
							Fs.closeSync(fd);
							
						} catch (error) {
							exception_(error);
						}
					};
				}());
				// end:source utils/file.js
				// source utils/dir.js
				var dir_read,
					dir_ensure;
				
				(function() {
				
					dir_read = function(path) {
				
						try {
							return Fs
								.readdirSync(path);
						} catch (error) {
							exception_(error);
							return [];
						}
					};
				
				
					dir_ensure = function(path) {
						if (Fs.existsSync(path))
							return;
				
						dir_ensure(Path.dirname(path));
				
						try {
							Fs.mkdirSync(path);
						} catch (error) {
				
							exception_(error);
						}
					};
				
				}());
				// end:source utils/dir.js
			    // source utils/std.js
			    var std_intercept;
			    
			    (function() {
			    
			    	var orig = {};
			    	
			    	saveOriginals(process.stdout, 'stdout');
			    	saveOriginals(process.stderr, 'stderr');
			    	
			    	std_intercept = function(state){
			    		var fn = state !== false
			    			? intercept
			    			: deintercept
			    			;
			    		
			    		fn(process.stdout, 'stdout');
			    		fn(process.stderr, 'stderr');
			    	};
			    
			    
			    	function saveOriginals(stream, type) {
			    		orig[type] = {
			    			write: stream.write,
			    			end: stream.end
			    		};
			    	}
			    	
			    	function deintercept(stream, type) {
			    		stream.write = orig[type].write;
			    		stream.end = orig[type].end;
			    	}
			    	
			    	function intercept(stream, type) {
			    
			    		stream.write = stream.end = function(data, encoding) {
			    			if (data == null) 
			    				return;
			    			
			    			if (typeof data !== 'string') 
			    				data = data.toString();
			    			
			    			if (type === 'stderr') 
			    				data = data.red;
			    			
			    			FsTransport.write(data);
			    		};
			    	}
			    	
			    }());
			    // end:source utils/std.js
				// source File.js
				var File = function(name, shouldReadStats){
					
					this.buffer = [];
					this.path = Path.resolve(_directory, name)
						+ '.'
						+ _extension
						;
					
					this.size = shouldReadStats !== true
						? 0
						: file_readSize(this.path)
						;
				};
				
				File.prototype = {
					get newLine () {
						return newLine;
					},
					busy: false,
					errored: false,
					listeners: [],
					write: function(message){
						this.size += message.length + newLine.length;
						this.buffer.push(message);
						
						if (this.buffer.length > BUFFER_SIZE) {
							this[use_SYNC ? 'flush' : 'flushAsync']();
						}
						
						if (this.size >= FILE_MAXSIZE) {
							flow_nextFile();
						}
					},
					flushAsync: function(cb){
						Buffered.flushAsync(this, BUFFER_SIZE, File_writeAsync, cb);
					},
					flush: function(cb){
						Buffered.flush(this, File_write, cb);
					},
					getBuffer_: function(){
						if (this.buffer.length === 0) 
							return '';
						
						var data = this.buffer.join(newLine)+ newLine;
						this.buffer.length = 0;
						return data;
					}
				};
				
				function File_writeAsync(self, data, cb){
					file_appendAsync(self.path, data, cb);
				}
				function File_write(self, data){
					file_append(self.path, data);
				}
				// end:source File.js
				// source flow.js
				var flow_initialize,
					flow_nextFile
					;
					
				(function(){
					
					flow_initialize = function(){
						
						newLine = _cfg.color === 'html'
							? '<br/>'
							: os_EndOfLine
							;
						
						dir_ensure(_directory);
						
						var files = dir_read(_directory).sort(),
							filename,
							i = files.length,
							
							rgx = /^\d+_/g
							;
						
						
						while ( --i > -1 ) {
							filename = files[i];
							if (rgx.test(filename)) {
								break;
							}
						}
						
						_file = i > -1
							? new File(filename.replace(/\.\w+$/, ''), true)
							: flow_nextFile()
							;
						
						if (_file.size >= FILE_MAXSIZE) 
							flow_nextFile();
							
						if (files.length >= FILE_MAXCOUNT) {
							files
								.slice(0, files.length - FILE_MAXCOUNT + 1)
								.forEach(function(filename){
				                 
									file_remove(Path.resolve(_directory, filename));
								});
						}
					};
					
					
					flow_nextFile = function(){
						if (_file != null)
							_file.flush();
						
						var d = new Date();
						_file = new File(d.getTime()
								+ '_'
								+ (switch_++)
								+ '_'
								+ _format(d, 'dd-MM_hh'));
						
						return _file;
					};
					
					var switch_ = 0;
				}());
				// end:source flow.js
				// source exception.js
				function exception_(error) {
					
				    try {
						Fs.appendFileSync(
							Path.resolve(_directory, 'logger-exceptions.txt'),
							message_format([error]) + os_EndOfLine
						);
					} catch(error_) {
						if (error_.code === 'ENOENT') {
							dir_ensure(_directory);
							exception_(error);
						}
					}
				}
				// end:source exception.js
				
				
				var _directory = path_DIR,
					_extension = path_Ext,
					_file
					;
				
				var FsTransport = {
					write: function(message, level){
						if (_file == null) 
							flow_initialize();
							
						_file.write(message);
					},
					
					flush: function(cb){
						_file.flush(cb);
					},
					flushAsync: function(cb){
						_file.flushAsync(cb);
					},
					
					/*
						* { extension, directory, filesCount, fileSize, bufferSize }
						*/
					cfg: function(cfg){
						_extension = cfg.extension || path_Ext;
			            
						_directory = Path.resolve(
							//process.mainModule.filename,
							Path.dirname(module.parent.filename),
							cfg.directory || path_DIR
						);
						
						if (cfg.bufferSize != null) 
							BUFFER_SIZE = cfg.bufferSize;
						
						if (cfg.filesCount) 
							FILE_MAXCOUNT = cfg.filesCount;
						
						if (cfg.fileSize) 
							FILE_MAXSIZE = cfg.fileSize;
							
						if (cfg.sync != null) 
							use_SYNC = cfg.sync;
							
						if (cfg.interceptStd) 
							std_intercept();
					},
			        
			        interceptStd: function(state){
			            std_intercept(state);
			        },
					
					exception: exception_
				};
				
				return FsTransport;
			};
			// end:source ./fs/transport.js
			_transport = _transports.std;
		// endif
		
	
		
		return {
			
			define: function(transportCfg){
				var type = transportCfg.type;
				
				_transport = _transports[type];
				if (_transport == null) 
					throw Error('Transport type is not supported `' + type + '`');
				
				
				if (typeof _transport === 'function') {
					// initialize
					_transport = _transport();
				}
				
				_transport.cfg(transportCfg);
				
				return this;
			},
			
			write: function(message){
				_transport.write(message);
			},
			
			get: function(type){
				if (type == null) 
					return _transport;
				
				var t = _transport[type];
				if (t == null) throw Error('No transport: ' + type);
				
				return typeof t === 'function'
					? t()
					: t
					;
			}
		};
		
	}());
	// end:source ../src/transport/Transport.js
	// source ../src/logger/Logger.js
	var Logger;
	(function(){
		
		// source utils.js
		var logger_canWrite,
			logger_fn;
		
		(function(){
			
			logger_canWrite = function(instance, level){
				var logLevel = level,
					globalLevel = _level;
				if (instance == null || instance instanceof Logger === false)
					instance = mockedInstance;
				
				var scope = instance._scope;
				if (scope != null) {
					var scoped = level_scope_Get(scope);
					if (scoped != null)
						return scoped + (level - level_LOG) /* diff */ <= globalLevel;
				}
				
				if (instance._level != null) 
					logLevel = instance._level;
				
				if (logLevel <= globalLevel) 
					return true;
				
				
				return false;
			};
			logger_fn = function(expectLevel, decorator){
				return function(){
					if (logger_canWrite(this, expectLevel) === false)
						return this;
					
					var msg = message_prepair(arguments, this);
					if (decorator && typeof msg === 'string') 
						msg = decorator(msg);
					
		            Transport.write(msg);
					return this;
				};
			};
			
			var mockedInstance = {
				_parent: null,
				_level: null,
				_name: null,
				_scope: null
			};
			
		}());
		// end:source utils.js
		// source Proto.js
		var LoggerProto,
			LoggerEmptyProto;
		(function(){
				
			LoggerProto = {
				_parent: null,
				_level: null,
				_name: null,
				
				cfg: function(mix){
					if (arguments.length === 0) 
						return _cfg;
					
					if (typeof mix === 'string'){
						if (arguments.length === 1) 
							return _cfg[mix];
						
						cfg_set(mix, arguments[1]);
						return this;
					}
					for (var key in mix) {
						cfg_set(key, mix[key]);
					}
					return this;
				},
				
				color: Color,
				formatMessage: function(){
					return message_format(arguments);
				},
				
				log: logger_fn(level_LOG),
				warn: logger_fn(level_WARN, function(msg){return msg.yellow.bold;}),
				debug: logger_fn(level_DEBUG),
				trace: logger_fn(level_TRACE),
				error: logger_fn(level_ERROR, function(msg){return msg.red.bold;}),
				
				getTransport: function() {
					return Transport.get();
				},
				
				create: function(name, level){
					return new Logger_Scope(
						this instanceof Logger && this || null
						, name
						, level
					);
				},
				
				level_LOG: level_LOG,
				level_WARN: level_WARN,
				level_TRACE: level_TRACE,
				level_DEBUG: level_DEBUG,
				level_ERROR: level_ERROR,
				level_EXCEPTION : level_EXCEPTION
			};
			
			LoggerEmptyProto = obj_extend({}, LoggerProto);
			
			LoggerEmptyProto.log =
			LoggerEmptyProto.warn =
			LoggerEmptyProto.debug =
			LoggerEmptyProto.trace =
			LoggerEmptyProto.error = fn_doNothing;
			
		}());
		// end:source Proto.js
		// source Logger_Empty.js
		var Logger_Empty;
		(function() {
			Logger_Empty = function(){};
			Logger_Empty.prototype = LoggerEmptyProto;
		}());
		// end:source Logger_Empty.js
		// source Logger_Scope.js
		var Logger_Scope;
		(function() {
			Logger_Scope = function(parent, name, level){
				this._parent = parent;
				this._name = name;
				this._level = level;
				
				if (parent != null && parent._name) 
					this._name = parent._name + '.' + name;
				
				this._scope = this._name;
				
				var self = this;
				function log(){
					return self.log.apply(self, arguments);
				}
				log.__proto__ = self;
				return log;
			};
			
			Logger_Scope.prototype = LoggerProto;
			obj_extend(Logger_Scope, LoggerProto);
		}());
		// end:source Logger_Scope.js
		
		Logger =  function(mix1, mix2) {
			if (typeof mix1 === 'string') {
				return new Logger_Scope(
					this instanceof Logger && this || null
					, mix1
					, mix2
				);
			}
			
			if (typeof mix1 === 'number') {
				return logger_canWrite(null, mix1)
					? LoggerProto
					: LoggerEmptyProto;
			}
			if (typeof mix1 === 'boolean') {
				return mix1 === true
					? LoggerProto
					: LoggerEmptyProto;
			}
			
			return LoggerEmptyProto;
		};
		Logger.prototype = LoggerProto;
		
	    obj_extend(Logger, LoggerProto);
	}());
	// end:source ../src/logger/Logger.js
	
	// source ../src/configurate.js
	(function(){
		if (typeof process === 'undefined')
			return;
		
		var args = process.argv.slice(2),
			imax = args.length,
			i = -1,
			x;
		
		while ( ++i < imax ) {
			x = args[i].replace(/^\-+/,'');
				
			switch (x) {
				case 'no-color':
					Logger.cfg('color', 'none');
					break;
				case 'level':
					var level = getLevel('level');
					if (level == null) 
						break;
					
					Logger.cfg('level', level);
					break;
				default:
					if (x.indexOf('level.') === 0) {
						
						var level = getLevel('level.SCOPE_NAME');
						if (level == null) 
							break;
						
						x = x.replace('level.', '');
						var obj = {};
						obj[x] = level;
						
						Logger.cfg('levels', obj);
					}
					break;
			}
		}
	
		function getLevel(key){
			var level = parseInt(args[++i]);
			if (isNaN(level)) {
				Logger.error('<atma-logger> invalid cli command --' + key + ' NUMBER');
				return null;
			}
			return level;
		}
	}());
	
		
	// end:source ../src/configurate.js
	return Logger;
}));