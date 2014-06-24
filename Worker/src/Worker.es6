include
	.use('Logger')
	.js(
		'Runner.es6'
		, 'source/Socket.es6'
	)
	.done(function(resp, log){
		
		var Worker = include.exports = Class({
			Construct: function(source){
				
				this.runner = new resp.Runner(this);
				this.source = source;
				
				this
					.source
					.on('task:run', (app, historyTask) =>
						this.runner.run(app, historyTask)
					);
				this
					.runner
					.on('task:completed', (historyTask, info) =>
						this.source.complete(historyTask, info)
					);
			},
			
			Static: {
				connect: function(config){
					var dfr = new Class.Deferred;
					resp
						.Socket
						.connect(config)
						.fail(function(error){
							var msg = logger.formatMessage(
								'Can`t connect to the master Queue'
								, error
							);
							
							log.error(msg);
							dfr.reject(error, msg);
						})
						.done(function(source){
							log('Connected to server'.green, config.port)
							dfr.resolve(new Worker(source));
						});
					
					return dfr;
				}
			}
		})
	})