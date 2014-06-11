module.exports = {
	exec: "node",
	tests: "test/*.test",
	
	$config: {
		$before: function(done){
			logger.cfg('logCaller', true);
			include
				.js('module.js::Cli')
				.done(function(resp){
					global.Cli = resp.Cli
					
					logger.log(app.config.port, app.config.mongo);
					Class
						.MongoStore
						.settings(app.config.mongo)
					Class
						.MongoStore
						.resolveDb()
						.done(function(db){
							db.dropDatabase(function(){
								
								Class
									.MongoStore
									.ensureIndexesAll()
									.always(done);
							});
						})
				});
		}
	}
	
}