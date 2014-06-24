require('../root-app')
	.done(function(){
		
		include
			.instance('file://' + __filename)
			.js('Cli.js')
			.done(function(resp){
				var args = process.argv.slice(2),
					command = args.shift();
					
				resp.Cli.execute(command, args);
			});
	})
