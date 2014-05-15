include
	.js('WorkerSocket.es6', 'TaskQueue.es6')
	.done(function(resp){
		
		include.exports = {
			listen: function(httpServer){
				var _io = global.io;
				delete global.io;
		
				server_io = require('socket.io').listen(httpServer, {
					'log level': 2
				});
		
				global.io = _io;
				
				server_io
					.of(socket_NAMESPACE)
					.on('connection', createHandler)
			}
		};
		
		var socket_NAMESPACE = resp.WorkerSocket.socket_NAMESPACE,
			server_io;
			
		function createHandler(socket) {
			new resp.WorkerSocket(socket, io);
		}
		
		resp.TaskQueue.on('hasNewTasks', function(){
			emit('hasNewTasks');
		});
		
		
		
		function emit(){
			if (server_io == null) {
				logger.error('Queue Socket | Socket server is not yet started');
				return;
			}
			
			var socket = server_io.of(socket_NAMESPACE),
				clients = socket.clients()
				;
			
			if (clients.length === 0) {
				logger.error('Queue Socket | No workers');
				return;
			}
			
			
			socket.emit.apply(socket, arguments);
		}
	})
