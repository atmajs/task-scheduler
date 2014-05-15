include.exports = Class.patch('Task', {
	Extends: Class.MongoStore.Single('tasks')
});
