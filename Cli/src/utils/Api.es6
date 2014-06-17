include
	.js('./socket.es6')
	.use('RestApi')
	.done(function(resp, Api){
		
		include.exports = {
			get: function(url){
				return httpRun(url, 'get');
			},
			post: function(url, body){
				return httpRun(url, 'post', body)
			}
		}
		
		function httpRun(url, method, body = null, headers = {}) {
			return resp
				.socket
				.ensurePort(app.config.port)
				.pipe(
					() => fallback(url, method, body, headers),
					() => send(url, method, body, headers)
				)
		}
		function send(url, method, body, headers) {
			url = `http://127.0.0.1:${app.config.port}/rest${url}`;
			var dfr = new Class.Deferred;
			require('request')({
				url: url,
				method: method,
				json: body,
				headers: headers
			}, function(error, res, body){
				if (error) 
					return dfr.reject(error);
				
				dfr.resolve(body);
			});
			return dfr;
		}
		function fallback(url, method, body, headers) {
			return Api
				.execute(url, method, body, headers)
				.done( () => method !== 'get' && logger.log('Saved to database'.green.bold) )
		}
	})