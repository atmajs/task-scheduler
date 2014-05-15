
include
	.use('Model', 'Utils')
	.done(initialize);

function initialize(resp, Model, Utils){
	
	var Tasks = Model.Tasks,
		HttpService = atma.server.HttpService
		;
	
	include.exports = HttpService({
		
		'$get /': {
			meta: {
				description: 'Get/Find tasks',
				arguments: {
					'?limit': 'number',
					'?skip': 'number',
					'?search': 'regex_string',
					'?filter': 'pending|active'
				},
				response: []
			},
			process: [
				function(req, res, params){
					
					this.resolve('Not implemented')
				}
			]
		}
	});
}