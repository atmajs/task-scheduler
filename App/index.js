process.on('SIGINT', shutdownApp);
require('../root-app')
	.done(function(){
		global.app = atma
			.server
			.Application({
				base: __dirname,
				configs: [
					'../config/**.yml',
					'server/config/**.yml'	
				]
			})
			.done(startApp)
	});
	
function startApp(app){
	var connect = require('connect'),
		port = app.config.port,
		// Application library Modules: @see ./server/config/env/server.yml
		Lib = app.lib,
		
		server = require('http').createServer(
				app.processor({
					middleware: [
						connect.query(),
						connect.json()
					],
					after: [
						atma.server.StaticContent.respond	
					]
				})
			)
			.listen(port)
			;
	
	//Lib.Queue.Server.listen(server);
	//if (app.config.embedWorker) 
	//	Lib.Worker.connect(app.config);
	
	logger.log('Queue server started on', port);
	
	if (process.send) 
		process.send('ok');
		
	if (app.config.debug) {
		app.autoreload(server);
	}
}
function shutdownApp(){
	process.exit(0);
}