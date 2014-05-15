include
	.use('Model')
	.js('TaskFactory.es6', 'TaskHistory.es6')
	.done(function(resp, Model){
		
		var TaskFactory = resp.TaskFactory,
			TaskHistory = resp.TaskHistory
			;
		var _emitter = new Class.EventEmitter;
		
		include.exports = new (Class.Collection('Queue.TaskQueue', Model.QueuedTask, {
			
			Base: Class.Serializable,
			Store: Class.MongoStore.Collection('task-queue'),
			
			Construct: function(){
				TaskFactory.TimeWatcher.on('time', this.add);
			},
			
			Self: {
				add: function(task){
					logger.log('TaskQueue| Push `bold<%s>`'.color, task.name);
					return this
						.push(Model.QueuedTask.create(task))
						.last()
						.save()
						.always(this.taskAdded)
						;
				},
				
				taskAdded: function(){
					logger.log(
						'TaskQueue: Task, ready for execution `bold<%s>`'.color
						, this.last()._task.name
					);
					_emitter.trigger('hasNewTasks', this);
				},
			},
			
			on: _emitter.on.bind(_emitter),
			off: _emitter.off.bind(_emitter),
			
			pluck: function(worker){
				var dfr = new Class.Deferred;
				if (this.length === 0) 
					return dfr.reject('empty');
				
				
				var scheduled = this.shift().del();
				TaskHistory
					.add(scheduled._task, worker)
					.done(dfr.resolveDelegate())
					.fail(dfr.rejectDelegate())
					;
					
				return dfr;
			},
			
			finish: function(historyTaskID){
				return TaskHistory.finish(historyTaskID);
			},
			
			restore: function(){
				var queue = this,
					dfr = new Class.Deferred
					;
				this
					.fetch()
					.done(function(queuedTasks){
						if (queuedTasks.length === 0) {
							dfr.resolve(queue);
							return;
						}
						
						logger.warn(
							'There are still tasks in the queue.',
							'Last application-run terminated unexpectedly.'
						);
						
						var ids = queuedTasks
							.toArray()
							.map(function(x){
								return Class.MongoStore.createId(x.tid);
							});
						
						Model
							.Tasks
							.fetch({
								_id: {
									$in: ids
								}
							})
							.done(function(tasks){
								
								if (tasks.length !== ids.length) {
									logger
										.error('Queue Restore - some tasks were removed')
										.error('Expected: %d; Got: %d, ', ids.length, tasks.length)
										;
								}
								
								var queuedTask = Model.QueuedTask.create(task);
								tasks.each((x) => queue.push(queuedTask));
								
								dfr.resolve(queue);
							})
							.fail(function(error){
								logger.error('Queue Restore - get tasks error -', error);
								dfr.reject(error);
							})
					})
					.fail(function(error){
						logger.error('Queue Restore - get queue error - ', error);
						dfr.reject(error);
					});
				
				return dfr;
			}
		}));
		
		
		
	});
