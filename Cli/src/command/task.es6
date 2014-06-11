include
	.use('Model')
	.done(function(resp, Model){
		
		include.exports = {
			'create': {
				meta: {
					description: 'Ensure task. Type `bold<hint -help>` for additional format information'.color,
					arguments: {
						'name': 'String',
						'trigger': 'String',
						
						'?app.name': 'String',
						'?exec.script': 'String',
						'?exec.src': 'String',
						'?exec.command': 'String',
						'?exec.cwd': 'String'
					}
				},
				process: function(params, config){
					return new Model
						.Application({
							name: params.name,
							password: params.password
						})
						.save();
				}
			}
		};
	})
