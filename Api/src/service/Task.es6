
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
					'task': {
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
				var task = req.body.task,
					app = req.body.app;
				
				if (app) {
					Model
						.Application
						.fetch({
							name: req
						})
						.done(ensureTask)
						.fail(ensureTask.bind(null, null))
				}
				
				function ensureTask(app) {
					if (app) {
						task.app = Object.map(app, '_id', 'name', 'base')
					}
					TaskFactory
						.ensureTask(task)
						.pipe(this)
						;
				}
				
			}
			
		}
		
		
	});
	
}
	