// source /src/license.txt
/*!
 * format v0.8.9
 *
 * MIT license
 * http://opensource.org/licenses/MIT
 *
 * (c) 2012, 2014
 */
// end:source /src/license.txt
// source /src/umd-head.js
(function(root, factory) {
	'use strict';

	var _isBrowser = typeof window !== 'undefined' && window.navigator != null,
		_global =  _isBrowser ? window : global,
		_mask;

	if (typeof Mask !== 'undefined')
		_mask = Mask;
	if (typeof mask !== 'undefined') 
		_mask = mask;
		
	if (_mask == null && root)
		_mask = root.mask || (root.atma && root.atma.mask);
	if (_mask == null)
		_mask = _global.mask || (_global.atma && _global.atma.mask);


	function construct() {
		return factory(_global, _mask);
	};

	// Browser OR Node
	var Formatter = construct();
	
	if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') 
		module.exports = Formatter;
	
	if (_isBrowser) 
		window.Formatter = Formatter;
	
	
	return Formatter;

}(this, function(global, mask) {
	'use strict';
// end:source /src/umd-head.js

	// source /src/scope-vars.js
	// library global variables
	// end:source /src/scope-vars.js
	
	
	// source /src/utils/is.js
	var is_Number,
	    is_Date
	    ;
	
	(function(){
	    
	    is_Number = function(x){
	        return typeof x === 'number' && !isNaN(x);
	    };
	    
	    is_Date = function(x){
	      
	        return x != null
	            && typeof x === 'object'
	            && typeof x.toUTCString === 'function'
	            && typeof x.constructor.UTC === 'function'
	            ;
	        
	    };
	    
	}());
	// end:source /src/utils/is.js
	// source /src/utils/obj.js
	var obj_extend,
		obj_getProperty
		;
	
	(function(){
		
		obj_extend = function(target, source) {
			if (target == null) 
				target = {};
			
			if (source == null) 
				return target;
			
			for (var key in source) {
				target[key] = source[key];
			}
			
			return target;
		}
		
		obj_getProperty = function(obj, accessor){
			var value = obj,
				props = accessor.split('.'),
				i = -1,
				length = props.length;
		
			while (value != null && ++i < length) {
				value = value[props[i]];
			}
		
			return value;
		};
		
	}());
	// end:source /src/utils/obj.js
	// source /src/utils/cursor.js
	var cursor_moveToEnd;
	
	(function(){
	
		cursor_moveToEnd = function (str, i, openCharCode, closeCharCode) {
			var stack = 0,
				imax = str.length,
				c;
			
			while(i < imax){
				c = str.charCodeAt(++i);
				if (c === 92) {
					// \ skip nextChar
					i++;
					continue;
				}
				if (c === openCharCode) {
					stack++;
					continue;
				}
				if (c === closeCharCode) {
					if (--stack < 0)
						break;
				}
			}
			
			return i === imax || stack > -1
				? -1
				: i
				;
		};
	}());
	
	// end:source /src/utils/cursor.js
	// source /src/utils/date.js
	var date_format;
	
	(function() {
	
		var _date,
			_cultureInfo /* { MONTH, MONTH_SHORT, DAY, DAY_SHORT } */ ;
	
		date_format = function(date, format, cultureInfo) {
	
			_date = date;
			_cultureInfo = cultureInfo || Lang[lang_isoCode];
	
			format = format
				.replace('Mm', Mm)
				.replace('MMM', MMM)
				.replace('MM', MM)
				.replace('#M', $M)
	
				.replace('yyyy', yyyy)
				.replace('yy', yy)
	
				.replace('dd', dd)
				.replace('#d', $d)
				.replace('Dd', Dd)
				.replace('DDD', DDD)
	
				.replace('HH', HH)
				.replace('hh', hh)
				.replace('#h', $h)
	
				.replace('mm', mm)
				.replace('#m', $m)
	
				.replace('ss', ss)
				.replace('#s', $s)
	
			;
	
			return format;
	
		};
	
		// formatters
		var yyyy,
			yy,
			$M,
			MM,
			Mm,
			MMM,
			$d,
			dd,
			Dd,
			DDD,
			$H,
			HH,
			$h,
			hh,
			$m,
			mm,
			$s,
			ss;
	
		yyyy = function() {
			return _date.getFullYear();
		};
	
		yy = function() {
			return _date.getFullYear() % 100;
		};
	
		$M = function() {
			return _date.getMonth() + 1;
		};
	
		MM = function() {
			return pad(_date.getMonth() + 1);
		};
	
		Mm = function() {
			return _cultureInfo.MONTH_SHORT[_date.getMonth()];
		};
	
		MMM = function() {
			return _cultureInfo.MONTH[_date.getMonth()];
		};
	
		$d = function() {
			return _date.getDate();
		};
	
		dd = function() {
			return pad(_date.getDate());
		};
	
		Dd = function() {
			return _cultureInfo.DAY_SHORT[_date.getMonth()];
		};
	
		DDD = function() {
			return _cultureInfo.DAY_SHORT[_date.getMonth()];
		};
	
		$H = function() {
			return _date.getHours();
		};
	
		HH = function() {
			return pad(_date.getHours());
		};
		hh = HH;
		$h = $H;
	
		$m = function() {
			return _date.getMinutes();
		};
	
		mm = function() {
			return pad(_date.getMinutes());
		};
	
		$s = function() {
			return _date.getSeconds();
		};
	
		ss = function() {
			return pad(_date.getSeconds());
		};
	
	
		// UTILS
	
		function replaceOnce(str) {
	
			var i = 0,
				imax = arguments.length,
				orig = str;
	
			while (++i < imax) {
	
				str = str.replace(arguments[i], arguments[++i]);
				if (str !== orig)
					return str;
			}
	
			return str;
		}
	
		function pad(value) {
			return value > 9 ? value : '0' + value;
		}
	}());
	// end:source /src/utils/date.js
	// source /src/utils/number.js
	var number_format;
	
	(function() {
	
	
	
		number_format = function(number, format, cultureInfo) {
			// { Delimiter, Point }
	
			var NUMBER = cultureInfo == null || cultureInfo.NUMBER == null
					? Lang.$get('NUMBER')
					: cultureInfo.NUMBER
					,
	
				hasDelimiter = !char_isNumber(format.charCodeAt(0)),
				parts, integral, fraction, fractionCount,
				delimiter, point, pointIndex, str
				;
			if (hasDelimiter) {
				delimiter = format[0];
				format = format.substring(1);
	
				if (delimiter === ',')
					// default delimiter - take from culture
					delimiter = NUMBER.Delimiter;
			}
	
	
			parts = format.split('.');
			integral = parts[0];
			fraction = parts.length === 1
				? null
				: parts[1]
				;
	
			fractionCount = fraction == null
				? 0
				: (fraction.length === 0 ? null : fraction.length)
				;
	
			str = fractionCount == null
				? (number).toString()
				: (number).toFixed(fractionCount)
				;
	
			// placeholders
			pointIndex = str.indexOf('.');
			if (pointIndex === -1)
				pointIndex = str.length;
	
			if (integral.length >= pointIndex)
				str = repeat('0', integral.length - pointIndex + 1) + str;
	
			if (fractionCount != null && fractionCount > str.length - pointIndex - 1)
				str = str + repeat('0', fractionCount - (str.length - pointIndex + 1));
	
			if (!hasDelimiter)
				return str.replace('.', NUMBER.Point);
	
			// format integral part
			pointIndex = str.indexOf('.');
	
			if (fraction == null) 
				return number_formatIntegralPart(str, delimiter);
				
			if (pointIndex <= 3)
				return str.replace('.', NUMBER.Point);
	
			return number_formatIntegralPart(str.substring(0, pointIndex), delimiter)
				+ NUMBER.Point
				+ str.substring(pointIndex + 1)
				;
		};
	
	
		function number_formatIntegralPart(str, delimiter) {
			return str
				.replace(/^([\d]{0,2})(([\d]{3})*)$/, function(full, prefix, middle) {
	
				var str = prefix ? prefix + delimiter : '';
	
				return str + middle
					.replace(/([\d]{3})/g, '$1' + delimiter)
					.slice(0, -1);
			});
	
		}
	
		function char_isNumber(charCode) {
	
			return charCode >= 48 && charCode <= 57;
	
		}
	
		function repeat(char_, count) {
			var str = '';
			while (--count > 0)
				str += char_;
			return str;
		}
	
	}());
	// end:source /src/utils/number.js
	// source /src/utils/string.js
	var str_format,
		str_formatWithCulture
	
	(function() {
	
		str_format = function(str /* ... args */ ) {
			return format(str, Array.prototype.slice.call(arguments, 1));
		};
		str_formatWithCulture = function(str, args, culture) {
			return format(str, args, culture);
		};
	
	
		// PRIVAT
		function format(str, args, cultureInfo) {
			var out = '',
				i = 0,
				last = 0,
				lastAccessor = -1,
				x;
	
			while ((i = str.indexOf('{', i)) !== -1) {
	
				if (i > 0 && str.charCodeAt(i - 1) === 92 /* \ */ ) {
	
					out += str.substring(last, i - 1) + '{';
					last = i + 1;
					continue;
				}
	
				out += str.substring(last, i);
				last = i + 1;
				i = cursor_moveToEnd(str, i, 123/*{*/, 125/*}*/);
	
				if (i === -1)
					break;
	
				x = new Interpolator(str.substring(last, i));
				switch(x.accessorType){
					case 'index':
						if (lastAccessor < x.accessor) 
							lastAccessor = x.accessor;
						break;
					case 'property':
						if (lastAccessor === -1) 
							lastAccessor = 0;
						break;
				}
				out += x.process(args, cultureInfo);
				last = i + 1;
			}
	
			if (last < str.length)
				out += str.substring(last);
			
			
			return ++lastAccessor < args.length
				? printf(out, args.slice(lastAccessor))
				: out
				;
		}
		
		
		var Interpolator;
		(function() {
			var cache__ = {};
	
			Interpolator = function(str) {
				if (cache__.hasOwnProperty(str))
					return cache__[str];
	
				cache__[str] = this;
	
				parse(this, str);
			};
	
			Interpolator.prototype = {
				
				/* index|property */
				accessorType: null,
				accessor: null,
				
				
				alignment: null,
				pattern: null,
				pluralizer: null,
	
				process: function(args, cultureInfo) {
					var type = this.accessorType,
						accessor = this.accessor,
						pattern = this.pattern,
						alignment = this.alignment,
						plural = this.pluralizer
						;
					
					var val;
					if ('index' === type) 
						val = args[accessor];
					
					if ('property' === type) 
						val = obj_getProperty(args[0], accessor);
					
					if (val == null)
						return align(alignment, '');
					
					
					if (pattern) {
			
						if (is_Number(val))
							return align(alignment, number_format(val, pattern, cultureInfo));
			
						if (is_Date(val))
							return align(alignment, date_format(val, pattern, cultureInfo));
			
						return align(alignment, (val).toString(pattern, cultureInfo));
					}
					
					if (plural) {
						var str = pluralize(val, plural, cultureInfo);
						return str.indexOf('{') === -1
							? str
							: format(str, args, cultureInfo)
							;
					}
					
					return align(alignment, (val).toString());
				}
			}
	
			/* groups: */
			var i_ACCESSOR_INT = 2,
				i_ACCESSOR_PROP = 3,
				i_ALIGN = 5,
				i_PATTERN = 7,
				i_PLURALIZER = 9;
			
			var rgx = /^((\d+)|([\w\d._]+))(,([-\d]+))?(:(.+))?(;(.+))?$/;
			function parse(instance, str) {
				
				var matches = rgx.exec(str);
				if (matches == null) {
					console.error('Format pattern not matched', str);
					return;
				}
				instance.accessorType = matches[i_ACCESSOR_INT]
					? 'index'
					: 'property'
					;
				
				instance.accessor = instance.accessorType === 'index'
					? parseInt(matches[i_ACCESSOR_INT])
					: matches[i_ACCESSOR_PROP]
					;
				
				instance.alignment = matches[i_ALIGN] || null;
				instance.pattern = matches[i_PATTERN] || null;
				instance.pluralizer = matches[i_PLURALIZER] || null;
			}
			
			// alignment
			function align(alignment, str) {
				if (alignment == null || isNaN(alignment))
					return str;
		
				var count = alignment < 0 ? alignment * -1 : alignment;
		
		
				if (str.length > count)
					return str;
		
				var addon = repeat(' ', (count - str.length));
		
				return alignment < 0 ? str + addon : addon + str;
			}
		
			function repeat(char_, count) {
				var out = '';
				while (--count > -1)
					out += char_;
				return out;
			}
	
		}());
	
		function printf(str, args) {
			var out = str,
				rgx_format = /%s|%d/,
				hasFormat = rgx_format.test(str),
				i = -1,
				imax = args.length,
				x;
			
			while ( ++i < imax ){
				x = args[i];
			
				if (hasFormat === true && (i === 0 || rgx_format.test(out))) {
					out = out.replace(rgx_format, x);
					continue;
				}
	
				if (out !== '')
					out += ' ';
	
				out += x;
			}
			return out;
		}
	}());
	// end:source /src/utils/string.js
	
	
	// source /src/lang/lang.js
	var Lang,
	    lang_isoCode;
	
	(function(){
	
	    lang_isoCode = 'en';
	    Lang = {
	        
	        $register: function(isoCode, data){
	            var obj = this[isoCode] || (this[isoCode] = {});
	            
	            obj_extend(obj, data);
	        },
	        
	        // get cultureInfo for a type NUMBER, MONTH, ..
	        $get: function(type, isoCode){
	            var obj = isoCode == null
	                ? this[lang_isoCode]
	                : (this[isoCode] || this[lang_isoCode])
	                ;
	                
	            return obj[type];
	        },
	        
	        $use: function(isoCode){
	            isoCode = isoCode.toLowerCase();
	            
	            if (this[isoCode] == null) {
	                console.error('<FormatterLib> Language is not defined', isoCode);
	                return;
	            }
	            lang_isoCode = isoCode;
	        }
	    };
	    
	    // source en.js
	    (function() {
	    
	    	var MONTH = [
	    			'January',
	    			'February',
	    			'March',
	    			'April',
	    			'May',
	    			'June',
	    			'July',
	    			'August',
	    			'September',
	    			'October',
	    			'November',
	    			'December',
	    	];
	    
	    	var MONTH_SHORT = [
	    			'Jan',
	    			'Feb',
	    			'Mar',
	    			'Apr',
	    			'May',
	    			'June',
	    			'July',
	    			'Aug',
	    			'Sept',
	    			'Oct',
	    			'Nov',
	    			'Dec',
	    	];
	    
	    	var DAY = [
	    			'Sunday',
	    			'Monday',
	    			'Tuesday',
	    			'Wednesday',
	    			'Thursday',
	    			'Friday',
	    			'Saturday',
	    	];
	    	var DAY_SHORT = [
	    			'Mon',
	    			'Tues',
	    			'Weds',
	    			'Thurs',
	    			'Fri',
	    			'Sat',
	    			'Sun',
	    	];
	    
	    
	    	Lang.$register('en', {
	    		MONTH: MONTH,
	    		MONTH_SHORT: MONTH_SHORT,
	    		DAY: DAY,
	    		DAY_SHORT: DAY_SHORT,
	    
	    		NUMBER: {
	    			Delimiter: ',',
	    			Point: '.'
	    		},
	    		
	    		Pluralize: '1:0; *:1'
	    	});
	    }());
	    // end:source en.js
	    // source de.js
	    (function() {
	    
	    	var MONTH = [
	    			'Januar',
	    			'Februar',
	    			'M�rz',
	    			'April',
	    			'Mai',
	    			'Juni',
	    			'Juli',
	    			'August',
	    			'September',
	    			'Oktober',
	    			'November',
	    			'Dezember',
	    	];
	    
	    	var DAY = [
	    			'Sonntag',
	    			'Montag',
	    			'Dienstag',
	    			'Mittwoch',
	    			'Donnerstag',
	    			'Freitag',
	    			'Samstag',
	    	];
	    
	    
	    	Lang.$register('de', {
	    		MONTH: MONTH,
	    		MONTH_SHORT: MONTH.map(function(x) {
	    			return x.substring(0, 3);
	    		}),
	    		DAY: DAY,
	    		DAY_SHORT: DAY.map(function(x) {
	    			return x.substring(0, 2);
	    		}),
	    
	    		NUMBER: {
	    			Delimiter: '.',
	    			Point: ','
	    		},
	    		
	    		Pluralize: '1:0; *:1'
	    	});
	    }());
	    // end:source de.js
	}());
	
	// end:source /src/lang/lang.js
	
	
	// source /src/format.js
	
	function Formatter(mix) {
	    
	    if (mix == null) 
	        return '';
	    
	    switch(typeof mix){
	        
	        case 'string':
	            return str_format.apply(null, arguments);
	        
	        case 'number':
	            return number_format.apply(null, arguments);
	        
	        case 'object':
	            if (is_Date(mix)) 
	                return date_format.apply(null, arguments);
	            
	            return mix.toString.apply(mix, Array.prototype.slice.call(arguments, 1));
	        
	        default:
	            return '';
	    };
	}
	
	if (mask != null) {
	    mask.registerUtil('format', {
	        arguments: 'parsed',
	        process: Formatter
	    });
	}
	// end:source /src/format.js
	// source /src/exports.js
	Formatter.Lang = Lang;
	
	return Formatter;
	// end:source /src/exports.js
}));