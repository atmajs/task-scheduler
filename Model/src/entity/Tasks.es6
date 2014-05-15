include
	.js('Task.es6')
	.done(function(resp){
		
		include.exports = Class.Collection('Tasks', resp.Task, {
			
			contains: function(task){
				return this.findSame(task) != null;
			},
			
			findSame: function(task){
				return this.first((x) => task.isEqual(x));
			}
		})
	})