include
	.use('Utils')
	.done(function(resp, Utils){
		include.exports = Class.patch('Application', {
			
			Store: Class.Remote('/rest/app/?:_id')
		});
	});
