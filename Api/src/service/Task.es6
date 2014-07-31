
include
	.use('Model', 'Queue.TaskFactory', 'Utils')
	.done(initialize);

function initialize(resp, Model, TaskFactory, Utils){
	
	var HttpService = atma.server.HttpService;
	
	include.exports = HttpService({
		
		'$post /': {
			meta: {
				description: 'Create new task',
				arguments: {
					
					'?app': {
						'name': 'string'
					},
					'name': 'string',
					'trigger': 'string',
					'exec': {
						'?script': 'string',
						'?src': {
							'path': 'string',
							'?cwd': 'string'
						}
					}
				},
				response: {
					tid: 'string: Task id',
					date: 'Date: Next trigger date'
				}
			},
			process:  function(req, res){
				var task = req.body;
				
				if (task.app && task.app.name) {
					Model
						.Application
						.fetch({
							name: task.app.name
						})
						.done(app => ensureTask(this, app))
						.fail(() => ensureTask(this))
				} else {
					
					ensureTask(this);
				}
				
				function ensureTask(service, app) {
					if (app) {
						task.app = Object.map(app, '_id', 'name', 'base')
					}
					
					TaskFactory
						.ensureTask(task)
						.pipe(service)
						;
				}
			}
		}
		
		
	});
	
}
	