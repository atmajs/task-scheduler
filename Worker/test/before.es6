module.exports = {
	process: function(done){
		Class.MongoStore.settings({
			db: 'test-task-scheduler-queue'
		});
		
		
		Class
			.MongoStore
			.resolveDb()
			.done( db => db.dropDatabase(done) );
	}
};

