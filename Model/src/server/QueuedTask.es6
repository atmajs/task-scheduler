include.exports = Class.patch('QueuedTask', {
	Extends: Class.MongoStore.Single('task-queue')
});
