include
	.embed(
		'../Utils/Utils.js',
		'../Model/Model.js'
	)
	.js(
		'src/logger.js::Logger',
		'src/*.es6.package::Lib'
	)
	.done(function(resp){
		
		include.exports = resp.Lib.Worker;
	})