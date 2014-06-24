module.exports = {
	process: function(done){
		logger.cfg({
			levels: {
				'Worker': 0
			}
		});
		
		Class.MongoStore.settings({
			db: 'test-task-scheduler-queue'
		});
		
		
		Class
			.MongoStore
			.resolveDb()
			.done( db => db.dropDatabase(done) );
	}
};

