include
	.js(
		'../Utils/Utils.js',
		'../Model/Model.js',
		'src/*.es6.package::Lib'
	)
	.done(function(resp){
		
		include.exports = resp.Lib.Worker;
	})