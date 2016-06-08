module.exports = require('../root-app')
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
			.done(Start);
	});

function Start(app){
	/*
	 * Application library Modules: @see ./server/config/env/server.yml
	 */
	var Lib = app.lib;
	
	app
		.processor({
			
			before: [
				$L.jsonLang(app.config.i18n)
			],
			/*
			 * this middleware pipeline will be executed only
			 * if application finds any endpoint (subapp | handler | service | page)
			 */
			middleware: [
				require('body-parser').json(),
				$L.middleware(app.config.i18n),
				atma.server.middleware.query
			],
			
			/*
			 * no endpoints or noone has ended the response
			 */
			after: [
				atma.server.middleware.static
			]
		})
		.listen()
	
	Lib.Queue.Server.Instance(this);
		
	if (app.config.embedWorker) 
		Lib.Worker.connect(app.config);
	
	logger.log('Queue server started on', app.config.port);
	
	if (process.send) 
		process.send('ok');
}

process.on('SIGINT', function Shutdown(){
	process.exit(0);
});