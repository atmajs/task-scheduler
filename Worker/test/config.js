module.exports = {
	
	
	exec: 'node',
	
	env: [
		'/index.js::Worker',
		'../Model/index.js::Model'
	],
	
	$config: {
		$before: 'test/before.es6'
	},
	
	tests: 'test/**.test'
}