include.exports = Class.patch('Task', {
	Store: Class.Remote('/rest/task/:_id')
});
