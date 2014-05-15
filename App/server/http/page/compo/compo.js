include
	.load('compo.mask')
	.done(function(resp){
		
		include.exports = atma.server.HttpPage({
			
			onRenderStart: function(model, ctx){
				
				this.nodes = jmask(resp.load.compo)
					.find('#body')
					.mask(this.data.compoName)
					.end()
					;
			}
		});
		
	});