module.exports = {
	process: function(config, callback){
		
		setTimeout(function(){
			global.SourceLetter = 'A';
			global.SourceConfig = config;
			
			callback();
		}, 100);
	}
}