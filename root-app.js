require('./root-env');
module.exports = atma
	.server
	.Application({
		configs: 'file://' + __dirname + '/config/**.yml'
	})
	.done(function(app){
		
		global.app = app;
		
		
		if (app.config.release) {
			
			logger.cfg({
				color: 'none',
				transport: {
					type: 'fs',
					directory: 'logs/',
					handleExceptions: true,
					interceptStd: true
				}
			});
		}
	});
