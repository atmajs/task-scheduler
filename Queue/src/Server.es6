include
	.js('./WorkerSocket.es6', './TaskQueue.es6')
	.use('Logger')
	.done(function(resp, log){
		
		include.exports = new (Class({
			Base: Class.EventEmitter,
			get workerCount() {
				return app.webSockets.clients(nsp_WORKER).length;
			},
			
			listen: function(){
				app
					.webSockets
					.registerHandler(nsp_WORKER, (socket, io) => {
						triggerStatus();
						socket.on('disconnect', triggerStatus);
						new resp.WorkerSocket(socket, io);
					})
					;
				var triggerStatus = () => {
					this.trigger('workerCountChanged', this.workerCount);
				};
			},
			
			getWorkersStatus: Class.Deferred.create(function(dfr){
				app.webSockets.emit(
					nsp_WORKER
					, 'getStatus'
					, dfr.pipeCallback()
				);
			})
		}));
		resp.TaskQueue.on('hasNewTasks', () =>
			app.webSockets.emit(nsp_WORKER, 'hasNewTasks')
		);
		
		var nsp_WORKER = resp.WorkerSocket.socket_NAMESPACE;
	});
