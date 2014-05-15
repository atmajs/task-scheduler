include.exports = {
	
	Array: function(ar) {
		return Array.isArray(ar);
	},
	
	Boolean: function(arg) {
		return typeof arg === 'boolean';
	},
	
	Null: function(arg) {
		return arg === null;
	},
	
	NullOrUndefined: function(arg) {
		return arg == null;
	},
	
	Number: function(arg) {
		return typeof arg === 'number';
	},
	
	String: function(arg) {
		return typeof arg === 'string';
	},
	
	Symbol: function(arg) {
		return typeof arg === 'symbol';
	},
	
	Undefined: function(arg) {
		return arg === void 0;
	},
	
	RegExp: function(re) {
		return obj_typeof(re) === 'RegExp';
	},
	
	Object: function(arg) {
		return typeof arg === 'object' && arg !== null;
	},
	
	Date: function(d) {
		return obj_typeof(d) === 'Date';
	},
	
	Error: function(e) {
		return obj_typeof(e) === 'Error' || e instanceof Error;
	},
	
	Function: function(arg) {
		return typeof arg === 'function';
	},
	
	Buffer: function(buff){
		if (typeof Buffer === 'undefined') 
			return false;
		
		return buff instanceof Buffer;
	},
	
	Arguments: function(x){
		return obj_typeof(x) === 'Arguments';
	},
	
	Primitive: function(arg) {
		return arg === null
			|| typeof arg === 'boolean'
			|| typeof arg === 'number'
			|| typeof arg === 'string'
			|| typeof arg === 'symbol'
			|| typeof arg === 'undefined'
			;
	}
};

function obj_typeof(x) {
	return Object.prototype.toString.call(x).replace('[object ', '').replace(']', '');
};