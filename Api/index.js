if (typeof atma === 'undefined') 
	require('atma-server');


var resume = include.pause();
atma
	.server
	.Application({
		base: include.location
	})
	.done(function(app){
		
		app.responders([
			app.responder()
		]);
		
		resume(app);
	});
