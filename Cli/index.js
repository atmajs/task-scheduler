if (typeof include === 'undefined') {
	require('atma-libs/globals-dev');
	require('atma-logger/lib/global-dev');
	require('atma-io');
	require('atma-loader-traceur');
	require('atma-loader-package');
	//-include = include.instance(new net.Uri('file://' + __filename).toString());
}

include
	.js('./module.js')
	.done(function(resp){
		var args = process.argv.slice(2),
			command = args.shift();
			
		resp.module.execute(command, args);
	});