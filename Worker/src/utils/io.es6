var io_connect,
	io_clean
	;
	init();
	
include.exports = {
	connect: io_connect,
	clean: io_clean
};

function init(){
	
	var dfr, client;
	
	io_clean = function(){
		
		if (dfr == null) 
			return;
		
		if (dfr._resolved == null) {
			dfr = null;
			return;
		}
		
		var socket = dfr._resolved[0];
		
		socket.socket.disconnectSync();
		dfr = null;
	};
	
	io_connect = function(config){
		
		if (dfr) 
			return dfr;
		
		dfr = new Class.Deferred();
		
		
		if (client == null) 
			client = getClient();
			
		var port = config.port,
			host = config.host,
			url = config.url
		
		if (url == null) 
			url = (host || 'http://localhost') + ':' + (port || 5811)
		
		url += '/task-scheduler-worker';
		
		var socket = client.connect(url, {
			'connect timeout': 2000,
			'force new connection': true
		});
		
		socket
			.on('connect', function() {
				dfr.resolve(socket)
			})
	
			.on('error', function(error) {
				
				socket.socket.disconnectSync();
				socket.socket.removeAllListeners();
				
				dfr && dfr.reject(error);
			})
			
		
		return dfr;
	};
	
	
	function getClient(){
		//@ HACKY - io client workaround
		
		var _io = global.io;
		delete global.io;
		
		var client = require('socket.io-client');
		
		global.io = _io;
		
		return client;
	}
	
}