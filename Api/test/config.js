module.exports = {
	exec: "node",
	tests: "test/*.test",
	
	$config: {
		$before: function(done){
			
			
			include
				.js('index.js::App')
				.done(function(resp){
					global.ApiServ = require('http').createServer(function(req, res){
						resp.App.process(req, res);
					});
					
					Class
						.MongoStore
						.resolveDb()
						.done(function(db){
							db.dropDatabase();
						})
						.always(done);
				});
		}
	}
	
}