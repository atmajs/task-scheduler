include
	.js(
		'../Utils/Utils.js',
		'../Model/Model.js',
		'src/logger.js::Logger',
		'src/*.es6.package::Queue'
	)
	.done(function(resp){
		
		include.exports = resp.Queue;
	})