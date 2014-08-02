include
	.js('./Task.es6')
	.done(function(resp){
		include.exports = Class.Collection('Tasks', resp.Task, {
			Base: Class('Tasks'),
			Store: Class.MongoStore.Collection('tasks')
		});
	});
