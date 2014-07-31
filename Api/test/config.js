module.exports = {
	exec: "node",
	tests: "test/*.test",
	
	$config: {
		$before: function(done){
			
			include
				.js('/../App/index.js::App')
				.done(function(resp){
					//global.ApiServ = require('http').createServer(resp.App.process);
					
					resp.App.done(function(){
						global.app.done(function(){
								
							global.ApiServ = global.app._server;
							Class
								.MongoStore
								.resolveDb()
								.done(function(db){
									db.dropDatabase();
								})
								.always(done);
							
						});
					});
				});
		}
	}
	
}