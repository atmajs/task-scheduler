include
	.js('./Task.es6')
	.done(function(resp){
		include.exports = Class.Collection('Tasks', resp.Task, {
			Base: Class('Tasks'),
			Extends: Class.Remote('/rest/tasks')
		});
	});
