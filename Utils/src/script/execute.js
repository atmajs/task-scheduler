
include.exports = function(config, src, callback){
	config = config || {};
	
	var uri = new net.Uri(src),
		base = (config.base || process.cwd()) + '/'
		;
	if (uri.isRelative()) 
		uri = (new net.Uri(base)).combine(src);
	
	var path = uri.toString();
	include
		.instance(uri.toDir())
		.setBase(uri.toDir())
		.js(path + '::Handler')
		.done(function(resp){
			
			if (resp.Handler == null) 
				return callback(Error('Load: ' + path));
			
			if (resp.Handler.process == null) 
				return callback(TypeError('Handler should expose `process` function'));
			
			
			resp.Handler.process(config, callback);
		});
};
