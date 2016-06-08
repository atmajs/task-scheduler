
include
	.use('Model.Application')
	.done(initialize);

function initialize(resp, App){
	var HttpService = atma.server.HttpService;
	
	include.exports = HttpService({
		
		'$post /': {
			meta: {
				description: 'Create new application',
				arguments: {
					'name': 'string',
					'base': 'string',
				},
				response: {
					_id: 'string: App id'
				}
			},
			process:  [
				HttpService.classParser('app', App),
				function (req, res, params, next) {
					// check if not exists
					App
						.fetch({
							name: req.app.name
						})
						.done(() => this.reject('Already exists'))
						.fail(() => next())
						;
				},
				function (req, res, params, next) {
					io
						.Directory
						.existsAsync(req.app.base)
						.done(exists => {
							logger.log('>>', exists);
							if (exists === false) {
								this.reject('Base path not exists');
								return;
							}
							next();
						})
						.fail(err => this.reject(err));
				},
				function(req, res){
					logger.log('save'.bold);
					// save
					req.app.save().pipe(this);
				}
			]
		},
		'$delete /:id': {
			meta: {
				description: 'Delete new application',
			},
			process:  function (req, res, params) {
				new App({_id: params.id }).del().pipe(this);
			}
		}
	});
}