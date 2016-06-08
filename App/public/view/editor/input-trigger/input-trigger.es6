include 
	.load('input-trigger.mask::Template') 
	.js('./TriggerBinder.es6')
	.done(function(resp){

		mask.registerHandler(':input-trigger', Compo({
			template: resp.load.Template
		}));
		
	});
