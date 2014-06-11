
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
					'app': {
						'config': {
							'base': 'string'
						},
						'?name': 'string'
					},
					'task': {
						'name': 'string',
						'trigger': null,
						'exec': {
							'?script': 'string',
							'?src': 'string'
						}
					}
				},
				response: {
					tid: 'string: Task id',
					date: 'Date: Next trigger date'
				}
			},
			process:  function(req, res){
				var task = new Model.Task(req.body.task);
				
				TaskFactory
					.ensureTask(req.body.task)
					.pipe(this)
					;
			}
			
		}
		
		
	});
	
}
	