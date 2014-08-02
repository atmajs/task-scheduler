include
	.use('Model', 'Server', 'TaskFactory', 'TaskQueue')
	.done((resp, Model, Server, TaskFactory, TaskQueue) => {
		include.exports = Model.ModelRod.register('ServerStat', {
			
			workers: null,
			queue: null,
			active: null,
			
			tasks: null,
			history: null,
			
			propertyChangeNotifiers: {
				workers: function(change){
					this.addEventListener(
						Server
						, 'workerCountChanged'
						, change
					);
				}
			},
			
			Construct: function(){
				this.defer();
				this.workers = Server.workerCount;
				this.queue = TaskFactory.watchingCount;
				this.active = TaskQueue.length;
				
				var fetch, dfrs;
				
				fetch = (name, Ctor) => {
					return Ctor
						.count()
						.done(count => this[name] = count)
						.fail(error => logger.error('Fetch `count` failed', name, error))
						;
				};
				dfrs = [
						['tasks', Model.Tasks],
						['history', Model.HistoryTasks]
					]
					.map(x => fetch(...x))
					;
			
				new Class
					.Await(...dfrs)
					.always(() => this.resolve(this))
					;
			}
		})
	})
