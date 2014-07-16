include.exports = Class.patch('QueuedTask', {
	Extends: Class.Remote('/rest/task-queue/:_id')
});
