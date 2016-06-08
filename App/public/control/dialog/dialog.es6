include 
	.load('dialog.mask::Template') 
	.done(function(resp){

		mask.registerHandler(':dialog', Compo({
			meta: {
				mode: 'client'
			},
			template: resp.load.Template,
			
			show() {
				this.$.modal('show');
			},
			hide() {
				this.$.modal('hide');
			}
		}));
	});
