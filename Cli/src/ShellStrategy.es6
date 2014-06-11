module.exports = Class({
	Construct: function(strategy){
		
		this.routes = new ruta.Collection();
		this.strategy = strategy;
		
		for (var key in strategy){
			this.routes.add(key, strategy[key]);
		}
	},
	
	process: function(path, config) {
		var route = this.routes.get(path),
			dfr = new Class.Deferred;
		
		if (route == null) {
			logger
				.warn('[available endpoints]:'.bold)
				.log(Object.keys(this.strategy))
				;
			
			return dfr.reject('Invalid command `' + path + '`');
		}
		
		var val = route.value;
		
		if (val == null) 
			return dfr.reject('Endpoint is not valid', path);
		
		if (typeof val === 'function') 
			return val(route.current.params, config);
		
		
		if (typeof val.process !== 'function') 
			return dfr.reject('Endpoint has not `process` function');
		
		if (val.meta) {
			var err = Class.validate(route.current.params, val.meta.arguments);
			if (err) 
				return dfr.reject(err)
		}
		
		var result = val.process(route.current.params, config);
		if (!(result && result.done)) 
			return dfr.reject('Action handler should return Deferred object', path);
		
		return result;
	}
});