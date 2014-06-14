include
	.js(
		'command/*.es6.package::Commands',
		'help.es6',
		'ShellStrategy.es6'
	)
	.done(function(resp){
		
		
		include.exports = {
			process: function(command, args, config){
				if (typeof command === 'string' && command.indexOf(' ') !== -1) {
					command = command.split(' ');
				}
				if (Array.isArray(command)) {
					config = args;
					args = command.slice(1);
					command = command[0];
				}
				
				var dfr = new Class.Deferred,
					msg = resp.help.format(resp.Commands, command, args);
				if (msg != null) 
					return dfr.resolve(msg);
				
				var strategy = resp.Commands[command];
				if (strategy == null) {
					var msg = logger.formatMessage(
						'Unknown command: `%s`. All commands: '
						, command || 'undefined'
						, Object.keys(resp.Commands)
					);
					return dfr.reject(msg);
				}
				
				new resp
					.ShellStrategy(strategy)
					.process(
						ruta.$utils.pathFromCLI(args)
						, config
					)
					.pipe(dfr);
			
				return dfr;
			},
			execute: function(command, args, config){
				
				this
					.process(command, args, config)
					.fail( error => logger.error(error) )
					.done( message => message && logger.log(message) )
					.always(function(){
						var msg = this._resolved
							? 'Ok'.green
							: 'Fail'.red
							;
						logger.log(msg);
						
						Class
							.MongoStore
							.resolveDb()
							.done(db => db.close());
					});
					
			},
		};
		
		
		
	})
