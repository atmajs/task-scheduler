include
	.setBase(include.location)
	.routes({
		project: '../{0}/index.js'
	})
	.js('src/application.js')
	.js({
		project: [
			'Utils::Utils',
			'Model::Model',
			'Queue::Queue',
			'Api::Api'
		],
		src: [
			'src/utils/*.es6.package::CliUtils',
			'src/*.es6.package::Lib'
		]
	})
	.done(function(resp){
		var args = process.argv.slice(2),
			command = args.shift()
			;
		logger.cfg({
			color: 'ascii',
			logCaller: false
		});
		include.exports = resp.Lib.cli;
	});
	

