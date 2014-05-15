require('atma-libs/globals-dev');
require('atma-logger/lib/global-dev')
require('atma-io');
require('atma-server');

global.app = atma.server.Application({
		base: '/App/',
		config: {
			port: 5888
		}
	})
	.done(createApp)
	;
	
function createApp(app){
	
	var connect = require('connect'),
		port = process.env.PORT || app.config.port || 5888;

	var server = connect()
		.use(app.responder({
			middleware: [
				connect.query(),
				connect.json()
			]
		}))
		.use(connect.static(__dirname))
		.listen(port);
	
	
	app.lib.Queue.Socket.listen(server);
	app.lib.Worker.Worker.connect(app.config);
	
	logger.log('Listen', app.config.port);

}
