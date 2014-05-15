include.exports = Class.patch('HistoryTask', {
	Extends: Class.MongoStore.Single('task-history')
});
