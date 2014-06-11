include
	.js('Task.es6')
	.done(function(resp){
		
		include.exports = Class.Collection('Tasks', resp.Task, {
			
			contains: function(task){
				return this.findSame(task) != null;
			},
			
			findSame: function(task){
				if (task instanceof resp.Task === false) 
					task = new resp.Task(task);
					
				return this.first(x => task.isEqual(x));
			}
		})
	})