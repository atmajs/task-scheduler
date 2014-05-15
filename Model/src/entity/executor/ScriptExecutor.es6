
include
	.use('Utils')
	.js('IExecutor.es6')
	.done(function(resp, Utils){
		
		include.exports = Class('Executor.ScriptExecutor', {
			Base: resp.IExecutor,
			Static: {
				canHandle: function(data){
					if (data.src || data.script) 
						return true;
					
					return false;
				},
			},
			
			
			process: function(app, task){
				
				this.defer();
				
				if (this.src) 
					this._processBySource(app, task);
					
				else if (this.script) 
					this._processByScript(app, task);
				
				else
					this.reject('`src` or `script` expected');
					
				return this;
			},
			
			
			isEqual: function(exec){
				return exec != null && (this.src === exec.src || this.script === exec.script);
			},
			
			_processBySource: function(app, task){
				Utils.execScript(app.config, this.src, (error, ...args) => {
					if (error) {
						this.reject(error);
						return;
					}
					
					this.resolve.apply(this, args);
				});
			},
			
			_processByScript: function(app, task){
				try {
					eval(this.script);
					
				} catch(error){
					logger.error(error);
				}
				this.resolve();
			},
			
		});
	});
