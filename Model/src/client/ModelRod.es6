(function(){
	
	var ModelRod = include.exports = Class.patch('ModelRod', {
		Construct () {
			ModelRod.bind();
		},
		Static: {
			bind: Class.Deferred.memoize(function(dfr){
				var changed = (patch) => {
					console.log('ModelRod: ', patch);
					
					var model = ModelRod.get(patch._id);
					if (model == null) {
						console.error('ModelRod is not registered yet', patch._id);
						return;
					}
					switch(patch.type) {
						case 'update':
							ModelRod.setProperty(
								model, patch.property, patch.value
							);
							break;
						default:
							console.error('ModelRod of an uknown type', patch);
							break;
					}
				};
				
				resolveSocketIO()
					.fail(logger.error)
					.done(io => {
						io
							.connect('/modelrod')
							.on('change', changed)
							;
					});
			})
		}
	});
	
		
	function resolveSocketIO(){
		return Class.Deferred.run((resolve, reject) => {
			if (typeof io !== 'undefined' && io.Socket) {
				resolve(io);
				return;
			}
			include
				.instance()
				.embed('/socket.io/socket.io.js')
				.done(function(){
					if (typeof io === 'undefined' || io.Socket == null) {
						reject('SocketIO can`t be loaded');
						return;
					}
					resolve(io);
				});
		});
	}
}());