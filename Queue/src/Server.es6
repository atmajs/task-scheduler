include
	.js('WorkerSocket.es6', 'TaskQueue.es6')
	.use('Logger')
	.done(function(resp, log){
		
		
		include.exports = {
			get workerCount() {
				return app.webSockets.clients(socket_NAMESPACE).length;
			},
			listen: function(){
				
				app
					.webSockets
					.registerHandler(socket_NAMESPACE, resp.WorkerSocket)
					;
			}
		};
		resp.TaskQueue.on('hasNewTasks', () =>
			app.webSockets.emit(socket_NAMESPACE, 'hasNewTasks')
		);
		
		var socket_NAMESPACE = resp.WorkerSocket.socket_NAMESPACE;
	});
