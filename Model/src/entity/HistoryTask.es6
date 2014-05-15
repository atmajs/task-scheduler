include
	.use('Utils')
	.js('Task.es6')
	.done(function(resp, Utils){
		
		var HistoryTask = include.exports = Class('HistoryTask', {
			Base: Class.Serializable({
				start: Date,
				end: Date,
				task: Class('Task')
			}),
			
			Construct: function(){
				if (this.logs == null) 
					this.logs = [];
			},
			
			_id: null,
			state: 0,
			task: null,
			start: null,
			end: null,
			logs: null,
			error: null,
			
			Static: {
				state_Active: 0,
				state_Finished: 1,
				state_Errored: 2,
				
				create: function(task){
					if (task instanceof resp.Task === false) 
						task = new resp.Task(task);
						
					return new this({
						task: task,
						start: new Date
					});
				}
			},
			
			log: function(message){
				return this.patch({
					$push: {
						logs: message
					}
				});
			},
			finish: function(){
				return this.patch({
					$set: {
						state: HistoryTask.state_Finished,
						end: new Date
					}
				});
			}
		});
	})
