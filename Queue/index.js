include
	.js(
		'../Utils/index.js::Utils',
		'../Model/index.js::Model',
		'src/*.es6.package::Queue'
	)
	.done(function(resp){
		
		include.exports = resp.Queue;
	})