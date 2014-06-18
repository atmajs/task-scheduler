require('../package')
	.done(function(rootConfig){
		include
			.instance('file://' + __filename)
			.js('Worker.js')
			.done(function(resp){
				
				resp.Worker.connect(rootConfig);
			});
	});
