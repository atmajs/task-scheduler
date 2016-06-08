
include
	.use('Model.Applications')
	.done(initialize);

function initialize(resp, Apps){
	var HttpService = atma.server.HttpService;
	
	include.exports = HttpService({
		
		'$get /': {
			meta: {
				description: 'Get all applications'
			},
			process:  function(){
				Apps.fetch().pipe(this);
			}
			
		}
	});
}