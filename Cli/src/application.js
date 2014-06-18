var resume = include.pause(),
	base = include.base.replace('Cli/', 'App/');
	
global.app = require('atma-server')
	.Application({
		configs: [
			'../config/root.yml',
			'../App/server/config/**.yml',
			//include.base + '../config/root.yml',
			//include.base + '../App/server/config/**.yml',
		],
		config: {
			base: base
		}
	})
	.done(function(app){
		logger.log(app.config.mongo);
		resume();
	})
	;

