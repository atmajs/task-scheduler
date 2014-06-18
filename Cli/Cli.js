include
	.setBase(include.location)
	.routes({
		project: '../{0}/{0}.js'
	})
	.js({
		project: [
			'Utils',
			'Model',
			'Queue',
			'Api::RestApi'
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
	

