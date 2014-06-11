include
	.use('Model')
	.js('TaskFactory.es6', 'TaskHistory.es6')
	.done(function(resp, Model){
		
		var TaskFactory = resp.TaskFactory,
			TaskHistory = resp.TaskHistory
			;
		var QueuedTask = Model.QueuedTask,
			Tasks = Model.Tasks
			;
		
		include.exports = new (Class.Collection('Queue.TaskQueue', QueuedTask, {
			
			Extends: [
				Class.Serializable,
				Class.EventEmitter
			],
			Store: Class.MongoStore.Collection('task-queue'),
			
			Construct: function(){
				TaskFactory.TimeWatcher.on('time', this.add);
			},
			
			Self: {
				add: function(task){
					logger.log('TaskQueue| Push `bold<%s>`'.color, task.name);
					
					var taskAdded = () => {
						logger.log(
							'TaskQueue: Task, ready for execution `bold<%s>`'.color
							, task.name
						);
						this.trigger('hasNewTasks', this);
					}
					
					return this
						.push(QueuedTask.create(task))
						.last()
						.save()
						.done(taskAdded)
						;
				}
			},
			
			pluck: function(worker){
				var dfr = new Class.Deferred;
				if (this.length === 0) 
					return dfr.reject('empty');
				
				var scheduled = this
					.shift()
					.del()
					.fail(error =>
						logger.error('Queuedtask | Del error', error)
					);
				TaskHistory
					.add(scheduled._task, worker)
					.pipe(dfr)
					;
					
				return dfr;
			},
			
			finish: function(historyTaskID){
				return TaskHistory.finish(historyTaskID);
			},
			
			restore: function(){
				var dfr = new Class.Deferred,
					
					queuedTasksLoaded = queuedTasks => {
						if (queuedTasks.length === 0) {
							dfr.resolve(this);
							return;
						}
						
						logger.warn(
							'There are still tasks in the queue.',
							'Last application-run terminated unexpectedly.'
						);
						
						var ids = queuedTasks
							.toArray()
							.map(x => Class.MongoStore.createId(x.tid));
						
						loadTasks(ids);
					},
					loadTasks = ids => {
						Tasks.fetch({
							_id: { $in: ids }
						})
						.done(addTasks)
						.fail(error => 
							onError('Queue Restore - get tasks error -', error)
						);
					},
					addTasks = tasks => {
						tasks.each(x => this.push(QueuedTask.create(x)));
						dfr.resolve(this);
					},
					onError = (message, error) => {
						logger.error(message, error);
						dfr.reject(error);
					};
				this
					.fetch()
					.done(queuedTasksLoaded)
					.fail(error => 
						onError('Queue Restore - get queue error - ', error)
					);
					
				return dfr;
			}
		}));
		
		
		
	});
