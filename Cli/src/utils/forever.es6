include.exports = {
	stopServer: function(appdir){
		return fork(appdir, script_SERVER, ['--stop']);
	},
	startServer: function(appdir){
		return fork(appdir, script_SERVER, ['--start']);
	}
}

var script_SERVER = 'Cli/bin/server.js';
function fork(appdir, script, args) {
	var dfr = new Class.Deferred,
		path = net.Uri.combine(appdir, script),
		child = require('child_process').fork(path, args || [], {
			detached: true,
			stdio: 'ignore',
			cwd: appdir
		});
  
	child.on('error', logger.error);
	child.on('exit', (code, signal) => {
		if (code !== 0) {
			dfr.reject(logger.formatMessage(
				'Server exited with the code bold<%s>'.color
				, code
			));
		}
		
		dfr.resolve('Child stopped');
	});
	child.on('message', msg => {
		if ('ok' === msg) {
			child.disconnect();
			child.unref();
			dfr.resolve('');
			return;
		}
		if ('fail' === msg) {
			child.disconnect();
			child.unref();
			dfr.reject('');
			return;
		}
		
		if (/^\[std/.test(msg)) {
			logger.log(msg);
			return;
		}
		
		logger.log(msg);
	});
	
	return dfr;
}