include
	.use('Model.Task')
	.done((resp, Task) => {
		mask.registerBinding('taskTriggerBinder', {
			 objectWay: {
				get: function(task){
					return task.trigger && task.trigger.toJSON() || '';
				},
				set: function(task, property, value){
					task.trigger = Task.parseTrigger(value);
				}
			}
		})
	});