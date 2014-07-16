include.exports = Class.patch('HistoryTask', {
	Extends: Class.Remote('/rest/task-history/:_id')
});
