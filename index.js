
if (typeof include === 'undefined' ) 
	throw new Error('<atma-scheduler> should be loaded by the `atma` package.');


var uri = new net.Uri(include.url);

include.exports = {
	register: function(config){
		
		config.$extend({
			actions: {
				scheduler: getPath('/scheduler.js')
			},
			server: {
				subapps: {
					'scheduler': getPath('http/browser.js')
				},
				//websockets: {
				//	'/scheduler-node' : getPath('/utest.server.js'),
				//	'/scheduler-browser' : function(){}
				//}
			}
		});
	}
};

function getPath(path) {
	return uri
		.combine('lib/')
		.combine(path)
		.toString()
		;
}