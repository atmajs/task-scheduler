if (typeof include === 'undefined') {
	require('atma-libs/globals-dev');
	require('atma-logger/lib/global-dev')
	require('atma-io');
	require('atma-server');
}

process.on('SIGINT', shutdownApp)

global.app = atma.server.Application({
		base: '/App/'
	})
	.done(createApp)
	;
	
function createApp(app){
	var connect = require('connect'),
		port = app.config.port;

	var server = connect()
		.use(app.responder({
			middleware: [
				connect.query(),
				connect.json()
			]
		}))
		.use(atma.server.staticContent.respond)
		.listen(port);
	
	
	app.lib.Queue.Server.listen(server);
	
	if (app.config.hasWorker) 
		app.lib.Worker.Worker.connect(app.config);
	
	logger.log('Listen', app.config.port);
}
function shutdownApp(){
	require('fs').appendFileSync('./in.txt', 'SHUTDOWN');
	process.exit(0);
}