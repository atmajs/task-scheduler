include
	.use('Model', 'CliUtils')
	.done(function(resp, Model, Utils){
		
		include.exports = {
			'create': {
				meta: {
					description: 'Ensure task. Type `bold<hint -help>` for additional format information'.color,
					arguments: {
						'name': 'string',
						'trigger': 'string',
						
						'?app.name': 'string',
						'?exec.script': 'string',
						'?exec.src': 'string',
						'?exec.command': 'string',
						'?exec.cwd': 'string'
					}
				},
				process: function(params, config){
					return Utils.Api.post('/task', params);
				}
			},
			'list':  {
				meta: {
					description: 'Get tasks',
					arguments: {
						'?all': 'boolean',
						'?pending': 'boolean',
						'?history': 'boolean',
						'?skip': 'number',
						'?limit': 'number'
					}
				},
				process: function(params, config){
					return Utils.Api.get('/tasks');
				}
			}
		};
	})
