include 
	.load('infoPane.mask::Template') 
	.css('infoPane.less')
	.done(function(resp){

		mask.registerHandler(':infoPane', Compo({
			slots: {
				toggle () {
					this.$.toggleClass('__collapsed')
				}
			},
			onRenderStart () {
				this.nodes = mask.merge(resp.load.Template, this.nodes);
			}
		}));
	});
