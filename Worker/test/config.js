module.exports = {
	
	
	exec: 'node',
	
	env: [
		'/Worker.js::Worker',
		'../Model/Model.js::Model'
	],
	
	$config: {
		$before: 'test/before.es6'
	},
	
	tests: 'test/**.test'
}