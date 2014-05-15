include
	.js(
		'ScriptExecutor.es6'
	)
	.done(function(resp){
		
		include.exports = function(exec){
			
			for (var key in resp){
				if (resp[key].canHandle(exec)) 
					return new resp[key](exec);
			}
			
			return null;
		}
	})