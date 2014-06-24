include
	.use('Model.HistoryTask', 'Logger')
	.done(function(resp, HistoryTask, log){
		
		include.exports = Class('Worker.Runner', {
			Base: Class.EventEmitter,
			/*
			 *	- socket: server `task-queue` connection
			 */
			Construct: function(worker){
				this.stack = [];
				this.worker = worker;
			},
			
			config: {
				parallel: 10,
				retries: 4
			},
			stack: null,
			
			run: function(app, historyTask){
				log.trace(
					'Execute task'
					, historyTask.task.name.bold
				);
				
				this.stack.push(historyTask);
				historyTask
					.task
					.exec
					.process(app, historyTask.task)
					.done(task_doneDelegate(this, historyTask))
					.fail(task_failDelegate(this, historyTask))
					;
			},
			
			hasSlot: function(){
				return this.stack.length < this.config.parallel;
			},
			
			
		});
		
		// === private
		
		function task_doneDelegate(runner, task){
			return function(){
				task_complete(runner, task);
			};
		}
		function task_failDelegate(runner, task){
			return function(error){
				task.error = error;
				task_complete(runner, task);
			};
		}
		function task_complete(runner, historyTask){
			log(
				'Task %s completed in %d ms'
				, historyTask.task.name.bold
				, new Date - historyTask.start
			);
				
			var i = runner.stack.indexOf(historyTask);
			if (i === -1) 
				log.error('No task in stack', runner.stack);
			
			runner.stack.splice(i, 1);
			runner.trigger('task:completed', historyTask, {
				tasks: runner.stack.length
			});
		}
		
	})