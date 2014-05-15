include
	.js(
		'../Utils/index.js::Utils',
		'../Model/index.js::Model',
		'src/*.es6.package::Worker'
	)
	.done(function(resp){
		
		include.exports = resp.Worker;
	})