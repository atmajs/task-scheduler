module.exports = {
	
	exec: 'node',
	
	env: [
		'/index.js::Worker',
		'../Model/index.js::Model'
	],
	
	
	tests: 'test/**.test'
}