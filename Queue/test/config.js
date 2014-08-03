module.exports = {
	
	exec: 'node',
	
	env: [
		'/Queue.js',
		'../Model/Model.js'
	],
	
	$config: {
		$before: 'test/before.es6'
	},
	
	tests: 'test/**.test'
}