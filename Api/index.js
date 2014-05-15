var resume = include.pause(),
	resource = include;
	
atma
	.server
	.Application({
		base: '/Api/'
	})
	.done(function(app){

		app.responders([
			app.responder()
		]);
		
		
		resource.exports = app;
		process.nextTick(resume);
	})
