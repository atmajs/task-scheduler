module.exports = {
	exec: 'node',
	env: 'module.js::Cli',
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