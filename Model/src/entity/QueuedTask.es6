include
	.use('Utils')
	//.js('Task.js')
	.done(function(resp, Utils){
		
		include.exports = Class('QueuedTask', {
			Base: Class.Serializable,
			
			_id: null,
			_task: null,
			
			// taskID
			tid: null,
			date: null,
			
			
			Static: {
				create: function(task){
					
					return new this({
						tid: task._id.toString(),
						date: new Date,
						
						_task: task
					});
				}
			}
		});
	})
