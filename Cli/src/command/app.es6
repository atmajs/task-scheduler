include
	.use('Model')
	.done(function(resp, Model){
		
		include.exports = {
			'create': {
				meta: {
					description: 'Create application. Tasks could be bound to the App (after authorozition)',
					arguments: {
						'name': 'String',
						'password': 'String'
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
			},
			'list': {
				meta: {
					description: 'List all applications'
				},
				process: function(params, config){
					
					return Model
						.Applications
						.getAll()
						.pipe(arr => 
							arr.toArray().map(app => app.name)
						);
				}
			},
			'pwchange': {
				meta: {
					description: 'Change password',
					arguments: {
						'name': 'String',
						'password': 'String'
					}
				},
				process: function(){
					throw Error('Password change not implemented');
				}
			},
			'remove': {
				meta: {
					description: 'Remove application. All related tasks are also removed',
					arguments: {
						'name': 'String'
					}
				},
				process: function(params){
					return Model
						.Application
						.fetch({ name: params.name })
						.pipe(function(app){
							return app.del();
						})
				}
			},
			'stat': {
				meta: {
					description: 'Show statistic',
					arguments: {
						'name': 'String(Application name)'
					}
				},
				process: function(){
					
				}
			},
			'clear': {
				meta: {
					description: 'Remove tasks',
					arguments: {
						'name': 'String(Application name)',
						'?all': 'Flag(Remove pending and history tasks)',
						'?history': 'Flag(Remove only completed tasks)',
					}
				},
				process: function(){
					
				}
			}
		};
	})
