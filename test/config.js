module.exports = {
	suites: {
		'project-utils': {
			cwd: 'Utils/',
			fork: 'test/config.js'
		},
		
		'project-queue': {
			cwd: 'Queue/',
			fork: 'test/config.js'
		},
		
		'project-worker': {
			cwd: 'Worker/',
			fork: 'test/config.js'
		},
		
		'project-cli': {
			cwd: 'Cli/',
			fork: 'test/config.js'
		},
		
	}
};