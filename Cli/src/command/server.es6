include
	.use('Model', 'CliUtils')
	.done(function(resp, Model, Utils){
		var cwd = new net.Uri(include.location)
			.combine('../../../')
			.toLocalFile()
			;
		
		include.exports = {
			'start': {
				meta: {
					description: 'Start queue server'
				},
				process: function(params, config){
					return Utils
						.socket
						.ensurePort(app.config.port)
						.pipe(
							() => Utils.forever.startServer(cwd),
							() => "Socket is already busy at " + app.config.port
						);
				}
			},
			'restart': {
				meta: {
					description: 'Start queue server'
				},
				process: function(params, config){
					return Utils.forever.startServer(cwd);
				}
			},
			'stop': {
				meta: {
					description: 'Stop queue server'
				},
				process: function(){
					return Utils
						.socket
						.ensurePort(app.config.port)
						.pipe(
							() => "Socket is not running at " + app.config.port,
							() => Utils.forever.stopServer(cwd)
						);
				}
			}
		};
	})
