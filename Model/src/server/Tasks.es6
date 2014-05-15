include.exports = Class.patch('Tasks', {
	Extends: Class.MongoStore.Collection('tasks')
});
