
include
	.use('Utils')
	.js('IExecutor.es6')
	.done(function(resp, Utils){
		
		include.exports = Class('Executor.ScriptExecutor', {
			Base: resp.IExecutor,
			name: 'script',
			Static: {
				canHandle: function(data){
					return 'script' in data;
				},
			},
			process: function(app, task){
				this.defer();
				Utils.execScript(app.config, this.src, (err, ...args) => {
					if (err) {
						this.reject(err);
						return;
					}
					this.resolve(...args);
				});
				return this;
			},
			
			isEqual: function(exec){
				return exec != null && this.script === exec.script;
			}
		});
	});
