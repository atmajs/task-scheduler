
include
	.use('Utils')
	.js('IExecutor.es6')
	.done(function(resp, Utils){
		
		include.exports = Class('Executor.SrcExecutor', {
			Base: resp.IExecutor,
			name: 'src',
			Static: {
				canHandle: function(data){
					return 'src' in data;
				},
			},
			process: function(app, task){
				this.defer();
				try {
					eval(this.script);
				} catch(error){
					logger.error(error);
				}
				return this.resolve();
			}
		});
	});
