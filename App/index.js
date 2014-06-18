process.on('SIGINT', shutdownApp)
require('../package')
	.done(function(rootConfig){
		global.app = atma
			.server
			.Application({
				base: __dirname,
				configs: [
					rootConfig.toJSON(),
					'server/config/**.yml'	
				]
			})
			.done(startApp)
	});
	
function startApp(app){
	var connect = require('connect'),
		port = process.env.PORT || app.config.port,
		// Application library Modules: @see ./server/config/env/server.yml
		Lib = app.lib,
		
		server = connect()
			.use(app.responder({
				middleware: [
					connect.query(),
					connect.json()
				]
			}))
			.use(atma.server.StaticContent.respond)
			.listen(port)
			;
	
	Lib.Queue.Server.listen(server);
	if (app.config.embedWorker) 
		Lib.Worker.connect(app.config);
	
	logger.log('Listen', port);
}
function shutdownApp(){
	process.exit(0);
}