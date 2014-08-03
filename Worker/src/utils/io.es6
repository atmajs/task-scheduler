var io_connect,
	io_clean
	;
	init();
	
include.exports = {
	connect: io_connect,
	clean: io_clean
};

function init(){
	
	var dfr, socket;
	
	io_clean = function(){
		if (socket) 
			socket.disconnect();
		
		socket = null;
		dfr = null;
	};
	
	io_connect = function(config){
		if (dfr) 
			return dfr;
		
		dfr = new Class.Deferred();
		
		var client = require('socket.io-client'),
			port = config.port || 5811,
			host = config.host || 'http://localhost',
			url = config.url
		
		if (url == null) 
			url = host + ':' + port;
		
		url += '/task-scheduler-worker';
		socket = client(url, {
			timeout: 1000,
			reconnection: false
		});

		socket
			.on('connect', function() {
				dfr.resolve(socket);
			})
			.on('connect_timeout', function(){
				socket.removeAllListeners();
				dfr && dfr.reject(`Timeout port: ${port}`);
			})
			.on('connect_error', function(){
				socket.removeAllListeners();
				dfr && dfr.reject(`Timeout port: ${port}`);
			})
			.on('error', function(error) {
				socket.removeAllListeners();
				dfr && dfr.reject(error);
			});
			
		return dfr;
	};
}