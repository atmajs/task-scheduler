include
	.use('Model', 'Logger')
	.js('../utils/io.es6::IoUtils')
	.done(function(resp, Model, log){

		var Socket = include.exports = Class({
			Base: Class.EventEmitter,
			Construct: function(socket){
				this.socket = socket;
				
				socket
					.on('hasNewTasks', () =>
						
						this
							.requestTask()
							.done((app, task) =>
								  this.trigger('task:run', app, task)
							)
							
					)
					.on('task:run', (app, historyTask, done) => {
						this.trigger('task:run', app, historyTask);
						done(true);
					});
			},
			
			Static: {
				connect: function(config){
					var dfr = new Class.Deferred;
					resp
						.IoUtils
						.connect(config)
						.fail(dfr.rejectDelegate())
						.done(function(socket){
							log.trace('Worker Socket | connected'.green)
							dfr.resolve(new Socket(socket));
						});
					
					return dfr;
				}
			},
			
			requestTask: function(){
				var dfr = new Class.Deferred;
				
				this.socket.emit('task:pluck', 'workerDummy', function(app, task){
					if (task == null) {
						dfr.reject('empty');
						return;
					}
					
					dfr.resolve(app, new Model.HistoryTask(task));
				});
				
				return dfr;
			},
			
			log: function(historyTask, message){
				var dfr = new Class.Deferred;
				this.socket.emit(
					'task:log'
					, historyTask.toJSON()
					, message
					, dfr.resolveDelegate()
				);
				return dfr;
			},
			complete: function(historyTask, workerInfo){
				var dfr = new Class.Deferred;
				this.socket.emit(
					'task:completed'
					, historyTask.toJSON()
					, workerInfo
					, dfr.resolveDelegate()
				);
			}
		})		
		
	})
