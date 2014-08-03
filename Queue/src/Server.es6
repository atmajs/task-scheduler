include
	.js('./WorkerSocket.es6', './TaskQueue.es6')
	.use('Logger')
	.done(function(resp, log){
		resp.TaskQueue.on('hasNewTasks', () => emit('hasNewTasks'));
		
		include.exports = Class({
			Base: Class.EventEmitter,
			
			Construct (app = null, config = null){
				if (_server) 
					return _server;
				
				if (app == null) 
					app = createApp(config);
				
				_server = this;
				_webSocket = app.webSockets;
				_webSocket
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
			
			getWorkersCount () {
				return _webSocket.clients(nsp_WORKER).length;
			},
			
			getWorkersStatus: Class.Deferred.create(dfr =>
				emit('getStatus' , dfr.pipeCallback())
			),
			
			Static: {
				Instance (app = null, config = null) {
					return _server || (_server = new this(app, config));
				}
			}
		});
		
		var nsp_WORKER = resp.WorkerSocket.socket_NAMESPACE,
			_webSocket,
			_server;
			
		function emit(...args){
			_webSocket && _webSocket.emit.apply(_webSocket, [nsp_WORKER, ...args]);
		}
		function createApp(config) {
			var app = require('atma-server')
				.Application({
					config: config,
					configs: null
				});
			app.listen();
			return app;
		}
	});
