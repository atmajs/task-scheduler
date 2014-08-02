include
	.use('Model.Task', 'Model.Tasks')
	.js('watcher/Time.es6::TimeWatcher')
	.done(function(resp, Task, Tasks){
		
		var TimeWatcher = resp.TimeWatcher;
		var TaskFactory = include.exports = Class('Queue.TaskFactory', {
			
			Static: {
				get watchingCount () {
					return TimeWatcher.collection.length
				},
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
					
					find(task)
						.pipe(dfr, 'fail')
						.done(function(x){
							if (x != null) {
								// exists
								dfr.resolve(x);
								return;
							}
							// create new
							task
								.save()
								.done((task) => 
									TimeWatcher.watch(task)
								)
								.pipe(dfr)
								;
						})
					return dfr;
				},
				
				removeTask: function(task){
					var dfr = new Class.Deferred;
					TimeWatcher.unwatch(task);
					
					if (task instanceof Task === false) 
						task = new Task(task);
						
					if (task._id) {
						task.del().pipe(dfr);
						return dfr;
					}
					
					find(task)
						.pipe(dfr, 'fail')
						.done(x =>
							x && x.del().pipe(dfr) || dfr.resolve(task)
						);
					return dfr;
				},
				
				restore: function(){
					return Tasks
						.fetch()
						.done( tasks =>
							tasks.each(task => TimeWatcher.watch(task))
						);
				},
				
				TimeWatcher: TimeWatcher
			}
		});
		
		
		/* resolve NULL when not found */
		function find(task) {
			var dfr = new Class.Deferred;
			Tasks
				.fetch({ name: task.name })
				.fail(dfr.rejectDelegate())
				.done(function(tasks){
					return dfr.resolve(tasks.findSame(task));
				});
			return dfr;
		}
	})
