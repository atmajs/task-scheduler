(function(){

	
	var resume = include.pause(),
		base = include.base.replace('Cli/', 'App/');
		
	global.app = require('atma-server')
		.Application({
			configs: base + 'server/config/**.yml',
			config: {
				base: base,
				ENV: 'test'
			}
		})
		.done(resume)
		;

	
	
}());
