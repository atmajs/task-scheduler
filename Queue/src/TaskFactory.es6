include
	.use('Model.Task', 'Model.Tasks')
	.js('watcher/Time.es6::TimeWatcher')
	.done(function(resp, Task, Tasks){
		
		var TimeWatcher = resp.TimeWatcher;
		var TaskFactory = include.exports = Class('Queue.TaskFactory', {
			
			Static: {
				ensureTask: function(task){
					var dfr = new Class.Deferred;
					
					
					if (task instanceof Task === false) {
						try {
							task = new Task(task);
						} catch(error){
							return dfr.reject(error);
						}
					}
					
					if (task._id) 
						return dfr.resolve();
					
					Tasks
						.fetch({ name: task.name })
						.fail(dfr.rejectDelegate())
						.done(function(tasks){
							
							var x = tasks.findSame(task);
							if (x) {
								dfr.resolve(x);
								return;
							}
							task
								.save()
								.fail(dfr.rejectDelegate())
								.done(function(){
									
									resp
										.TimeWatcher
										.watch(task)
										;
									
									dfr.resolve(task);
								});
							
						});
					
					return dfr;
				},
				
				TimeWatcher: TimeWatcher
			}
		});
	})
