include 
	.load('dialog.mask::Template') 
	.done(function(resp){

		mask.registerHandler(':dialog', Compo({
			template: resp.load.Template,
			onRenderStart (model, ctx, container) {
				
			},
			onRenderEnd (elements, model, ctx, container) {
				
			},
			
			showDialog () {
				this.$.modal('show')
			},
			hideDialog () {
				this.$.modal('hide')
			}
		}));
	});
