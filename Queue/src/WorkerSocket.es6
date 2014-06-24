include
	.use('Model', 'Logger')
	.js('TaskQueue.es6')
	.done(function(resp, Model, log){
		
		var WorkerSocket = include.exports = Class({
			Construct: function(socket, io){
				log('Worker Connected'.green.bold);
				
				socket
					.on('task:pluck', function(workerId, done){
						resp
							.TaskQueue
							.pluck(workerId)
							.done(function(historyTask){
								done(null, historyTask.toJSON());
							})
							.fail(done)
							;
					})
					.on('task:completed', function(historyTask, workerInfo, done){
						log(
							'Queue Socket | Task completed'
							, historyTask._id
						);
						resp
							.TaskQueue
							.finish(historyTask._id)
							.always(done)
							;
					})
					.on('task:log', function(historyTask, message, done){
						
						(new Model.HistoryTask(historyTask))
							.log(message)
							.always(done)
							;
					})
					;
			},
			
			Static: {
				socket_NAMESPACE: '/task-scheduler-worker'
			}
		});
		
	});
