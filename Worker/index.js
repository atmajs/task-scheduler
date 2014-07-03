require('../root-app')
	.done(function(app){
		include
			.instance('file://' + __filename)
			.js('Worker.js')
			.done(function(resp){
				
				resp
					.Worker
					.connect(app.config)
					.fail(function(error, msg){
						process.send && process.send(msg);
					})
					.done(function(){
						process.send && process.send('ok');
					});
			});
	});
