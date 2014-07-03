include
	.js('WorkerSocket.es6', 'TaskQueue.es6')
	.use('Logger')
	.done(function(resp, log){
		
		include.exports = {
			listen: function(httpServer){
				var _io = global.io;
				delete global.io;
		
				var socketIO = require('socket.io');
				server_io = socketIO(httpServer, {
					'log level': 2
				});
				
				
		
				global.io = _io;
				
				server_io
					.of(socket_NAMESPACE)
					.on('connection', socket =>
						new resp.WorkerSocket(socket, server_io)
					);
			}
		};
		resp.TaskQueue.on('hasNewTasks', () => emit('hasNewTasks'));
		
		var socket_NAMESPACE = resp.WorkerSocket.socket_NAMESPACE,
			server_io;
		
		function emit(){
			if (server_io == null) {
				log.error('Queue Socket | Socket server is not yet started');
				return;
			}
			
			var socket = server_io.of(socket_NAMESPACE),
				clients = socket.clients();
			
			if (clients.length === 0) {
				log.error('Queue Socket | No workers');
				return;
			}
			
			socket.emit.apply(socket, arguments);
		}
	})
