include
	.js('is.js')
	.done(function(resp){
		include.exports = {
			isEqual: _deepEqual,
			typeof: obj_typeof,
			setProperty: function(){
				
			},
			getProperty: function(obj, property){
				var chain = property.split('.'),
					imax = chain.length,
					i = -1;
				while ( ++i < imax ) {
					if (obj == null) 
						return null;
		
					obj = obj[chain[i]];
				}
				return obj;
			},
			setProperty: function(obj, property, value) {
				var chain = property.split('.'),
					imax = chain.length - 1,
					i = -1,
					key;
				while ( ++i < imax ) {
					key = chain[i];
					if (obj[key] == null) 
						obj[key] = {};
		
					obj = obj[key];
				}
				obj[chain[i]] = value;
			}
		};
		
		var is = resp.is;
		function _deepEqual(a, b) {
			
			if (a == null || b == null) 
				return a == b;
		
			if (a === b) 
				return true;
			
			if (is.Arguments(a)) 
				a = _Array_slice.call(a);
			
			if (is.Arguments(a)) 
				a = _Array_slice.call(a);
				
			
			var AType = obj_typeof(a);
			
			switch(AType){
				case 'Number':
				case 'Boolean':
				case 'String':
					return a == b;
				
				case 'RegExp':
				case 'Date':
					return (a).toString() === (b).toString();
			}
			
			if (is.Buffer(a) && is.Buffer(b)) {
				if (a.length != b.length)
					return false;
			 
				for (var i = 0; i < a.length; i++) {
				  if (a[i] != b[i])
					return false;
				}
			 
				return true;
			}
			
			if (!is.Object(a) && !is.Object(b)) 
				return a === b;
			
			return obj_equiv(a, b);
		}
		
		function obj_typeof(x) {
			return Object
				.prototype
				.toString
				.call(x)
				.replace('[object ', '')
				.replace(']', '');
		}
		
		function obj_equiv(a, b) {
			
			var ka = obj_keys(a).sort(),
				kb = obj_keys(b).sort(),
				key, i;
		
			if (ka.length != kb.length)
				return false;
			
			i = ka.length;
			while ( --i !== -1) {
				if (ka[i] != kb[i])
					return false;
			}
			
			i = ka.length
			while (--i !== -1) {
				key = ka[i];
				
				if (!_deepEqual(a[key], b[key]))
					return false;
			}
			
			return true;
		}
	});
