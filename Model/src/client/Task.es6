include.exports = Class.patch('Task', {
	Extends: Class.Remote('/rest/task/:_id')
});
