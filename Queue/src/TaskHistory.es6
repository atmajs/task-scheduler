include
	.use('Model')
	.js('TaskFactory.es6')
	.done(function(resp, Model){
		
		var TaskFactory = resp.TaskFactory,
			HistoryTask = Model.HistoryTask
			;
		
		include.exports = new (Class.Collection(HistoryTask, {
			
			Base: Class.Serializable,
			Store: Class.MongoStore.Collection('task-history'),
			
			
			add: function(task, worker){
				
				return this
					.push(HistoryTask.create(task))
					.last()
					.save()
					;
			},
			
			finish: function(id){
				var h = this.first(x => id === x._id.toString());
				if (h == null) 
					h = new HistoryTask({ _id: id });
				
				this.remove(h)
				return h.finish();
			}
		}));
		
		
		
	});
