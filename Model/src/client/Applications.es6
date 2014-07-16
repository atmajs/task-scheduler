include
	.js('./Application.es6')
	.done(resp => {
		
		include.exports = Class.Collection('Applications', resp.Application, {
			Store: Class.Remote('/rest/apps')
		});
	})