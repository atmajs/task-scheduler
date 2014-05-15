var resume = include.pause();

Class.MongoStore.settings({
	db: 'test-task-scheduler-queue'
});


Class
	.MongoStore
	.resolveDb()
	.done( (db) => db.dropDatabase(resume));
