// Load global atma libraries, when runs not in atma environment

if (typeof include === 'undefined') {
	require('atma-libs/globals-dev');
	require('atma-logger/lib/global-dev');
	require('atma-io');
	require('atma-server');
}

module.exports = require('appcfg')
	.fetch(__dirname + '/config/**.yml')
	.done(function(config){
		if (global.app == null) {
			global.app = {
				config: config
			};
		}
	});