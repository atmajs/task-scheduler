include
	.use('Queue.Server')
	.done(function(resp, Server){
	
		var HttpService = atma.server.HttpService;
		include.exports = HttpService({
			
			'$get /': {
				meta: {
					description: 'Get workers list',
					response: {
						
					}
				},
				process:  function(req, res){
					Server
						.Instance()
						.getWorkersStatus()
						.pipe(this)
						;
				}
			}
		});
		
	});
