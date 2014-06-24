module.exports = {
	exec: 'node',
	env: [
		'../root-app.js',
		'Cli.js::Cli',
	],
	tests: 'test/*.test',
	
	$config: {
		$before: function(done){
			
			var Mongo = Class.MongoStore;
			Mongo
				.settings(app.config.mongo);
			Mongo
				.profiler
				.toggle(true);
			Mongo
				.resolveDb()
				.done(function(db){
					db.dropDatabase(function(){
						
						Mongo
							.ensureIndexesAll()
							.always(done);
					});
				})			
		}
	}
	
}