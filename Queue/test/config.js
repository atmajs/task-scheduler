module.exports = {
	
	exec: 'node',
	
	env: [
		'test/before.es6::Date',
		'/index.js::Queue',
		'../Model/index.js::Model'
	],
	
	
	tests: 'test/**.test'
}